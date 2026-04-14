import { Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

const COOKIE_CONSENT_KEY = 'cbm-cookie-consent';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './cookie-consent.html',
  styleUrls: ['./cookie-consent.css']
})
export class CookieConsentComponent implements OnInit, OnDestroy {
  isVisible = false;
  private accepted = false;
  private routerSubscription?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly el: ElementRef,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.accepted = !!localStorage.getItem(COOKIE_CONSENT_KEY);
    }
    this.updateVisibility(this.router.url);

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateVisibility(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.clearBannerHeight();
  }

  acceptCookies(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    }
    this.accepted = true;
    this.isVisible = false;
    if (isPlatformBrowser(this.platformId)) {
      this.clearBannerHeight();
    }
  }

  private updateVisibility(url: string): void {
    const path = (url || '').split('?')[0].split('#')[0];
    const isHome = path === '' || path === '/';

    this.isVisible = isHome && !this.accepted;
    this.scheduleBannerHeightUpdate();
  }

  /** Espera un tick para que *ngIf renderice el banner y luego mide su altura. */
  private scheduleBannerHeightUpdate(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.isVisible) {
      this.clearBannerHeight();
      return;
    }
    setTimeout(() => {
      const section = (this.el.nativeElement as HTMLElement).querySelector(
        '.cookie-consent',
      ) as HTMLElement | null;
      if (section) {
        const fromBottom = window.innerHeight - section.getBoundingClientRect().top;
        document.documentElement.style.setProperty(
          '--cookie-banner-height',
          `${fromBottom}px`,
        );
      }
    }, 0);
  }

  private clearBannerHeight(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.style.setProperty('--cookie-banner-height', '0px');
    }
  }
}
