import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BonosRegaloService, BonoMetodoPago, BonoRegalo } from '../../core/services/bonos-regalo.service';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { ServicioRegalo, ServiciosRegaloService } from '../../core/services/servicios-regalo.service';

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
  cargando = true;
  tab: TabRegalo = 'regalar';
  servicios: ServicioRegalo[] = [];
  servicioSeleccionado: ServicioRegalo | null = null;

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
    private readonly serviciosRegaloService: ServiciosRegaloService,
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
    this.cargando = true;
    this.servicios = [];

    try {
      const valor = await this.withTimeout(this.configuracionService.getConfiguracion('bonos_regalo_activo'), null);
      console.log('bonos_regalo_activo valor:', valor, '| tipo:', typeof valor);
      this.bonosActivo = valor === 'true';

      if (this.bonosActivo) {
        this.servicios = await this.withTimeout(this.serviciosRegaloService.getServiciosRegalo(), [] as ServicioRegalo[]);
      }
    } catch (err) {
      console.error('Error cargando config bonos:', err);
      this.bonosActivo = false;
      this.servicios = [];
    } finally {
      this.cargando = false;
    }
  }

  setTab(tab: TabRegalo): void {
    this.tab = tab;
  }

  seleccionarServicio(servicio: ServicioRegalo): void {
    this.servicioSeleccionado = servicio;
  }

  async continuarWhatsApp(): Promise<void> {
    if (!this.servicioSeleccionado || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const codigo = this.bonosRegaloService.generarCodigo();

    await this.bonosRegaloService.createSolicitudBono({
      codigo,
      tarifa_id: this.servicioSeleccionado.id,
      nombre_servicio: this.servicioSeleccionado.nombre_servicio,
      precio: this.servicioSeleccionado.precio,
      nombre_comprador: v.nombre_comprador,
      email_comprador: v.email_comprador,
      mensaje_personal: v.mensaje_personal || null,
      estado: 'pendiente_pago',
      metodo_pago: v.metodo_pago
    });

    const mensaje = [
      'Hola CBM 😊 Quiero regalar una experiencia a alguien especial 🎁',
      '',
      `Servicio elegido: ${this.servicioSeleccionado.nombre_servicio} — ${this.servicioSeleccionado.precio}${this.servicioSeleccionado.unidad}`,
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
