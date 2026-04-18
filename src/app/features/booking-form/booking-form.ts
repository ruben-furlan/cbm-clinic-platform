import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { LanguageService } from '../../core/language/language.service';
import { Tarifa, TarifaCategoria, TarifasService } from '../../core/services/tarifas.service';
import { CbmLoaderComponent } from '../../shared/components/cbm-loader/cbm-loader.component';

interface TreatmentOption {
  value: string;
  label: string;
  type: 'session' | 'bundle' | 'pilates';
  categoria: TarifaCategoria;
  nombre: string;
  precio: string;
  descripcion?: string | null;
  showBadge: boolean;
}

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RevealOnScrollDirective, CbmLoaderComponent],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css']
})
export class BookingFormComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private readonly tarifasService: TarifasService,
    private readonly languageService: LanguageService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute
  ) {}

  currentStep = 1;
  stepAnimClass = '';

  showPromoCode = false;
  promoCode = '';
  step2Touched = false;
  whatsAppFeedback = false;
  loadingTarifas = true;
  errorTarifas = false;
  preselectedFromPricing = false;
  enviando = false;
  errorEnvio = false;
  solicitudEnviada = false;

  treatmentOptions: TreatmentOption[] = [];

  formData = {
    name: '',
    surname: '',
    email: '',
    phone: '',
    treatment: '',
    message: ''
  };

  availabilityType: 'green' | 'amber' = 'green';
  availabilityText = '';

  async ngOnInit(): Promise<void> {
    this.initAvailability();

    try {
      const tarifas = await this.tarifasService.getTarifas();
      this.treatmentOptions = tarifas.map((tarifa) => this.toTreatmentOption(tarifa));
      this.applyPreselectionFromQuery();
    } catch {
      this.treatmentOptions = [];
      this.errorTarifas = true;
    } finally {
      this.loadingTarifas = false;
      this.cdr.detectChanges();
    }
  }

  private initAvailability(): void {
    this.availabilityType = 'green';
    this.availabilityText = 'Solo falta un paso para confirmar tu cita';
  }

  private applyPreselectionFromQuery(): void {
    const treatmentFromQuery = this.route.snapshot.queryParamMap.get('tratamiento');
    const stepFromQuery = this.route.snapshot.queryParamMap.get('paso');
    if (!treatmentFromQuery) return;

    const matched = this.treatmentOptions.find((option) => option.value === treatmentFromQuery);
    if (!matched) return;

    this.formData.treatment = matched.value;
    this.preselectedFromPricing = true;

    if (stepFromQuery === '2') {
      this.currentStep = 2;
      this.stepAnimClass = 'step-enter-forward';
    }
  }

  private readonly categoryLabels: Record<TarifaCategoria, string> = {
    fisioterapia: 'Fisioterapia',
    pilates: 'Clases de pilates',
    promocion: 'Bienestar ✨'
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

  get selectedTreatmentOption(): TreatmentOption | undefined {
    return this.treatmentOptions.find((option) => option.value === this.formData.treatment);
  }

  get isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.formData.email);
  }

  get isPhoneValid(): boolean {
    return /^\d{9,}$/.test(this.formData.phone.replace(/\s/g, ''));
  }

  get canAdvanceStep1(): boolean {
    return !!this.formData.treatment;
  }

  get canAdvanceStep2(): boolean {
    return !!this.formData.name.trim() && !!this.formData.email && this.isEmailValid && this.isPhoneValid;
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^\d\s]/g, '');
    this.formData.phone = input.value;
  }

  selectCard(value: string): void {
    this.formData.treatment = value;
  }

  nextStep(): void {
    if (this.currentStep === 2) {
      this.step2Touched = true;
      if (!this.canAdvanceStep2) return;
    }
    this.stepAnimClass = 'step-enter-forward';
    this.currentStep++;
    this.scrollToForm();
  }

  private scrollToForm(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      const el = document.querySelector('.form-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }

  prevStep(): void {
    this.stepAnimClass = 'step-enter-back';
    this.currentStep--;
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

    this.whatsAppFeedback = true;
    setTimeout(() => {
      if (isPlatformBrowser(this.platformId)) {
        window.open(url, '_blank');
      }
      this.whatsAppFeedback = false;
    }, 1500);
  }

  async confirmarSolicitud(): Promise<void> {
    this.enviando = true;
    this.errorEnvio = false;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('/.netlify/functions/send-appointment-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: this.formData.name,
          apellido: this.formData.surname,
          email: this.formData.email,
          telefono: '+34' + this.formData.phone.replace(/\s/g, ''),
          tratamiento: this.selectedTreatmentOption?.nombre,
          precio: this.selectedTreatmentOption?.precio,
          codigoPromo: this.promoCode.trim() || null
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const details = await response.text().catch(() => '');
        console.error(`Error enviando solicitud HTTP ${response.status}:`, details);
        this.enviando = false;
        this.errorEnvio = true;
        this.cdr.detectChanges();
        return;
      }

      this.enviando = false;
      this.solicitudEnviada = true;
      this.cdr.detectChanges();
      this.scrollToForm();
    } catch (err) {
      clearTimeout(timeout);
      console.error('Error enviando solicitud:', err);
      this.enviando = false;
      this.errorEnvio = true;
      this.cdr.detectChanges();
    }
  }

  get whatsAppFallbackUrl(): string {
    const phone = '34662561672';
    const promo = this.promoCode.trim() ? `\nCódigo: ${this.promoCode}` : '';
    const apellido = this.formData.surname.trim() ? ` ${this.formData.surname}` : '';
    const msg =
      `Hola CBM 😊 Quiero solicitar una cita.\n` +
      `Tratamiento: ${this.selectedTreatmentOption?.nombre}\n` +
      `Nombre: ${this.formData.name}${apellido}\n` +
      `Email: ${this.formData.email}${promo}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  togglePromoCode(): void {
    this.showPromoCode = !this.showPromoCode;
  }

  private toTreatmentOption(tarifa: Tarifa): TreatmentOption {
    const isBundle = tarifa.nombre.toLowerCase().includes('bono');
    const isPilates = tarifa.categoria === 'pilates';

    return {
      value: tarifa.id,
      label: `${tarifa.nombre} — ${tarifa.precio}${tarifa.unidad}`,
      nombre: tarifa.nombre,
      precio: `${tarifa.precio}${tarifa.unidad}`,
      descripcion: tarifa.descripcion,
      type: isPilates ? 'pilates' : isBundle ? 'bundle' : 'session',
      categoria: tarifa.categoria,
      showBadge: isPilates || isBundle
    };
  }
}
