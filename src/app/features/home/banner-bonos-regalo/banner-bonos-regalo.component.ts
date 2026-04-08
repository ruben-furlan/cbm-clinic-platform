import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    document.body.style.overflow = '';
  }

  goToRegalo(): void {
    void this.router.navigate(['/regalo']);
  }

  abrirComoFunciona(): void {
    this.mostrarComoFunciona = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarComoFunciona(): void {
    this.mostrarComoFunciona = false;
    document.body.style.overflow = '';
  }

  irARegalo(): void {
    this.cerrarComoFunciona();
    void this.router.navigate(['/regalo']);
  }
}
