# Constraints — Frontend Layer

## Restricciones de componentes

- **Solo standalone** — `standalone: true` siempre, sin NgModules
- **Sin acceso directo a Supabase** — los componentes solo usan servicios Angular
- **Sin lógica de negocio en el template** — las condiciones complejas van como getters en el componente
- **Sin `document.*` ni `window.*`** salvo necesidad justificada y con comprobación de `isPlatformBrowser`

## Restricciones de TypeScript en templates

- Los templates deben compilar sin errores (`strictTemplates: true`)
- No usar `$any()` para bypassear el tipado del template
- Los métodos llamados en el template no deben tener efectos secundarios complejos (solo getters/computeds)

## Restricciones de formularios

- Usar siempre **Reactive Forms** (`FormBuilder`) — no template-driven forms
- Los formularios de admin usan `fb.nonNullable.group()`
- Validación del lado del cliente es UX, no seguridad — la seguridad real está en RLS/RPC

## Restricciones de estilos

- Sin Tailwind, sin Bootstrap, sin ningún framework CSS externo
- Los estilos de un componente van en su propio `.css` (scoped)
- Los estilos globales solo en `src/styles.css`
- Colores via CSS custom properties — no valores hexadecimales hardcodeados en componentes

## Restricciones de rendimiento

- `@for` siempre con `track` — obligatorio en Angular 17+
- Evitar funciones en el template que se recalculen en cada ciclo de detección de cambios
  - ✅ Getters computados: `get itemsFiltrados()`
  - ❌ Métodos con lógica: `{{ filtrar(items) }}`
- Las imágenes de la lista deben tener `loading="lazy"`

## Restricciones de routing

- Usar `RouterLink` directiva para navegación interna — no `window.location.href`
- Usar `Router.navigate()` para navegación programática
- No duplicar rutas — el registro es solo en `app.routes.ts`

## Lo que NO decide esta capa

- Qué datos devuelve la base de datos → capa `database`
- Cómo se llama la API / servicio → capa `backend`
- Cómo se testea el componente → capa `quality`
