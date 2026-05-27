# Context — Architecture Layer

## Propósito

La capa de arquitectura define la **estructura de módulos, rutas, servicios y contratos de datos** antes de escribir código.

Es el plano del edificio: no construye, diseña.

## Responsabilidades

- Definir qué componentes, servicios y módulos se crean
- Definir las rutas nuevas que se añaden a `app.routes.ts`
- Definir las interfaces TypeScript (contratos de datos)
- Identificar dependencias entre módulos existentes y los nuevos
- Detectar posibles conflictos con el código ya existente

## Estructura actual de la app

```
src/app/
  core/           → Servicios singleton, UI global (header, footer, etc.)
  features/       → Áreas funcionales autocontenidas
  pages/          → Páginas de ruta directa
  sections/       → Secciones reutilizables cross-feature
  shared/         → Directivas y componentes utilitarios
  admin/          → Panel de administración
```

## Convenciones de nombrado

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Componente | `PascalCase` + sufijo | `PacientesListComponent` |
| Servicio | `PascalCase` + `Service` | `PacientesService` |
| Interfaz | `PascalCase` | `Paciente` |
| Ruta | `kebab-case` | `/pacientes` |
| Fichero | `kebab-case` | `pacientes-list.component.ts` |
| Carpeta | `kebab-case` | `features/pacientes/` |

## Patrón de feature

Cada feature sigue esta estructura:
```
features/{nombre}/
  {nombre}-page.ts         → Componente página (ruta)
  {nombre}-list.component.ts   → Lista (opcional)
  {nombre}-detail.component.ts → Detalle (opcional)
  {nombre}-form.component.ts   → Formulario (opcional)
```

Los servicios de negocio van en `core/services/`.

## Routing

Las rutas se añaden en `src/app/app.routes.ts`.
Las rutas de admin siguen el patrón `/admin/{recurso}`.
Usar lazy loading (`loadComponent`) para páginas de admin.
