import type { Handler } from '@netlify/functions'
import Stripe from 'stripe'

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  try {
    const { cantidad, tratamiento, email, nombre, telefono } =
      JSON.parse(event.body || '{}')

    const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
      apiVersion: '2023-10-16'
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Seña de reserva — CBM Fisioterapia',
              description: `Tratamiento: ${tratamiento}`
            },
            unit_amount: Math.round(cantidad * 100)
          },
          quantity: 1
        }
      ],
      success_url:
        'https://cbmfisioterapia.com/solicitar-cita?pago=exitoso&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://cbmfisioterapia.com/solicitar-cita?pago=cancelado',
      metadata: { tratamiento, nombre, telefono, email }
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url, sessionId: session.id })
    }
  } catch (err) {
    console.error('Stripe error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) })
    }
  }
}

export { handler }
