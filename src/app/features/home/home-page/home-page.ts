import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Testimonials } from '../../testimonials/testimonials';
import { LocationComponent } from '../../location/location';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';
import { FaqComponent } from '../../faq/faq';
import { PricingComponent } from '../../../sections/pricing/pricing.component';
import { EventsSectionComponent } from '../events-section/events-section.component';
import { BannerBonosRegaloComponent } from '../banner-bonos-regalo/banner-bonos-regalo.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, Testimonials, LocationComponent, RevealOnScrollDirective, FaqComponent, PricingComponent, RouterLink, EventsSectionComponent, BannerBonosRegaloComponent],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css']
})
export class HomePage implements OnInit, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly heroSlides = ['/cbm-1.jpeg', '/cbm-2.jpeg', '/cbm-3.jpeg', '/cbm-4.jpeg', '/cbm-5.jpeg'].reverse();
  currentHeroSlide = 0;
  private autoplayId?: ReturnType<typeof setInterval>;
  private touchStartX = 0;
  private touchEndX = 0;

  readonly casos = [
    {
      key: 'lumbar',
      chip: 'Dolor lumbar',
      chipMobile: 'Dolor lumbar',
      titulo: 'Fisioterapia para dolor lumbar en Terrassa',
      descripcion: 'El dolor lumbar es uno de los motivos más frecuentes de consulta. Lo abordamos con terapia manual, ejercicio terapéutico y un plan personalizado para que recuperes movilidad y bienestar.',
      url: '/fisioterapia-dolor-lumbar-terrassa'
    },
    {
      key: 'cervical',
      chip: 'Dolor cervical',
      chipMobile: 'Dolor cervical',
      titulo: 'Fisioterapia para dolor cervical en Terrassa',
      descripcion: 'El cuello cargado por el trabajo de oficina o el estrés tiene solución. Combinamos terapia manual y ejercicio adaptado para reducir la tensión y prevenir recaídas.',
      url: '/fisioterapia-dolor-cervical-terrassa'
    },
    {
      key: 'deportivas',
      chip: 'Lesiones deportivas',
      chipMobile: 'Lesiones deportivas',
      titulo: 'Tratamiento de lesiones deportivas en Terrassa',
      descripcion: 'Esguinces, contracturas, tendinopatías... Trabajamos para que vuelvas a moverte con seguridad y confianza, con un plan de recuperación adaptado a tu actividad.',
      url: '/fisioterapia-lesiones-deportivas-terrassa'
    },
    {
      key: 'tendinitis',
      chip: 'Tendinitis',
      chipMobile: 'Tendinitis',
      titulo: 'Fisioterapia para tendinitis en Terrassa',
      descripcion: 'La tendinitis bien tratada no tiene por qué cronificarse. Te acompañamos con técnicas específicas y ejercicio progresivo para recuperar la función sin dolor.',
      url: '/fisioterapia-tendinitis-terrassa'
    },
    {
      key: 'postquirurgica',
      chip: 'Recuperación postquirúrgica',
      chipMobile: 'Post-cirugía',
      titulo: 'Rehabilitación postquirúrgica en Terrassa',
      descripcion: 'Después de una operación el acompañamiento fisioterapéutico es clave. Diseñamos un plan progresivo y seguro para que recuperes movilidad y fuerza cuanto antes.',
      url: '/fisioterapia-recuperacion-postquirurgica-terrassa'
    },
    {
      key: 'hombro',
      chip: 'Dolor de hombro',
      chipMobile: 'Dolor de hombro',
      titulo: 'Fisioterapia para dolor de hombro en Terrassa',
      descripcion: 'El hombro es una articulación compleja y delicada. Evaluamos tu caso en detalle y aplicamos el tratamiento más adecuado para recuperar el movimiento sin dolor.',
      url: '/fisioterapia-dolor-hombro-terrassa'
    }
  ];
  casoActivo = this.casos[0];
  previewId = 0;
  isMobile = false;

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  seleccionarCaso(caso: (typeof this.casos)[number]): void {
    this.casoActivo = caso;
    this.previewId++;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startHeroAutoplay();
      this.isMobile = window.innerWidth < 768;
    }
  }

  ngOnDestroy(): void {
    this.stopHeroAutoplay();
  }

  pauseHeroAutoplay(): void {
    this.stopHeroAutoplay();
  }

  resumeHeroAutoplay(): void {
    this.startHeroAutoplay();
  }

  onHeroTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].clientX;
  }

  onHeroTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].clientX;
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (Math.abs(swipeDistance) < 35) {
      return;
    }

    if (swipeDistance > 0) {
      this.currentHeroSlide = (this.currentHeroSlide + 1) % this.heroSlides.length;
    } else {
      this.currentHeroSlide = (this.currentHeroSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
    }

    this.stopHeroAutoplay();
    this.startHeroAutoplay();
  }

  trackByIndex(index: number): number {
    return index;
  }

  private startHeroAutoplay(): void {
    if (this.autoplayId) {
      return;
    }

    this.autoplayId = setInterval(() => {
      this.currentHeroSlide = (this.currentHeroSlide + 1) % this.heroSlides.length;
      this.cdr.detectChanges();
    }, 5000);
  }

  scrollToReviews(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const target = document.getElementById('resenas-google');
    if (!target) return;

    const header = document.querySelector('.header') as HTMLElement | null;
    const offset = header ? header.offsetHeight : 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  private stopHeroAutoplay(): void {
    if (!this.autoplayId) {
      return;
    }

    clearInterval(this.autoplayId);
    this.autoplayId = undefined;
  }
}
