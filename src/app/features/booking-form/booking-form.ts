import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [FormsModule,RevealOnScrollDirective],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css']
})
export class BookingFormComponent {
  formData = {
    name: '',
    surname: '',
    countryCode: '+34',
    phone: '',
    message: ''
  };

  sendWhatsApp(): void {
    const phoneNumber = '34662561672';
    const surnameLine = this.formData.surname.trim()
      ? `\n    Apellido: ${this.formData.surname}`
      : '';
    const rawMessage = `Hola, quiero reservar una cita.\n    Nombre: ${this.formData.name}${surnameLine}\n    Teléfono: ${this.formData.countryCode} ${this.formData.phone}\n    Motivo: ${this.formData.message}`;
    const encodedMessage = encodeURIComponent(rawMessage);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(url, '_blank');
  }
}

