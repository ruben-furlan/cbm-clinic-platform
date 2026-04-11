import type { Handler } from '@netlify/functions'

function buildHtml(mensaje: string, email: string): string {
  const unsubUrl = `https://cbmfisioterapia.com/baja-newsletter?email=${encodeURIComponent(email)}`

  return `
    <div style="font-family: sans-serif; max-width: 600px;
    margin: 0 auto; padding: 32px;">

      <div style="background: linear-gradient(135deg, #f472b6, #a855f7);
      padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
        <img
          src="https://cbmfisioterapia.com/favicon-192x192.png"
          alt="CBM Fisioterapia"
          width="56" height="56"
          style="border-radius: 12px; margin-bottom: 12px;
          display: block; margin-left: auto; margin-right: auto;"
        />
        <p style="color: rgba(255,255,255,0.9); margin: 0;
        font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">
          CBM Fisioterapia
        </p>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb;
      border-top: none; border-radius: 0 0 16px 16px; padding: 32px;">

        <div style="font-size: 15px; color: #374151;
        line-height: 1.8;">
          ${mensaje}
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb;
        margin: 32px 0;">

        <div style="text-align: center;">
          <a href="https://cbmfisioterapia.com/solicitar-cita"
             style="display: inline-block; padding: 12px 28px;
             background: linear-gradient(135deg, #f472b6, #a855f7);
             color: white; text-decoration: none;
             border-radius: 999px; font-weight: 600; font-size: 14px;">
            Solicitar cita 💜
          </a>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${unsubUrl}"
             style="color: #9ca3af; font-size: 11px;
             text-decoration: underline;">
            Darme de baja de la newsletter
          </a>
        </div>

      </div>

      <p style="text-align: center; color: #9ca3af;
      font-size: 11px; margin-top: 16px; line-height: 1.6;">
        CBM Fisioterapia · Calle Arquímedes 227, Local 2 · Terrassa<br>
        L-V 9:00-14:00 / 17:00-21:00 · Sábados 10:00-15:00<br><br>
        Recibiste este email porque te suscribiste en cbmfisioterapia.com<br>
        <a href="https://cbmfisioterapia.com"
        style="color: #a855f7;">cbmfisioterapia.com</a>
      </p>
    </div>
  `
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  try {
    const { asunto, mensaje, emails } = JSON.parse(event.body || '{}')
    const RESEND_API_KEY = process.env['RESEND_API_KEY']
    const FROM_EMAIL = process.env['RESEND_DOMAIN_VERIFIED'] === 'true'
      ? 'noreply@cbmfisioterapia.com'
      : 'onboarding@resend.dev'

    if (!RESEND_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Configuración incompleta' })
      }
    }

    if (!emails || emails.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No hay suscriptores' })
      }
    }

    // Enviar en lotes de 50 para evitar límites de Resend
    const loteSize = 50
    const lotes: string[][] = []
    for (let i = 0; i < emails.length; i += loteSize) {
      lotes.push(emails.slice(i, i + loteSize))
    }

    let enviados = 0
    let errores = 0

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`
    }

    for (const lote of lotes) {
      const resultados = await Promise.allSettled(
        lote.map((email: string) =>
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              from: `CBM Fisioterapia <${FROM_EMAIL}>`,
              to: [email],
              subject: asunto,
              html: buildHtml(mensaje, email)
            })
          })
        )
      )

      resultados.forEach(r => {
        if (r.status === 'fulfilled' && r.value.ok) {
          enviados++
        } else {
          errores++
        }
      })
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, enviados, errores })
    }

  } catch (err) {
    console.error('Error newsletter:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err) })
    }
  }
}

export { handler }
