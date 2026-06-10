import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../language/language.service';
import { ConfiguracionService } from '../services/configuracion.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgClass, NgIf],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  private readonly languageService = inject(LanguageService);
  private readonly configuracionService = inject(ConfiguracionService);
  private readonly cdr = inject(ChangeDetectorRef);

  isMobileMenuOpen = false;
  showBonosRegalo = false;

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
}
