import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

interface ConfiguracionRow {
  id: string;
  clave: string;
  valor: string;
  descripcion?: string | null;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
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
    const { error } = await supabase
      .from('configuracion')
      .upsert(payload, { onConflict: 'clave' });

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
        'banner_anuncio_color_texto'
      ]);

    const cfg: Record<string, string> = {};
    data?.forEach(item => { cfg[item.clave] = item.valor; });

    return {
      activo: cfg['banner_anuncio_activo'] === 'true',
      emoji: cfg['banner_anuncio_emoji'] ?? '💜',
      texto: cfg['banner_anuncio_texto'] ?? '',
      enlaceTexto: cfg['banner_anuncio_enlace_texto'] ?? '',
      enlaceUrl: cfg['banner_anuncio_enlace_url'] ?? '/',
      colorFondo: cfg['banner_anuncio_color_fondo'] ?? 'linear-gradient(135deg, #e879a8, #a78bfa)',
      colorTexto: cfg['banner_anuncio_color_texto'] ?? '#ffffff'
    };
  }
}
