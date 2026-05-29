# Plan Quality — SPEC-003 Paso intermedio de pago

## Estrategia

1. Ejecutar `npm run build` para validar TypeScript strict, templates Angular y bundling.
2. Revisar estáticamente que `Step3CalendlyComponent` mantiene `prefill.customAnswers`.
3. Revisar que el template solo renderiza Calendly con tratamiento seleccionado.

## Limitaciones

No se automatiza una prueba E2E contra Calendly porque depende de un servicio externo y de interacción con iframe de terceros.
