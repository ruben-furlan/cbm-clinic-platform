import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [RevealOnScrollDirective],
  templateUrl: './booking-form.html',
  styleUrls: ['./booking-form.css']
})
export class BookingFormComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly calendlyEmbedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://calendly.com/d/cxy5-km7-cmn/sesion-fisioterapia?hide_event_type_details=1&hide_gdpr_banner=1&background_color=ffffff&text_color=302b3f&primary_color=ff4fa3'
  );

  readonly whatsAppUrl = 'https://wa.me/34662561672';
}
