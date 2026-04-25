import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-filosofia-cbm-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './filosofia-cbm-page.html',
  styleUrl: './filosofia-cbm-page.css',
})
export class FilosofiaCbmPage implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('eyebrowEl') private eyebrowEl!: ElementRef<HTMLElement>;
  @ViewChild('typewriterEl') private typewriterEl!: ElementRef<HTMLElement>;
  @ViewChild('heroPostEl') private heroPostEl!: ElementRef<HTMLElement>;
  @ViewChild('guideFillEl') private guideFillEl!: ElementRef<HTMLElement>;
  @ViewChild('guideLineEl') private guideLineEl!: ElementRef<HTMLElement>;
  @ViewChild('filosofiaContentEl') private contentEl!: ElementRef<HTMLElement>;

  private rafId = 0;
  private scrollHandler?: () => void;
  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private observers: IntersectionObserver[] = [];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.skipAnimations();
      return;
    }

    this.startTypewriter();
    this.initGuideLine();
    this.initRevealBlocks();
    this.initTextIllumination();
  }

  private skipAnimations(): void {
    const tw = this.typewriterEl?.nativeElement;
    if (tw) tw.textContent = 'Cuidamos tu cuerpo, pero también entendemos tu proceso.';
    this.eyebrowEl?.nativeElement?.classList.add('hero-item-visible');
    this.heroPostEl?.nativeElement?.classList.add('hero-item-visible');
    document
      .querySelectorAll<HTMLElement>('.reveal-block')
      .forEach((el) => el.classList.add('is-visible'));
    document
      .querySelectorAll<HTMLElement>('.txt-line')
      .forEach((el) => el.classList.add('lit'));
  }

  private startTypewriter(): void {
    const text = 'Cuidamos tu cuerpo, pero también entendemos tu proceso.';
    const el = this.typewriterEl?.nativeElement;
    if (!el) return;
    el.innerHTML = '';
    let i = 0;

    const tick = () => {
      if (i >= text.length) {
        const t = setTimeout(() => {
          this.eyebrowEl?.nativeElement?.classList.add('hero-item-visible');
          this.heroPostEl?.nativeElement?.classList.add('hero-item-visible');
        }, 220);
        this.timeouts.push(t);
        return;
      }
      const span = document.createElement('span');
      span.className = 'tw-char';
      span.textContent = text[i];
      el.appendChild(span);
      requestAnimationFrame(() => requestAnimationFrame(() => span.classList.add('tw-visible')));
      i++;
      const t = setTimeout(tick, 40);
      this.timeouts.push(t);
    };

    const t = setTimeout(tick, 350);
    this.timeouts.push(t);
  }

  private initGuideLine(): void {
    const fill = this.guideFillEl?.nativeElement;
    const content = this.contentEl?.nativeElement;
    if (!fill || !content) return;

    const dots = Array.from(
      this.guideLineEl.nativeElement.querySelectorAll<HTMLElement>('.guide-dot'),
    );
    const thresholds = [0.08, 0.28, 0.5, 0.7, 0.88];

    const update = () => {
      const rect = content.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / rect.height));
      fill.style.height = `${progress * 100}%`;
      dots.forEach((dot, i) => {
        if (progress >= thresholds[i]) dot.classList.add('dot-visible');
      });
      this.rafId = 0;
    };

    this.scrollHandler = () => {
      if (!this.rafId) this.rafId = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    update();
  }

  private initRevealBlocks(): void {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' },
    );
    document.querySelectorAll('.reveal-block').forEach((el) => obs.observe(el));
    this.observers.push(obs);
  }

  private initTextIllumination(): void {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.querySelectorAll<HTMLElement>('.txt-line').forEach((line, i) => {
              const t = setTimeout(() => line.classList.add('lit'), i * 200);
              this.timeouts.push(t);
            });
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.15, rootMargin: '0px 0px -15% 0px' },
    );
    document.querySelectorAll('.text-illuminate').forEach((el) => obs.observe(el));
    this.observers.push(obs);
  }

  ngOnDestroy(): void {
    if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.observers.forEach((o) => o.disconnect());
    this.timeouts.forEach((t) => clearTimeout(t));
  }
}
