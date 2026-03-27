import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CanonicalService {
  private readonly siteUrl = 'https://cbmfisioterapia.com';

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  updateFromUrl(url: string): void {
    const canonicalHref = this.buildCanonicalHref(url);
    this.ensureSingleCanonicalTag(canonicalHref);
  }

  private buildCanonicalHref(url: string): string {
    const [pathWithoutQuery] = url.split(/[?#]/);
    const normalizedPath = pathWithoutQuery === '/' || pathWithoutQuery === ''
      ? '/'
      : pathWithoutQuery.replace(/\/+$/, '');

    return normalizedPath === '/'
      ? `${this.siteUrl}/`
      : `${this.siteUrl}${normalizedPath}`;
  }

  private ensureSingleCanonicalTag(href: string): void {
    const canonicalTags = Array.from(this.document.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'));
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
