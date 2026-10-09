import React, { useState } from 'react';
import { Plus, Check, Truck, Shield, MapPin, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

export const getProductImages = (product) => {
  if (Array.isArray(product?.imagenes) && product.imagenes.length > 0) {
    return product.imagenes.filter(Boolean).slice(0, 3);
  }
  if (product?.imagen_url) {
    const raw = String(product.imagen_url).trim();
    if (raw.startsWith('[') && raw.endsWith(']')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(Boolean).slice(0, 3);
        }
      } catch (e) {}
    }
    if (raw.includes('|||')) {
      return raw.split('|||').map(s => s.trim()).filter(Boolean).slice(0, 3);
    }
    return [raw];
  }
  return ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'];
};

export default function ProductCard({ 
  product, 
  whatsappNumber, 
  onAddToCart, 
  isInCart 
}) {
  const stock = product.stock !== undefined ? parseInt(product.stock, 10) : 5;
  const isAgotado = Boolean(product.agotado) || stock <= 0;

  // Cálculo de descuento
  const hasDiscount = Boolean(
    product.precio_anterior && 
    parseFloat(product.precio_anterior) > parseFloat(product.precio)
  );
  const discountPercent = hasDiscount
    ? Math.round((1 - parseFloat(product.precio) / parseFloat(product.precio_anterior)) * 100)
    : 0;

  // Soporte de 1 a 3 fotos con slider táctil y flechas
  const images = getProductImages(product);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        handleNext(e);
      } else {
        handlePrev(e);
      }
    }
    setTouchStartX(null);
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getShippingLabel = () => {
    if (product.tipo_envio === 'Local') return 'Zona Local';
    if (product.tipo_envio === 'Punto') return 'Punto de Entrega';
    return 'Paquetería Nacional';
  };

  const handleDirectWhatsApp = () => {
    if (isAgotado) return;
    const cleanPhone = (whatsappNumber || '').replace(/[^0-9]/g, '');
    const priceText = hasDiscount 
      ? `$${product.precio} MXN (Antes: $${product.precio_anterior} MXN - Ahorro del ${discountPercent}%)`
      : `$${product.precio} MXN`;

    const message = `Hola Universo Bonito, me interesa pedir el siguiente producto de su catálogo:

*${product.nombre}*
Categoría: ${product.categoria}
Precio: ${priceText}
Tipo de entrega: ${getShippingLabel()}

¿Tienen disponibilidad para coordinar el pedido y pago por transferencia SPEI o efectivo?`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className={`product-card ${isAgotado ? 'card-agotado' : ''}`}>
      <div 
        className="card-image-box"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img 
          src={images[currentImgIndex] || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'} 
          alt={`${product.nombre} (Foto ${currentImgIndex + 1} de ${images.length})`}
          className={`product-image ${isAgotado ? 'img-dimmed' : ''}`}
          loading="lazy"
        />

        {/* Badge de Descuento destacado */}
        {hasDiscount && !isAgotado && (
          <div className="discount-badge" title={`Descuento del ${discountPercent}%`}>
            <Tag size={11} />
            <span>-{discountPercent}% OFF</span>
          </div>
        )}

        {/* Controles de carrusel cuando hay de 2 a 3 fotos */}
        {images.length > 1 && (
          <>
            <button 
              type="button"
              className="card-carousel-arrow prev"
              onClick={handlePrev}
              title="Foto anterior"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <button 
              type="button"
              className="card-carousel-arrow next"
              onClick={handleNext}
              title="Siguiente foto"
              aria-label="Siguiente foto"
            >
              <ChevronRight size={16} />
            </button>

            {/* Puntos de paginación de fotos */}
            <div className="card-carousel-dots">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`card-dot ${currentImgIndex === idx ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImgIndex(idx);
                  }}
                  title={`Ver foto ${idx + 1}`}
                />
              ))}
            </div>

            {/* Contador de fotos (ej. 1/3) */}
            <div className="photo-counter-tag">
              <span>{currentImgIndex + 1}/{images.length}</span>
            </div>
          </>
        )}

        {isAgotado ? (
          <div className="agotado-badge">
            <span>Agotado</span>
          </div>
        ) : (
          <div className={`shipping-badge ${product.tipo_envio === 'Local' ? 'local' : product.tipo_envio === 'Punto' ? 'punto' : 'nacional'}`}>
            {product.tipo_envio === 'Local' ? (
              <>
                <Truck size={12} />
                <span>Zona Local</span>
              </>
            ) : product.tipo_envio === 'Punto' ? (
              <>
                <MapPin size={12} />
                <span>Punto de Entrega</span>
              </>
            ) : (
              <>
                <Shield size={12} />
                <span>Paquetería Nacional</span>
              </>
            )}
          </div>
        )}

        <div className="category-tag">
          {product.categoria}
        </div>
      </div>

      <div className="card-content">
        <h3 className="product-title">{product.nombre}</h3>
        <p className="product-description">{product.descripcion}</p>

        {/* Indicador de existencias disponibles */}
        <div style={{ marginBottom: '8px' }}>
          {isAgotado ? (
            <span style={{ fontSize: '0.74rem', color: 'var(--danger)', fontWeight: 600 }}>
              Sin existencias por el momento
            </span>
          ) : (
            <span style={{ 
              fontSize: '0.74rem', 
              color: stock <= 3 ? '#b45309' : 'var(--text-muted)', 
              fontWeight: 500 
            }}>
              {stock <= 3 ? `Solo ${stock} disponibles` : `${stock} disponibles`}
            </span>
          )}
        </div>

        {/* Fila de Precio con soporte a Descuento */}
        <div className="price-row">
          <span className="price-label">Precio</span>
          <div className="price-display-box">
            {hasDiscount && (
              <span className="product-old-price">
                {formatPrice(product.precio_anterior)}
              </span>
            )}
            <span className="product-price">{formatPrice(product.precio)}</span>
            <span className="product-currency">MXN</span>
          </div>
        </div>

        <div className="card-actions">
          {isAgotado ? (
            <button 
              className="whatsapp-order-btn btn-disabled"
              disabled
              title="Producto actualmente agotado"
              style={{ background: '#fce7ef', color: '#9ca3af', cursor: 'not-allowed' }}
            >
              <span>Agotado</span>
            </button>
          ) : (
            <button 
              className="whatsapp-order-btn"
              onClick={handleDirectWhatsApp}
              title="Pedir directamente por WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.82 14.07c-.24.68-1.2 1.25-1.66 1.3-.43.05-.98.07-3.14-.82-2.31-.96-3.79-3.3-3.9-3.46-.12-.16-.94-1.25-.94-2.39 0-1.14.6-1.7.81-1.93.22-.24.47-.3.63-.3.16 0 .32 0 .46.01.15.01.35-.06.55.42.21.49.71 1.73.77 1.86.06.12.1.27.02.43-.08.17-.12.27-.24.41-.12.14-.25.32-.36.43-.12.12-.25.26-.11.5.14.24.63 1.04 1.35 1.68.93.83 1.71 1.09 1.95 1.21.24.12.38.1.52-.06.14-.17.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.6-.18 1.28z"/>
              </svg>
              <span>Pedir por WhatsApp</span>
            </button>
          )}

          <button 
            className="add-bag-btn"
            onClick={() => onAddToCart(product)}
            disabled={isAgotado}
            style={isAgotado ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
            title={isAgotado ? "No disponible" : (isInCart ? "Agregado a la bolsa" : "Añadir a la bolsa")}
          >
            {isInCart ? <Check size={18} color="#10b981" /> : <Plus size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
