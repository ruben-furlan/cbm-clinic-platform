# Context — Backend Layer

## Propósito

La capa de backend gestiona la **lógica de servidor**: Netlify Functions (serverless) y RPCs de Supabase que no pertenecen al schema puro.

También documenta los **servicios Angular** (`core/services/`) que actúan como capa de acceso a datos.

## Arquitectura backend actual

Este proyecto **no tiene servidor dedicado**. El "backend" se compone de:

### 1. Supabase (BaaS)
- PostgreSQL como base de datos
- Supabase Auth para autenticación admin
- RLS como capa de autorización
- RPCs (PL/pgSQL) para lógica que requiere atomicidad

### 2. Netlify Functions (serverless)
```
netlify/functions/
  send-appointment-email.ts   → Envío de email de cita
  send-newsletter.ts          → Envío de newsletter masivo
```

### 3. Angular Services (data access layer)
```
src/app/core/services/
  blog.service.ts
  bonos-regalo.service.ts
  configuracion.service.ts
  events.service.ts
  faqs.service.ts
  newsletter.service.ts
  servicios-regalo.service.ts
  tarifas.service.ts
```

## Cliente Supabase

Singleton en `src/app/core/supabase.client.ts`:
```typescript
import { supabase } from '../core/supabase.client';
```

## Patrón de servicio Angular

```typescript
@Injectable({ providedIn: 'root' })
export class {Nombre}Service {
  async getAll(): Promise<{Tipo}[]> {
    const { data, error } = await supabase
      .from('{tabla}')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as {Tipo}[];
  }
}
```

## Netlify Functions

```typescript
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  // lógica...
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
```
