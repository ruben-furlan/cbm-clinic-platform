import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HorarioFranja } from '../../../core/services/tarifas.service';

@Component({
  selector: 'app-horario-chips',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './horario-chips.component.html',
  styleUrls: ['./horario-chips.component.css']
})
export class HorarioChipsComponent {
  @Input() horarios: HorarioFranja[] | null | undefined = null;

  get hasHorarios(): boolean {
    return Array.isArray(this.horarios) && this.horarios.length > 0;
  }
}
