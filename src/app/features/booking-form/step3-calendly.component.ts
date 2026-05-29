import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { BookingTreatmentService, SelectedTreatment } from './booking-treatment.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare const Calendly: any;

const CALENDLY_URL =
  'https://calendly.com/reservascbm25/cita-cbm-fisioterapia?primary_color=c44b8e&hide_gdpr_banner=1&hide_landing_page_details=1&hide_event_type_details=1';

@Component({
  selector: 'app-step3-calendly',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step3-calendar-wrapper">
      <!-- Card resumen del tratamiento seleccionado -->
      <div *ngIf="selectedTreatment" class="treatment-summary-card">
        <h4 class="treatment-summary-title">Tratamiento seleccionado</h4>
        <div class="treatment-summary-content">
          <div class="treatment-summary-item">
            <span class="treatment-summary-label">Servicio</span>
            <span class="treatment-summary-value">{{ selectedTreatment.nombre }}</span>
          </div>
          <div class="treatment-summary-item">
            <span class="treatment-summary-label">Precio</span>
            <span class="treatment-summary-price">{{ selectedTreatment.precio }}</span>
          </div>
        </div>
        <p class="treatment-summary-note">
          ℹ️ Este dato se enviará junto con la confirmación de tu cita.
        </p>
      </div>

      <!-- Calendly embed -->
      <div id="calendly-inline-widget" style="min-width:320px;height:630px;"></div>
    </div>
  `,
  styles: [`
    .step3-calendar-wrapper {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .treatment-summary-card {
      background: linear-gradient(135deg, rgba(255, 79, 163, 0.04), rgba(168, 85, 247, 0.04));
      border: 1px solid rgba(241, 216, 230, 0.8);
      border-radius: 14px;
      padding: 16px 18px;
      backdrop-filter: blur(4px);
    }

    .treatment-summary-title {
      font-size: 14px;
      font-weight: 700;
      color: #1f1b2d;
      margin: 0 0 12px;
      letter-spacing: -0.01em;
    }

    .treatment-summary-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 12px;
    }

    .treatment-summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(231, 205, 221, 0.5);
    }

    .treatment-summary-item:last-of-type {
      border-bottom: none;
    }

    .treatment-summary-label {
      font-size: 12px;
      font-weight: 600;
      color: #9a92a8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .treatment-summary-value {
      font-size: 14px;
      color: #332d43;
      font-weight: 500;
      text-align: right;
      max-width: 55%;
    }

    .treatment-summary-price {
      font-size: 16px;
      font-weight: 800;
      color: #1f1b2d;
    }

    .treatment-summary-note {
      font-size: 12px;
      color: #7a728a;
      margin: 0;
      line-height: 1.5;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .treatment-summary-card {
        padding: 14px 16px;
      }

      .treatment-summary-title {
        font-size: 13px;
      }

      .treatment-summary-value {
        font-size: 13px;
      }

      .treatment-summary-price {
        font-size: 15px;
      }
    }
  `],
})
export class Step3CalendlyComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly bookingTreatmentService = inject(BookingTreatmentService);
  private scriptLoaded = false;
  private destroy$ = new Subject<void>();

  selectedTreatment: SelectedTreatment | null = null;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Suscribirse al tratamiento seleccionado
    this.bookingTreatmentService.selectedTreatment$
      .pipe(takeUntil(this.destroy$))
      .subscribe((treatment) => {
        this.selectedTreatment = treatment;
      });

    this.loadCalendly();
  }

  ngOnDestroy(): void {
    const container = document.getElementById('calendly-inline-widget');
    if (container) container.innerHTML = '';
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCalendly(): void {
    const existingScript = document.getElementById('calendly-script');

    if (existingScript && this.scriptLoaded) {
      this.initWidget();
      return;
    }

    const script = document.createElement('script');
    script.id = 'calendly-script';
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.onload = () => {
      this.scriptLoaded = true;
      setTimeout(() => this.initWidget(), 300);
    };
    document.head.appendChild(script);
  }

  private initWidget(): void {
    const container = document.getElementById('calendly-inline-widget');
    if (!container) return;

    // Obtener el tratamiento seleccionado
    const treatment = this.selectedTreatment;

    // Construir el customAnswer con el formato requerido
    const prefill: any = {};
    const utm: any = {};

    if (treatment) {
      // a1 es para la primera pregunta personalizada
      // Si en Calendly la pregunta "Tratamiento seleccionado" está en otra posición, ajusta aquí
      prefill.customAnswers = {
        a1: `${treatment.nombre} - ${treatment.precio}`,
      };
    }

    Calendly.initInlineWidget({
      url: CALENDLY_URL,
      parentElement: container,
      prefill,
      utm,
    });
  }
}


