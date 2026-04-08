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
}
