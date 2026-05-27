# Context — Frontend Layer

## Propósito

La capa de frontend gestiona la **implementación de componentes Angular**: templates, estilos, interacción del usuario y binding de datos.

## Framework y versión

- **Angular 21** — standalone components, sin NgModules
- **TypeScript 5.9** — strict mode, strict templates
- **RxJS 7.8** — solo donde Angular lo requiera internamente (router, forms)
- **CSS puro** — sin Tailwind, sin frameworks CSS externos

## Componentes existentes de referencia

### Shared components (reutilizables)
```
shared/components/
  banner-anuncio/       → Banner con texto y enlace configurable
  cbm-loader/           → Spinner de carga
  domicilio-form/       → Formulario de solicitud a domicilio
  newsletter-form/      → Formulario de suscripción newsletter
  simple-editor/        → Editor de HTML para el blog
```

### Directivas
```
shared/directives/
  reveal-on-scroll.directive.ts  → Animación de entrada por scroll
```

## Paleta de colores del proyecto

| Variable CSS | Uso |
|-------------|-----|
| `--color-primary` | Rosa corporativo (#c44b8e aprox.) |
| `--color-secondary` | Violeta (#a78bfa aprox.) |
| `--color-text` | Texto principal |
| `--color-bg` | Fondo |

El proyecto usa CSS custom properties. Consultar `src/styles.css` para la paleta completa.

## Patrones de UI recurrentes

- **Modales**: overlay con backdrop, centrado, cerrable con Escape
- **Tablas admin**: listado con acciones inline (editar, eliminar, toggle activo)
- **Formularios**: Reactive Forms con validación y feedback de error por campo
- **Toast/feedback**: mensaje temporal que desaparece solo (patrón `showMsg` en admin)
- **Estado de carga**: spinner mientras llegan datos, mensaje de error si falla
- **Confirmación de borrado**: diálogo de confirmación antes de eliminar
