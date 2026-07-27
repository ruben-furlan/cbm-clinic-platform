-- ─────────────────────────────────────────────────────────────────────────────
-- CBM — RPC actualizar_cartel_display (cambio rápido del cartel desde /cartel)
--
-- Permite al equipo cambiar el estado del cartel de la ventana con una clave
-- compartida, sin necesidad de cuenta de Supabase. La clave se valida aquí
-- (nunca viaja en el bundle del frontend) y la escritura corre como owner,
-- por lo que la política RLS "solo admin escribe configuracion" sigue cerrada
-- para el rol anon.
--
-- p_minutos (solo con p_estado = 'volvemos'): arma una cuenta atrás guardando
-- el instante exacto en que termina en display_cartel_volvemos_fin. Se calcula
-- en el servidor (now() + intervalo) para no depender del reloj del móvil que
-- hace la llamada. La pantalla /display/horizontal recalcula sola los minutos
-- restantes a partir de ese instante.
--
-- Para cambiar la clave: editar el valor de v_clave y volver a ejecutar.
-- Este archivo reemplaza la versión anterior de 5 parámetros: al añadir
-- p_minutos hay que soltar esa firma antes de recrear la función, si no
-- PostgREST ve dos funciones candidatas y falla con "function is not unique".
-- Ejecutar en Supabase → SQL Editor. Seguro de ejecutar varias veces.
-- ─────────────────────────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS actualizar_cartel_display(text, text, text, text, boolean);

CREATE OR REPLACE FUNCTION actualizar_cartel_display(
  p_clave        text,
  p_estado       text    DEFAULT NULL,
  p_titulo       text    DEFAULT '',
  p_mensaje      text    DEFAULT '',
  p_solo_validar boolean DEFAULT false,
  p_minutos      integer DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_clave constant text := 'messilove';
  v_volvemos_fin text := '';
BEGIN
  IF p_clave IS DISTINCT FROM v_clave THEN
    RETURN json_build_object('ok', false, 'error', 'clave_incorrecta');
  END IF;

  IF p_solo_validar THEN
    RETURN json_build_object('ok', true);
  END IF;

  IF p_estado IS NULL OR p_estado NOT IN ('abierto', 'timbre', 'volvemos', 'cerrado') THEN
    RETURN json_build_object('ok', false, 'error', 'estado_invalido');
  END IF;

  IF p_estado = 'volvemos' AND p_minutos IS NOT NULL AND p_minutos > 0 THEN
    v_volvemos_fin := to_char(now() + (p_minutos || ' minutes')::interval, 'YYYY-MM-DD"T"HH24:MI:SS"Z"');
  END IF;

  INSERT INTO configuracion (clave, valor)
  VALUES
    ('display_cartel_estado',       p_estado),
    ('display_cartel_titulo',       coalesce(trim(p_titulo), '')),
    ('display_cartel_mensaje',      coalesce(trim(p_mensaje), '')),
    ('display_cartel_volvemos_fin', v_volvemos_fin)
  ON CONFLICT (clave) DO UPDATE
    SET valor = EXCLUDED.valor, updated_at = now();

  RETURN json_build_object('ok', true);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('ok', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION actualizar_cartel_display(text, text, text, text, boolean, integer) TO anon;
GRANT EXECUTE ON FUNCTION actualizar_cartel_display(text, text, text, text, boolean, integer) TO authenticated;
