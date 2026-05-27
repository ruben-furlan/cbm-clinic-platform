# SPEC-002 - Separar horarios de Pilates en tarifas

## Feature Branch

feature/SPEC-002-pilates-horarios-tarifas

## Created

2026-05-27

## Status

In Progress

## Input

Actualmente los horarios de Pilates están almacenados dentro del campo `descripcion` de la tabla `tarifas`, mezclados con información como la matrícula.

Ejemplo actual:

"Matrícula de Inscripción : 40 € Horarios: Lunes Miércoles y Viernes de 8:00h - 9:00h; 9:00h - 10:00h; 19:00h - 20:00h; 20:00h - 21:00h"

Esto provoca que el contenido se muestre sin formato, sea difícil de leer para el usuario y sea difícil de editar desde el panel de administración.

## Objetivo

Separar los horarios de Pilates en un nuevo campo `horarios` dentro de la tabla `tarifas`, permitiendo editarlo desde el panel admin y mostrarlo como un bloque visual independiente en la web.

## User Story

Como administrador de CBM Fisioterapia,  
quiero editar los horarios de Pilates en un campo separado de la descripción,  
para que la información sea más clara para el usuario y más fácil de mantener desde el admin.

## Prioridad

Alta.

## Alcance funcional

Esta SPEC afecta a:

- Tabla `tarifas` en Supabase.
- `TarifasService`.
- Panel admin de edición de tarifas.
- Página `/tarifas`.
- Sección de tarifas en la home.
- Paso 1 del stepper de solicitar cita.

## Fuera de alcance

Esta SPEC no incluye:

- Crear un calendario dinámico de horarios.
- Cambiar precios.
- Crear nuevas categorías.
- Cambiar la lógica de solicitud de cita.
- Validar formato interno de los horarios.
- Crear una tabla relacional de horarios.

## Escenarios y testing

### Escenario 1 - Mostrar horarios en Pilates

Given una tarifa de categoría `Pilates` con el campo `horarios` informado,  
When el usuario visualiza la tarifa,  
Then se muestra un bloque separado con el label `Horarios disponibles`.

### Escenario 2 - Ocultar horarios vacíos

Given una tarifa con `horarios` null, vacío o solo espacios,  
When el usuario visualiza la tarifa,  
Then no se muestra ningún bloque de horarios.

### Escenario 3 - Editar horarios desde admin

Given un administrador está editando una tarifa,  
When modifica el campo `Horarios (opcional)` y guarda los cambios,  
Then el valor queda persistido en Supabase dentro del campo `horarios`.

### Escenario 4 - Migrar datos existentes

Given una tarifa de Pilates con horarios mezclados dentro de `descripcion`,  
When se aplica la migración de datos,  
Then los horarios pasan al campo `horarios`  
And la descripción queda limpia.

## Requerimientos funcionales

1. El sistema MUST añadir el campo `horarios` a la tabla `tarifas`.
2. El campo `horarios` MUST ser de tipo `text`.
3. El campo `horarios` MUST ser nullable.
4. El panel admin MUST permitir editar `horarios`.
5. El campo admin MUST ser un textarea.
6. El label del campo MUST ser `Horarios (opcional)`.
7. El campo `descripcion` MUST quedar limpio y reservado para la descripción del servicio.
8. La web MUST mostrar los horarios en un bloque separado si existen.
9. La web MUST ocultar el bloque si `horarios` está vacío o null.
10. `TarifasService` MUST incluir `horarios` en consultas y actualizaciones.
11. La página `/tarifas` MUST mostrar horarios separados para Pilates.
12. La home MUST mostrar horarios separados para Pilates.
13. El stepper de solicitar cita MUST mostrar horarios separados para Pilates.

## Requerimientos técnicos

1. Añadir columna `horarios text null` en Supabase, tabla `tarifas`.
2. Actualizar tipos o interfaces de tarifa para incluir `horarios`.
3. Actualizar queries de lectura de tarifas.
4. Actualizar operación de edición de tarifa desde admin.
5. Renderizar horarios de forma condicional.
6. Evitar mostrar el bloque si `horarios.trim()` está vacío.
7. Mantener compatibilidad con tarifas existentes.

## Entidades / modelos afectados

### Tarifa

Nuevo campo:

- `horarios`: texto libre nullable para horarios fijos del servicio.

## Cambios en base de datos

Tabla:

```txt
tarifas
