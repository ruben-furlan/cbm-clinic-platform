import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { SEO_PAGES, SeoSlug } from './seo-content.data';

@Component({
  selector: 'app-seo-page',
  standalone: true,
  imports: [NgFor, RouterLink, RevealOnScrollDirective],
  templateUrl: './seo-page.component.html',
  styleUrl: './seo-page.component.css',
})
export class SeoPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly pages = SEO_PAGES;

  readonly currentSlug = (this.route.snapshot.routeConfig?.path ??
    'fisioterapia-dolor-lumbar-terrassa') as SeoSlug;

  readonly content =
    this.pages[this.currentSlug] ?? this.pages['fisioterapia-dolor-lumbar-terrassa'];
}
