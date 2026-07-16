import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  CARTEL_DISPLAY_ESTADOS,
  CartelEstadoId,
  ConfiguracionService,
} from '../../core/services/configuracion.service';

interface DisplaySlide {
  id: string;
  ariaLabel: string;
}

interface CartelView {
  tema: CartelEstadoId;
  emoji: string;
  titulo: string;
  mensaje: string;
}

type DisplayOrientation = 'vertical' | 'horizontal';
type VerticalSize = 'large' | 'medium' | 'small';

/** Escenas del paseo animado del equipo por el cartel horizontal. */
type WalkerScene = 'rest' | 'walk' | 'walk-back' | 'peek-left' | 'peek-right' | 'greet';

const WALKER_SCENE_DURATIONS_MS: Record<Exclude<WalkerScene, 'rest'>, number> = {
  walk: 26000,
  'walk-back': 26000,
  'peek-left': 10000,
  'peek-right': 10000,
  greet: 9500,
};

/** Las caminatas pesan más para que asomarse y saludar sean momentos especiales. */
const WALKER_SCENE_POOL: Exclude<WalkerScene, 'rest'>[] = [
  'walk',
  'walk',
  'walk-back',
  'walk-back',
  'peek-left',
  'peek-right',
  'greet',
];

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayComponent implements OnInit, OnDestroy {
  readonly slideDurationMs = 10000;
  readonly autoRefreshMs = 10 * 60 * 1000;
  readonly cartelPollMs = 30 * 1000;

  readonly slides: DisplaySlide[] = [
    { id: 'branding', ariaLabel: 'Presentación de CBM Fisioterapia' },
    { id: 'acompanamiento', ariaLabel: 'Acompañamiento en la recuperación' },
    { id: 'pilates', ariaLabel: 'Pilates en grupo' },
    { id: 'promociones', ariaLabel: 'Tarifas especiales' },
    { id: 'cupon', ariaLabel: 'Cupón web y acceso mediante QR' },
  ];

  activeSlideIndex = 0;
  orientation: DisplayOrientation = 'vertical';
  verticalSize: VerticalSize = 'large';
  verticalScale = 1;

  cartel: CartelView = {
    tema: 'volvemos',
    emoji: '⏱️',
    titulo: 'Volvemos en 5 minutos',
    mensaje: 'Estamos aquí al lado · Espéranos un momentito',
  };

  walkerScene: WalkerScene = 'rest';

  private sliderTimer: ReturnType<typeof setInterval> | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private cartelTimer: ReturnType<typeof setInterval> | null = null;
  private walkerTimer: ReturnType<typeof setTimeout> | null = null;
  private lastWalkerScene: WalkerScene = 'rest';
  private routeSubscription: Subscription | null = null;
  private readonly onResize = (): void => this.updateVerticalLayout();

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly configuracion: ConfiguracionService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    window.addEventListener('resize', this.onResize, { passive: true });

    this.routeSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
      const orientationParam = params.get('orientation');

      if (!orientationParam) {
        this.orientation = 'vertical';
      } else if (orientationParam === 'vertical' || orientationParam === 'horizontal') {
        this.orientation = orientationParam;
      } else {
        this.router.navigateByUrl('/display/vertical');
        return;
      }

      this.updateVerticalLayout();
      this.setupCartel();
      this.setupWalkers();
      this.cdr.markForCheck();
    });

    this.sliderTimer = setInterval(() => {
      this.activeSlideIndex = (this.activeSlideIndex + 1) % this.slides.length;
      this.cdr.markForCheck();
    }, this.slideDurationMs);

    this.refreshTimer = setInterval(() => {
      window.location.reload();
    }, this.autoRefreshMs);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    this.routeSubscription?.unsubscribe();

    if (this.sliderTimer) {
      clearInterval(this.sliderTimer);
    }

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    if (this.cartelTimer) {
      clearInterval(this.cartelTimer);
    }

    if (this.walkerTimer) {
      clearTimeout(this.walkerTimer);
    }
  }

  /**
   * En /display/horizontal la pantalla actúa como cartel de estado del local
   * (configurable desde el panel de admin). Carga la config y la refresca cada
   * pocos segundos para que un cambio en el admin se refleje casi al instante.
   */
  private setupCartel(): void {
    if (this.cartelTimer) {
      clearInterval(this.cartelTimer);
      this.cartelTimer = null;
    }

    if (this.orientation !== 'horizontal' || !isPlatformBrowser(this.platformId)) {
      return;
    }

    void this.loadCartel();
    this.cartelTimer = setInterval(() => void this.loadCartel(), this.cartelPollMs);
  }

  private async loadCartel(): Promise<void> {
    try {
      const cfg = await this.configuracion.getCartelDisplayConfig();
      const preset =
        CARTEL_DISPLAY_ESTADOS.find((e) => e.id === cfg.estado) ?? CARTEL_DISPLAY_ESTADOS[0];

      this.cartel = {
        tema: preset.tema,
        emoji: preset.emoji,
        titulo: cfg.titulo.trim() || preset.titulo,
        mensaje: cfg.mensaje.trim() || preset.mensaje,
      };
      this.cdr.markForCheck();
    } catch {
      // Sin conexión con Supabase: se mantienen los valores por defecto.
    }
  }

  /**
   * Coreografía del equipo en /display/horizontal: encadena escenas aleatorias
   * (caminar en ambos sentidos, asomarse tras el cartel, saludar) con pausas
   * variables entre ellas para que la pantalla nunca repita el mismo patrón.
   */
  private setupWalkers(): void {
    if (this.walkerTimer) {
      clearTimeout(this.walkerTimer);
      this.walkerTimer = null;
    }

    this.walkerScene = 'rest';

    if (this.orientation !== 'horizontal' || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.queueWalkerScene(2500);
  }

  private queueWalkerScene(delayMs: number): void {
    this.walkerTimer = setTimeout(() => {
      const scene = this.pickWalkerScene();
      this.lastWalkerScene = scene;
      this.walkerScene = scene;
      this.cdr.markForCheck();

      this.walkerTimer = setTimeout(() => {
        this.walkerScene = 'rest';
        this.cdr.markForCheck();
        this.queueWalkerScene(4000 + Math.random() * 9000);
      }, WALKER_SCENE_DURATIONS_MS[scene]);
    }, delayMs);
  }

  private pickWalkerScene(): Exclude<WalkerScene, 'rest'> {
    const candidates = WALKER_SCENE_POOL.filter((scene) => scene !== this.lastWalkerScene);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  private updateVerticalLayout(): void {
    if (this.orientation !== 'vertical') {
      this.verticalScale = 1;
      this.verticalSize = 'large';
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scale = Math.min(viewportWidth / 1920, viewportHeight / 1080);

    this.verticalScale = Number(Math.max(scale, 0.52).toFixed(3));

    if (this.verticalScale >= 0.9) {
      this.verticalSize = 'large';
    } else if (this.verticalScale >= 0.72) {
      this.verticalSize = 'medium';
    } else {
      this.verticalSize = 'small';
    }
  }
}
