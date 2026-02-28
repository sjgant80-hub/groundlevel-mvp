const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { user_id, email } = req.body

  if (!user_id) return res.status(400).json({ error: 'user_id required' })

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
      customer_email: email,
      metadata: { user_id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app`,
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return res.status(500).json({ error: 'Failed to create checkout session' })
  }
}
