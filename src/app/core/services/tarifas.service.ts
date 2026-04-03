import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export type TarifaCategoria = 'fisioterapia' | 'pilates' | 'promocion';
export type TarifaUnidad = '€' | '€/mes';

export interface Tarifa {
  id: string;
  categoria: TarifaCategoria;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  unidad: TarifaUnidad;
  activo: boolean;
  orden: number;
  fecha_fin_promo?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TarifasService {
  async getTarifas(): Promise<Tarifa[]> {
    const { data, error } = await supabase
      .from('tarifas')
      .select('*')
      .eq('activo', true)
      .order('categoria', { ascending: true })
      .order('orden', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as Tarifa[];
  }

  async getTarifasByCategoria(categoria: TarifaCategoria): Promise<Tarifa[]> {
    const { data, error } = await supabase
      .from('tarifas')
      .select('*')
      .eq('categoria', categoria)
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as Tarifa[];
  }

  async getTarifasAdmin(categoria?: TarifaCategoria): Promise<Tarifa[]> {
    const query = supabase
      .from('tarifas')
      .select('*')
      .order('categoria', { ascending: true })
      .order('orden', { ascending: true });

    const { data, error } = categoria
      ? await query.eq('categoria', categoria)
      : await query;

    if (error) {
      throw error;
    }

    return (data ?? []) as Tarifa[];
  }

  async createTarifa(data: Omit<Tarifa, 'id'>): Promise<Tarifa> {
    const { data: created, error } = await supabase
      .from('tarifas')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return created as Tarifa;
  }

  async updateTarifa(id: string, cambios: Partial<Omit<Tarifa, 'id'>>): Promise<Tarifa> {
    const { data, error } = await supabase
      .from('tarifas')
      .update(cambios)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data as Tarifa;
  }

  async toggleActivo(id: string, valor: boolean): Promise<Tarifa> {
    return this.updateTarifa(id, { activo: valor });
  }

  async deleteTarifa(id: string): Promise<void> {
    const { error } = await supabase
      .from('tarifas')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}
