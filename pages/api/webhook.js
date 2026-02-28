import { buffer } from 'micro'
import { getServiceSupabase } from '../../lib/supabase'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  const supabase = getServiceSupabase()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const user_id = session.metadata?.user_id
      if (user_id) {
        await supabase.from('profiles').update({
          plan: 'pro',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          subscription_status: 'active',
        }).eq('id', user_id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      await supabase.from('profiles').update({
        plan: 'free',
        subscription_status: 'inactive',
      }).eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object
      const active = sub.status === 'active'
      await supabase.from('profiles').update({
        plan: active ? 'pro' : 'free',
        subscription_status: active ? 'active' : 'inactive',
      }).eq('stripe_subscription_id', sub.id)
      break
    }

    default:
      break
  }

  return res.status(200).json({ received: true })
}
