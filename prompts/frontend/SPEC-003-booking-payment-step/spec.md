# SPEC-003 — Paso intermedio de pago en solicitud de cita

## Objetivo

Modificar el flujo frontend de `/solicitar-cita` para añadir un paso intermedio informativo de pago entre la selección de tratamiento y el embed de Calendly.

## Estado actual

El stepper de solicitud de cita tiene 2 pasos:

1. Tu tratamiento
2. Fecha y hora

Al continuar desde tratamientos, el usuario llega directamente al Calendly.

## Estado objetivo

El stepper debe tener 3 pasos:

1. Tu tratamiento
2. Pago
3. Fecha y hora

Antes de mostrar Calendly, el usuario debe revisar el tratamiento seleccionado, su precio y la forma de pago disponible actualmente: pago presencial en el centro.

## Requisitos funcionales

1. Mantener el tratamiento seleccionado en el estado actual del flujo.
2. El botón “Continuar” del paso de tratamientos avanza al paso “Pago”.
3. El paso “Pago” muestra:
   - Nombre del tratamiento.
   - Precio.
   - Texto secundario del tratamiento si existe.
   - Horarios/modalidad si existen para el tratamiento.
4. El paso “Pago” muestra una card de forma de pago con:
   - Título “Forma de pago”.
   - Opción informativa seleccionada “Pago en el local”.
   - Texto “El pago se realizará directamente en el centro el día de la cita.”
5. No se muestran opciones de Stripe, tarjeta, Bizum ni pago online.
6. El usuario no puede elegir otra forma de pago.
7. El botón principal del paso “Pago” avanza al paso “Fecha y hora”.
8. El botón “Atrás” respeta la navegación:
   - Desde “Pago” vuelve a “Tu tratamiento”.
   - Desde “Fecha y hora” vuelve a “Pago”.
9. El stepper visual muestra los tres pasos.
10. Si no hay tratamiento seleccionado, no se puede avanzar a “Pago” ni a “Fecha y hora”.
11. Calendly sigue recibiendo el tratamiento seleccionado mediante `prefill.customAnswers`.
12. No se manipula directamente el iframe de Calendly ni se rompe su integración.

## Requisitos UX/UI

- Mantener estética CBM: fondo claro, cards limpias, bordes redondeados, gradientes suaves rosa/violeta y sensación wellness/premium.
- Diseño responsive desktop/mobile.
- Copy principal del paso:
  - Título: “Confirma tu tratamiento”
  - Subtítulo: “Revisa el tratamiento seleccionado antes de elegir la fecha y hora.”
  - Apoyo: “Recibirás la confirmación de tu cita por correo electrónico al finalizar la reserva.”
  - Botón principal: “Continuar a fecha y hora →”
  - Botón secundario: “← Atrás”

## Fuera de alcance

- Implementar pago online.
- Añadir Stripe, tarjeta, Bizum u otras opciones seleccionables.
- Cambiar la configuración de Calendly.
- Modificar backend, Supabase o Netlify Functions.
