---
description: Checklist completo antes de deploy a Netlify (tipos, tests, formato, build, secretos)
---

Ejecuta el checklist de pre-deploy y reporta cada paso con ✅/❌:

1. `npx tsc --noEmit -p tsconfig.app.json`
2. `npm test -- --run`
3. `npx prettier --check "src/**/*.{ts,html,css}"`
4. `npm run build` (verifica prerender contra routes.txt y tamaño de bundles)
5. Grep del diff contra main buscando `service_role|sk_live|sk_test|SUPABASE_SERVICE` (bloqueante si hay match)
6. Si el diff toca `public/_redirects` o `netlify.toml`, revisa loops
7. Muestra `git log origin/main..HEAD --oneline`

Termina con veredicto: "LISTO PARA DEPLOY" o "NO SUBIR — arreglar X primero". No hagas push sin que te lo pidan.
