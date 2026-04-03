# Netlify · Configuración de variables para Supabase

En **Netlify > Site configuration > Environment variables**, añade estas variables:

- `SUPABASE_URL` = URL del proyecto de Supabase (por ejemplo `https://xxxx.supabase.co`)
- `SUPABASE_ANON_KEY` = clave pública anon de Supabase

Luego, actualiza `src/environments/environment.ts` y `src/environments/environment.prod.ts` para leer esos valores según tu estrategia de build/deploy.

> Recomendación: no dejar los placeholders en producción y confirmar que el build de Netlify inyecta los valores antes de publicar.
