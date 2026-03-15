import { Component, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../language/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgClass, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  private readonly languageService = inject(LanguageService);

  isMobileMenuOpen = false;
  readonly languages = this.languageService.languages;

  get selectedLanguage(): 'es' | 'en' | 'ca' {
    return this.languageService.selectedLanguage;
  }

  get selectedLanguageShort(): 'ES' | 'EN' | 'CA' {
    const shortCodeMap = { es: 'ES', en: 'EN', ca: 'CA' } as const;

    return shortCodeMap[this.selectedLanguage];
  }

  ngOnInit(): void {
    this.languageService.initGoogleTranslate();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }


  changeLanguage(language: string): void {
    if (language !== 'es' && language !== 'en' && language !== 'ca') {
      return;
    }

    this.languageService.changeLanguage(language);
  }
}
