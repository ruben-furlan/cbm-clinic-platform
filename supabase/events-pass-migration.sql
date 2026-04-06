-- ─────────────────────────────────────────────────────────────────────────────
-- CBM — Digital Pass Migration
-- Ejecutar DESPUÉS de events.sql (si la tabla ya existe, usa los ALTER TABLE)
-- Si ejecutas events.sql desde cero, añade estos campos directamente allí.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Nuevos campos en event_registrations ───────────────────────────────────

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS access_code     text UNIQUE,
  ADD COLUMN IF NOT EXISTS checkin_status  text NOT NULL DEFAULT 'pending'
    CHECK (checkin_status IN ('pending', 'checked_in')),
  ADD COLUMN IF NOT EXISTS checked_in_at   timestamptz;

CREATE INDEX IF NOT EXISTS idx_reg_access_code
  ON event_registrations (access_code)
  WHERE access_code IS NOT NULL;

-- ── 2. Función: generar código único por categoría ────────────────────────────
--
-- Formato: CBM-CAT-XXXXX
-- Charset sin caracteres ambiguos (excluye 0/O/I/1/l)
-- Ejemplo: CBM-PIL-A3K7R,  CBM-FIS-9WXZ2,  CBM-EVT-B4MQP

CREATE OR REPLACE FUNCTION generate_cbm_access_code(p_event_id uuid)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_category  text;
  v_prefix    text;
  v_charset   text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code      text;
  v_suffix    text;
  v_attempt   int  := 0;
  i           int;
BEGIN
  -- Obtener la categoría del evento para el prefijo
  SELECT category INTO v_category FROM events WHERE id = p_event_id;

  v_prefix := CASE v_category
    WHEN 'pilates'         THEN 'PIL'
    WHEN 'fisioterapia'    THEN 'FIS'
    WHEN 'taller'          THEN 'TAL'
    WHEN 'evento_especial' THEN 'EVT'
    ELSE                        'CBM'
  END;

  LOOP
    -- Generar 5 chars aleatorios del charset limpio
    v_suffix := '';
    FOR i IN 1..5 LOOP
      v_suffix := v_suffix
        || substr(v_charset, floor(random() * length(v_charset))::int + 1, 1);
    END LOOP;

    v_code := 'CBM-' || v_prefix || '-' || v_suffix;

    -- Verificar unicidad
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM event_registrations WHERE access_code = v_code
    );

    v_attempt := v_attempt + 1;
    IF v_attempt > 20 THEN
      -- Fallback: prefijo único con timestamp para evitar bloqueo indefinido
      v_code := 'CBM-' || v_prefix || '-' || upper(substr(md5(random()::text), 1, 5));
      EXIT;
    END IF;
  END LOOP;

  RETURN v_code;
END;
$$;

-- ── 3. Trigger: asignar access_code automáticamente al insertar ───────────────

CREATE OR REPLACE FUNCTION fn_assign_access_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Solo asignar si no viene ya informado y si la inscripción no está bloqueada
  IF NEW.access_code IS NULL AND NEW.status != 'blocked' THEN
    NEW.access_code := generate_cbm_access_code(NEW.event_id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_access_code ON event_registrations;

CREATE TRIGGER trg_assign_access_code
BEFORE INSERT ON event_registrations
FOR EACH ROW EXECUTE FUNCTION fn_assign_access_code();

-- ── 4. Función RPC: registrar check-in ───────────────────────────────────────

CREATE OR REPLACE FUNCTION checkin_registration(p_registration_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE event_registrations
  SET
    checkin_status = 'checked_in',
    checked_in_at  = now(),
    status         = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
    updated_at     = now()
  WHERE id = p_registration_id;
END;
$$;
