import type { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const RESEND_API_KEY = process.env['RESEND_API_KEY'];
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY no configurado');
      return { statusCode: 500, body: JSON.stringify({ error: 'Configuración incompleta' }) };
    }
    const FROM_EMAIL =
      process.env['RESEND_DOMAIN_VERIFIED'] === 'true'
        ? 'noreply@cbmfisioterapia.com'
        : 'onboarding@resend.dev';
    const ADMIN_EMAIL = 'reservascbm25@gmail.com';

    const summaryRowStyle = 'border-bottom: 1px solid #e9d5ff; padding: 10px 0;';
    const labelStyle = 'margin: 0; font-size: 12px; color: #6b7280;';
    const valueStyle = 'margin: 4px 0 0; font-weight: 600; color: #111827; font-size: 15px;';

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
            💜 Tu cita en CBM está confirmada
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
            ¡Tu cita está confirmada! 💜<br>
            Hemos recibido tu solicitud. Te escribiremos a
            <strong>${data.email}</strong> para confirmar los detalles.
            Suele ser durante el mismo día 😊
          </p>

          <div style="background: #fdf4ff; border-radius: 16px;
          padding: 24px; margin: 24px 0; border: 1px solid #e9d5ff;">
            <p style="margin: 0 0 16px; font-size: 13px; font-weight: 700;
            color: #7c3aed; letter-spacing: 1px; text-transform: uppercase;">
              Resumen de tu cita
            </p>
            <div style="${summaryRowStyle}">
              <p style="${labelStyle}">🏥 Tratamiento</p>
              <p style="${valueStyle}">${data.tratamiento}</p>
            </div>
            ${
              data.precio
                ? `<div style="${summaryRowStyle}">
              <p style="${labelStyle}">💰 Precio</p>
              <p style="${valueStyle}">${data.precio}</p>
            </div>`
                : ''
            }
            ${
              data.fecha
                ? `<div style="${summaryRowStyle}">
              <p style="${labelStyle}">📅 Fecha</p>
              <p style="${valueStyle}">${data.fecha}</p>
            </div>`
                : ''
            }
            ${
              data.hora
                ? `<div style="${summaryRowStyle}">
              <p style="${labelStyle}">🕐 Hora</p>
              <p style="${valueStyle}">${data.hora}</p>
            </div>`
                : ''
            }
            <div style="${summaryRowStyle}">
              <p style="${labelStyle}">👤 Nombre</p>
              <p style="${valueStyle}">${data.nombre}</p>
            </div>
            <div style="${data.telefono ? summaryRowStyle : 'padding: 10px 0;'}">
              <p style="${labelStyle}">📧 Email</p>
              <p style="${valueStyle} word-break: break-all;">${data.email}</p>
            </div>
            ${
              data.telefono
                ? `<div style="padding: 10px 0;">
              <p style="${labelStyle}">📱 Teléfono</p>
              <p style="${valueStyle}">${data.telefono}</p>
            </div>`
                : ''
            }
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
    `;

    const adminRowStyle = 'border-bottom: 1px solid #f3f4f6; padding: 10px 0;';
    const adminLabelStyle = 'margin: 0; font-size: 12px; color: #6b7280;';
    const adminValueStyle = 'margin: 4px 0 0; font-weight: 600; color: #111827; font-size: 15px;';

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
          <div style="${adminRowStyle}">
            <p style="${adminLabelStyle}">🏥 Tratamiento</p>
            <p style="${adminValueStyle}">${data.tratamiento}</p>
          </div>
          ${
            data.precio
              ? `<div style="${adminRowStyle}">
            <p style="${adminLabelStyle}">💰 Precio</p>
            <p style="${adminValueStyle} font-weight: 700;">${data.precio}</p>
          </div>`
              : ''
          }
          ${
            data.fecha
              ? `<div style="${adminRowStyle}">
            <p style="${adminLabelStyle}">📅 Fecha</p>
            <p style="${adminValueStyle} font-weight: 700;">${data.fecha}</p>
          </div>`
              : ''
          }
          ${
            data.hora
              ? `<div style="${adminRowStyle}">
            <p style="${adminLabelStyle}">🕐 Hora</p>
            <p style="${adminValueStyle} font-weight: 700;">${data.hora}</p>
          </div>`
              : ''
          }
          <div style="${adminRowStyle}">
            <p style="${adminLabelStyle}">👤 Nombre</p>
            <p style="${adminValueStyle}">${data.nombre}</p>
          </div>
          <div style="${data.telefono ? adminRowStyle : 'padding: 10px 0;'}">
            <p style="${adminLabelStyle}">📧 Email</p>
            <p style="${adminValueStyle} word-break: break-all;">${data.email}</p>
          </div>
          ${
            data.telefono
              ? `<div style="padding: 10px 0;">
            <p style="${adminLabelStyle}">📱 Teléfono</p>
            <p style="${adminValueStyle}">${data.telefono}</p>
          </div>`
              : ''
          }

          <div style="margin-top: 24px; padding: 16px; background: #fdf4ff;
          border-radius: 12px; border: 1px solid #e9d5ff;">
            <p style="margin: 0; font-size: 14px; color: #7c3aed;">
              💜 El cliente ya ha seleccionado fecha y hora en el calendario.
            </p>
          </div>
        </div>
        <p style="text-align: center; color: #9ca3af;
        font-size: 12px; margin-top: 16px;">
          CBM Fisioterapia · Calle Arquímedes 227, Local 2 · Terrassa
        </p>
      </div>
    `;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    };

    const [resCliente, resAdmin] = await Promise.allSettled([
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          from: `CBM Fisioterapia <${FROM_EMAIL}>`,
          to: [data.email],
          subject: `💜 Tu cita en CBM está confirmada`,
          html: htmlCliente,
        }),
      }),
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          from: `CBM Fisioterapia <${FROM_EMAIL}>`,
          to: [ADMIN_EMAIL],
          subject: `📅 Nueva solicitud de cita — ${data.tratamiento}`,
          html: htmlAdmin,
        }),
      }),
    ]);

    if (resCliente.status === 'rejected') {
      console.error('Error cliente (network):', resCliente.reason);
    } else if (!resCliente.value.ok) {
      const body = await resCliente.value.text();
      console.error(`Resend error (cliente) ${resCliente.value.status}:`, body);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Resend error (cliente)',
          status: resCliente.value.status,
          details: body,
        }),
      };
    }

    if (resAdmin.status === 'rejected') {
      console.error('Error admin (network):', resAdmin.reason);
    } else if (!resAdmin.value.ok) {
      const body = await resAdmin.value.text();
      console.error(`Resend error (admin) ${resAdmin.value.status}:`, body);
    }

    if (resCliente.status === 'rejected') {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Error de red enviando email al cliente' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('Error inesperado:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error inesperado', details: String(err) }),
    };
  }
};

export { handler };
