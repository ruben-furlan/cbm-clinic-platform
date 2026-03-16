import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/header/header';
import { FooterComponent } from './core/footer/footer';
import { FloatingWhatsappButtonComponent } from './core/floating-whatsapp-button/floating-whatsapp-button';
import { CookieConsentComponent } from './core/cookie-consent/cookie-consent';
import { FloatingBookingButtonComponent } from './core/floating-booking-button/floating-booking-button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, FooterComponent, FloatingWhatsappButtonComponent, FloatingBookingButtonComponent, CookieConsentComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  private rafId: number | null = null;
  private readonly onScroll = (): void => this.scheduleScrollProgressUpdate();

  ngOnInit(): void {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.updateScrollProgress();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);

    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
    }
  }

  private scheduleScrollProgressUpdate(): void {
    if (this.rafId !== null) {
      return;
    }

    this.rafId = window.requestAnimationFrame(() => {
      this.rafId = null;
      this.updateScrollProgress();
    });
  }

  private updateScrollProgress(): void {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(scrollTop / maxScroll, 1);

    doc.style.setProperty('--scroll-progress', progress.toFixed(4));
  }
}
