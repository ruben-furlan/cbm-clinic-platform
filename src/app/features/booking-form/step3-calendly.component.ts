import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';

declare const Calendly: any;

const CALENDLY_URL =
  'https://calendly.com/reservascbm25/cita-cbm-fisioterapia?primary_color=c44b8e&hide_gdpr_banner=1&hide_landing_page_details=1&hide_event_type_details=1';

@Component({
  selector: 'app-step3-calendly',
  standalone: true,
  template: ` <div id="calendly-inline-widget" style="min-width:320px;height:630px;"></div> `,
})
export class Step3CalendlyComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private scriptLoaded = false;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadCalendly();
  }

  ngOnDestroy(): void {
    const container = document.getElementById('calendly-inline-widget');
    if (container) container.innerHTML = '';
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
      prefill: {},
      utm: {},
    });
  }
}
