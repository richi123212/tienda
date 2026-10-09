import React, { useState } from 'react';
import { Check, Truck, ShieldCheck, HeartHandshake, Phone, ShoppingBag, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { INITIAL_LOTES_CONFIG } from '../data/initialProducts';

export default function LotesShowcase({ 
  whatsappNumber, 
  onSelectCategory,
  onAddToCartDirect,
  lotesConfig = INITIAL_LOTES_CONFIG
}) {
  const config = lotesConfig || INITIAL_LOTES_CONFIG;
  const tiers = config.tiers && config.tiers.length > 0 ? config.tiers : INITIAL_LOTES_CONFIG.tiers;
  const perks = config.perks && config.perks.length > 0 ? config.perks : INITIAL_LOTES_CONFIG.perks;
  const marcasList = (config.marcas || 'Shein, Zara, Forever 21, Old Navy, H&M')
    .split(',')
    .map(m => m.trim())
    .filter(Boolean);

  const [selectedTier, setSelectedTier] = useState(() => {
    return tiers.find(t => t.popular) || tiers[0] || { piezas: 22, precio: 1650 };
  });

  const [isGuideOpen, setIsGuideOpen] = useState(true);

  const handleOrderLoteWhatsApp = (tier) => {
    const cleanPhone = (whatsappNumber || '').replace(/[^0-9]/g, '');
    const message = `Hola Universo Bonito, me interesa ordenar el siguiente Lote de Ropa de Dama:

*Lote de ${tier.piezas} Piezas*
Precio: $${tier.precio} MXN
Marcas: ${config.marcas || 'Shein, Zara, Forever 21, Old Navy, H&M'}
Modalidad: Envío Nacional por paquetería

¿Me podrían brindar información de disponibilidad y datos de pago por transferencia? Muchas gracias.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  const handleAddTierToCart = (tier) => {
    if (onAddToCartDirect) {
      onAddToCartDirect({
        id: `lote-${tier.piezas}-custom`,
        nombre: `Lote de Ropa Dama - ${tier.piezas} Piezas`,
        precio: tier.precio,
        categoria: 'Lotes de Ropa',
        tipo_envio: 'Nacional',
        stock: 10,
        descripcion: `Paquete de ${tier.piezas} prendas de dama al azar en tallas XS a XL de marcas ${config.marcas || 'Shein, Zara, Forever 21, H&M, Old Navy'}.`,
        imagen_url: '/banners/banner_lotes.jpg'
      });
    }
  };

  return (
    <section className="lotes-feature-section">
      <div className="lotes-feature-header">
        <div className="lotes-badge">
          <span>{config.badge || 'Venta Especial para Emprendedoras'}</span>
        </div>
        <h2 className="lotes-main-title">
          {config.titulo || 'Lotes de Ropa Universo Bonito'}
        </h2>
        <p className="lotes-main-desc">
          {config.descripcion || 'Arma tu propio negocio con lotes surtidos de las mejores marcas comerciales.'}
        </p>

        {/* Marcas incluidas */}
        {marcasList.length > 0 && (
          <div className="lotes-brands-row">
            <span className="brands-title">Marcas incluidas:</span>
            <div className="brands-tags">
              {marcasList.map((b) => (
                <span key={b} className="brand-tag-pill">{b}</span>
              ))}
              <span className="brand-tag-pill more">+ entre otras</span>
            </div>
          </div>
        )}
      </div>

      {/* Características clave / Beneficios */}
      <div className="lotes-perks-grid">
        {perks.map((p, idx) => (
          <div key={idx} className="lote-perk-card">
            <div className="perk-icon">
              {idx === 0 ? <ShieldCheck size={20} /> :
               idx === 1 ? <Check size={20} /> :
               idx === 2 ? <HeartHandshake size={20} /> :
               <Truck size={20} />}
            </div>
            <div>
              <strong>{p.titulo}</strong>
              <p>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Selector interactivo de Lotes */}
      <div className="lotes-selector-box">
        <h3 className="selector-title">Elige el tamaño de tu lote:</h3>
        
        <div className="lote-tiers-grid">
          {tiers.map((tier) => {
            const isSelected = selectedTier.piezas === tier.piezas;
            return (
              <div 
                key={tier.piezas}
                className={`lote-tier-card ${isSelected ? 'selected' : ''} ${tier.popular ? 'popular' : ''}`}
                onClick={() => setSelectedTier(tier)}
              >
                {tier.popular && <span className="tier-ribbon">Más vendido</span>}
                <div className="tier-pieces">{tier.piezas} piezas</div>
                <div className="tier-price">${tier.precio} MXN</div>
                <div className="tier-avg">Aprox. ${Math.round(tier.precio / tier.piezas)} por prenda</div>
                <p className="tier-desc">{tier.desc || 'Paquete surtido de temporada'}</p>
                <div className="tier-check-mark">
                  {isSelected && <Check size={14} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen del Lote Seleccionado y Acciones */}
        <div className="selected-lote-bar">
          <div className="selected-lote-info">
            <span className="selected-label">Lote Seleccionado:</span>
            <strong className="selected-title">
              {selectedTier.piezas} Piezas de Dama por ${selectedTier.precio} MXN
            </strong>
            <span className="selected-sub">
              Costo promedio: ${Math.round(selectedTier.precio / selectedTier.piezas)} MXN por pieza • Envíos a todo México
            </span>
          </div>

          <div className="selected-lote-buttons">
            <button
              type="button"
              className="lote-whatsapp-btn"
              onClick={() => handleOrderLoteWhatsApp(selectedTier)}
            >
              <Phone size={17} />
              <span>Pedir Lote por WhatsApp</span>
            </button>

            <button
              type="button"
              className="lote-cart-btn"
              onClick={() => handleAddTierToCart(selectedTier)}
              title="Añadir este lote a la bolsa de compras"
            >
              <ShoppingBag size={17} />
              <span>Agregar a Bolsa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guía Explicativa: ¿Qué es exactamente un Lote de Ropa? */}
      {config.guia?.mostrar !== false && (
        <div className="lotes-guide-container">
          <div 
            className="lotes-guide-header"
            onClick={() => setIsGuideOpen(!isGuideOpen)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="guide-icon-pill">
                <HelpCircle size={18} />
              </div>
              <h3 className="guide-heading">
                {config.guia?.titulo || '¿Qué es exactamente un Lote de Ropa y cómo funciona?'}
              </h3>
            </div>
            <button type="button" className="guide-toggle-btn">
              {isGuideOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {isGuideOpen && (
            <div className="lotes-guide-body">
              <div className="guide-cards-grid">
                {(config.guia?.puntos || INITIAL_LOTES_CONFIG.guia.puntos).map((item, idx) => (
                  <div key={idx} className="guide-point-card">
                    <span className="point-number">{idx + 1}</span>
                    <h4 className="point-question">{item.pregunta}</h4>
                    <p className="point-answer">{item.respuesta}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
