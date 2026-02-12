export interface ParsedEmail {
  to: string
  from: string
  senderName: string
  subject: string
  textBody: string
  spamScore: number
}

export function parseInboundEmail(formData: FormData): ParsedEmail {
  const to = (formData.get('to') as string) || ''
  const from = (formData.get('from') as string) || ''
  const subject = (formData.get('subject') as string) || ''
  const textBody = (formData.get('text') as string) || ''
  const spamScore = parseFloat((formData.get('spam_score') as string) || '0')

  // Extract sender name from "Name <email>" format
  const nameMatch = from.match(/^(.+?)\s*</)
  const senderName = nameMatch ? nameMatch[1].trim().replace(/"/g, '') : from.split('@')[0]

  // Extract the actual "to" email address
  const toMatch = to.match(/<(.+?)>/) || [null, to]
  const toAddress = (toMatch[1] || to).trim().toLowerCase()

  return {
    to: toAddress,
    from,
    senderName,
    subject,
    textBody,
    spamScore,
  }
}
