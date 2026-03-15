import { Component, OnInit, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../language/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgClass],
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

  ngOnInit(): void {
    this.languageService.initGoogleTranslate();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  onLanguageChange(event: Event): void {
    const selectedLanguage = (event.target as HTMLSelectElement).value as 'es' | 'en' | 'ca';
    this.changeLanguage(selectedLanguage);
  }

  changeLanguage(language: 'es' | 'en' | 'ca'): void {
    this.languageService.changeLanguage(language);
  }
}
