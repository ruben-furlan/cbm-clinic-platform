import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export type BonoEstado = 'pendiente_pago' | 'pagado' | 'enviado' | 'canjeado';
export type BonoMetodoPago = 'bizum' | 'transferencia' | 'efectivo';

export interface BonoRegalo {
  id: string;
  codigo: string;
  servicio_regalo_id: string;
  nombre_servicio: string;
  nombre_emotivo: string;
  precio: number;
  nombre_comprador: string;
  email_comprador: string;
  telefono: string;
  mensaje_personal?: string | null;
  estado: BonoEstado;
  metodo_pago: BonoMetodoPago;
  fecha_compra: string;
  fecha_canje?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BonosRegaloService {
  async getBonosByCodigo(codigo: string): Promise<BonoRegalo | null> {
    const { data, error } = await supabase
      .from('bonos_regalo')
      .select('*')
      .eq('codigo', codigo.toUpperCase().trim())
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as BonoRegalo | null) ?? null;
  }

  async createSolicitudBono(data: Omit<BonoRegalo, 'id' | 'fecha_compra' | 'fecha_canje'>): Promise<BonoRegalo> {
    const { data: created, error } = await supabase
      .from('bonos_regalo')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return created as BonoRegalo;
  }

  async getAllBonos(): Promise<BonoRegalo[]> {
    const { data, error } = await supabase
      .from('bonos_regalo')
      .select('*')
      .order('fecha_compra', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as BonoRegalo[];
  }

  async updateEstado(id: string, estado: BonoEstado): Promise<BonoRegalo> {
    const { data, error } = await supabase
      .from('bonos_regalo')
      .update({ estado })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data as BonoRegalo;
  }

  async canjearBono(codigo: string): Promise<BonoRegalo> {
    const { data, error } = await supabase
      .from('bonos_regalo')
      .update({ estado: 'canjeado', fecha_canje: new Date().toISOString() })
      .eq('codigo', codigo.toUpperCase().trim())
      .in('estado', ['pagado', 'enviado'])
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data as BonoRegalo;
  }

  async deleteBono(id: string): Promise<void> {
    const { error } = await supabase
      .from('bonos_regalo')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  generarCodigo(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const chunk = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `CBM-${chunk()}-${chunk()}`;
  }
}
