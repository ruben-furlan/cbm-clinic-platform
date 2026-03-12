import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

type SeoSlug =
  | 'fisioterapia-dolor-lumbar-terrassa'
  | 'fisioterapia-cervical-terrassa'
  | 'puncion-seca-terrassa'
  | 'pilates-terapeutico-terrassa';

interface SeoPageContent {
  title: string;
  intro: string;
  problemDescription: string;
  symptoms: string[];
  treatment: string[];
  whenToCome: string[];
}

@Component({
  selector: 'app-seo-page',
  standalone: true,
  imports: [NgFor, RouterLink, RevealOnScrollDirective],
  templateUrl: './seo-page.component.html',
  styleUrl: './seo-page.component.css'
})
export class SeoPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly pages: Record<SeoSlug, SeoPageContent> = {
    'fisioterapia-dolor-lumbar-terrassa': {
      title: 'Fisioterapia para dolor lumbar en Terrassa',
      intro:
        'En CBM Fisioterapia atendemos a pacientes de Terrassa con dolor lumbar agudo o recurrente, combinando terapia manual, ejercicio terapéutico y pautas claras para el día a día.',
      problemDescription:
        'El dolor lumbar puede aparecer por sedentarismo, sobrecarga laboral, deporte o malas posturas mantenidas. Si no se trata de forma adecuada, puede limitar actividades básicas como caminar, agacharte o descansar bien.',
      symptoms: [
        'Dolor en la zona baja de la espalda al levantarte o al final del día.',
        'Rigidez lumbar al estar mucho rato sentado o de pie.',
        'Molestias al inclinarte, cargar peso o practicar deporte.',
        'Sensación de bloqueo o pinchazo en movimientos concretos.'
      ],
      treatment: [
        'Valoración funcional para identificar la causa principal del dolor lumbar.',
        'Terapia manual para reducir tensión y recuperar movilidad.',
        'Ejercicio terapéutico progresivo para mejorar estabilidad y control lumbopélvico.',
        'Educación postural y recomendaciones para prevenir recaídas.'
      ],
      whenToCome: [
        'Si el dolor lumbar dura más de una semana o se repite con frecuencia.',
        'Si notas limitación en tu trabajo, entrenamiento o descanso.',
        'Si has probado reposo o analgésicos y el dolor vuelve.'
      ]
    },
    'fisioterapia-cervical-terrassa': {
      title: 'Fisioterapia cervical en Terrassa',
      intro:
        'Tratamos dolor cervical, contracturas de cuello y molestias asociadas a estrés o trabajo de oficina. Ayudamos a pacientes de Terrassa, Matadepera y Rubí a recuperar movilidad cervical y reducir dolor.',
      problemDescription:
        'La cervicalgia puede estar relacionada con tensión muscular, posturas mantenidas, bruxismo o falta de movilidad torácica. También puede acompañarse de cefaleas tensionales o molestias hacia hombros y escápulas.',
      symptoms: [
        'Dolor de cuello al girar la cabeza o mirar hacia abajo.',
        'Rigidez matinal y sensación de cuello cargado.',
        'Dolor que se irradia a hombro, escápula o brazo.',
        'Cefaleas tensionales frecuentes.'
      ],
      treatment: [
        'Exploración de movilidad cervical y hábitos diarios.',
        'Terapia manual y técnicas miofasciales para descargar tensión.',
        'Movilidad activa y ejercicios de control cervical-escapular.',
        'Recomendaciones ergonómicas personalizadas para trabajo y descanso.'
      ],
      whenToCome: [
        'Si el dolor de cuello te limita para trabajar o conducir.',
        'Si aparecen dolores de cabeza frecuentes asociados a tensión cervical.',
        'Si las molestias se repiten y no mejoran con descanso.'
      ]
    },
    'puncion-seca-terrassa': {
      title: 'Punción seca en Terrassa',
      intro:
        'La punción seca es una técnica específica para tratar puntos gatillo musculares y dolor miofascial. En CBM Fisioterapia la aplicamos dentro de un plan global de recuperación en Terrassa y alrededores.',
      problemDescription:
        'Cuando existe dolor muscular persistente, sobrecargas recurrentes o sensación de contractura profunda, la punción seca puede ayudar a normalizar el tono muscular y mejorar el movimiento.',
      symptoms: [
        'Dolor muscular localizado que no desaparece.',
        'Nudos o bandas tensas dolorosas al tacto.',
        'Limitación de movilidad por sobrecarga muscular.',
        'Molestias repetidas en deporte o trabajo físico.'
      ],
      treatment: [
        'Valoración previa para confirmar indicación segura de la técnica.',
        'Aplicación de punción seca en puntos gatillo concretos.',
        'Combinación con terapia manual, movilidad y ejercicio terapéutico.',
        'Seguimiento de evolución y pautas para mantener resultados.'
      ],
      whenToCome: [
        'Si arrastras sobrecargas musculares que no mejoran.',
        'Si el dolor reaparece tras entrenamientos o jornadas largas.',
        'Si buscas un abordaje preciso dentro de un tratamiento de fisioterapia completo.'
      ]
    },
    'pilates-terapeutico-terrassa': {
      title: 'Pilates terapéutico en Terrassa',
      intro:
        'Nuestro Pilates terapéutico está orientado a mejorar postura, fuerza profunda y control corporal para pacientes de Terrassa, Viladecavalls y Sabadell con dolor recurrente o necesidad de prevención.',
      problemDescription:
        'El Pilates terapéutico permite trabajar de forma guiada y adaptada a cada persona. Es útil en dolor lumbar o cervical recurrente, recuperación funcional y mejora del control motor.',
      symptoms: [
        'Dolor lumbar o cervical que reaparece con frecuencia.',
        'Debilidad de la musculatura estabilizadora.',
        'Falta de control postural en actividades cotidianas.',
        'Miedo a moverte tras una lesión previa.'
      ],
      treatment: [
        'Valoración inicial para adaptar el nivel de ejercicios.',
        'Trabajo progresivo de respiración, movilidad y estabilidad.',
        'Ejercicios terapéuticos para mejorar patrón de movimiento y fuerza funcional.',
        'Plan de continuidad para mantener resultados a largo plazo.'
      ],
      whenToCome: [
        'Si quieres prevenir recaídas y fortalecer tu cuerpo de forma segura.',
        'Si tras una lesión necesitas recuperar confianza al moverte.',
        'Si buscas una opción terapéutica activa y personalizada.'
      ]
    }
  };

  readonly currentSlug = (this.route.snapshot.routeConfig?.path ??
    'fisioterapia-dolor-lumbar-terrassa') as SeoSlug;

  readonly content = this.pages[this.currentSlug] ?? this.pages['fisioterapia-dolor-lumbar-terrassa'];
}
