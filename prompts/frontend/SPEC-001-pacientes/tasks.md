# Tasks — Frontend — SPEC-001-pacientes

## Estado general
- [ ] En progreso

## Tareas

### T001-FE-01 — Crear `PacientesPage` (componente orquestador) `[M]`
**Descripción:** Crear `src/app/features/pacientes/pacientes-page.ts` con la lógica de carga de datos, gestión del modal y manejo de acciones. Incluye template HTML y CSS básico.
**Archivo(s) afectado(s):**
- `src/app/features/pacientes/pacientes-page.ts`
- `src/app/features/pacientes/pacientes-page.html`
- `src/app/features/pacientes/pacientes-page.css`
**Criterio de completitud:** El componente compila, carga pacientes en `ngOnInit` y muestra el estado de carga/error/vacío correctamente.
**Dependencias:** T001-BE-01, T001-ARCH-03
- [ ] Completada

---

### T001-FE-02 — Crear `PacientesListComponent` `[M]`
**Descripción:** Componente de tabla con `@Input()` para recibir pacientes, tabs de filtro por estado, y `@Output()` para editar/cambiar estado/eliminar.
**Archivo(s) afectado(s):**
- `src/app/features/pacientes/pacientes-list.component.ts`
- `src/app/features/pacientes/pacientes-list.component.html`
- `src/app/features/pacientes/pacientes-list.component.css`
**Criterio de completitud:** La tabla renderiza correctamente, los filtros funcionan (filtrado local), y los botones de acción emiten los outputs correctos.
**Dependencias:** T001-FE-01
- [ ] Completada

---

### T001-FE-03 — Crear `PacientesFormComponent` (modal) `[M]`
**Descripción:** Modal con formulario Reactive Forms para crear y editar pacientes. Se rellena con los datos del paciente si es edición, o vacío si es creación.
**Archivo(s) afectado(s):**
- `src/app/features/pacientes/pacientes-form.component.ts`
- `src/app/features/pacientes/pacientes-form.component.html`
- `src/app/features/pacientes/pacientes-form.component.css`
**Criterio de completitud:** El formulario valida campos requeridos, se rellena correctamente en modo edición, y emite `onSave` con los datos del form o `onCancel` al cerrar.
**Dependencias:** T001-FE-01
- [ ] Completada

---

### T001-FE-04 — Verificar flujo completo en local `[S]`
**Descripción:** Probar manualmente en `npm start`: crear paciente, editar, cambiar estado, archivar y eliminar. Verificar que la lista se actualiza optimistamente.
**Archivo(s) afectado(s):** ninguno (verificación manual)
**Criterio de completitud:** Todos los flujos funcionan sin errores en consola. La UI da feedback correcto (mensajes de éxito/error).
**Dependencias:** T001-FE-01, T001-FE-02, T001-FE-03
- [ ] Completada
