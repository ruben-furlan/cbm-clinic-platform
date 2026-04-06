import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CbmEvent, EventsService } from '../../../core/services/events.service';
import { EventRegistrationModalComponent } from '../../events/event-registration-modal/event-registration-modal.component';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-events-section',
  standalone: true,
  imports: [CommonModule, EventRegistrationModalComponent, RevealOnScrollDirective],
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
      // Carga todos los próximos eventos visibles.
      // Los destacados (highlight_on_home=true) se ordenan primero en la query.
      this.events = await this.eventsService.getUpcomingEvents(6);
    } catch {
      // Silent fail — sección opcional, no bloquear la home
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
    if (this.isFull(event)) return 'Avisadme de la próxima';
    return event.cta_label ?? (event.pricing_type === 'free' ? 'Apuntarme gratis' : 'Reservar plaza');
  }

  trackById(_: number, event: CbmEvent): string {
    return event.id;
  }
}
