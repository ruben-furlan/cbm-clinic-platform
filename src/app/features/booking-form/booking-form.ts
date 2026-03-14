import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RevealOnScrollDirective],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css']
})
export class BookingFormComponent {
  showPromoCode = false;
  promoCode = '';

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
    const promoCodeLine = this.promoCode.trim()
      ? `\n    Código promocional: ${this.promoCode}`
      : '';
    const rawMessage = `Hola, quiero pedir cita.\n\n    Nombre: ${this.formData.name}${surnameLine}\n    Teléfono: ${this.formData.countryCode} ${this.formData.phone}\n    Descripción: ${this.formData.message}${promoCodeLine}`;
    const encodedMessage = encodeURIComponent(rawMessage);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(url, '_blank');
  }

  togglePromoCode(): void {
    this.showPromoCode = !this.showPromoCode;
  }
}
