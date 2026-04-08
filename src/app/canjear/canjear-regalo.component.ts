import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BonosRegaloService, BonoRegalo } from '../core/services/bonos-regalo.service';
import { ServiciosRegaloService, ServicioRegalo } from '../core/services/servicios-regalo.service';

const WHATSAPP_PHONE = '34662561672';
const CANJEAR_URL = 'https://cbmfisioterapia.com/canjear';
const MENSAJES_APERTURA = [
  '',
  'En proceso de abrir...',
  'Falta menos para tu sorpresa...',
  '¡Ya casi está...! ✨'
];

type EstadoCanje =
  | 'inicial'
  | 'cargando'
  | 'no_encontrado'
  | 'pendiente_pago'
  | 'ya_canjeado'
  | 'regalo-interactivo'
  | 'animacion'
  | 'vale';

interface ConfetiParticula {
  left: string;
  delay: string;
  duracion: string;
  color: string;
  size: string;
}

const CONFETI_COLORES = ['#ff4fa3', '#7b4dff', '#ffd700', '#ffffff', '#ff85c8', '#a78bfa'];

@Component({
  selector: 'app-canjear-regalo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './canjear-regalo.component.html',
  styleUrl: './canjear-regalo.component.css'
})
export class CanjearRegaloComponent implements OnDestroy {
  estado: EstadoCanje = 'inicial';
  codigoInput = '';
  bono: BonoRegalo | null = null;
  servicioRegalo: ServicioRegalo | null = null;

  regaloTocado = false;
  mensajeSecuencial = '';
  mostrarInstrucciones = false;
  codigoCopiadoOk = false;

  private mensajeIntervalId: ReturnType<typeof setInterval> | null = null;
  private codigoTimeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly confeti: ConfetiParticula[] = Array.from({ length: 32 }, (_, i) => ({
    left:     `${(i * 37 + 11) % 100}%`,
    delay:    `${((i * 73) % 180) / 100}s`,
    duracion: `${2 + ((i * 41) % 150) / 100}s`,
    color:    CONFETI_COLORES[i % CONFETI_COLORES.length],
    size:     `${6 + (i % 4) * 3}px`,
  }));

  get nombreEmotivo(): string {
    if (this.servicioRegalo?.nombre_emotivo) {
      return this.servicioRegalo.nombre_emotivo;
    }
    return this.bono?.nombre_servicio ?? '';
  }

  get fechaCompraFormateada(): string {
    if (!this.bono?.fecha_compra) return '';
    return new Date(this.bono.fecha_compra).toLocaleDateString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  constructor(
    private readonly bonosRegaloService: BonosRegaloService,
    private readonly serviciosRegaloService: ServiciosRegaloService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.detenerMensajesSecuenciales();
    if (this.codigoTimeoutId !== null) clearTimeout(this.codigoTimeoutId);
  }

  async abrirRegalo(): Promise<void> {
    const codigo = this.codigoInput.trim().toUpperCase();
    if (!codigo) return;

    this.estado = 'cargando';

    try {
      const bono = await this.bonosRegaloService.getBonosByCodigo(codigo);

      if (!bono) {
        this.estado = 'no_encontrado';
        return;
      }

      this.bono = bono;

      // Buscar nombre emotivo en servicios_regalo
      void this.serviciosRegaloService
        .getServicioRegaloById(bono.servicio_regalo_id)
        .then(s => { this.servicioRegalo = s; this.cdr.detectChanges(); });

      if (bono.estado === 'pendiente_pago') {
        this.estado = 'pendiente_pago';
        return;
      }

      if (bono.estado === 'canjeado') {
        this.estado = 'ya_canjeado';
        return;
      }

      // Estado pagado o enviado: fase 0 — interacción antes de la animación
      if (bono.estado === 'pagado' || bono.estado === 'enviado') {
        this.estado = 'regalo-interactivo';
        this.regaloTocado = false;
        this.iniciarMensajesSecuenciales();
        return;
      }

      // Cualquier otro estado: mostrar vale directamente
      this.estado = 'vale';

    } catch (err) {
      console.error('Error buscando bono:', err);
      this.estado = 'no_encontrado';
    } finally {
      this.cdr.detectChanges();
    }
  }

  private iniciarMensajesSecuenciales(): void {
    let idx = 0;
    this.mensajeSecuencial = MENSAJES_APERTURA[idx];
    this.cdr.detectChanges();

    this.mensajeIntervalId = setInterval(() => {
      idx = (idx + 1) % MENSAJES_APERTURA.length;
      this.mensajeSecuencial = MENSAJES_APERTURA[idx];
      this.cdr.detectChanges();
    }, 1200);
  }

  private detenerMensajesSecuenciales(): void {
    if (this.mensajeIntervalId !== null) {
      clearInterval(this.mensajeIntervalId);
      this.mensajeIntervalId = null;
    }
  }

  tocarRegalo(): void {
    if (this.regaloTocado) return;
    this.regaloTocado = true;
    this.detenerMensajesSecuenciales();
    this.cdr.detectChanges();

    // Esperar que termine la animación CSS de explosión (500ms) antes de cambiar estado
    setTimeout(() => {
      this.estado = 'animacion';
      // Canjear en background sin bloquear la animación
      if (this.bono) {
        void this.bonosRegaloService.canjearBono(this.bono.codigo)
          .then(actualizado => { this.bono = actualizado; this.cdr.detectChanges(); })
          .catch(err => console.error('Error canjeando bono:', err));
      }
      // Pasar al vale tras la animación de apertura
      setTimeout(() => { this.estado = 'vale'; this.cdr.detectChanges(); }, 2600);
      this.cdr.detectChanges();
    }, 500);
  }

  resetear(): void {
    this.detenerMensajesSecuenciales();
    if (this.codigoTimeoutId !== null) clearTimeout(this.codigoTimeoutId);
    this.estado = 'inicial';
    this.codigoInput = '';
    this.bono = null;
    this.servicioRegalo = null;
    this.regaloTocado = false;
    this.mensajeSecuencial = '';
    this.mostrarInstrucciones = false;
    this.codigoCopiadoOk = false;
  }

  coordinarWhatsApp(): void {
    if (!this.bono) return;
    const text = [
      `Hola CBM! 😊 Tengo un bono regalo con código ${this.bono.codigo} — ${this.nombreEmotivo}`,
      'Me gustaría coordinar mi sesión 💜',
      '¿Cuándo tendríais disponibilidad?'
    ].join('\n');
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  }

  contactarWhatsApp(): void {
    window.open(`https://wa.me/${WHATSAPP_PHONE}`, '_blank');
  }

  copiarCodigo(): void {
    if (!this.bono) return;
    void navigator.clipboard.writeText(this.bono.codigo).then(() => {
      this.codigoCopiadoOk = true;
      this.cdr.detectChanges();
      this.codigoTimeoutId = setTimeout(() => {
        this.codigoCopiadoOk = false;
        this.cdr.detectChanges();
      }, 2000);
    });
  }

  toggleInstrucciones(): void {
    this.mostrarInstrucciones = !this.mostrarInstrucciones;
  }

  readonly canjearUrl = CANJEAR_URL;
}
