# Plan — Frontend — SPEC-001-pacientes

## Decisiones de diseño visual

### ¿Tabla o tarjetas?

**Decisión: tabla** para la lista de pacientes en admin.

El admin ya usa tablas en todas sus secciones. Mantener consistencia visual. En mobile, la tabla scrollea horizontalmente.

### ¿Modal o página dedicada para el formulario?

**Decisión: modal** (igual que el resto del admin).

El patrón de modal ya está establecido en todo el admin dashboard. El formulario de pacientes no es tan complejo como para justificar una página dedicada en SPEC-001. Si en el futuro el formulario crece (añadir historial clínico), se puede migrar.

### ¿Filtros por estado como tabs o dropdown?

**Decisión: tabs** (igual que los filtros de eventos y tarifas).

Los tabs son más rápidos de usar en un panel admin que un dropdown.

## Diseño de `PacientesPage` (orquestador)

```typescript
export class PacientesPage implements OnInit {
  pacientes: Paciente[] = [];
  loading = false;
  error = '';
  modalVisible = false;
  pacienteEditando: Paciente | null = null;

  async ngOnInit() { await this.cargar(); }

  async cargar() { /* getAll() */ }
  abrirCrear() { this.pacienteEditando = null; this.modalVisible = true; }
  abrirEditar(p: Paciente) { this.pacienteEditando = p; this.modalVisible = true; }
  cerrarModal() { this.modalVisible = false; }
  async onGuardar(data: PacienteInput) { /* create o update */ }
  async onCambiarEstado(id: string, estado: PacienteEstado) { /* updateEstado */ }
  async onEliminar(p: Paciente) { /* confirmación + delete */ }
}
```

## Dependencias entre componentes

```
PacientesPage
  → PacientesListComponent (recibe data, emite eventos)
  → PacientesFormComponent (recibe paciente a editar, emite save/cancel)
  → CbmLoaderComponent (spinner)
  → CommonModule (@if, @for)
  → RouterLink (para botón "Volver al admin")
```

## CSS: diseño de la tabla

Seguir el patrón visual de las tablas del admin dashboard actual. Clases CSS:
```css
.pacientes-page { ... }
.pacientes-header { /* título + botón nuevo */ }
.pacientes-filtros { /* tabs de estado */ }
.pacientes-table { /* tabla responsive */ }
.pacientes-badge { /* chip de estado coloreado */ }
```

Colores de estado:
- `activo` → verde
- `inactivo` → amarillo/naranja
- `archivado` → gris
