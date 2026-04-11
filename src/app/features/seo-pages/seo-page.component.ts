import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

type SeoSlug =
  | 'fisioterapia-dolor-lumbar-terrassa'
  | 'fisioterapia-cervical-terrassa'
  | 'puncion-seca-terrassa'
  | 'pilates-terapeutico-terrassa'
  | 'fisioterapia-lesiones-deportivas-terrassa'
  | 'fisioterapia-tendinitis-terrassa'
  | 'fisioterapia-recuperacion-postquirurgica-terrassa'
  | 'fisioterapia-dolor-hombro-terrassa';

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
      title: 'Pilates en Terrassa',
      intro:
        'Nuestro Pilates está orientado a mejorar postura, fuerza profunda y control corporal para pacientes de Terrassa, Viladecavalls y Sabadell con dolor recurrente o necesidad de prevención.',
      problemDescription:
        'El Pilates permite trabajar de forma guiada y adaptada a cada persona. Es útil en dolor lumbar o cervical recurrente, recuperación funcional y mejora del control motor.',
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
    },
    'fisioterapia-lesiones-deportivas-terrassa': {
      title: 'Fisioterapia para lesiones deportivas en Terrassa',
      intro:
        'En CBM Fisioterapia atendemos a pacientes de Terrassa con lesiones deportivas: esguinces, roturas fibrilares, sobrecargas y tendinopatías. Te acompañamos desde el primer día hasta la vuelta al deporte.',
      problemDescription:
        'Las lesiones deportivas pueden aparecer por un traumatismo puntual, una sobrecarga acumulada o un gesto mal ejecutado. Sin una recuperación bien planificada, el riesgo de recaída aumenta significativamente.',
      symptoms: [
        'Dolor localizado al movimiento o al cargar sobre la zona afectada.',
        'Inflamación, hematoma o sensación de calor en la zona lesionada.',
        'Pérdida de fuerza o sensación de inestabilidad.',
        'Limitación funcional para correr, saltar o hacer gestos deportivos.'
      ],
      treatment: [
        'Valoración funcional para identificar el tipo y grado de lesión.',
        'Terapia manual para reducir inflamación y recuperar movilidad en la fase aguda.',
        'Readaptación progresiva al deporte mediante ejercicio terapéutico específico.',
        'Trabajo de propiocepción y control motor para prevenir recaídas.'
      ],
      whenToCome: [
        'Si el dolor no mejora con reposo tras 48-72 horas.',
        'Si hay inflamación persistente o no puedes apoyar bien la zona afectada.',
        'Antes de volver al entrenamiento, para asegurarte de que estás listo.'
      ]
    },
    'fisioterapia-tendinitis-terrassa': {
      title: 'Fisioterapia para tendinitis en Terrassa',
      intro:
        'En CBM Fisioterapia tratamos tendinopatías y tendinitis en pacientes de Terrassa. Abordamos la causa real de la sobrecarga del tendón para que el alivio sea duradero y puedas volver a moverte sin miedo.',
      problemDescription:
        'La tendinitis aparece cuando el tendón se inflama por sobrecarga repetida, gestos mal ejecutados o falta de calentamiento. Es frecuente en el talón, el codo, el hombro y la rodilla, y tiende a cronificarse si no se trata bien.',
      symptoms: [
        'Dolor al iniciar el movimiento que mejora al calentar pero vuelve al parar.',
        'Sensibilidad al tacto justo sobre el tendón afectado.',
        'Rigidez matutina en la zona o después de periodos de reposo.',
        'Dolor que aumenta con la actividad y limita el rendimiento deportivo o laboral.'
      ],
      treatment: [
        'Valoración de la carga y los factores que perpetúan la tendinopatía.',
        'Descarga del tendón en la fase inicial para controlar el dolor.',
        'Ejercicio excéntrico y progresivo para recuperar la capacidad de carga del tendón.',
        'Electroterapia o técnicas complementarias cuando el caso lo requiere.'
      ],
      whenToCome: [
        'Si el dolor en el tendón dura más de dos semanas sin mejorar.',
        'Si reaparece cada vez que retomas el deporte o la actividad habitual.',
        'Si está limitando tu día a día: bajar escaleras, caminar o levantar el brazo.'
      ]
    },
    'fisioterapia-recuperacion-postquirurgica-terrassa': {
      title: 'Rehabilitación postquirúrgica en Terrassa',
      intro:
        'En CBM Fisioterapia acompañamos a pacientes de Terrassa en su recuperación tras cirugías de rodilla, hombro, columna, cadera y otras intervenciones. Trabajamos codo con codo con tu equipo médico para que la vuelta a la vida normal sea segura y progresiva.',
      problemDescription:
        'Después de una operación, el cuerpo necesita tiempo y un plan de rehabilitación adaptado. Sin fisioterapia, es frecuente que aparezcan rigideces, pérdida de fuerza o cicatrices con adherencias que limitan el movimiento a largo plazo.',
      symptoms: [
        'Pérdida de movilidad en la articulación operada.',
        'Debilidad muscular por el tiempo de inmovilización.',
        'Cicatriz sensible, tensa o con adherencias al tejido profundo.',
        'Miedo o inseguridad al volver a cargar sobre la zona intervenida.'
      ],
      treatment: [
        'Protocolo de rehabilitación adaptado al tipo de cirugía y a tu evolución.',
        'Trabajo de movilidad articular progresiva desde las primeras semanas.',
        'Fortalecimiento muscular para recuperar la función y la estabilidad.',
        'Tratamiento de la cicatriz para mejorar su elasticidad y reducir adherencias.'
      ],
      whenToCome: [
        'Desde las primeras semanas postcirugía, siguiendo las indicaciones de tu médico.',
        'Si notas que la movilidad no avanza o que la cicatriz tira y duele.',
        'Antes de retomar el deporte o el trabajo físico tras la operación.'
      ]
    },
    'fisioterapia-dolor-hombro-terrassa': {
      title: 'Fisioterapia para dolor de hombro en Terrassa',
      intro:
        'En CBM Fisioterapia tratamos el dolor de hombro en pacientes de Terrassa: manguito rotador, bursitis, tendinitis del supraespinoso e impingement. Te ayudamos a recuperar el movimiento y a dormir sin dolor.',
      problemDescription:
        'El dolor de hombro es una de las consultas más frecuentes en fisioterapia. Puede aparecer de forma gradual por sobrecarga o de forma brusca tras un golpe o caída, y si no se trata bien, tiende a limitar cada vez más actividades cotidianas.',
      symptoms: [
        'Dolor al levantar el brazo por encima de la cabeza o hacia los lados.',
        'Dificultad para dormir del lado afectado por el dolor nocturno.',
        'Pérdida de fuerza para empujar, tirar o cargar peso con el brazo.',
        'Sensación de chasquido o bloqueo al mover el hombro.'
      ],
      treatment: [
        'Exploración funcional para identificar la estructura afectada y la causa del dolor.',
        'Terapia manual para recuperar movilidad y reducir la inflamación periarticular.',
        'Ejercicio de estabilización escapular y reeducación del movimiento del hombro.',
        'Pautas para el día a día que eviten sobrecargar la zona mientras se recupera.'
      ],
      whenToCome: [
        'Si el dolor de hombro no mejora en una semana o te impide dormir bien.',
        'Si tienes limitación para actividades cotidianas como peinarte o vestirte.',
        'Si el dolor apareció tras un golpe, caída o esfuerzo brusco.'
      ]
    }
  };

  readonly currentSlug = (this.route.snapshot.routeConfig?.path ??
    'fisioterapia-dolor-lumbar-terrassa') as SeoSlug;

  readonly content = this.pages[this.currentSlug] ?? this.pages['fisioterapia-dolor-lumbar-terrassa'];
}
