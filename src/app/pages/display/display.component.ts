import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface DisplaySlide {
  id: string;
  ariaLabel: string;
}

type DisplayOrientation = 'vertical' | 'horizontal';

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
  readonly portraitBaseWidth = 1080;
  readonly portraitBaseHeight = 1920;
  readonly overscanSafeMarginPx = 32;
  readonly fitSafetyFactor = 0.94;

  readonly slides: DisplaySlide[] = [
    { id: 'branding', ariaLabel: 'Slide de presentación de marca CBM Fisioterapia' },
    { id: 'fisioterapia', ariaLabel: 'Slide de tarifas de fisioterapia personalizada' },
    { id: 'pilates', ariaLabel: 'Slide de tarifas de pilates terapéutico' },
    { id: 'promociones', ariaLabel: 'Slide con promociones activas' },
    { id: 'cupon', ariaLabel: 'Slide con cupón web y llamada a la acción de acceso mediante QR' }
  ];

  activeSlideIndex = 0;
  orientation: DisplayOrientation = 'vertical';
  verticalStageTransform = 'translate(-50%, -50%) rotate(90deg) scale(1)';

  private sliderTimer: ReturnType<typeof setInterval> | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private routeSubscription: Subscription | null = null;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
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

      this.updateViewportFit();
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
    this.routeSubscription?.unsubscribe();

    if (this.sliderTimer) {
      clearInterval(this.sliderTimer);
    }

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  @HostListener('window:resize')
  onViewportResize(): void {
    this.updateViewportFit();
    this.cdr.markForCheck();
  }

  private updateViewportFit(): void {
    if (this.orientation !== 'vertical') {
      this.verticalStageTransform = 'none';
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const safeWidth = Math.max(1, viewportWidth - this.overscanSafeMarginPx * 2);
    const safeHeight = Math.max(1, viewportHeight - this.overscanSafeMarginPx * 2);

    const scaleX = safeWidth / this.portraitBaseHeight;
    const scaleY = safeHeight / this.portraitBaseWidth;
    const baseScale = Math.min(scaleX, scaleY);
    const finalScale = Math.max(0.05, baseScale * this.fitSafetyFactor);

    this.verticalStageTransform = `translate(-50%, -50%) rotate(90deg) scale(${finalScale})`;
  }
}
