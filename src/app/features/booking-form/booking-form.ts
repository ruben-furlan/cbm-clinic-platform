import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { LanguageService } from '../../core/language/language.service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RevealOnScrollDirective],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css']
})
export class BookingFormComponent {
  private readonly languageService = inject(LanguageService);

  showPromoCode = false;
  promoCode = '';

  formData = {
    name: '',
    surname: '',
    message: ''
  };

  sendWhatsApp(): void {
    const phoneNumber = '34662561672';
    const selectedLanguage = this.languageService.selectedLanguage;

    const textByLanguage: Record<
      'es' | 'en' | 'ca',
      {
        greeting: string;
        nameLabel: string;
        surnameLabel: string;
        descriptionLabel: string;
        promoLabel: string;
      }
    > = {
      es: {
        greeting: 'Hola, quiero solicitar cita.',
        nameLabel: 'Nombre',
        surnameLabel: 'Apellido',
        descriptionLabel: 'Descripción',
        promoLabel: 'Código promocional'
      },
      en: {
        greeting: 'Hi, I would like to book an appointment.',
        nameLabel: 'Name',
        surnameLabel: 'Surname',
        descriptionLabel: 'Description',
        promoLabel: 'Promo code'
      },
      ca: {
        greeting: 'Hola, vull sol·licitar cita.',
        nameLabel: 'Nom',
        surnameLabel: 'Cognom',
        descriptionLabel: 'Descripció',
        promoLabel: 'Codi promocional'
      }
    };

    const t = textByLanguage[selectedLanguage];

    const surnameLine = this.formData.surname.trim()
      ? `\n    ${t.surnameLabel}: ${this.formData.surname}`
      : '';

    const promoCodeLine = this.promoCode.trim()
      ? `\n    ${t.promoLabel}: ${this.promoCode}`
      : '';

    const rawMessage = `${t.greeting}\n\n    ${t.nameLabel}: ${this.formData.name}${surnameLine}\n    ${t.descriptionLabel}: ${this.formData.message}${promoCodeLine}`;
    const encodedMessage = encodeURIComponent(rawMessage);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(url, '_blank');
  }

  togglePromoCode(): void {
    this.showPromoCode = !this.showPromoCode;
  }
}
