import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

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

export interface TestimonialItem {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  relativeTime: string;
  content: string;
  photoUri?: string;
}

export interface GoogleReviewsData {
  placeName: string;
  averageRating: number;
  totalRatings: number;
  testimonials: TestimonialItem[];
  fromGoogle: boolean;
  errorMessage: string;
}

interface ReviewsCachePayload {
  placeName: string;
  averageRating: number;
  totalRatings: number;
  testimonials: TestimonialItem[];
  cachedAt: number;
}

@Injectable({ providedIn: 'root' })
export class GoogleReviewsService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly googleFieldMask = 'displayName,rating,userRatingCount,reviews';
  private readonly cacheKey = 'cbm_google_reviews_cache_v1';
  private readonly cacheTtlMs = 1000 * 60 * 60 * 24 * 14; // 14 días

  private loadPromise: Promise<GoogleReviewsData> | null = null;

  /** Una sola petición compartida entre todos los consumidores (hero, testimonios, etc.). */
  load(): Promise<GoogleReviewsData> {
    if (!this.loadPromise) {
      this.loadPromise = this.doLoad();
    }
    return this.loadPromise;
  }

  private async doLoad(): Promise<GoogleReviewsData> {
    if (!isPlatformBrowser(this.platformId)) {
      return this.buildFallback('');
    }

    const cached = this.tryLoadFromCache();
    if (cached) {
      return cached;
    }

    const apiKey = this.getGoogleApiKey();
    const placeId = this.getGooglePlaceId();

    if (!apiKey || !placeId) {
      return this.buildFallback('Configura la API de Google Places para mostrar reseñas en tiempo real.');
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

      const testimonials =
        response.reviews?.slice(0, 6).map((review, index) => this.mapReview(review, index)) || [];

      if (testimonials.length === 0) {
        return this.buildFallback('Google no devolvió reseñas públicas en este momento.');
      }

      const data: GoogleReviewsData = {
        placeName: response.displayName?.text || 'CBM Fisioterapia',
        averageRating: response.rating || 5,
        totalRatings: response.userRatingCount || 0,
        testimonials,
        fromGoogle: true,
        errorMessage: ''
      };

      this.saveCache(data);
      return data;
    } catch (error: unknown) {
      return this.buildFallback(this.getGoogleErrorMessage(error));
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

  private buildFallback(message: string): GoogleReviewsData {
    return {
      placeName: 'CBM Fisioterapia',
      averageRating: 5,
      totalRatings: 13,
      testimonials: [
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
      ],
      fromGoogle: false,
      errorMessage: message
    };
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

  private tryLoadFromCache(): GoogleReviewsData | null {
    try {
      const rawCache = localStorage.getItem(this.cacheKey);
      if (!rawCache) {
        return null;
      }

      const cache = JSON.parse(rawCache) as ReviewsCachePayload;
      if (!cache || !cache.cachedAt) {
        return null;
      }

      const isExpired = Date.now() - cache.cachedAt > this.cacheTtlMs;
      if (isExpired) {
        localStorage.removeItem(this.cacheKey);
        return null;
      }

      if (!cache.testimonials?.length) {
        return null;
      }

      return {
        placeName: cache.placeName || 'CBM Fisioterapia',
        averageRating: cache.averageRating || 5,
        totalRatings: cache.totalRatings || 0,
        testimonials: cache.testimonials,
        fromGoogle: true,
        errorMessage: ''
      };
    } catch {
      return null;
    }
  }

  private saveCache(data: GoogleReviewsData): void {
    try {
      const cachePayload: ReviewsCachePayload = {
        placeName: data.placeName,
        averageRating: data.averageRating,
        totalRatings: data.totalRatings,
        testimonials: data.testimonials,
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
