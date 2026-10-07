import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, CreditCard, Lock, GitBranch } from 'lucide-react';

export default function Header({ 
  cartCount, 
  onOpenCart, 
  onOpenAdmin, 
  onOpenGitGuide 
}) {
  return (
    <>
      {/* Barra superior de anuncios importantes */}
      <div className="top-notice-bar">
        <div className="notice-items">
          <span className="notice-item">
            <Truck size={13} />
            <span><strong>Comida:</strong> Envíos locales</span>
          </span>
          <span className="notice-divider">•</span>
          <span className="notice-item">
            <ShieldCheck size={13} />
            <span><strong>Ropa y Lucha Libre:</strong> Envíos nacionales por paquetería</span>
          </span>
          <span className="notice-divider">•</span>
          <span className="notice-item">
            <CreditCard size={13} />
            <span><strong>Pagos:</strong> Transferencia SPEI o Efectivo</span>
          </span>
        </div>
      </div>

      {/* Cabecera principal */}
      <header className="site-header">
        <div className="header-container">
          <div className="brand-section" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <h1 className="brand-title">
              MERCADO <span>&</span> BOUTIQUE
            </h1>
            <p className="brand-subtitle">Cocina Artesanal & Moda Exclusiva</p>
          </div>

          <div className="header-actions">
            <button 
              className="action-btn"
              onClick={onOpenGitGuide}
              title="Aprende a subir a Git y Vercel paso a paso"
            >
              <GitBranch size={16} />
              <span>Guía Git & Vercel</span>
            </button>

            <button 
              className="action-btn"
              onClick={onOpenAdmin}
              title="Panel de administración de productos"
            >
              <Lock size={15} />
              <span>Panel /admin</span>
            </button>

            <button 
              className="action-btn cart-btn"
              onClick={onOpenCart}
              title="Ver mi bolsa de compras"
            >
              <ShoppingBag size={18} />
              <span>Bolsa</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
