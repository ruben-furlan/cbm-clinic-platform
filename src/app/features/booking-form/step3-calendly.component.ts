import { Component, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
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
      <div *ngIf="selectedTreatment" class="treatment-summary-card-compact">
        <span class="treatment-summary-compact-label">Tratamiento:</span>
        <span class="treatment-summary-compact-value"
          >{{ selectedTreatment.nombre }} - {{ selectedTreatment.precio }}</span
        >
      </div>

      <div class="calendly-steps-guide" aria-label="Pasos dentro del formulario de cita">
        <div class="csg-step">
          <span class="csg-circle">1</span>
          <span class="csg-text">Elige tu fecha y hora</span>
        </div>
        <span class="csg-sep" aria-hidden="true">→</span>
        <div class="csg-step">
          <span class="csg-circle">2</span>
          <span class="csg-text">Introduce tus datos</span>
        </div>
        <span class="csg-sep" aria-hidden="true">→</span>
        <div class="csg-step">
          <span class="csg-circle">3</span>
          <span class="csg-text">Aparta tu cita con una señal de 10€ 💜</span>
        </div>
      </div>

      <div id="calendly-inline-widget" style="min-width:320px;height:630px;"></div>
    </div>

    <div
      *ngIf="showScrollIndicator"
      class="scroll-hint"
      [class.scroll-hint--fading]="isFadingOut"
      aria-hidden="true"
    >
      <span class="scroll-hint-arrow">↓</span>
      <span class="scroll-hint-text">Desliza para continuar</span>
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

      .calendly-steps-guide {
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 2px 12px rgba(168, 85, 247, 0.08);
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        flex-wrap: nowrap;
      }

      .csg-step {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      .csg-circle {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: linear-gradient(135deg, #e879b0, #9b59b6);
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .csg-text {
        font-size: 12px;
        font-weight: 500;
        color: #4b4560;
        line-height: 1.3;
      }

      .csg-sep {
        font-size: 13px;
        color: #d4c7e8;
        flex-shrink: 0;
      }

      .scroll-hint {
        display: none;
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, rgba(196, 75, 142, 0.88), rgba(168, 85, 247, 0.88));
        backdrop-filter: blur(6px);
        border-radius: 999px;
        padding: 10px 22px;
        align-items: center;
        gap: 8px;
        z-index: 1000;
        pointer-events: none;
        opacity: 1;
        transition: opacity 0.4s ease;
      }

      .scroll-hint--fading {
        opacity: 0;
      }

      .scroll-hint-arrow {
        font-size: 15px;
        color: #fff;
        animation: bounceArrow 1.4s ease-in-out infinite;
      }

      .scroll-hint-text {
        font-size: 13px;
        font-weight: 600;
        color: #fff;
        white-space: nowrap;
      }

      @keyframes bounceArrow {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(4px);
        }
      }

      @media (max-width: 768px) {
        .calendly-steps-guide {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
        }

        .csg-sep {
          display: none;
        }

        .csg-text {
          font-size: 13px;
        }

        .scroll-hint {
          display: flex;
        }

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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly bookingTreatmentService = inject(BookingTreatmentService);
  private readonly ngZone = inject(NgZone);
  private scriptLoaded = false;
  private destroy$ = new Subject<void>();
  private initialScrollY = 0;
  private scrollListener?: () => void;

  selectedTreatment: SelectedTreatment | null = null;
  showScrollIndicator = false;
  isFadingOut = false;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.bookingTreatmentService.selectedTreatment$
      .pipe(takeUntil(this.destroy$))
      .subscribe((treatment) => {
        this.selectedTreatment = treatment;
      });

    this.loadCalendly();
    this.initScrollIndicator();
  }

  ngOnDestroy(): void {
    const container = document.getElementById('calendly-inline-widget');
    if (container) container.innerHTML = '';
    this.destroy$.next();
    this.destroy$.complete();
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  private initScrollIndicator(): void {
    if (window.innerWidth > 768) return;

    this.showScrollIndicator = true;
    this.initialScrollY = window.scrollY;

    this.scrollListener = () => {
      if (window.scrollY - this.initialScrollY > 100) {
        window.removeEventListener('scroll', this.scrollListener!);
        this.ngZone.run(() => {
          this.isFadingOut = true;
          setTimeout(() => {
            this.showScrollIndicator = false;
          }, 400);
        });
      }
    };

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.scrollListener!, { passive: true });
    });
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
    const prefill: any = {};
    const utm: any = {};

    if (treatment) {
      prefill.customAnswers = {
        a2: `${treatment.nombre} - ${treatment.precio}`,
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
