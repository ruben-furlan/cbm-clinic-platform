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
import { ActivatedRoute } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import {
  HorarioFranja,
  Tarifa,
  TarifaCategoria,
  TarifasService,
} from '../../core/services/tarifas.service';
import { CbmLoaderComponent } from '../../shared/components/cbm-loader/cbm-loader.component';
import { HorarioChipsComponent } from '../../shared/components/horario-chips/horario-chips.component';
import { Step3CalendlyComponent } from './step3-calendly.component';
import { BookingTreatmentService } from './booking-treatment.service';
import {
  ConfiguracionService,
  DEFAULT_PUBLIC_CALENDLY_URL,
} from '../../core/services/configuracion.service';

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
    private readonly bookingTreatmentService: BookingTreatmentService,
    private readonly configuracionService: ConfiguracionService,
  ) {}

  currentStep = 1;
  stepAnimClass = '';
  isMobile = false;

  loadingTarifas = true;
  errorTarifas = false;
  preselectedFromPricing = false;

  treatmentOptions: TreatmentOption[] = [];
  formData = { treatment: '' };

  availabilityType: 'green' | 'amber' = 'green';
  availabilityText = '';

  // Modo de cobro de la seña: true = pago por la web (Calendly+Stripe),
  // false = Calendly free solo agenda y cobro manual (transferencia / link por WhatsApp)
  pagoWebActivo = true;
  publicCalendlyUrl = DEFAULT_PUBLIC_CALENDLY_URL;

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
      const pagoWeb = await this.configuracionService.getPagoWebConfig();
      this.pagoWebActivo = pagoWeb.activo;
      this.publicCalendlyUrl = pagoWeb.calendlyUrl;
    } catch {
      // Sin config accesible, se mantiene el modo por defecto (pago por la web)
    }

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
    this.availabilityText = 'Elige tu tratamiento y reserva tu cita ahora';
  }

  private applyPreselectionFromQuery(): void {
    const tarifaId = this.route.snapshot.queryParamMap.get('tarifaId');
    if (!tarifaId) return;

    const matched = this.treatmentOptions.find((option) => option.value === tarifaId);
    if (!matched) return;

    this.formData.treatment = matched.value;
    // Guardar en el servicio (preselección desde página de tarifas)
    this.bookingTreatmentService.setSelectedTreatment({
      id: matched.value,
      nombre: matched.nombre,
      precio: matched.precio,
    });
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
    return !!this.selectedTreatmentOption;
  }

  get canAdvancePayment(): boolean {
    return !!this.selectedTreatmentOption;
  }

  seleccionarTratamiento(option: TreatmentOption): void {
    this.ngZone.run(() => {
      this.formData.treatment = option.value;
      // Guardar en el servicio
      this.bookingTreatmentService.setSelectedTreatment({
        id: option.value,
        nombre: option.nombre,
        precio: option.precio,
      });
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
    // Validación: si no hay tratamiento, no permitir avanzar al pago
    if (!this.canAdvanceStep1) {
      return;
    }
    this.stepAnimClass = 'step-enter-forward';
    this.currentStep = 2;
    this.scrollToForm();
  }

  irAlPaso3(): void {
    // Validación: si no hay tratamiento, no permitir mostrar Calendly
    if (!this.canAdvancePayment) {
      return;
    }
    this.stepAnimClass = 'step-enter-forward';
    this.currentStep = 3;
    this.scrollToForm();
  }

  prevStep(): void {
    if (this.currentStep <= 1) {
      return;
    }

    this.stepAnimClass = 'step-enter-back';
    this.currentStep--;
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
