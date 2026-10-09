import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import AdminModal from './components/AdminModal';
import Footer from './components/Footer';
import BannerSlider from './components/BannerSlider';
import LotesShowcase from './components/LotesShowcase';
import LightboxModal from './components/LightboxModal';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CATEGORIES, 
  INITIAL_BANNERS, 
  INITIAL_SOCIAL_LINKS, 
  INITIAL_FOOD_SCHEDULE,
  DEFAULT_WHATSAPP_TEMPLATE,
  INITIAL_LOTES_CONFIG
} from './data/initialProducts';
import { supabase, isSupabaseConfigured, uploadProductPhoto, uploadBannerPhoto } from './supabase';
import { Search, AlertCircle, ChevronLeft, ChevronRight, ArrowRight, Truck, ShieldCheck, HeartHandshake } from 'lucide-react';

const ITEMS_PER_PAGE = 6;

export default function App() {
  // 1. Productos
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('catalogo_productos');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // 2. Categorías dinámicas
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('catalogo_categorias');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // 3. Banners Horizontales
  const [banners, setBanners] = useState(() => {
    const saved = localStorage.getItem('catalogo_banners');
    return saved ? JSON.parse(saved) : INITIAL_BANNERS;
  });

  // 4. Redes Sociales
  const [socialLinks, setSocialLinks] = useState(() => {
    const saved = localStorage.getItem('tienda_social_links');
    return saved ? JSON.parse(saved) : INITIAL_SOCIAL_LINKS;
  });

  // 5. Horario de Comida
  const [foodSchedule, setFoodSchedule] = useState(() => {
    const saved = localStorage.getItem('tienda_horario_comida');
    return saved ? JSON.parse(saved) : INITIAL_FOOD_SCHEDULE;
  });

  // 6. WhatsApp Oficial
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    return localStorage.getItem('whatsapp_ventas') || 
           import.meta.env.VITE_WHATSAPP_NUMBER || 
           '525620068886';
  });

  // 7. Plantilla de Mensaje de Pedido para WhatsApp
  const [whatsappTemplate, setWhatsappTemplate] = useState(() => {
    return localStorage.getItem('whatsapp_mensaje_plantilla') || DEFAULT_WHATSAPP_TEMPLATE;
  });

  // 8. Configuración Dinámica de Lotes de Ropa
  const [lotesConfig, setLotesConfig] = useState(() => {
    const saved = localStorage.getItem('tienda_config_lotes');
    return saved ? JSON.parse(saved) : INITIAL_LOTES_CONFIG;
  });

  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Carrito / Bolsa
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('carrito_bolsa');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Modal Admin
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Modal Lightbox para ver volantes / banners en pantalla completa
  const [lightboxData, setLightboxData] = useState({
    isOpen: false,
    url: '',
    title: ''
  });

  // Cargar y sincronizar con Supabase en tiempo real (Productos, Categorías, Banners y Configuración)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Sincronizar Productos
    async function syncProducts() {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .order('creado_en', { ascending: false });

        if (!error && data && data.length > 0) {
          setProducts(data);
          localStorage.setItem('catalogo_productos', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Error sincronizando productos con Supabase:', err);
      }
    }

    // Sincronizar Categorías
    async function syncCategories() {
      try {
        const { data, error } = await supabase
          .from('categorias')
          .select('*')
          .order('orden', { ascending: true });

        if (!error && data && data.length > 0) {
          const catNames = data.map(c => c.nombre);
          setCategories(catNames);
          localStorage.setItem('catalogo_categorias', JSON.stringify(catNames));
        }
      } catch (err) {
        console.warn('Error sincronizando categorías con Supabase:', err);
      }
    }

    // Sincronizar Banners
    async function syncBanners() {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('*')
          .order('creado_en', { ascending: false });

        if (!error && data && data.length > 0) {
          setBanners(data);
          localStorage.setItem('catalogo_banners', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Error sincronizando banners con Supabase:', err);
      }
    }

    // Sincronizar Configuración General
    async function syncConfig() {
      try {
        const { data, error } = await supabase
          .from('tienda_config')
          .select('*');

        if (!error && data && data.length > 0) {
          data.forEach(({ clave, valor }) => {
            if (clave === 'whatsapp_ventas' && valor) {
              setWhatsappNumber(valor);
              localStorage.setItem('whatsapp_ventas', valor);
            }
            if (clave === 'whatsapp_mensaje_plantilla' && valor) {
              setWhatsappTemplate(valor);
              localStorage.setItem('whatsapp_mensaje_plantilla', valor);
            }
            if (clave === 'tienda_social_links' && valor) {
              setSocialLinks(valor);
              localStorage.setItem('tienda_social_links', JSON.stringify(valor));
            }
            if (clave === 'tienda_horario_comida' && valor) {
              setFoodSchedule(valor);
              localStorage.setItem('tienda_horario_comida', JSON.stringify(valor));
            }
            if (clave === 'tienda_config_lotes' && valor) {
              setLotesConfig(valor);
              localStorage.setItem('tienda_config_lotes', JSON.stringify(valor));
            }
          });
        }
      } catch (err) {
        console.warn('Error sincronizando configuración con Supabase:', err);
      }
    }

    // Carga inicial directa
    syncProducts();
    syncCategories();
    syncBanners();
    syncConfig();

    // Canales de Realtime para escuchar cambios de inmediato
    const channelProds = supabase
      .channel('prods_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, syncProducts)
      .subscribe();

    const channelCats = supabase
      .channel('cats_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, syncCategories)
      .subscribe();

    const channelBanners = supabase
      .channel('banners_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, syncBanners)
      .subscribe();

    const channelConfig = supabase
      .channel('config_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tienda_config' }, syncConfig)
      .subscribe();

    return () => {
      supabase.removeChannel(channelProds);
      supabase.removeChannel(channelCats);
      supabase.removeChannel(channelBanners);
      supabase.removeChannel(channelConfig);
    };
  }, []);

  // Persistencia de respaldo en localStorage
  useEffect(() => {
    localStorage.setItem('catalogo_productos', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('catalogo_categorias', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('catalogo_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('tienda_social_links', JSON.stringify(socialLinks));
  }, [socialLinks]);

  useEffect(() => {
    localStorage.setItem('tienda_horario_comida', JSON.stringify(foodSchedule));
  }, [foodSchedule]);

  useEffect(() => {
    localStorage.setItem('carrito_bolsa', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Manejo de Categorías Dinámicas con persistencia en Supabase
  const handleAddCategory = async (newCat) => {
    setCategories((prev) => [...prev, newCat]);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('categorias').insert([{ nombre: newCat, orden: categories.length }]);
      } catch (err) {
        console.error('Error insertando categoría en Supabase:', err);
      }
    }
  };

  const handleDeleteCategory = async (catToDelete) => {
    setCategories((prev) => prev.filter(c => c !== catToDelete));
    if (selectedCategory === catToDelete) {
      setSelectedCategory('Todas');
    }
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('categorias').delete().eq('nombre', catToDelete);
      } catch (err) {
        console.error('Error borrando categoría en Supabase:', err);
      }
    }
  };

  // Manejo de Banners Horizontales con subida de fotos a Supabase
  const handleAddBanner = async (newBanner, bannerFile = null) => {
    let finalImageUrl = newBanner.imagen_url;

    if (bannerFile && isSupabaseConfigured && supabase) {
      const publicUrl = await uploadBannerPhoto(bannerFile);
      if (publicUrl) {
        finalImageUrl = publicUrl;
      }
    }

    const readyBanner = { ...newBanner, imagen_url: finalImageUrl };
    setBanners((prev) => [readyBanner, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('banners').insert([{
          id: readyBanner.id,
          titulo: readyBanner.titulo,
          subtitulo: readyBanner.subtitulo || '',
          imagen_url: readyBanner.imagen_url,
          activo: readyBanner.activo !== false,
          enlace: readyBanner.categoria_destino || readyBanner.enlace || ''
        }]);
      } catch (err) {
        console.error('Error guardando banner en Supabase:', err);
      }
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    setBanners((prev) => prev.filter(b => b.id !== bannerId));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('banners').delete().eq('id', bannerId);
      } catch (err) {
        console.error('Error eliminando banner en Supabase:', err);
      }
    }
  };

  const handleToggleBannerActive = async (bannerId) => {
    let updatedActivo = true;
    setBanners((prev) => prev.map(b => {
      if (b.id === bannerId) {
        updatedActivo = b.activo === false;
        return { ...b, activo: updatedActivo };
      }
      return b;
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('banners').update({ activo: updatedActivo }).eq('id', bannerId);
      } catch (err) {
        console.error('Error actualizando activo de banner en Supabase:', err);
      }
    }
  };

  // Manejo de Enlaces de Redes con persistencia en Supabase
  const handleAddSocialLink = async (newLink) => {
    const updated = [...socialLinks, newLink];
    setSocialLinks(updated);
    localStorage.setItem('tienda_social_links', JSON.stringify(updated));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tienda_config').upsert({
          clave: 'tienda_social_links',
          valor: updated,
          actualizado_en: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error guardando redes en Supabase:', err);
      }
    }
  };

  const handleDeleteSocialLink = async (linkId) => {
    const updated = socialLinks.filter(l => (l.id || l.url) !== linkId);
    setSocialLinks(updated);
    localStorage.setItem('tienda_social_links', JSON.stringify(updated));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tienda_config').upsert({
          clave: 'tienda_social_links',
          valor: updated,
          actualizado_en: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error borrando red social en Supabase:', err);
      }
    }
  };

  // Manejo de Horarios con persistencia en Supabase
  const handleUpdateFoodSchedule = async (updatedSchedule) => {
    setFoodSchedule(updatedSchedule);
    localStorage.setItem('tienda_horario_comida', JSON.stringify(updatedSchedule));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tienda_config').upsert({
          clave: 'tienda_horario_comida',
          valor: updatedSchedule,
          actualizado_en: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error guardando horario en Supabase:', err);
      }
    }
  };

  // Manejo de Número de WhatsApp Oficial con persistencia en Supabase
  const handleSaveWhatsAppNumber = async (num) => {
    setWhatsappNumber(num);
    localStorage.setItem('whatsapp_ventas', num);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tienda_config').upsert({
          clave: 'whatsapp_ventas',
          valor: num,
          actualizado_en: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error guardando whatsapp en Supabase:', err);
      }
    }
  };

  // Manejo de Plantilla de Mensaje de WhatsApp con persistencia en Supabase
  const handleSaveWhatsAppTemplate = async (newTemplate) => {
    setWhatsappTemplate(newTemplate);
    localStorage.setItem('whatsapp_mensaje_plantilla', newTemplate);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tienda_config').upsert({
          clave: 'whatsapp_mensaje_plantilla',
          valor: newTemplate,
          actualizado_en: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error guardando plantilla de WhatsApp en Supabase:', err);
      }
    }
  };

  // Manejo de Configuración de Lotes de Ropa con persistencia en Supabase
  const handleSaveLotesConfig = async (newConfig) => {
    setLotesConfig(newConfig);
    localStorage.setItem('tienda_config_lotes', JSON.stringify(newConfig));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tienda_config').upsert({
          clave: 'tienda_config_lotes',
          valor: newConfig,
          actualizado_en: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error guardando lotes en Supabase:', err);
      }
    }
  };

  // Manejar Carrito con límite estricto de existencias
  const handleAddToCart = (product) => {
    const maxStock = product.stock !== undefined ? parseInt(product.stock, 10) : 5;
    
    if (product.agotado || maxStock <= 0) {
      alert(`El artículo "${product.nombre}" está agotado.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= maxStock) {
          alert(`Solo hay ${maxStock} piezas disponibles de "${product.nombre}".`);
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1, stock: maxStock } : item
        );
      }
      return [...prev, { ...product, quantity: 1, stock: maxStock }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id);
      return;
    }

    const currentItem = cart.find((i) => i.id === id);
    const prod = products.find((p) => p.id === id) || currentItem;
    const maxStock = prod?.stock !== undefined ? parseInt(prod.stock, 10) : 5;

    if (newQty > maxStock) {
      alert(`Solo hay ${maxStock} piezas disponibles de este producto.`);
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty, stock: maxStock } : item))
    );
  };

  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Manejar Administración de Productos con subida de fotos a Supabase Storage
  const handleAddProduct = async (newProduct, photoSlots = []) => {
    let finalUrls = [];

    if (Array.isArray(photoSlots) && photoSlots.length > 0) {
      for (let i = 0; i < photoSlots.length; i++) {
        const slot = photoSlots[i];
        if (!slot) continue;

        // Subir foto directamente a Supabase Storage si es un archivo seleccionado
        if (slot.file && isSupabaseConfigured && supabase) {
          try {
            const publicUrl = await uploadProductPhoto(slot.file, i);
            if (publicUrl) {
              finalUrls.push(publicUrl);
              continue;
            }
          } catch (err) {
            console.error(`Error al subir foto ${i + 1} a Supabase:`, err);
          }
        }

        if (slot.url && !slot.url.startsWith('blob:')) finalUrls.push(slot.url);
        else if (slot.preview && !slot.preview.startsWith('blob:')) finalUrls.push(slot.preview);
      }
    }

    if (finalUrls.length === 0) {
      if (newProduct.imagen_url) {
        finalUrls = newProduct.imagen_url.split('|||').filter(Boolean);
      } else {
        finalUrls = ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'];
      }
    }

    finalUrls = finalUrls.slice(0, 3);

    const readyProduct = { 
      ...newProduct, 
      imagenes: finalUrls,
      imagen_url: finalUrls[0] || '',
      stock: parseInt(newProduct.stock, 10) || 5,
      agotado: (parseInt(newProduct.stock, 10) || 5) <= 0
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: insertedData, error: insertError } = await supabase.from('productos').insert([{
          nombre: readyProduct.nombre,
          precio: readyProduct.precio,
          precio_anterior: readyProduct.precio_anterior || null,
          stock: readyProduct.stock,
          categoria: readyProduct.categoria,
          descripcion: readyProduct.descripcion,
          tipo_envio: readyProduct.tipo_envio,
          imagen_url: readyProduct.imagen_url,
          imagenes: readyProduct.imagenes,
          agotado: readyProduct.agotado
        }]).select();

        if (!insertError && insertedData?.[0]) {
          setProducts((prev) => [insertedData[0], ...prev]);
          return;
        } else if (insertError) {
          console.error('Error insertando producto en Supabase:', insertError);
        }
      } catch (err) {
        console.error('Error en Supabase:', err);
      }
    }

    setProducts((prev) => [readyProduct, ...prev]);
  };

  const handleUpdateProduct = async (updatedProduct, photoSlots = []) => {
    let finalUrls = [];

    if (Array.isArray(photoSlots) && photoSlots.length > 0) {
      for (let i = 0; i < photoSlots.length; i++) {
        const slot = photoSlots[i];
        if (!slot) continue;

        // Subir nueva foto si se seleccionó archivo
        if (slot.file && isSupabaseConfigured && supabase) {
          try {
            const publicUrl = await uploadProductPhoto(slot.file, i);
            if (publicUrl) {
              finalUrls.push(publicUrl);
              continue;
            }
          } catch (err) {
            console.error(`Error al subir foto de actualización:`, err);
          }
        }

        if (slot.url && !slot.url.startsWith('blob:')) finalUrls.push(slot.url);
        else if (slot.preview && !slot.preview.startsWith('blob:')) finalUrls.push(slot.preview);
      }
    }

    if (finalUrls.length === 0) {
      if (updatedProduct.imagen_url) {
        finalUrls = updatedProduct.imagen_url.split('|||').filter(Boolean);
      } else {
        finalUrls = ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'];
      }
    }

    finalUrls = finalUrls.slice(0, 3);

    const readyProduct = { 
      ...updatedProduct, 
      imagenes: finalUrls,
      imagen_url: finalUrls[0] || '',
      stock: parseInt(updatedProduct.stock, 10) || 0,
      agotado: (parseInt(updatedProduct.stock, 10) || 0) <= 0 || Boolean(updatedProduct.agotado)
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('productos')
          .update({
            nombre: readyProduct.nombre,
            precio: readyProduct.precio,
            precio_anterior: readyProduct.precio_anterior || null,
            stock: readyProduct.stock,
            categoria: readyProduct.categoria,
            descripcion: readyProduct.descripcion,
            tipo_envio: readyProduct.tipo_envio,
            imagen_url: readyProduct.imagen_url,
            imagenes: readyProduct.imagenes,
            agotado: readyProduct.agotado
          })
          .eq('id', readyProduct.id);
      } catch (err) {
        console.error('Error actualizando producto en Supabase:', err);
      }
    }

    setProducts((prev) => prev.map((p) => p.id === readyProduct.id ? readyProduct : p));
  };

  const handleToggleAgotado = async (product) => {
    const stock = product.stock !== undefined ? parseInt(product.stock, 10) : 5;
    const isCurrentlyAgotado = Boolean(product.agotado) || stock <= 0;
    
    const newAgotado = !isCurrentlyAgotado;
    const newStock = newAgotado ? 0 : 5;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('productos')
          .update({ agotado: newAgotado, stock: newStock })
          .eq('id', product.id);
      } catch (err) {
        console.error('Error actualizando agotado en Supabase:', err);
      }
    }

    setProducts((prev) => prev.map((p) => 
      p.id === product.id ? { ...p, agotado: newAgotado, stock: newStock } : p
    ));
  };

  const handleDeleteProduct = async (id) => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('productos').delete().eq('id', id);
      } catch (err) {
        console.error('Error borrando producto en Supabase:', err);
      }
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // Filtrado de productos
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'Todas' || p.categoria === selectedCategory;
    const matchesSearch = 
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Lista de categorías para los tabs (Todas + categorías dinámicas)
  const navCategories = ['Todas', ...categories];

  return (
    <div className="site-wrapper">
      {/* Cabecera con marca Universo Bonito, redes y horarios */}
      <Header 
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        socialLinks={socialLinks}
        foodSchedule={foodSchedule}
      />

      {/* Carrusel de Banners Horizontales Dinámicos */}
      <BannerSlider 
        banners={banners}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalogo');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenLightbox={(url, title) => {
          setLightboxData({ isOpen: true, url, title });
        }}
      />

      {/* Hero Section Universo Bonito */}
      <section className="hero-banner">
        <div className="hero-sparkle-pill">
          <span>Colección & Sabor Exclusivo</span>
        </div>
        <h2 className="hero-title">
          Universo Bonito
        </h2>
        <p className="hero-description">
          Lotes de ropa de marcas exclusivas, moda para dama, y el mejor sabor de alitas,
          botanas y micheladas preparadas con entrega a domicilio.
        </p>

        {/* Highlights del negocio */}
        <div className="hero-perks-row">
          <div className="hero-perk-item">
            <ShieldCheck size={16} />
            <span>Marcas Originales y Lotes</span>
          </div>
          <div className="hero-perk-item">
            <Truck size={16} />
            <span>Zona Local y Envíos Nacionales</span>
          </div>
          <div className="hero-perk-item">
            <HeartHandshake size={16} />
            <span>Atención Directa por WhatsApp</span>
          </div>
        </div>
      </section>

      {/* Sección Especial Destacada: Lotes de Ropa para Emprendedoras */}
      {(selectedCategory === 'Todas' || selectedCategory === 'Lotes de Ropa') && !searchQuery.trim() && (
        <LotesShowcase 
          whatsappNumber={whatsappNumber}
          lotesConfig={lotesConfig}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            const el = document.getElementById('catalogo');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onAddToCartDirect={handleAddToCart}
        />
      )}

      {/* Filtros de Categorías Dinámicas y Buscador */}
      <section className="filters-section" id="catalogo">
        <div className="tabs-wrapper">
          {navCategories.map((cat) => (
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
              placeholder="Buscar por prenda, lote, alitas, michelada o sabor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="items-counter">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'artículo' : 'artículos'}
          </span>
        </div>
      </section>

      {/* Catálogo de Productos con división por secciones dinámicas */}
      <main className="products-container">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: '12px', color: 'var(--accent-pink)' }} />
            <p>No se encontraron artículos en esta categoría o búsqueda.</p>
          </div>
        ) : selectedCategory === 'Todas' && !searchQuery.trim() ? (
          /* VISTA TODAS: DIVIDIDA POR SECCIONES DE CADA CATEGORÍA */
          <div className="category-sections-list">
            {categories.map((cat, idx) => {
              const catProducts = products.filter((p) => p.categoria === cat);
              if (catProducts.length === 0) return null;
              const visibleItems = catProducts.slice(0, ITEMS_PER_PAGE);
              const remainingCount = catProducts.length - ITEMS_PER_PAGE;

              return (
                <section key={cat} className="category-section-block">
                  <div className="category-section-header">
                    <div>
                      <h3 className="category-section-title">{cat}</h3>
                      <span className="category-section-subtitle">
                        {catProducts.length} {catProducts.length === 1 ? 'artículo disponible' : 'artículos disponibles'}
                      </span>
                    </div>

                    <button 
                      className="category-view-all-btn"
                      onClick={() => {
                        setSelectedCategory(cat);
                        const el = document.getElementById('catalogo');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <span>Ver todos ({catProducts.length})</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="products-grid">
                    {visibleItems.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        whatsappNumber={whatsappNumber}
                        onAddToCart={handleAddToCart}
                        isInCart={cart.some((item) => item.id === product.id)}
                      />
                    ))}
                  </div>

                  {remainingCount > 0 && (
                    <div className="category-section-footer">
                      <button
                        className="category-show-more-btn"
                        onClick={() => {
                          setSelectedCategory(cat);
                          const el = document.getElementById('catalogo');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <span>Ver los {remainingCount} artículos más de {cat}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  )}

                  {idx < categories.length - 1 && (
                    <div className="category-divider-line" />
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          /* VISTA POR CATEGORIA ESPECIFICA O BUSQUEDA: PAGINADA EN BLOQUES DE 6 */
          <div>
            <div className="products-grid">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  whatsappNumber={whatsappNumber}
                  onAddToCart={handleAddToCart}
                  isInCart={cart.some((item) => item.id === product.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                    const el = document.getElementById('catalogo');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Anterior</span>
                </button>

                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`pagination-num-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentPage(page);
                        const el = document.getElementById('catalogo');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    const el = document.getElementById('catalogo');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>Siguiente</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bolsa de Pedidos Lateral */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        whatsappNumber={whatsappNumber}
        whatsappTemplate={whatsappTemplate}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* Modal Admin Integral */}
      <AdminModal 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        categories={categories}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onToggleAgotado={handleToggleAgotado}
        onDeleteProduct={handleDeleteProduct}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        banners={banners}
        onAddBanner={handleAddBanner}
        onDeleteBanner={handleDeleteBanner}
        onToggleBannerActive={handleToggleBannerActive}
        socialLinks={socialLinks}
        onAddSocialLink={handleAddSocialLink}
        onDeleteSocialLink={handleDeleteSocialLink}
        foodSchedule={foodSchedule}
        onUpdateFoodSchedule={handleUpdateFoodSchedule}
        whatsappNumber={whatsappNumber}
        onSaveWhatsAppNumber={handleSaveWhatsAppNumber}
        whatsappTemplate={whatsappTemplate}
        onSaveWhatsAppTemplate={handleSaveWhatsAppTemplate}
        lotesConfig={lotesConfig}
        onSaveLotesConfig={handleSaveLotesConfig}
      />

      {/* Lightbox Modal para ampliar volantes / menús */}
      <LightboxModal 
        isOpen={lightboxData.isOpen}
        imageUrl={lightboxData.url}
        title={lightboxData.title}
        whatsappNumber={whatsappNumber}
        onClose={() => setLightboxData({ isOpen: false, url: '', title: '' })}
      />

      {/* Pie de página */}
      <Footer 
        categories={categories}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalogo');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        socialLinks={socialLinks}
        foodSchedule={foodSchedule}
        whatsappNumber={whatsappNumber}
      />
    </div>
  );
}
