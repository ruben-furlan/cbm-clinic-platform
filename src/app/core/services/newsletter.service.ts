import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export interface NewsletterSuscriptor {
  id: string;
  email: string;
  activo: boolean;
  origen: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  async suscribir(email: string, origen: string): Promise<void> {
    const { error } = await supabase
      .from('newsletter_suscriptores')
      .insert({ email: email.toLowerCase().trim(), origen });

    // Ignorar silenciosamente el error de email duplicado (código 23505)
    if (error && error.code !== '23505') {
      throw error;
    }
  }

  async getAllSuscriptores(): Promise<NewsletterSuscriptor[]> {
    const { data, error } = await supabase
      .from('newsletter_suscriptores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as NewsletterSuscriptor[];
  }

  async toggleActivo(id: string, valor: boolean): Promise<void> {
    const { error } = await supabase
      .from('newsletter_suscriptores')
      .update({ activo: valor })
      .eq('id', id);

    if (error) throw error;
  }
}
