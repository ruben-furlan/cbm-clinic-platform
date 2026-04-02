import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

interface BlogArticle {
  category: string;
  title: string;
  intro: string;
  sections: { title: string; points: string[] }[];
}

@Component({
  selector: 'app-blog-page',
  standalone: true,
  imports: [RouterLink, RevealOnScrollDirective, NgFor],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.css'
})
export class BlogPage {
  readonly categories = ['Dolor lumbar', 'Dolor cervical', 'Lesiones deportivas', 'Pilates'];

  readonly featuredArticle: BlogArticle = {
    category: 'Artículo destacado',
    title: 'Dolor lumbar en Terrassa: hábitos diarios que marcan la diferencia',
    intro:
      'Muchos pacientes nos consultan por dolor lumbar recurrente. En esta guía práctica compartimos recomendaciones sencillas para reducir molestias y mejorar la movilidad.',
    sections: [
      {
        title: 'Consejos prácticos',
        points: [
          'Alterna periodos de sentado con pausas activas cada 45-60 minutos.',
          'Prioriza ejercicios de movilidad y fuerza adaptados a tu nivel.',
          'Evita aumentar la carga física de forma brusca en trabajo o deporte.'
        ]
      },
      {
        title: 'Cuándo acudir al fisioterapeuta',
        points: [
          'Cuando el dolor dura más de una semana o limita tareas básicas.',
          'Si el dolor vuelve de forma repetida pese a descansar.',
          'Si quieres prevenir recaídas y entender la causa del problema.'
        ]
      }
    ]
  };

  readonly articles: BlogArticle[] = [
    {
      category: 'Dolor cervical',
      title: 'Tensión cervical por trabajo de oficina: cómo reducirla',
      intro:
        'El cuello cargado es uno de los motivos más frecuentes de consulta en nuestra clínica de Terrassa. Una buena estrategia combina ergonomía, terapia manual y ejercicio terapéutico.',
      sections: [
        {
          title: 'Consejos prácticos',
          points: [
            'Ajusta altura de pantalla y apoyo lumbar en el puesto de trabajo.',
            'Haz micropausas de movilidad cervical y escapular durante la jornada.',
            'Controla respiración y tensión mandibular en momentos de estrés.'
          ]
        },
        {
          title: 'Cuándo acudir al fisioterapeuta',
          points: [
            'Si aparecen cefaleas asociadas al dolor cervical.',
            'Cuando notas limitación al girar el cuello o conducir.',
            'Si las molestias persisten más de 7-10 días.'
          ]
        }
      ]
    },
    {
      category: 'Técnicas Utilizadas',
      title: 'Punción seca: qué es y cuándo puede ayudarte',
      intro:
        'La punción seca es una técnica útil en puntos gatillo y dolor miofascial. Siempre la integramos dentro de un plan personalizado para mejorar función y prevenir recaídas.',
      sections: [
        {
          title: 'Consejos prácticos',
          points: [
            'Consulta siempre si está indicada para tu caso concreto.',
            'Combínala con ejercicio terapéutico para sostener resultados.',
            'Sigue las pautas posteriores de hidratación y movilidad suave.'
          ]
        },
        {
          title: 'Cuándo acudir al fisioterapeuta',
          points: [
            'Si arrastras sobrecargas musculares persistentes.',
            'Si reaparecen contracturas tras entrenar o trabajar.',
            'Si quieres un abordaje preciso para dolor muscular localizado.'
          ]
        }
      ]
    },
    {
      category: 'Pilates',
      title: 'Pilates clínico para prevenir recaídas en espalda y cuello',
      intro:
        'El Pilates mejora control motor, estabilidad y confianza al moverte. Es un recurso clave para pacientes de Terrassa, Rubí y Sabadell que buscan continuidad tras la fase de dolor.',
      sections: [
        {
          title: 'Consejos prácticos',
          points: [
            'Empieza con ejercicios básicos bien guiados y progresa por fases.',
            'Prioriza calidad del movimiento frente a cantidad de repeticiones.',
            'Mantén una rutina semanal para consolidar resultados.'
          ]
        },
        {
          title: 'Cuándo acudir al fisioterapeuta',
          points: [
            'Si has mejorado del dolor pero te falta fuerza y control.',
            'Si quieres prevenir recaídas lumbares o cervicales.',
            'Si necesitas adaptar el ejercicio a tu historial de lesiones.'
          ]
        }
      ]
    }
  ];
}
