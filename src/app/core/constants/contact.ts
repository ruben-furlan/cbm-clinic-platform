/**
 * Datos de contacto de la clínica.
 *
 * El número estaba repetido como literal en varios componentes; el código nuevo
 * debe importarlo desde aquí.
 */

/** Número en formato internacional sin `+`, tal y como lo espera `wa.me`. */
export const WHATSAPP_PHONE = '34662561672';

/** Número local para enlaces `tel:`. */
export const PHONE_TEL = '662561672';

/** Construye un enlace de WhatsApp con el mensaje ya redactado. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
