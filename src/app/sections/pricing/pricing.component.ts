import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

interface PricingItem {
  concept: string;
  price: string;
  microtext?: string;
}

interface PricingCard {
  title: string;
  items: PricingItem[];
  note?: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [NgFor, NgIf, RevealOnScrollDirective],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent {
  readonly pricingCards: PricingCard[] = [
    {
      title: 'Fisioterapia',
      items: [
        { concept: 'Sesión individual', price: '60€' },
        { concept: 'Bono 5 sesiones', price: '250€', microtext: '50€ por sesión' }
      ]
    },
    {
      title: 'Clases de pilates',
      items: [
        { concept: '1 vez por semana', price: '48€/mes' },
        { concept: '2 veces por semana', price: '65€/mes' }
      ]
    },
    {
      title: 'Promociones activas',
      items: [
        { concept: 'Masaje relajante', price: '45€' },
        {
          concept: 'Jubilados bono 10 sesiones',
          price: '400€',
          microtext: '40€ por sesión · el primer año'
        }
      ],
      note: 'Promociones y cupones no acumulables'
    }
  ];
}
