# Tasks — Frontend — SPEC-002 — Pilates: horarios separados en tarifas

## Estado general
- [ ] En progreso

## Referencia
- **Spec:** `prompts/frontend/SPEC-002-pilates-horarios-tarifas/spec.md`
- **Plan:** `prompts/frontend/SPEC-002-pilates-horarios-tarifas/plan.md`
- **Branch:** `feature/SPEC-002-pilates-horarios-tarifas`

---

## Fase 0 — Prerequisitos (capa database)

> Estas tareas no son de implementación frontend. Se listan como coordinación obligatoria
> antes de iniciar la Fase 1. Requieren confirmación y ejecución en la capa `database`.

---

### T002-FE-PRE-01 — Confirmar existencia de columna `horarios` en Supabase

> ⚠️ REQUIERE CONFIRMACIÓN

**Descripción:** Verificar en el panel de Supabase (o vía CLI) que la columna `horarios text null` existe en la tabla `tarifas`. Esta tarea pertenece a la capa `database` y es prerequisito bloqueante para toda la Fase 1 en adelante.

**Archivo(s) afectado(s):** Supabase — tabla `tarifas` (sin archivos de código)

**Criterio de completitud:** La query `select horarios from tarifas limit 1;` ejecuta sin error en Supabase SQL Editor.

**Dependencias:** ninguna

- [x] Completada

---

### T002-FE-PRE-02 — Confirmar migración de datos ejecutada

> ⚠️ REQUIERE CONFIRMACIÓN

**Descripción:** Verificar que los datos de horarios han sido migrados desde `descripcion` al campo `horarios` en las tarifas de Pilates existentes, y que `descripcion` ha quedado limpio. Esta tarea pertenece a la capa `database`.

**Archivo(s) afectado(s):** Supabase — tabla `tarifas` (sin archivos de código)

**Criterio de completitud:** Al consultar las tarifas de categoría `pilates`, el campo `horarios` contiene los horarios y `descripcion` no contiene texto de horarios.

**Dependencias:** T002-FE-PRE-01

- [x] Completada

---

## Fase 1 — Modelo TypeScript

> Actualización de la interfaz `Tarifa`. Debe completarse antes de cualquier otra fase
> para evitar errores de compilación en los componentes consumidores.

---

### T002-FE-01 — Añadir campo `horarios` a la interfaz `Tarifa` `[XS]`

**Descripción:** En el archivo `tarifas.service.ts`, añadir el campo `horarios?: string | null` a la interfaz exportada `Tarifa`, después del campo `descripcion`. No modificar ningún método del servicio (las queries usan `select('*')` y ya incluirán el campo automáticamente).

**Archivo(s) afectado(s):** `src/app/core/services/tarifas.service.ts`

**Criterio de completitud:** La interfaz `Tarifa` exportada incluye el campo `horarios?: string | null`. El comando `npm run build` no produce errores relacionados con `Tarifa`.

**Dependencias:** T002-FE-PRE-01 (la columna debe existir en Supabase para que los datos lleguen)

- [x] Completada
  > Añadido `horarios?: string | null; // SPEC-002` en la interfaz `Tarifa` después de `descripcion`. `npm run build` finaliza sin errores TypeScript. Warnings CSS preexistentes, no relacionados con esta tarea. 2026-05-27.

---

## Fase 2 — Panel admin

> Actualización del formulario y template de administración. Depende de la Fase 1.
> Los pasos 02–05 afectan al mismo archivo TypeScript y deben ejecutarse juntos.

---

### T002-FE-02 — Añadir control `horarios` al `tarifaForm` en el admin `[XS]`

**Descripción:** En `admin-dashboard.component.ts`, dentro del constructor, añadir el control `horarios: ['']` al `fb.nonNullable.group({...})` del `tarifaForm`. El control va después del control `activo`. Sin validators (el campo es opcional).

**Archivo(s) afectado(s):** `src/app/admin/admin-dashboard.component.ts`

**Criterio de completitud:** `this.tarifaForm.controls.horarios` existe y tiene valor inicial `''` al crear una nueva tarifa.

