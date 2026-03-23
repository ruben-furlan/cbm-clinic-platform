import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

type TreatmentItem = {
  title: string;
  description: string;
  equipment: string;
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
            description: 'Tratamiento de lesiones y dolencias relacionadas con traumatismos.',
            equipment: 'Ultrasonido, máquinas de electroterapia.'
          },
          {
            title: 'Fisioterapia Dermatofuncional',
            description: 'Enfoque en la rehabilitación de la piel y tejidos.',
            equipment: 'Equipos de radiofrecuencia.'
          }
        ],
        [
          {
            title: 'Fisioterapia Deportiva',
            description: 'Tratamiento y prevención de lesiones en deportistas.',
            equipment: 'Equipos de punción seca, kinesiotape.'
          },
          {
            title: 'Drenaje Linfático',
            description: 'Técnica para mejorar la circulación y reducir edemas.',
            equipment: 'Ventosas, masajes manuales.'
          },
          {
            title: 'Fisioterapia Post-Quirúrgica',
            description: 'Rehabilitación tras procedimientos quirúrgicos.',
            equipment: 'Dispositivos de electroestimulación.'
          }
        ],
        [
          {
            title: 'Fisioterapia Geriátrica',
            description: 'Atención especializada para personas mayores.',
            equipment: 'Auxiliares de movilidad, kinesiotape.'
          },
          {
            title: 'Tratamientos en Espalda y Cervicales',
            description: 'Terapias específicas para problemas de espalda y cuello.',
            equipment: 'Equipos de terapia manual.'
          },
          {
            title: 'Fisioterapia Neurológica',
            description: 'Tratamiento de condiciones neurológicas como parálisis facial.',
            equipment: 'Equipos de estimulación neuromuscular.'
          }
        ]
      ]
    },
    tecnicas: {
      title: 'Técnicas terapéuticas en Terrassa',
      description: 'Técnicas complementarias para acelerar la recuperación y potenciar resultados terapéuticos.',
      seoTitle: 'Técnicas terapéuticas en Terrassa | CBM Fisioterapia',
      seoDescription: 'Técnicas terapéuticas en Terrassa para acelerar la recuperación y mejorar resultados en CBM Fisioterapia.',
      seoIntro: 'Aplicamos técnicas terapéuticas en Terrassa para mejorar resultados clínicos en menos tiempo. Combinamos punción seca, radiofrecuencia y terapia manual para reducir molestias, recuperar función y apoyar una recuperación segura y sostenible.',
      columns: [
        [
          {
            title: 'Radiofrecuencia',
            description: 'Estimulación de tejidos para mejorar dolor, elasticidad y recuperación funcional.',
            equipment: 'Equipo de radiofrecuencia terapéutica.'
          },
          {
            title: 'Punción seca',
            description: 'Abordaje de puntos gatillo miofasciales para reducir dolor y mejorar movilidad.',
            equipment: 'Agujas estériles de punción seca.'
          }
        ],
        [
          {
            title: 'Ventosas',
            description: 'Técnica de descompresión tisular para aliviar tensión muscular y mejorar circulación.',
            equipment: 'Set de ventosas terapéuticas.'
          },
          {
            title: 'Kinesiotape',
            description: 'Vendaje neuromuscular para soporte funcional sin limitar el movimiento.',
            equipment: 'Cintas de kinesiotape de uso clínico.'
          }
        ],
        [
          {
            title: 'Electroterapia',
            description: 'Aplicación de corrientes terapéuticas para analgesia y reeducación muscular.',
            equipment: 'Dispositivos de electroestimulación.'
          }
        ]
      ]
    },
    pilates: {
      title: 'Pilates terapéutico en Terrassa',
      description: 'Sesiones guiadas para mejorar control corporal, postura y prevención de recaídas.',
      seoTitle: 'Pilates terapéutico en Terrassa | CBM Fisioterapia',
      seoDescription: 'Pilates terapéutico en Terrassa para mejorar postura, movilidad y fuerza con acompañamiento profesional.',
      seoIntro: 'Nuestro pilates terapéutico en Terrassa está orientado a mejorar postura, movilidad y fortalecimiento de forma progresiva. Es una opción efectiva para personas con dolor recurrente o en procesos de recuperación que buscan moverse con más seguridad.',
      columns: [
        [
          {
            title: 'Control motor',
            description: 'Trabajo de estabilidad y coordinación para movimientos más eficientes.',
            equipment: 'Material de pilates y ejercicios de control guiado.'
          },
          {
            title: 'Dolor lumbar',
            description: 'Programa específico para reducir molestias lumbares y recuperar funcionalidad.',
            equipment: 'Ejercicios terapéuticos progresivos y soporte postural.'
          }
        ],
        [
          {
            title: 'Rehabilitación',
            description: 'Progresión adaptada para volver a la actividad de forma segura.',
            equipment: 'Rutinas terapéuticas adaptadas al estado funcional.'
          }
        ],
        [
          {
            title: 'Prevención de recaídas',
            description: 'Plan de mantenimiento para sostener resultados y evitar nuevas lesiones.',
            equipment: 'Educación postural y ejercicios de continuidad.'
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
