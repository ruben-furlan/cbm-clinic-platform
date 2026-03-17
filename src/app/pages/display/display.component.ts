import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
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

  readonly slides: DisplaySlide[] = [
    { id: 'branding', ariaLabel: 'Slide de presentación de marca CBM Fisioterapia' },
    { id: 'fisioterapia', ariaLabel: 'Slide de tarifas de fisioterapia personalizada' },
    { id: 'pilates', ariaLabel: 'Slide de tarifas de pilates terapéutico' },
    { id: 'promociones', ariaLabel: 'Slide con promociones activas' },
    { id: 'cupon', ariaLabel: 'Slide con cupón web y llamada a la acción de acceso mediante QR' }
  ];

  activeSlideIndex = 0;
  orientation: DisplayOrientation = 'vertical';

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
}
