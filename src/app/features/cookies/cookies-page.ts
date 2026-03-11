import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookies-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './cookies-page.html',
  styleUrls: ['./cookies-page.css']
})
export class CookiesPage {
  private readonly consentKey = 'cbm-cookie-consent';
  accepted = typeof window !== 'undefined' && !!localStorage.getItem(this.consentKey);

  acceptCookies(): void {
    localStorage.setItem(this.consentKey, 'accepted');
    this.accepted = true;
  }
}
