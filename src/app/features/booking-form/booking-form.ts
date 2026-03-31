import { Component } from '@angular/core';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [RevealOnScrollDirective],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css']
})
export class BookingFormComponent {
  readonly calendlyUrl = 'https://calendly.com/d/cxy5-km7-cmn/sesion-fisioterapia';
  readonly whatsAppUrl = 'https://wa.me/34662561672';
}
