import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';


const COOKIE_CONSENT_KEY = 'cbm-cookie-consent';
const COOKIE_ACCEPTED_EVENT = 'cbm-cookies-accepted';
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
  imports: [CommonModule],
  templateUrl: './testimonials.html',
  styleUrls: ['./testimonials.css']
})
export class Testimonials implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly googleFieldMask = 'displayName,rating,userRatingCount,reviews';
  private readonly cacheKey = 'cbm_google_reviews_cache_v1';
  private readonly cacheTtlMs = 1000 * 60 * 60 * 24 * 14; // 14 días

  readonly googleReviewsUrl = 'https://www.google.com/maps/search/CBM+Fisioterapia+Terrassa';

  loading = true;
  loadedFromGoogle = false;
  errorMessage = '';
  requiresCookieConsent = false;

  placeName = 'CBM Fisioterapia';
  averageRating = 5;
  totalRatings = 0;

  testimonials: TestimonialItem[] = [];

  async ngOnInit(): Promise<void> {
    const hasCookieConsent = this.hasCookieConsent();

    if (!hasCookieConsent) {
      this.requiresCookieConsent = true;
      this.loading = false;
      this.errorMessage = 'Para ver las reseñas en Google, acepta las cookies.';
      window.addEventListener(COOKIE_ACCEPTED_EVENT, this.handleCookiesAccepted);
      return;
    }

    await this.loadReviewsFlow();
  }

  ngOnDestroy(): void {
    window.removeEventListener(COOKIE_ACCEPTED_EVENT, this.handleCookiesAccepted);
  }

  private async loadReviewsFlow(): Promise<void> {
    const usedCache = this.tryLoadFromCache();

    if (usedCache) {
      this.loading = false;
      this.loadedFromGoogle = true;
      this.errorMessage = '';
      return;
    }

    this.loading = true;
    this.requiresCookieConsent = false;
    await this.loadGoogleReviews();
  }

  private readonly handleCookiesAccepted = (): void => {
    if (!this.hasCookieConsent()) {
      return;
    }

    this.errorMessage = '';
    this.requiresCookieConsent = false;
    window.removeEventListener(COOKIE_ACCEPTED_EVENT, this.handleCookiesAccepted);
    void this.loadReviewsFlow();
  };

  private hasCookieConsent(): boolean {
    return !!localStorage.getItem(COOKIE_CONSENT_KEY);
  }

  private async loadGoogleReviews(): Promise<void> {
    const apiKey = this.getGoogleApiKey();
    const placeId = this.getGooglePlaceId();

    if (!apiKey || !placeId) {
      this.useFallbackTestimonials('Mostrando una selección de opiniones verificadas de nuestros pacientes.');
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
        this.useFallbackTestimonials('Mostrando una selección de opiniones verificadas de nuestros pacientes.');
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
      return 'Mostrando una selección de opiniones verificadas de nuestros pacientes.';
    }

    if (status === 400) {
      return 'Mostrando una selección de opiniones verificadas de nuestros pacientes.';
    }

    return 'Mostrando una selección de opiniones verificadas de nuestros pacientes.';
  }

  private getErrorStatus(error: unknown): number | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const maybeStatus = (error as { status?: unknown }).status;
    return typeof maybeStatus === 'number' ? maybeStatus : null;
  }
}
