# Guidelines — Database Layer

## Al diseñar una nueva tabla

1. **Revisar tablas existentes** — ¿ya existe algo similar? ¿se puede extender?
2. **Columnas mínimas** — `id`, `created_at`, `updated_at` siempre presentes
3. **Tipos adecuados** — `text` para strings, `timestamptz` para fechas (siempre con zona horaria), `uuid` para IDs, `numeric(10,2)` para precios
4. **Constraints explícitos** — `NOT NULL`, `CHECK`, `UNIQUE` donde aplique
5. **Índices** — crear índices en columnas que se usen en `WHERE`, `ORDER BY` o `JOIN`

## Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Tabla | `snake_case` plural | `pacientes` |
| Columna | `snake_case` | `fecha_nacimiento` |
| Índice | `idx_{tabla}_{columna}` | `idx_pacientes_email` |
| Trigger | `trg_{accion}_{tabla}` | `trg_updated_at_pacientes` |
| Función | `fn_{descripcion}` | `fn_sync_reserved_slots` |
| RPC pública | verbo + sustantivo | `register_paciente` |
| Política RLS | `"{tabla}_{rol}_{accion}"` | `"pacientes_admin_all"` |

## Trigger para updated_at

Usar este patrón estándar en tablas que se actualizan:

```sql
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_updated_at_{tabla}
BEFORE UPDATE ON {tabla}
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
```

## Orden de secciones en el SQL

```sql
-- 1. Tabla principal
-- 2. Tablas relacionadas
-- 3. Índices
-- 4. Triggers y funciones
-- 5. RPCs públicas
-- 6. Row Level Security
-- 7. Datos de ejemplo (solo en desarrollo)
```

## Cambios en tablas existentes

- **Añadir columna**: `ALTER TABLE ... ADD COLUMN` — siempre con valor DEFAULT si es `NOT NULL`
- **Renombrar columna**: usar `COMMENT` para deprecar antes de renombrar
- **Eliminar columna**: nunca en producción directamente. Pasos:
  1. Deprecar en código (dejar de leer/escribir)
  2. Verificar en producción que no se usa
  3. Eliminar en siguiente release

## Datos sensibles

- Datos de salud/médicos: añadir comentario explícito con consideraciones GDPR
- Emails y teléfonos: normalizar en minúsculas en los índices (`lower(email)`)
- Nunca almacenar contraseñas — usar Supabase Auth
