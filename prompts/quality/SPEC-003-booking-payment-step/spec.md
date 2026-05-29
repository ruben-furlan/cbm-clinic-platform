# SPEC-003 Quality — Paso intermedio de pago

## Objetivo de calidad

Validar que el flujo de solicitud de cita incorpora el paso “Pago” sin romper selección de tratamiento ni Calendly.

## Criterios de aceptación

1. El proyecto compila sin errores TypeScript ni de templates Angular.
2. El stepper muestra 3 pasos.
3. El flujo correcto es: tratamiento → pago → fecha y hora.
4. El botón atrás desde fecha y hora vuelve a pago.
5. El botón atrás desde pago vuelve a tratamiento sin perder la selección visual.
6. Si no hay tratamiento seleccionado, no se renderiza Calendly.
7. El tratamiento seleccionado continúa disponible para `prefill.customAnswers` en Calendly.

## Fuera de alcance

- Tests end-to-end con Calendly real.
- Validar configuración externa de preguntas custom en Calendly.
