import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, AlertCircle, Truck, Shield, MapPin } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  whatsappNumber,
  onUpdateQty,
  onRemoveItem,
  onClearCart
}) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.precio * item.quantity, 0);

  // Comprobar mezcla de modalidades de entrega
  const hasLocal = cart.some(i => i.tipo_envio === 'Local');
  const hasNacional = cart.some(i => i.tipo_envio === 'Nacional');
  const hasPunto = cart.some(i => i.tipo_envio === 'Punto');
  const hasMixedShipping = (hasLocal && hasNacional) || (hasLocal && hasPunto) || (hasNacional && hasPunto);

  const getShippingName = (tipo) => {
    if (tipo === 'Local') return 'Zona Local (Entrega directa)';
    if (tipo === 'Punto') return 'Punto de Entrega';
    return 'Paquetería Nacional';
  };

  const handleCheckoutWhatsApp = () => {
    const cleanPhone = (whatsappNumber || '').replace(/[^0-9]/g, '');
    
    let productLines = cart.map((item, index) => {
      return `${index + 1}. *${item.nombre}* (x${item.quantity}) - $${item.precio * item.quantity} MXN [${getShippingName(item.tipo_envio)}]`;
    }).join('\n');

    let message = `Hola Universo Bonito, deseo realizar el siguiente pedido desde su catálogo web:\n\n${productLines}\n\n*TOTAL ESTIMADO: ${formatPrice(totalAmount)} MXN*\n`;

    if (hasMixedShipping) {
      message += `\nNota: Mi pedido incluye artículos con distintas modalidades de entrega (comida/botanas de entrega local y/o prendas de paquetería nacional).`;
    }

    message += `\n\n¿Me podrían compartir los datos para realizar el pago por transferencia SPEI o confirmar si aplica pago en efectivo contra entrega? Muchas gracias.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="var(--accent-pink)" />
            <h2 className="drawer-title">Bolsa de Pedidos</h2>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          {cart.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} style={{ opacity: 0.25, marginBottom: '16px', color: 'var(--accent-pink)' }} />
              <p>Tu bolsa de pedidos está vacía.</p>
              <p style={{ fontSize: '0.82rem', marginTop: '6px', color: 'var(--text-muted)' }}>
                Explora el catálogo y añade lotes, prendas o botanas.
              </p>
            </div>
          ) : (
            <>
              {cart.map((item) => {
                const maxStock = item.stock !== undefined ? parseInt(item.stock, 10) : 5;
                const isMaxReached = item.quantity >= maxStock;

                return (
                  <div key={item.id} className="cart-item">
                    <img src={item.imagen_url} alt={item.nombre} className="cart-item-img" />
                    
                    <div className="cart-item-info">
                      <span className="cart-item-title">{item.nombre}</span>
                      
                      <div className="cart-item-meta-row">
                        <span className="cart-item-category">
                          {item.categoria}
                        </span>
                        
                        <span className={`cart-shipping-tag ${item.tipo_envio === 'Local' ? 'local' : item.tipo_envio === 'Punto' ? 'punto' : 'nacional'}`}>
                          {item.tipo_envio === 'Local' ? 'Zona Local' : item.tipo_envio === 'Punto' ? 'Punto Medio' : 'Paquetería'}
                        </span>
                      </div>

                      <div className="cart-item-price-row">
                        <span className="cart-item-price">{formatPrice(item.precio * item.quantity)}</span>
                        {item.quantity > 1 && (
                          <span className="cart-item-unit-price">
                            (${item.precio} c/u)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="qty-controls">
                      <button 
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        title="Disminuir una pieza"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-num">{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        disabled={isMaxReached}
                        style={isMaxReached ? { opacity: 0.35, cursor: 'not-allowed', background: '#f3f4f6' } : {}}
                        title={isMaxReached ? `Límite alcanzado: solo hay ${maxStock} disponibles` : "Aumentar una pieza"}
                      >
                        <Plus size={12} />
                      </button>
                      <button 
                        className="qty-btn"
                        style={{ color: 'var(--danger)', marginLeft: '4px' }}
                        onClick={() => onRemoveItem(item.id)}
                        title="Eliminar artículo de la bolsa"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-subtotal">
              <span className="drawer-subtotal-text">Subtotal</span>
              <span className="drawer-subtotal-price">{formatPrice(totalAmount)}</span>
            </div>

            {hasMixedShipping && (
              <div className="drawer-delivery-note">
                <AlertCircle size={16} color="var(--accent-pink)" style={{ flexShrink: 0 }} />
                <span>
                  Tu pedido combina entrega de zona local (alimentos/botana) y paquetería nacional.
                </span>
              </div>
            )}

            <button 
              className="whatsapp-checkout-btn"
              onClick={handleCheckoutWhatsApp}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.82 14.07c-.24.68-1.2 1.25-1.66 1.3-.43.05-.98.07-3.14-.82-2.31-.96-3.79-3.3-3.9-3.46-.12-.16-.94-1.25-.94-2.39 0-1.14.6-1.7.81-1.93.22-.24.47-.3.63-.3.16 0 .32 0 .46.01.15.01.35-.06.55.42.21.49.71 1.73.77 1.86.06.12.1.27.02.43-.08.17-.12.27-.24.41-.12.14-.25.32-.36.43-.12.12-.25.26-.11.5.14.24.63 1.04 1.35 1.68.93.83 1.71 1.09 1.95 1.21.24.12.38.1.52-.06.14-.17.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.6-.18 1.28z"/>
              </svg>
              <span>Enviar Pedido por WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
