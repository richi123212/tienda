import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://tu-proyecto.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Script SQL para inicializar Supabase
 */
export const SUPABASE_SQL_SCRIPT = `-- 1. Crear tabla de productos
CREATE TABLE IF NOT EXISTS public.productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio NUMERIC NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('Comida', 'Ropa Mujer', 'Ropa Hombre', 'Lucha Libre')),
  descripcion TEXT,
  imagen_url TEXT,
  tipo_envio TEXT DEFAULT 'Local' CHECK (tipo_envio IN ('Local', 'Nacional')),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- 3. Permitir lectura pública a cualquier visitante
CREATE POLICY "Lectura pública de productos"
ON public.productos FOR SELECT
USING (true);

-- 4. Permitir inserción y eliminación para administración
-- (Para uso directo o con autenticación)
CREATE POLICY "Gestión de productos"
ON public.productos FOR ALL
USING (true)
WITH CHECK (true);

-- NOTA: En la sección 'Storage' de Supabase, crea un Bucket llamado exactamente:
-- fotos-productos
-- y asegúrate de marcar la casilla "Public bucket" para que las fotos sean visibles.
`;
