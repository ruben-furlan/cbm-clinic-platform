import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  inject
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appRevealOnScroll]',
  standalone: true
})
export class RevealOnScrollDirective implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly reducedMotion = isPlatformBrowser(this.platformId)
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.reducedMotion) {
      this.renderer.addClass(this.el.nativeElement, 'is-visible');
      return;
    }

    this.renderer.addClass(this.el.nativeElement, 'reveal');

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(this.el.nativeElement, 'is-visible');
            this.observer?.unobserve(this.el.nativeElement);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -8% 0px'
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
