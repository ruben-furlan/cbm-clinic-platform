import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [RevealOnScrollDirective],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css']
})
export class BookingFormComponent implements AfterViewInit, OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);

  private observer?: IntersectionObserver;

  readonly calendlyEmbedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://calendly.com/d/cxy5-km7-cmn/sesion-fisioterapia?hide_event_type_details=1&hide_gdpr_banner=1&background_color=ffffff&text_color=302b3f&primary_color=ff4fa3'
  );

  readonly whatsAppUrl = 'https://wa.me/34662561672';

  ngAfterViewInit(): void {
    if (!window.matchMedia('(max-width: 768px)').matches) {
      return;
    }

    const section = this.host.nativeElement.querySelector('#reserva');
    if (!section) {
      return;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        this.document.body.classList.toggle('booking-mobile-focus', entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.35
      }
    );

    this.observer.observe(section);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.document.body.classList.remove('booking-mobile-focus');
  }
}
