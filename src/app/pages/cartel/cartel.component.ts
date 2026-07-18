import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CARTEL_DISPLAY_ESTADOS,
  CartelEstadoId,
  ConfiguracionService,
} from '../../core/services/configuracion.service';
import { CartelVozResultado, interpretarComandoCartel } from './cartel-voz';

const CLAVE_STORAGE_KEY = 'cbm_cartel_clave';

/**
 * Mando a distancia del cartel de la ventana (/display/horizontal), pensado
 * para el móvil del equipo: clave compartida que se pide una sola vez por
 * dispositivo, botones grandes de un toque y dictado por voz.
 */
@Component({
  selector: 'app-cartel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cartel.component.html',
  styleUrls: ['./cartel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartelComponent implements OnInit, OnDestroy {
  readonly estados = CARTEL_DISPLAY_ESTADOS;
  readonly minutosRapidos = [5, 10, 15, 20, 30, 45];

  pantalla: 'clave' | 'panel' = 'clave';

  claveInput = '';
  claveError = '';
  validandoClave = false;

  estadoActivo: CartelEstadoId | null = null;
  tituloActivo = '';
  cargandoEstado = false;

  guardando = false;
  mensajeOk = '';
  errorGuardar = '';

  vozDisponible = false;
  escuchando = false;
  transcripcion = '';
  propuesta: CartelVozResultado | null = null;
  vozNoEntendida = '';

  private clave = '';
  private reconocimiento: SpeechRecognitionLike | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly configuracion: ConfiguracionService,
    private readonly cdr: ChangeDetectorRef,
    private readonly zone: NgZone,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.vozDisponible = getSpeechRecognitionCtor() !== null;

    const claveGuardada = localStorage.getItem(CLAVE_STORAGE_KEY);
    if (claveGuardada) {
      this.clave = claveGuardada;
      this.pantalla = 'panel';
      void this.cargarEstadoActual();
    }
  }

  ngOnDestroy(): void {
    this.detenerVoz();

    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  // ── Acceso con clave compartida ────────────────────────────────────────────

  async entrar(): Promise<void> {
    const clave = this.claveInput.trim();

    if (!clave || this.validandoClave) {
      return;
    }

    this.validandoClave = true;
    this.claveError = '';

    try {
      const valida = await this.configuracion.validarClaveCartel(clave);

      if (!valida) {
        this.claveError = 'Clave incorrecta 🙈 Vuelve a intentarlo';
        return;
      }

      this.clave = clave;
      localStorage.setItem(CLAVE_STORAGE_KEY, clave);
      this.pantalla = 'panel';
      this.claveInput = '';
      void this.cargarEstadoActual();
    } catch {
      this.claveError = 'No hay conexión ahora mismo. Prueba en unos segundos.';
    } finally {
      this.validandoClave = false;
      this.cdr.markForCheck();
    }
  }

  // ── Cambios de estado con un toque ─────────────────────────────────────────

  /** Estados directos (abierto, timbre, cerrado): un toque y guardado. */
  async ponerEstado(estado: CartelEstadoId): Promise<void> {
    await this.guardar(estado, '', '');
  }

  /** Chips de "Volvemos en X min": guarda con el título ya montado. */
  async ponerVolvemos(minutos: number): Promise<void> {
    const titulo = minutos === 1 ? 'Volvemos en 1 minuto' : `Volvemos en ${minutos} minutos`;
    await this.guardar('volvemos', titulo, '');
  }

  private async guardar(estado: CartelEstadoId, titulo: string, mensaje: string): Promise<void> {
    if (this.guardando) {
      return;
    }

    this.guardando = true;
    this.errorGuardar = '';
    this.mensajeOk = '';

    try {
      const ok = await this.configuracion.actualizarCartelConClave(
        this.clave,
        estado,
        titulo,
        mensaje,
      );

      if (!ok) {
        // La clave cambió desde que este móvil la guardó: se vuelve a pedir.
        this.cerrarSesion();
        this.claveError = 'La clave ha cambiado. Escribe la nueva.';
        return;
      }

      this.estadoActivo = estado;
      this.tituloActivo = titulo.trim() || this.preset(estado).titulo;
      this.mensajeOk = `${this.preset(estado).emoji} Cartel actualizado`;

      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
      }
      this.toastTimer = setTimeout(() => {
        this.mensajeOk = '';
        this.cdr.markForCheck();
      }, 3000);
    } catch {
      this.errorGuardar = 'No se pudo guardar. Revisa la conexión e inténtalo otra vez.';
    } finally {
      this.guardando = false;
      this.cdr.markForCheck();
    }
  }

  private async cargarEstadoActual(): Promise<void> {
    this.cargandoEstado = true;

    try {
      const cfg = await this.configuracion.getCartelDisplayConfig();
      this.estadoActivo = cfg.estado;
      this.tituloActivo = cfg.titulo.trim() || this.preset(cfg.estado).titulo;
    } catch {
      // Sin conexión: el panel sigue siendo usable, solo no marca el estado.
    } finally {
      this.cargandoEstado = false;
      this.cdr.markForCheck();
    }
  }

  private cerrarSesion(): void {
    localStorage.removeItem(CLAVE_STORAGE_KEY);
    this.clave = '';
    this.pantalla = 'clave';
  }

  preset(id: CartelEstadoId) {
    return this.estados.find((e) => e.id === id) ?? this.estados[0];
  }

  // ── Dictado por voz ────────────────────────────────────────────────────────

  alternarVoz(): void {
    if (this.escuchando) {
      this.detenerVoz();
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      return;
    }

    this.propuesta = null;
    this.vozNoEntendida = '';
    this.transcripcion = '';
    this.escuchando = true;

    const rec = new Ctor();
    this.reconocimiento = rec;
    rec.lang = 'es-ES';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event: SpeechRecognitionEventLike) => {
      this.zone.run(() => {
        let texto = '';
        for (let i = 0; i < event.results.length; i++) {
          texto += event.results[i][0].transcript;
        }
        this.transcripcion = texto.trim();
        this.cdr.markForCheck();
      });
    };

    rec.onerror = () => {
      this.zone.run(() => {
        this.escuchando = false;
        this.vozNoEntendida = 'No se pudo usar el micrófono. Usa los botones de abajo.';
        this.cdr.markForCheck();
      });
    };

    rec.onend = () => {
      this.zone.run(() => {
        this.escuchando = false;
        this.reconocimiento = null;

        if (this.transcripcion) {
          this.propuesta = interpretarComandoCartel(this.transcripcion);
          if (!this.propuesta) {
            this.vozNoEntendida = `He oído "${this.transcripcion}" pero no lo he entendido 🙈 Prueba con los botones.`;
          }
        }

        this.cdr.markForCheck();
      });
    };

    try {
      rec.start();
    } catch {
      this.escuchando = false;
      this.vozNoEntendida = 'No se pudo usar el micrófono. Usa los botones de abajo.';
    }
  }

  async aceptarPropuesta(): Promise<void> {
    if (!this.propuesta) {
      return;
    }

    const { estado, titulo } = this.propuesta;
    this.propuesta = null;
    this.transcripcion = '';

    // Los presets van con textos vacíos para que el display use sus defaults;
    // solo "volvemos en X" necesita el título montado con los minutos.
    await this.guardar(estado, estado === 'volvemos' ? titulo : '', '');
  }

  cancelarPropuesta(): void {
    this.propuesta = null;
    this.transcripcion = '';
  }

  private detenerVoz(): void {
    if (this.reconocimiento) {
      try {
        this.reconocimiento.stop();
      } catch {
        // El reconocimiento ya estaba parado.
      }
      this.reconocimiento = null;
    }
    this.escuchando = false;
  }
}

// ── Tipado mínimo de la Web Speech API (no está en lib.dom de TS) ────────────

interface SpeechRecognitionResultLike {
  0: { transcript: string };
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w['SpeechRecognition'] ?? w['webkitSpeechRecognition'] ?? null) as
    | (new () => SpeechRecognitionLike)
    | null;
}
