# Guidelines — Backend Layer

## Al crear un nuevo servicio Angular

1. **Un servicio por dominio** — `PacientesService`, no `ClinicaService` que agrupe todo
2. **Métodos async/await** — no Observables en los servicios (el proyecto usa promesas)
3. **Tipar todo** — el servicio exporta sus interfaces:
   ```typescript
   export interface Paciente { id: string; nombre: string; ... }
   export class PacientesService { ... }
   ```
4. **Manejo de errores consistente** — siempre `if (error) throw error` después de una query Supabase
5. **Timeout en admin** — el `AdminDashboardComponent` usa `withTimeout()` de 12s para todas las llamadas

## Al crear una Netlify Function

1. **Solo para lo que no puede hacer el cliente** — envío de emails, webhooks, integraciones externas
2. **Validar el método HTTP** al inicio
3. **Parsear y validar el body** antes de usar sus datos
4. **Variables de entorno** solo via `process.env` — nunca hardcodeadas
5. **Respuesta consistente**: siempre JSON con `statusCode` apropiado

## Operaciones CRUD en servicios

| Operación | Método Supabase | Nombre en servicio |
|-----------|----------------|--------------------|
| Listar todos | `.select('*')` | `getAll()` |
| Listar activos | `.eq('activo', true)` | `getActivos()` |
| Listar admin | sin filtros | `getAllAdmin()` |
| Obtener uno | `.eq('id', id).single()` | `getById(id)` |
| Crear | `.insert(data).select().single()` | `create(data)` |
| Actualizar | `.update(data).eq('id', id).select().single()` | `update(id, data)` |
| Eliminar | `.delete().eq('id', id)` | `delete(id)` |
| Toggle activo | `.update({ activo: val }).eq('id', id)` | `toggleActivo(id, val)` |

## Llamadas a RPCs

```typescript
const { data, error } = await supabase.rpc('nombre_funcion', {
  p_param1: valor1,
  p_param2: valor2
});
if (error) throw error;
return data as TipoRetorno;
```

## Queries con relaciones

```typescript
// Join simple (tabla → tabla relacionada)
const { data, error } = await supabase
  .from('event_registrations')
  .select('*, events(title, start_at)')
  .eq('id', id)
  .single();
```

## Paginación (cuando aplique)

```typescript
const { data, error } = await supabase
  .from('{tabla}')
  .select('*', { count: 'exact' })
  .range(from, to)
  .order('created_at', { ascending: false });
```
