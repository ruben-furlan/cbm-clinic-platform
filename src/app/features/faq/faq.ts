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
      question: '¿Cuánto dura una sesión?',
      answer: 'La mayoría de sesiones duran entre 45 y 60 minutos, según tu caso y el objetivo de tratamiento.'
    },
    {
      question: '¿Necesito derivación médica?',
      answer: 'No es necesario en la mayoría de casos. Si ya tienes pruebas o informes, tráelos para personalizar mejor tu plan.'
    },
    {
      question: '¿Trabajáis con mutuas?',
      answer: 'Actualmente trabajamos de forma privada para poder dedicarte una atención individual y sin prisas.'
    },
    {
      question: '¿Cuánto cuesta la sesión?',
      answer: 'Los precios varian segun el tipo de tratamiento, Pero contamos con accesibilidad de pagos. Escribenos por whatsApp y te informamos sin compromiso'
    }
  ];

  toggleItem(index: number): void {
    this.activeItemIndex = this.activeItemIndex === index ? null : index;
  }
}
