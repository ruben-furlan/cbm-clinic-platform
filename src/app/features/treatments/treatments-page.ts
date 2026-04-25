import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

interface TratamientoItem {
  icono: string;
  titulo: string;
  subtitulo: string;
  descripcionCorta: string;
  descripcionCompleta?: string;
}

@Component({
  selector: 'app-treatments-page',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './treatments-page.html',
  styleUrl: './treatments-page.css'
})
export class TreatmentsPage {

  fisioterapiaItems: TratamientoItem[] = [
    {
      icono: '🦴',
      titulo: 'Traumatológica',
      subtitulo: 'Lesiones, caídas, accidentes',
      descripcionCorta: 'Te ayudamos a recuperarte de lesiones en huesos, músculos o tendones para que vuelvas a moverte sin dolor.',
      descripcionCompleta: 'Tratamos esguinces, fracturas, roturas musculares, tendinitis y cualquier lesión del aparato locomotor. Combinamos terapia manual, ejercicio terapéutico y técnicas específicas para que tu recuperación sea segura y completa.'
    },
    {
      icono: '💧',
      titulo: 'Drenaje linfático',
      subtitulo: 'Retención, edemas, embarazo',
      descripcionCorta: 'Reducimos la retención de líquidos y la sensación de pesadez con técnicas suaves y precisas.',
      descripcionCompleta: 'El drenaje linfático manual activa el sistema linfático para eliminar toxinas y reducir edemas. Muy indicado en embarazo, post-cirugía, lipoedema y síndrome de piernas cansadas.'
    },
    {
      icono: '🔄',
      titulo: 'Espalda y cervicales',
      subtitulo: 'Dolor crónico, postura, tensión',
      descripcionCorta: 'Aliviamos el dolor de espalda y cuello con un abordaje completo que va más allá del síntoma.',
      descripcionCompleta: 'Trabajamos la causa del dolor, no solo el síntoma. Combinamos terapia manual, reeducación postural y ejercicio para que el alivio sea duradero y no tengas que volver una y otra vez.'
    },
    {
      icono: '⚡',
      titulo: 'Deportiva',
      subtitulo: 'Rendimiento, prevención, lesiones',
      descripcionCorta: 'Recuperamos lesiones deportivas y trabajamos para que vuelvas a tu nivel con confianza.',
      descripcionCompleta: 'Tanto si eres deportista profesional como aficionado, te ayudamos a recuperarte de lesiones, mejorar tu rendimiento y prevenir que el problema vuelva a aparecer.'
    },
    {
      icono: '🏥',
      titulo: 'Pre/post quirúrgica',
      subtitulo: 'Preparación, recuperación',
      descripcionCorta: 'Te preparamos antes de la operación y te acompañamos en cada etapa de tu recuperación.',
      descripcionCompleta: 'La fisioterapia antes de una cirugía mejora los resultados postoperatorios. Después, diseñamos un plan progresivo para que recuperes movilidad y fuerza de forma segura y sin complicaciones.'
    },
    {
      icono: '🌿',
      titulo: 'Adulto mayor',
      subtitulo: 'Autonomía, movilidad, equilibrio',
      descripcionCorta: 'Ayudamos a mantener la autonomía y la calidad de vida con un trato cercano y adaptado.',
      descripcionCompleta: 'Trabajamos el equilibrio, la fuerza y la coordinación para prevenir caídas y mantener la independencia el mayor tiempo posible. Con mucho cuidado y sin prisa.'
    },
    {
      icono: '✨',
      titulo: 'Dermatofuncional',
      subtitulo: 'Cicatrices, edemas, estética',
      descripcionCorta: 'Tratamos cicatrices y alteraciones de la piel con técnicas especializadas y resultados visibles.',
      descripcionCompleta: 'Trabajamos cicatrices post-quirúrgicas, queloides, fibrosis y edemas cutáneos. También abordamos alteraciones funcionales del tejido conectivo para mejorar tanto la apariencia como la función.'
    },
    {
      icono: '🧠',
      titulo: 'Neurológica',
      subtitulo: 'Sistema nervioso, funcionalidad',
      descripcionCorta: 'Restauramos funciones motoras y sensoriales para mejorar tu independencia y calidad de vida.',
      descripcionCompleta: 'Trabajamos con personas que han sufrido ictus, lesiones medulares, Parkinson u otras alteraciones neurológicas. El objetivo es mejorar el movimiento, la coordinación y la autonomía en el día a día.'
    },
    {
      icono: '😮',
      titulo: 'ATM',
      subtitulo: 'Mandíbula, dolor, tensión',
      descripcionCorta: 'Aliviamos el dolor de mandíbula, los chasquidos y la tensión acumulada en la zona facial.',
      descripcionCompleta: 'El dolor de mandíbula, el bruxismo o los chasquidos al abrir la boca tienen solución. Tratamos la articulación ATM con técnicas manuales precisas para devolverte la comodidad al masticar, hablar y descansar.'
    },
    {
      icono: '👶',
      titulo: 'Infantil',
      subtitulo: 'Bebés, niños, desarrollo',
      descripcionCorta: 'Acompañamos el desarrollo de los más pequeños con un abordaje suave y adaptado.',
      descripcionCompleta: 'Tratamos alteraciones posturales, problemas de desarrollo motor, tortícolis congénita y otras condiciones en bebés y niños. Siempre con un enfoque lúdico y respetuoso.'
    }
  ];

