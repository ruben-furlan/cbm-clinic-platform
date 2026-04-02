import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

type EspacioCategory = 'todo' | 'sala' | 'pilates' | 'detalles' | 'centro';

interface EspacioImage {
  src: string;
  alt: string;
  category: Exclude<EspacioCategory, 'todo'>;
  size: 'large' | 'medium' | 'wide';
  mood: string;
}

@Component({
  selector: 'app-espacio-cbm-page',
  standalone: true,
  imports: [CommonModule, RouterLink, RevealOnScrollDirective],
  templateUrl: './espacio-cbm-page.html',
  styleUrls: ['./espacio-cbm-page.css']
})
export class EspacioCbmPage implements OnDestroy {
  readonly categories: { id: EspacioCategory; label: string }[] = [
    { id: 'todo', label: 'Todo' },
    { id: 'sala', label: 'Sala' },
    { id: 'pilates', label: 'Pilates' },
    { id: 'detalles', label: 'Detalles' },
    { id: 'centro', label: 'Centro' }
  ];

  readonly images: EspacioImage[] = [
    {
      src: '/cbm-1.jpeg',
      alt: 'Sala principal del centro de fisioterapia CBM',
      category: 'sala',
      size: 'large',
      mood: 'Espacios amplios y cuidados para cada tratamiento.'
    },
    {
      src: '/cbm-2.jpeg',
      alt: 'Zona de pilates terapéutico del centro CBM',
      category: 'pilates',
      size: 'medium',
      mood: 'Movimiento guiado con precisión y bienestar.'
    },
    {
      src: '/cbm-3.jpeg',
      alt: 'Detalle del ambiente interior de CBM Fisioterapia',
      category: 'detalles',
      size: 'medium',
      mood: 'Detalles que transmiten calma y profesionalidad.'
    },
    {
      src: '/cbm-4.jpeg',
      alt: 'Vista general del centro CBM en Terrassa',
      category: 'centro',
      size: 'wide',
      mood: 'Un entorno cálido para una atención personalizada.'
    },
    {
      src: '/cbm-5.jpeg',
      alt: 'Otra perspectiva de la sala de atención en CBM',
      category: 'sala',
      size: 'large',
      mood: 'Comodidad y orden al servicio de tu recuperación.'
    }
  ];

  selectedCategory: EspacioCategory = 'todo';
  activeImageIndex = 0;
  isLightboxOpen = false;
  scrollOffset = 0;

  get filteredImages(): EspacioImage[] {
    if (this.selectedCategory === 'todo') {
      return this.images;
    }

    return this.images.filter((image) => image.category === this.selectedCategory);
  }

  ngOnDestroy(): void {
    this.toggleBodyScroll(false);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrollOffset = Math.min(window.scrollY * 0.08, 28);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isLightboxOpen) {
      this.closeLightbox();
    }
  }

  @HostListener('document:keydown.arrowright')
  onArrowRight(): void {
    if (this.isLightboxOpen) {
      this.nextImage();
    }
  }

  @HostListener('document:keydown.arrowleft')
  onArrowLeft(): void {
    if (this.isLightboxOpen) {
      this.previousImage();
    }
  }

  selectCategory(category: EspacioCategory): void {
    this.selectedCategory = category;
  }

  openLightbox(image: EspacioImage): void {
    const selectedIndex = this.filteredImages.findIndex((item) => item.src === image.src);

    if (selectedIndex === -1) {
      return;
    }

    this.activeImageIndex = selectedIndex;
    this.isLightboxOpen = true;
    this.toggleBodyScroll(true);
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
    this.toggleBodyScroll(false);
  }

  nextImage(): void {
    this.activeImageIndex = (this.activeImageIndex + 1) % this.filteredImages.length;
  }

  previousImage(): void {
    this.activeImageIndex = (this.activeImageIndex - 1 + this.filteredImages.length) % this.filteredImages.length;
  }

  trackBySrc(_: number, image: EspacioImage): string {
    return image.src;
  }

  private toggleBodyScroll(shouldLock: boolean): void {
    document.body.style.overflow = shouldLock ? 'hidden' : '';
  }
}
