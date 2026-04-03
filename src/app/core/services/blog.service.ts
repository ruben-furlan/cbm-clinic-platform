import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

export type BlogContentBlockType = 'parrafo' | 'subtitulo' | 'lista' | 'cta';

export interface BlogContentBlock {
  tipo: BlogContentBlockType;
  texto?: string;
  items?: string[];
}

export interface BlogPost {
  id: string;
  categoria: string;
  titulo: string;
  resumen: string;
  contenido: BlogContentBlock[];
  destacado: boolean;
  activo: boolean;
  orden: number;
  slug: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  async getPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as BlogPost[];
  }

  async getPostDestacado(): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('activo', true)
      .eq('destacado', true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as BlogPost | null;
  }

  async getPostsByCategoria(categoria: string): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('activo', true)
      .eq('categoria', categoria)
      .order('orden', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as BlogPost[];
  }

  async getAllPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('orden', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []) as BlogPost[];
  }

  async createPost(data: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    const { data: created, error } = await supabase
      .from('blog_posts')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return created as BlogPost;
  }

  async updatePost(id: string, cambios: Partial<Omit<BlogPost, 'id'>>): Promise<BlogPost> {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(cambios)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data as BlogPost;
  }

  async toggleActivo(id: string, valor: boolean): Promise<BlogPost> {
    return this.updatePost(id, { activo: valor });
  }

  async toggleDestacado(id: string, valor: boolean): Promise<BlogPost> {
    return this.updatePost(id, { destacado: valor });
  }

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}
