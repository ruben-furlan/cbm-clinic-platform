# SPEC-001 — Gestión de Pacientes (Quality)

## Resumen

Definir la estrategia de tests para el módulo de pacientes: servicio Angular y componente principal.

## Cobertura objetivo

| Elemento | Tipo de test | Fichero |
|----------|-------------|---------|
| `PacientesService` | Unit test | `pacientes.service.spec.ts` |
| `PacientesPage` | Component test | `pacientes-page.spec.ts` |
| `PacientesFormComponent` | Component test | `pacientes-form.component.spec.ts` |

## Tests del servicio (`PacientesService`)

### Happy paths
- `getAll()` devuelve array de pacientes cuando Supabase responde con datos
- `getAll()` devuelve array vacío cuando no hay registros
- `create()` devuelve el paciente creado cuando Supabase inserta correctamente
- `update()` devuelve el paciente actualizado
- `updateEstado()` cambia solo el campo estado
- `delete()` resuelve sin error

### Casos de error
- `getAll()` lanza error cuando Supabase devuelve `{ error: {...} }`
- `create()` lanza error cuando Supabase devuelve `{ error: {...} }`
- `getById()` lanza error cuando el ID no existe

## Tests del componente (`PacientesPage`)

### Renderizado
- El componente se crea sin errores
- Muestra el spinner mientras `loading = true`
- Muestra mensaje de error cuando `error` tiene contenido
- Muestra la lista cuando hay pacientes

### Interacciones
- El botón "Nuevo paciente" abre el modal (sets `modalVisible = true`)
- `onGuardar()` llama a `PacientesService.create()` con los datos correctos

## Tests del formulario (`PacientesFormComponent`)

### Validación
- El formulario es inválido cuando `nombre` está vacío
- El formulario es inválido cuando `apellidos` está vacío
- El formulario es inválido cuando `telefono` está vacío
- El formulario es válido cuando los campos requeridos tienen valor

### Comportamiento
- En modo creación (paciente = null), el formulario empieza vacío
- En modo edición (paciente != null), el formulario se rellena con los datos del paciente

## Criterios de aceptación de quality

- [ ] `npm test` pasa sin errores
- [ ] Los 3 ficheros `.spec.ts` existen y tienen al menos los happy paths + casos de error
- [ ] `npm run build` limpio (0 errores TypeScript)
- [ ] Prettier aplicado a todos los ficheros nuevos
