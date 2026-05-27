# Tasks — Architecture — SPEC-001-pacientes

## Estado general
- [ ] En progreso

## Tareas

### T001-ARCH-01 — Definir interfaces TypeScript de Paciente `[XS]`
**Descripción:** Crear las interfaces y tipos exportados que usará el servicio y los componentes.
**Archivo(s) afectado(s):** `src/app/core/services/pacientes.service.ts` (se crea en capa backend, pero las interfaces se definen aquí primero en `spec.md`)
**Criterio de completitud:** Las interfaces `Paciente` y `PacienteEstado` están definidas y exportadas en el servicio.
**Dependencias:** ninguna
- [ ] Completada

---

### T001-ARCH-02 — Crear estructura de carpetas del feature `[XS]`
**Descripción:** Crear la carpeta `src/app/features/pacientes/` con los ficheros vacíos/esqueleto.
**Archivo(s) afectado(s):** `src/app/features/pacientes/` (directorio nuevo)
**Criterio de completitud:** La carpeta existe con los 7 ficheros del feature (page + list + form, cada uno con .ts/.html/.css).
**Dependencias:** ninguna
- [ ] Completada

---

### T001-ARCH-03 — Registrar ruta `/admin/pacientes` en el router `[XS]`
**Descripción:** Añadir la ruta con lazy loading y guard de autenticación en `app.routes.ts`.
**Archivo(s) afectado(s):** `src/app/app.routes.ts`
**Criterio de completitud:** La ruta existe, usa `loadComponent`, tiene `canActivate: [adminAuthGuard]` y `ng build` no da errores.
**Dependencias:** T001-ARCH-02
- [ ] Completada

---

### T001-ARCH-04 — Añadir enlace "Pacientes" al menú del admin `[XS]`
**Descripción:** Añadir un enlace de navegación al módulo de pacientes en el template del admin dashboard.
**Archivo(s) afectado(s):** `src/app/admin/admin-dashboard.component.html`
**Criterio de completitud:** El menú del admin muestra "Pacientes" y el enlace navega a `/admin/pacientes`.
**Dependencias:** T001-ARCH-03
- [ ] Completada
