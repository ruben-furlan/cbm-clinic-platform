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
  async suscribir(email: string, origen: string): Promise<{ caso: 'nuevo' | 'yaExiste' }> {
    const emailNorm = email.toLowerCase().trim();

    // Buscar si ya existe (activo o no)
    const { data: existente } = await supabase
      .from('newsletter_suscriptores')
      .select('id, activo')
      .eq('email', emailNorm)
      .single();

    // CASO 1: No existe → insertar nuevo
    if (!existente) {
      const { error } = await supabase
        .from('newsletter_suscriptores')
        .insert({ email: emailNorm, activo: true, origen });
      if (error) throw error;
      return { caso: 'nuevo' };
    }

    // CASO 2: Existe y está activo → ya registrado
    if (existente.activo) {
      return { caso: 'yaExiste' };
    }

    // CASO 3: Existe pero inactivo (se dio de baja) → reactivar
    const { error } = await supabase
      .from('newsletter_suscriptores')
      .update({ activo: true, origen })
      .eq('id', existente.id);
    if (error) throw error;

    return { caso: 'nuevo' };
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

  async deleteSuscriptor(id: string): Promise<void> {
    const { error } = await supabase
      .from('newsletter_suscriptores')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error eliminando suscriptor newsletter:', error);
      throw error;
    }
  }

  async darDeBaja(email: string): Promise<void> {
    const emailNorm = email.toLowerCase().trim();

    const { data, error } = await supabase
      .from('newsletter_suscriptores')
      .update({ activo: false })
      .eq('email', emailNorm)
      .select();

    if (error) {
      console.error('Error baja newsletter:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('Baja newsletter: email no encontrado o RLS bloqueó el update:', emailNorm);
      throw new Error('Email no encontrado');
    }
  }

  getEmailsActivos(suscriptores: NewsletterSuscriptor[]): string[] {
    return suscriptores.filter((s) => s.activo).map((s) => s.email);
  }

  async enviarNewsletter(
    asunto: string,
    mensaje: string,
    emails: string[]
  ): Promise<{ enviados: number; errores: number }> {
    const response = await fetch('/.netlify/functions/send-newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asunto, mensaje, emails })
    });

    const data = await response.json() as { ok?: boolean; enviados?: number; errores?: number; error?: string };

    if (!response.ok) {
      throw new Error(data.error ?? 'Error al enviar');
    }

    return { enviados: data.enviados ?? 0, errores: data.errores ?? 0 };
  }
}
