# Tasks — Quality — SPEC-001-pacientes

## Estado general
- [ ] En progreso

## Tareas

### T001-QA-01 — Crear tests unitarios de `PacientesService` `[M]`
**Descripción:** Crear `src/app/core/services/pacientes.service.spec.ts` con tests para `getAll()` (ok + error) y `create()` (ok + error). Mockear el cliente Supabase con `vi.spyOn`.
**Archivo(s) afectado(s):** `src/app/core/services/pacientes.service.spec.ts` (nuevo)
**Criterio de completitud:** El fichero existe, `npm test` pasa, y cubre al menos 4 casos: getAll ok, getAll error, create ok, create error.
**Dependencias:** T001-BE-01 (servicio implementado)
- [ ] Completada

---

### T001-QA-02 — Crear tests de componente de `PacientesPage` `[M]`
**Descripción:** Crear `src/app/features/pacientes/pacientes-page.spec.ts` con tests: renderizado, estado de carga, estado de error, y botón de nuevo paciente abre el modal.
**Archivo(s) afectado(s):** `src/app/features/pacientes/pacientes-page.spec.ts` (nuevo)
**Criterio de completitud:** El fichero existe y `npm test` pasa con al menos 3 casos de test.
**Dependencias:** T001-FE-01
- [ ] Completada

---

### T001-QA-03 — Crear tests de validación de `PacientesFormComponent` `[S]`
**Descripción:** Crear `src/app/features/pacientes/pacientes-form.component.spec.ts` con tests de validación del formulario (campos requeridos, modo creación vs edición).
**Archivo(s) afectado(s):** `src/app/features/pacientes/pacientes-form.component.spec.ts` (nuevo)
**Criterio de completitud:** El fichero existe, los tests de validación pasan, y se verifica que el formulario se rellena correctamente en modo edición.
**Dependencias:** T001-FE-03
- [ ] Completada

---

### T001-QA-04 — Checklist final de calidad `[XS]`
**Descripción:** Ejecutar los 3 comandos de verificación final y confirmar que todos pasan.
**Archivo(s) afectado(s):** ninguno (verificación)
**Criterio de completitud:**
- `npm test` → ✅ sin errores
- `npm run build` → ✅ sin errores TypeScript
- `npx prettier --check src/` → ✅ sin diferencias
**Dependencias:** T001-QA-01, T001-QA-02, T001-QA-03
- [ ] Completada
