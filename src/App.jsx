import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import AdminModal from './components/AdminModal';
import Footer from './components/Footer';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { supabase, isSupabaseConfigured } from './supabase';
import { Search, AlertCircle, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const CATEGORIES = ['Todas', 'Comida', 'Ropa Mujer', 'Ropa Hombre', 'Lucha Libre'];
const SECTION_CATEGORIES = ['Comida', 'Ropa Mujer', 'Ropa Hombre', 'Lucha Libre'];
const ITEMS_PER_PAGE = 6;

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
  const [currentPage, setCurrentPage] = useState(1);
  
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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Manejar Carrito con límite estricto de existencias (Stock)
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
  // Manejar Administración de Productos con hasta 3 fotos
  const handleAddProduct = async (newProduct, photoSlots = []) => {
    let finalUrls = [];

    // Subir cada foto que sea un File nuevo o conservar la URL existente
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
              .upload(fileName, slot.file, {
                contentType: slot.file.type,
                upsert: false
              });

            if (!uploadError) {
              const { data } = supabase.storage
                .from('fotos-productos')
                .getPublicUrl(fileName);
              if (data?.publicUrl) {
                finalUrls.push(data.publicUrl);
                continue;
              }
            }
          } catch (err) {
            console.error(`Error al subir foto ${i + 1} a Supabase:`, err);
          }
        }

        if (slot.url) {
          finalUrls.push(slot.url);
        } else if (slot.preview && !slot.preview.startsWith('data:')) {
          finalUrls.push(slot.preview);
        } else if (slot.preview && slot.preview.startsWith('data:')) {
          finalUrls.push(slot.preview);
        }
      }
    }

    // Si no hay ninguna foto en los slots, usar la imagen previa o default
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
      imagen_url: finalUrls.join('|||'),
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
        console.error('Error guardando en Supabase DB:', err);
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
              .upload(fileName, slot.file, {
                contentType: slot.file.type,
                upsert: false
              });

            if (!uploadError) {
              const { data } = supabase.storage
                .from('fotos-productos')
                .getPublicUrl(fileName);
              if (data?.publicUrl) {
                finalUrls.push(data.publicUrl);
                continue;
              }
            }
          } catch (err) {
            console.error(`Error al subir foto ${i + 1} a Supabase:`, err);
          }
        }

        if (slot.url) {
          finalUrls.push(slot.url);
        } else if (slot.preview && !slot.preview.startsWith('data:')) {
          finalUrls.push(slot.preview);
        } else if (slot.preview && slot.preview.startsWith('data:')) {
          finalUrls.push(slot.preview);
        }
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
      imagen_url: finalUrls.join('|||'),
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
        console.error('Error actualizando en Supabase:', err);
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
          .update({ 
            agotado: newAgotado, 
            stock: newStock 
          })
          .eq('id', product.id);
      } catch (err) {
        console.error('Error actualizando estado agotado en Supabase:', err);
      }
    }

    setProducts((prev) => prev.map((p) => 
      p.id === product.id 
        ? { ...p, agotado: newAgotado, stock: newStock } 
        : p
    ));
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

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="site-wrapper">
      {/* Cabecera */}
      <Header 
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Hero Section */}
      <section className="hero-banner">
        <h2 className="hero-title">
          Venta de Ropa y Comida
        </h2>

        <p className="hero-description">
          Compra ropa y comida, haz tu pedido por WhatsApp.
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

      {/* Catálogo de Productos con división por secciones y 6 por grupo */}
      <main className="products-container">
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No se encontraron artículos en esta categoría o búsqueda.</p>
          </div>
        ) : selectedCategory === 'Todas' && !searchQuery.trim() ? (
          /* VISTA TODAS: DIVIDIDA POR SECCIONES DE 6 PRODUCTOS */
          <div className="category-sections-list">
            {SECTION_CATEGORIES.map((cat, idx) => {
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

                  {idx < SECTION_CATEGORIES.length - 1 && (
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
        onUpdateProduct={handleUpdateProduct}
        onToggleAgotado={handleToggleAgotado}
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
