import React from 'react';
import { Sparkles, Phone, Clock, Heart } from 'lucide-react';

export default function Footer({ 
  categories = [], 
  onSelectCategory, 
  onOpenAdmin,
  socialLinks = [],
  foodSchedule = {},
  whatsappNumber = '525620068886'
}) {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        
        {/* Columna 1: Marca y Sobre nosotros */}
        <div className="footer-col-brand">
          <div 
            className="footer-brand-title-wrap"
            onClick={onOpenAdmin}
            title="Panel de Administración"
          >
            <div className="brand-logo-icon small">
              <Sparkles size={15} />
            </div>
            <span className="footer-brand-text">Universo Bonito</span>
          </div>

          <p className="footer-brand-desc">
            Venta de lotes de ropa de marcas exclusivas para emprendedoras, moda de dama,
            y el mejor sabor de botanas, alitas y micheladas a domicilio.
          </p>

          <div className="footer-contact-item">
            <Phone size={14} />
            <span>Pedidos y WhatsApp: +{whatsappNumber}</span>
          </div>

          {foodSchedule?.horario && (
            <div className="footer-contact-item">
              <Clock size={14} />
              <span>Horario Cocina: {foodSchedule.horario}</span>
            </div>
          )}
        </div>

        {/* Columna 2: Categorías dinámicas */}
        <div className="footer-col-nav">
          <h4 className="footer-col-title">Categorías</h4>
          <div className="footer-links-list">
            {categories.map((cat) => (
              <button 
                key={cat} 
                className="footer-link-btn" 
                onClick={() => onSelectCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Columna 3: Redes Sociales del Cliente */}
        <div className="footer-col-social">
          <h4 className="footer-col-title">Nuestras Redes</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            ¡Síguenos en nuestras redes sociales para no perderte novedades y promociones!
          </p>
          <div className="footer-social-chips">
            {socialLinks.map((link) => (
              <a
                key={link.id || link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-chip"
              >
                <span>{link.plataforma || link.nombre}</span>
              </a>
            ))}
          </div>
        </div>

      </div>

      <div className="footer-bottom-bar">
        <p>© {new Date().getFullYear()} Universo Bonito. Todos los derechos reservados.</p>
        <span 
          className="admin-access-link"
          onClick={onOpenAdmin}
          title="Acceso Privado"
        >
          Administración
        </span>
      </div>
    </footer>
  );
}
