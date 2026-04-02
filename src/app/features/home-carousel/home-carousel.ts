import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';

interface CarouselSlide {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

@Component({
  selector: 'app-home-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-carousel.html',
  styleUrls: ['./home-carousel.css']
})
export class HomeCarouselComponent implements OnInit, OnDestroy {
  readonly autoplayMs = 5500;
  readonly slides: CarouselSlide[] = [
    {
      image: '/cbm-1.jpeg',
      imageAlt: 'Tratamiento de fisioterapia en CBM Terrassa',
      title: 'Recupera tu movilidad sin dolor',
      description: 'Tratamientos personalizados de fisioterapia en Terrassa',
      ctaLabel: 'Solicitar cita',
      ctaHref: '#reserva'
    },
    {
      image: '/cbm-2.jpeg',
      imageAlt: 'Sesión de pilates terapéutico en clínica',
      title: 'Pilates terapéutico adaptado a ti',
      description: 'Mejora tu postura, fuerza y bienestar',
      ctaLabel: 'Ver tratamientos',
      ctaHref: '#servicios'
    },
    {
      image: '/cbm-3.jpeg',
      imageAlt: 'Espacio interior de CBM Fisioterapia',
      title: 'Un espacio pensado para tu recuperación',
      description: 'Ambiente profesional, cercano y equipado',
      ctaLabel: 'Conócenos',
      ctaHref: '#experiencia'
    },
    {
      image: '/cbm-4.jpeg',
      imageAlt: 'Sala de pilates terapéutico en CBM',
      title: 'Pilates terapéutico adaptado a ti',
      description: 'Mejora tu postura, fuerza y bienestar',
      ctaLabel: 'Ver tratamientos',
      ctaHref: '#servicios'
    },
    {
      image: '/cbm-5.jpeg',
      imageAlt: 'Zona de recuperación y ejercicio funcional en clínica',
      title: 'Un espacio pensado para tu recuperación',
      description: 'Ambiente profesional, cercano y equipado',
      ctaLabel: 'Conócenos',
      ctaHref: '#experiencia'
    }
  ];

  currentIndex = 0;
  private autoplayId?: ReturnType<typeof setInterval>;
  private touchStartX = 0;
  private touchEndX = 0;

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.restartAutoplay();
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].clientX;
    this.handleSwipe();
  }

  pauseAutoplay(): void {
    this.stopAutoplay();
  }

  resumeAutoplay(): void {
    this.startAutoplay();
  }

  restartAutoplay(): void {
    this.stopAutoplay();
    this.startAutoplay();
  }

  trackByIndex(index: number): number {
    return index;
  }

  @HostListener('document:visibilitychange')
  handleVisibilityChange(): void {
    if (document.hidden) {
      this.stopAutoplay();
      return;
    }

    this.startAutoplay();
  }

  private handleSwipe(): void {
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (Math.abs(swipeDistance) < 40) {
      return;
    }

    if (swipeDistance > 0) {
      this.nextSlide();
    } else {
      this.prevSlide();
    }

    this.restartAutoplay();
  }

  private startAutoplay(): void {
    if (this.autoplayId) {
      return;
    }

    this.autoplayId = setInterval(() => {
      this.nextSlide();
    }, this.autoplayMs);
  }

  private stopAutoplay(): void {
    if (!this.autoplayId) {
      return;
    }

    clearInterval(this.autoplayId);
    this.autoplayId = undefined;
  }
}
