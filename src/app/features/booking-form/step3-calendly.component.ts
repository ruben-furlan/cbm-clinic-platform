import { Component, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { BookingTreatmentService, SelectedTreatment } from './booking-treatment.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare const Calendly: {
  initInlineWidget: (opts: {
    url: string;
    parentElement: HTMLElement;
    prefill: Record<string, unknown>;
    utm: Record<string, unknown>;
  }) => void;
};

const CALENDLY_URL =
  'https://calendly.com/reservascbm25/cita-cbm-fisioterapia?primary_color=c44b8e&hide_gdpr_banner=1&hide_landing_page_details=1&hide_event_type_details=1';

@Component({
  selector: 'app-step3-calendly',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step3-calendar-wrapper">
      <div *ngIf="selectedTreatment" class="treatment-summary-card-compact">
        <span class="treatment-summary-compact-label">Tratamiento:</span>
        <span class="treatment-summary-compact-value"
          >{{ selectedTreatment.nombre }} — {{ selectedTreatment.precio }}</span
        >
      </div>

      <div *ngIf="isBooked" class="calendly-booked-banner">
        <span class="calendly-booked-icon" aria-hidden="true">✅</span>
        <div>
          <p class="calendly-booked-title">¡Cita programada!</p>
          <p class="calendly-booked-sub">
            Tu fecha y hora han quedado reservadas. Ahora confirma el pago de señal.
          </p>
        </div>
      </div>

      <div id="calendly-inline-widget" [style.display]="isBooked ? 'none' : 'block'" style="min-width:320px;height:630px;"></div>

      <div *ngIf="isBooked" class="step-actions">
        <button type="button" class="btn-primary step-btn-continue" (click)="appointmentScheduled.emit()">
          Continuar al pago →
        </button>
      </div>
    </div>
  `,
  styles: [
    `
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

      .calendly-booked-banner {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 20px;
        background: rgba(16, 185, 129, 0.08);
        border: 1px solid rgba(16, 185, 129, 0.25);
        border-radius: 16px;
      }

      .calendly-booked-icon {
        font-size: 28px;
        line-height: 1;
        flex-shrink: 0;
      }

      .calendly-booked-title {
        margin: 0 0 3px;
        font-size: 16px;
        font-weight: 700;
        color: #065f46;
      }

      .calendly-booked-sub {
        margin: 0;
        font-size: 13px;
        color: #047857;
        line-height: 1.55;
      }

      @media (max-width: 768px) {
        .treatment-summary-card-compact {
          padding: 9px 12px;
        }

        .treatment-summary-compact-label {
          font-size: 10px;
        }

        .treatment-summary-compact-value {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class Step3CalendlyComponent implements AfterViewInit, OnDestroy {
  @Output() appointmentScheduled = new EventEmitter<void>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly bookingTreatmentService = inject(BookingTreatmentService);
  private scriptLoaded = false;
  private destroy$ = new Subject<void>();
  private onMessage = (e: MessageEvent) => this.handleMessage(e);

  selectedTreatment: SelectedTreatment | null = null;
  isBooked = false;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.bookingTreatmentService.selectedTreatment$
      .pipe(takeUntil(this.destroy$))
      .subscribe((treatment) => {
        this.selectedTreatment = treatment;
      });

    window.addEventListener('message', this.onMessage);
    this.loadCalendly();
  }

  ngOnDestroy(): void {
    const container = document.getElementById('calendly-inline-widget');
    if (container) container.innerHTML = '';
    window.removeEventListener('message', this.onMessage);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleMessage(e: MessageEvent): void {
    if (
      e.data &&
      typeof e.data === 'object' &&
      (e.data as { event?: string }).event === 'calendly.event_scheduled'
    ) {
      this.isBooked = true;
      this.bookingTreatmentService.setCalendarBooked(true);
    }
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

    const treatment = this.selectedTreatment;
    const prefill: Record<string, unknown> = {};

    if (treatment) {
      prefill['customAnswers'] = {
        a2: `${treatment.nombre} - ${treatment.precio}`,
      };
    }

    Calendly.initInlineWidget({
      url: CALENDLY_URL,
      parentElement: container,
      prefill,
      utm: {},
    });
  }
}
