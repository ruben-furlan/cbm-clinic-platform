# Guidelines — Frontend Layer

## Estructura mínima de un componente

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-{nombre}',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './{nombre}.component.html',
  styleUrl: './{nombre}.component.css'
})
export class {Nombre}Component {
  // ...
}
```

## Formularios (Reactive Forms)

```typescript
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

readonly form = this.fb.nonNullable.group({
  campo: ['', Validators.required],
  precio: [0, [Validators.required, Validators.min(0)]]
});
```

- Usar `fb.nonNullable.group()` — evita nulls en los valores del form
- Marcar con `markAllAsTouched()` antes de mostrar errores de validación
- El template accede a los controles via `form.controls.campo`

## Gestión de estado en componentes

Patrón estándar para carga de datos:
```typescript
loading = false;
error = '';
items: Item[] = [];

async loadItems(): Promise<void> {
  this.loading = true;
  this.error = '';
  try {
    this.items = await this.itemService.getAll();
  } catch {
    this.error = 'No se pudieron cargar los datos.';
  } finally {
    this.loading = false;
  }
}
```

## Template: estado de carga

```html
@if (loading) {
  <app-cbm-loader />
} @else if (error) {
  <p class="error">{{ error }}</p>
} @else {
  <!-- contenido -->
}
```

## Template: lista con acciones

```html
@for (item of items; track item.id) {
  <div class="item-row">
    <span>{{ item.nombre }}</span>
    <button (click)="onEdit(item)">Editar</button>
    <button (click)="onDelete(item)">Eliminar</button>
  </div>
}
```

## Accesibilidad básica

- Botones con texto descriptivo o `aria-label`
- Inputs con `<label>` asociado via `for`/`id`
- Imágenes con `alt`
- Modales con `role="dialog"` y `aria-modal="true"`

## Animaciones

Usar la directiva `appRevealOnScroll` para animaciones de entrada:
```html
<section appRevealOnScroll>
  <!-- contenido -->
</section>
```

## CSS: convenciones

- BEM ligero: `.pacientes-list`, `.pacientes-list__item`, `.pacientes-list__item--activo`
- Variables CSS del proyecto para colores, no valores hardcodeados
- Mobile-first con media queries para breakpoints mayores
- Sin `!important` salvo casos excepcionales documentados
