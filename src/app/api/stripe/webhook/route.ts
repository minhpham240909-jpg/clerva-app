import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLANS } from '@/lib/stripe/plans'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing signature', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      if (userId) {
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: session.customer as string,
            subscription_id: session.subscription as string,
            subscription_status: 'active',
            plan_lead_limit: PLANS.PRO.leadLimit,
          })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await supabase
        .from('profiles')
        .update({
          subscription_status: subscription.status,
        })
        .eq('subscription_id', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'canceled',
          plan_lead_limit: PLANS.FREE_TRIAL.leadLimit,
        })
        .eq('subscription_id', subscription.id)
      break
    }

    case 'invoice.payment_failed': {
      const failedInvoice = event.data.object as unknown as Record<string, unknown>
      const failedSubId = failedInvoice.subscription as string | undefined
      if (failedSubId) {
        await supabase
          .from('profiles')
          .update({ subscription_status: 'past_due' })
          .eq('subscription_id', failedSubId)
      }
      break
    }

    case 'invoice.payment_succeeded': {
      const succeededInvoice = event.data.object as unknown as Record<string, unknown>
      const succeededSubId = succeededInvoice.subscription as string | undefined
      if (succeededSubId) {
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            leads_used_this_month: 0,
            replies_sent_this_month: 0,
          })
          .eq('subscription_id', succeededSubId)
      }
      break
    }
  }

  return new Response('OK', { status: 200 })
}
