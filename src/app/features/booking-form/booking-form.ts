import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  NgZone,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import {
  HorarioFranja,
  Tarifa,
  TarifaCategoria,
  TarifasService,
} from '../../core/services/tarifas.service';
import { CbmLoaderComponent } from '../../shared/components/cbm-loader/cbm-loader.component';
import { HorarioChipsComponent } from '../../shared/components/horario-chips/horario-chips.component';
import { AppointmentDateTime, Step3CalendlyComponent } from './step3-calendly.component';

interface TreatmentOption {
  value: string;
  label: string;
  type: 'session' | 'bundle' | 'pilates';
  categoria: TarifaCategoria;
  nombre: string;
  precio: string;
  descripcion?: string | null;
  horarios?: HorarioFranja[] | null;
  showBadge: boolean;
}

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RevealOnScrollDirective,
    CbmLoaderComponent,
    HorarioChipsComponent,
    Step3CalendlyComponent,
  ],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css'],
})
export class BookingFormComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private readonly tarifasService: TarifasService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly ngZone: NgZone,
  ) {}

  currentStep = 1;
  stepAnimClass = '';
  isMobile = false;

  loadingTarifas = true;
  errorTarifas = false;
  preselectedFromPricing = false;
  enviando = false;
  errorEnvio = false;
  solicitudEnviada = false;

  appointmentDateTime: AppointmentDateTime | null = null;

  treatmentOptions: TreatmentOption[] = [];
  formData = { treatment: '' };

  availabilityType: 'green' | 'amber' = 'green';
  availabilityText = '';

  @HostListener('window:resize')
  onResize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 768;
    }
  }

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth < 768;
    }
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
    const tarifaId = this.route.snapshot.queryParamMap.get('tarifaId');
    if (!tarifaId) return;

    const matched = this.treatmentOptions.find((option) => option.value === tarifaId);
    if (!matched) return;

    this.formData.treatment = matched.value;
    this.preselectedFromPricing = true;
    this.currentStep = 2;
    this.stepAnimClass = 'step-enter-forward';
  }

  private readonly categoryLabels: Record<TarifaCategoria, string> = {
    fisioterapia: 'Fisioterapia',
    pilates: 'Clases de pilates',
    promocion: 'Bienestar ✨',
  };

  get treatmentOptionsByCategory(): { label: string; options: TreatmentOption[] }[] {
    const order: TarifaCategoria[] = ['fisioterapia', 'pilates', 'promocion'];
    return order
      .map((cat) => ({
        label: this.categoryLabels[cat],
        options: this.treatmentOptions.filter((o) => o.categoria === cat),
      }))
      .filter((group) => group.options.length > 0);
  }

  get selectedTreatmentLabel(): string {
    const selected = this.treatmentOptions.find(
      (option) => option.value === this.formData.treatment,
    );
    return selected?.label ?? '';
  }

  get selectedTreatmentOption(): TreatmentOption | undefined {
    return this.treatmentOptions.find((option) => option.value === this.formData.treatment);
  }

  get canAdvanceStep1(): boolean {
    return !!this.formData.treatment;
  }

  seleccionarTratamiento(option: TreatmentOption): void {
    this.ngZone.run(() => {
      this.formData.treatment = option.value;
      this.cdr.detectChanges();

      if (this.isMobile) {
        setTimeout(() => {
          this.ngZone.run(() => {
            this.irAlPaso2();
            this.cdr.detectChanges();
          });
        }, 150);
      }
    });
  }

  irAlPaso2(): void {
    this.stepAnimClass = 'step-enter-forward';
    this.currentStep = 2;
    this.scrollToForm();
  }

  prevStep(): void {
    if (this.currentStep === 2 && this.preselectedFromPricing) {
      this.preselectedFromPricing = false;
      this.formData.treatment = '';
    }
    if (this.currentStep === 3) {
      this.appointmentDateTime = null;
    }
    this.stepAnimClass = 'step-enter-back';
    this.currentStep--;
  }

  onCalendlyScheduled(event: AppointmentDateTime): void {
    this.appointmentDateTime = event;
    this.stepAnimClass = 'step-enter-forward';
    this.currentStep = 3;
    this.cdr.detectChanges();
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
          nombre: this.appointmentDateTime?.inviteeName ?? '',
          email: this.appointmentDateTime?.inviteeEmail ?? '',
          tratamiento: this.selectedTreatmentOption?.nombre,
          precio: this.selectedTreatmentOption?.precio,
          fecha: this.appointmentDateTime?.fecha,
          hora: this.appointmentDateTime?.hora,
          telefono: '',
        }),
        signal: controller.signal,
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
    const msg =
      `Hola CBM 😊 Quiero solicitar una cita.\n` +
      `Tratamiento: ${this.selectedTreatmentOption?.nombre}\n` +
      `Nombre: ${this.appointmentDateTime?.inviteeName ?? ''}\n` +
      `Email: ${this.appointmentDateTime?.inviteeEmail ?? ''}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
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
      horarios: tarifa.horarios,
      type: isPilates ? 'pilates' : isBundle ? 'bundle' : 'session',
      categoria: tarifa.categoria,
      showBadge: isPilates || isBundle,
    };
  }
}
