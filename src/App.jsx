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
  DEFAULT_WHATSAPP_TEMPLATE
} from './data/initialProducts';
import { supabase, isSupabaseConfigured } from './supabase';
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

  // Forzar actualización de versión para navegadores que visitaron la versión anterior
  useEffect(() => {
    const isUpdated = localStorage.getItem('universo_bonito_v2_migrated');
    if (!isUpdated) {
      localStorage.setItem('universo_bonito_v2_migrated', 'true');
      localStorage.setItem('catalogo_productos', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('catalogo_categorias', JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem('catalogo_banners', JSON.stringify(INITIAL_BANNERS));
      localStorage.setItem('tienda_social_links', JSON.stringify(INITIAL_SOCIAL_LINKS));
      localStorage.setItem('tienda_horario_comida', JSON.stringify(INITIAL_FOOD_SCHEDULE));
      localStorage.setItem('whatsapp_ventas', '525620068886');
      setProducts(INITIAL_PRODUCTS);
      setCategories(INITIAL_CATEGORIES);
      setBanners(INITIAL_BANNERS);
      setSocialLinks(INITIAL_SOCIAL_LINKS);
      setFoodSchedule(INITIAL_FOOD_SCHEDULE);
      setWhatsappNumber('525620068886');
    }
  }, []);

  // Cargar y sincronizar con Supabase en tiempo real si está configurado
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      async function syncSupabase() {
        try {
          const { data, error } = await supabase
            .from('productos')
            .select('*')
            .order('creado_en', { ascending: false });

          if (!error && data && data.length > 0) {
            setProducts(data);
          }
        } catch (err) {
          console.warn('Error sincronizando con Supabase, usando estado local:', err);
        }
      }

      syncSupabase();

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

  // Persistencia en localStorage
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

  // Manejo de Categorías Dinámicas
  const handleAddCategory = (newCat) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const handleDeleteCategory = (catToDelete) => {
    setCategories((prev) => prev.filter(c => c !== catToDelete));
    if (selectedCategory === catToDelete) {
      setSelectedCategory('Todas');
    }
  };

  // Manejo de Banners Horizontales
  const handleAddBanner = (newBanner) => {
    setBanners((prev) => [newBanner, ...prev]);
  };

  const handleDeleteBanner = (bannerId) => {
    setBanners((prev) => prev.filter(b => b.id !== bannerId));
  };

  const handleToggleBannerActive = (bannerId) => {
    setBanners((prev) => prev.map(b => 
      b.id === bannerId ? { ...b, activo: b.activo === false ? true : false } : b
    ));
  };

  // Manejo de Enlaces de Redes
  const handleAddSocialLink = (newLink) => {
    setSocialLinks((prev) => [...prev, newLink]);
  };

  const handleDeleteSocialLink = (linkId) => {
    setSocialLinks((prev) => prev.filter(l => (l.id || l.url) !== linkId));
  };

  // Manejo de Horarios
  const handleUpdateFoodSchedule = (updatedSchedule) => {
    setFoodSchedule(updatedSchedule);
  };

  // Manejo de Plantilla de Mensaje de WhatsApp
  const handleSaveWhatsAppTemplate = (newTemplate) => {
    setWhatsappTemplate(newTemplate);
    localStorage.setItem('whatsapp_mensaje_plantilla', newTemplate);
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

  // Manejar Administración de Productos
  const handleAddProduct = async (newProduct, photoSlots = []) => {
    let finalUrls = [];

    if (Array.isArray(photoSlots) && photoSlots.length > 0) {
      for (let i = 0; i < photoSlots.length; i++) {
        const slot = photoSlots[i];
        if (!slot) continue;

        if (slot.file && isSupabaseConfigured && supabase) {
          try {
            const fileExt = slot.file.name.split('.').pop();
            const fileName = `${Date.now()}-${i}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
              .from('fotos-productos')
              .upload(fileName, slot.file, { contentType: slot.file.type, upsert: false });

            if (!uploadError) {
              const { data } = supabase.storage.from('fotos-productos').getPublicUrl(fileName);
              if (data?.publicUrl) {
                finalUrls.push(data.publicUrl);
                continue;
              }
            }
          } catch (err) {
            console.error(`Error al subir foto ${i + 1}:`, err);
          }
        }

        if (slot.url) finalUrls.push(slot.url);
        else if (slot.preview) finalUrls.push(slot.preview);
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
          stock: readyProduct.stock,
          categoria: readyProduct.categoria,
          descripcion: readyProduct.descripcion,
          tipo_envio: readyProduct.tipo_envio,
          imagen_url: readyProduct.imagen_url,
          agotado: readyProduct.agotado
        }]).select();

        if (!insertError && insertedData?.[0]) {
          setProducts((prev) => [{ ...insertedData[0], imagenes: finalUrls }, ...prev]);
          return;
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

        if (slot.file && isSupabaseConfigured && supabase) {
          try {
            const fileExt = slot.file.name.split('.').pop();
            const fileName = `${Date.now()}-${i}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
              .from('fotos-productos')
              .upload(fileName, slot.file, { contentType: slot.file.type, upsert: false });

            if (!uploadError) {
              const { data } = supabase.storage.from('fotos-productos').getPublicUrl(fileName);
              if (data?.publicUrl) {
                finalUrls.push(data.publicUrl);
                continue;
              }
            }
          } catch (err) {
            console.error(`Error al subir foto:`, err);
          }
        }

        if (slot.url) finalUrls.push(slot.url);
        else if (slot.preview) finalUrls.push(slot.preview);
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
            stock: readyProduct.stock,
            categoria: readyProduct.categoria,
            descripcion: readyProduct.descripcion,
            tipo_envio: readyProduct.tipo_envio,
            imagen_url: readyProduct.imagen_url,
            agotado: readyProduct.agotado
          })
          .eq('id', readyProduct.id);
      } catch (err) {
        console.error('Error actualizando:', err);
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
        console.error('Error actualizando agotado:', err);
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
        console.error('Error borrando:', err);
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
