import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { Tarifa, TarifasService } from '../../core/services/tarifas.service';
import { CbmLoaderComponent } from '../../shared/components/cbm-loader/cbm-loader.component';
import { RouterLink } from '@angular/router';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { DomicilioFormComponent } from '../../shared/components/domicilio-form/domicilio-form.component';

interface PricingItem {
  concept: string;
  price: string;
  microtext?: string;
  urgencyDays?: number;
  urgencyType?: 'warning' | 'urgent';
  fechaFinPromo?: string | null;
}

interface PricingCard {
  title: string;
  items: PricingItem[];
  note?: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [NgFor, NgIf, RevealOnScrollDirective, CbmLoaderComponent, RouterLink, DomicilioFormComponent],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
  pricingCards: PricingCard[] = [];
  loading = true;

  domicilioActivo = false;
  domicilioTitulo = 'Fisioterapia a domicilio';
  domicilioMensaje =
    'Pensado para recuperaciones postparto, post-cirugía o movilidad reducida. Valoramos cada caso con cariño.';
  showDomicilioModal = false;

  constructor(
    private readonly tarifasService: TarifasService,
    private readonly configuracionService: ConfiguracionService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [tarifas, domActivo, domTitulo, domMensaje] = await Promise.all([
        this.tarifasService.getTarifas(),
        this.configuracionService.getConfiguracion('domicilio_activo'),
        this.configuracionService.getConfiguracion('domicilio_titulo'),
        this.configuracionService.getConfiguracion('domicilio_mensaje')
      ]);
      this.pricingCards = this.mapTarifasToCards(tarifas);
      this.domicilioActivo = domActivo === 'true';
      if (domTitulo) this.domicilioTitulo = domTitulo;
      if (domMensaje) this.domicilioMensaje = domMensaje;
    } catch {
      this.pricingCards = this.mapTarifasToCards([]);
    } finally {
      this.loading = false;
    }
  }

  formatFechaFin(fecha: string): string {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const d = new Date(fecha + 'T00:00:00');
    return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
  }

  private mapTarifasToCards(tarifas: Tarifa[]): PricingCard[] {
    const groups: Record<'fisioterapia' | 'pilates' | 'promocion', Tarifa[]> = {
      fisioterapia: tarifas.filter((tarifa) => tarifa.categoria === 'fisioterapia'),
      pilates: tarifas.filter((tarifa) => tarifa.categoria === 'pilates'),
      promocion: tarifas.filter((tarifa) => tarifa.categoria === 'promocion')
    };

    return [
      {
        title: this.tarifasService.getCategoriaLabel('fisioterapia'),
        items: groups.fisioterapia.map((tarifa) => this.toPricingItem(tarifa))
      },
      {
        title: this.tarifasService.getCategoriaLabel('pilates'),
        items: groups.pilates.map((tarifa) => this.toPricingItem(tarifa))
      },
      {
        title: this.tarifasService.getCategoriaLabel('promocion'),
        items: groups.promocion.map((tarifa) => this.toPricingItem(tarifa)),
        note: 'Bonos y cupones no acumulables'
      }
    ].filter((card) => card.items.length > 0);
  }

  private toPricingItem(tarifa: Tarifa): PricingItem {
    const item: PricingItem = {
      concept: tarifa.nombre,
      price: `${tarifa.precio}${tarifa.unidad}`,
      microtext: tarifa.descripcion ?? undefined,
      fechaFinPromo: tarifa.fecha_fin_promo ?? null
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
