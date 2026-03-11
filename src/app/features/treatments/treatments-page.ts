import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-treatments-page',
  standalone: true,
  imports: [NgFor],
  templateUrl: './treatments-page.html',
  styleUrl: './treatments-page.css'
})
export class TreatmentsPage {
  columns = [
    [
      {
        title: 'Fisioterapia Traumatológica',
        description: 'Tratamiento de lesiones y dolencias relacionadas con traumatismos.',
        equipment: 'Ultrasound, máquinas de electroterapia.'
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
  ];
}
