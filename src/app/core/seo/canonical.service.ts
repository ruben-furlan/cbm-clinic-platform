import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class CanonicalService {
  private readonly siteUrl = 'https://cbmfisioterapia.com';

  private readonly routeTitles: Record<string, string> = {
    '/': 'CBM Fisioterapia · Fisioterapia y Pilates en Terrassa',
    '/experiencia': 'Nuestra experiencia · CBM Fisioterapia',
    '/tratamientos': 'Tratamientos · CBM Fisioterapia',
    '/tratamientos/fisioterapia': 'Fisioterapia en Terrassa | CBM Fisioterapia',
    '/tratamientos/tecnicas': 'Técnicas utilizadas en Terrassa | CBM Fisioterapia',
    '/tratamientos/pilates': 'Pilates en Terrassa | CBM Fisioterapia',
    '/tarifas': 'Tarifas y bonos · CBM Fisioterapia',
    '/solicitar-cita': 'Solicitar cita · CBM Fisioterapia',
    '/faq': 'Preguntas frecuentes · CBM Fisioterapia',
    '/contactanos': 'Contáctanos · CBM Fisioterapia',
    '/espacio-cbm': 'Espacio CBM · Fisioterapia en Terrassa',
    '/blog': 'Blog · Consejos de fisioterapia en Terrassa',
    '/regalo': 'Bonos regalo · CBM Fisioterapia',
  };

  private readonly defaultTitle = 'CBM Fisioterapia · Fisioterapia y Pilates en Terrassa';

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly meta: Meta,
    private readonly titleService: Title
  ) {}

  updateFromUrl(url: string): void {
    const cleanPath = this.normalizePath(url);
    const canonicalHref = this.buildCanonicalHref(cleanPath);

    this.ensureSingleCanonicalTag(canonicalHref);
    this.meta.updateTag({ property: 'og:url', content: canonicalHref });

    this.titleService.setTitle(this.routeTitles[cleanPath] ?? this.defaultTitle);

    if (cleanPath.startsWith('/admin')) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }
  }

  private normalizePath(url: string): string {
    const parsedUrl = new URL(url, this.siteUrl);
    const withoutDuplicateSlashes = parsedUrl.pathname.replace(/\/+/g, '/');

    if (withoutDuplicateSlashes === '' || withoutDuplicateSlashes === '/') {
      return '/';
    }

    return withoutDuplicateSlashes.replace(/\/+$/, '');
  }

  private buildCanonicalHref(cleanPath: string): string {
    return cleanPath === '/'
      ? `${this.siteUrl}/`
      : `${this.siteUrl}${cleanPath}`;
  }

  private ensureSingleCanonicalTag(href: string): void {
    const canonicalTags = this.document.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');

    canonicalTags.forEach((tag) => tag.remove());

    const canonicalTag = this.document.createElement('link');
    canonicalTag.setAttribute('rel', 'canonical');
    canonicalTag.setAttribute('href', href);
    this.document.head.appendChild(canonicalTag);
  }
}
