# AGENTS.md

Instrucciones para agentes de IA (OpenAI Codex, Cursor, Gemini CLI, OpenCode y compatibles con el estándar AGENTS.md). Claude Code usa `CLAUDE.md` — mantener ambos archivos sincronizados.

## Proyecto

Web de la clínica de fisioterapia CBM (Terrassa) — `https://cbmfisioterapia.com`. Angular 21 con componentes standalone, backend Supabase, funciones serverless y deploy en Netlify.

## Comandos

```bash
npm start          # Dev server en http://localhost:4200/
npm run build      # Build de producción → dist/ (incluye prerender)
npm test           # Tests unitarios con Vitest (añadir -- --run para modo no-watch)
npx tsc --noEmit -p tsconfig.app.json   # Solo comprobación de tipos
npx prettier --write <archivo>          # Formatear (100 chars, comillas simples)
```

## Arquitectura

- **Angular 21 standalone** — prohibido crear NgModules. Cada componente importa sus dependencias.
- Capas: `src/app/core/` (UI global + servicios singleton) · `src/app/features/` (áreas autocontenidas) · `src/app/pages/` (rutas de página completa, ej. kiosko `/display`) · `src/app/sections/` (secciones reutilizables) · `src/app/shared/` (directivas/utilidades).
- Rutas **lazy-loaded** con `loadComponent` en `src/app/app.routes.ts`. Las landing SEO (`/fisioterapia-*-terrassa`) comparten `SeoPageComponent`.
- Toda ruta pública nueva debe añadirse a `routes.txt` (lista de prerender).
- Servicios clave: `LanguageService` (es/ca/en vía Google Translate) y `CanonicalService` (canonical por ruta, base `https://cbmfisioterapia.com`).
- Datos: cliente `@supabase/supabase-js` con anon key; operaciones privilegiadas SOLO vía `netlify/functions/` con la service key en variables de entorno. SQL en `supabase/` (migraciones idempotentes, RLS obligatorio).

## Reglas de código

1. TypeScript estricto: nada de `any` ni `!` injustificados.
2. Código nuevo con signals e `inject()`, no constructor injection.
3. Toda llamada a Supabase comprueba `error` del resultado `{ data, error }`.
4. Nunca commitear secretos (service role key, claves Stripe). La anon key pública es la única aceptable en cliente.
5. Animaciones respetan `prefers-reduced-motion`.
6. Web sanitaria: lenguaje prudente en contenido médico ("puede ayudar a", nunca promesas de curación).

## Verificación antes de terminar

1. `npx tsc --noEmit -p tsconfig.app.json` sin errores.
2. `npm test -- --run` en verde.
3. Si tocaste rutas o páginas públicas: `npm run build` y comprobar el prerender.

## Git

- No hacer push sin que el usuario lo pida. Nunca `git push --force` (usar `--force-with-lease` solo si se pide explícitamente).
