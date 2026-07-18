import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

interface ConfiguracionRow {
  id: string;
  clave: string;
  valor: string;
  descripcion?: string | null;
  updated_at?: string;
}

export type CartelEstadoId = 'abierto' | 'timbre' | 'volvemos' | 'cerrado';

export interface CartelEstadoPreset {
  id: CartelEstadoId;
  label: string;
  emoji: string;
  titulo: string;
  mensaje: string;
  tema: CartelEstadoId;
}

/**
 * Estados predefinidos del cartel de la ventana (/display/horizontal).
 * Fuente única compartida entre el panel de admin y la pantalla.
 * El admin elige uno y, opcionalmente, sobrescribe título y mensaje con texto libre.
 */
export const CARTEL_DISPLAY_ESTADOS: CartelEstadoPreset[] = [
  {
    id: 'abierto',
    label: 'Abierto',
    emoji: '🟢',
    titulo: '¡Estamos abiertos!',
    mensaje: 'Entra, te atendemos con una sonrisa',
    tema: 'abierto',
  },
  {
    id: 'timbre',
    label: 'Toca el timbre',
    emoji: '🔔',
    titulo: 'Toca el timbre',
    mensaje: 'Estamos dentro atendiendo · Te abrimos enseguida',
    tema: 'timbre',
  },
  {
    id: 'volvemos',
    label: 'Volvemos en 5 min',
    emoji: '⏱️',
    titulo: 'Volvemos en 5 minutos',
    mensaje: 'Estamos aquí al lado · Espéranos un momentito',
    tema: 'volvemos',
  },
  {
    id: 'cerrado',
    label: 'Cerrado por hoy',
    emoji: '💤',
    titulo: 'Cerrado por hoy',
    mensaje: '¡Gracias por tu visita! Te esperamos mañana',
    tema: 'cerrado',
  },
];

export interface CartelDisplayConfig {
  estado: CartelEstadoId;
  titulo: string;
  mensaje: string;
}

/** Calendario Calendly público por defecto (fallback si no hay valor en la BD). */
export const DEFAULT_PUBLIC_CALENDLY_URL =
  'https://calendly.com/reservascbm25/cita-cbm-fisioterapia?primary_color=c44b8e&hide_gdpr_banner=1&hide_landing_page_details=1&hide_event_type_details=1';

/**
 * Modo de cobro de la seña de reserva.
 * activo=true  → pago por la web (Calendly + Stripe).
 * activo=false → Calendly free solo agenda; la seña se cobra manualmente
 *                (transferencia o link de pago enviado por WhatsApp).
 */
export interface PagoWebConfig {
  activo: boolean;
  calendlyUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionService {
  async getConfiguracion(clave: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('configuracion')
      .select('valor')
      .eq('clave', clave)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.valor ?? null;
  }

  async updateConfiguracion(clave: string, valor: string): Promise<void> {
    const payload: Pick<ConfiguracionRow, 'clave' | 'valor'> = { clave, valor };
    const { error } = await supabase.from('configuracion').upsert(payload, { onConflict: 'clave' });

    if (error) {
      throw error;
    }
  }

  async isBonosRegaloActivo(): Promise<boolean> {
    const valor = await this.getConfiguracion('bonos_regalo_activo');
    return valor === 'true';
  }

  async getBannerAnuncioConfig(): Promise<{
    activo: boolean;
    emoji: string;
    texto: string;
    enlaceTexto: string;
    enlaceUrl: string;
    colorFondo: string;
    colorTexto: string;
  }> {
    const { data } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', [
        'banner_anuncio_activo',
        'banner_anuncio_emoji',
        'banner_anuncio_texto',
        'banner_anuncio_enlace_texto',
        'banner_anuncio_enlace_url',
        'banner_anuncio_color_fondo',
        'banner_anuncio_color_texto',
      ]);

    const cfg: Record<string, string> = {};
    data?.forEach((item) => {
      cfg[item.clave] = item.valor;
    });

    return {
      activo: cfg['banner_anuncio_activo'] === 'true',
      emoji: cfg['banner_anuncio_emoji'] ?? '💜',
      texto: cfg['banner_anuncio_texto'] ?? '',
      enlaceTexto: cfg['banner_anuncio_enlace_texto'] ?? '',
      enlaceUrl: cfg['banner_anuncio_enlace_url'] ?? '/',
      colorFondo: cfg['banner_anuncio_color_fondo'] ?? 'linear-gradient(135deg, #e879a8, #a78bfa)',
      colorTexto: cfg['banner_anuncio_color_texto'] ?? '#ffffff',
    };
  }

  async getPagoWebConfig(): Promise<PagoWebConfig> {
    const { data } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['pago_web_activo', 'pago_web_calendly_url']);

    const cfg: Record<string, string> = {};
    data?.forEach((item) => {
      cfg[item.clave] = item.valor;
    });

    return {
      // Si la clave no existe todavía, el modo por defecto es pago por la web
      activo: cfg['pago_web_activo'] !== 'false',
      calendlyUrl: cfg['pago_web_calendly_url']?.trim() || DEFAULT_PUBLIC_CALENDLY_URL,
    };
  }

  async getCartelDisplayConfig(): Promise<CartelDisplayConfig> {
    const { data } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['display_cartel_estado', 'display_cartel_titulo', 'display_cartel_mensaje']);

    const cfg: Record<string, string> = {};
    data?.forEach((item) => {
      cfg[item.clave] = item.valor;
    });

    const estado = cfg['display_cartel_estado'] as CartelEstadoId;

    return {
      estado: CARTEL_DISPLAY_ESTADOS.some((e) => e.id === estado) ? estado : 'volvemos',
      titulo: cfg['display_cartel_titulo'] ?? '',
      mensaje: cfg['display_cartel_mensaje'] ?? '',
    };
  }
}