**Dependencias:** T002-FE-01

- [x] Completada
  > `horarios: ['']` añadido al final del grupo en el constructor. 2026-05-27.

---

### T002-FE-03 — Añadir `horarios` al payload de `saveTarifa()` `[XS]`

**Descripción:** En `admin-dashboard.component.ts`, dentro del método `saveTarifa()`, en el objeto `payload`, añadir la normalización del campo `horarios`:
```
horarios: formValue.horarios.trim() ? formValue.horarios.trim() : null,
```
Esto convierte strings vacíos o solo espacios en `null`, igual que se hace con `descripcion`.

**Archivo(s) afectado(s):** `src/app/admin/admin-dashboard.component.ts`

**Criterio de completitud:** Al guardar una tarifa con el campo horarios vacío, el valor persistido en Supabase es `null`. Al guardarlo con texto, el valor persistido es el texto trimmeado.

**Dependencias:** T002-FE-02

- [x] Completada
  > `horarios: formValue.horarios.trim() ? formValue.horarios.trim() : null` añadido al payload en `saveTarifa()`, junto a la normalización de `descripcion`. 2026-05-27.

---

### T002-FE-04 — Añadir `horarios` al reset de `openEditModal()` `[XS]`

**Descripción:** En `admin-dashboard.component.ts`, en el método `openEditModal(tarifa: Tarifa)`, dentro del objeto pasado a `this.tarifaForm.reset({...})`, añadir:
```
horarios: tarifa.horarios ?? '',
```
Esto garantiza que al abrir una tarifa existente para editar, el textarea muestre el valor actual de `horarios` (o quede vacío si es null).

**Archivo(s) afectado(s):** `src/app/admin/admin-dashboard.component.ts`

**Criterio de completitud:** Al abrir el modal de edición de una tarifa con `horarios` informado, el textarea "Horarios (opcional)" muestra ese valor. Al abrir una tarifa sin `horarios`, el textarea aparece vacío.

**Dependencias:** T002-FE-02

- [x] Completada
  > `horarios: tarifa.horarios ?? ''` añadido en `openEditModal()`. 2026-05-27.

---

### T002-FE-05 — Añadir `horarios` al reset post-guardado en `saveTarifa()` `[XS]`

**Descripción:** En `admin-dashboard.component.ts`, en el método `saveTarifa()`, localizar el `this.tarifaForm.reset({...})` que se ejecuta tras guardar exitosamente (al final del bloque `try`). Añadir `horarios: ''` al objeto de reset, para que el formulario vuelva al estado inicial limpio.

**Archivo(s) afectado(s):** `src/app/admin/admin-dashboard.component.ts`

**Criterio de completitud:** Tras guardar una tarifa con horarios, si se abre el modal de "Nueva tarifa", el campo horarios aparece vacío.

**Dependencias:** T002-FE-02

- [x] Completada
  > `horarios: ''` añadido en el reset post-guardado de `saveTarifa()` y también en `openCreateModal()` por consistencia (ver log). 2026-05-27.

---

### T002-FE-06 — Añadir textarea `Horarios (opcional)` al modal del admin `[XS]`

**Descripción:** En `admin-dashboard.component.html`, dentro del modal de tarifa (`<!-- ═══════════════ Modal tarifas ════════════════ -->`), añadir el siguiente bloque **después del `<label>` de Descripción y antes de `<div class="grid-two">` de Precio/Unidad**:

```html
<label>
  Horarios (opcional)
  <textarea rows="4" formControlName="horarios"></textarea>
</label>
```

El campo es siempre visible (sin `*ngIf` por categoría).

**Archivo(s) afectado(s):** `src/app/admin/admin-dashboard.component.html`

**Criterio de completitud:** El modal de tarifa (tanto de creación como de edición) muestra el campo "Horarios (opcional)" como textarea entre la Descripción y el Precio. El campo está vinculado correctamente al formulario (`formControlName="horarios"`).

**Dependencias:** T002-FE-02, T002-FE-03, T002-FE-04, T002-FE-05

