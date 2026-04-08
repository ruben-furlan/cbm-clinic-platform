import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export type ServicioRegaloCategoria = 'fisioterapia' | 'pilates' | 'promocion';

export interface ServicioRegalo {
  id: string;
  nombre_emotivo: string;
  nombre_servicio: string;
  descripcion?: string | null;
  precio: number;
  unidad: string;
  categoria: ServicioRegaloCategoria;
  activo: boolean;
  orden: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServiciosRegaloService {
  async getServiciosRegalo(): Promise<ServicioRegalo[]> {
    const { data, error } = await supabase
      .from('servicios_regalo')
      .select('*')
      .eq('activo', true)
      .order('categoria', { ascending: true })
      .order('orden', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as ServicioRegalo[];
  }

  async getAllServiciosRegalo(): Promise<ServicioRegalo[]> {
    const { data, error } = await supabase
      .from('servicios_regalo')
      .select('*')
      .order('categoria', { ascending: true })
      .order('orden', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as ServicioRegalo[];
  }

  async createServicioRegalo(data: Omit<ServicioRegalo, 'id'>): Promise<ServicioRegalo> {
    const { data: created, error } = await supabase
      .from('servicios_regalo')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return created as ServicioRegalo;
  }

  async updateServicioRegalo(id: string, cambios: Partial<Omit<ServicioRegalo, 'id'>>): Promise<ServicioRegalo> {
    const { data, error } = await supabase
      .from('servicios_regalo')
      .update(cambios)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data as ServicioRegalo;
  }

  async toggleActivo(id: string, valor: boolean): Promise<ServicioRegalo> {
    return this.updateServicioRegalo(id, { activo: valor });
  }

  async getServicioRegaloById(id: string): Promise<ServicioRegalo | null> {
    const { data, error } = await supabase
      .from('servicios_regalo')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return null;
    return (data as ServicioRegalo | null) ?? null;
  }

  async deleteServicioRegalo(id: string): Promise<{ desactivado: boolean }> {
    const { data: bonosAsociados } = await supabase
      .from('bonos_regalo')
      .select('id')
      .eq('servicio_regalo_id', id)
      .limit(1);

    if (bonosAsociados && bonosAsociados.length > 0) {
      const { error } = await supabase
        .from('servicios_regalo')
        .update({ activo: false })
        .eq('id', id);
      if (error) throw error;
      return { desactivado: true };
    }

    const { error } = await supabase
      .from('servicios_regalo')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { desactivado: false };
  }
}
