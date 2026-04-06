-- ─────────────────────────────────────────────────────────────────────────────
-- CBM — RPC register_for_event (atomic slot check + insert)
--
-- Ejecutar en Supabase → SQL Editor
-- Seguro de ejecutar varias veces (OR REPLACE).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION register_for_event(
  p_event_id    uuid,
  p_full_name   text,
  p_email       text,
  p_phone       text,
  p_notes       text    DEFAULT NULL,
  p_source      text    DEFAULT 'home',
  p_access_code text    DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER   -- corre como propietario → bypasa RLS en el insert
AS $$
DECLARE
  v_total_slots  integer;
  v_taken_slots  integer;
  v_registration event_registrations%ROWTYPE;
BEGIN
  -- 1. Bloquear la fila del evento.
  --    SELECT FOR UPDATE impide que otra transacción concurrente pase
  --    este punto hasta que ésta termine → no es posible el overbooking.
  SELECT total_slots INTO v_total_slots
  FROM   events
  WHERE  id = p_event_id
  FOR    UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'event_not_found');
  END IF;

  -- 2. Contar plazas confirmadas dentro del mismo lock.
  SELECT count(*) INTO v_taken_slots
  FROM   event_registrations
  WHERE  event_id = p_event_id
    AND  status   = 'confirmed';

  IF v_taken_slots >= v_total_slots THEN
    RETURN json_build_object('ok', false, 'error', 'no_slots');
  END IF;

  -- 3. Insertar con plaza garantizada.
  INSERT INTO event_registrations (
    event_id, full_name, email, phone, notes, source, status, access_code
  )
  VALUES (
    p_event_id,
    trim(p_full_name),
    lower(trim(p_email)),
    trim(p_phone),
    NULLIF(trim(coalesce(p_notes, '')), ''),
    coalesce(p_source, 'home'),
    'confirmed',
    p_access_code
  )
  RETURNING * INTO v_registration;

  RETURN json_build_object(
    'ok',           true,
    'registration', row_to_json(v_registration)
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('ok', false, 'error', SQLERRM);
END;
$$;

-- El rol 'anon' necesita EXECUTE para poder llamar al RPC desde el frontend.
GRANT EXECUTE ON FUNCTION register_for_event(uuid, text, text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION register_for_event(uuid, text, text, text, text, text, text) TO authenticated;
