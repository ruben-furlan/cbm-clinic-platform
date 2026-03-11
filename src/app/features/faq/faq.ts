import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [NgFor, NgIf, RevealOnScrollDirective],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class FaqComponent {
  activeItemIndex: number | null = 0;

  readonly faqItems: FaqItem[] = [
    {
      question: '¿Aceptan seguros?',
      answer: 'No en este momento, pero esperamos poder hacerlo en un futuro cercano.'
    },
    {
      question: '¿Cuál es su política de cancelación?',
      answer: 'Por favor, avísanos con al menos 24 horas de anticipación si necesitas cancelar o reprogramar.'
    },
    {
      question: '¿Ofrecen telemedicina o visitas por llamada?',
      answer: 'Sí, tenemos sesiones en línea seguras. Puedes enviarnos un mensaje para revisar tu caso.'
    }
  ];

  toggleItem(index: number): void {
    this.activeItemIndex = this.activeItemIndex === index ? null : index;
  }
}
