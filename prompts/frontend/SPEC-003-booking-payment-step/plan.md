# Plan — SPEC-003 Paso intermedio de pago

## Capa afectada

Frontend Angular standalone.

## Archivos a modificar

| Archivo                                           | Cambio                                                                                                            |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/app/features/booking-form/booking-form.ts`   | Ajustar navegación del stepper de 2 a 3 pasos, añadir guardas para pago y Calendly, mantener selección al volver. |
| `src/app/features/booking-form/booking-form.html` | Actualizar stepper visual, insertar paso “Pago” y mover Calendly al paso 3.                                       |
| `src/app/features/booking-form/booking-form.css`  | Añadir estilos responsive para resumen de pago y forma de pago con estética CBM.                                  |

## Decisiones técnicas

1. Se conserva `formData.treatment` como fuente local del tratamiento elegido.
2. Se conserva `BookingTreatmentService` para propagar el tratamiento a `Step3CalendlyComponent` y mantener `prefill.customAnswers`.
3. No se añade formulario de pago ni estado seleccionable de método de pago; la card de pago presencial es informativa y queda preparada visualmente para futuras opciones.
4. El paso “Fecha y hora” solo renderiza `app-step3-calendly` si existe `selectedTreatmentOption`.
5. La preselección desde tarifas aterriza en el paso “Pago” para que el usuario confirme antes de ver Calendly.
6. En móvil se mantiene el autoavance tras seleccionar tratamiento, pero ahora avanza a “Pago”.

## Riesgos y mitigación

- **Riesgo:** Saltar a Calendly sin tratamiento.  
  **Mitigación:** `irAlPaso2()` y `irAlPaso3()` validan `canAdvanceStep1` y `canAdvancePayment`.

- **Riesgo:** Perder la selección al volver.  
  **Mitigación:** `prevStep()` solo decrementa el paso y no limpia el tratamiento seleccionado.

- **Riesgo:** Romper Calendly.  
  **Mitigación:** No se modifica `Step3CalendlyComponent`; solo cambia cuándo se renderiza.
