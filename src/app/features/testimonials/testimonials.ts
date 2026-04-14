import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, NgZone, OnDestroy, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CbmLoaderComponent } from '../../shared/components/cbm-loader/cbm-loader.component';

interface GoogleAuthor {
  displayName?: string;
  photoUri?: string;
}

interface GoogleText {
  text?: string;
}

interface GoogleReview {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: GoogleText;
  authorAttribution?: GoogleAuthor;
}

interface GooglePlaceResponse {
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  reviews?: GoogleReview[];
}

interface TestimonialItem {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  relativeTime: string;
  content: string;
  photoUri?: string;
}

interface ReviewsCachePayload {
  placeName: string;
  averageRating: number;
  totalRatings: number;
  testimonials: TestimonialItem[];
  cachedAt: number;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, CbmLoaderComponent],
  templateUrl: './testimonials.html',
  styleUrls: ['./testimonials.css']
})
export class Testimonials implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly ngZone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly googleFieldMask = 'displayName,rating,userRatingCount,reviews';
  private readonly cacheKey = 'cbm_google_reviews_cache_v1';
  private readonly cacheTtlMs = 1000 * 60 * 60 * 24 * 14; // 14 días

  readonly googleReviewsUrl = 'https://www.google.com/maps/search/CBM+Fisioterapia+Terrassa';

  loading = true;
  loadedFromGoogle = false;
  errorMessage = '';

  placeName = 'CBM Fisioterapia';
  averageRating = 5;
  totalRatings = 0;

  testimonials: TestimonialItem[] = [];

  // ── Carousel state ──────────────────────────────────────────────────────────
  currentIndex = 0;
  nudgeActive = false;
  trackHeight = 0;
  isMobile = false;
  expandedReviews = new Set<string>();

  private readonly GAP = 16;
  private slideWidth = 0;
  private autoplayTimer: ReturnType<typeof setInterval> | null = null;
  private autoplayPaused = false;
  private nudgeDone = false;
  private observer: IntersectionObserver | null = null;
  private carouselInitialized = false;
  private viewportEl: HTMLElement | null = null;
  private touchStartX = 0;
  private touchStartY = 0;
  private isDragging = false;

  private readonly boundTouchMove = (e: TouchEvent): void => this.onTouchMove(e);

  private readonly boundResize = (): void => {
    this.ngZone.run(() => {
      this.updateSlideWidth();
      this.isMobile = window.innerWidth <= 768;
    });
  };

  @ViewChild('carouselViewport', { static: false })
  set carouselViewport(el: ElementRef<HTMLElement> | undefined) {
    if (el && !this.carouselInitialized) {
      this.carouselInitialized = true;
      this.viewportEl = el.nativeElement;
      setTimeout(() => this.initCarousel(), 0);
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isMobile = window.innerWidth <= 768;

    const usedCache = this.tryLoadFromCache();

    if (usedCache) {
      this.loading = false;
      this.loadedFromGoogle = true;
      this.errorMessage = '';
      return;
    }

    await this.loadGoogleReviews();
  }

  ngOnDestroy(): void {
    this.cleanupCarousel();
  }

  private async loadGoogleReviews(): Promise<void> {
    const apiKey = this.getGoogleApiKey();
    const placeId = this.getGooglePlaceId();

    if (!apiKey || !placeId) {
      this.useFallbackTestimonials('Configura la API de Google Places para mostrar reseñas en tiempo real.');
      return;
    }

    try {
      const endpoint = `https://places.googleapis.com/v1/places/${placeId}`;
      const response = await firstValueFrom(
        this.http.get<GooglePlaceResponse>(endpoint, {
          params: {
            languageCode: 'es',
            regionCode: 'ES'
          },
          headers: {
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': this.googleFieldMask
          }
        })
      );

      this.placeName = response.displayName?.text || this.placeName;
      this.averageRating = response.rating || this.averageRating;
      this.totalRatings = response.userRatingCount || this.totalRatings;

      this.testimonials =
        response.reviews?.slice(0, 6).map((review, index) => this.mapReview(review, index)) || [];

      if (this.testimonials.length === 0) {
        this.useFallbackTestimonials('Google no devolvió reseñas públicas en este momento.');
        return;
      }

      this.saveCache();
      this.loading = false;
      this.loadedFromGoogle = true;
      this.errorMessage = '';
    } catch (error: unknown) {
      this.useFallbackTestimonials(this.getGoogleErrorMessage(error));
    }
  }

  getStars(rating: number): string {
    const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
    return '★'.repeat(safeRating) + '☆'.repeat(5 - safeRating);
  }

  // ── Carousel public API ─────────────────────────────────────────────────────
  get trackTransform(): string {
    return `translateX(${-this.currentIndex * (this.slideWidth + this.GAP)}px)`;
  }

  goTo(index: number): void {
    this.currentIndex = Math.max(0, Math.min(index, this.testimonials.length - 1));
    this.updateTrackHeight();
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
    this.updateTrackHeight();
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
    this.updateTrackHeight();
  }

  isExpanded(id: string): boolean {
    return this.expandedReviews.has(id);
  }

  toggleExpanded(id: string): void {
    if (this.expandedReviews.has(id)) {
      this.expandedReviews.delete(id);
    } else {
      this.expandedReviews.add(id);
    }
    setTimeout(() => this.updateTrackHeight(), 0);
  }

  pauseAutoplay(): void {
    this.autoplayPaused = true;
  }

  onMouseEnter(): void {
    this.autoplayPaused = true;
  }

  onMouseLeave(): void {
    this.autoplayPaused = false;
  }

  selectDot(index: number): void {
    this.goTo(index);
    this.autoplayPaused = true;
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
    this.isDragging = true;
    this.pauseAutoplay();
  }

  onTouchMove(e: TouchEvent): void {
    if (!this.isDragging) return;
    const diffX = Math.abs(e.touches[0].clientX - this.touchStartX);
    const diffY = Math.abs(e.touches[0].clientY - this.touchStartY);
    if (diffX > diffY) {
      e.preventDefault();
    }
  }

  onTouchEnd(e: TouchEvent): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    const diffX = e.changedTouches[0].clientX - this.touchStartX;
    const diffY = Math.abs(e.changedTouches[0].clientY - this.touchStartY);
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
      diffX < 0 ? this.next() : this.prev();
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  private initCarousel(): void {
    if (!this.viewportEl) return;

    this.updateSlideWidth();
    this.updateTrackHeight();

    this.viewportEl.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    window.addEventListener('resize', this.boundResize, { passive: true });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      this.startAutoplay();
      this.setupNudgeObserver();
    }
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      if (!this.autoplayPaused) {
        this.next();
      }
    }, 4000);
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer !== null) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private setupNudgeObserver(): void {
    if (!this.viewportEl) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.nudgeDone) {
          this.nudgeDone = true;
          this.ngZone.run(() => {
            this.nudgeActive = true;
            setTimeout(() => { this.nudgeActive = false; }, 700);
          });
        }
      },
      { threshold: 0.3 }
    );

    this.observer.observe(this.viewportEl);
  }

  private updateSlideWidth(): void {
    if (!this.viewportEl) return;
    const firstSlide = this.viewportEl.querySelector<HTMLElement>('.carousel__slide');
    if (firstSlide) {
      this.slideWidth = firstSlide.offsetWidth;
    }
  }

  private updateTrackHeight(): void {
    if (!this.viewportEl) return;
    const slides = this.viewportEl.querySelectorAll<HTMLElement>('.carousel__slide');
    const active = slides[this.currentIndex];
    if (active) {
      this.trackHeight = active.offsetHeight;
    }
  }

  private cleanupCarousel(): void {
    this.stopAutoplay();
    this.observer?.disconnect();
    if (this.viewportEl) {
      this.viewportEl.removeEventListener('touchmove', this.boundTouchMove);
    }
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.boundResize);
    }
  }

  private mapReview(review: GoogleReview, index: number): TestimonialItem {
    const authorName = review.authorAttribution?.displayName?.trim() || 'Paciente';

    return {
      id: review.name || `${authorName}-${index}`,
      name: authorName,
      avatar: authorName.charAt(0).toUpperCase(),
      rating: review.rating ?? 5,
      relativeTime: review.relativePublishTimeDescription || 'Recientemente',
      content: review.text?.text?.trim() || 'Sin comentario disponible.',
      photoUri: review.authorAttribution?.photoUri
    };
  }

  private useFallbackTestimonials(message: string): void {
    this.testimonials = [
      {
        id: 'fallback-1',
        name: 'Michelle Zambrano',
        avatar: 'M',
        rating: 5,
        relativeTime: 'Hace 2 años',
        content:
          'Carmen fue todo un descubrimiento. Me trata desde hace casi dos años y me ha acompañado en diferentes etapas en las que había mucho dolor físico. Excelente profesional y trato muy cercano.'
      },
      {
        id: 'fallback-2',
        name: 'Natalia Perrone',
        avatar: 'N',
        rating: 5,
        relativeTime: 'Hace 1 año',
        content:
          'Excelente profesional. Carmen me ha ayudado mucho con distintas lesiones. Trato impecable y totalmente recomendable.'
      },
      {
        id: 'fallback-3',
        name: 'Mafer S',
        avatar: 'M',
        rating: 5,
        relativeTime: 'Hace 1 año',
        content:
          'Tenía pendiente acudir desde su inauguración y me arrepiento de no haber venido antes. El trato es inigualable y me ayudó mucho con una contractura.'
      }
    ];

    this.loading = false;
    this.loadedFromGoogle = false;
    this.errorMessage = message;
  }

  private getGoogleApiKey(): string {
    return this.decodeBase64('QUl6YVN5Qmt3TXFoZUp1YWxPUFI3Rkhneno2ektRbjRVak9HNEpN');
  }

  private getGooglePlaceId(): string {
    return 'ChIJIavLaQCTpBIRJ7GEnrRTy68';
  }

  private decodeBase64(value: string): string {
    try {
      return atob(value);
    } catch {
      return '';
    }
  }

  private tryLoadFromCache(): boolean {
    try {
      const rawCache = localStorage.getItem(this.cacheKey);
      if (!rawCache) {
        return false;
      }

      const cache = JSON.parse(rawCache) as ReviewsCachePayload;
      if (!cache || !cache.cachedAt) {
        return false;
      }

      const isExpired = Date.now() - cache.cachedAt > this.cacheTtlMs;
      if (isExpired) {
        localStorage.removeItem(this.cacheKey);
        return false;
      }

      if (!cache.testimonials?.length) {
        return false;
      }

      this.placeName = cache.placeName || this.placeName;
      this.averageRating = cache.averageRating || this.averageRating;
      this.totalRatings = cache.totalRatings || this.totalRatings;
      this.testimonials = cache.testimonials;

      return true;
    } catch {
      return false;
    }
  }

  private saveCache(): void {
    try {
      const cachePayload: ReviewsCachePayload = {
        placeName: this.placeName,
        averageRating: this.averageRating,
        totalRatings: this.totalRatings,
        testimonials: this.testimonials,
        cachedAt: Date.now()
      };

      localStorage.setItem(this.cacheKey, JSON.stringify(cachePayload));
    } catch {
      // Sin acción: si el almacenamiento falla, el componente sigue funcionando sin caché.
    }
  }

  private getGoogleErrorMessage(error: unknown): string {
    const status = this.getErrorStatus(error);

    if (status === 401 || status === 403) {
      return 'Google bloqueó la petición (401/403). Revisa restricciones de la API key (HTTP referrer, Places API habilitada y facturación).';
    }

    if (status === 400) {
      return 'Google rechazó la solicitud (400). Verifica que el Place ID sea válido y que el formato sea correcto.';
    }

    return 'No fue posible cargar Google Reviews en este momento.';
  }

  private getErrorStatus(error: unknown): number | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const maybeStatus = (error as { status?: unknown }).status;
    return typeof maybeStatus === 'number' ? maybeStatus : null;
  }
}
