# Guidelines — Parent Layer

## Principios SDD

1. **Spec-first**: ninguna tarea de código se inicia sin una `spec.md` aprobada.
2. **Una spec, varias capas**: cada spec se descompone por capa (architecture, database, backend, frontend, quality).
3. **Trazabilidad**: cada fichero de código generado referencia el ID de la spec que lo originó.
4. **Iteración controlada**: una spec puede tener múltiples versiones (`v1`, `v2`). No se mezclan versiones en una misma rama.
5. **Calidad integrada**: quality no es opcional. Toda spec incluye su capa de tests.

## Cómo crear una nueva spec

1. Crea el directorio `prompts/{capa}/SPEC-{NNN}-{slug}/`
2. Escribe `spec.md` (qué y por qué)
3. Escribe `plan.md` (cómo, decisiones técnicas)
4. Escribe `tasks.md` (lista de tareas ejecutables)
5. Repite para cada capa que aplique

## Cuándo aplica cada capa

| Capa | Aplica cuando... |
|------|-----------------|
| `architecture` | Se define estructura de módulos, rutas, servicios |
| `database` | Se crea o modifica un esquema de tabla en Supabase |
| `backend` | Se añade una Netlify Function o RPC de Supabase |
| `frontend` | Se crea o modifica un componente Angular |
| `quality` | Siempre — toda spec tiene tests asociados |

## Idioma

- Documentación SDD: **español**
- Código fuente (variables, funciones, clases): **inglés**
- Comentarios en código: **español** (siguiendo la convención del proyecto)
- Contenido visible al usuario: **español / catalán / inglés** (i18n vía LanguageService)

## Gestión de ramas

```
main          → producción
feature/SPEC-{NNN}-{slug}  → desarrollo de una spec
```

Nunca desarrollar directamente en `main`.

## Revisión antes de merge

- [ ] Todos los `tasks.md` marcados como completados
- [ ] Tests de quality pasando
- [ ] Sin errores TypeScript (`ng build` limpio)
- [ ] Prettier aplicado
