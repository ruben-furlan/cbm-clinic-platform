import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfiguracionService } from '../../../core/services/configuracion.service';

interface BannerConfig {
  activo: boolean;
  emoji: string;
  texto: string;
  enlaceTexto: string;
  enlaceUrl: string;
  colorFondo: string;
  colorTexto: string;
}

@Component({
  selector: 'app-banner-anuncio',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './banner-anuncio.component.html',
  styleUrl: './banner-anuncio.component.css'
})
export class BannerAnuncioComponent implements OnInit {
  config: BannerConfig = {
    activo: false,
    emoji: '',
    texto: '',
    enlaceTexto: '',
    enlaceUrl: '/',
    colorFondo: 'linear-gradient(135deg, #e879a8, #a78bfa)',
    colorTexto: '#ffffff'
  };

  visible = true;
  readonly STORAGE_KEY = 'banner_anuncio_cerrado';

  private readonly platformId = inject(PLATFORM_ID);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor(private readonly configuracionService: ConfiguracionService) {}

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId) && sessionStorage.getItem(this.STORAGE_KEY)) {
      this.visible = false;
      return;
    }

    try {
      this.config = await this.configuracionService.getBannerAnuncioConfig();
    } catch (err) {
      console.error('Error cargando banner:', err);
    }
    this.cdr.markForCheck();
  }

  cerrar(): void {
    this.visible = false;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.STORAGE_KEY, 'true');
    }
  }
}
