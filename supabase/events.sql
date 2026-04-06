-- ─────────────────────────────────────────────────────────────────────────────
-- CBM Clinic Platform — Sistema de Clases y Eventos
-- Ejecutar en el SQL Editor de Supabase (en orden)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Tabla events ───────────────────────────────────────────────────────────

CREATE TABLE events (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contenido
  title                 text NOT NULL,
  slug                  text UNIQUE,
  short_description     text NOT NULL,
  long_description      text,

  -- Clasificación
  category              text NOT NULL DEFAULT 'otro'
                          CHECK (category IN ('pilates','fisioterapia','taller','evento_especial','otro')),

  -- Precio
  pricing_type          text NOT NULL DEFAULT 'free'
                          CHECK (pricing_type IN ('free','paid')),
  price                 numeric(10,2),
  currency              text NOT NULL DEFAULT 'EUR',

  -- Tiempo
  start_at              timestamptz NOT NULL,
  end_at                timestamptz,
  duration_minutes      integer,

  -- Plazas
  total_slots           integer NOT NULL DEFAULT 10,
  reserved_slots        integer NOT NULL DEFAULT 0,

  -- Presentación
  image_url             text,
  location              text,
  cta_label             text,

  -- Visibilidad
  highlight_on_home     boolean NOT NULL DEFAULT false,
  is_active             boolean NOT NULL DEFAULT true,
  is_visible            boolean NOT NULL DEFAULT true,

  -- Restricciones
  is_new_clients_only   boolean NOT NULL DEFAULT false,
  free_limit_per_person integer NOT NULL DEFAULT 1,  -- máx eventos gratis por persona
  free_cooldown_days    integer NOT NULL DEFAULT 30, -- días entre reservas gratuitas

  -- Estado
  status                text NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','completed','cancelled','inactive')),

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ── 2. Tabla event_registrations ─────────────────────────────────────────────

CREATE TABLE event_registrations (
  id                uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id          uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Contacto (identificador sin login obligatorio)
  full_name         text NOT NULL,
  email             text NOT NULL,
  phone             text NOT NULL,
  notes             text,

  -- Origen
  source            text NOT NULL DEFAULT 'home',  -- home | admin | whatsapp

  -- Validación
  is_free_event     boolean NOT NULL DEFAULT false,
  validation_status text NOT NULL DEFAULT 'ok'
                      CHECK (validation_status IN ('ok','blocked_cooldown','blocked_new_clients')),
  status            text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','confirmed','cancelled','rejected','blocked')),
  blocked_reason    text,

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ── 3. Índices ────────────────────────────────────────────────────────────────

CREATE INDEX idx_events_start_at       ON events (start_at);
CREATE INDEX idx_events_status         ON events (status);
CREATE INDEX idx_events_highlight      ON events (highlight_on_home) WHERE highlight_on_home = true;
CREATE INDEX idx_events_active_visible ON events (is_active, is_visible);

CREATE INDEX idx_reg_event_id          ON event_registrations (event_id);
CREATE INDEX idx_reg_email             ON event_registrations (lower(email));
CREATE INDEX idx_reg_phone             ON event_registrations (phone);
CREATE INDEX idx_reg_status            ON event_registrations (status);

-- ── 4. Trigger: mantener reserved_slots actualizado ──────────────────────────

CREATE OR REPLACE FUNCTION fn_sync_reserved_slots()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_event_id uuid;
BEGIN
  v_event_id := COALESCE(NEW.event_id, OLD.event_id);

  -- Recalcular desde cero para evitar drift
  UPDATE events
  SET
    reserved_slots = (
      SELECT COUNT(*)
      FROM event_registrations
      WHERE event_id = v_event_id
        AND status NOT IN ('cancelled', 'rejected', 'blocked')
    ),
    -- Auto-completar si llega al límite
    status = CASE
      WHEN (
        SELECT COUNT(*)
        FROM event_registrations
        WHERE event_id = v_event_id
          AND status NOT IN ('cancelled', 'rejected', 'blocked')
      ) >= total_slots AND status = 'active'
      THEN 'completed'
      ELSE status
    END,
    updated_at = now()
  WHERE id = v_event_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_sync_slots
AFTER INSERT OR UPDATE OF status OR DELETE
ON event_registrations
FOR EACH ROW
EXECUTE FUNCTION fn_sync_reserved_slots();

-- ── 5. Función RPC: validar elegibilidad para evento gratuito ─────────────────
--
-- Devuelve: { "valid": true, "reason": null }
--       o:  { "valid": false, "reason": "blocked_cooldown" | "blocked_new_clients" }

CREATE OR REPLACE FUNCTION validate_free_event_registration(
  p_email   text,
  p_phone   text,
  p_event_id uuid
)
RETURNS json LANGUAGE plpgsql AS $$
DECLARE
  v_event             events%ROWTYPE;
  v_recent_count      integer;
BEGIN
  -- Cargar evento
  SELECT * INTO v_event FROM events WHERE id = p_event_id;

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'reason', 'blocked_cooldown');
  END IF;

  -- Solo aplica a gratuitos
  IF v_event.pricing_type != 'free' THEN
    RETURN json_build_object('valid', true, 'reason', null);
  END IF;

  -- Contar eventos gratuitos usados dentro del cooldown
  SELECT COUNT(*) INTO v_recent_count
  FROM event_registrations er
  JOIN events e ON e.id = er.event_id
  WHERE (lower(er.email) = lower(p_email) OR er.phone = p_phone)
    AND e.pricing_type = 'free'
    AND er.status NOT IN ('cancelled', 'rejected', 'blocked')
    AND er.created_at >= (now() - (v_event.free_cooldown_days || ' days')::interval);

  IF v_recent_count >= v_event.free_limit_per_person THEN
    RETURN json_build_object('valid', false, 'reason', 'blocked_cooldown');
  END IF;

  -- Restricción solo nuevos clientes: comprobar si ya asistió alguna vez
  IF v_event.is_new_clients_only THEN
    SELECT COUNT(*) INTO v_recent_count
    FROM event_registrations er
    WHERE (lower(er.email) = lower(p_email) OR er.phone = p_phone)
      AND er.status NOT IN ('cancelled', 'rejected', 'blocked');

    IF v_recent_count > 0 THEN
      RETURN json_build_object('valid', false, 'reason', 'blocked_new_clients');
    END IF;
  END IF;

  RETURN json_build_object('valid', true, 'reason', null);
END;
$$;

-- ── 6. Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo eventos activos y visibles
CREATE POLICY "events_public_read"
  ON events FOR SELECT
  USING (is_active = true AND is_visible = true);

-- Escritura anónima de registros (visitors crean inscripciones)
CREATE POLICY "registrations_anon_insert"
  ON event_registrations FOR INSERT
  WITH CHECK (true);

-- Lectura de registros: solo el propio email (o admin via service_role)
-- Para el panel admin, usar service_role (bypass RLS)
CREATE POLICY "registrations_own_read"
  ON event_registrations FOR SELECT
  USING (true);  -- Ajustar según política de acceso del admin

-- Admin (autenticado) puede hacer todo en events
CREATE POLICY "events_admin_all"
  ON events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin (autenticado) puede gestionar registros
CREATE POLICY "registrations_admin_all"
  ON event_registrations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── 7. Datos de ejemplo ───────────────────────────────────────────────────────

INSERT INTO events (
  title, short_description, long_description, category, pricing_type, price,
  start_at, total_slots, highlight_on_home, is_active, is_visible,
  free_limit_per_person, free_cooldown_days, cta_label, status
) VALUES
(
  'Clase abierta de pilates terapéutico',
  'Sesión de introducción al pilates terapéutico. Perfecta si nunca has probado el pilates o quieres recuperarte de una lesión.',
  'Esta clase está pensada como primera toma de contacto. Trabajaremos la postura, la respiración y la activación del core de forma suave y progresiva.',
  'pilates', 'free', null,
  now() + interval '7 days' + interval '10 hours',
  8, true, true, true,
  1, 30, 'Apuntarme gratis', 'active'
),
(
  'Taller de movilidad de columna',
  'Aprende a cuidar tu columna con ejercicios de movilidad y control postural. Nivel principiante.',
  null,
  'taller', 'paid', 12.00,
  now() + interval '14 days' + interval '18 hours',
  10, true, true, true,
  1, 30, 'Reservar plaza', 'active'
),
(
  'Pilates terapéutico — grupo reducido',
  'Sesión de pilates en grupo de máximo 4 personas. Atención personalizada y progresión adaptada.',
  null,
  'pilates', 'paid', 18.00,
  now() + interval '21 days' + interval '9 hours' + interval '30 minutes',
  4, false, true, true,
  1, 30, 'Reservar plaza', 'active'
);
