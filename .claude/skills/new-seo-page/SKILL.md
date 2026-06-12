---
name: new-seo-page
description: Crea una nueva landing page SEO completa (ruta lazy-loaded sobre SeoPageComponent, contenido, canonical, prerender y redirects). Usar cuando el usuario pida una landing tipo "/fisioterapia-X-terrassa".
---

# Crear nueva landing page SEO

El usuario quiere una landing SEO nueva. El argumento es el tema/keyword (ej: "fisioterapia deportiva terrassa").

## Pasos

1. **Slug**: deriva el slug en kebab-case terminando en `-terrassa` (ej: `/fisioterapia-deportiva-terrassa`). Confirma con el usuario solo si es ambiguo.
2. **Estudia el patrón existente**: lee `src/app/features/seo-pages/` y cómo las landings existentes definen sus datos (title, description, h1, secciones, FAQs). Lee también una entrada existente en `src/app/app.routes.ts`.
3. **Contenido**: redacta en castellano contenido único orientado a la keyword:
   - `<title>` único < 60 caracteres incluyendo "Terrassa"
   - meta description única < 155 caracteres con llamada a la acción
   - h1 único, 3-5 secciones de contenido útil (qué es, síntomas, tratamiento en CBM, beneficios)
   - 3-4 FAQs (sirven para rich results)
   - CTA hacia el formulario de reserva (`booking-form`)
4. **Ruta**: añade la ruta lazy-loaded en `app.routes.ts` siguiendo el patrón de las demás landings SEO (comparten `SeoPageComponent`).
5. **Prerender**: añade la ruta a `routes.txt` (lista de rutas a prerenderizar).
6. **Verifica**:
   - `npx tsc --noEmit -p tsconfig.app.json`
   - `npm run build` y comprueba que la ruta aparece en la salida de prerender
7. **Resumen final**: lista archivos tocados y recuerda al usuario que tras el deploy debe pedir indexación en Google Search Console.

No inventes datos médicos sensibles ni promesas de curación (es una web sanitaria: usa lenguaje prudente tipo "puede ayudar a", "tratamiento orientado a").
