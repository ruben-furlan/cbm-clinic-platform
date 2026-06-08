import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnDestroy,
  Output,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import type { Stripe, StripeElements } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { BookingTreatmentService, SelectedTreatment } from './booking-treatment.service';
import { StripePaymentService } from './stripe-payment.service';
import { CbmLoaderComponent } from '../../shared/components/cbm-loader/cbm-loader.component';

@Component({
  selector: 'app-step3-payment',
  standalone: true,
  imports: [CommonModule, CbmLoaderComponent],
  template: `
    <div class="stripe-payment-wrapper">
      <!-- Resumen tratamiento + cita -->
      <div class="stripe-summary-card" *ngIf="selectedTreatment">
        <div class="stripe-summary-row">
          <span class="stripe-summary-label">Tratamiento</span>
          <span class="stripe-summary-value"
            >{{ selectedTreatment.nombre }}
            <strong class="stripe-summary-price">{{ selectedTreatment.precio }}</strong></span
          >
        </div>
        <div class="stripe-summary-row">
          <span class="stripe-summary-label">Cita</span>
          <span class="stripe-summary-value stripe-summary-booked">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
              />
            </svg>
            Fecha y hora confirmadas
          </span>
        </div>
      </div>

      <!-- Aviso señal -->
      <div class="stripe-signal-badge">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" class="stripe-signal-icon">
          <path
            fill="currentColor"
            d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
          />
        </svg>
        <span>Señal de reserva <strong>10€</strong> · El resto se abona en el centro</span>
      </div>

      <!-- Loader mientras carga Stripe -->
      <cbm-loader *ngIf="loading"></cbm-loader>

      <!-- Error de inicialización -->
      <div class="stripe-init-error" *ngIf="initError && !loading">
        <p>{{ initError }}</p>
        <button type="button" class="step-btn-back" (click)="retry()">Reintentar</button>
      </div>

      <!-- Contenedor Stripe Elements -->
      <div
        #paymentContainer
        [hidden]="loading || !!initError"
        class="stripe-elements-container"
        aria-label="Formulario de pago seguro con Stripe"
      ></div>

      <!-- Error al confirmar pago -->
      <div class="stripe-payment-error" *ngIf="paymentError">
        {{ paymentError }}
      </div>

      <!-- Acciones -->
      <div class="step-actions step-actions--with-back">
        <button type="button" class="step-btn-back" (click)="goBack.emit()">← Atrás</button>
        <button
          type="button"
          class="btn-primary step-btn-continue stripe-pay-btn"
          [disabled]="loading || !!initError || processing"
          [class.step-btn-continue--disabled]="loading || !!initError || processing"
          [class.stripe-pay-btn--loading]="processing"
          (click)="handleSubmit()"
        >
          <span *ngIf="!processing">Confirmar y pagar 10€</span>
          <span *ngIf="processing" class="stripe-processing-text">
            <span class="stripe-spinner" aria-hidden="true"></span>
            Procesando…
          </span>
        </button>
      </div>

      <p class="stripe-secure-note">
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
          <path
            fill="currentColor"
            d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
          />
        </svg>
        Pago seguro gestionado por Stripe. CBM Fisioterapia no almacena datos de tu tarjeta.
      </p>
    </div>
  `,
  styles: [
    `
      .stripe-payment-wrapper {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      /* Resumen */
      .stripe-summary-card {
        background: rgba(255, 247, 251, 0.8);
        border: 1px solid rgba(241, 216, 230, 0.9);
        border-radius: 14px;
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .stripe-summary-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 12px;
        padding: 9px 0;
        border-bottom: 1px solid rgba(231, 205, 221, 0.5);
      }

      .stripe-summary-row:last-child {
        border-bottom: none;
        padding-bottom: 2px;
      }

      .stripe-summary-row:first-child {
        padding-top: 2px;
      }

      .stripe-summary-label {
        font-size: 11px;
        color: #9a92a8;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .stripe-summary-value {
        color: #332d43;
        font-size: 14px;
        font-weight: 500;
        text-align: right;
      }

      .stripe-summary-price {
        margin-left: 6px;
        color: #1f1b2d;
        font-weight: 800;
      }

      .stripe-summary-booked {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: #047857;
        font-weight: 600;
      }

      /* Badge señal */
      .stripe-signal-badge {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 13px 16px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(255, 79, 163, 0.07), rgba(168, 85, 247, 0.07));
        border: 1px solid rgba(241, 216, 230, 0.8);
        color: #4a4259;
        font-size: 14px;
        line-height: 1.45;
      }

      .stripe-signal-icon {
        flex-shrink: 0;
        color: #a855f7;
      }

      .stripe-signal-badge strong {
        color: #1f1b2d;
      }

      /* Stripe elements container */
      .stripe-elements-container {
        background: white;
        border: 1px solid rgba(231, 205, 221, 0.9);
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(31, 27, 45, 0.05);
      }

      /* Error */
      .stripe-init-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 20px;
        background: #fff1f5;
        border: 1px solid #fbc5d8;
        border-radius: 12px;
        text-align: center;
        color: #6e3050;
        font-size: 14px;
      }

      .stripe-payment-error {
        padding: 12px 14px;
        border-radius: 10px;
        background: #fff1f5;
        border: 1px solid #fbc5d8;
        color: #c0277e;
        font-size: 13px;
        font-weight: 600;
      }

      /* Botón pago */
      .stripe-pay-btn {
        min-width: 200px;
        font-size: 15px;
      }

      .stripe-pay-btn--loading {
        opacity: 0.75;
        cursor: wait;
      }

      .stripe-processing-text {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .stripe-spinner {
        display: inline-block;
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: white;
        border-radius: 50%;
        animation: spinnerRotate 0.7s linear infinite;
      }

      @keyframes spinnerRotate {
        to {
          transform: rotate(360deg);
        }
      }

      /* Nota seguridad */
      .stripe-secure-note {
        display: flex;
        align-items: center;
        gap: 5px;
        margin: 0;
        color: #9a92a8;
        font-size: 11px;
        line-height: 1.5;
      }

      @media (max-width: 768px) {
        .stripe-elements-container {
          padding: 16px;
        }

        .stripe-pay-btn {
          min-width: 0;
          width: 100%;
        }
      }
    `,
  ],
})
export class Step3PaymentComponent implements AfterViewInit, OnDestroy {
  @ViewChild('paymentContainer') paymentContainer!: ElementRef<HTMLDivElement>;
  @Output() paymentSuccess = new EventEmitter<void>();
  @Output() goBack = new EventEmitter<void>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly bookingTreatmentService = inject(BookingTreatmentService);
  private readonly stripePaymentService = inject(StripePaymentService);

