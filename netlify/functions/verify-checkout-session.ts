import type { Handler } from '@netlify/functions'
import Stripe from 'stripe'

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  try {
    const { sessionId } = JSON.parse(event.body || '{}')

    const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
      apiVersion: '2023-10-16'
    })

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const pagado = session.status === 'complete' && session.payment_status === 'paid'

    return {
      statusCode: 200,
      body: JSON.stringify({
        pagado,
        metadata: session.metadata,
        paymentIntent: session.payment_intent,
        amount: session.amount_total
      })
    }
  } catch (err) {
    console.error('Stripe verify error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) })
    }
  }
}

export { handler }
