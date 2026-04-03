import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { LanguageService } from '../../core/language/language.service';
import { Tarifa, TarifaCategoria, TarifasService } from '../../core/services/tarifas.service';

interface TreatmentOption {
  value: string;
  label: string;
  type: 'session' | 'bundle' | 'pilates';
  categoria: TarifaCategoria;
}

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RevealOnScrollDirective],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css']
})
export class BookingFormComponent implements OnInit {
  private readonly languageService = inject(LanguageService);
  private readonly tarifasService = inject(TarifasService);

  showPromoCode = false;
  promoCode = '';

  treatmentOptions: TreatmentOption[] = [];

  formData = {
    name: '',
    surname: '',
    email: '',
    treatment: '',
    message: ''
  };

  async ngOnInit(): Promise<void> {
    try {
      const tarifas = await this.tarifasService.getTarifas();
      this.treatmentOptions = tarifas.map((tarifa) => this.toTreatmentOption(tarifa));
    } catch {
      this.treatmentOptions = [];
    }
  }

  private readonly categoryLabels: Record<TarifaCategoria, string> = {
    fisioterapia: 'Fisioterapia',
    pilates: 'Clases de pilates',
    promocion: 'Promociones activas'
  };

  get treatmentOptionsByCategory(): { label: string; options: TreatmentOption[] }[] {
    const order: TarifaCategoria[] = ['fisioterapia', 'pilates', 'promocion'];
    return order
      .map((cat) => ({
        label: this.categoryLabels[cat],
        options: this.treatmentOptions.filter((o) => o.categoria === cat)
      }))
      .filter((group) => group.options.length > 0);
  }

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
        emailLabel: string;
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
        emailLabel: 'Correo electrónico',
        treatmentLabel: 'Tratamiento',
        descriptionLabel: 'Descripción',
        promoLabel: 'Código promocional',
        closing: 'Quedo pendiente de confirmación.'
      },
      en: {
        greeting: 'Hi, I would like to request information or reserve this option:',
        nameLabel: 'Name',
        surnameLabel: 'Surname',
        emailLabel: 'Email',
        treatmentLabel: 'Treatment',
        descriptionLabel: 'Description',
        promoLabel: 'Promo code',
        closing: 'I remain pending confirmation.'
      },
      ca: {
        greeting: 'Hola, vull sol·licitar informació o reservar aquesta opció:',
        nameLabel: 'Nom',
        surnameLabel: 'Cognom',
        emailLabel: 'Correu electrònic',
        treatmentLabel: 'Tractament',
        descriptionLabel: 'Descripció',
        promoLabel: 'Codi promocional',
        closing: 'Quedo pendent de confirmació.'
      }
    };

    const t = textByLanguage[selectedLanguage];

    const surnameLine = this.formData.surname.trim()
      ? `
    ${t.surnameLabel}: ${this.formData.surname}`
      : '';

    const promoCodeLine = this.promoCode.trim()
      ? `
    ${t.promoLabel}: ${this.promoCode}`
      : '';

    const rawMessage = `${t.greeting}

    ${t.nameLabel}: ${this.formData.name}${surnameLine}
    ${t.emailLabel}: ${this.formData.email}
    ${t.treatmentLabel}: ${this.selectedTreatmentLabel}
    ${t.descriptionLabel}: ${this.formData.message}${promoCodeLine}

    ${t.closing}`;
    const encodedMessage = encodeURIComponent(rawMessage);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(url, '_blank');
  }

  togglePromoCode(): void {
    this.showPromoCode = !this.showPromoCode;
  }

  private toTreatmentOption(tarifa: Tarifa): TreatmentOption {
    const isBundle = tarifa.nombre.toLowerCase().includes('bono');
    const isPilates = tarifa.categoria === 'pilates';
    const suffix = isPilates || isBundle ? ' (inicio de plan / primera sesión)' : '';

    return {
      value: tarifa.id,
      label: `${tarifa.nombre} — ${tarifa.precio}${tarifa.unidad}${suffix}`,
      type: isPilates ? 'pilates' : isBundle ? 'bundle' : 'session',
      categoria: tarifa.categoria
    };
  }
}
