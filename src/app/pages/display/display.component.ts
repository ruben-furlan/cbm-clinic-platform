import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';

interface DisplaySlide {
  id: string;
  ariaLabel: string;
}

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
    { id: 'cupon', ariaLabel: 'Slide con cupón web y llamada a la acción por WhatsApp' }
  ];

  activeSlideIndex = 0;

  private sliderTimer: ReturnType<typeof setInterval> | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.sliderTimer = setInterval(() => {
      this.activeSlideIndex = (this.activeSlideIndex + 1) % this.slides.length;
    }, this.slideDurationMs);

    this.refreshTimer = setInterval(() => {
      window.location.reload();
    }, this.autoRefreshMs);
  }

  ngOnDestroy(): void {
    if (this.sliderTimer) {
      clearInterval(this.sliderTimer);
    }

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }
}
