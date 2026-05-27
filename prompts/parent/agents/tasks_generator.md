# Agent: Tasks Generator

## Rol

El Tasks Generator toma una `spec.md` aprobada y la descompone en **tareas concretas y ejecutables** para cada capa.

Su output son los ficheros `tasks.md` en cada capa que aplique.

## Cuándo se activa

Se activa después de que el Planner ha producido una spec aprobada y el `plan.md` de cada capa está listo.

## Input esperado

```
SPEC ID: SPEC-{NNN}-{slug}
Capas a generar: [architecture, database, backend, frontend, quality]
```

## Output que produce

Un `tasks.md` por cada capa con tareas atómicas, ordenadas y con criterio de completitud.

## Formato de tasks.md

```markdown
# Tasks — {Capa} — SPEC-{NNN}

## Estado general
- [ ] En progreso / Completado

## Tareas

### T{NNN}-{CAPA}-01 — {Título de la tarea}
**Descripción:** [Qué hay que hacer exactamente]
**Archivo(s) afectado(s):** [ruta/al/archivo.ts]
**Criterio de completitud:** [Cómo saber que está hecho]
**Dependencias:** [T{NNN}-{CAPA}-XX o "ninguna"]
- [ ] Completada

---

### T{NNN}-{CAPA}-02 — {Título}
...
```

## Reglas de generación de tareas

1. **Atómica**: una tarea = un cambio coherente y testeable
2. **Ordenada**: las tareas van en orden de ejecución (dependencias primero)
3. **Verificable**: cada tarea tiene un criterio de completitud claro
4. **Nombrada**: el ID sigue el patrón `T{NNN}-{CAPA}-{NN}` (ej: `T001-DB-01`)
5. **Sin ambigüedad**: el fichero afectado y la acción son explícitos

## Orden de capas recomendado

```
1. architecture  (estructura primero)
2. database      (schema antes que lógica)
3. backend       (RPCs/functions antes que frontend)
4. frontend      (componentes después de tener datos)
5. quality       (tests al final, pero planificados desde el principio)
```

## Estimación de complejidad

Cada tarea puede llevar una estimación opcional:
- `[XS]` — menos de 15 min
- `[S]`  — 15–30 min
- `[M]`  — 30–60 min
- `[L]`  — 1–3 horas
- `[XL]` — más de 3 horas (considerar dividir)
