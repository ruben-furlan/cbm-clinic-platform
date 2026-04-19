import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CbmEvent, EventRegistration, EventsService } from '../../../core/services/events.service';
import { EventPassComponent } from '../event-pass/event-pass.component';

type ModalStep = 'details' | 'form' | 'success' | 'rejected' | 'full';

const WHATSAPP_PHONE = '34662561672';

@Component({
  selector: 'app-event-registration-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, EventPassComponent],
  templateUrl: './event-registration-modal.component.html',
  styleUrl: './event-registration-modal.component.css'
})
export class EventRegistrationModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) event!: CbmEvent;
  @Output() closed = new EventEmitter<void>();
  @Output() registered = new EventEmitter<string>(); // emite event.id tras inscripción exitosa

  step: ModalStep = 'details';
  saving = false;
  error = '';

  registration: EventRegistration | null = null;
  rejectionReason: 'blocked_new_clients' | 'blocked_cooldown' | 'limit_exceeded' | null = null;

  formData = { fullName: '', email: '', phone: '', notes: '' };
  touched = { fullName: false, email: false, phone: false };

  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private readonly eventsService: EventsService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (this.eventsService.isFull(this.event)) {
      this.step = 'full';
    }
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.classList.add('modal-abierto');
    }
  }

  ngOnDestroy(): void {
    this.unlockBody();
  }

  private unlockBody(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.classList.remove('modal-abierto');
    }
  }

  get availableSlots(): number {
    return this.eventsService.getAvailableSlots(this.event);
  }

  get isAlmostFull(): boolean {
    return this.eventsService.isAlmostFull(this.event);
  }

  get formattedDate(): string {
    return this.eventsService.formatEventDate(this.event.start_at);
  }

  get formattedTime(): string {
    return this.eventsService.formatEventTime(this.event.start_at);
  }

  get displayPrice(): string {
    if (this.event.pricing_type === 'free') return 'Gratis';
    return `${this.event.price ?? 0}€`;
  }

  get ctaLabel(): string {
    return this.event.cta_label ?? (this.event.pricing_type === 'free' ? 'Apuntarme' : 'Reservar plaza');
  }

  get nameInvalid(): boolean {
    return this.touched.fullName && !this.formData.fullName.trim();
  }

  get emailInvalid(): boolean {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.touched.email && !emailRe.test(this.formData.email);
  }

  get phoneInvalid(): boolean {
    return this.touched.phone && this.formData.phone.trim().length < 9;
  }

  get formValid(): boolean {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      !!this.formData.fullName.trim() &&
      emailRe.test(this.formData.email) &&
      this.formData.phone.trim().length >= 9
    );
  }

  /** Mensaje contextual para el paso rejected según la razón */
  get rejectionTitle(): string {
    if (this.rejectionReason === 'blocked_new_clients') {
      return 'Esta sesión es para nuevos participantes';
    }
    return 'Ya tienes una clase reciente';
  }

  get rejectionBody(): string {
    if (this.rejectionReason === 'blocked_new_clients') {
      return 'Esta clase gratuita está pensada como primera toma de contacto. Parece que ya has participado antes — ¡genial! Te invitamos a explorar nuestras clases regulares y tarifas.';
    }
    if (this.rejectionReason === 'blocked_cooldown') {
      return 'Has asistido recientemente a una de nuestras sesiones gratuitas. Para que más personas puedan disfrutarlas, hay un período de espera entre clases. Escríbenos y te ayudamos a encontrar la opción que mejor te encaje.';
    }
    return 'No ha sido posible completar la inscripción. Escríbenos y te ayudamos directamente.';
  }

  goToForm(): void {
    this.step = 'form';
  }

  close(): void {
    this.unlockBody();
    this.closed.emit();
  }

  async submit(): Promise<void> {
    this.touched = { fullName: true, email: true, phone: true };
    if (!this.formValid || this.saving) return;

    this.saving = true;
    this.error = '';

    try {
      const { registration, rejected } = await this.eventsService.registerForEvent({
        event_id:  this.event.id,
        full_name: this.formData.fullName,
        email:     this.formData.email,
        phone:     this.formData.phone,
        notes:     this.formData.notes,
        source:    'home'
      }, this.event);

      this.registration = registration;

      if (rejected) {
        this.rejectionReason = (registration.rejection_reason as typeof this.rejectionReason) ?? null;
        this.step = 'rejected';
      } else {
        this.registered.emit(this.event.id);
        this.step = 'success';
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'no_slots') {
        this.step = 'full';
      } else if (msg === 'event_inactive' || msg === 'event_not_available') {
        this.error = 'Este evento ya no está disponible. Por favor, recarga la página.';
      } else {
        this.error = 'No se pudo procesar tu solicitud. Inténtalo de nuevo o contáctanos por WhatsApp.';
      }
    } finally {
      this.saving = false;
    }
  }

  openWhatsApp(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const eventLine = `Clase/evento: ${this.event.title}`;
    const dateLine = `Fecha: ${this.formattedDate} a las ${this.formattedTime}`;
    const nameLine = this.formData.fullName ? `\nNombre: ${this.formData.fullName}` : '';
    const text = `Hola, me interesa apuntarme a una clase.\n\n${eventLine}\n${dateLine}${nameLine}`;
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  }

  openWhatsAppAlternative(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const text = 'Hola, me interesa información sobre vuestras clases y tarifas.';
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  }

  goToBookingRequest(): void {
    this.close();
    void this.router.navigate(['/solicitar-cita']);
  }
}
