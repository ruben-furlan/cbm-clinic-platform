---
name: new-feature
description: Scaffolding de un feature nuevo siguiendo la arquitectura del proyecto (carpeta en features/, componente standalone, ruta lazy, test). Usar cuando el usuario pida "crea la sección/feature X".
---

# Nuevo feature

El argumento es el nombre del feature (ej: "pilates-terapeutico").

## Pasos

1. **Decide la capa** según CLAUDE.md:
   - área de negocio autocontenida → `src/app/features/<nombre>/`
   - sección reutilizable entre features → `src/app/sections/`
   - página completa tipo kiosko → `src/app/pages/`
   Si hay duda real, pregunta al usuario antes de crear nada.
2. **Lee un feature existente similar** (ej: `features/faq/` o `features/testimonials/`) para copiar convenciones de nombres, estructura y estilo CSS.
3. **Crea** el componente standalone (`.ts` + `.html` + `.css`) usando signals e `inject()`. Sin NgModules.
4. **Ruta**: si el feature tiene URL propia, añádela lazy-loaded en `app.routes.ts` y a `routes.txt` (prerender). Si es una sección embebida (ej. en home), impórtala donde corresponda.
5. **Test**: crea un `.spec.ts` mínimo (componente se crea + lógica principal) usando Vitest/TestBed standalone.
6. **Verifica**: `npx tsc --noEmit -p tsconfig.app.json` y `npm test -- --run`.
7. **Si la página es pública**: recuerda canonical (lo gestiona `CanonicalService` por ruta) y propone delegar una auditoría al agente `seo-auditor`.

Resumen final: árbol de archivos creados + cómo verlo en `npm start`.
