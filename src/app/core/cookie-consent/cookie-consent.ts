import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
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

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.accepted = !!localStorage.getItem(COOKIE_CONSENT_KEY);
    this.updateVisibility(this.router.url);

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateVisibility(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  acceptCookies(): void {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    this.accepted = true;
    this.isVisible = false;
  }

  private updateVisibility(url: string): void {
    const path = (url || '').split('?')[0].split('#')[0];
    const isHome = path === '' || path === '/';

    this.isVisible = isHome && !this.accepted;
  }
}
