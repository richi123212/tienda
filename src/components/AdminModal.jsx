import React, { useState, useEffect } from 'react';
import { 
  X, PlusCircle, Trash2, Phone, Check, 
  Upload, Lock, LogOut, ArrowRight, ArrowLeft, KeyRound, User,
  Eye, EyeOff, Edit3, AlertOctagon, CheckCircle2, RotateCcw, Package,
  Home, ChevronRight, Camera
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { getProductImages } from './ProductCard';

export default function AdminModal({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onUpdateProduct,
  onToggleAgotado,
  onDeleteProduct,
  whatsappNumber,
  onSaveWhatsAppNumber
}) {
  // Siempre pedir inicio de sesión al abrir el modal
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAuthenticated(false);
      setUserInput('');
      setPasswordInput('');
      setLoginError('');
      setEditingProduct(null);
      setPhotoSlots([
        { file: null, preview: '', url: '' },
        { file: null, preview: '', url: '' },
        { file: null, preview: '', url: '' }
      ]);
      setActiveTab('menu'); // Abre siempre en el Menú Principal
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Login form states
  const [userInput, setUserInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'list', 'new', 'whatsapp', 'security'

  // Product Editor State
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State (para nuevo y para editar)
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: 5,
    categoria: 'Comida',
    descripcion: '',
    tipo_envio: 'Local',
    imagen_url: ''
  });
  
  // Soporte de 1 a 3 fotos para cada producto
  const [photoSlots, setPhotoSlots] = useState([
    { file: null, preview: '', url: '' },
    { file: null, preview: '', url: '' },
    { file: null, preview: '', url: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Security credentials change
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [credSaved, setCredSaved] = useState(false);

  // WhatsApp
  const [tempPhone, setTempPhone] = useState(whatsappNumber);
  const [phoneSaved, setPhoneSaved] = useState(false);

  if (!isOpen) return null;

  const getStoredCredentials = () => {
    const stored = localStorage.getItem('tienda_credentials');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.usuario && parsed.usuario !== 'admin' && parsed.usuario !== 'richi') {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const trimmedUser = userInput.trim().toLowerCase();
    const enteredPassword = passwordInput.trim();

    // 1. Probar con Supabase Auth si es correo
    if (isSupabaseConfigured && supabase && trimmedUser.includes('@')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedUser,
          password: enteredPassword
        });
        if (!error && data?.session) {
          setIsAuthenticated(true);
          setIsLoggingIn(false);
          setUserInput('');
          setPasswordInput('');
          return;
        }
      } catch (err) {
        console.warn('Error en Supabase auth...');
      }
    }

    // 2. Credenciales estrictas de alta seguridad
    const masterUser = (import.meta.env.VITE_ADMIN_USER || 'adm_x92_tiendapro').toLowerCase();
    const masterPass = import.meta.env.VITE_ADMIN_PASS || 'Wp8$mX#92vL!kQ2026&';

    const customCreds = getStoredCredentials();
    const expectedUser = customCreds?.usuario ? customCreds.usuario.toLowerCase() : masterUser;
    const expectedPass = customCreds?.password || masterPass;

    const isUserValid = trimmedUser === expectedUser;
    const isPassValid = enteredPassword === expectedPass;

    if (isUserValid && isPassValid) {
      setIsAuthenticated(true);
      setUserInput('');
      setPasswordInput('');
      setIsLoggingIn(false);
    } else {
      setIsLoggingIn(false);
      setLoginError('Usuario o contraseña incorrectos. Verifica mayúsculas y minúsculas.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
  };

  const handleStartEdit = (product) => {
    setEditingProduct(product);
    const existingImgs = getProductImages(product);
    setFormData({
      nombre: product.nombre,
      precio: product.precio,
      stock: product.stock !== undefined ? product.stock : 5,
      categoria: product.categoria,
      descripcion: product.descripcion || '',
      tipo_envio: product.tipo_envio || 'Local',
      imagen_url: product.imagen_url || ''
    });
    setPhotoSlots([
      { file: null, preview: existingImgs[0] || '', url: existingImgs[0] || '' },
      { file: null, preview: existingImgs[1] || '', url: existingImgs[1] || '' },
      { file: null, preview: existingImgs[2] || '', url: existingImgs[2] || '' }
    ]);
    setActiveTab('new'); // usa el formulario
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      precio: '',
      stock: 5,
      categoria: 'Comida',
      descripcion: '',
      tipo_envio: 'Local',
      imagen_url: ''
    });
    setPhotoSlots([
      { file: null, preview: '', url: '' },
      { file: null, preview: '', url: '' },
      { file: null, preview: '', url: '' }
    ]);
    setActiveTab('list');
  };

  const handleCategoryChange = (cat) => {
    const defaultEnvio = cat === 'Comida' ? 'Local' : 'Nacional';
    setFormData({
      ...formData,
      categoria: cat,
      tipo_envio: defaultEnvio
    });
  };

  const handleSlotFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoSlots((prev) => {
          const next = [...prev];
          next[index] = { file, preview: reader.result, url: '' };
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSlot = (index) => {
    setPhotoSlots((prev) => {
      const next = [...prev];
      next[index] = { file: null, preview: '', url: '' };
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio) {
      alert('Por favor ingresa nombre y precio.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        // ACTUALIZAR PRODUCTO EXISTENTE CON HASTA 3 FOTOS
        const updated = {
          ...editingProduct,
          nombre: formData.nombre,
          precio: parseFloat(formData.precio),
          stock: parseInt(formData.stock, 10) || 0,
          categoria: formData.categoria,
          descripcion: formData.descripcion,
          tipo_envio: formData.tipo_envio,
          agotado: (parseInt(formData.stock, 10) || 0) <= 0
        };
        await onUpdateProduct(updated, photoSlots);
        handleCancelEdit();
      } else {
        // CREAR NUEVO PRODUCTO CON HASTA 3 FOTOS
        const newProduct = {
          id: 'prod-' + Date.now(),
          nombre: formData.nombre,
          precio: parseFloat(formData.precio),
          stock: parseInt(formData.stock, 10) || 5,
          categoria: formData.categoria,
          descripcion: formData.descripcion || 'Producto disponible en catálogo.',
          tipo_envio: formData.tipo_envio,
          agotado: (parseInt(formData.stock, 10) || 5) <= 0
        };

        await onAddProduct(newProduct, photoSlots);
        handleCancelEdit();
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar el producto.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNewCredentials = (e) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    
    const updated = {
      usuario: newUsername.trim(),
      password: newPassword.trim()
    };
    localStorage.setItem('tienda_credentials', JSON.stringify(updated));
    setCredSaved(true);
    setNewUsername('');
    setNewPassword('');
    setTimeout(() => setCredSaved(false), 2500);
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
              <Lock size={17} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', lineHeight: 1.1 }}>
                {isAuthenticated ? 'Administración de Catálogo' : 'Acceso'}
              </h2>
              {isAuthenticated && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Inventario, existencias y productos
                </p>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAuthenticated && (
              <button 
                onClick={handleLogout}
                style={{ 
                  background: 'none', 
                  border: '1px solid var(--border-medium)', 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  fontSize: '0.78rem', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--text-secondary)'
                }}
                title="Cerrar sesión de administrador"
              >
                <LogOut size={13} />
                <span>Salir</span>
              </button>
            )}
            <button className="drawer-close-btn" onClick={onClose}>
              <X size={19} />
            </button>
          </div>
        </div>

        {/* SI NO ESTA AUTENTICADO: LOGIN */}
        {!isAuthenticated ? (
          <div className="admin-body">
            <div className="login-box">
              <h3 className="login-title">Iniciar Sesión</h3>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label className="form-label">Usuario</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Usuario"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label className="form-label">Contraseña</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      className="form-control"
                      style={{ width: '100%', paddingRight: '42px' }}
                      placeholder="Contraseña"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                      }}
                      title={showPassword ? "Ocultar" : "Mostrar"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div style={{ color: 'var(--danger)', fontSize: '0.82rem', textAlign: 'left' }}>
                    {loginError}
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={isLoggingIn} style={{ width: '100%', marginTop: '4px' }}>
                  <span>{isLoggingIn ? 'Verificando...' : 'Iniciar Sesión'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* SI ESTA AUTENTICADO: NAVEGACION Y VISTAS */
          <>
            <div className="admin-menu-bar">
              <button 
                className={`menu-pill-btn ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => { setActiveTab('menu'); setEditingProduct(null); }}
                title="Panel de Control Principal"
              >
                <Home size={16} />
                <span>Menú</span>
              </button>

              <button 
                className={`menu-pill-btn ${activeTab === 'list' ? 'active' : ''}`}
                onClick={() => { setActiveTab('list'); setEditingProduct(null); }}
                title="Ver lista de productos y existencias"
              >
                <Package size={16} />
                <span>Inventario</span>
              </button>

              <button 
                className={`menu-pill-btn ${activeTab === 'new' ? 'active' : ''}`}
                onClick={() => {
                  if (!editingProduct) {
                    setFormData({
                      nombre: '',
                      precio: '',
                      stock: 5,
                      categoria: 'Comida',
                      descripcion: '',
                      tipo_envio: 'Local',
                      imagen_url: ''
                    });
                    setPhotoSlots([
                      { file: null, preview: '', url: '' },
                      { file: null, preview: '', url: '' },
                      { file: null, preview: '', url: '' }
                    ]);
                  }
                  setActiveTab('new');
                }}
                title="Publicar nuevo producto"
              >
                <PlusCircle size={16} />
                <span>{editingProduct ? 'Editar' : 'Publicar'}</span>
              </button>

              <button 
                className={`menu-pill-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
                onClick={() => setActiveTab('whatsapp')}
                title="Configuración de WhatsApp"
              >
                <Phone size={16} />
                <span>WhatsApp</span>
              </button>

              <button 
                className={`menu-pill-btn ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
                title="Ajustes de Seguridad"
              >
                <KeyRound size={16} />
                <span>Seguridad</span>
              </button>
            </div>

            <div className="admin-body">
              {/* TAB 0: MENU PRINCIPAL / CENTRO DE CONTROL (DEFAULT) */}
              {activeTab === 'menu' && (
                <div className="admin-menu-view">
                  <div className="admin-menu-welcome">
                    <h3 className="admin-menu-title">Panel de Control</h3>
                    <p className="admin-menu-desc">
                      Selecciona una opción para administrar tu tienda fácilmente:
                    </p>
                  </div>

                  <div className="admin-cards-grid">
                    {/* Tarjeta 1: Inventario */}
                    <div 
                      className="admin-dashboard-card"
                      onClick={() => { setActiveTab('list'); setEditingProduct(null); }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="card-top-row">
                        <div className="card-icon-box">
                          <Package size={22} />
                        </div>
                        <span className="card-badge">
                          {products.length} productos
                        </span>
                      </div>
                      <div className="card-text-wrap">
                        <h4 className="card-heading">Inventario y Existencias</h4>
                        <p className="card-subtext">
                          Revisa artículos, ajusta existencias (piezas), pon en pausa agotados o elimina.
                        </p>
                      </div>
                      <div className="card-action-link">
                        <span>Ver Catálogo</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    {/* Tarjeta 2: Publicar */}
                    <div 
                      className="admin-dashboard-card"
                      onClick={() => {
                        handleCancelEdit();
                        setActiveTab('new');
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="card-top-row">
                        <div className="card-icon-box">
                          <PlusCircle size={22} />
                        </div>
                        <span className="card-badge highlight">
                          + Añadir
                        </span>
                      </div>
                      <div className="card-text-wrap">
                        <h4 className="card-heading">Publicar Nuevo Producto</h4>
                        <p className="card-subtext">
                          Sube ropa o alimentos con fotografía, precio, existencias y categoría.
                        </p>
                      </div>
                      <div className="card-action-link">
                        <span>Subir Producto</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    {/* Tarjeta 3: WhatsApp */}
                    <div 
                      className="admin-dashboard-card"
                      onClick={() => setActiveTab('whatsapp')}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="card-top-row">
                        <div className="card-icon-box whatsapp-box">
                          <Phone size={22} />
                        </div>
                        <span className="card-badge whatsapp-badge">
                          +{whatsappNumber || 'Sin número'}
                        </span>
                      </div>
                      <div className="card-text-wrap">
                        <h4 className="card-heading">WhatsApp de Pedidos</h4>
                        <p className="card-subtext">
                          El teléfono donde recibirás los pedidos generados por tus clientes en la bolsa.
                        </p>
                      </div>
                      <div className="card-action-link">
                        <span>Configurar WhatsApp</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    {/* Tarjeta 4: Seguridad */}
                    <div 
                      className="admin-dashboard-card"
                      onClick={() => setActiveTab('security')}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="card-top-row">
                        <div className="card-icon-box">
                          <KeyRound size={22} />
                        </div>
                        <span className="card-badge">
                          Privado
                        </span>
                      </div>
                      <div className="card-text-wrap">
                        <h4 className="card-heading">Seguridad y Contraseña</h4>
                        <p className="card-subtext">
                          Modifica tu usuario o clave secreta para mantener protegido el acceso.
                        </p>
                      </div>
                      <div className="card-action-link">
                        <span>Ajustes de Seguridad</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Resumen rápido al pie */}
                  <div className="admin-status-banner">
                    <div className="status-item">
                      <span className="status-label">Total en Catálogo</span>
                      <strong className="status-val">{products.length} artículos</strong>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Disponibles</span>
                      <strong className="status-val" style={{ color: 'var(--success)' }}>
                        {products.filter(p => !p.agotado && (p.stock !== undefined ? p.stock > 0 : true)).length} en stock
                      </strong>
                    </div>
                    <div className="status-item">
                      <span className="status-label">Agotados</span>
                      <strong className="status-val" style={{ color: 'var(--danger)' }}>
                        {products.filter(p => p.agotado || (p.stock !== undefined && p.stock <= 0)).length} agotados
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: INVENTARIO CON CANTIDADES, AGOTADO Y ELIMINAR */}
              {activeTab === 'list' && (
                <div>
                  <div className="section-nav-header">
                    <button 
                      type="button" 
                      className="back-nav-btn"
                      onClick={() => setActiveTab('menu')}
                    >
                      <ArrowLeft size={15} />
                      <span>Volver al Menú</span>
                    </button>
                    <span className="section-badge-info">{products.length} Productos</span>
                  </div>

                  {/* Resumen rápido del negocio */}
                  <div className="admin-quick-dashboard">
                    <div className="summary-pill">
                      <span className="summary-num">{products.length}</span>
                      <span className="summary-label">Artículos</span>
                    </div>
                    <div className="summary-pill">
                      <span className="summary-num" style={{ color: 'var(--success)' }}>
                        {products.filter(p => !p.agotado && (p.stock !== undefined ? p.stock > 0 : true)).length}
                      </span>
                      <span className="summary-label">En Stock</span>
                    </div>
                    <div className="summary-pill">
                      <span className="summary-num" style={{ color: 'var(--danger)' }}>
                        {products.filter(p => p.agotado || (p.stock !== undefined && p.stock <= 0)).length}
                      </span>
                      <span className="summary-label">Agotados</span>
                    </div>
                  </div>

                  {/* Accesos directos para que nada quede olvidado */}
                  <div className="admin-quick-shortcuts">
                    <button 
                      className="submit-btn" 
                      style={{ padding: '9px 14px', fontSize: '0.82rem', flex: '1 1 auto' }}
                      onClick={() => {
                        setEditingProduct(null);
                        setFormData({
                          nombre: '',
                          precio: '',
                          stock: 5,
                          categoria: 'Comida',
                          descripcion: '',
                          tipo_envio: 'Local',
                          imagen_url: ''
                        });
                        setPhotoSlots([
                          { file: null, preview: '', url: '' },
                          { file: null, preview: '', url: '' },
                          { file: null, preview: '', url: '' }
                        ]);
                        setActiveTab('new');
                      }}
                    >
                      <PlusCircle size={15} />
                      <span>+ Publicar Nuevo</span>
                    </button>

                    <button 
                      type="button" 
                      className="action-btn"
                      style={{ fontSize: '0.8rem', padding: '0 12px', height: '38px' }}
                      onClick={() => setActiveTab('whatsapp')}
                      title="Configurar teléfono de WhatsApp"
                    >
                      <Phone size={14} />
                      <span>WhatsApp</span>
                    </button>

                    <button 
                      type="button" 
                      className="action-btn"
                      style={{ fontSize: '0.8rem', padding: '0 12px', height: '38px' }}
                      onClick={() => setActiveTab('security')}
                      title="Cambiar contraseña"
                    >
                      <KeyRound size={14} />
                      <span>Seguridad</span>
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="product-admin-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Categoría</th>
                          <th>Precio</th>
                          <th>Existencias (Stock)</th>
                          <th>Estado</th>
                          <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => {
                          const stock = p.stock !== undefined ? parseInt(p.stock, 10) : 5;
                          const isAgotado = Boolean(p.agotado) || stock <= 0;

                          return (
                            <tr key={p.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <img 
                                    src={p.imagen_url} 
                                    alt={p.nombre} 
                                    style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '4px' }} 
                                  />
                                  <div>
                                    <strong>{p.nombre}</strong>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                      {p.tipo_envio === 'Local' ? 'Envío Local' : 'Envío Nacional'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>{p.categoria}</td>
                              <td style={{ fontWeight: 600 }}>${p.precio} MXN</td>
                              <td>
                                <strong style={{ color: stock <= 2 && !isAgotado ? '#b45309' : 'inherit' }}>
                                  {stock} piezas
                                </strong>
                              </td>
                              <td>
                                {isAgotado ? (
                                  <span className="badge-stock-agotado">
                                    <AlertOctagon size={12} />
                                    <span>Agotado</span>
                                  </span>
                                ) : (
                                  <span className="badge-stock-ok">
                                    <CheckCircle2 size={12} />
                                    <span>Disponible</span>
                                  </span>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                  {/* Botón 1: Editar */}
                                  <button 
                                    className="edit-btn"
                                    onClick={() => handleStartEdit(p)}
                                    title="Modificar precio, nombre, foto o stock"
                                  >
                                    <Edit3 size={13} />
                                    <span>Editar</span>
                                  </button>

                                  {/* Botón 2: Marcar Agotado / Reactivar (DIVIDIDO) */}
                                  <button 
                                    className={`toggle-agotado-btn ${isAgotado ? 'reactivar' : 'marcar-agotado'}`}
                                    onClick={() => onToggleAgotado(p)}
                                    title={isAgotado ? "Reactivar y poner en stock" : "Marcar como agotado sin borrarlo"}
                                  >
                                    {isAgotado ? (
                                      <>
                                        <RotateCcw size={13} />
                                        <span>Reactivar</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertOctagon size={13} />
                                        <span>Agotado</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Botón 3: Eliminar permanente */}
                                  <button 
                                    className="delete-btn"
                                    onClick={() => {
                                      if (confirm(`¿Eliminar definitivamente "${p.nombre}" de la base de datos? Esta acción no se puede deshacer.`)) {
                                        onDeleteProduct(p.id);
                                      }
                                    }}
                                    title="Eliminar de forma permanente"
                                  >
                                    <Trash2 size={13} />
                                    <span>Eliminar</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: FORMULARIO (NUEVO O EDITOR) */}
              {activeTab === 'new' && (
                <div>
                  <div className="section-nav-header">
                    <button 
                      type="button" 
                      className="back-nav-btn"
                      onClick={() => {
                        handleCancelEdit();
                        setActiveTab('menu');
                      }}
                    >
                      <ArrowLeft size={15} />
                      <span>Volver al Menú</span>
                    </button>
                    <span className="section-badge-info">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</span>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: 0 }}>
                        {editingProduct ? `Editando: ${editingProduct.nombre}` : 'Publicar Nuevo Producto'}
                      </h3>
                      {editingProduct && (
                        <button 
                          type="button" 
                          onClick={handleCancelEdit}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.82rem' }}
                        >
                          Cancelar edición
                        </button>
                      )}
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Nombre del Producto o Platillo</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="Ej. Vestido de Lino o Rib Eye"
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
                          placeholder="Ej. 450"
                          value={formData.precio}
                          onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Cantidad Disponible (Stock / Piezas)</label>
                        <input 
                          type="number" 
                          min="0"
                          className="form-control"
                          placeholder="Ej. 10"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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

                      <div className="form-group full-width">
                        <label className="form-label">Modalidad de Envío</label>
                        <select 
                          className="form-control"
                          value={formData.tipo_envio}
                          onChange={(e) => setFormData({ ...formData, tipo_envio: e.target.value })}
                        >
                          <option value="Local">Envío Local (Alimentos / Inmediato)</option>
                          <option value="Nacional">Envío Nacional por Paquetería</option>
                        </select>
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">Descripción</label>
                        <textarea 
                          className="form-control"
                          rows="2"
                          placeholder="Detalles, tallas o ingredientes..."
                          value={formData.descripcion}
                          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                      </div>

                      <div className="form-group full-width">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label className="form-label" style={{ margin: 0 }}>
                            Fotos del Producto (de 1 a 3 fotos)
                          </label>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {photoSlots.filter(s => s.preview || s.url).length}/3 fotos agregadas
                          </span>
                        </div>
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                          Puedes subir hasta 3 fotos para que los clientes las deslicen en el catálogo.
                        </p>

                        <div className="admin-photo-slots-grid">
                          {[0, 1, 2].map((idx) => {
                            const slot = photoSlots[idx];
                            const hasPhoto = Boolean(slot.preview || slot.url);

                            return (
                              <div key={idx} className="admin-photo-slot">
                                <div className="photo-slot-header">
                                  <span className="photo-slot-label">
                                    {idx === 0 ? 'Foto 1 (Principal)' : `Foto ${idx + 1} (Opcional)`}
                                  </span>
                                  {hasPhoto && (
                                    <button
                                      type="button"
                                      className="photo-remove-btn"
                                      onClick={() => handleRemoveSlot(idx)}
                                      title="Quitar esta foto"
                                    >
                                      <Trash2 size={12} />
                                      <span>Quitar</span>
                                    </button>
                                  )}
                                </div>

                                {hasPhoto ? (
                                  <div className="photo-slot-filled">
                                    <img 
                                      src={slot.preview || slot.url} 
                                      alt={`Foto ${idx + 1}`} 
                                      className="slot-img-preview"
                                    />
                                    <label className="slot-change-overlay">
                                      <Upload size={13} />
                                      <span>Cambiar</span>
                                      <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => handleSlotFileChange(idx, e)}
                                        style={{ display: 'none' }}
                                      />
                                    </label>
                                  </div>
                                ) : (
                                  <label className="photo-slot-empty">
                                    <Camera size={19} color="var(--text-muted)" />
                                    <span className="slot-empty-title">
                                      {idx === 0 ? '+ Foto Principal' : `+ Foto ${idx + 1}`}
                                    </span>
                                    <span className="slot-empty-sub">Toca para agregar</span>
                                    <input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={(e) => handleSlotFileChange(idx, e)}
                                      style={{ display: 'none' }}
                                    />
                                  </label>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="form-group full-width" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <button type="submit" className="submit-btn" disabled={submitting} style={{ flex: 1 }}>
                          <PlusCircle size={17} />
                          <span>
                            {submitting 
                              ? 'Guardando...' 
                              : (editingProduct ? 'Guardar Cambios del Producto' : 'Publicar Producto')}
                          </span>
                        </button>
                        {editingProduct && (
                          <button 
                            type="button" 
                            className="action-btn"
                            onClick={handleCancelEdit}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: WHATSAPP */}
              {activeTab === 'whatsapp' && (
                <div>
                  <div className="section-nav-header">
                    <button 
                      type="button" 
                      className="back-nav-btn"
                      onClick={() => setActiveTab('menu')}
                    >
                      <ArrowLeft size={15} />
                      <span>Volver al Menú</span>
                    </button>
                    <span className="section-badge-info">WhatsApp de Pedidos</span>
                  </div>

                  <div className="settings-card-box">
                    <div className="settings-card-header">
                      <div className="settings-icon-pill whatsapp-icon-pill">
                        <Phone size={22} />
                      </div>
                      <div>
                        <h3 className="settings-box-title">
                          WhatsApp para Pedidos
                        </h3>
                        <p className="settings-box-desc">
                          A este número telefónico llegarán automáticamente las compras que tus clientes armen en la bolsa.
                        </p>
                      </div>
                    </div>

                    <div className="settings-preview-bubble">
                      <span className="bubble-label">Número activo actualmente:</span>
                      <strong className="bubble-phone">
                        +{tempPhone || whatsappNumber}
                      </strong>
                    </div>

                    <form onSubmit={handleSavePhone} style={{ marginTop: '18px' }}>
                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">Número telefónico (con código de país)</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={tempPhone}
                          onChange={(e) => setTempPhone(e.target.value)}
                          placeholder="Ejemplo: 525512345678"
                          required
                          style={{ fontSize: '1rem', padding: '12px 14px' }}
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '6px' }}>
                          Escribe los 10 dígitos de tu celular precedidos por el código de país (ej. <strong>52</strong> para México). No incluyas espacios ni símbolos "+".
                        </small>
                      </div>

                      <button type="submit" className="submit-btn" style={{ width: '100%', padding: '12px' }}>
                        <Check size={17} />
                        <span>{phoneSaved ? '¡Número guardado correctamente!' : 'Guardar Número de WhatsApp'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: SEGURIDAD (CAMBIAR USUARIO Y CONTRASEÑA) */}
              {activeTab === 'security' && (
                <div>
                  <div className="section-nav-header">
                    <button 
                      type="button" 
                      className="back-nav-btn"
                      onClick={() => setActiveTab('menu')}
                    >
                      <ArrowLeft size={15} />
                      <span>Volver al Menú</span>
                    </button>
                    <span className="section-badge-info">Ajustes de Seguridad</span>
                  </div>

                  <div className="settings-card-box">
                    <div className="settings-card-header">
                      <div className="settings-icon-pill">
                        <KeyRound size={22} />
                      </div>
                      <div>
                        <h3 className="settings-box-title">
                          Cambiar Usuario y Contraseña
                        </h3>
                        <p className="settings-box-desc">
                          Personaliza tus credenciales para acceder al panel privado de administración.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveNewCredentials} style={{ marginTop: '18px' }}>
                      <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label className="form-label">Nuevo Usuario Administrador</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="Ejemplo: mi_usuario_secreto"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          required
                          style={{ fontSize: '0.95rem', padding: '11px 14px' }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '18px' }}>
                        <label className="form-label">Nueva Contraseña</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input 
                            type={showNewPassword ? 'text' : 'password'} 
                            className="form-control"
                            placeholder="Ingresa tu nueva clave privada"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={{ fontSize: '0.95rem', padding: '11px 44px 11px 14px', width: '100%' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 0
                            }}
                            title={showNewPassword ? "Ocultar" : "Mostrar"}
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.76rem', display: 'block', marginTop: '6px' }}>
                          Puedes usar letras, números y símbolos. Se aplicará de inmediato al guardar.
                        </small>
                      </div>

                      <button type="submit" className="submit-btn" style={{ width: '100%', padding: '12px' }}>
                        <Check size={17} />
                        <span>{credSaved ? '¡Credenciales actualizadas correctamente!' : 'Guardar Nuevas Credenciales'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
