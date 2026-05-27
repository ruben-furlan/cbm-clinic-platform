# Constraints — Parent Layer

## Restricciones técnicas globales

### Angular
- **Solo standalone components** — prohibido usar NgModules
- **TypeScript strict** — no `any`, no `@ts-ignore` sin justificación documentada
- **Strict templates** — los templates HTML deben compilar sin errores
- Cada componente importa solo lo que necesita (no barrel imports globales)

### Supabase
- **RLS siempre activo** en tablas con datos sensibles
- El cliente Supabase es un singleton: `src/app/core/supabase.client.ts`
- No exponer la `service_role` key en el frontend — solo la `anon` key
- Las RPCs deben validar inputs antes de operar

### Netlify Functions
- Solo para operaciones que no pueden hacerse desde el cliente (ej: envío de email)
- Deben manejar errores y devolver códigos HTTP apropiados
- Variables de entorno: solo vía panel de Netlify (nunca en el repo)

### Seguridad
- Nunca almacenar datos médicos sensibles sin cifrado adicional
- El panel `/admin` requiere autenticación Supabase (`adminAuthGuard`)
- Los formularios públicos tienen validación tanto en frontend como en RLS/RPC

### Base de datos
- Toda nueva tabla incluye: `id uuid PRIMARY KEY`, `created_at timestamptz`, `updated_at timestamptz`
- Migrations se guardan en `supabase/` con nombre descriptivo
- No borrar columnas en producción sin periodo de deprecación

## Restricciones de proceso

- No se aceptan PRs sin spec asociada (excepto bugfixes urgentes)
- No se crea código sin `tasks.md` previo
- Las specs no se modifican una vez iniciada la implementación — se versiona una nueva

## Lo que NO está en scope de este proyecto

- Aplicación móvil nativa
- Sistema de pagos en línea (actualmente: bizum/transferencia/efectivo manual)
- Historia clínica digital (HIPAA/GDPR avanzado)
- Multi-clínica / multi-tenant
