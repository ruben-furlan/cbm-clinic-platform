# Tasks — Database — SPEC-001-pacientes

## Estado general
- [ ] En progreso

## Tareas

### T001-DB-01 — Crear fichero SQL de migración `[S]`
**Descripción:** Crear el fichero `supabase/SPEC-001-pacientes.sql` con toda la migración: tabla, índices, función, trigger y políticas RLS.
**Archivo(s) afectado(s):** `supabase/SPEC-001-pacientes.sql` (nuevo)
**Criterio de completitud:** El fichero existe y contiene el SQL completo según la spec. Puede ejecutarse en el SQL Editor de Supabase sin errores.
**Dependencias:** ninguna
- [ ] Completada

---

### T001-DB-02 — Ejecutar migración en Supabase `[XS]`
**Descripción:** Copiar y ejecutar el contenido de `supabase/SPEC-001-pacientes.sql` en el SQL Editor del proyecto Supabase.
**Archivo(s) afectado(s):** Base de datos Supabase (no hay fichero local)
**Criterio de completitud:** La tabla `pacientes` existe en Supabase, RLS está activo, y se puede insertar un registro de prueba como usuario autenticado.
**Dependencias:** T001-DB-01
- [ ] Completada

---

### T001-DB-03 — Verificar políticas RLS `[XS]`
**Descripción:** Confirmar en el panel de Supabase (Authentication > Policies) que las políticas están activas y que un usuario anónimo NO puede leer la tabla.
**Archivo(s) afectado(s):** Base de datos Supabase
**Criterio de completitud:** Una query anónima `SELECT * FROM pacientes` devuelve 0 filas (bloqueada por RLS), y una query autenticada devuelve los datos correctamente.
**Dependencias:** T001-DB-02
- [ ] Completada
