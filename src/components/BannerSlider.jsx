import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Sparkles, ArrowRight } from 'lucide-react';

export default function BannerSlider({ 
  banners = [], 
  onSelectCategory,
  onOpenLightbox 
}) {
  const activeBanners = banners.filter(b => b.activo !== false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <section className="banner-slider-section">
      <div 
        className="horizontal-banner-card"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Fondo con desenfoque suave para adaptarse al banner */}
        <div 
          className="banner-backdrop-blur"
          style={{ backgroundImage: `url(${currentBanner.imagen_url})` }}
        />

        <div className="banner-inner-content">
          {/* Vista previa de imagen del banner / flyer */}
          <div 
            className="banner-flyer-preview-box"
            onClick={() => onOpenLightbox(currentBanner.imagen_url, currentBanner.titulo)}
            title="Toca para ver el menú / volante completo"
          >
            <img 
              src={currentBanner.imagen_url} 
              alt={currentBanner.titulo} 
              className="banner-flyer-img"
            />
            <div className="banner-zoom-pill">
              <Maximize2 size={13} />
              <span>Ver volante completo</span>
            </div>
          </div>

          {/* Información y llamada a la acción */}
          <div className="banner-details-box">
            <div className="banner-badge-promo">
              <Sparkles size={13} />
              <span>Promoción Destacada</span>
            </div>

            <h3 className="banner-headline">
              {currentBanner.titulo}
            </h3>

            {currentBanner.subtitulo && (
              <p className="banner-subline">
                {currentBanner.subtitulo}
              </p>
            )}

            <div className="banner-actions-row">
              {currentBanner.categoria_destino && (
                <button
                  type="button"
                  className="banner-cta-btn"
                  onClick={() => onSelectCategory(currentBanner.categoria_destino)}
                >
                  <span>{currentBanner.boton_texto || `Explorar ${currentBanner.categoria_destino}`}</span>
                  <ArrowRight size={15} />
                </button>
              )}

              <button
                type="button"
                className="banner-secondary-btn"
                onClick={() => onOpenLightbox(currentBanner.imagen_url, currentBanner.titulo)}
              >
                <Maximize2 size={14} />
                <span>Ampliar Menú</span>
              </button>
            </div>
          </div>
        </div>

        {/* Flechas de navegación si hay más de 1 banner */}
        {activeBanners.length > 1 && (
          <>
            <button 
              type="button" 
              className="banner-nav-btn prev"
              onClick={handlePrev}
              title="Banner anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              type="button" 
              className="banner-nav-btn next"
              onClick={handleNext}
              title="Siguiente banner"
            >
              <ChevronRight size={20} />
            </button>

            {/* Dots */}
            <div className="banner-dots-track">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`banner-indicator-dot ${currentIndex === idx ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                  title={`Ir al banner ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
