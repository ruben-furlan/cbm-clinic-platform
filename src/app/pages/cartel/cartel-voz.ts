import { CARTEL_DISPLAY_ESTADOS, CartelEstadoId } from '../../core/services/configuracion.service';

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
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function extraerMinutos(frase: string): number | null {
  const digitos = frase.match(/\d+/);
  if (digitos) {
    const valor = parseInt(digitos[0], 10);
    return valor > 0 && valor <= 480 ? valor : null;
  }

  if (/media hora/.test(frase)) {
    return 30;
  }

  if (/cuarto de hora/.test(frase)) {
    return 15;
  }

  if (/una? hora/.test(frase)) {
    return 60;
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
      titulo: minutos === 1 ? 'Volvemos en 1 minuto' : `Volvemos en ${minutos} minutos`,
      mensaje: p.mensaje,
    };
  }

  if (/abiert|abrimos|abro|abre|adelante|pasa/.test(frase)) {
    const p = preset('abierto');
    return { estado: 'abierto', titulo: p.titulo, mensaje: p.mensaje };
  }

  return null;
}
