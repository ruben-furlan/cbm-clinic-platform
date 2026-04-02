import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

type TreatmentItem = {
  title: string;
  description: string;
};

type CategorySlug = 'fisioterapia' | 'tecnicas' | 'pilates';

type TreatmentCategory = {
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoIntro: string;
  columns: TreatmentItem[][];
};

@Component({
  selector: 'app-treatments-page',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './treatments-page.html',
  styleUrl: './treatments-page.css'
})
export class TreatmentsPage {
  readonly categories: Record<CategorySlug, TreatmentCategory> = {
    fisioterapia: {
      title: 'Fisioterapia en Terrassa',
      description: 'Tratamientos especializados de fisioterapia con enfoque personalizado para tu recuperación en Terrassa.',
      seoTitle: 'Fisioterapia en Terrassa | CBM Fisioterapia',
      seoDescription: 'Fisioterapia en Terrassa con tratamiento personalizado. Alivia el dolor y recupera tu movilidad con CBM Fisioterapia.',
      seoIntro: 'En CBM Fisioterapia trabajamos la fisioterapia en Terrassa con un enfoque cercano y clínico. Tu fisioterapeuta en Terrassa diseña un tratamiento personalizado para aliviar dolor, recuperar movilidad y mejorar tu bienestar en cada fase de la recuperación.',
      columns: [
        [
          {
            title: 'Fisioterapia Traumatológica',
            description: 'La fisioterapia traumatológica es una especialidad que trata lesiones del sistema musculoesquelético (huesos, músculos, ligamentos, tendones) causadas por accidentes, caídas o cirugías. Su objetivo es aliviar el dolor, reducir la inflamación, restaurar la movilidad, fortalecer la zona afectada y acelerar la reincorporación a la vida diaria o deportiva'
          },
          {
            title: 'Fisioterapia Dermatofuncional',
            description: 'La fisioterapia dermatofuncional es una especialidad clínica que evalúa y trata alteraciones del sistema tegumentario (piel y tejido subcutáneo), combinando salud funcional y estética. Utiliza técnicas manuales y aparatología no invasiva para tratar cicatrices, fibrosis, edemas, celulitis, flacidez y mejorar la recuperación postquirúrgica, optimizando la funcionalidad de los tejidos'
          },
          {
            title: 'Fisioterapia Deportiva',
            description: 'La fisioterapia deportiva es una especialidad enfocada en prevenir, evaluar y tratar lesiones en deportistas de todos los niveles, utilizando técnicas manuales, ejercicio terapéutico y tecnología avanzada. Su objetivo principal es acelerar la recuperación funcional, aliviar el dolor y readaptar al atleta al gesto deportivo específico de su disciplina para mejorar su rendimiento y evitar futuras recaídas'
          },
        ],
        [
          {
            title: 'Drenaje Linfático',
            description: 'El drenaje linfático es una técnica de masaje terapéutico suave y rítmico que estimula el sistema linfático para reducir la retención de líquidos, edemas y mejorar la circulación. Utiliza movimientos lentos y superficiales para eliminar toxinas, mejorar el sistema inmunológico y aliviar la pesadez, los dreanajes linfaticos tambien ayudan a la mujer durante el emabarazo'
          },
          {
            title: 'Fisioterapia Pre/Post Quirúrgica',
            description: 'Diseñado para optimizar el estado físico del paciente antes de una cirugía (preREhabilitación) y acelerar su recuperación después de la misma (postoperatoria). El objetivo principal es minimizar complicaciones, reducir el dolor, mejorar la funcionalidad'
          },
          {
            title: 'Fisioterapia para el adulto mayor',
            description: 'La fisioterapia en el adulto mayor es una especialidad enfocada en prevenir, diagnosticar y tratar patologías y el deterioro funcional en personas mayores de 65 años. Su objetivo principal es mantener la autonomía, aliviar el dolor, mejorar la movilidad y reeducar la marcha, adaptando los ejercicios a las capacidades individuales para mejorar su calidad de vida'
          },
        ],
        [
          {
            title: 'Tratamientos en Espalda y Cervicales',
            description: 'La fisioterapia cervical y lumbar es una especialidad enfocada en evaluar, tratar y prevenir dolores y disfunciones de la columna, utilizando técnicas manuales, ejercicio terapéutico y agentes físicos. Sus objetivos son aliviar el dolor, restaurar la movilidad, corregir la postura, fortalecer la musculatura estabilizadora y prevenir recaídas crónicas en cuello y espalda baja'
          },
          {
            title: 'Fisioterapia Neurológica',
            description: 'La fisioterapia neurológica es una especialidad dedicada a evaluar y tratar trastornos del sistema nervioso central y periférico, buscando restaurar funciones motoras y sensoriales. Su objetivo es maximizar la independencia funcional, reducir la espasticidad, mejorar el equilibrio y mejorar la calidad de vida del paciente.'
          },
          {
            title: 'Articulación temporomandibular (ATM) ',
            description: 'La fisioterapia en la Articulación Temporomandibular (ATM) es una especialidad enfocada en tratar el dolor, la disfunción y la limitación de movimiento en la mandíbula. Combina terapia manual, ejercicio terapéutico y reeducación postural para aliviar la tensión en los músculos masticatorios, mejorar la apertura bucal y reducir dolores de cabeza, cuello u oídos relacionado.'
          },
          {
            title: 'Fisioterapia Infantil ',
            description: 'La fisioterapia infantil (o pediátrica) es la especialidad que evalúa, trata y cuida a bebés, niños y adolescentes (0-18 años) con retrasos en el desarrollo, desórdenes de movimiento o riesgo de padecerlos. Busca mejorar la funcionalidad, fuerza y autonomía mediante terapia manual, ejercicio y juego, abarcando áreas neurológicas, respiratorias y ortopédicas'
          }
        ]
      ]
    },
    tecnicas: {
      title: 'Técnicas utilizadas en Terrassa',
      description: 'Técnicas complementarias para acelerar la recuperación y potenciar resultados terapéuticos.',
      seoTitle: 'Técnicas utilizadas en Terrassa | CBM Fisioterapia',
      seoDescription: 'Técnicas utilizadas en Terrassa para acelerar la recuperación y mejorar resultados en CBM Fisioterapia.',
      seoIntro: 'Aplicamos Técnicas utilizadas en Terrassa para mejorar resultados clínicos en menos tiempo. Combinamos punción seca, radiofrecuencia y terapia manual para reducir molestias, recuperar función y apoyar una recuperación segura y sostenible.',
      columns: [
        [
          {
            title: 'Radiofrecuencia',
            description: 'La radiofrecuencia en fisioterapia (diatermia o tecarterapia) es una técnica no invasiva que utiliza ondas electromagnéticas para generar calor profundo en los tejidos. Acelera la recuperación, reduce el dolor y la inflamación (efecto antiedematoso) y favorece la regeneración celular, siendo ideal para lesiones agudas, crónicas y rehabilitación postquirúrgica'
          },
          {
            title: 'Punción seca',
            description: 'La punción seca es una técnica de fisioterapia invasiva y segura (con evidencia grado A) que utiliza agujas finas para tratar el dolor muscular, especialmente los puntos gatillo miofasciales (contracturas), sin inyectar sustancias. Al insertarse, busca relajar la musculatura, aliviar la rigidez, mejorar la movilidad y reducir el dolor crónico o agudo'
          }
        ],
        [
          {
            title: 'Ventosas',
            description: 'Las ventosas (o cupping) son una técnica terapéutica que utiliza la succión sobre la piel para estimular la circulación sanguínea, liberar la fascia y aliviar la tensión muscular. Sirven principalmente para reducir dolores crónicos, contracturas, mejorar la recuperación muscular, eliminar toxinas y aumentar el aporte de nutrientes y oxígeno a los tejidos'
          },
          {
            title: 'Kinesiotape',
            description: 'El kinesiotape o vendaje neuromuscular es una cinta elástica de algodón que sirve para aliviar el dolor muscular y articular, reducir la inflamación, mejorar la circulación y estabilizar articulaciones sin limitar el movimiento. Es muy utilizado en fisioterapia y deporte para recuperar lesiones, relajar contracturas y mejorar la propiocepción'
          }
        ]
      ]
    },
    pilates: {
      title: 'Pilates en Terrassa',
      description: 'El Pilates sirve principalmente para fortalecer el "centro" o core (abdominales, lumbares, glúteos), mejorar la postura corporal, aumentar la flexibilidad y prevenir lesiones mediante ejercicios conscientes. Combina fuerza y control respiratorio para tonificar los músculos sin hipertrofiarlos, aliviando dolores de espalda y reduciendo el estrés',
      seoTitle: 'Pilates en Terrassa | CBM Fisioterapia',
      seoDescription: 'Pilates en Terrassa para mejorar postura, movilidad y fuerza con acompañamiento profesional.',
      seoIntro: 'Nuestro Pilates en Terrassa está orientado a mejorar postura, movilidad y fortalecimiento de forma progresiva. Es una opción efectiva para personas con dolor recurrente o en procesos de recuperación que buscan moverse con más seguridad.',
      columns: [
        [
          {
            title: 'Fortalecimiento del Core',
            description: 'Se enfoca en la "faja abdominal" natural, lo que estabiliza la columna y mejora la fuerza de todo el cuerpo.'
          },
          {
            title: 'Corrección Postural',
            description: 'Estira los músculos cortos y fortalece los débiles, mejorando la alineación de la espalda, hombros y cuello.'
          }
        ],
        [
          {
            title: 'Rehabilitación y Prevención',
            description: 'es muy utilizado para tratar dolores lumbares, dolores de espalda, y rehabilitar lesiones musculares.\n' +
              'Conexión Mente-Cuerpo: Mejora la concentración y la respiración, actuando como una forma de meditación activa que disminuye el estrés.\n' +
              'Bienestar Integral: Mejora el equilibrio, la coordinación y ayuda a combatir la ansiedad'
          }
        ],
        [
          {
            title: 'Flexibilidad y Agilidadl',
            description: 'Aumenta la amplitud de movimiento, lo que permite un cuerpo más flexible y ágil.'
          },
          {
            title: 'Conexión Mente-Cuerpo',
            description: 'Mejora la concentración y la respiración, actuando como una forma de meditación activa que disminuye el estrés.'
          },
          {
            title: 'Bienestar Integral',
            description: 'Mejora el equilibrio, la coordinación y ayuda a combatir la ansiedad.'
          }
        ]
      ]
    }
  };

  readonly menuItems = [
    { slug: 'fisioterapia', label: 'Fisioterapia' },
    { slug: 'tecnicas', label: 'Técnicas' },
    { slug: 'pilates', label: 'Pilates' }
  ];

  activeCategory = this.categories.fisioterapia;
  activeSlug: CategorySlug = 'fisioterapia';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly title: Title,
    private readonly meta: Meta
  ) {
    this.route.paramMap.subscribe((params) => {
      const slug = (params.get('categoria') ?? 'fisioterapia') as CategorySlug;
      this.activeSlug = slug in this.categories ? slug : 'fisioterapia';
      this.activeCategory = this.categories[this.activeSlug];
      this.title.setTitle(this.activeCategory.seoTitle);
      this.meta.updateTag({
        name: 'description',
        content: this.activeCategory.seoDescription
      });
    });
  }
}
