import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ConfiguracionService } from '../../../core/services/configuracion.service';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-banner-bonos-regalo',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  templateUrl: './banner-bonos-regalo.component.html',
  styleUrl: './banner-bonos-regalo.component.css'
})
export class BannerBonosRegaloComponent implements OnInit, OnDestroy {
  isActivo = false;
  mostrarComoFunciona = false;

  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private readonly configuracionService: ConfiguracionService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.isActivo = await this.configuracionService.isBonosRegaloActivo();
    } catch {
      this.isActivo = false;
    }
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  goToRegalo(): void {
    void this.router.navigate(['/regalo']);
  }

  abrirComoFunciona(): void {
    this.mostrarComoFunciona = true;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  cerrarComoFunciona(): void {
    this.mostrarComoFunciona = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  irARegalo(): void {
    this.cerrarComoFunciona();
    void this.router.navigate(['/regalo']);
  }
}
