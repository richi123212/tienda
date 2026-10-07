import React from 'react';
import { ShieldCheck, Truck, CreditCard, Lock } from 'lucide-react';

export default function Footer({ onSelectCategory, onOpenAdmin, onOpenGitGuide }) {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <h4>MERCADO & BOUTIQUE</h4>
            <p>
              Plataforma directa de cocina artesanal y moda seleccionada. Sin intermediarios, pedidos gestionados al instante por WhatsApp y entregas seguras.
            </p>
          </div>

          <div className="footer-col">
            <h5>Categorías</h5>
            <ul className="footer-links">
              <li><a href="#catalogo" onClick={() => onSelectCategory('Comida')} style={{ color: 'inherit', textDecoration: 'none' }}>Cocina & Comida</a></li>
              <li><a href="#catalogo" onClick={() => onSelectCategory('Ropa Mujer')} style={{ color: 'inherit', textDecoration: 'none' }}>Ropa Mujer</a></li>
              <li><a href="#catalogo" onClick={() => onSelectCategory('Ropa Hombre')} style={{ color: 'inherit', textDecoration: 'none' }}>Ropa Hombre</a></li>
              <li><a href="#catalogo" onClick={() => onSelectCategory('Lucha Libre')} style={{ color: 'inherit', textDecoration: 'none' }}>Lucha Libre & Colección</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Garantías y Operación</h5>
            <ul className="footer-links">
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={14} color="var(--accent-gold)" />
                <span>Envíos locales y nacionales</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={14} color="var(--accent-gold)" />
                <span>Transferencias SPEI sin comisión</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={14} color="var(--accent-gold)" />
                <span>Atención humana directa</span>
              </li>
              <li style={{ marginTop: '8px' }}>
                <button 
                  onClick={onOpenAdmin} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}
                >
                  Acceso Administrativo (/admin)
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} MERCADO & BOUTIQUE. Todos los derechos reservados.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ cursor: 'pointer' }} onClick={onOpenGitGuide}>Guía de Despliegue</span>
            <span>Términos de Envíos</span>
            <span>Aviso de Privacidad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
