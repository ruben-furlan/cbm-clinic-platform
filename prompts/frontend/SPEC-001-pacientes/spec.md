# SPEC-001 — Gestión de Pacientes (Frontend)

## Resumen

Crear los componentes Angular del módulo de pacientes para el panel admin: página contenedora, lista con filtros y modal de creación/edición.

## Componentes a crear

### 1. `PacientesPage`
- **Ruta**: `/admin/pacientes` (protegida por `adminAuthGuard`)
- **Responsabilidad**: orquestar la carga de datos y coordinar lista + formulario
- **Estado que gestiona**: `pacientes[]`, `loading`, `error`, `modalVisible`, `pacienteEditando`

### 2. `PacientesListComponent`
- **Responsabilidad**: mostrar la tabla de pacientes con filtro por estado y acciones
- **Inputs**: `@Input() pacientes: Paciente[]`, `@Input() loading: boolean`
- **Outputs**: `@Output() onEdit`, `@Output() onChangeEstado`, `@Output() onCreate`
- **UI**: tabla con columnas nombre+apellidos, teléfono, email, estado, fecha registro, acciones

### 3. `PacientesFormComponent`
- **Responsabilidad**: formulario de creación/edición en modal
- **Inputs**: `@Input() paciente: Paciente | null`, `@Input() visible: boolean`
- **Outputs**: `@Output() onSave: EventEmitter<PacienteInput>`, `@Output() onCancel`
- **Campos**: nombre*, apellidos*, teléfono*, email, fecha_nacimiento, notas, estado

## Formulario (Reactive Forms)

```typescript
form = fb.nonNullable.group({
  nombre:           ['', Validators.required],
  apellidos:        ['', Validators.required],
  telefono:         ['', Validators.required],
  email:            [''],
  fecha_nacimiento: [''],
  notas:            [''],
  estado:           ['activo' as PacienteEstado, Validators.required]
});
```

## Filtro de estado en la lista

Tabs de filtro: **Todos | Activos | Inactivos | Archivados**

El filtrado es local (no hace nueva query): `pacientesFiltrados` como getter computed.

## Estados de UI

- **Cargando**: spinner `<app-cbm-loader />`
- **Sin datos**: mensaje "No hay pacientes registrados todavía"
- **Error**: mensaje de error con botón "Reintentar"
- **Modal abierto**: overlay oscuro, formulario centrado

## Acciones por paciente

| Acción | Condición | Efecto |
|--------|-----------|--------|
| Editar | siempre | Abre modal con datos del paciente |
| Archivar | estado = activo o inactivo | Cambia estado a 'archivado' con confirmación |
| Activar | estado = inactivo o archivado | Cambia estado a 'activo' |
| Eliminar | estado = archivado | Borrado físico con confirmación |
