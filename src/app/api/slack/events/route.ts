import { verifySlackSignature } from '@/lib/slack/verify'
import { createSlackClient } from '@/lib/slack/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { scoreLead } from '@/lib/ai/score-lead'
import { formatLeadResponse } from '@/lib/slack/format'
import { canProcessLead } from '@/lib/stripe/helpers'
import { isDuplicate, slackEventRateLimit, safeRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const rawBody = await request.text()

  // Verify Slack signature
  if (!verifySlackSignature(request.headers, rawBody)) {
    return new Response('Invalid signature', { status: 401 })
  }

  const payload = JSON.parse(rawBody)

  // Handle URL verification challenge
  if (payload.type === 'url_verification') {
    return Response.json({ challenge: payload.challenge })
  }

  // Handle event callbacks
  if (payload.type === 'event_callback' && payload.event?.type === 'message') {
    const event = payload.event
    const teamId = payload.team_id
    const eventId = payload.event_id

    // Ignore bot messages, message edits/deletes, and empty messages
    if (event.bot_id || event.subtype || !event.text?.trim()) {
      return new Response('OK', { status: 200 })
    }

    // Deduplication (Slack retries on slow responses)
    if (await isDuplicate(eventId)) {
      return new Response('OK', { status: 200 })
    }

    // Acknowledge immediately — process in background
    const response = new Response('OK', { status: 200 })

    processSlackLead(event, teamId).catch((err) => {
      console.error('Failed to process Slack lead:', err)
    })

    return response
  }

  return new Response('OK', { status: 200 })
}

async function processSlackLead(
  event: {
    channel: string
    user: string
    text: string
    ts: string
    thread_ts?: string
  },
  teamId: string
) {
  const supabase = createAdminClient()

  // Look up the installation for this team
  const { data: installation } = await supabase
    .from('slack_installations')
    .select('*, profiles!inner(id, niche, tone, booking_link, business_name, custom_instructions)')
    .eq('team_id', teamId)
    .single()

  if (!installation) return

  const userId = installation.user_id
  const profile = (installation as Record<string, unknown>).profiles as {
    id: string
    niche: string
    tone: string
    booking_link: string | null
    business_name: string | null
    custom_instructions: string | null
  } | null

  if (!profile) return

  // Single Slack client — reused for all API calls
  const slack = createSlackClient(installation.bot_token)

  // Check if channel is monitored (empty array = monitor all)
  const monitoredChannels = installation.monitored_channels || []
  if (monitoredChannels.length > 0 && !monitoredChannels.includes(event.channel)) {
    return
  }

  // Rate limit check (safe — allows through if Redis is down)
  const { success: rateLimitOk } = await safeRateLimit(slackEventRateLimit, teamId)
  if (!rateLimitOk) return

  // Subscription/usage check
  const { allowed, reason, warning } = await canProcessLead(userId)
  if (!allowed) {
    await slack.chat.postMessage({
      channel: event.channel,
      thread_ts: event.ts,
      text: reason || 'Unable to process this lead right now.',
    })
    return
  }

  // Get sender name from Slack
  let senderName = 'Someone'
  try {
    const userInfo = await slack.users.info({ user: event.user })
    senderName = userInfo.user?.real_name || userInfo.user?.name || 'Someone'
  } catch {
    // Use default
  }

  // Fetch thread context if this is a reply
  let threadContext: string | undefined
  if (event.thread_ts) {
    try {
      const replies = await slack.conversations.replies({
        channel: event.channel,
        ts: event.thread_ts,
        limit: 5,
      })
      if (replies.messages && replies.messages.length > 1) {
        threadContext = replies.messages
          .slice(0, -1)
          .map((m) => m.text || '')
          .join('\n---\n')
      }
    } catch {
      // No thread context
    }
  }

  // Score the lead — wrapped in try-catch so AI failures don't crash the processor
  let result
  try {
    result = await scoreLead({
      message: event.text,
      threadContext,
      source: 'slack',
      senderName,
      profile: {
        niche: profile.niche || 'other',
        tone: profile.tone || 'professional',
        bookingLink: profile.booking_link || undefined,
        businessName: profile.business_name || undefined,
        customInstructions: profile.custom_instructions || undefined,
      },
    })
  } catch (err) {
    console.error('AI scoring failed for Slack lead:', err)
    try {
      await slack.chat.postMessage({
        channel: event.channel,
        thread_ts: event.ts,
        text: 'Sorry, I couldn\'t analyze this message right now. Please try again later.',
      })
    } catch { /* best effort */ }
    return
  }

  // Store lead in database
  const { data: lead, error: insertError } = await supabase
    .from('leads')
    .insert({
      user_id: userId,
      source: 'slack',
      source_id: event.ts,
      source_channel: event.channel,
      sender_name: senderName,
      sender_identifier: event.user,
      raw_message: event.text,
      thread_context: threadContext || null,
      intent_score: result.score.intent_score,
      intent_label: result.score.intent_label,
      summary_bullets: result.score.summary_bullets,
      suggested_reply: result.score.suggested_reply,
      model_used: result.model,
      prompt_tokens: result.usage.promptTokens,
      completion_tokens: result.usage.completionTokens,
      ai_latency_ms: result.latencyMs,
      slack_thread_ts: event.ts,
      slack_channel_id: event.channel,
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('Failed to insert lead:', insertError)
    return
  }

  // Increment usage counter
  await supabase.rpc('increment_leads_used', { p_user_id: userId })

  // Post AI result as threaded reply in Slack
  if (lead) {
    try {
      const blocks = formatLeadResponse(result.score, senderName, lead.id)

      await slack.chat.postMessage({
        channel: event.channel,
        thread_ts: event.ts,
        text: `Lead from ${senderName} — ${result.score.intent_label.toUpperCase()} intent`,
        blocks: warning
          ? [...blocks, { type: 'context', elements: [{ type: 'mrkdwn', text: `_${warning}_` }] }]
          : blocks,
      })
    } catch (err) {
      console.error('Failed to post lead result to Slack:', err)
    }
  }
}
