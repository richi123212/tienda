import React from 'react';
import { Plus, Check, Truck, Shield } from 'lucide-react';

export default function ProductCard({ 
  product, 
  whatsappNumber, 
  onAddToCart, 
  isInCart 
}) {
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDirectWhatsApp = () => {
    const cleanPhone = (whatsappNumber || '').replace(/[^0-9]/g, '');
    const message = `Hola, me interesa pedir el siguiente producto de su catálogo:

*${product.nombre}*
Categoría: ${product.categoria}
Precio: $${product.precio} MXN
Tipo de envío: ${product.tipo_envio === 'Local' ? 'Envío Local (Comida)' : 'Envío Nacional por paquetería'}

¿Tienen disponibilidad para coordinar el pago por transferencia SPEI o efectivo?`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="product-card">
      <div className="card-image-box">
        <img 
          src={product.imagen_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'} 
          alt={product.nombre}
          className="product-image"
          loading="lazy"
        />

        <div className={`shipping-badge ${product.tipo_envio === 'Local' ? 'local' : 'nacional'}`}>
          {product.tipo_envio === 'Local' ? (
            <>
              <Truck size={12} />
              <span>Envío Local</span>
            </>
          ) : (
            <>
              <Shield size={12} />
              <span>Envío Nacional</span>
            </>
          )}
        </div>

        <div className="category-tag">
          {product.categoria}
        </div>
      </div>

      <div className="card-content">
        <h3 className="product-title">{product.nombre}</h3>
        <p className="product-description">{product.descripcion}</p>

        <div className="price-row">
          <span className="price-label">Precio</span>
          <div>
            <span className="product-price">{formatPrice(product.precio)}</span>
            <span className="product-currency">MXN</span>
          </div>
        </div>

        <div className="card-actions">
          <button 
            className="whatsapp-order-btn"
            onClick={handleDirectWhatsApp}
            title="Pedir directamente por WhatsApp"
          >
            {/* Ícono SVG limpio de WhatsApp (sin emojis) */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.82 14.07c-.24.68-1.2 1.25-1.66 1.3-.43.05-.98.07-3.14-.82-2.31-.96-3.79-3.3-3.9-3.46-.12-.16-.94-1.25-.94-2.39 0-1.14.6-1.7.81-1.93.22-.24.47-.3.63-.3.16 0 .32 0 .46.01.15.01.35-.06.55.42.21.49.71 1.73.77 1.86.06.12.1.27.02.43-.08.17-.12.27-.24.41-.12.14-.25.32-.36.43-.12.12-.25.26-.11.5.14.24.63 1.04 1.35 1.68.93.83 1.71 1.09 1.95 1.21.24.12.38.1.52-.06.14-.17.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.6-.18 1.28z"/>
            </svg>
            <span>Pedir por WhatsApp</span>
          </button>

          <button 
            className="add-bag-btn"
            onClick={() => onAddToCart(product)}
            title={isInCart ? "Agregado a la bolsa" : "Añadir a la bolsa para pedir varios"}
          >
            {isInCart ? <Check size={18} color="#10b981" /> : <Plus size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
