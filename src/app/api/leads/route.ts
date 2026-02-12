import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source') // 'slack' | 'email' | null
  const label = searchParams.get('label') // 'high' | 'medium' | 'low' | null
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  let query = supabase
    .from('leads')
    .select('id, sender_name, source, intent_score, intent_label, summary_bullets, suggested_reply, raw_message, feedback, reply_sent, reply_sent_at, slack_thread_ts, slack_channel_id, created_at', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (source) {
    query = query.eq('source', source)
  }
  if (label) {
    query = query.eq('intent_label', label)
  }

  // Run leads query and connection status checks in parallel (no N+1)
  const [leadsResult, slackResult, emailResult] = await Promise.all([
    query,
    supabase
      .from('slack_installations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('email_addresses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true),
  ])

  const { data: leads, count, error } = leadsResult

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    leads: leads || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
    connections: {
      slack: (slackResult.count ?? 0) > 0,
      email: (emailResult.count ?? 0) > 0,
    },
  })
}
