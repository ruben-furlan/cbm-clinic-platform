import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { LanguageService } from '../../core/language/language.service';
import { Tarifa, TarifaCategoria, TarifasService } from '../../core/services/tarifas.service';
import { CbmLoaderComponent } from '../../shared/components/cbm-loader/cbm-loader.component';
import { DisponibilidadService, SlotConEstado } from '../../core/services/disponibilidad.service';
import { supabase } from '../../core/supabase.client';

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
export class BookingFormComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private readonly tarifasService: TarifasService,
    private readonly languageService: LanguageService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly disponibilidadService: DisponibilidadService
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

  // ── Calendario ─────────────────────────────────────────────────────────────
  slotSeleccionado: { fecha: string; hora: string } | null = null;
  slotsDisponibilidad: SlotConEstado[] = [];
  loadingSlots = false;
  errorSlots = false;
  errorSlot = '';
  creandoReserva = false;
  semanaVista: Date = new Date();
  readonly semanaMin: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  slotsMap = new Map<string, SlotConEstado>();
  diasSemana: { fecha: string; label: string; labelCorto: string; num: number; mes: string; fechaCorta: string }[] = [];
  horasUnicas: string[] = [];

  private realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

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
      this.stepAnimClass = 'step-enter-forward';
      this.currentStep = 3;
      this.scrollToForm();
      this.iniciarCalendario();
      return;
    }
    if (this.currentStep === 3) {
      if (!this.slotSeleccionado) return;
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

  // ── Calendario ─────────────────────────────────────────────────────────────

  get semanaLabel(): string {
    return this.disponibilidadService.getSemanaLabel(this.semanaVista);
  }

  get puedeRetroceder(): boolean {
    const lunesVista = this.disponibilidadService.getLunes(this.semanaVista);
    const lunesMin = this.disponibilidadService.getLunes(this.semanaMin);
    return lunesVista.getTime() > lunesMin.getTime();
  }

  get puedeAvanzar(): boolean {
    const lunesVista = this.disponibilidadService.getLunes(this.semanaVista);
    const lunesMin = this.disponibilidadService.getLunes(this.semanaMin);
    const maxSemanas = new Date(lunesMin);
    maxSemanas.setDate(lunesMin.getDate() + 21);
    return lunesVista.getTime() < maxSemanas.getTime();
  }

  get canAdvanceStep3(): boolean {
    return this.slotSeleccionado !== null;
  }

  get slotFechaLabel(): string {
    if (!this.slotSeleccionado) return '';
    const [y, m, day] = this.slotSeleccionado.fecha.split('-').map(Number);
    const d = new Date(y, m - 1, day);
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  get slotResumenCompleto(): string {
    if (!this.slotSeleccionado) return '';
    return `${this.slotFechaLabel} a las ${this.slotSeleccionado.hora}h`;
  }

  retrocederSemana(): void {
    const d = new Date(this.semanaVista);
    d.setDate(d.getDate() - 7);
    this.semanaVista = d;
    this.slotSeleccionado = null;
    void this.cargarSlots();
  }

  avanzarSemana(): void {
    const d = new Date(this.semanaVista);
    d.setDate(d.getDate() + 7);
    this.semanaVista = d;
    this.slotSeleccionado = null;
    void this.cargarSlots();
  }

  seleccionarSlot(fecha: string, hora: string): void {
    const slot = this.slotsMap.get(`${fecha}|${hora}`);
    if (!slot || slot.estado === 'completo') return;
    if (this.slotSeleccionado?.fecha === fecha && this.slotSeleccionado?.hora === hora) {
      this.slotSeleccionado = null;
    } else {
      this.slotSeleccionado = { fecha, hora };
    }
  }

  getSlotGrilla(fecha: string, hora: string): SlotConEstado | null {
    return this.slotsMap.get(`${fecha}|${hora}`) ?? null;
  }

  getSlotClase(slot: SlotConEstado, fecha: string, hora: string): string {
    const sel = this.slotSeleccionado?.fecha === fecha && this.slotSeleccionado?.hora === hora;
    if (sel) return 'slot-btn slot-btn--seleccionado';
    return `slot-btn slot-btn--${slot.estado}`;
  }

  iniciarCalendario(): void {
    this.semanaVista = new Date();
    void this.cargarSlots();
    this.suscribirRealtime();
  }

  private suscribirRealtime(): void {
    if (this.realtimeChannel) return;
    this.realtimeChannel = supabase
      .channel('slot-reservas-booking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slot_reservas' }, () => {
        void this.cargarSlots();
      })
      .subscribe();
  }

  private desuscribirRealtime(): void {
    if (this.realtimeChannel) {
      void supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }

  ngOnDestroy(): void {
    this.desuscribirRealtime();
  }

  async cargarSlots(): Promise<void> {
    this.loadingSlots = true;
    this.errorSlots = false;
    const lunes = this.disponibilidadService.getLunes(this.semanaVista);
    const sabado = new Date(lunes);
    sabado.setDate(lunes.getDate() + 5);

    try {
      this.slotsDisponibilidad = await this.disponibilidadService.getSlotsConDisponibilidad(lunes, sabado);
      this.actualizarGrilla(lunes);
    } catch {
      this.errorSlots = true;
    } finally {
      this.loadingSlots = false;
      this.cdr.detectChanges();
    }
  }

  private actualizarGrilla(lunes: Date): void {
    const diasNombres = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const diasNombresCortos = ['L', 'M', 'X', 'J', 'V', 'S'];
    this.diasSemana = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return {
        fecha: this.disponibilidadService.formatDate(d),
        label: diasNombres[i],
        labelCorto: diasNombresCortos[i],
        num: d.getDate(),
        mes: d.toLocaleDateString('es-ES', { month: 'short' }),
        fechaCorta: `${dd}/${mm}`
      };
    });

    const horasSet = new Set<string>();
    this.slotsMap = new Map();
    for (const slot of this.slotsDisponibilidad) {
      horasSet.add(slot.hora);
      this.slotsMap.set(`${slot.fecha}|${slot.hora}`, slot);
    }
    this.horasUnicas = Array.from(horasSet).sort();
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

    if (this.slotSeleccionado) {
      try {
        await this.disponibilidadService.crearReserva(
          this.slotSeleccionado.fecha,
          this.slotSeleccionado.hora
        );
      } catch {
        this.errorSlot = 'Vaya, alguien acaba de reservar esa hora 💜 Elige otro momento';
        this.slotSeleccionado = null;
        this.enviando = false;
        this.currentStep = 3;
        await this.cargarSlots();
        this.cdr.detectChanges();
        return;
      }
    }

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
          codigoPromo: this.promoCode.trim() || null,
          fechaSlot: this.slotFechaLabel || null,
          horaSlot: this.slotSeleccionado?.hora ?? null
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