  selectedTreatment: SelectedTreatment | null = null;
  loading = true;
  processing = false;
  initError: string | null = null;
  paymentError: string | null = null;

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    this.selectedTreatment = this.bookingTreatmentService.getSelectedTreatment();
    await this.initStripe();
  }

  ngOnDestroy(): void {
    this.elements = null;
    this.stripe = null;
  }

  async retry(): Promise<void> {
    this.initError = null;
    this.loading = true;
    this.cdr.detectChanges();
    await this.initStripe();
  }

  async handleSubmit(): Promise<void> {
    if (!this.stripe || !this.elements || this.processing) return;

    this.processing = true;
    this.paymentError = null;
    this.cdr.detectChanges();

    const result = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: 'https://cbmfisioterapia.com/solicitar-cita?payment=success',
      },
      redirect: 'if_required',
    });

    if (result.error) {
      this.paymentError = result.error.message ?? 'Error al procesar el pago. Inténtalo de nuevo.';
      this.processing = false;
      this.cdr.detectChanges();
    } else if (result.paymentIntent?.status === 'succeeded') {
      this.paymentSuccess.emit();
    }
  }

  private async initStripe(): Promise<void> {
    try {
      const stripe = await loadStripe(environment.stripePublishableKey);
      if (!stripe) throw new Error('Stripe no disponible');

      const tratamiento = this.selectedTreatment?.nombre ?? '';
      const clientSecret = await this.stripePaymentService.createPaymentIntent(tratamiento);

      const elements = stripe.elements({
        clientSecret,
        locale: 'es',
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#c44b8e',
            colorBackground: '#ffffff',
            colorText: '#1f1b2d',
            colorDanger: '#e05c7b',
            fontFamily: 'inherit',
            borderRadius: '10px',
          },
        },
      });

      const paymentElement = elements.create('payment');
      paymentElement.mount(this.paymentContainer.nativeElement);

      this.stripe = stripe;
      this.elements = elements;
      this.loading = false;
      this.cdr.detectChanges();
    } catch {
      this.initError = 'No se pudo cargar el formulario de pago. Comprueba tu conexión e inténtalo de nuevo.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
