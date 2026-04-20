import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { Tarifa, TarifaCategoria, TarifasService } from '../../core/services/tarifas.service';
import { CbmLoaderComponent } from '../../shared/components/cbm-loader/cbm-loader.component';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { DomicilioFormComponent } from '../../shared/components/domicilio-form/domicilio-form.component';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [NgFor, NgIf, RevealOnScrollDirective, CbmLoaderComponent, DomicilioFormComponent],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
  tarifas: Tarifa[] = [];
  loading = true;

  tabs = [
    { key: 'fisioterapia' as TarifaCategoria, label: 'Fisioterapia' },
    { key: 'pilates' as TarifaCategoria, label: 'Pilates' },
    { key: 'promocion' as TarifaCategoria, label: 'Bienestar' }
  ];
  tabActiva: TarifaCategoria = 'fisioterapia';
  expandidos: { [id: string]: boolean } = {};

  domicilioActivo = false;
  domicilioTitulo = 'Fisioterapia a domicilio';
  domicilioMensaje =
    'Pensado para recuperaciones postparto, post-cirugía o movilidad reducida. Valoramos cada caso con cariño.';
  showDomicilioModal = false;

  constructor(
    private readonly tarifasService: TarifasService,
    private readonly configuracionService: ConfiguracionService,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const [tarifas, domActivo, domTitulo, domMensaje] = await Promise.all([
        this.tarifasService.getTarifas(),
        this.configuracionService.getConfiguracion('domicilio_activo'),
        this.configuracionService.getConfiguracion('domicilio_titulo'),
        this.configuracionService.getConfiguracion('domicilio_mensaje')
      ]);
      this.tarifas = tarifas;
      this.domicilioActivo = domActivo === 'true';
      if (domTitulo) this.domicilioTitulo = domTitulo;
      if (domMensaje) this.domicilioMensaje = domMensaje;
    } catch {
      this.tarifas = [];
    } finally {
      this.loading = false;
    }
  }

  get tarifasFiltradas(): Tarifa[] {
    return this.tarifas.filter(t => t.categoria === this.tabActiva && t.activo);
  }

  reservarSesion(tarifa: Tarifa): void {
    this.router.navigate(['/solicitar-cita'], {
      queryParams: {
        tarifaId: tarifa.id,
        nombre: tarifa.nombre,
        precio: tarifa.precio,
        unidad: tarifa.unidad
      }
    });
  }

  toggleDescripcion(id: string): void {
    this.expandidos[id] = !this.expandidos[id];
  }

  formatFechaFin(fecha: string): string {
    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const d = new Date(fecha + 'T00:00:00');
    return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
  }
}
