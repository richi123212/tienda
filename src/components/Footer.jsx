import React from 'react';

export default function Footer({ onSelectCategory, onOpenAdmin }) {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={onOpenAdmin}>
          <span className="footer-brand-text">Tienda</span>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)' }}></span>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => onSelectCategory('Comida')}>Comida</span>
          <span style={{ cursor: 'pointer' }} onClick={() => onSelectCategory('Ropa Mujer')}>Ropa Mujer</span>
          <span style={{ cursor: 'pointer' }} onClick={() => onSelectCategory('Ropa Hombre')}>Ropa Hombre</span>
          <span style={{ cursor: 'pointer' }} onClick={() => onSelectCategory('Lucha Libre')}>Lucha Libre</span>
        </div>

        <div>
          <p>© {new Date().getFullYear()} Tienda. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
