# Context — Database Layer

## Propósito

La capa de base de datos gestiona el **esquema PostgreSQL en Supabase**: tablas, índices, políticas RLS, triggers y funciones RPC.

## Tecnología

- **Supabase** (PostgreSQL 15 hosted)
- Row Level Security (RLS) activado en todas las tablas con datos de usuarios
- Autenticación via `supabase.auth` — rol `anon` para visitantes, `authenticated` para admins
- RPCs (funciones PL/pgSQL) para lógica de negocio que requiere atomicidad o validaciones complejas

## Tablas existentes

| Tabla | Descripción | SQL versionado |
|-------|-------------|----------------|
| `events` | Clases y eventos | ✅ `supabase/events.sql` |
| `event_registrations` | Inscripciones a eventos | ✅ `supabase/events.sql` |
| `bonos_regalo` | Bonos regalo | ✅ `supabase/bonos-regalo.sql` |
| `configuracion` | Key-value de configuración | ✅ `supabase/bonos-regalo.sql` |
| `tarifas` | Precios de servicios | ⚠️ Sin SQL en repo |
| `faqs` | Preguntas frecuentes | ⚠️ Sin SQL en repo |
| `blog_posts` | Entradas de blog | ⚠️ Sin SQL en repo |
| `servicios_regalo` | Servicios para bonos regalo | ⚠️ Sin SQL en repo |
| `newsletter` | Suscriptores newsletter | ⚠️ Sin SQL en repo |

## Convención de ficheros SQL

Cada spec genera su propio fichero:
```
supabase/SPEC-{NNN}-{descripcion}.sql
```

El fichero debe poder ejecutarse en orden en el SQL Editor de Supabase.

## Columnas mínimas obligatorias

Toda tabla nueva debe incluir:
```sql
id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
created_at timestamptz NOT NULL DEFAULT now(),
updated_at timestamptz NOT NULL DEFAULT now()
```

## Patrón de RLS

```sql
-- Activar RLS
ALTER TABLE {tabla} ENABLE ROW LEVEL SECURITY;

-- Lectura pública (si aplica)
CREATE POLICY "{tabla}_public_read"
  ON {tabla} FOR SELECT USING (condicion);

-- Solo admin escribe
CREATE POLICY "{tabla}_admin_all"
  ON {tabla} FOR ALL TO authenticated USING (true) WITH CHECK (true);
```
