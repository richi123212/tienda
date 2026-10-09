import React from 'react';
import { ShoppingBag, Clock, Sparkles } from 'lucide-react';

export default function Header({ 
  cartCount, 
  onOpenCart, 
  onOpenAdmin,
  socialLinks = [],
  foodSchedule = {}
}) {
  return (
    <header className="site-header">
      {/* Barra superior de anuncios y redes */}
      <div className="top-announcement-bar">
        <div className="top-bar-container">
          <div className="top-bar-left">
            {foodSchedule?.horario && (
              <div className="schedule-pill" title="Horario de atención para comida y botanas a domicilio">
                <Clock size={12} />
                <span>Cocina y Botanas: {foodSchedule.horario}</span>
              </div>
            )}
          </div>

          <div className="top-bar-right">
            <span className="social-follow-label">Síguenos:</span>
            <div className="social-links-list">
              {socialLinks.map((link) => (
                <a
                  key={link.id || link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-header-link"
                  title={link.nombre || link.plataforma}
                >
                  {link.plataforma || link.nombre}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cabecera principal */}
      <div className="header-container">
        {/* Marca: Universo Bonito (Clic abre panel de administración) */}
        <div 
          className="brand-section" 
          onClick={onOpenAdmin}
          title="Administración de Universo Bonito"
        >
          <div className="brand-logo-icon">
            <Sparkles size={18} />
          </div>
          <div className="brand-titles-group">
            <span className="brand-title">Universo Bonito</span>
            <span className="brand-tagline">Moda, Lotes y Botanas</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Horario visible en tablet/escritorio */}
          {foodSchedule?.horario && (
            <div className="header-schedule-badge">
              <span className="status-dot-pulse"></span>
              <span>Servicio a Domicilio {foodSchedule.horario}</span>
            </div>
          )}

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
