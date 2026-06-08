import type { Handler } from '@netlify/functions'
import Stripe from 'stripe'

const ALLOWED_ORIGINS = ['https://cbmfisioterapia.com', 'http://localhost:4200']

interface RequestBody {
  tratamiento?: string
  email?: string
  nombre?: string
}

const handler: Handler = async (event) => {
  const origin = event.headers['origin'] ?? ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY']
  if (!STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Configuración incompleta' }),
    }
  }

  try {
    const body = JSON.parse(event.body ?? '{}') as RequestBody
    const stripe = new Stripe(STRIPE_SECRET_KEY)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
      description: `Señal de reserva — ${body.tratamiento ?? 'CBM Fisioterapia'}`,
      metadata: {
        tratamiento: body.tratamiento ?? '',
        email: body.email ?? '',
        nombre: body.nombre ?? '',
      },
    })

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    }
  } catch {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Error al procesar el pago' }),
    }
  }
}

export { handler }