- [x] Completada
  > Textarea con label "Horarios (opcional)" y `formControlName="horarios"` añadido en el modal, después de Descripción y antes del bloque grid-two de Precio/Unidad. 2026-05-27.

---

## Fase 3 — Sección pública de tarifas (`PricingComponent`)

> Actualización del componente renderizado en la home (sección `#tarifas`).
> Depende de la Fase 1.

---

### T002-FE-07 — Añadir método `hasHorarios()` en `PricingComponent` `[XS]`

**Descripción:** En `pricing.component.ts`, añadir el siguiente método público en la clase `PricingComponent`:

```typescript
hasHorarios(tarifa: Tarifa): boolean {
  return !!(tarifa.horarios?.trim());
}
```

El método encapsula la lógica de visibilidad del bloque horarios, evitando expresiones complejas en el template (según constraints de la capa frontend).

**Archivo(s) afectado(s):** `src/app/sections/pricing/pricing.component.ts`

**Criterio de completitud:** El método `hasHorarios` existe en la clase. Retorna `true` para una tarifa con `horarios: 'texto'`, `false` para `horarios: null`, y `false` para `horarios: '   '` (solo espacios).

**Dependencias:** T002-FE-01

- [x] Completada
  > Método `hasHorarios(tarifa: Tarifa): boolean` añadido al final de la clase, después de `formatFechaFin()`. 2026-05-27.

---

### T002-FE-08 — Añadir bloque de horarios en `pricing.component.html` `[S]`

**Descripción:** En `pricing.component.html`, dentro del bloque `.tarifa-izquierda`, añadir el siguiente bloque **después de toda la lógica de renderizado de `descripcion`** (bloques `tarifa-desc-corta`, `tarifa-desc-truncada`, `tarifa-desc-completa`) y **antes del badge `tarifa-badge` de `fecha_fin_promo`**:

```html
<div class="tarifa-horarios" *ngIf="hasHorarios(tarifa)">
  <span class="tarifa-horarios__label">Horarios disponibles</span>
  <p class="tarifa-horarios__texto">{{ tarifa.horarios }}</p>
</div>
```

Usar `*ngIf` (sintaxis legacy) para mantener consistencia con el resto del template. No usar `@if`.

**Archivo(s) afectado(s):** `src/app/sections/pricing/pricing.component.html`

**Criterio de completitud:** En la pestaña Pilates de la sección de tarifas de la home, las tarifas con `horarios` muestran un bloque con el label "Horarios disponibles" y el texto del campo. Las tarifas sin `horarios` no muestran ese bloque. Las tarifas de otras categorías no muestran el bloque si no tienen `horarios`.

**Dependencias:** T002-FE-07

- [x] Completada
  > Bloque `<div class="tarifa-horarios" *ngIf="hasHorarios(tarifa)">` insertado después de los bloques de descripción y antes del badge de `fecha_fin_promo`. 2026-05-27.

---

### T002-FE-09 — Añadir estilos `.tarifa-horarios` en `pricing.component.css` `[XS]`

**Descripción:** En `pricing.component.css`, añadir al final del archivo los siguientes estilos:

```css
/* ── Horarios disponibles (SPEC-002) ────────────────────── */

.tarifa-horarios {
  margin-top: 8px;
}

.tarifa-horarios__label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.tarifa-horarios__texto {
  margin: 0;
  font-size: 13px;
  color: var(--color-text);
  white-space: pre-line;
  line-height: 1.5;
}
```

Usar CSS custom properties (`--color-primary`, `--color-text`). No usar valores hex hardcodeados.

**Archivo(s) afectado(s):** `src/app/sections/pricing/pricing.component.css`

**Criterio de completitud:** El bloque de horarios se renderiza con el label en color primario del proyecto y el texto del horario respeta los saltos de línea (`white-space: pre-line`). No hay valores hexadecimales hardcodeados en las nuevas reglas.

**Dependencias:** T002-FE-08

