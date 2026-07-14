-- Configuración del cartel de la ventana del local (/display/horizontal)
-- Se gestiona desde el panel de admin → pestaña "🪟 Cartel ventana".
-- Ejecutar en Supabase SQL Editor.

INSERT INTO configuracion (clave, valor, descripcion)
VALUES
  ('display_cartel_estado',  'volvemos', 'Estado del cartel de la ventana: abierto | timbre | volvemos | cerrado'),
  ('display_cartel_titulo',  '',         'Título personalizado del cartel (vacío = usa el texto por defecto del estado)'),
  ('display_cartel_mensaje', '',         'Mensaje personalizado del cartel (vacío = usa el texto por defecto del estado)')
ON CONFLICT (clave) DO NOTHING;
