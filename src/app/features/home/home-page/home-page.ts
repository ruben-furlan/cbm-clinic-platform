import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Testimonials } from '../../testimonials/testimonials';
import { LocationComponent } from '../../location/location';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';
import { FaqComponent } from '../../faq/faq';
import { PricingComponent } from '../../../sections/pricing/pricing.component';
import { EventsSectionComponent } from '../events-section/events-section.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, Testimonials, LocationComponent, RevealOnScrollDirective, FaqComponent, PricingComponent, RouterLink, EventsSectionComponent],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css']
})
export class HomePage implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  readonly heroSlides = ['/cbm-1.jpeg', '/cbm-2.jpeg', '/cbm-3.jpeg', '/cbm-4.jpeg', '/cbm-5.jpeg'].reverse();
  currentHeroSlide = 0;
  private autoplayId?: ReturnType<typeof setInterval>;
  private touchStartX = 0;
  private touchEndX = 0;

  ngOnInit(): void {
    this.startHeroAutoplay();
  }

  ngOnDestroy(): void {
    this.stopHeroAutoplay();
  }

  pauseHeroAutoplay(): void {
    this.stopHeroAutoplay();
  }

  resumeHeroAutoplay(): void {
    this.startHeroAutoplay();
  }

  onHeroTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].clientX;
  }

  onHeroTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].clientX;
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (Math.abs(swipeDistance) < 35) {
      return;
    }

    if (swipeDistance > 0) {
      this.currentHeroSlide = (this.currentHeroSlide + 1) % this.heroSlides.length;
    } else {
      this.currentHeroSlide = (this.currentHeroSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
    }

    this.stopHeroAutoplay();
    this.startHeroAutoplay();
  }

  trackByIndex(index: number): number {
    return index;
  }

  private startHeroAutoplay(): void {
    if (this.autoplayId) {
      return;
    }

    this.autoplayId = setInterval(() => {
      this.currentHeroSlide = (this.currentHeroSlide + 1) % this.heroSlides.length;
      this.cdr.detectChanges();
    }, 5000);
  }

  private stopHeroAutoplay(): void {
    if (!this.autoplayId) {
      return;
    }

    clearInterval(this.autoplayId);
    this.autoplayId = undefined;
  }
}