- [x] Completada
  > Clases `.tarifa-horarios`, `.tarifa-horarios__label` y `.tarifa-horarios__texto` añadidas al final del archivo, fuera del bloque `@media`. Usa `var(--color-primary)` y `var(--color-text)`. 2026-05-27.

---

## Fase 4 — Stepper de solicitar cita (`BookingFormComponent`)

> Actualización del stepper. Depende de la Fase 1.

---

### T002-FE-10 — Añadir `horarios` a la interfaz `TreatmentOption` y al método `toTreatmentOption()` `[XS]`

**Descripción:** En `booking-form.ts`:

1. En la interfaz interna `TreatmentOption`, añadir el campo después de `descripcion`:
   ```typescript
   horarios?: string | null;
   ```

2. En el método privado `toTreatmentOption(tarifa: Tarifa)`, dentro del objeto retornado, añadir después de `descripcion`:
   ```typescript
   horarios: tarifa.horarios,
   ```

**Archivo(s) afectado(s):** `src/app/features/booking-form/booking-form.ts`

**Criterio de completitud:** La interfaz `TreatmentOption` incluye `horarios?: string | null`. El método `toTreatmentOption()` propaga el valor de `tarifa.horarios`. No hay errores TypeScript en el archivo.

**Dependencias:** T002-FE-01

- [x] Completada
  > `horarios?: string | null` añadido a `TreatmentOption`. `horarios: tarifa.horarios` propagado en `toTreatmentOption()`. 2026-05-27.

---

### T002-FE-11 — Añadir bloque de horarios en el step 1 de `booking-form.html` `[S]`

**Descripción:** En `booking-form.html`, dentro del `<button class="treatment-card">` del step 1, añadir el siguiente bloque **después de la línea de `option.descripcion`** y **antes de la línea de `option.showBadge`**:

```html
<p *ngIf="option.horarios?.trim()" class="treatment-card-horarios">
  {{ option.horarios }}
</p>
```

La condición inline `option.horarios?.trim()` es aceptable porque `TreatmentOption` es una interfaz plana (no clase) y la verificación es simple.

**Archivo(s) afectado(s):** `src/app/features/booking-form/booking-form.html`

**Criterio de completitud:** En el step 1 del stepper, las tarjetas de tratamiento de tipo Pilates (con `horarios` informado) muestran el texto de horarios debajo de la descripción. Las tarjetas sin `horarios` o con `horarios` vacío no muestran ningún bloque adicional.

**Dependencias:** T002-FE-10

- [x] Completada
  > `<p *ngIf="option.horarios?.trim()" class="treatment-card-horarios">{{ option.horarios }}</p>` insertado entre la línea de `option.descripcion` y la de `option.showBadge`. 2026-05-27.

---

### T002-FE-12 — Añadir estilo `.treatment-card-horarios` en `booking-form.css` `[XS]`

**Descripción:** En `booking-form.css`, añadir después de la clase `.treatment-card-desc` (línea ~280) el siguiente estilo:

```css
.treatment-card-horarios {
  margin: 5px 0 0;
  color: #7a728a;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-line;
}
```

El color `#7a728a` es consistente con `.treatment-card-desc` existente en el mismo archivo.

**Archivo(s) afectado(s):** `src/app/features/booking-form/booking-form.css`

**Criterio de completitud:** El bloque de horarios en el stepper se renderiza con el mismo tamaño y color que la descripción, respetando saltos de línea (`white-space: pre-line`).

**Dependencias:** T002-FE-11

- [x] Completada
  > `.treatment-card-horarios` añadido inmediatamente después de `.treatment-card-desc`, con `white-space: pre-line`. Color `#7a728a` consistente con `.treatment-card-desc`. 2026-05-27.

---

## Fase 5 — Verificación manual

> Comprobaciones manuales previas al merge. No requieren escribir código.

---

### T002-FE-13 — Verificar build TypeScript sin errores `[XS]`

**Descripción:** Ejecutar `npm run build` en la raíz del proyecto y confirmar que la compilación termina sin errores TypeScript ni errores de template (`strictTemplates`).

**Archivo(s) afectado(s):** N/A (verificación global)