  pilatesItems: TratamientoItem[] = [
    {
      icono: '💪',
      titulo: 'Fortalecimiento del core',
      subtitulo: 'Abdomen, estabilidad, fuerza',
      descripcionCorta: 'Trabajamos la musculatura profunda para darte una base estable que proteja tu espalda.',
      descripcionCompleta: 'Un core fuerte es la base de todo movimiento saludable. Trabajamos la musculatura abdominal profunda, el suelo pélvico y los estabilizadores de la columna para que te muevas con más seguridad y sin dolor.'
    },
    {
      icono: '📐',
      titulo: 'Corrección postural',
      subtitulo: 'Alineación, hombros, cuello',
      descripcionCorta: 'Mejoramos tu postura de forma progresiva para que el cambio sea real y duradero.',
      descripcionCompleta: 'No se trata solo de "ponerse recto". Trabajamos los desequilibrios musculares que provocan la mala postura, reeducando el cuerpo para que la alineación correcta sea natural y no un esfuerzo.'
    },
    {
      icono: '🌊',
      titulo: 'Flexibilidad y agilidad',
      subtitulo: 'Movimiento, amplitud',
      descripcionCorta: 'Recuperamos la amplitud de movimiento para que el cuerpo se mueva con libertad.',
      descripcionCompleta: 'Combinamos estiramientos activos, movilidad articular y control motor para mejorar la flexibilidad de forma funcional. El objetivo es que te muevas mejor en tu vida diaria, no solo en clase.'
    },
    {
      icono: '🧘',
      titulo: 'Conexión mente-cuerpo',
      subtitulo: 'Concentración, respiración',
      descripcionCorta: 'Aprendemos a movernos con consciencia para reducir el estrés y mejorar el bienestar.',
      descripcionCompleta: 'El pilates terapéutico trabaja la atención plena al movimiento, la respiración consciente y la coordinación. Esto reduce el estrés, mejora el sueño y genera una sensación de bienestar que va más allá de lo físico.'
    },
    {
      icono: '🔄',
      titulo: 'Rehabilitación y prevención',
      subtitulo: 'Dolor recurrente, recaídas',
      descripcionCorta: 'Usamos el pilates como herramienta de rehabilitación para que el dolor no vuelva.',
      descripcionCompleta: 'Para quien ya ha pasado por fisioterapia y quiere consolidar la recuperación, el pilates terapéutico es el siguiente paso. Fortalecemos las estructuras vulnerables y trabajamos los patrones de movimiento que causaron el problema.'
    },
    {
      icono: '🌱',
      titulo: 'Bienestar integral',
      subtitulo: 'Equilibrio, coordinación, ansiedad',
      descripcionCorta: 'Mejoramos el equilibrio físico y emocional para sentirte mejor en tu día a día.',
      descripcionCompleta: 'El movimiento consciente tiene un impacto directo en el sistema nervioso. Trabajamos la coordinación, el equilibrio y la regulación del sistema nervioso autónomo para reducir la ansiedad y mejorar la calidad de vida.'
    }
  ];

  tecnicas = ['Radiofrecuencia', 'Punción seca', 'Ventosas', 'Kinesiotape'];

  expandidos: { [key: string]: boolean } = {};

  toggleExpandido(seccion: string, index: number) {
    const key = `${seccion}-${index}`;
    this.expandidos[key] = !this.expandidos[key];
  }

  isExpandido(seccion: string, index: number): boolean {
    return !!this.expandidos[`${seccion}-${index}`];
  }

  constructor(private readonly title: Title, private readonly meta: Meta) {
    this.title.setTitle('Tratamientos | CBM Fisioterapia Terrassa');
    this.meta.updateTag({
      name: 'description',
      content: 'Fisioterapia, pilates y técnicas especializadas en Terrassa. Tratamiento personalizado para recuperar tu movilidad y reducir el dolor en CBM Fisioterapia.'
    });
  }
}
