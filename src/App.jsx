import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import AdminModal from './components/AdminModal';
import Footer from './components/Footer';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { supabase, isSupabaseConfigured } from './supabase';
import { Search, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Todas', 'Comida', 'Ropa Mujer', 'Ropa Hombre', 'Lucha Libre'];

export default function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('catalogo_productos');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    return localStorage.getItem('whatsapp_ventas') || 
           import.meta.env.VITE_WHATSAPP_NUMBER || 
           '525500000000';
  });

  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Carrito / Bolsa
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('carrito_bolsa');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Modal Admin / Login
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Cargar y sincronizar con Supabase en tiempo real
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      async function syncSupabase() {
        try {
          const { data, error } = await supabase
            .from('productos')
            .select('*')
            .order('creado_en', { ascending: false });

          if (!error && data) {
            if (data.length > 0) {
              setProducts(data);
            } else {
              // Si la base de datos en Supabase está vacía, sembramos los productos iniciales
              const seedData = INITIAL_PRODUCTS.map(({ id, ...rest }) => rest);
              const { data: seeded } = await supabase
                .from('productos')
                .insert(seedData)
                .select();
              if (seeded && seeded.length > 0) {
                setProducts(seeded);
              }
            }
          }
        } catch (err) {
          console.warn('Error sincronizando con Supabase, usando estado local:', err);
        }
      }

      syncSupabase();

      // Suscripción en tiempo real: si agregas desde el celular, se actualiza en la PC al instante
      const channel = supabase
        .channel('productos_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'productos' },
          () => {
            syncSupabase();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Persistir en localStorage
  useEffect(() => {
    localStorage.setItem('catalogo_productos', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('carrito_bolsa', JSON.stringify(cart));
  }, [cart]);

  // Manejar Carrito
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Manejar Administración de Productos
  const handleAddProduct = async (newProduct, imageFile) => {
    let finalImageUrl = newProduct.imagen_url;

    if (isSupabaseConfigured && supabase && imageFile) {
      try {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('fotos-productos')
          .upload(filePath, imageFile, {
            contentType: imageFile.type,
            upsert: false
          });

        if (!uploadError) {
          const { data } = supabase.storage
            .from('fotos-productos')
            .getPublicUrl(filePath);
          if (data?.publicUrl) {
            finalImageUrl = data.publicUrl;
          }
        }
      } catch (err) {
        console.error('Error al subir a Supabase Storage:', err);
      }
    }

    const readyProduct = { ...newProduct, imagen_url: finalImageUrl };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: insertedData, error: insertError } = await supabase.from('productos').insert([{
          nombre: readyProduct.nombre,
          precio: readyProduct.precio,
          categoria: readyProduct.categoria,
          descripcion: readyProduct.descripcion,
          tipo_envio: readyProduct.tipo_envio,
          imagen_url: readyProduct.imagen_url
        }]).select();

        if (!insertError && insertedData?.[0]) {
          setProducts((prev) => [insertedData[0], ...prev]);
          return;
        }
      } catch (err) {
        console.error('Error guardando en Supabase DB:', err);
      }
    }

    setProducts((prev) => [readyProduct, ...prev]);
  };

  const handleDeleteProduct = async (id) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('productos').delete().eq('id', id);
      } catch (err) {
        console.error('Error borrando en Supabase:', err);
      }
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveWhatsAppNumber = (num) => {
    setWhatsappNumber(num);
    localStorage.setItem('whatsapp_ventas', num);
  };

  // Filtrado de productos
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Todas' || p.categoria === selectedCategory;
    const matchesSearch = 
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="site-wrapper">
      {/* Cabecera */}
      <Header 
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Hero Section Limpio */}
      <section className="hero-banner">
        <h2 className="hero-title">
          Colección de Moda & <em>Cocina Artesanal</em>
        </h2>

        <p className="hero-description">
          Platillos preparados al momento, prendas de autor y artículos de lucha libre. Haz tu pedido directo por WhatsApp.
        </p>
      </section>

      {/* Filtros de Categorías y Buscador */}
      <section className="filters-section" id="catalogo">
        <div className="tabs-wrapper">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <div className="search-filter-bar">
          <div className="search-input-box">
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Buscar por prenda, corte, platillo o material..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="items-counter">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'artículo' : 'artículos'}
          </span>
        </div>
      </section>

      {/* Catálogo de Productos */}
      <main className="products-container">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No se encontraron artículos en esta categoría o búsqueda.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                whatsappNumber={whatsappNumber}
                onAddToCart={handleAddToCart}
                isInCart={cart.some((item) => item.id === product.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bolsa de Pedidos Lateral */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        whatsappNumber={whatsappNumber}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* Modal Admin con Login */}
      <AdminModal 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        whatsappNumber={whatsappNumber}
        onSaveWhatsAppNumber={handleSaveWhatsAppNumber}
      />

      {/* Pie de página */}
      <Footer 
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalogo');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />
    </div>
  );
}
