import { Component } from '@angular/core';
import { BookingFormComponent } from './booking-form';

@Component({
  selector: 'app-solicitar-cita-page',
  standalone: true,
  imports: [BookingFormComponent],
  template: `<app-booking-form></app-booking-form>`
})
export class SolicitarCitaPage {}
