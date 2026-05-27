# Tasks — Backend — SPEC-001-pacientes

## Estado general
- [ ] En progreso

## Tareas

### T001-BE-01 — Crear `PacientesService` con interfaces y métodos CRUD `[M]`
**Descripción:** Crear el fichero `src/app/core/services/pacientes.service.ts` con las interfaces exportadas (`Paciente`, `PacienteEstado`, `PacienteInput`) y todos los métodos del servicio según la spec.
**Archivo(s) afectado(s):** `src/app/core/services/pacientes.service.ts` (nuevo)
**Criterio de completitud:** El fichero existe, TypeScript compila sin errores, y los 7 métodos están implementados (`getAll`, `getActivos`, `getById`, `create`, `update`, `updateEstado`, `delete`).
**Dependencias:** T001-DB-02 (tabla existe en Supabase)
- [ ] Completada

---

### T001-BE-02 — Verificar integración con Supabase en local `[S]`
**Descripción:** Arrancar la app en local (`npm start`) y desde la consola del navegador, inyectar el servicio y llamar a `getAll()` para confirmar que devuelve datos (o array vacío) sin errores.
**Archivo(s) afectado(s):** ninguno (verificación manual)
**Criterio de completitud:** La llamada al servicio no lanza error y devuelve un array (vacío o con datos de prueba).
**Dependencias:** T001-BE-01
- [ ] Completada
