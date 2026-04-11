import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CbmEvent, EventsService } from '../../../core/services/events.service';
import { EventRegistrationModalComponent } from '../../events/event-registration-modal/event-registration-modal.component';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';
import { NewsletterFormComponent } from '../../../shared/components/newsletter-form/newsletter-form.component';

@Component({
  selector: 'app-events-section',
  standalone: true,
  imports: [CommonModule, EventRegistrationModalComponent, RevealOnScrollDirective, NewsletterFormComponent],
  templateUrl: './events-section.component.html',
  styleUrl: './events-section.component.css'
})
export class EventsSectionComponent implements OnInit {
  events: CbmEvent[] = [];
  loading = true;
  selectedEvent: CbmEvent | null = null;

  constructor(private readonly eventsService: EventsService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.events = await this.eventsService.getUpcomingEvents(6);
    } catch {
      this.events = [];
    } finally {
      this.loading = false;
    }
  }

  openModal(event: CbmEvent): void {
    this.selectedEvent = event;
  }

  closeModal(): void {
    this.selectedEvent = null;
  }

  onRegistered(eventId: string): void {
    // Incrementar reserved_slots en el array local para que la card refleje
    // el estado correcto sin necesidad de recargar toda la lista.
    this.events = this.events.map(e =>
      e.id === eventId ? { ...e, reserved_slots: e.reserved_slots + 1 } : e
    );
    // Actualizar también selectedEvent para que el modal tenga datos frescos
    // si el usuario no lo cierra inmediatamente.
    if (this.selectedEvent?.id === eventId) {
      this.selectedEvent = this.events.find(e => e.id === eventId) ?? null;
    }
  }

  getAvailableSlots(event: CbmEvent): number {
    return this.eventsService.getAvailableSlots(event);
  }

  isFull(event: CbmEvent): boolean {
    return this.eventsService.isFull(event);
  }

  isAlmostFull(event: CbmEvent): boolean {
    return this.eventsService.isAlmostFull(event);
  }

  formatDate(startAt: string): string {
    return this.eventsService.formatEventDate(startAt);
  }

  formatTime(startAt: string): string {
    return this.eventsService.formatEventTime(startAt);
  }

  getCtaLabel(event: CbmEvent): string {
    if (this.isFull(event)) return 'Quiero empezar';
    return event.cta_label ?? (event.pricing_type === 'free' ? 'Apuntarme gratis' : 'Reservar plaza');
  }

  trackById(_: number, event: CbmEvent): string {
    return event.id;
  }
}
