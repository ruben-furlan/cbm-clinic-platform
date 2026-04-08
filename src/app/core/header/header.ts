import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../language/language.service';
import { ConfiguracionService } from '../services/configuracion.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgClass, NgIf, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  private readonly languageService = inject(LanguageService);
  private readonly configuracionService = inject(ConfiguracionService);
  private readonly cdr = inject(ChangeDetectorRef);

  isMobileMenuOpen = false;
  showBonosRegalo = false;
  readonly languages = this.languageService.languages;

  get selectedLanguage(): 'es' | 'en' | 'ca' {
    return this.languageService.selectedLanguage;
  }

  get selectedLanguageShort(): 'ES' | 'EN' | 'CA' {
    const shortCodeMap = { es: 'ES', en: 'EN', ca: 'CA' } as const;

    return shortCodeMap[this.selectedLanguage];
  }

  async ngOnInit(): Promise<void> {
    this.languageService.initGoogleTranslate();
    try {
      this.showBonosRegalo = await this.configuracionService.isBonosRegaloActivo();
    } catch {
      this.showBonosRegalo = false;
    }
    this.cdr.markForCheck();
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
