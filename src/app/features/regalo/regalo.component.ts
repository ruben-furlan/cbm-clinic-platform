import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BonosRegaloService, BonoMetodoPago } from '../../core/services/bonos-regalo.service';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { ServicioRegalo, ServiciosRegaloService } from '../../core/services/servicios-regalo.service';

const WHATSAPP_PHONE = '34662561672';

const REQUEST_TIMEOUT_MS = 10000;

interface MetodoPago {
  value: BonoMetodoPago;
  icono: string;
  label: string;
  subtexto: string;
}

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
  servicios: ServicioRegalo[] = [];
  servicioSeleccionado: ServicioRegalo | null = null;
  errorSinServicio = false;

  readonly metodosPago: MetodoPago[] = [
    { value: 'bizum',        icono: '💳', label: 'Bizum',        subtexto: 'Te damos el número al confirmar' },
    { value: 'transferencia', icono: '🏦', label: 'Transferencia', subtexto: 'Te damos los datos al confirmar' },
    { value: 'efectivo',     icono: '🏥', label: 'En el centro', subtexto: 'Págalo cuando vengas' }
  ];

  readonly form;

  get formCompleto(): boolean {
    return !!this.servicioSeleccionado && this.form.valid;
  }

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

    // 1) Leer configuración — si falla aquí, mostramos "Muy pronto"
    try {
      const valor = await this.withTimeout(this.configuracionService.getConfiguracion('bonos_regalo_activo'), null);
      console.log('bonos_regalo_activo valor:', valor, '| tipo:', typeof valor);
      this.bonosActivo = valor === 'true';
    } catch (err) {
      console.error('Error leyendo config bonos:', err);
      this.bonosActivo = false;
      this.cargando = false;
      return;
    }

    // 2) Leer servicios — si falla (ej: tabla no creada aún) no bloquea la página
    if (this.bonosActivo) {
      try {
        this.servicios = await this.withTimeout(this.serviciosRegaloService.getServiciosRegalo(), [] as ServicioRegalo[]);
      } catch (err) {
        console.error('Error cargando servicios regalo:', err);
        this.servicios = [];
      }
    }

    this.cargando = false;
  }

  seleccionarServicio(servicio: ServicioRegalo): void {
    const esPrimerClick = !this.servicioSeleccionado;
    this.servicioSeleccionado = servicio;
    this.errorSinServicio = false;

    if (esPrimerClick) {
      setTimeout(() => {
        document.getElementById('paso-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }

  seleccionarMetodoPago(metodo: BonoMetodoPago): void {
    this.form.controls.metodo_pago.setValue(metodo);
  }

  continuarWhatsApp(): void {
    if (!this.servicioSeleccionado) {
      this.errorSinServicio = true;
      document.querySelector<HTMLElement>('.cards-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      setTimeout(() => {
        document.querySelector<HTMLElement>('.input-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    const v = this.form.getRawValue();
    const metodoPagoLabel = this.metodosPago.find(m => m.value === v.metodo_pago)?.label ?? v.metodo_pago;

    const lineas = [
      'Hola CBM 😊 Quiero regalar una experiencia a alguien especial 🎁',
      '',
      `🎁 Servicio: ${this.servicioSeleccionado.nombre_servicio} — ${this.servicioSeleccionado.precio}${this.servicioSeleccionado.unidad}`,
      `👤 Mi nombre: ${v.nombre_comprador}`,
      `📧 Mi email: ${v.email_comprador}`,
      `💳 Método de pago: ${metodoPagoLabel}`,
    ];
    if (v.mensaje_personal) {
      lineas.push(`💌 Mensaje para el receptor: ${v.mensaje_personal}`);
    }
    lineas.push('', '¿Podéis confirmarme los pasos a seguir? 💜');

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lineas.join('\n'))}`;

    // Abrir WhatsApp en contexto directo del click (antes de cualquier await)
    window.open(url, '_blank');

    // Guardar solicitud en background sin bloquear el flujo
    const codigo = this.bonosRegaloService.generarCodigo();
    void this.bonosRegaloService.createSolicitudBono({
      codigo,
      tarifa_id: this.servicioSeleccionado.id,
      nombre_servicio: this.servicioSeleccionado.nombre_servicio,
      precio: this.servicioSeleccionado.precio,
      nombre_comprador: v.nombre_comprador,
      email_comprador: v.email_comprador,
      mensaje_personal: v.mensaje_personal || null,
      estado: 'pendiente_pago',
      metodo_pago: v.metodo_pago
    }).catch(err => console.error('Error guardando solicitud bono:', err));
  }

}
