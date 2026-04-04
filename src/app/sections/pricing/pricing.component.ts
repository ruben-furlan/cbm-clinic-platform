import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { Tarifa, TarifasService } from '../../core/services/tarifas.service';
import { CbmLoaderComponent } from '../../shared/components/cbm-loader/cbm-loader.component';

interface PricingItem {
  concept: string;
  price: string;
  microtext?: string;
  urgencyDays?: number;
  urgencyType?: 'warning' | 'urgent';
}

interface PricingCard {
  title: string;
  items: PricingItem[];
  note?: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [NgFor, NgIf, RevealOnScrollDirective, CbmLoaderComponent],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
  pricingCards: PricingCard[] = [];
  loading = true;

  constructor(private readonly tarifasService: TarifasService) {}

  async ngOnInit(): Promise<void> {
    try {
      const tarifas = await this.tarifasService.getTarifas();
      this.pricingCards = this.mapTarifasToCards(tarifas);
    } catch {
      this.pricingCards = this.mapTarifasToCards([]);
    } finally {
      this.loading = false;
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
    ].filter((card) => card.items.length > 0);
  }

  private toPricingItem(tarifa: Tarifa): PricingItem {
    const item: PricingItem = {
      concept: tarifa.nombre,
      price: `${tarifa.precio}${tarifa.unidad}`,
      microtext: tarifa.descripcion ?? undefined
    };

    if (tarifa.categoria === 'promocion' && tarifa.fecha_fin_promo) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(tarifa.fecha_fin_promo);
      endDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays >= 1 && diffDays <= 7) {
        item.urgencyDays = diffDays;
        item.urgencyType = 'urgent';
      } else if (diffDays >= 8 && diffDays <= 14) {
        item.urgencyDays = diffDays;
        item.urgencyType = 'warning';
      }
    }

    return item;
  }
}
