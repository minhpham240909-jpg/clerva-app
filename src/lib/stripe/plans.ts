export const PLANS = {
  PRO: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    name: 'Adecis Pro',
    price: 19,
    interval: 'month' as const,
    leadLimit: 500,
    replyLimit: 999999,
    trialDays: 7,
  },
  FREE_TRIAL: {
    name: 'Free Trial',
    leadLimit: 25,
    replyLimit: 5,
    trialDays: 7,
  },
} as const
