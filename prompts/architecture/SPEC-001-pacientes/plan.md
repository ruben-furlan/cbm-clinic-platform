# Plan — Architecture — SPEC-001-pacientes

## Decisiones de diseño

### ¿Feature independiente o añadir al AdminDashboard existente?

**Decisión: feature independiente en `/admin/pacientes`**

El `AdminDashboardComponent` ya tiene ~1800 líneas. Añadir pacientes allí lo haría inmanejable. El patrón correcto para nuevas secciones admin de cierta complejidad es crear una página dedicada con lazy loading.

**Consecuencia**: habrá que añadir un enlace en el menú del admin dashboard hacia `/admin/pacientes`.

### ¿Componente único o separar lista y formulario?

**Decisión: separar en `PacientesListComponent` + `PacientesFormComponent`**

El formulario de pacientes se abrirá como modal dentro de la página. Separar los componentes facilita testearlos de forma independiente y siguiendo el patrón que ya usa el proyecto (ver `event-registration-modal/`).

### ¿Dónde vive el estado de la lista?

**Decisión: en `PacientesPage` (componente orquestador)**

`PacientesPage` carga los datos y los pasa a `PacientesListComponent` via `@Input()`. El formulario emite eventos `@Output()` cuando guarda o cancela.

## Diagrama de estructura

```
PacientesPage (orquestador, estado)
  ├── PacientesListComponent
  │     @Input() pacientes: Paciente[]
  │     @Input() loading: boolean
  │     @Output() onEdit: EventEmitter<Paciente>
  │     @Output() onDelete: EventEmitter<Paciente>
  │     @Output() onToggleEstado: EventEmitter<{id, estado}>
  │
  └── PacientesFormComponent (modal)
        @Input() paciente: Paciente | null  (null = crear, objeto = editar)
        @Input() visible: boolean
        @Output() onSave: EventEmitter<Paciente>
        @Output() onCancel: EventEmitter<void>
```

## Mapa de ficheros a crear

| Fichero | Acción |
|---------|--------|
| `src/app/features/pacientes/pacientes-page.ts` | Crear |
| `src/app/features/pacientes/pacientes-list.component.ts` | Crear |
| `src/app/features/pacientes/pacientes-list.component.html` | Crear |
| `src/app/features/pacientes/pacientes-list.component.css` | Crear |
| `src/app/features/pacientes/pacientes-form.component.ts` | Crear |
| `src/app/features/pacientes/pacientes-form.component.html` | Crear |
| `src/app/features/pacientes/pacientes-form.component.css` | Crear |
| `src/app/core/services/pacientes.service.ts` | Crear |
| `src/app/app.routes.ts` | Modificar (añadir ruta) |
| `src/app/admin/admin-dashboard.component.html` | Modificar (añadir enlace nav) |

## Riesgos arquitectónicos

- **Ninguno crítico** — la estructura es estándar y no hay conflictos con lo existente
- El enlace en `AdminDashboardComponent` requiere modificar un fichero existente (controlado)
