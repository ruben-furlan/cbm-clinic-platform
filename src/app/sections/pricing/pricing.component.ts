import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { Tarifa, TarifasService } from '../../core/services/tarifas.service';

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
export class PricingComponent implements OnInit {
  pricingCards: PricingCard[] = [];

  constructor(private readonly tarifasService: TarifasService) {}

  async ngOnInit(): Promise<void> {
    try {
      const tarifas = await this.tarifasService.getTarifas();
      this.pricingCards = this.mapTarifasToCards(tarifas);
    } catch {
      this.pricingCards = this.mapTarifasToCards([]);
    }
  }

  private mapTarifasToCards(tarifas: Tarifa[]): PricingCard[] {
    const groups: Record<'fisioterapia' | 'pilates' | 'promocion', Tarifa[]> = {
      fisioterapia: tarifas.filter((tarifa) => tarifa.categoria === 'fisioterapia'),
      pilates: tarifas.filter((tarifa) => tarifa.categoria === 'pilates'),
      promocion: tarifas.filter((tarifa) => tarifa.categoria === 'promocion')
    };

    return [
      {
        title: 'Fisioterapia',
        items: groups.fisioterapia.map((tarifa) => this.toPricingItem(tarifa))
      },
      {
        title: 'Clases de pilates',
        items: groups.pilates.map((tarifa) => this.toPricingItem(tarifa))
      },
      {
        title: 'Promociones activas',
        items: groups.promocion.map((tarifa) => this.toPricingItem(tarifa)),
        note: 'Promociones y cupones no acumulables'
      }
    ];
  }

  private toPricingItem(tarifa: Tarifa): PricingItem {
    return {
      concept: tarifa.nombre,
      price: `${tarifa.precio}${tarifa.unidad}`,
      microtext: tarifa.descripcion ?? undefined
    };
  }
}
