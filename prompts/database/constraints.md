# Constraints — Database Layer

## Restricciones de esquema

- **UUID siempre como PK** — nunca integer auto-increment
- **`timestamptz` para fechas** — nunca `timestamp` sin zona horaria
- **RLS obligatorio** en tablas con datos de usuarios o datos sensibles
- **Sin borrar columnas** en producción sin periodo de deprecación previo
- **Migrations versionadas** — todo cambio de schema tiene su fichero `.sql` en `supabase/`

## Restricciones de RLS

- La `anon` key solo puede leer datos públicos
- La `anon` key puede insertar en tablas de registros/formularios públicos (con validaciones en RPC)
- Solo el rol `authenticated` (admin) puede modificar datos maestros
- Nunca usar `USING (true)` en políticas de escritura para `anon`

## Restricciones de RPCs

- Las RPCs públicas (llamadas desde `anon`) **deben validar todos los inputs**
- Las RPCs que modifican varias tablas deben hacerlo en una transacción
- El nombre de la RPC debe describir la acción: `register_paciente`, no `do_thing`
- Las RPCs devuelven `json` con estructura `{ "success": bool, "data": ..., "error": ... }`

## Restricciones de datos

- Los enums de negocio se implementan con `CHECK` constraints, no con tablas de lookup
  ```sql
  -- ✅ Correcto
  estado text CHECK (estado IN ('activo', 'inactivo', 'archivado'))
  -- ❌ Evitar para enums simples
  estado_id integer REFERENCES estados(id)
  ```
- Los precios siempre como `numeric(10,2)`, nunca `float` o `double`
- Los teléfonos como `text`, nunca `integer`

## Restricciones de rendimiento

- Máximo 5 joins en una query — si necesitas más, revisar el modelo de datos
- Índices compuestos solo cuando hay queries frecuentes con múltiples columnas en WHERE
- No crear índices en columnas con baja cardinalidad (ej: `boolean`) a menos que sea partial index

## Lo que NO decide esta capa

- Cómo se llama la RPC desde Angular → capa `backend`
- Qué formulario muestra el usuario → capa `frontend`
- Cómo se testea el servicio Angular → capa `quality`
