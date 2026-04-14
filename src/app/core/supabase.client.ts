import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

let supabaseInstance: SupabaseClient | null = null;

try {
  supabaseInstance = createClient(environment.supabaseUrl, environment.supabaseKey);
} catch {
  // createClient lanza si supabaseUrl no es una URL HTTP/HTTPS válida.
  // Esto ocurre en entorno de desarrollo local o durante el prerender sin variables de entorno reales.
  // En Netlify las variables se inyectan via sed antes del build.
}

export const supabase = supabaseInstance as SupabaseClient;
