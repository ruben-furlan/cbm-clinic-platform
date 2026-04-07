import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class BannerBonosRegaloComponent implements OnInit {
  isActivo = false;

  constructor(
    private readonly configuracionService: ConfiguracionService,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.isActivo = await this.configuracionService.isBonosRegaloActivo();
    } catch {
      this.isActivo = false;
    }
  }

  goToRegalo(): void {
    void this.router.navigate(['/regalo']);
  }
}
