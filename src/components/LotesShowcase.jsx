import React, { useState } from 'react';
import { Sparkles, Check, Truck, ShieldCheck, HeartHandshake, Phone, ArrowRight, ShoppingBag } from 'lucide-react';

const LOTE_TIERS = [
  { piezas: 10, precio: 850, ahorro: '15%', popular: false, desc: 'Ideal para iniciar con poca inversión' },
  { piezas: 15, precio: 1200, ahorro: '18%', popular: false, desc: 'Variedad de prendas esenciales' },
  { piezas: 22, precio: 1650, ahorro: '20%', popular: true, desc: 'El más vendido para boutiques' },
  { piezas: 30, precio: 2150, ahorro: '22%', popular: false, desc: 'Surtido amplio de temporada' },
  { piezas: 50, precio: 3450, ahorro: '25%', popular: false, desc: 'Precio mayorista con alto margen' },
  { piezas: 60, precio: 4100, ahorro: '26%', popular: false, desc: 'Para tiendas con rotación continua' },
  { piezas: 100, precio: 6500, ahorro: '30%', popular: false, desc: 'Mega lote con máximo rendimiento' }
];

const BRANDS = ['Shein', 'Zara', 'Forever 21', 'Old Navy', 'H&M'];

export default function LotesShowcase({ 
  whatsappNumber, 
  onSelectCategory,
  onAddToCartDirect 
}) {
  const [selectedTier, setSelectedTier] = useState(LOTE_TIERS[2]); // 22 piezas por defecto

  const handleOrderLoteWhatsApp = (tier) => {
    const cleanPhone = (whatsappNumber || '').replace(/[^0-9]/g, '');
    const message = `Hola Universo Bonito, me interesa ordenar el siguiente Lote de Ropa de Dama:

*Lote de ${tier.piezas} Piezas*
Precio: $${tier.precio} MXN
Marcas: Shein, Zara, Forever 21, Old Navy, H&M
Tallas: XS, S, M, L, XL
Modalidad: Envío Nacional por paquetería

¿Me podrían brindar información de disponibilidad y datos de pago por transferencia? Gracias.`;

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
        descripcion: `Paquete de ${tier.piezas} prendas de dama al azar en tallas XS a XL de marcas Shein, Zara, Forever 21, H&M, Old Navy.`,
        imagen_url: '/banners/banner_lotes.jpg'
      });
    }
  };

  return (
    <section className="lotes-feature-section">
      <div className="lotes-feature-header">
        <div className="lotes-badge">
          <Sparkles size={14} />
          <span>Venta Especial para Emprendedoras</span>
        </div>
        <h2 className="lotes-main-title">
          Lotes de Ropa Universo Bonito
        </h2>
        <p className="lotes-main-desc">
          Arma tu propio negocio con lotes surtidos de las mejores marcas comerciales.
          Prendas nuevas con alta demanda y excelente retorno de inversión.
        </p>

        {/* Marcas incluidas */}
        <div className="lotes-brands-row">
          <span className="brands-title">Marcas incluidas:</span>
          <div className="brands-tags">
            {BRANDS.map((b) => (
              <span key={b} className="brand-tag-pill">{b}</span>
            ))}
            <span className="brand-tag-pill more">+ entre otras</span>
          </div>
        </div>
      </div>

      {/* Características clave en pills */}
      <div className="lotes-perks-grid">
        <div className="lote-perk-card">
          <div className="perk-icon"><ShieldCheck size={20} /></div>
          <div>
            <strong>Tallas XS, S, M, L y XL</strong>
            <p>Variedad de medidas para abarcar todo tipo de clientes.</p>
          </div>
        </div>

        <div className="lote-perk-card">
          <div className="perk-icon"><Sparkles size={20} /></div>
          <div>
            <strong>Solo Ropa de Dama</strong>
            <p>Vestidos, tops, blusas, faldas y conjuntos de temporada.</p>
          </div>
        </div>

        <div className="lote-perk-card">
          <div className="perk-icon"><HeartHandshake size={20} /></div>
          <div>
            <strong>Cambios en tu 2da compra</strong>
            <p>Garantía de respaldo para que tu dinero siempre rinda.</p>
          </div>
        </div>

        <div className="lote-perk-card">
          <div className="perk-icon"><Truck size={20} /></div>
          <div>
            <strong>Envíos Nacionales</strong>
            <p>Paquetería rápida y segura a cualquier rincón de México.</p>
          </div>
        </div>
      </div>

      {/* Selector interactivo de Lotes */}
      <div className="lotes-selector-box">
        <h3 className="selector-title">Elige el tamaño de tu lote:</h3>
        
        <div className="lote-tiers-grid">
          {LOTE_TIERS.map((tier) => {
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
                <p className="tier-desc">{tier.desc}</p>
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
    </section>
  );
}
