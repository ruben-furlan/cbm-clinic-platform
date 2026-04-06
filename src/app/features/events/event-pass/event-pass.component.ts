import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CbmEvent, EventRegistration, EventsService } from '../../../core/services/events.service';

const WHATSAPP_PHONE = '34662561672';

@Component({
  selector: 'app-event-pass',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-pass.component.html',
  styleUrl: './event-pass.component.css'
})
export class EventPassComponent {
  @Input({ required: true }) registration!: EventRegistration;
  @Input({ required: true }) event!: CbmEvent;
  @Output() whatsappClicked = new EventEmitter<void>();

  copied = false;

  constructor(private readonly eventsService: EventsService) {}

  get isPending(): boolean {
    return this.registration.status === 'pending';
  }

  get formattedDate(): string {
    return this.eventsService.formatEventDate(this.event.start_at);
  }

  get formattedTime(): string {
    return this.eventsService.formatEventTime(this.event.start_at);
  }

  get passTitle(): string {
    return this.isPending ? 'Solicitud recibida' : 'Plaza confirmada';
  }

  get passSubtitle(): string {
    return this.isPending
      ? 'Te confirmaremos la plaza en breve'
      : 'Muestra este código al llegar al centro';
  }

  get codeHint(): string {
    return this.isPending
      ? 'Guárdalo como referencia de tu solicitud'
      : 'Preséntalo en recepción el día de tu sesión';
  }

  async copyCode(): Promise<void> {
    const code = this.registration.access_code;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      this.copied = true;
      setTimeout(() => { this.copied = false; }, 2200);
    } catch {
      // Fallback: seleccionar texto visualmente
    }
  }

  shareWhatsApp(): void {
    const code = this.registration.access_code ?? '';
    const name = this.registration.full_name;
    const title = this.event.title;
    const date = `${this.formattedDate} · ${this.formattedTime}`;

    const lines = [
      `Hola, acabo de registrarme en:`,
      `*${title}*`,
      date,
      ``,
      `Mi código: *${code}*`,
      `Nombre: ${name}`,
      ``,
      `¿Podéis confirmar mi plaza?`
    ];

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank');
    this.whatsappClicked.emit();
  }

  // Hook preparado para QR (integrar librería qrcode en paso posterior)
  get qrValue(): string {
    return this.registration.access_code ?? this.registration.id;
  }
}
