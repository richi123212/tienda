import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function Header({ 
  cartCount, 
  onOpenCart, 
  onOpenAdmin 
}) {
  return (
    <header className="site-header">
      <div className="header-container">
        {/* Al hacer clic en "Tienda", abre el acceso al panel admin */}
        <div 
          className="brand-section" 
          onClick={onOpenAdmin}
          title="Administración de Tienda"
        >
          <span className="brand-title">Tienda</span>
          <span className="brand-dot"></span>
        </div>

        <div className="header-actions">
          <button 
            className="action-btn cart-btn"
            onClick={onOpenCart}
            title="Ver bolsa de pedidos"
          >
            <ShoppingBag size={17} />
            <span>Bolsa</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
