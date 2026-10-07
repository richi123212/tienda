import React, { useState } from 'react';
import { 
  X, PlusCircle, Trash2, Database, Phone, Check, Copy, 
  Upload, Image as ImageIcon, ShieldAlert, Sparkles 
} from 'lucide-react';
import { isSupabaseConfigured, SUPABASE_SQL_SCRIPT } from '../supabase';

export default function AdminModal({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onDeleteProduct,
  whatsappNumber,
  onSaveWhatsAppNumber
}) {
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'list', 'whatsapp', 'supabase'
  const [copiedSql, setCopiedSql] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: 'Comida',
    descripcion: '',
    tipo_envio: 'Local',
    imagen_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tempPhone, setTempPhone] = useState(whatsappNumber);
  const [phoneSaved, setPhoneSaved] = useState(false);

  if (!isOpen) return null;

  const handleCategoryChange = (cat) => {
    // Si es comida, por defecto envío Local. Si es ropa/lucha, Nacional.
    const defaultEnvio = cat === 'Comida' ? 'Local' : 'Nacional';
    setFormData({
      ...formData,
      categoria: cat,
      tipo_envio: defaultEnvio
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, imagen_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio) {
      alert('Por favor ingresa al menos el nombre y precio del producto.');
      return;
    }

    setSubmitting(true);
    try {
      const newProduct = {
        id: 'prod-' + Date.now(),
        nombre: formData.nombre,
        precio: parseFloat(formData.precio),
        categoria: formData.categoria,
        descripcion: formData.descripcion || 'Producto de alta calidad disponible en tienda.',
        tipo_envio: formData.tipo_envio,
        imagen_url: formData.imagen_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
      };

      await onAddProduct(newProduct, imageFile);
      
      // Reset form
      setFormData({
        nombre: '',
        precio: '',
        categoria: 'Comida',
        descripcion: '',
        tipo_envio: 'Local',
        imagen_url: ''
      });
      setImageFile(null);
      setImagePreview('');
      setActiveTab('list');
    } catch (err) {
      console.error(err);
      alert('Error al guardar el producto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSavePhone = (e) => {
    e.preventDefault();
    onSaveWhatsAppNumber(tempPhone);
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabecera del modal */}
        <div className="admin-header">
          <div className="admin-title-wrap">
            <div className="admin-icon-pill">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>
                Panel de Control Privado
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Gestión para familiares y administradores de la tienda
              </p>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Pestañas de navegación interna */}
        <div className="admin-nav-tabs">
          <button 
            className={`admin-nav-tab ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            <PlusCircle size={15} />
            <span>Publicar Nuevo Producto</span>
          </button>
          <button 
            className={`admin-nav-tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <span>Inventario ({products.length})</span>
          </button>
          <button 
            className={`admin-nav-tab ${activeTab === 'whatsapp' ? 'active' : ''}`}
            onClick={() => setActiveTab('whatsapp')}
          >
            <Phone size={15} />
            <span>Número de WhatsApp</span>
          </button>
          <button 
            className={`admin-nav-tab ${activeTab === 'supabase' ? 'active' : ''}`}
            onClick={() => setActiveTab('supabase')}
          >
            <Database size={15} />
            <span>Conexión Supabase</span>
          </button>
        </div>

        {/* Cuerpo del modal según pestaña */}
        <div className="admin-body">
          
          {/* TAB 1: FORMULARIO AGREGAR PRODUCTO */}
          {activeTab === 'new' && (
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                
                <div className="form-group">
                  <label className="form-label">Nombre del Producto / Platillo</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Ej. Rib Eye Marinado o Vestido de Lino"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Precio ($ MXN)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    placeholder="Ej. 380"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select 
                    className="form-control"
                    value={formData.categoria}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="Comida">Comida</option>
                    <option value="Ropa Mujer">Ropa Mujer</option>
                    <option value="Ropa Hombre">Ropa Hombre</option>
                    <option value="Lucha Libre">Lucha Libre</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Modalidad de Envío</label>
                  <select 
                    className="form-control"
                    value={formData.tipo_envio}
                    onChange={(e) => setFormData({ ...formData, tipo_envio: e.target.value })}
                  >
                    <option value="Local">Envío Local (Inmediato / Alimentos)</option>
                    <option value="Nacional">Envío Nacional (Paquetería)</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Descripción o Ingredientes / Tallas</label>
                  <textarea 
                    className="form-control"
                    rows="3"
                    placeholder="Describe detalles, cortes, tallas disponibles o ingredientes del platillo..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Foto del Producto (Desde tu celular o computadora)</label>
                  <label className="file-dropzone">
                    <Upload size={24} color="var(--accent-gold)" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>
                      Toca aquí para seleccionar una foto de tu galería
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Formatos JPG, PNG, WEBP
                    </span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {imagePreview && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '10px' }}>
                      <img src={imagePreview} alt="Previsualización" className="preview-thumb" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                        Foto cargada correctamente para la publicación
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group full-width" style={{ marginTop: '10px' }}>
                  <button type="submit" className="submit-btn" disabled={submitting}>
                    <PlusCircle size={18} />
                    <span>{submitting ? 'Publicando...' : 'Publicar Producto en Tienda'}</span>
                  </button>
                </div>

              </div>
            </form>
          )}

          {/* TAB 2: INVENTARIO / BORRAR AGOTADOS */}
          {activeTab === 'list' && (
            <div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Aquí puedes ver los artículos disponibles y eliminarlos con un clic cuando se te hayan agotado.
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table className="product-admin-table">
                  <thead>
                    <tr>
                      <th>Artículo</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Envío</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={p.imagen_url} 
                              alt={p.nombre} 
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                            />
                            <strong>{p.nombre}</strong>
                          </div>
                        </td>
                        <td>{p.categoria}</td>
                        <td style={{ color: 'var(--text-gold)', fontWeight: 600 }}>${p.precio} MXN</td>
                        <td>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            padding: '3px 8px', 
                            borderRadius: '4px',
                            background: p.tipo_envio === 'Local' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            color: p.tipo_envio === 'Local' ? 'var(--success)' : 'var(--text-secondary)'
                          }}>
                            {p.tipo_envio}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="delete-btn"
                            onClick={() => {
                              if (confirm(`¿Deseas marcar como agotado y eliminar "${p.nombre}"?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            title="Eliminar producto"
                          >
                            <Trash2 size={13} />
                            <span>Agotado (Borrar)</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: NUMERO DE WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div style={{ maxWidth: '540px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '8px' }}>
                Número de WhatsApp para recibir pedidos
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                A este número de WhatsApp llegarán los mensajes automáticos que los clientes envíen al presionar "Pedir por WhatsApp". Debe incluir código de país (ej. 52 para México).
              </p>

              <form onSubmit={handleSavePhone}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Número de WhatsApp (con lada)</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    placeholder="Ejemplo: 5215512345678"
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Formato recomendado para México: 52 seguido de tus 10 dígitos (ej. 525512345678).
                  </small>
                </div>

                <button type="submit" className="submit-btn">
                  <Check size={16} />
                  <span>{phoneSaved ? '¡Guardado correctamente!' : 'Guardar Número de WhatsApp'}</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: CONEXION SUPABASE */}
          {activeTab === 'supabase' && (
            <div>
              <div style={{ 
                padding: '14px 18px', 
                borderRadius: '8px', 
                marginBottom: '20px',
                background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(212, 175, 55, 0.1)',
                border: isSupabaseConfigured ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Database size={20} color={isSupabaseConfigured ? 'var(--success)' : 'var(--accent-gold)'} />
                <div>
                  <strong style={{ fontSize: '0.9rem', color: isSupabaseConfigured ? 'var(--success)' : 'var(--text-gold)' }}>
                    {isSupabaseConfigured ? 'Conectado exitosamente con Supabase' : 'Modo Demo Activo (Almacenamiento Local)'}
                  </strong>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    {isSupabaseConfigured 
                      ? 'Los productos y fotos se sincronizan directamente con tu base de datos y storage en la nube.'
                      : 'Actualmente estás viendo la tienda en modo demostración. Sigue los 2 pasos abajo para conectar tu Supabase gratuito.'}
                  </p>
                </div>
              </div>

              <h4 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Paso 1: Script SQL para crear tu tabla en Supabase
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Entra a tu proyecto en <strong>supabase.com</strong>, haz clic en <strong>SQL Editor</strong> en la barra izquierda, pega el siguiente código y presiona <strong>RUN</strong>:
              </p>

              <div className="code-box">
                <button className="copy-pill-btn" onClick={handleCopySql}>
                  {copiedSql ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  <span>{copiedSql ? 'Copiado' : 'Copiar SQL'}</span>
                </button>
                {SUPABASE_SQL_SCRIPT}
              </div>

              <h4 style={{ fontSize: '1rem', marginTop: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Paso 2: Crear el Storage para las Fotos
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                En tu panel de Supabase, ve a la sección <strong>Storage</strong>, crea un bucket llamado exactamente <code>fotos-productos</code> y marca la casilla <strong>"Public bucket"</strong>.
              </p>

              <h4 style={{ fontSize: '1rem', marginTop: '20px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Paso 3: Colocar tus credenciales en el archivo <code>.env.local</code>
              </h4>
              <div className="code-box">
{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_publica
VITE_WHATSAPP_NUMBER=525512345678`}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
