# SPEC-001 — Gestión de Pacientes (Database)

## Resumen

Crear la tabla `pacientes` en Supabase con RLS, índices y trigger de `updated_at`.

## Tabla: `pacientes`

```sql
CREATE TABLE pacientes (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Datos personales
  nombre           text NOT NULL,
  apellidos        text NOT NULL,
  email            text,
  telefono         text NOT NULL,
  fecha_nacimiento date,

  -- Notas internas (solo visibles para el admin)
  notas            text,

  -- Estado
  estado           text NOT NULL DEFAULT 'activo'
                     CHECK (estado IN ('activo', 'inactivo', 'archivado')),

  -- Auditoría
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
```

## Índices

```sql
CREATE INDEX idx_pacientes_email    ON pacientes (lower(email)) WHERE email IS NOT NULL;
CREATE INDEX idx_pacientes_telefono ON pacientes (telefono);
CREATE INDEX idx_pacientes_estado   ON pacientes (estado);
```

## Políticas RLS

- **Lectura pública**: ❌ — los datos de pacientes son privados
- **Lectura admin**: ✅ — solo usuarios autenticados pueden leer
- **Escritura admin**: ✅ — solo usuarios autenticados pueden crear/editar/eliminar
- **Acceso anónimo**: ❌ — ningún acceso

```sql
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

-- Solo admin lee
CREATE POLICY "pacientes_admin_read"
  ON pacientes FOR SELECT
  TO authenticated USING (true);

-- Solo admin escribe
CREATE POLICY "pacientes_admin_all"
  ON pacientes FOR ALL
  TO authenticated USING (true) WITH CHECK (true);
```

## Trigger `updated_at`

Reutilizar o crear la función `fn_set_updated_at()` si no existe:

```sql
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_updated_at_pacientes
BEFORE UPDATE ON pacientes
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
```

## Consideraciones GDPR / privacidad

- La tabla contiene datos personales (nombre, email, teléfono, fecha de nacimiento)
- RLS asegura que solo admins autenticados acceden a estos datos
- El campo `notas` puede contener información de salud — tratar con discreción
- En el futuro: considerar política de retención y borrado de datos inactivos

## Fichero SQL a crear

`supabase/SPEC-001-pacientes.sql`
