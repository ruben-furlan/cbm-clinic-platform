import { Injectable } from '@angular/core';

interface LanguageOption {
  code: 'es' | 'en' | 'ca';
  label: string;
}

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
    { code: 'en', label: 'English' },
    { code: 'ca', label: 'Català' }
  ];

  selectedLanguage: LanguageOption['code'] = 'es';

  constructor() {
    const persistedLanguage = localStorage.getItem('selected-language');

    if (persistedLanguage === 'es' || persistedLanguage === 'en' || persistedLanguage === 'ca') {
      this.selectedLanguage = persistedLanguage;
      document.documentElement.lang = persistedLanguage;
    }
  }

  initGoogleTranslate(): void {
    const hasContainer = document.getElementById('google_translate_element');

    if (!hasContainer) {
      return;
    }

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

  changeLanguage(language: LanguageOption['code']): void {
    this.selectedLanguage = language;
    localStorage.setItem('selected-language', language);
    document.documentElement.lang = language;

    const languageDirective = `/es/${language}`;
    document.cookie = `googtrans=${languageDirective};path=/`;
    document.cookie = `googtrans=${languageDirective};path=/;domain=${window.location.hostname}`;

    window.location.reload();
  }
}