**Criterio de completitud:** `npm run build` finaliza con código de salida 0. Sin errores de tipo `TS...` ni errores de template en la salida.

**Dependencias:** T002-FE-12 (todas las fases anteriores completas)

- [x] Completada
  > `npm run build` finalizado sin errores TypeScript ni de template. Código de salida 0. 2026-05-27.

---

### T002-FE-14 — Verificar renderizado de horarios en la sección pública de tarifas (home) `[S]`

**Descripción:** Arrancar el servidor de desarrollo (`npm start`) y navegar a `http://localhost:4200/#tarifas`. Comprobar:
- Pestaña **Pilates**: las tarifas con `horarios` muestran el bloque "Horarios disponibles" con el texto correcto y saltos de línea preservados.
- Pestaña **Pilates**: las tarifas sin `horarios` (null o vacío) **no** muestran ningún bloque de horarios.
- Pestaña **Fisioterapia** y **Bienestar**: ninguna tarifa muestra el bloque de horarios (salvo que alguna tenga `horarios` informado).

**Archivo(s) afectado(s):** N/A (verificación en navegador)

**Criterio de completitud:** Los tres puntos anteriores se cumplen visualmente en el navegador.

**Dependencias:** T002-FE-09, T002-FE-PRE-02

- [ ] Completada

---

### T002-FE-15 — Verificar renderizado de horarios en el stepper de solicitar cita `[S]`

**Descripción:** Navegar a `http://localhost:4200/solicitar-cita`. En el step 1, comprobar:
- Las tarjetas de tratamiento de tipo **Pilates** con `horarios` muestran el texto de horarios debajo de la descripción.
- Las tarjetas sin `horarios` no muestran texto adicional.
- El texto de horarios respeta saltos de línea.
- El layout de la tarjeta no queda roto en mobile (viewport < 480px).

**Archivo(s) afectado(s):** N/A (verificación en navegador)

**Criterio de completitud:** Los cuatro puntos anteriores se cumplen en desktop y mobile.

**Dependencias:** T002-FE-12, T002-FE-PRE-02

- [ ] Completada

---

### T002-FE-16 — Verificar edición de horarios desde el panel admin `[S]`

**Descripción:** Navegar a `/admin`. En la sección Tarifas, comprobar:
- Al hacer clic en **Editar** en una tarifa de Pilates con `horarios`, el modal muestra el campo "Horarios (opcional)" con el valor actual.
- Al editar el texto y guardar, el valor se actualiza correctamente en Supabase (verificar en el panel de Supabase o recargando el admin).
- Al borrar el texto del campo y guardar, el campo `horarios` queda como `null` en Supabase (no string vacío).
- Al hacer clic en **Nueva tarifa**, el campo "Horarios (opcional)" aparece vacío.
- Al abrir una tarifa de categoría Fisioterapia, el campo "Horarios (opcional)" también aparece (campo visible para todas las categorías).

**Archivo(s) afectado(s):** N/A (verificación en navegador + Supabase)

**Criterio de completitud:** Los cinco puntos anteriores se cumplen correctamente.

**Dependencias:** T002-FE-06

- [ ] Completada

---

### T002-FE-17 — Verificar comportamiento con `horarios` null o vacío en todos los puntos de renderizado `[XS]`

**Descripción:** Crear o editar una tarifa de Pilates dejando el campo "Horarios (opcional)" vacío. Verificar en:
1. La sección `#tarifas` de la home — **no** debe aparecer ningún bloque de horarios para esa tarifa.
2. El step 1 del stepper (`/solicitar-cita`) — **no** debe aparecer texto de horarios en la tarjeta de esa tarifa.

**Archivo(s) afectado(s):** N/A (verificación en navegador)

**Criterio de completitud:** En ambos puntos de renderizado, la tarifa con `horarios = null` no muestra ningún bloque ni texto de horarios. La ausencia es limpia (sin espacios vacíos ni etiquetas huérfanas).

**Dependencias:** T002-FE-14, T002-FE-15, T002-FE-16

- [ ] Completada
