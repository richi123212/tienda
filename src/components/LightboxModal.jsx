import React, { useEffect } from 'react';
import { X, ZoomIn, Download, Phone } from 'lucide-react';

export default function LightboxModal({ 
  isOpen, 
  imageUrl, 
  title, 
  onClose,
  whatsappNumber 
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-header">
          <div className="lightbox-title-wrap">
            <span className="lightbox-title">{title || 'Menú / Volante Oficial'}</span>
          </div>

          <div className="lightbox-actions">
            {whatsappNumber && (
              <a 
                href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola Universo Bonito, me interesa pedir respecto al volante promocional: ${title || ''}`)}`}
                target="_blank"
                rel="noreferrer"
                className="lightbox-wa-btn"
                title="Hacer pedido de esta promoción"
              >
                <Phone size={14} />
                <span>Pedir esta promo</span>
              </a>
            )}

            <button 
              className="lightbox-close-btn"
              onClick={onClose}
              title="Cerrar (Esc)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="lightbox-body">
          <img 
            src={imageUrl} 
            alt={title || 'Volante promocional'} 
            className="lightbox-image" 
          />
        </div>
      </div>
    </div>
  );
}
