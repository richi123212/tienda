import { createClient } from '@supabase/supabase-js';

// URL y Clave Anónima de Supabase con fallback directo a la base de datos oficial de Universo Bonito
const DEFAULT_SUPABASE_URL = 'https://wcgxwqctbetjrfyivvxu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjZ3h3cWN0YmV0anJmeWl2dnh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzOTAzMjUsImV4cCI6MjEwNjk2NjMyNX0.ZPckL9ciQbdUf5NVg5ryzK-MZ2QRxqNmbw_Y1AuYKXQ';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://tu-proyecto.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Función para subir fotos de productos al Bucket público de Supabase
 */
export async function uploadProductPhoto(file, slotIndex = 0) {
  if (!file || !supabase) return null;
  try {
    const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
    const fileName = `producto-${Date.now()}-${slotIndex}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('fotos-productos')
      .upload(fileName, file, { 
        contentType: file.type || 'image/jpeg', 
        upsert: true 
      });

    if (uploadError) {
      console.error('Error al subir foto de producto a Supabase Storage:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('fotos-productos').getPublicUrl(fileName);
    return data?.publicUrl || null;
  } catch (err) {
    console.error('Excepción al subir foto a Supabase:', err);
    return null;
  }
}

/**
 * Función para subir imágenes de banners al Bucket público de Supabase
 */
export async function uploadBannerPhoto(file) {
  if (!file || !supabase) return null;
  try {
    const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
    const fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('fotos-productos')
      .upload(fileName, file, { 
        contentType: file.type || 'image/jpeg', 
        upsert: true 
      });

    if (uploadError) {
      console.error('Error al subir imagen de banner a Supabase Storage:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('fotos-productos').getPublicUrl(fileName);
    return data?.publicUrl || null;
  } catch (err) {
    console.error('Excepción al subir banner a Supabase:', err);
    return null;
  }
}
