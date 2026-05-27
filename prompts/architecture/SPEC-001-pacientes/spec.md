# SPEC-001 — Gestión de Pacientes (Architecture)

## Resumen

Crear el módulo de gestión de pacientes de la clínica: registro básico, listado en el panel admin y asociación con citas futuras.

## Problema que resuelve

Actualmente el sistema no tiene ningún registro de pacientes. Las citas entran como formularios de contacto sin persistencia estructurada. Se necesita una entidad `paciente` para poder gestionar el historial, asignar tratamientos y hacer seguimiento.

## Usuarios afectados

- **Admin**: crea, edita y consulta pacientes desde el panel de administración
- **Pacientes**: en el futuro podrían registrarse ellos mismos (fuera de scope de SPEC-001)

## Estructura de módulos a crear

### Nuevo feature
```
src/app/features/pacientes/
  pacientes-page.ts              → Página contenedora (ruta /admin/pacientes)
  pacientes-list.component.ts    → Tabla de pacientes con acciones
  pacientes-form.component.ts    → Modal de creación/edición
```

### Nuevo servicio
```
src/app/core/services/
  pacientes.service.ts           → CRUD de pacientes contra Supabase
```

### Ruta nueva
```typescript
// en app.routes.ts
{
  path: 'admin/pacientes',
  loadComponent: () => import('./features/pacientes/pacientes-page').then(m => m.PacientesPage),
  canActivate: [adminAuthGuard]
}
```

## Interfaces TypeScript

```typescript
export type PacienteEstado = 'activo' | 'inactivo' | 'archivado';

export interface Paciente {
  id: string;
  nombre: string;
  apellidos: string;
  email: string | null;
  telefono: string;
  fecha_nacimiento: string | null;    // ISO date string YYYY-MM-DD
  notas: string | null;
  estado: PacienteEstado;
  created_at: string;
  updated_at: string;
}
```

## Capas involucradas

- [x] architecture (este fichero)
- [x] database (tabla `pacientes` + RLS)
- [ ] backend (servicio Angular)
- [x] frontend (componentes admin)
- [x] quality (tests del servicio y componente)

> **Nota:** La capa `backend` en este proyecto equivale al servicio Angular + posibles RPCs. No hay servidor Node dedicado.

## Dependencias

- Requiere: ninguna
- Bloquea: SPEC-002 (historial de citas por paciente, si se implementa)

## Criterios de aceptación

1. El admin puede ver la lista de pacientes en `/admin/pacientes`
2. El admin puede crear un paciente nuevo con nombre, apellidos y teléfono (mínimo)
3. El admin puede editar los datos de un paciente
4. El admin puede cambiar el estado de un paciente (activo/inactivo/archivado)
5. La lista puede filtrarse por estado
6. El panel de admin muestra el módulo "Pacientes" en su menú de navegación

## Fuera de scope

- Portal de pacientes (auto-registro desde la web pública)
- Historial de tratamientos / sesiones
- Subida de documentos o informes
- Integración con sistema de citas
