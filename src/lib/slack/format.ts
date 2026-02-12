import type { LeadScore } from '@/lib/ai/types'
import type { KnownBlock } from '@slack/web-api'

export function formatLeadResponse(
  score: LeadScore,
  senderName: string,
  leadId: string,
  source: 'slack' | 'email' = 'slack'
): KnownBlock[] {
  const emoji =
    score.intent_label === 'high'
      ? ':fire:'
      : score.intent_label === 'medium'
        ? ':eyes:'
        : ':snowflake:'

  const labelText = score.intent_label.toUpperCase()
  const scorePercent = Math.round(score.intent_score * 100)

  const sourceLabel = source === 'email' ? ' (via email)' : ''

  const blocks: KnownBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${emoji} *Lead from ${senderName}${sourceLabel}* — Score: ${scorePercent}/100 (${labelText})`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: score.summary_bullets.map((b) => `• ${b}`).join('\n'),
      },
    },
    { type: 'divider' },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Suggested reply:*\n>${score.suggested_reply.split('\n').join('\n>')}`,
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: ':thumbsup: Helpful', emoji: true },
          action_id: 'feedback_positive',
          value: leadId,
          style: 'primary',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: ':thumbsdown: Not helpful', emoji: true },
          action_id: 'feedback_negative',
          value: leadId,
        },
      ],
    },
  ]

  return blocks
}

export function formatFeedbackAck(isPositive: boolean): KnownBlock[] {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: isPositive
          ? ':white_check_mark: Thanks for the feedback!'
          : ':pencil2: Got it — we\'ll improve. Thanks for the feedback!',
      },
    },
  ]
}
