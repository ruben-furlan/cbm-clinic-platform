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
    '/tratamientos/fisioterapia': 'Fisioterapia en Terrassa · CBM Fisioterapia',
    '/tratamientos/tecnicas': 'Técnicas utilizadas · CBM Fisioterapia',
    '/tratamientos/pilates': 'Pilates terapéutico en Terrassa · CBM Fisioterapia',
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
    const canonicalHref = this.buildCanonicalHref(url);
    this.ensureSingleCanonicalTag(canonicalHref);

    this.meta.updateTag({ property: 'og:url', content: canonicalHref });

    const [pathWithoutQuery] = url.split(/[?#]/);
    const cleanPath =
      pathWithoutQuery === '/' || pathWithoutQuery === ''
        ? '/'
        : pathWithoutQuery.replace(/\/+$/, '');

    this.titleService.setTitle(this.routeTitles[cleanPath] ?? this.defaultTitle);

    if (cleanPath.startsWith('/admin')) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }
  }

  private buildCanonicalHref(url: string): string {
    const [pathWithoutQuery] = url.split(/[?#]/);
    const normalizedPath =
      pathWithoutQuery === '/' || pathWithoutQuery === ''
        ? '/'
        : pathWithoutQuery.replace(/\/+$/, '');

    return normalizedPath === '/'
      ? `${this.siteUrl}/`
      : `${this.siteUrl}${normalizedPath}`;
  }

  private ensureSingleCanonicalTag(href: string): void {
    const canonicalTags = Array.from(
      this.document.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')
    );
    const [firstCanonicalTag, ...duplicateCanonicalTags] = canonicalTags;

    for (const duplicateTag of duplicateCanonicalTags) {
      duplicateTag.remove();
    }

    const canonicalTag = firstCanonicalTag ?? this.document.createElement('link');
    canonicalTag.setAttribute('rel', 'canonical');
    canonicalTag.setAttribute('href', href);

    if (!firstCanonicalTag) {
      this.document.head.appendChild(canonicalTag);
    }
  }
}
