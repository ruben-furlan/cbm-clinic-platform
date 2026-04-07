import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

interface DatosConfirmacion {
  nombre_emotivo: string;
  nombre_servicio: string;
  nombre_comprador: string;
  email_comprador: string;
  telefono: string;
  metodo_pago_label: string;
  tiene_mensaje: boolean;
}

@Component({
  selector: 'app-regalo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './regalo.component.html',
  styleUrl: './regalo.component.css'
})
export class RegaloComponent implements OnInit {
  bonosActivo = false;
  cargando = true;
  servicios: ServicioRegalo[] = [];
  servicioSeleccionado: ServicioRegalo | null = null;
  errorSinServicio = false;

  guardando = false;
  confirmado = false;
  errorGuardando = false;
  datosConfirmacion: DatosConfirmacion | null = null;

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
      telefono: ['', [Validators.required, Validators.pattern(/^[+\d\s\-().]{6,20}$/)]],
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
      this.bonosActivo = valor === 'true';
    } catch (err) {
      console.error('Error leyendo config bonos:', err);
      this.bonosActivo = false;
      this.cargando = false;
      return;
    }

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

  async reservarRegalo(): Promise<void> {
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

    this.guardando = true;
    this.errorGuardando = false;

    const v = this.form.getRawValue();
    const metodoPagoLabel = this.metodosPago.find(m => m.value === v.metodo_pago)?.label ?? v.metodo_pago;
    const codigo = this.bonosRegaloService.generarCodigo();

    try {
      await this.bonosRegaloService.createSolicitudBono({
        codigo,
        servicio_regalo_id: this.servicioSeleccionado.id,
        nombre_servicio: this.servicioSeleccionado.nombre_servicio,
        nombre_emotivo: this.servicioSeleccionado.nombre_emotivo,
        precio: this.servicioSeleccionado.precio,
        nombre_comprador: v.nombre_comprador,
        email_comprador: v.email_comprador,
        telefono: v.telefono,
        mensaje_personal: v.mensaje_personal || null,
        estado: 'pendiente_pago',
        metodo_pago: v.metodo_pago
      });

      this.datosConfirmacion = {
        nombre_emotivo: this.servicioSeleccionado.nombre_emotivo,
        nombre_servicio: this.servicioSeleccionado.nombre_servicio,
        nombre_comprador: v.nombre_comprador,
        email_comprador: v.email_comprador,
        telefono: v.telefono,
        metodo_pago_label: metodoPagoLabel,
        tiene_mensaje: !!v.mensaje_personal
      };
      this.confirmado = true;

    } catch (err) {
      console.error('Error guardando solicitud bono:', err);
      this.errorGuardando = true;
    } finally {
      this.guardando = false;
    }
  }

  whatsAppFallbackUrl(): string {
    if (!this.servicioSeleccionado) return `https://wa.me/${WHATSAPP_PHONE}`;
    const v = this.form.getRawValue();
    const lines = [
      'Hola CBM 😊 Quiero reservar un bono regalo.',
      `Servicio: ${this.servicioSeleccionado.nombre_servicio}`,
      `Mi nombre: ${v.nombre_comprador}`,
      `Mi email: ${v.email_comprador}`,
      '¿Podéis confirmarme los pasos? 💜'
    ];
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  whatsAppConfirmacionUrl(): string {
    if (!this.datosConfirmacion) return `https://wa.me/${WHATSAPP_PHONE}`;
    const d = this.datosConfirmacion;
    const lines = [
      `Hola CBM 😊 Acabo de reservar un bono regalo para ${d.nombre_servicio}.`,
      `Mi nombre es ${d.nombre_comprador} y mi email es ${d.email_comprador}.`,
      '¿Podéis confirmarme los pasos? 💜'
    ];
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
  }
}
