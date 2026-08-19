import { TarifaCategoria } from '../../core/services/tarifas.service';
import { SeoSlug } from '../seo-pages/seo-content.data';

/**
 * Grafo del asistente de orientación.
 *
 * Guiado por botones: no hay entrada de texto libre ni modelo de lenguaje. El
 * recorrido es determinista y el copy es orientativo, nunca diagnóstico
 * (ver regla de contenido sanitario en AGENTS.md).
 */

export type TriageNext =
  | { readonly kind: 'node'; readonly nodeId: string }
  | { readonly kind: 'outcome'; readonly outcomeId: string };

export interface TriageOption {
  readonly id: string;
  readonly label: string;
  readonly next: TriageNext;
}

export interface TriageNode {
  readonly id: string;
  readonly pregunta: string;
  readonly opciones: readonly TriageOption[];
}

export interface TriageOutcome {
  readonly id: string;
  /** Nombre del servicio recomendado. */
  readonly servicio: string;
  /** Frase de apertura que valida al usuario antes de proponer nada. */
  readonly reconocimiento: string;
  /** Por qué encaja este servicio, en una frase. */
  readonly porQue: string;
  /** Categoría de tarifa con la que se preselecciona la reserva. */
  readonly categoria: TarifaCategoria;
  /** Landing de la que se reutilizan `treatment` y `whenToCome`. */
  readonly seoSlug?: SeoSlug;
  /** Pasos propios, solo para outcomes sin landing asociada. */
  readonly pasos?: readonly string[];
  /** Señales de alarma propias, solo para outcomes sin landing asociada. */
  readonly avisos?: readonly string[];
  /** Segunda vía, mencionada en segundo plano. */
  readonly alternativa?: string;
}

export const TRIAGE_ROOT_ID = 'inicio';

export const TRIAGE_NODES: Record<string, TriageNode> = {
  inicio: {
    id: 'inicio',
    pregunta: '¿Qué te trae por aquí?',
    opciones: [
      { id: 'dolor', label: 'Me duele algo', next: { kind: 'node', nodeId: 'zona' } },
      {
        id: 'deporte',
        label: 'Me he lesionado haciendo deporte',
        next: { kind: 'outcome', outcomeId: 'deportiva' },
      },
      {
        id: 'operacion',
        label: 'Me han operado hace poco',
        next: { kind: 'outcome', outcomeId: 'postquirurgica' },
      },
      {
        id: 'prevenir',
        label: 'Quiero moverme mejor y prevenir',
        next: { kind: 'outcome', outcomeId: 'pilates' },
      },
      { id: 'otro', label: 'Es otro tema', next: { kind: 'node', nodeId: 'otros' } },
    ],
  },

  zona: {
    id: 'zona',
    pregunta: '¿Dónde te molesta?',
    opciones: [
      { id: 'cuello', label: 'Cuello o nuca', next: { kind: 'outcome', outcomeId: 'cervical' } },
      {
        id: 'lumbar',
        label: 'Espalda baja (zona lumbar)',
        next: { kind: 'outcome', outcomeId: 'lumbar' },
      },
      { id: 'hombro', label: 'Hombro o brazo', next: { kind: 'outcome', outcomeId: 'hombro' } },
      {
        id: 'rodilla',
        label: 'Rodilla o pierna',
        next: { kind: 'outcome', outcomeId: 'deportiva' },
      },
      {
        id: 'tendon',
        label: 'Codo, talón u otro tendón',
        next: { kind: 'outcome', outcomeId: 'tendinitis' },
      },
      { id: 'mandibula', label: 'Mandíbula', next: { kind: 'outcome', outcomeId: 'atm' } },
      {
        id: 'contractura',
        label: 'Una contractura profunda que no se va',
        next: { kind: 'outcome', outcomeId: 'puncion' },
      },
      { id: 'otra-zona', label: 'Otra zona', next: { kind: 'outcome', outcomeId: 'valoracion' } },
    ],
  },

  otros: {
    id: 'otros',
    pregunta: 'Cuéntame un poco más',
    opciones: [
      {
        id: 'circulacion',
        label: 'Embarazo, piernas cansadas o retención',
        next: { kind: 'outcome', outcomeId: 'drenaje' },
      },
      {
        id: 'infantil',
        label: 'Es para un bebé o un niño',
        next: { kind: 'outcome', outcomeId: 'infantil' },
      },
      {
        id: 'neuro',
        label: 'Secuelas neurológicas (ictus, Parkinson…)',
        next: { kind: 'outcome', outcomeId: 'neurologica' },
      },
      {
        id: 'cicatriz',
        label: 'Una cicatriz o alteración de la piel',
        next: { kind: 'outcome', outcomeId: 'dermatofuncional' },
      },
      {
        id: 'mayor',
        label: 'Movilidad y autonomía en personas mayores',
        next: { kind: 'outcome', outcomeId: 'adultoMayor' },
      },
      {
        id: 'no-se',
        label: 'No lo tengo claro',
        next: { kind: 'outcome', outcomeId: 'valoracion' },
      },
    ],
  },
};

