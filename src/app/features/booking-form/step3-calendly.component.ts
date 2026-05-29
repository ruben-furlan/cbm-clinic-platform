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
      <!-- Card resumen del tratamiento seleccionado (compacto) -->
      <div *ngIf="selectedTreatment" class="treatment-summary-card-compact">
        <span class="treatment-summary-compact-label">Tratamiento:</span>
        <span class="treatment-summary-compact-value">{{ selectedTreatment.nombre }} - {{ selectedTreatment.precio }}</span>
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

    .treatment-summary-card-compact {
      background: linear-gradient(135deg, rgba(255, 79, 163, 0.06), rgba(168, 85, 247, 0.06));
      border: 1px solid rgba(241, 216, 230, 0.7);
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .treatment-summary-compact-label {
      font-size: 11px;
      font-weight: 700;
      color: #9a92a8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .treatment-summary-compact-value {
      font-size: 13px;
      font-weight: 600;
      color: #1f1b2d;
    }

    @media (max-width: 768px) {
      .treatment-summary-card-compact {
        padding: 9px 12px;
        font-size: 12px;
      }

      .treatment-summary-compact-label {
        font-size: 10px;
      }

      .treatment-summary-compact-value {
        font-size: 12px;
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

    // Construir el prefill - el campo "tratamiento" es una pregunta personalizada
    // Basado en la posición en Calendly (verificar cuál es el índice correcto)
    const prefill: any = {};
    const utm: any = {};

    if (treatment) {
      // IMPORTANTE: Verificar en Calendly cuál es el índice exacto del campo "tratamiento"
      // En Calendly: Settings → Questions → fíjate el orden de preguntas personalizadas
      // Primera personalizada = a1, Segunda = a2, Tercera = a3, etc.
      prefill.customAnswers = {
        a2: `${treatment.nombre} - ${treatment.precio}`, // ← Cambiar a2 al índice correcto si es necesario
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


