import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingFormComponent } from './booking-form';

@Component({
  selector: 'app-solicitar-cita-page',
  standalone: true,
  imports: [BookingFormComponent, RouterLink],
  template: `
    <div class="solicitar-cita-back">
      <a routerLink="/" class="solicitar-cita-back__link">← Volver</a>
    </div>
    <app-booking-form></app-booking-form>
  `,
  styles: [`
    .solicitar-cita-back {
      padding: 16px 24px 0;
      max-width: 1200px;
      margin: 0 auto;
    }
    .solicitar-cita-back__link {
      color: #888;
      font-size: 14px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      min-height: 44px;
    }
    .solicitar-cita-back__link:hover {
      color: #555;
    }
  `]
})
export class SolicitarCitaPage {}
