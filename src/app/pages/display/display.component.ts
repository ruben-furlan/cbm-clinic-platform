import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface DisplaySlide {
  id: string;
  ariaLabel: string;
}

type DisplayOrientation = 'vertical' | 'horizontal';
type VerticalSize = 'large' | 'medium' | 'small';

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayComponent implements OnInit, OnDestroy {
  readonly slideDurationMs = 10000;
  readonly autoRefreshMs = 10 * 60 * 1000;

  readonly slides: DisplaySlide[] = [
    { id: 'inicio', ariaLabel: 'Slide de apertura emocional de CBM Fisioterapia' },
    { id: 'bienestar', ariaLabel: 'Slide sobre bienestar y atención personalizada' },
    { id: 'movilidad', ariaLabel: 'Slide sobre movilidad y clases adaptadas' },
    { id: 'promocion', ariaLabel: 'Slide sobre promociones activas de la clínica' },
    { id: 'cercania', ariaLabel: 'Slide sobre acompañamiento cercano en cada etapa' },
    { id: 'web', ariaLabel: 'Slide final publicitaria para escanear el QR y empezar hoy' }
  ];

  activeSlideIndex = 0;
  orientation: DisplayOrientation = 'vertical';
  verticalSize: VerticalSize = 'large';
  verticalScale = 1;

  private sliderTimer: ReturnType<typeof setInterval> | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private routeSubscription: Subscription | null = null;
  private readonly onResize = (): void => this.updateVerticalLayout();

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly router: Router
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
