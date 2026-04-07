import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BonosRegaloService, BonoMetodoPago, BonoRegalo } from '../../core/services/bonos-regalo.service';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { Tarifa, TarifasService } from '../../core/services/tarifas.service';

const WHATSAPP_PHONE = '34662561672';

type TabRegalo = 'regalar' | 'canjear';
const REQUEST_TIMEOUT_MS = 10000;

@Component({
  selector: 'app-regalo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './regalo.component.html',
  styleUrl: './regalo.component.css'
})
export class RegaloComponent implements OnInit {
  bonosActivo = false;
  tab: TabRegalo = 'regalar';
  tarifas: Tarifa[] = [];
  tarifaSeleccionada: Tarifa | null = null;

  codigoInput = '';
  loadingCodigo = false;
  codigoError = '';
  bonoEncontrado: BonoRegalo | null = null;
  mostrarAnimacionRegalo = false;
  canjeRegistrado = false;

  readonly form;

  constructor(
    private readonly fb: FormBuilder,
    private readonly configuracionService: ConfiguracionService,
    private readonly tarifasService: TarifasService,
    private readonly bonosRegaloService: BonosRegaloService
  ) {
    this.form = this.fb.nonNullable.group({
      nombre_comprador: ['', Validators.required],
      email_comprador: ['', [Validators.required, Validators.email]],
      metodo_pago: ['bizum' as BonoMetodoPago, Validators.required],
      mensaje_personal: ['', [Validators.maxLength(300)]]
    });
  }


  private withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), REQUEST_TIMEOUT_MS))
    ]);
  }
  async ngOnInit(): Promise<void> {
    this.bonosActivo = false;
    this.tarifas = [];

    try {
      this.bonosActivo = await this.withTimeout(this.configuracionService.isBonosRegaloActivo(), false);

      if (this.bonosActivo) {
        this.tarifas = await this.withTimeout(this.tarifasService.getTarifas(), [] as Tarifa[]);
      }
    } catch {
      this.bonosActivo = false;
      this.tarifas = [];
    }
  }

  setTab(tab: TabRegalo): void {
    this.tab = tab;
  }

  seleccionarTarifa(tarifa: Tarifa): void {
    this.tarifaSeleccionada = tarifa;
  }

  getMensajeEmotivo(tarifa: Tarifa): string {
    if (tarifa.categoria === 'fisioterapia') return 'Regala recuperación 💆';
    if (tarifa.categoria === 'pilates') return 'Regala movimiento 🧘';
    return 'Regala bienestar ✨';
  }

  async continuarWhatsApp(): Promise<void> {
    if (!this.tarifaSeleccionada || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const codigo = this.bonosRegaloService.generarCodigo();

    await this.bonosRegaloService.createSolicitudBono({
      codigo,
      tarifa_id: this.tarifaSeleccionada.id,
      nombre_servicio: this.tarifaSeleccionada.nombre,
      precio: this.tarifaSeleccionada.precio,
      nombre_comprador: v.nombre_comprador,
      email_comprador: v.email_comprador,
      mensaje_personal: v.mensaje_personal || null,
      estado: 'pendiente_pago',
      metodo_pago: v.metodo_pago
    });

    const mensaje = [
      'Hola CBM 😊 Quiero regalar una experiencia a alguien especial 🎁',
      '',
      `Servicio elegido: ${this.tarifaSeleccionada.nombre} — ${this.tarifaSeleccionada.precio}€`,
      `Mi nombre: ${v.nombre_comprador}`,
      `Mi email: ${v.email_comprador}`,
      `Método de pago: ${v.metodo_pago}`,
      v.mensaje_personal ? `💌 Mensaje para el receptor: ${v.mensaje_personal}` : '',
      '',
      '¿Podéis confirmarme los pasos a seguir? 💜'
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }

  async abrirRegalo(): Promise<void> {
    if (!this.codigoInput.trim()) return;

    this.loadingCodigo = true;
    this.codigoError = '';
    this.bonoEncontrado = null;
    this.canjeRegistrado = false;

    try {
      const bono = await this.bonosRegaloService.getBonosByCodigo(this.codigoInput.trim().toUpperCase());
      if (!bono) {
        this.codigoError = 'Hmm, no encontramos ese código 🤔 Revisa que esté bien escrito o contacta con nosotros.';
        return;
      }

      this.bonoEncontrado = bono;

      if ((bono.estado === 'pagado' || bono.estado === 'enviado') && !this.canjeRegistrado) {
        this.mostrarAnimacionRegalo = true;
        setTimeout(() => this.mostrarAnimacionRegalo = false, 2500);
        await this.bonosRegaloService.canjearBono(bono.codigo);
        this.bonoEncontrado = { ...bono, estado: 'canjeado', fecha_canje: new Date().toISOString() };
        this.canjeRegistrado = true;
      }
    } catch {
      this.codigoError = 'No pudimos abrir tu regalo ahora mismo. Escríbenos por WhatsApp 💜';
    } finally {
      this.loadingCodigo = false;
    }
  }

  async descargarVale(): Promise<void> {
    const node = document.getElementById('vale-regalo');
    if (!node) return;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="1280"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(node)}</foreignObject></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 960;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'bono-regalo-cbm.png';
      link.click();
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }

  reservarSesion(): void {
    if (!this.bonoEncontrado) return;
    const text = `Hola CBM! Tengo un bono regalo con código ${this.bonoEncontrado.codigo} y quiero reservar mi sesión 💜\n¿Cuándo podríais atenderme?`;
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  }

  contactarWhatsApp(): void {
    window.open(`https://wa.me/${WHATSAPP_PHONE}`, '_blank');
  }
}
