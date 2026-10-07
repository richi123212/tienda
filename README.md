# MERCADO & BOUTIQUE 

Plataforma web de catálogo y pedidos por WhatsApp para cocina artesanal y moda exclusiva. Diseñada con alta estética editorial, cero emojis y costos $0 de mantenimiento.

---

## 3 Piezas del Sistema ($0 Pesos)

1. **Frontend en Vercel (Gratis):** Hospedaje ultra-rápido con HTTPS y conexión automática a GitHub.
2. **Supabase (Gratis):** Base de datos PostgreSQL para productos, autenticación y Storage (`fotos-productos`) para subir imágenes desde el celular.
3. **Pedidos por WhatsApp (Gratis):** Sin comisiones de pasarelas de pago; los clientes envían su pedido detallado con un clic para coordinar transferencias SPEI o pago en efectivo.

---

## Cómo Probar en tu Computadora (Local)

1. Abre la terminal en esta carpeta.
2. Ejecuta:
   ```bash
   npm run dev
   ```
3. Abre el enlace que aparece en pantalla (normalmente `http://localhost:5173`).

---

## Configuración de Supabase (2 minutos)

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto nuevo gratuito.
2. Ve a la pestaña **SQL Editor** en el menú izquierdo, pega el siguiente script y pulsa **Run**:

```sql
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

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de productos"
ON public.productos FOR SELECT
USING (true);

CREATE POLICY "Gestión de productos"
ON public.productos FOR ALL
USING (true)
WITH CHECK (true);
```

3. Ve a la pestaña **Storage**, crea un Bucket llamado `fotos-productos` y marca la casilla **Public bucket**.
4. En la raíz de tu proyecto, copia `.env.example` a `.env.local` y coloca tus claves:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_WHATSAPP_NUMBER=525512345678
```

---

## Cómo Subir a GitHub (Paso a Paso para Principiantes)

1. En tu terminal de PowerShell dentro de esta carpeta, inicializa Git:
   ```bash
   git init
   git add .
   git commit -m "Primera version tienda boutique"
   ```

2. Entra a [github.com](https://github.com), crea una cuenta o inicia sesión, y haz clic en el botón verde **"New"** (Nuevo Repositorio).
   * Nombre sugerido: `tienda-boutique-ropa-comida`
   * Déjalo público o privado (a tu gusto).

3. Copia el comando que te da GitHub y ejecútalo en tu terminal:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/tienda-boutique-ropa-comida.git
   git push -u origin main
   ```

---

## Cómo Publicar en Vercel ($0 Pesos)

1. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New..." -> "Project"**.
3. Selecciona tu repositorio recién subido (`tienda-boutique-ropa-comida`).
4. En la sección **Environment Variables**, agrega las mismas variables:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
   * `VITE_WHATSAPP_NUMBER`
5. Haz clic en **"Deploy"**. En 60 segundos tendrás tu enlace público con candado de seguridad SSL.
