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

  readonly treatmentOptions = [
    {
      value: 'fisioterapia-individual',
      label: 'Fisioterapia — sesión individual (60€)',
      type: 'session'
    },
    {
      value: 'fisioterapia-bono-5',
      label: 'Fisioterapia — bono 5 sesiones (250€)',
      type: 'bundle'
    },
    {
      value: 'pilates-1',
      label: 'Pilates terapéutico — 1 vez por semana (48€/mes)',
      type: 'pilates'
    },
    {
      value: 'pilates-2',
      label: 'Pilates terapéutico — 2 veces por semana (65€/mes)',
      type: 'pilates'
    },
    {
      value: 'masaje-relajante',
      label: 'Masaje relajante — promoción (45€)',
      type: 'session'
    },
    {
      value: 'bono-jubilados-10',
      label: 'Bono jubilados — 10 sesiones (400€)',
      type: 'bundle'
    }
  ] as const;

  formData = {
    name: '',
    surname: '',
    treatment: '',
    message: ''
  };

  get selectedTreatmentLabel(): string {
    const selected = this.treatmentOptions.find((option) => option.value === this.formData.treatment);
    return selected?.label ?? '';
  }

  get treatmentFollowUpMessage(): string {
    const selected = this.treatmentOptions.find((option) => option.value === this.formData.treatment);

    if (!selected) {
      return 'Selecciona la opción que te interesa y te contactaremos por WhatsApp para confirmar disponibilidad y siguientes pasos.';
    }

    if (selected.type === 'bundle') {
      return 'Empezaremos con tu primera sesión y organizaremos contigo las siguientes.';
    }

    if (selected.type === 'pilates') {
      return 'Te ayudaremos a encajar tu grupo y frecuencia según disponibilidad.';
    }

    return 'Te contactaremos para confirmar disponibilidad y horario.';
  }

  sendWhatsApp(): void {
    const phoneNumber = '34662561672';
    const selectedLanguage = this.languageService.selectedLanguage;

    const textByLanguage: Record<
      'es' | 'en' | 'ca',
      {
        greeting: string;
        nameLabel: string;
        surnameLabel: string;
        treatmentLabel: string;
        descriptionLabel: string;
        promoLabel: string;
        closing: string;
      }
    > = {
      es: {
        greeting: 'Hola, quiero solicitar información o reservar esta opción:',
        nameLabel: 'Nombre',
        surnameLabel: 'Apellido',
        treatmentLabel: 'Tratamiento o tarifa',
        descriptionLabel: 'Descripción',
        promoLabel: 'Código promocional',
        closing: 'Quedo pendiente de confirmación.'
      },
      en: {
        greeting: 'Hi, I would like to request information or reserve this option:',
        nameLabel: 'Name',
        surnameLabel: 'Surname',
        treatmentLabel: 'Treatment or plan',
        descriptionLabel: 'Description',
        promoLabel: 'Promo code',
        closing: 'I remain pending confirmation.'
      },
      ca: {
        greeting: 'Hola, vull sol·licitar informació o reservar aquesta opció:',
        nameLabel: 'Nom',
        surnameLabel: 'Cognom',
        treatmentLabel: 'Tractament o tarifa',
        descriptionLabel: 'Descripció',
        promoLabel: 'Codi promocional',
        closing: 'Quedo pendent de confirmació.'
      }
    };

    const t = textByLanguage[selectedLanguage];

    const surnameLine = this.formData.surname.trim()
      ? `\n    ${t.surnameLabel}: ${this.formData.surname}`
      : '';

    const promoCodeLine = this.promoCode.trim()
      ? `\n    ${t.promoLabel}: ${this.promoCode}`
      : '';

    const rawMessage = `${t.greeting}\n\n    ${t.nameLabel}: ${this.formData.name}${surnameLine}\n    ${t.treatmentLabel}: ${this.selectedTreatmentLabel}\n    ${t.descriptionLabel}: ${this.formData.message}${promoCodeLine}\n\n    ${t.closing}`;
    const encodedMessage = encodeURIComponent(rawMessage);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(url, '_blank');
  }

  togglePromoCode(): void {
    this.showPromoCode = !this.showPromoCode;
  }
}
