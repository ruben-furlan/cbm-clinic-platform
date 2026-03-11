import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

const COOKIE_CONSENT_KEY = 'cbm-cookie-consent';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './cookie-consent.html',
  styleUrls: ['./cookie-consent.css']
})
export class CookieConsentComponent implements OnInit {
  isVisible = false;

  ngOnInit(): void {
    this.isVisible = !localStorage.getItem(COOKIE_CONSENT_KEY);
  }

  acceptCookies(): void {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    this.isVisible = false;
  }
}
