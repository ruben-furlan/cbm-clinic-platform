# Plan Frontend — SPEC-002 — Pilates: horarios separados en tarifas

## Referencia

| Campo | Valor |
|-------|-------|
| Spec | `prompts/frontend/SPEC-002-pilates-horarios-tarifas/spec.md` |
| Branch | `feature/SPEC-002-pilates-horarios-tarifas` |
| Fecha del plan | 2026-05-27 |
| Capa previa requerida | `database` — columna `horarios text null` debe existir en Supabase antes de activar frontend |

---

## 1. Análisis del estado actual

### Archivos identificados en el proyecto

| Archivo | Rol en esta SPEC |
|---------|-----------------|
| `src/app/core/services/tarifas.service.ts` | Define la interfaz `Tarifa` y todas las operaciones CRUD. Consumidor de Supabase. |
| `src/app/admin/admin-dashboard.component.ts` | Panel admin. Contiene `tarifaForm` (Reactive Form) con campos de tarifa. Métodos `openEditModal`, `saveTarifa`, reset post-guardado. |
| `src/app/admin/admin-dashboard.component.html` | Template del panel admin. Modal de edición de tarifa con campos actuales: Categoría, Nombre, Descripción, Precio, Unidad, Orden, Fecha fin promo, Activo. |
| `src/app/sections/pricing/pricing.component.ts` | Sección pública de tarifas (renderizada en la home). Usa getter `tarifasFiltradas`. Contiene `expandidos`, `hasHorarios` pendiente de añadir. |
| `src/app/sections/pricing/pricing.component.html` | Template de la sección de tarifas pública. Usa `*ngIf` y `*ngFor` (sintaxis legacy NgIf). Muestra descripción con lógica de truncado. |
| `src/app/sections/pricing/pricing.component.css` | Estilos scoped de la sección de tarifas. Clases actuales: `.tarifa-fila`, `.tarifa-cabecera`, `.tarifa-izquierda`, `.tarifa-desc-corta`, etc. |
| `src/app/features/booking-form/booking-form.ts` | Stepper de solicitar cita. Interfaz interna `TreatmentOption` (contiene `descripcion?: string | null`). Método `toTreatmentOption()` mapea desde `Tarifa`. |
| `src/app/features/booking-form/booking-form.html` | Template del stepper. Step 1 muestra tarjetas de tratamiento con `option.descripcion` en línea 117. Usa `*ngIf` y `*ngFor`. |
| `src/app/features/booking-form/booking-form.css` | Estilos del stepper. Clase `.treatment-card-desc` (font-size 12px, color #7a728a, line-height 1.4). Referencia para nuevo bloque horarios. |

### Observaciones críticas del análisis

1. **No existe la ruta `/tarifas`**. El routing (`app.routes.ts`) no registra esta ruta. Las tarifas públicas se muestran en `PricingComponent`, incluido en `home-page.html` como `<app-pricing>`. El ancla `#tarifas` del DOM corresponde al `id="tarifas"` del elemento `<section>` del componente.

2. **`select('*')` en todas las queries del servicio**. Las queries de `getTarifas`, `getTarifasByCategoria` y `getTarifasAdmin` usan `select('*')`. El campo `horarios` llegará automáticamente desde Supabase una vez añadida la columna en la base de datos — **sin modificar ninguna query**.

3. **`updateTarifa` acepta `Partial<Omit<Tarifa, 'id'>>`**. No necesita cambios en su firma para soportar `horarios`; solo requiere que `horarios` esté tipado en la interfaz.

4. **El `DisplayComponent` (kiosko) no usa `TarifasService`**. No está en el alcance de esta SPEC.

5. **Sintaxis de templates**: `PricingComponent` y `BookingFormComponent` usan la sintaxis `*ngIf` / `*ngFor` legacy (NgIf/NgFor de `CommonModule`). Se mantiene esta sintaxis en todos los cambios de esta SPEC para conservar consistencia interna.

6. **`tarifaForm` usa `fb.nonNullable.group()`**. Los controles siempre retornan `string` (nunca `undefined`). El control `horarios` debe normalizarse a `null` en el payload si está vacío, igual que `descripcion`.

7. **`openEditModal` y el reset post-guardado** deben inicializar `horarios` explícitamente para que no quede `undefined` en el formulario entre ediciones.

---

## 2. Archivos candidatos a modificar

| # | Archivo | Tipo de cambio | Req. trazado |
|---|---------|---------------|-------------|
| 1 | `src/app/core/services/tarifas.service.ts` | Modificar — añadir `horarios` a interfaz `Tarifa` | RF-2, RT-2 |
| 2 | `src/app/admin/admin-dashboard.component.ts` | Modificar — control `horarios` en form, `openEditModal`, payload `saveTarifa`, reset | RF-4, RF-5, RF-6, RT-4 |
| 3 | `src/app/admin/admin-dashboard.component.html` | Modificar — textarea `Horarios (opcional)` en modal | RF-4, RF-5, RF-6 |
| 4 | `src/app/sections/pricing/pricing.component.ts` | Modificar — getter `hasHorarios(tarifa: Tarifa): boolean` | RF-8, RF-9, RT-5, RT-6 |
| 5 | `src/app/sections/pricing/pricing.component.html` | Modificar — bloque condicional `.tarifa-horarios` | RF-8, RF-9, RF-11, RF-12 |
| 6 | `src/app/sections/pricing/pricing.component.css` | Modificar — estilos `.tarifa-horarios` y `.tarifa-horarios__texto` | RF-8 |
| 7 | `src/app/features/booking-form/booking-form.ts` | Modificar — añadir `horarios?` a `TreatmentOption`, mapeo en `toTreatmentOption()` | RF-10, RF-13, RT-3 |
| 8 | `src/app/features/booking-form/booking-form.html` | Modificar — bloque horarios en tarjeta del step 1 | RF-8, RF-9, RF-13 |

No se crean archivos nuevos. No se modifican rutas.

---

## 3. Estrategia de implementación

### Orden de ejecución

El orden garantiza que el compilador TypeScript no encuentre referencias rotas entre pasos:

```
Paso 1 — tarifas.service.ts
  └─ Añadir horarios a la interfaz Tarifa
  └─ Sin cambios en queries ni en firmas de métodos

Paso 2 — admin-dashboard.component.ts
  └─ Añadir control horarios: [''] al tarifaForm
  └─ Añadir horarios al payload de saveTarifa (con normalización a null)
  └─ Añadir horarios al reset de openEditModal y al reset post-guardado

Paso 3 — admin-dashboard.component.html
  └─ Añadir <textarea formControlName="horarios"> con label "Horarios (opcional)"
  └─ Posición: después del campo Descripción, antes de la grid Precio/Unidad

Paso 4 — pricing.component.ts
  └─ Añadir getter hasHorarios(tarifa: Tarifa): boolean

Paso 5 — pricing.component.html
  └─ Añadir bloque .tarifa-horarios con *ngIf="hasHorarios(tarifa)"

Paso 6 — pricing.component.css
  └─ Añadir reglas para .tarifa-horarios y .tarifa-horarios__texto

Paso 7 — booking-form.ts
  └─ Añadir horarios?: string | null a TreatmentOption
  └─ Mapear tarifa.horarios en toTreatmentOption()

Paso 8 — booking-form.html
  └─ Añadir bloque horarios en la tarjeta del step 1
```

### Detalle por componente

#### Paso 1 — `tarifas.service.ts`

Añadir en la interfaz `Tarifa`:

```
horarios?: string | null;
```

No se modifica `getTarifas`, `getTarifasByCategoria`, `getTarifasAdmin` (ya usan `select('*')`).
No se modifica `updateTarifa` (acepta `Partial<Omit<Tarifa, 'id'>>`).

---

#### Paso 2 — `admin-dashboard.component.ts`

**En el constructor, dentro de `fb.nonNullable.group({})`:**

Añadir al final de los controles existentes (después de `activo`):
```
horarios: ['']
```

**En `openEditModal(tarifa: Tarifa)`**, en el objeto de `tarifaForm.reset({...})`:
```
horarios: tarifa.horarios ?? '',
```

**En `saveTarifa()`**, en el objeto `payload`, añadir la normalización:
```
horarios: formValue.horarios.trim() ? formValue.horarios.trim() : null,
```

**En el reset post-guardado** (dentro del bloque `try` al final de `saveTarifa`),
dentro de `this.tarifaForm.reset({...})`:
```
horarios: '',
```

---

#### Paso 3 — `admin-dashboard.component.html`

En el modal de tarifa (`<!-- ═══════════════ Modal tarifas ════════════════ -->`),
después del bloque `<label> Descripción ... </label>` y antes de `<div class="grid-two">`,
añadir:

```html
<label>
  Horarios (opcional)
  <textarea rows="4" formControlName="horarios"></textarea>
</label>
```

Sin validación de required. Sin condición `*ngIf` (visible siempre, para todas las categorías).

---

#### Paso 4 — `pricing.component.ts`

Añadir en la clase `PricingComponent`:

```typescript
hasHorarios(tarifa: Tarifa): boolean {
  return !!(tarifa.horarios?.trim());
}
```

Se implementa como método (no getter propiedad) porque recibe un argumento. Es una lógica
de una línea, cumple la restricción de "no lógica compleja en el template".

---

#### Paso 5 — `pricing.component.html`

Dentro del bloque `.tarifa-izquierda`, **después** de toda la lógica de `descripcion` y
**antes** del badge `fecha_fin_promo`, añadir:

```html
<div class="tarifa-horarios" *ngIf="hasHorarios(tarifa)">
  <span class="tarifa-horarios__label">Horarios disponibles</span>
  <p class="tarifa-horarios__texto">{{ tarifa.horarios }}</p>
</div>
```

Se usa `*ngIf` para mantener consistencia con el resto del componente (no `@if`).

---

#### Paso 6 — `pricing.component.css`

Añadir al final del archivo:

```css
/* ── Horarios disponibles ──────────────────────────────── */

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

`white-space: pre-line` preserva los saltos de línea del campo de texto libre.
Colores via CSS custom properties del proyecto (no valores hex hardcodeados).

---

#### Paso 7 — `booking-form.ts`

En la interfaz `TreatmentOption`:
```typescript
horarios?: string | null;
```

En el método `toTreatmentOption(tarifa: Tarifa)`, añadir al objeto retornado:
```typescript
horarios: tarifa.horarios,
```

---

#### Paso 8 — `booking-form.html`

Dentro del `<button class="treatment-card">`, después de la línea de `option.descripcion`
(línea 117) y antes de `option.showBadge`, añadir:

```html
<p *ngIf="option.horarios?.trim()" class="treatment-card-horarios">
  {{ option.horarios }}
</p>
```

La verificación inline `option.horarios?.trim()` es aceptable aquí: `TreatmentOption`
es una interfaz plana (no clase), no puede tener getters propios, y la condición es simple.

En `booking-form.css`, añadir la clase reutilizando la apariencia de `.treatment-card-desc`:

```css
.treatment-card-horarios {
  margin: 5px 0 0;
  color: #7a728a;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-line;
}
```

---

## 4. Trazabilidad con requerimientos

### Requerimientos funcionales

| ID | Requerimiento | Componente que lo resuelve |
|----|--------------|---------------------------|
| RF-1 | Añadir campo `horarios` a tabla `tarifas` | Capa **database** (fuera de scope frontend) |
| RF-2 | `horarios` de tipo `text` | Capa database + interfaz TS en `tarifas.service.ts` |
| RF-3 | `horarios` nullable | Capa database + tipo `string \| null` en interfaz |
| RF-4 | Panel admin permite editar `horarios` | `admin-dashboard.component.ts/.html` |
| RF-5 | Campo admin es un textarea | `admin-dashboard.component.html` |
| RF-6 | Label del campo es `Horarios (opcional)` | `admin-dashboard.component.html` |
| RF-7 | `descripcion` queda limpio | Capa **database** (migración) — esta capa no toca `descripcion` |
| RF-8 | Web muestra horarios en bloque separado si existen | `pricing.component.html`, `booking-form.html` |
| RF-9 | Web oculta el bloque si `horarios` está vacío o null | `hasHorarios()`, `*ngIf="hasHorarios(tarifa)"`, `*ngIf="option.horarios?.trim()"` |
| RF-10 | `TarifasService` incluye `horarios` en consultas y actualizaciones | Interfaz `Tarifa` actualizada; queries ya usan `select('*')` |
| RF-11 | Página `/tarifas` muestra horarios separados (ver Suposición S-1) | `pricing.component.html` |
| RF-12 | Home muestra horarios separados | `pricing.component.html` (renderizado en home) |
| RF-13 | Stepper muestra horarios separados | `booking-form.ts/.html` |

### Requerimientos técnicos

| ID | Requerimiento | Solución adoptada |
|----|--------------|------------------|
| RT-1 | Columna `horarios text null` en Supabase | Capa database |
| RT-2 | Actualizar tipos/interfaces | `Tarifa` en `tarifas.service.ts` |
| RT-3 | Actualizar queries de lectura | No modificación necesaria (`select('*')` ya incluye el campo) |
| RT-4 | Actualizar operación de edición desde admin | Payload `saveTarifa()` + `openEditModal` |
| RT-5 | Renderizar horarios de forma condicional | `hasHorarios()` + `*ngIf` en templates |
| RT-6 | Evitar mostrar si `horarios.trim()` está vacío | `hasHorarios()` usa `.trim()` antes de evaluar |
| RT-7 | Compatibilidad con tarifas existentes | `horarios?: string \| null` — campo opcional; tarifas sin `horarios` no renderan bloque |

### Escenarios de la spec

| Escenario | Cobertura |
|-----------|----------|
| E-1: Mostrar horarios en Pilates | `hasHorarios()` retorna `true` → bloque renderizado |
| E-2: Ocultar horarios vacíos | `.trim()` en `hasHorarios()` → `false` si vacío/null → bloque oculto |
| E-3: Editar horarios desde admin | textarea en modal + `saveTarifa()` persiste el valor en Supabase |
| E-4: Migrar datos existentes | Capa **database** — fuera de scope de este plan |

---

## 5. Estrategia de pruebas

La cobertura formal de tests queda delegada a la capa `quality`. Este plan define los
**criterios verificables** por escenario que guiarán los tests unitarios.

### Criterios verificables (para capa quality)

| Criterio | Componente | Tipo de test sugerido |
|----------|-----------|----------------------|
| `hasHorarios(tarifa)` retorna `true` si `horarios` tiene texto | `PricingComponent` | Unit — spy de tarifa con `horarios: 'texto'` |
| `hasHorarios(tarifa)` retorna `false` si `horarios` es `null` | `PricingComponent` | Unit — spy con `horarios: null` |
| `hasHorarios(tarifa)` retorna `false` si `horarios` es `'   '` (espacios) | `PricingComponent` | Unit — spy con `horarios: '   '` |
| El bloque `.tarifa-horarios` aparece en DOM cuando `hasHorarios` retorna `true` | `PricingComponent` | Unit (fixture) — `queryByCss` |
| El bloque `.tarifa-horarios` NO aparece en DOM cuando `hasHorarios` retorna `false` | `PricingComponent` | Unit (fixture) — `queryByCss` null |
| `tarifaForm` inicializa `horarios` como `''` en nueva tarifa | `AdminDashboardComponent` | Unit — `component.tarifaForm.controls.horarios.value` |
| `openEditModal` popula `horarios` desde la tarifa existente | `AdminDashboardComponent` | Unit — spy de tarifa con `horarios: 'texto'`, verificar `form.controls.horarios.value` |
| `saveTarifa` envía `horarios: null` si el campo está vacío | `AdminDashboardComponent` | Unit — spy `tarifasService.updateTarifa`, verificar payload |
| `saveTarifa` envía `horarios: 'texto'` si el campo tiene valor | `AdminDashboardComponent` | Unit — spy `tarifasService.updateTarifa`, verificar payload |
| `toTreatmentOption()` mapea `tarifa.horarios` en `TreatmentOption` | `BookingFormComponent` | Unit — tarifa con `horarios`, verificar propiedad resultante |
| Bloque horarios en step 1 se renderiza si `option.horarios` tiene texto | `BookingFormComponent` | Unit (fixture) |
| Bloque horarios en step 1 NO se renderiza si `option.horarios` es null | `BookingFormComponent` | Unit (fixture) |

### Verificación manual mínima antes del merge

- [ ] `ng build` sin errores TypeScript
- [ ] Tab Pilates en home muestra bloque "Horarios disponibles" con el texto migrado
- [ ] Tab Fisioterapia en home no muestra ningún bloque de horarios
- [ ] Tarifa con `horarios = null` no muestra bloque en ninguna vista
- [ ] Modal admin: campo "Horarios (opcional)" visible al abrir modal de cualquier tarifa
- [ ] Guardar tarifa con horarios vacío → campo queda `null` en Supabase
- [ ] Guardar tarifa con horarios → valor persiste correctamente
- [ ] Step 1 del stepper muestra horarios bajo la descripción para tarifas de Pilates
- [ ] `ng build` pasa antes del merge

---

## 6. Riesgos

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|-------------|---------|-----------|
| R-1 | **TypeScript strict:** `tarifa.horarios` podría no compilar si la interfaz no actualiza a tiempo | Alta si se implementan los pasos fuera de orden | Medio | Implementar en el orden definido en §3 |
| R-2 | **`fb.nonNullable.group`:** el control `horarios` siempre retorna `string`, nunca `undefined`. Si no se normaliza en el payload, un string vacío `''` se guarda en Supabase en lugar de `null` | Media | Bajo–Medio | Normalización explícita en `saveTarifa()`: `horarios.trim() ? horarios.trim() : null` |
| R-3 | **Reset entre ediciones:** si `openEditModal` no inicializa `horarios`, al abrir una tarifa sin horarios tras editar una con horarios, el campo mostraría el valor anterior | Alta si no se añade `horarios` al reset | Bajo | Añadir `horarios: tarifa.horarios ?? ''` en `openEditModal` reset |
| R-4 | **`white-space: pre-line` en mobile:** textos de horarios muy largos o con muchos saltos de línea pueden romper el layout en pantallas pequeñas | Baja | Bajo | Revisar visualmente en breakpoint móvil tras implementar |
| R-5 | **Capa database no completada:** si la columna `horarios` no existe en Supabase cuando el frontend llega a producción, `select('*')` omitirá el campo silenciosamente (no hay error, simplemente `horarios` será `undefined`) | Media | Bajo | Coordinar el deploy de la capa database antes del frontend |
| R-6 | **Datos no migrados en producción:** si la migración de `descripcion` → `horarios` no se aplica antes del deploy, las tarifas de Pilates mostrarán horarios vacíos y descripciones con texto mixto | Media | Medio | Deploy de la migración como prerequisito estricto |

---

## 7. Suposiciones

| ID | Suposición |
|----|-----------|
| S-1 | La spec menciona "página `/tarifas`". Se asume que hace referencia a la sección `#tarifas` del componente `PricingComponent` renderizado en la home. No existe ni se creará una ruta `/tarifas` separada en esta SPEC. |
| S-2 | El campo `horarios` contiene texto libre sin formato especial. Se usa `white-space: pre-line` para que los saltos de línea se preserven. No se parsea ni se transforma el contenido. |
| S-3 | El campo `horarios` se muestra en el admin para todas las categorías (no solo Pilates), para no limitar su uso futuro. Esto no contradice la spec, que solo requiere que sea editable. |
| S-4 | El `DisplayComponent` (pantalla kiosko) no consume `TarifasService` y no está en scope, confirmado por análisis del código. |
| S-5 | La capa database habrá añadido la columna y ejecutado la migración antes del deploy de esta capa frontend. |
| S-6 | Los estilos del nuevo bloque de horarios en `booking-form.css` usan colores hardcodeados (`#7a728a`) para mantener consistencia con el resto del archivo `.treatment-card-desc` existente, que ya usa esta convención. |

---

## 8. Preguntas abiertas

| ID | Pregunta | Afecta a |
|----|---------|---------|
| P-1 | ¿Debe mostrarse el campo `Horarios` en la tabla de listado del admin (columna nueva), o es suficiente con el modal de edición? La spec no lo especifica explícitamente. | `admin-dashboard.component.html` (tabla) |
| P-2 | ¿Debe mostrarse el bloque de horarios en el `DisplayComponent` (pantalla kiosko de la clínica)? La spec no lo menciona, pero es un caso de uso relevante para la clínica. | `src/app/pages/display/display.component.ts` |
| P-3 | ¿El icono 📅 u otro prefijo visual debe acompañar el texto de horarios en el bloque de la web pública o del stepper? La spec dice "bloque separado con label `Horarios disponibles`" para la web pública, pero no define el estilo del stepper. | `booking-form.html` |
| P-4 | ¿Debe limitarse la visibilidad del bloque de horarios solo a la categoría `Pilates`, o a cualquier tarifa que tenga `horarios` informado? La spec dice "bloque separado si existen", lo que sugiere que aplica a cualquier tarifa. El plan asume que aplica a cualquier tarifa con `horarios` no vacío. | `pricing.component.html`, `booking-form.html` |

---

## 9. Fuera de scope de esta capa

- Creación de la columna `horarios` en Supabase → capa `database`
- Migración de datos de `descripcion` → `horarios` → capa `database`
- Tests unitarios formales → capa `quality`
- Cambios en `DisplayComponent` (kiosko) → pendiente de decisión (ver P-2)
- Validación del formato interno de los horarios → explícitamente fuera de scope en la spec
- Creación de ruta `/tarifas` → fuera de scope de esta SPEC
