import { Injectable } from '@angular/core';

interface LanguageOption {
  code: 'es' | 'en' | 'ca';
  label: string;
}

type SupportedLanguage = LanguageOption['code'];

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: new (
          options: {
            pageLanguage: string;
            includedLanguages: string;
            autoDisplay: boolean;
            layout?: unknown;
          },
          elementId: string
        ) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly languages: LanguageOption[] = [
    { code: 'es', label: 'Español' },
    { code: 'ca', label: 'Català' },
    { code: 'en', label: 'English' }
  ];

  constructor() {
    this.persistAndApplyLanguage(this.selectedLanguage);
    this.applyGoogleTranslateCookie(this.selectedLanguage);
  }

  get selectedLanguage(): SupportedLanguage {
    const persistedLanguage = localStorage.getItem('selected-language');

    if (persistedLanguage === 'es' || persistedLanguage === 'en' || persistedLanguage === 'ca') {
      return persistedLanguage;
    }

    const cookieLanguage = this.getLanguageFromGoogleCookie();

    return cookieLanguage ?? 'es';
  }

  initGoogleTranslate(): void {
    const hasContainer = document.getElementById('google_translate_element');

    if (!hasContainer) {
      return;
    }

    this.applyGoogleTranslateCookie(this.selectedLanguage);

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) {
        return;
      }

      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'es',
          includedLanguages: 'es,en,ca',
          autoDisplay: false
        },
        'google_translate_element'
      );
    };

    if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-translate="true"]');

    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.defer = true;
    script.dataset['googleTranslate'] = 'true';
    document.body.appendChild(script);
  }

  changeLanguage(language: SupportedLanguage): void {
    if (this.selectedLanguage === language) {
      return;
    }

    this.persistAndApplyLanguage(language);
    this.applyGoogleTranslateCookie(language);

    window.location.reload();
  }

  private persistAndApplyLanguage(language: SupportedLanguage): void {
    localStorage.setItem('selected-language', language);
    document.documentElement.lang = language;
  }

  private getLanguageFromGoogleCookie(): SupportedLanguage | null {
    const cookieParts = document.cookie.split(';').map((part) => part.trim());
    const googTransCookie = cookieParts.find((part) => part.startsWith('googtrans='));

    if (!googTransCookie) {
      return null;
    }

    const cookieValue = decodeURIComponent(googTransCookie.split('=')[1] ?? '');
    const languageCode = cookieValue.split('/').pop();

    if (languageCode === 'es' || languageCode === 'en' || languageCode === 'ca') {
      return languageCode;
    }

    return null;
  }

  private applyGoogleTranslateCookie(language: SupportedLanguage): void {
    const languageDirective = `/es/${language}`;
    document.cookie = `googtrans=${languageDirective};path=/`;
    document.cookie = `googtrans=${languageDirective};path=/;domain=${window.location.hostname}`;
  }
}
