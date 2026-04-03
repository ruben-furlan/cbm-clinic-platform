import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export interface Faq {
  id: string;
  pregunta: string;
  respuesta: string;
  activo: boolean;
  orden: number;
}

@Injectable({
  providedIn: 'root'
})
export class FaqsService {
  async getFaqs(): Promise<Faq[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as Faq[];
  }

  async getAllFaqs(): Promise<Faq[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('orden', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as Faq[];
  }

  async createFaq(data: Omit<Faq, 'id'>): Promise<Faq> {
    const { data: created, error } = await supabase
      .from('faqs')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return created as Faq;
  }

  async updateFaq(id: string, cambios: Partial<Omit<Faq, 'id'>>): Promise<Faq> {
    const { data, error } = await supabase
      .from('faqs')
      .update(cambios)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data as Faq;
  }

  async toggleActivo(id: string, valor: boolean): Promise<Faq> {
    return this.updateFaq(id, { activo: valor });
  }

  async deleteFaq(id: string): Promise<void> {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}