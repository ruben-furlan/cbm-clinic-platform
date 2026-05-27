# Plan — Database — SPEC-001-pacientes

## Decisiones de diseño

### ¿`fecha_nacimiento` como `date` o `text`?

**Decisión: `date`**

Usar el tipo nativo `date` de PostgreSQL permite hacer cálculos de edad y ordenar por fecha correctamente. En el frontend se manejará como `string` en formato `YYYY-MM-DD` (input de tipo `date`).

### ¿Email obligatorio o opcional?

**Decisión: opcional (`email text` sin `NOT NULL`)**

En una clínica de fisioterapia muchos pacientes mayores no tienen email. El teléfono es el campo de contacto principal. Email puede ser `null`.

### ¿Historial / soft delete o borrado físico?

**Decisión: soft delete via campo `estado = 'archivado'`**

Nunca borrar físicamente un paciente (puede tener registros de citas, eventos, etc. en el futuro). El estado `archivado` equivale a "eliminado" visualmente, pero conserva el registro.

### ¿Búsqueda por email case-insensitive?

**Decisión: índice partial con `lower(email)`**

El índice `idx_pacientes_email ON pacientes (lower(email)) WHERE email IS NOT NULL` permite buscar por email sin distinguir mayúsculas/minúsculas, y es partial (solo registros con email).

## Orden de ejecución del SQL

```sql
-- 1. Tabla pacientes
-- 2. Índices
-- 3. Función fn_set_updated_at (CREATE OR REPLACE — idempotente)
-- 4. Trigger trg_updated_at_pacientes
-- 5. RLS + políticas
-- 6. Datos de ejemplo (opcional, solo dev)
```

## Plan de rollback

Si hay que deshacer:
```sql
DROP TABLE IF EXISTS pacientes CASCADE;
-- La función fn_set_updated_at puede mantenerse (la usan otras tablas futuras)
```

## Extensiones futuras

En SPEC-002 (hipotética), se podría añadir:
- `tabla citas` con FK a `pacientes(id)`
- `tabla historial_tratamientos` con FK a `pacientes(id)`
- Campo `numero_historial` único y secuencial

Para no bloquear el futuro, se reserva espacio conceptual con el campo `notas` de texto libre.
