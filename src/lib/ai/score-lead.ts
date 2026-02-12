import Anthropic from '@anthropic-ai/sdk'
import { LeadScoreSchema, type ScoreLeadInput, type ScoreLeadResult } from './types'
import { buildSystemPrompt, buildUserPrompt } from './prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const LEAD_SCORING_TOOL = {
  name: 'score_lead' as const,
  description: 'Score and analyze an inbound lead message',
  input_schema: {
    type: 'object' as const,
    properties: {
      intent_score: {
        type: 'number' as const,
        description:
          'Lead intent score from 0.0 (spam/irrelevant) to 1.0 (ready to buy). Be conservative: when unsure, score lower.',
      },
      intent_label: {
        type: 'string' as const,
        enum: ['high', 'medium', 'low'],
        description:
          'high: 0.7+, clear buying intent. medium: 0.4-0.69, possible interest. low: below 0.4, unlikely lead.',
      },
      summary_bullets: {
        type: 'array' as const,
        items: { type: 'string' as const },
        description:
          'Two to three short bullet points summarizing the lead. Each under 15 words. Focus on: what they want, their timeline, their budget signals.',
      },
      suggested_reply: {
        type: 'string' as const,
        description:
          'A warm, human reply the freelancer can send. Match the specified tone. Never be salesy. Keep under 100 words.',
      },
    },
    required: ['intent_score', 'intent_label', 'summary_bullets', 'suggested_reply'],
  },
}

export async function scoreLead(input: ScoreLeadInput): Promise<ScoreLeadResult> {
  const startTime = Date.now()
  const model = 'claude-sonnet-4-20250514'

  const response = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    system: buildSystemPrompt(input.profile),
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(input),
      },
    ],
    tools: [LEAD_SCORING_TOOL],
    tool_choice: { type: 'tool', name: 'score_lead' },
  })

  const latencyMs = Date.now() - startTime

  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  )

  if (!toolUseBlock) {
    throw new Error('AI did not return a tool_use block')
  }

  // Validate with Zod
  const score = LeadScoreSchema.parse(toolUseBlock.input)

  // Post-processing: enforce label-score consistency
  if (score.intent_score >= 0.70 && score.intent_label !== 'high') {
    score.intent_label = 'high'
  } else if (score.intent_score >= 0.40 && score.intent_score < 0.70 && score.intent_label !== 'medium') {
    score.intent_label = 'medium'
  } else if (score.intent_score < 0.40 && score.intent_label !== 'low') {
    score.intent_label = 'low'
  }

  return {
    score,
    usage: {
      promptTokens: response.usage.input_tokens,
      completionTokens: response.usage.output_tokens,
    },
    latencyMs,
    model,
  }
}
