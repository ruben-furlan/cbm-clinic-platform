import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface CalendlyEventPayload {
  event: string;
  payload: {
    event: { start_time: string; end_time: string };
    invitee: { name: string; email: string };
  };
}

export interface AppointmentDateTime {
  fecha: string; // dd/MM/yyyy
  hora: string; // HH:mm
  isoString: string;
}

interface CalendlyInitOptions {
  url: string;
  parentElement: Element;
  prefill?: { name?: string; email?: string };
}

interface CalendlyGlobal {
  initInlineWidget(options: CalendlyInitOptions): void;
}

declare global {
  interface Window {
    Calendly?: CalendlyGlobal;
  }
}

const SCRIPT_URL = 'https://assets.calendly.com/assets/external/widget.js';
const EVENT_URL =
  'https://calendly.com/reservascbm25/cita-cbm-fisioterapia?primary_color=c44b8e&hide_gdpr_banner=1&hide_landing_page_details=1&hide_event_type_details=1';

@Injectable({ providedIn: 'root' })
export class CalendlyService {
  private readonly platformId = inject(PLATFORM_ID);
  private messageHandler: ((e: MessageEvent) => void) | null = null;

  loadScript(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve();
    if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Calendly script failed to load'));
      document.head.appendChild(script);
    });
  }

  initWidget(element: Element, name: string, email: string): void {
    if (!isPlatformBrowser(this.platformId) || !window.Calendly) return;

    window.Calendly.initInlineWidget({
      url: EVENT_URL,
      parentElement: element,
      prefill: { name, email },
    });
  }

  listenEvents(onScheduled: (dt: AppointmentDateTime) => void): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.destroyListeners();

    this.messageHandler = (e: MessageEvent) => {
      if (!this.isCalendlyEvent(e)) return;
      const payload = e.data as CalendlyEventPayload;
      if (payload.event !== 'calendly.event_scheduled') return;
      onScheduled(this.parseDateTime(payload.payload.event.start_time));
    };

    window.addEventListener('message', this.messageHandler);
  }

  parseDateTime(isoString: string): AppointmentDateTime {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return {
      fecha: `${day}/${month}/${year}`,
      hora: `${hours}:${minutes}`,
      isoString,
    };
  }

  destroyWidget(): void {
    this.destroyListeners();
  }

  private destroyListeners(): void {
    if (this.messageHandler) {
      if (isPlatformBrowser(this.platformId)) {
        window.removeEventListener('message', this.messageHandler);
      }
      this.messageHandler = null;
    }
  }

  private isCalendlyEvent(e: MessageEvent): boolean {
    return (
      typeof e.data === 'object' &&
      e.data !== null &&
      typeof (e.data as Record<string, unknown>)['event'] === 'string' &&
      String((e.data as Record<string, unknown>)['event']).startsWith('calendly.')
    );
  }
}
