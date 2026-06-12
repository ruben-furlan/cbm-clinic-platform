---
name: pre-deploy
description: Checklist completo antes de hacer push/deploy a Netlify - build, tests, formato, tipos y auditoría rápida de SEO. Usar antes de cualquier deploy a producción o cuando el usuario diga "revisa antes de subir".
---

# Pre-deploy checklist

Ejecuta esta secuencia y NO la des por buena si algún paso falla. Reporta cada paso con ✅/❌.

## Pasos

1. **Tipos**: `npx tsc --noEmit -p tsconfig.app.json`
2. **Tests**: `npm test -- --run` (modo no-watch). Todos en verde.
3. **Formato**: `npx prettier --check "src/**/*.{ts,html,css}"`. Si falla, ofrece ejecutar `--write`.
4. **Build de producción**: `npm run build`. Verifica:
   - que termina sin errores
   - que el prerender genera las rutas esperadas (compara con `routes.txt`)
   - tamaño de bundles: avisa si algún chunk inicial supera ~500 kB
5. **Secretos**: `git diff origin/main --stat` y grep del diff buscando patrones `service_role`, `sk_live`, `sk_test`, `SUPABASE_SERVICE`. Cualquier match es bloqueante.
6. **Redirects**: si el diff toca `public/_redirects` o `netlify.toml`, revisa que no haya loops ni se pisen rutas existentes.
7. **Git**: muestra `git status` y `git log origin/main..HEAD --oneline` para que el usuario vea qué se va a subir.

## Salida

Tabla resumen con cada check, su estado y, para los fallos, el comando o fix exacto. Termina con un veredicto claro: **"LISTO PARA DEPLOY"** o **"NO SUBIR — arreglar X primero"**.

No hagas `git push` tú mismo salvo que el usuario lo pida explícitamente.
