import { ChangeDetectorRef, Component, inject, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-floating-booking-button',
  standalone: true,
  imports: [],
  templateUrl: './floating-booking-button.html',
  styleUrls: ['./floating-booking-button.css']
})
export class FloatingBookingButtonComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  isVisible = false;

  private footerObserver?: IntersectionObserver;
  private footerVisible = false;

  private readonly onScroll = (): void => {
    const shouldShow = window.scrollY > 100 && !this.footerVisible;
    if (this.isVisible !== shouldShow) {
      this.zone.run(() => {
        this.isVisible = shouldShow;
        this.cdr.markForCheck();
      });
    }
  };

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('scroll', this.onScroll, { passive: true });

    const footer = document.querySelector('app-footer');
    if (footer) {
      this.footerObserver = new IntersectionObserver(
        ([entry]) => {
          this.zone.run(() => {
            this.footerVisible = entry.isIntersecting;
            this.isVisible = window.scrollY > 100 && !this.footerVisible;
            this.cdr.markForCheck();
          });
        },
        { threshold: 0.05 }
      );
      this.footerObserver.observe(footer);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.onScroll);
    }
    this.footerObserver?.disconnect();
  }

  onRequestBooking(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/solicitar-cita']);
  }
}
