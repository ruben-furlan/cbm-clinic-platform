import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BonosRegaloService, BonoRegalo } from '../core/services/bonos-regalo.service';
import { ServiciosRegaloService, ServicioRegalo } from '../core/services/servicios-regalo.service';

const WHATSAPP_PHONE = '34662561672';
const CANJEAR_URL = 'https://cbmfisioterapia.com/canjear';

type EstadoCanje = 'inicial' | 'cargando' | 'no_encontrado' | 'pendiente_pago' | 'ya_canjeado' | 'animacion' | 'vale';

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
export class CanjearRegaloComponent {
  estado: EstadoCanje = 'inicial';
  codigoInput = '';
  bono: BonoRegalo | null = null;
  servicioRegalo: ServicioRegalo | null = null;

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
    private readonly serviciosRegaloService: ServiciosRegaloService
  ) {}

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
        .then(s => { this.servicioRegalo = s; });

      if (bono.estado === 'pendiente_pago') {
        this.estado = 'pendiente_pago';
        return;
      }

      if (bono.estado === 'canjeado') {
        this.estado = 'ya_canjeado';
        return;
      }

      // Estado pagado o enviado: experiencia de apertura
      if (bono.estado === 'pagado' || bono.estado === 'enviado') {
        this.estado = 'animacion';
        // Canjear en background (sin bloquear la animación)
        void this.bonosRegaloService.canjearBono(bono.codigo)
          .then(actualizado => { this.bono = actualizado; })
          .catch(err => console.error('Error canjeando bono:', err));
        // Pasar al vale tras la animación
        setTimeout(() => { this.estado = 'vale'; }, 2600);
        return;
      }

      // Cualquier otro estado (ej: ya estaba en animacion previa): mostrar vale
      this.estado = 'vale';

    } catch (err) {
      console.error('Error buscando bono:', err);
      this.estado = 'no_encontrado';
    }
  }

  resetear(): void {
    this.estado = 'inicial';
    this.codigoInput = '';
    this.bono = null;
    this.servicioRegalo = null;
  }

  reservarSesion(): void {
    if (!this.bono) return;
    const text = `Hola CBM! Tengo un bono regalo con código ${this.bono.codigo} y quiero reservar mi sesión 💜\n¿Cuándo podríais atenderme?`;
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  }

  contactarWhatsApp(): void {
    window.open(`https://wa.me/${WHATSAPP_PHONE}`, '_blank');
  }

  guardarVale(): void {
    const node = document.getElementById('vale-regalo');
    if (!node) return;

    const width = 680;
    const height = node.scrollHeight * 2;

    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`,
      `<foreignObject width="${width}" height="${height}">`,
      new XMLSerializer().serializeToString(node),
      `</foreignObject></svg>`
    ].join('');

    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'bono-regalo-cbm.png';
      link.click();
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }

  readonly canjearUrl = CANJEAR_URL;
}
