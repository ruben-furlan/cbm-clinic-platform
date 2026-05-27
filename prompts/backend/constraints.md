# Constraints — Backend Layer

## Restricciones de servicios Angular

- **Sin Observables en servicios** — solo async/await (el proyecto es promise-based)
- **Sin lógica de UI** en servicios — nada de `alert()`, `router.navigate()`, manipulación del DOM
- **Sin estado global en servicios** — los servicios son stateless; el estado vive en los componentes
- **`providedIn: 'root'`** siempre — singletons inyectados globalmente
- **No llamar al servicio de Supabase directamente desde un componente** — siempre via servicio Angular

## Restricciones de Netlify Functions

- Solo para operaciones **no realizables desde el cliente** (CORS, secrets, emails)
- No implementar lógica de negocio compleja — eso va en RPCs de Supabase
- Timeout máximo: 10 segundos (límite de Netlify en plan gratuito)
- No almacenar estado entre invocaciones — son stateless por diseño

## Restricciones de acceso a datos

- La `anon` key solo puede hacer lo que RLS permite
- Las operaciones admin se hacen con el usuario autenticado (`auth.role() = 'authenticated'`)
- Nunca exponer ni usar la `service_role` key en el frontend
- No bypassear RLS en código de frontend — si necesitas más permisos, usa una Netlify Function con service_role

## Restricciones de tipado

- El tipo de retorno de cada método del servicio debe ser explícito
- Los tipos `unknown` y `any` están prohibidos en servicios
- Las respuestas de Supabase deben castearse al tipo correcto: `as Paciente[]`

## Restricciones de errores

- No swallowing silencioso de errores (`catch(() => {})` vacío)
  - En servicios: siempre `if (error) throw error`
  - En componentes: capturar y mostrar feedback al usuario
- Los errores de Supabase tienen `{ message, code, details }` — loguear el objeto completo en desarrollo

## Lo que NO decide esta capa

- Cómo es el schema SQL de la tabla → capa `database`
- Cómo se presenta el formulario al usuario → capa `frontend`
- Cómo se testea el servicio → capa `quality`
