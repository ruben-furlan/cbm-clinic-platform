import { CARTEL_DISPLAY_ESTADOS, CartelEstadoId } from '../../core/services/configuracion.service';
import { formatearTituloVolvemos } from '../../shared/volvemos-titulo';

/** Resultado de interpretar una frase dicha por voz para el cartel. */
export interface CartelVozResultado {
  estado: CartelEstadoId;
  /** Solo para el estado "volvemos": minutos detectados en la frase. */
  minutos?: number;
  titulo: string;
  mensaje: string;
}

const NUMEROS_EN_PALABRAS: Record<string, number> = {
  un: 1,
  uno: 1,
  una: 1,
  dos: 2,
  tres: 3,
  cuatro: 4,
  cinco: 5,
  seis: 6,
  siete: 7,
  ocho: 8,
  nueve: 9,
  diez: 10,
  quince: 15,
  veinte: 20,
  veinticinco: 25,
  treinta: 30,
  cuarenta: 40,
  cincuenta: 50,
  sesenta: 60,
};

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function extraerMinutos(frase: string): number | null {
  // Las frases con "hora(s)" se resuelven antes que los dígitos sueltos: si no,
  // "2 horas" se leería como "2 minutos" (el primer dígito de la frase).
  if (/hora y media/.test(frase)) {
    return 90;
  }

  if (/hora y cuarto/.test(frase)) {
    return 75;
  }

  if (/cuarto de hora/.test(frase)) {
    return 15;
  }

  if (/media hora/.test(frase)) {
    return 30;
  }

  const horasEnDigitos = frase.match(/(\d+)\s+horas?\b/);
  if (horasEnDigitos) {
    const horas = parseInt(horasEnDigitos[1], 10);
    if (horas > 0 && horas <= 8) {
      return horas * 60;
    }
  }

  for (const [palabra, valor] of Object.entries(NUMEROS_EN_PALABRAS)) {
    if (new RegExp(`\\b${palabra}\\s+horas?\\b`).test(frase)) {
      return valor * 60;
    }
  }

  if (/\bhora\b/.test(frase)) {
    return 60;
  }

  const digitos = frase.match(/\d+/);
  if (digitos) {
    const valor = parseInt(digitos[0], 10);
    return valor > 0 && valor <= 480 ? valor : null;
  }

  for (const [palabra, valor] of Object.entries(NUMEROS_EN_PALABRAS)) {
    if (new RegExp(`\\b${palabra}\\b`).test(frase)) {
      return valor;
    }
  }

  return null;
}

function preset(id: CartelEstadoId) {
  return CARTEL_DISPLAY_ESTADOS.find((e) => e.id === id) ?? CARTEL_DISPLAY_ESTADOS[0];
}

/**
 * Interpreta una frase transcrita ("volvemos en 20", "cerrado por hoy",
 * "toca el timbre"…) y devuelve el estado del cartel que le corresponde,
 * o `null` si no se reconoce ninguna intención.
 */
export function interpretarComandoCartel(transcripcion: string): CartelVozResultado | null {
  const frase = normalizar(transcripcion);

  if (!frase.trim()) {
    return null;
  }

  if (/timbre|llama|golpea/.test(frase)) {
    const p = preset('timbre');
    return { estado: 'timbre', titulo: p.titulo, mensaje: p.mensaje };
  }

  if (/cerrad|cerramos|cierro|cierra|hasta manana/.test(frase)) {
    const p = preset('cerrado');
    return { estado: 'cerrado', titulo: p.titulo, mensaje: p.mensaje };
  }

  if (/volv|vuelv|vengo|venimos|regres|momento|minut|enseguida|ahora (vengo|voy)/.test(frase)) {
    const minutos = extraerMinutos(frase) ?? 5;
    const p = preset('volvemos');
    return {
      estado: 'volvemos',
      minutos,
      titulo: formatearTituloVolvemos(minutos),
      mensaje: p.mensaje,
    };
  }

  if (/abiert|abrimos|abro|abre|adelante|pasa/.test(frase)) {
    const p = preset('abierto');
    return { estado: 'abierto', titulo: p.titulo, mensaje: p.mensaje };
  }

  return null;
}
