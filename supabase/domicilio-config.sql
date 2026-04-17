-- Configuración del bloque "Fisioterapia a domicilio" en /tarifas
-- Ejecutar en Supabase SQL Editor

INSERT INTO configuracion (clave, valor, descripcion)
VALUES
  ('domicilio_activo', 'true', 'Muestra/oculta el bloque de fisioterapia a domicilio'),
  ('domicilio_titulo', 'Fisioterapia a domicilio', 'Título del bloque de domicilio'),
  ('domicilio_mensaje', 'Pensado para recuperaciones postparto, post-cirugía o movilidad reducida. Valoramos cada caso con cariño.', 'Mensaje del bloque de domicilio')
ON CONFLICT (clave) DO NOTHING;