export const TRIAGE_OUTCOMES: Record<string, TriageOutcome> = {
  lumbar: {
    id: 'lumbar',
    servicio: 'Fisioterapia para dolor lumbar',
    reconocimiento: 'El dolor lumbar es una de las consultas más frecuentes en la clínica.',
    porQue:
      'Buscamos la causa de tu dolor y combinamos terapia manual con ejercicio para que el alivio dure.',
    categoria: 'fisioterapia',
    seoSlug: 'fisioterapia-dolor-lumbar-terrassa',
    alternativa: 'Si el dolor te vuelve una y otra vez, el pilates terapéutico ayuda a prevenirlo.',
  },

  cervical: {
    id: 'cervical',
    servicio: 'Fisioterapia cervical',
    reconocimiento: 'La tensión de cuello suele venir de posturas mantenidas y estrés acumulado.',
    porQue:
      'Trabajamos la movilidad cervical y las causas del día a día, no solo el punto que duele.',
    categoria: 'fisioterapia',
    seoSlug: 'fisioterapia-cervical-terrassa',
    alternativa: 'Si notas nudos muy localizados, valoramos si la punción seca puede ayudarte.',
  },

  hombro: {
    id: 'hombro',
    servicio: 'Fisioterapia para dolor de hombro',
    reconocimiento: 'El hombro es una articulación delicada y conviene no dejarlo pasar.',
    porQue:
      'Exploramos qué estructura está afectada y recuperamos el movimiento de forma progresiva.',
    categoria: 'fisioterapia',
    seoSlug: 'fisioterapia-dolor-hombro-terrassa',
  },

  tendinitis: {
    id: 'tendinitis',
    servicio: 'Fisioterapia para tendinopatías',
    reconocimiento: 'Las molestias de tendón tienden a cronificarse si no se tratan bien.',
    porQue:
      'Trabajamos la capacidad de carga del tendón con ejercicio progresivo, que es lo que da resultados duraderos.',
    categoria: 'fisioterapia',
    seoSlug: 'fisioterapia-tendinitis-terrassa',
  },

  deportiva: {
    id: 'deportiva',
    servicio: 'Fisioterapia deportiva',
    reconocimiento: 'Volver al deporte demasiado pronto es la causa más común de recaída.',
    porQue:
      'Te acompañamos desde la fase aguda hasta la vuelta a tu nivel, con readaptación progresiva.',
    categoria: 'fisioterapia',
    seoSlug: 'fisioterapia-lesiones-deportivas-terrassa',
  },

  postquirurgica: {
    id: 'postquirurgica',
    servicio: 'Rehabilitación postquirúrgica',
    reconocimiento: 'Después de una operación, el plan de recuperación marca la diferencia.',
    porQue:
      'Adaptamos la rehabilitación a tu cirugía y a tu evolución, en coordinación con tu equipo médico.',
    categoria: 'fisioterapia',
    seoSlug: 'fisioterapia-recuperacion-postquirurgica-terrassa',
  },

  pilates: {
    id: 'pilates',
    servicio: 'Pilates terapéutico',
    reconocimiento: 'Prevenir es mucho más cómodo que recuperarse.',
    porQue:
      'Trabajo guiado y adaptado a tu nivel para ganar fuerza profunda, control postural y confianza al moverte.',
    categoria: 'pilates',
    seoSlug: 'pilates-terapeutico-terrassa',
  },

  puncion: {
    id: 'puncion',
    servicio: 'Punción seca',
    reconocimiento: 'Esas contracturas profundas que no ceden tienen abordaje.',
    porQue:
      'Es una técnica precisa sobre los puntos gatillo, siempre dentro de un plan de tratamiento completo.',
    categoria: 'fisioterapia',
    seoSlug: 'puncion-seca-terrassa',
  },

  atm: {
    id: 'atm',
    servicio: 'Fisioterapia de ATM (mandíbula)',
    reconocimiento: 'El dolor de mandíbula y el bruxismo son más tratables de lo que parece.',
    porQue:
      'Abordamos la musculatura masticatoria y su relación con la zona cervical, que casi siempre van juntas.',
    categoria: 'fisioterapia',
    pasos: [
      'Valoración de la articulación temporomandibular y de la zona cervical.',
      'Terapia manual intra y extraoral para reducir tensión y mejorar la apertura.',
      'Pautas de relajación y control del bruxismo para el día a día.',
    ],
    avisos: [
      'Si notas bloqueos al abrir la boca o el dolor te impide comer con normalidad.',
      'Si llevas férula de descarga y aun así el dolor persiste.',
    ],
  },

  drenaje: {
    id: 'drenaje',
    servicio: 'Drenaje linfático',
    reconocimiento: 'La sensación de pesadez y la retención tienen tratamiento específico.',
    porQue:
      'Técnica suave que ayuda a movilizar líquidos y aliviar la pesadez, muy indicada en embarazo y postoperatorio.',
    categoria: 'fisioterapia',
    pasos: [
      'Valoración inicial para descartar contraindicaciones antes de empezar.',
      'Sesiones de drenaje linfático manual adaptadas a tu situación.',
      'Recomendaciones de descanso, movilidad e hidratación para mantener el efecto.',
    ],
    avisos: [
      'Si la hinchazón aparece de forma brusca en una sola pierna, consulta antes con tu médico.',
      'Si estás embarazada, coméntanoslo al reservar para adaptar la sesión.',
    ],
  },

  infantil: {
    id: 'infantil',
    servicio: 'Fisioterapia infantil',
    reconocimiento: 'Acompañamos el desarrollo motor de los más pequeños con mucho cuidado.',
    porQue:
      'Tratamos alteraciones posturales, tortícolis congénita y dificultades del desarrollo motor con un abordaje respetuoso.',
    categoria: 'fisioterapia',
    pasos: [
      'Valoración del desarrollo motor adaptada a la edad.',
      'Tratamiento mediante juego y movimiento, siempre con la familia presente.',
      'Pautas sencillas para seguir trabajando en casa.',
    ],
    avisos: [
      'Si tu pediatra os ha derivado, trae el informe a la primera visita.',
      'Ante cualquier signo de alarma en el desarrollo, consulta primero con pediatría.',
    ],
  },

  neurologica: {
    id: 'neurologica',
    servicio: 'Fisioterapia neurológica',
    reconocimiento: 'En estos casos la constancia y un plan bien ajustado son lo que más suma.',
    porQue:
      'Trabajamos para recuperar y mantener funciones motoras, con objetivos realistas y revisables.',
    categoria: 'fisioterapia',
    pasos: [
      'Valoración funcional para fijar objetivos alcanzables contigo.',
      'Trabajo de movilidad, equilibrio y control motor adaptado a cada fase.',
      'Coordinación con tu equipo médico y pautas para el entorno familiar.',
    ],
    avisos: [
      'Trae los informes médicos que tengas a la primera visita.',
      'Ante un cambio brusco en la movilidad o el habla, acude a urgencias.',
    ],
  },

  dermatofuncional: {
    id: 'dermatofuncional',
    servicio: 'Fisioterapia dermatofuncional',
    reconocimiento: 'Una cicatriz que tira o molesta se puede tratar, aunque haga tiempo.',
    porQue:
      'Trabajamos la elasticidad del tejido y las adherencias para recuperar movilidad y sensibilidad.',
    categoria: 'fisioterapia',
    pasos: [
      'Valoración del estado de la cicatriz y del tejido de alrededor.',
      'Técnicas manuales para mejorar elasticidad y reducir adherencias.',
      'Pautas de automasaje e hidratación para mantener los resultados.',
    ],
    avisos: [
      'Espera a que la herida esté completamente cerrada antes de empezar.',
      'Si la cicatriz se enrojece, supura o duele de forma creciente, consulta con tu médico.',
    ],
  },

  adultoMayor: {
    id: 'adultoMayor',
    servicio: 'Fisioterapia para adultos mayores',
    reconocimiento: 'Mantener la autonomía es el mejor objetivo que nos podemos marcar.',
    porQue:
      'Trabajamos movilidad, equilibrio y fuerza para conservar independencia y reducir el riesgo de caídas.',
    categoria: 'fisioterapia',
    pasos: [
      'Valoración de movilidad, equilibrio y riesgo de caídas.',
      'Ejercicio terapéutico adaptado, progresivo y seguro.',
      'Consejos de adaptación del hogar y de la actividad diaria.',
    ],
    avisos: [
      'Si ha habido una caída reciente con golpe fuerte, que lo valore antes un médico.',
      'Trae la lista de medicación a la primera visita: algunas afectan al equilibrio.',
    ],
  },

  valoracion: {
    id: 'valoracion',
    servicio: 'Primera valoración de fisioterapia',
    reconocimiento: 'No hace falta que sepas qué tienes: para eso está la valoración.',
    porQue:
      'Exploramos qué te pasa y te explicamos las opciones antes de decidir cualquier tratamiento.',
    categoria: 'fisioterapia',
    pasos: [
      'Entrevista para entender tu historia y tus objetivos.',
      'Exploración física para orientar el origen de las molestias.',
      'Propuesta de plan de tratamiento explicada con calma.',
    ],
    avisos: [
      'Si el dolor apareció tras un golpe fuerte o una caída, acude antes a un médico.',
      'Si tienes fiebre, pérdida de fuerza o el dolor no te deja dormir, consúltalo con tu médico.',
    ],
  },
};

/** Señales de derivación médica que se muestran en todos los resultados. */
export const AVISO_DERIVACION =
  'Si el dolor apareció tras un golpe fuerte, o notas fiebre, pérdida de fuerza u hormigueo que no cede, consulta antes con tu médico.';

export const AVISO_NO_DIAGNOSTICO =
  'Esto es una orientación, no un diagnóstico. La valoración la hace el fisioterapeuta en consulta.';
