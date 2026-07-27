/**
 * Título "Volvemos en…" a partir de los minutos, compartido entre el
 * reconocimiento de voz del cartel (/cartel), sus chips de un toque y la
 * cuenta atrás en vivo de la pantalla del local (/display/horizontal).
 */
export function formatearTituloVolvemos(minutos: number): string {
  if (minutos <= 0) {
    return 'Volvemos enseguida';
  }

  if (minutos < 60) {
    return minutos === 1 ? 'Volvemos en 1 minuto' : `Volvemos en ${minutos} minutos`;
  }

  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  const horasTexto = `${horas} hora${horas > 1 ? 's' : ''}`;

  if (resto === 0) {
    return `Volvemos en ${horasTexto}`;
  }

  if (resto === 30) {
    return `Volvemos en ${horasTexto} y media`;
  }

  return `Volvemos en ${horasTexto} y ${resto} minutos`;
}
