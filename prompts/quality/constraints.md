# Constraints — Quality Layer

## Restricciones de tests

- **Vitest como test runner** — no Jest, no Karma (aunque Angular los soporte)
- **Sin tests de snapshot** — demasiado frágiles para este tipo de proyecto
- **Sin tests E2E por ahora** — no hay Playwright/Cypress configurado; se añadirán en una spec futura
- **Tests síncronos o async/await** — no callbacks, no done()

## Restricciones de mocks

- No mockear lo que no necesitas mockear — si el servicio es simple, testear con la implementación real
- Los mocks de Supabase son necesarios en tests de servicios (no hay base de datos en CI)
- No usar `vi.mock()` a nivel de módulo si `vi.spyOn()` es suficiente

## Lo que no se testea (en este proyecto, por ahora)

- Servicios de terceros (Supabase, Netlify) — se mockean, no se testean reales
- CSS y estilos visuales
- Animaciones
- Comportamiento específico del navegador (clipboard, etc.)

## Restricciones de calidad de código

- **Sin `any`** en el código fuente (excepto en mocks de test)
- **Sin `@ts-ignore`** sin comentario que explique el motivo
- **Prettier aplicado** antes de hacer commit — `npx prettier --write src/`
- **Sin `console.log`** en código de producción

## Criterio de "done" para una spec

Una spec está terminada cuando:
1. Todos los `tasks.md` de todas las capas están marcados `[x]`
2. `npm run build` limpio (0 errores, 0 warnings de TypeScript)
3. Los tests nuevos pasan (`npm test`)
4. El código está formateado con Prettier
5. La funcionalidad ha sido probada manualmente en local (`npm start`)

## Deuda técnica

Si durante la implementación se detecta deuda técnica no relacionada con la spec:
- Documentarla en un comentario `// DEUDA: descripción`
- Crear un issue o anotarla para una spec futura
- **No resolverla en el scope de la spec actual** — mantener el foco
