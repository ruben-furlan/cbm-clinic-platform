import type { Handler } from '@netlify/functions'

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  try {
    const data = JSON.parse(event.body || '{}')
    const RESEND_API_KEY = process.env['RESEND_API_KEY']
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY no configurado')
      return { statusCode: 500, body: JSON.stringify({ error: 'Configuración incompleta' }) }
    }
    const FROM_EMAIL = process.env['RESEND_DOMAIN_VERIFIED'] === 'true'
      ? 'noreply@cbmfisioterapia.com'
      : 'onboarding@resend.dev'
    const ADMIN_EMAIL = 'rubenfurlan@gmail.com'

    const htmlCliente = `
      <div style="font-family: sans-serif; max-width: 600px;
      margin: 0 auto; padding: 32px;">
        <div style="background: linear-gradient(135deg, #f472b6, #a855f7);
        padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
          <img
            src="https://cbmfisioterapia.com/favicon-192x192.png"
            alt="CBM Fisioterapia"
            width="56"
            height="56"
            style="border-radius: 12px; margin-bottom: 12px;
            display: block; margin-left: auto; margin-right: auto;"
          />
          <h1 style="color: white; margin: 0; font-size: 24px;">
            💜 Tu cita en CBM está en camino
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">
            CBM Fisioterapia
          </p>
        </div>
        <div style="background: white; border: 1px solid #e5e7eb;
        border-top: none; border-radius: 0 0 16px 16px; padding: 32px;">

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hola ${data.nombre} 😊
          </p>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">
            Nos alegra que hayas dado el primer paso 💜<br>
            Hemos recibido tu solicitud y nos pondremos en contacto
            contigo para encontrar el mejor momento para ti.
          </p>

          <div style="background: #fdf4ff; border-radius: 16px;
          padding: 24px; margin: 24px 0; border: 1px solid #e9d5ff;">
            <p style="margin: 0 0 16px; font-size: 13px; font-weight: 700;
            color: #7c3aed; letter-spacing: 1px; text-transform: uppercase;">
              Resumen de tu solicitud
            </p>
            <div style="border-bottom: 1px solid #e9d5ff; padding: 10px 0;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">🏥 Tratamiento</p>
              <p style="margin: 4px 0 0; font-weight: 600; color: #111827; font-size: 15px;">
                ${data.tratamiento}
              </p>
            </div>
            <div style="border-bottom: 1px solid #e9d5ff; padding: 10px 0;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">👤 Nombre</p>
              <p style="margin: 4px 0 0; font-weight: 600; color: #111827; font-size: 15px;">
                ${data.nombre} ${data.apellido || ''}
              </p>
            </div>
            <div style="border-bottom: 1px solid #e9d5ff; padding: 10px 0;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">📧 Email</p>
              <p style="margin: 4px 0 0; font-weight: 600; color: #111827; font-size: 15px; word-break: break-all;">
                ${data.email}
              </p>
            </div>
            <div style="${data.codigoPromo ? 'border-bottom: 1px solid #e9d5ff;' : ''} padding: 10px 0;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">📱 Teléfono</p>
              <p style="margin: 4px 0 0; font-weight: 600; color: #111827; font-size: 15px;">
                ${data.telefono}
              </p>
            </div>
            ${data.codigoPromo ? `
            <div style="padding: 10px 0;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">🎟️ Código promocional</p>
              <p style="margin: 4px 0 0; font-weight: 600; color: #a855f7; font-size: 15px;">
                ${data.codigoPromo}
              </p>
            </div>
            ` : ''}
          </div>

          <div style="background: #f0fdf4; border-radius: 12px;
          padding: 16px; margin-bottom: 24px; border: 1px solid #bbf7d0;">
            <p style="margin: 0; font-size: 14px; color: #166534;">
              Te escribiremos a <strong>${data.email}</strong> o al
              <strong>${data.telefono}</strong> para confirmar tu cita.
              Suele ser durante el mismo día 😊
            </p>
          </div>

          <div style="background: #f9fafb; border-radius: 12px;
          padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px; font-weight: 700;
            color: #111827; font-size: 15px;">
              ¿Prefieres contactarnos tú directamente?
            </p>
            <a href="https://wa.me/34662561672"
               style="display: inline-block; padding: 10px 20px;
               background: #25D366; color: white; text-decoration: none;
               border-radius: 999px; font-weight: 600; font-size: 14px;">
              💬 Escríbenos por WhatsApp
            </a>
          </div>

          <p style="color: #374151; font-size: 14px; line-height: 1.7;
          font-style: italic;">
            Estamos deseando acompañarte 💜<br>
            — El equipo CBM
          </p>
        </div>
        <p style="text-align: center; color: #9ca3af;
        font-size: 12px; margin-top: 16px;">
          CBM Fisioterapia · Calle Arquímedes 227, Local 2 · Terrassa<br>
          L-V 9:00-14:00 / 17:00-21:00 · Sábados 10:00-15:00
        </p>
      </div>
    `

    const htmlAdmin = `
      <div style="font-family: sans-serif; max-width: 600px;
      margin: 0 auto; padding: 32px;">
        <div style="background: linear-gradient(135deg, #f472b6, #a855f7);
        padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
          <img
            src="https://cbmfisioterapia.com/favicon-192x192.png"
            alt="CBM Fisioterapia"
            width="56"
            height="56"
            style="border-radius: 12px; margin-bottom: 12px;
            display: block; margin-left: auto; margin-right: auto;"
          />
          <h1 style="color: white; margin: 0; font-size: 24px;">
            📅 Nueva solicitud de cita
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">
            CBM Fisioterapia
          </p>
        </div>
        <div style="background: white; border: 1px solid #e5e7eb;
        border-top: none; border-radius: 0 0 16px 16px; padding: 32px;">
          <div style="border-bottom: 1px solid #f3f4f6; padding: 10px 0;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">🏥 Tratamiento</p>
            <p style="margin: 4px 0 0; font-weight: 600; color: #111827; font-size: 15px;">
              ${data.tratamiento}
            </p>
          </div>
          ${data.precio ? `
          <div style="border-bottom: 1px solid #f3f4f6; padding: 10px 0;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">💰 Precio</p>
            <p style="margin: 4px 0 0; font-weight: 700; color: #111827; font-size: 15px;">
              ${data.precio}
            </p>
          </div>
          ` : ''}
          <div style="border-bottom: 1px solid #f3f4f6; padding: 10px 0;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">👤 Nombre</p>
            <p style="margin: 4px 0 0; font-weight: 600; color: #111827; font-size: 15px;">
              ${data.nombre} ${data.apellido || ''}
            </p>
          </div>
          <div style="border-bottom: 1px solid #f3f4f6; padding: 10px 0;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">📧 Email</p>
            <p style="margin: 4px 0 0; font-weight: 600; color: #111827; font-size: 15px; word-break: break-all;">
              ${data.email}
            </p>
          </div>
          <div style="${data.codigoPromo ? 'border-bottom: 1px solid #f3f4f6;' : ''} padding: 10px 0;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">📱 Teléfono</p>
            <p style="margin: 4px 0 0; font-weight: 600; color: #111827; font-size: 15px;">
              ${data.telefono}
            </p>
          </div>
          ${data.codigoPromo ? `
          <div style="padding: 10px 0;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">🎟️ Código promo</p>
            <p style="margin: 4px 0 0; font-weight: 600; color: #a855f7; font-size: 15px;">
              ${data.codigoPromo}
            </p>
          </div>
          ` : ''}

          <div style="margin-top: 24px; padding: 16px; background: #fdf4ff;
          border-radius: 12px; border: 1px solid #e9d5ff;">
            <p style="margin: 0; font-size: 14px; color: #7c3aed;">
              💜 Recuerda contactar al cliente para confirmar
              disponibilidad y horario.
            </p>
          </div>
        </div>
        <p style="text-align: center; color: #9ca3af;
        font-size: 12px; margin-top: 16px;">
          CBM Fisioterapia · Calle Arquímedes 227, Local 2 · Terrassa
        </p>
      </div>
    `

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`
    }

    const [resCliente, resAdmin] = await Promise.allSettled([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          from: `CBM Fisioterapia <${FROM_EMAIL}>`,
          to: [data.email],
          subject: `💜 Tu cita en CBM está en camino`,
          html: htmlCliente
        })
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          from: `CBM Fisioterapia <${FROM_EMAIL}>`,
          to: [ADMIN_EMAIL],
          subject: `📅 Nueva solicitud de cita — ${data.tratamiento}`,
          html: htmlAdmin
        })
      })
    ])

    console.log('Cliente settled:', resCliente.status)
    console.log('Admin settled:', resAdmin.status)

    if (resCliente.status === 'rejected') {
      console.error('Error cliente (network):', resCliente.reason)
    } else if (!resCliente.value.ok) {
      const body = await resCliente.value.text()
      console.error(`Resend error (cliente) ${resCliente.value.status}:`, body)
      return { statusCode: 500, body: JSON.stringify({ error: 'Resend error (cliente)', status: resCliente.value.status, details: body }) }
    }

    if (resAdmin.status === 'rejected') {
      console.error('Error admin (network):', resAdmin.reason)
    } else if (!resAdmin.value.ok) {
      const body = await resAdmin.value.text()
      console.error(`Resend error (admin) ${resAdmin.value.status}:`, body)
    }

    if (resCliente.status === 'rejected') {
      return { statusCode: 500, body: JSON.stringify({ error: 'Error de red enviando email al cliente' }) }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    }
  } catch (err) {
    console.error('Error inesperado:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error inesperado', details: String(err) })
    }
  }
}

export { handler }
