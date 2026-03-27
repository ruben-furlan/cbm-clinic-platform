import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { Header } from './core/header/header';
import { FooterComponent } from './core/footer/footer';
import { FloatingWhatsappButtonComponent } from './core/floating-whatsapp-button/floating-whatsapp-button';
import { CookieConsentComponent } from './core/cookie-consent/cookie-consent';
import { FloatingBookingButtonComponent } from './core/floating-booking-button/floating-booking-button';
import { CanonicalService } from './core/seo/canonical.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, FooterComponent, FloatingWhatsappButtonComponent, FloatingBookingButtonComponent, CookieConsentComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  isDisplayRoute = false;

  private rafId: number | null = null;
  private routerEventsSubscription: Subscription | null = null;
  private readonly onScroll = (): void => this.scheduleScrollProgressUpdate();

  constructor(
    private readonly router: Router,
    private readonly canonicalService: CanonicalService
  ) {}

  ngOnInit(): void {
    this.updateRouteState(this.router.url);
    this.canonicalService.updateFromUrl(this.router.url);

    this.routerEventsSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.updateRouteState(event.urlAfterRedirects);
        this.canonicalService.updateFromUrl(event.urlAfterRedirects);
      });

    if (!this.isDisplayRoute) {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      this.updateScrollProgress();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    this.routerEventsSubscription?.unsubscribe();

    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
    }
  }

  private scheduleScrollProgressUpdate(): void {
    if (this.rafId !== null || this.isDisplayRoute) {
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

  private updateRouteState(url: string): void {
    const isDisplay = url.startsWith('/display');

    if (this.isDisplayRoute === isDisplay) {
      return;
    }

    this.isDisplayRoute = isDisplay;

    if (isDisplay) {
      window.removeEventListener('scroll', this.onScroll);
      document.body.classList.add('display-mode');
      document.documentElement.style.setProperty('--scroll-progress', '0');
      return;
    }

    document.body.classList.remove('display-mode');
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.updateScrollProgress();
  }
}
