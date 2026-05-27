# Constraints — Architecture Layer

## Restricciones de estructura

- **Sin NgModules** — todo standalone
- **Sin barrel `index.ts`** — importar directamente desde el fichero fuente
- **Sin circular dependencies** — los features no se importan entre sí
  - ✅ `feature` → `core/services`
  - ✅ `feature` → `shared/components`
  - ❌ `feature/pacientes` → `feature/eventos`
- El fichero `app.routes.ts` es el único punto de registro de rutas

## Restricciones de servicios

- Los servicios no llaman a otros servicios de dominio distinto
  - ❌ `PacientesService` llamando a `EventsService`
  - Si se necesita, crear un servicio orquestador separado
- No hacer lógica de negocio en los componentes — va en el servicio
- No hacer llamadas a Supabase en los componentes — solo via servicio

## Restricciones de tipos

- Todas las interfaces de dominio deben ser exportadas desde el servicio que las define
- No duplicar interfaces — si un tipo ya existe en otro servicio, importarlo
- Los tipos de Supabase (respuestas crudas) deben mapearse a interfaces propias en el servicio

## Restricciones de routing

- Las rutas públicas son directas: `/tratamientos`, `/blog`
- Las rutas de admin siempre bajo `/admin/...`
- Siempre usar `loadComponent` (lazy) para páginas de admin
- No usar `loadChildren` con módulos (no hay módulos en este proyecto)

## Lo que NO decide esta capa

- Cómo se crea la tabla en base de datos → capa `database`
- Cómo es la lógica de negocio de una RPC → capa `backend`
- Cómo se estiliza visualmente un componente → capa `frontend`
- Cómo se testea → capa `quality`
