import {
  Component,
  AfterViewInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  NgZone,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

declare const Calendly: any;

export interface AppointmentDateTime {
  fecha: string; // dd/MM/yyyy
  hora: string; // HH:mm
  isoString: string;
}

const CALENDLY_URL =
  'https://calendly.com/reservascbm25/cita-cbm-fisioterapia?primary_color=c44b8e&hide_gdpr_banner=1&hide_landing_page_details=1&hide_event_type_details=1';

@Component({
  selector: 'app-step3-calendly',
  standalone: true,
  template: ` <div id="calendly-inline-widget" style="min-width:320px;height:630px;"></div> `,
})
export class Step3CalendlyComponent implements AfterViewInit, OnDestroy {
  @Input() name = '';
  @Input() email = '';
  @Output() scheduled = new EventEmitter<AppointmentDateTime>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  private scriptLoaded = false;
  private messageHandler: ((e: MessageEvent) => void) | null = null;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadCalendly();
    this.listenForScheduled();
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

    Calendly.initInlineWidget({
      url: CALENDLY_URL,
      parentElement: container,
      prefill: { name: this.name, email: this.email },
      utm: {},
    });
  }

  private listenForScheduled(): void {
    this.messageHandler = (e: MessageEvent) => {
      if (typeof e.data !== 'object' || !e.data) return;
      if (e.data.event !== 'calendly.event_scheduled') return;
      const isoString: string | undefined = e.data.payload?.event?.start_time;
      if (!isoString) return;
      this.ngZone.run(() => this.scheduled.emit(this.parseDateTime(isoString)));
    };
    window.addEventListener('message', this.messageHandler);
  }

  private parseDateTime(isoString: string): AppointmentDateTime {
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

  ngOnDestroy(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
    const container = document.getElementById('calendly-inline-widget');
    if (container) container.innerHTML = '';
  }
}
