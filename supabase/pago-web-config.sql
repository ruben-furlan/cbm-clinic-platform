-- Configuración del modo de pago de reservas (toggle del panel de admin)
-- ON  (pago_web_activo = 'true')  → la seña de 10€ se cobra por la web (Calendly + Stripe, plan de pago)
-- OFF (pago_web_activo = 'false') → Calendly free solo agenda; la seña se cobra manualmente
--                                   (transferencia o link de Stripe enviado por WhatsApp)
-- El cambio de calendario (evento con pago / sin pago) se hace manualmente en Calendly
-- y se pega el link del calendario activo en pago_web_calendly_url.
-- Ejecutar en Supabase SQL Editor.

INSERT INTO configuracion (clave, valor, descripcion)
VALUES
  (
    'pago_web_activo',
    'true',
    'ON = seña cobrada por la web (Calendly+Stripe). OFF = solo agenda, seña cobrada manualmente'
  ),
  (
    'pago_web_calendly_url',
    'https://calendly.com/reservascbm25/cita-cbm-fisioterapia?primary_color=c44b8e&hide_gdpr_banner=1&hide_landing_page_details=1&hide_event_type_details=1',
    'Link del calendario Calendly público activo (pegar aquí el evento con o sin pago según el modo)'
  )
ON CONFLICT (clave) DO NOTHING;
