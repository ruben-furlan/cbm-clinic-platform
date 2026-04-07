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

  async deleteServicioRegalo(id: string): Promise<void> {
    const { error } = await supabase
      .from('servicios_regalo')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}
