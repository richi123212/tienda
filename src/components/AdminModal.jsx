import React, { useState, useEffect } from 'react';
import { 
  X, PlusCircle, Trash2, Phone, Check, 
  Upload, Lock, LogOut, ArrowRight, KeyRound, User,
  Eye, EyeOff, Edit3, AlertOctagon, CheckCircle2, RotateCcw
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabase';

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
      setIsAuthenticated(false);
      setUserInput('');
      setPasswordInput('');
      setLoginError('');
      setEditingProduct(null);
    }
  }, [isOpen]);
  
  // Login form states
  const [userInput, setUserInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'new', 'whatsapp', 'security'

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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Security credentials change
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
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
    setFormData({
      nombre: product.nombre,
      precio: product.precio,
      stock: product.stock !== undefined ? product.stock : 5,
      categoria: product.categoria,
      descripcion: product.descripcion || '',
      tipo_envio: product.tipo_envio || 'Local',
      imagen_url: product.imagen_url || ''
    });
    setImagePreview(product.imagen_url || '');
    setImageFile(null);
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
    setImagePreview('');
    setImageFile(null);
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
      alert('Por favor ingresa nombre y precio.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProduct) {
        // ACTUALIZAR PRODUCTO EXISTENTE
        const updated = {
          ...editingProduct,
          nombre: formData.nombre,
          precio: parseFloat(formData.precio),
          stock: parseInt(formData.stock, 10) || 0,
          categoria: formData.categoria,
          descripcion: formData.descripcion,
          tipo_envio: formData.tipo_envio,
          imagen_url: formData.imagen_url,
          agotado: (parseInt(formData.stock, 10) || 0) <= 0
        };
        await onUpdateProduct(updated, imageFile);
        handleCancelEdit();
      } else {
        // CREAR NUEVO PRODUCTO
        const newProduct = {
          id: 'prod-' + Date.now(),
          nombre: formData.nombre,
          precio: parseFloat(formData.precio),
          stock: parseInt(formData.stock, 10) || 5,
          categoria: formData.categoria,
          descripcion: formData.descripcion || 'Producto disponible en catálogo.',
          tipo_envio: formData.tipo_envio,
          imagen_url: formData.imagen_url || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
          agotado: (parseInt(formData.stock, 10) || 5) <= 0
        };

        await onAddProduct(newProduct, imageFile);
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
                {isAuthenticated ? 'Administración de Catálogo' : 'Acceso Privado'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {isAuthenticated ? 'Inventario, existencias y productos' : 'Identifícate con tus credenciales'}
              </p>
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
              <h3 className="login-title">Identificación</h3>
              <p className="login-desc">
                Ingresa con tu usuario o correo y contraseña para administrar.
              </p>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ textAlign: 'left' }}>
                  <label className="form-label">Usuario o Correo</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="Usuario o correo"
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
          /* SI ESTA AUTENTICADO: TABS */
          <>
            <div className="admin-nav-tabs">
              <button 
                className={`admin-nav-tab ${activeTab === 'list' ? 'active' : ''}`}
                onClick={() => { setActiveTab('list'); setEditingProduct(null); }}
              >
                <span>Inventario ({products.length})</span>
              </button>
              <button 
                className={`admin-nav-tab ${activeTab === 'new' ? 'active' : ''}`}
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
                    setImagePreview('');
                  }
                  setActiveTab('new');
                }}
              >
                <PlusCircle size={15} />
                <span>{editingProduct ? 'Editar Producto' : 'Publicar Producto'}</span>
              </button>
              <button 
                className={`admin-nav-tab ${activeTab === 'whatsapp' ? 'active' : ''}`}
                onClick={() => setActiveTab('whatsapp')}
              >
                <Phone size={15} />
                <span>WhatsApp</span>
              </button>
              <button 
                className={`admin-nav-tab ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <KeyRound size={15} />
                <span>Seguridad</span>
              </button>
            </div>

            <div className="admin-body">
              {/* TAB 1: INVENTARIO CON CANTIDADES, AGOTADO Y ELIMINAR */}
              {activeTab === 'list' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Gestiona existencias, marca artículos agotados o edita detalles.
                    </p>
                    <button 
                      className="submit-btn" 
                      style={{ padding: '8px 14px', fontSize: '0.82rem' }}
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
                        setImagePreview('');
                        setActiveTab('new');
                      }}
                    >
                      <PlusCircle size={14} />
                      <span>Nuevo Producto</span>
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
                      <label className="form-label">Foto del Producto (Galería o Cámara)</label>
                      <label className="file-dropzone">
                        <Upload size={22} color="var(--text-secondary)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                          {editingProduct ? 'Toca para cambiar la foto (o déjala tal como está)' : 'Toca aquí para seleccionar una foto de tu celular o PC'}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                      </label>

                      {imagePreview && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                          <img src={imagePreview} alt="Previsualización" className="preview-thumb" />
                          <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                            Foto lista para el producto
                          </span>
                        </div>
                      )}
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
              )}

              {/* TAB 3: WHATSAPP */}
              {activeTab === 'whatsapp' && (
                <div style={{ maxWidth: '480px' }}>
                  <form onSubmit={handleSavePhone}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label">Número de WhatsApp de Ventas</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={tempPhone}
                        onChange={(e) => setTempPhone(e.target.value)}
                        placeholder="Ejemplo: 525512345678"
                        required
                      />
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Incluye código de país (52 para México).
                      </small>
                    </div>

                    <button type="submit" className="submit-btn">
                      <Check size={16} />
                      <span>{phoneSaved ? 'Guardado correctamente' : 'Guardar Número'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: SEGURIDAD (CAMBIAR USUARIO Y CONTRASEÑA) */}
              {activeTab === 'security' && (
                <div style={{ maxWidth: '480px' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Personalizar Usuario y Contraseña
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                    Puedes cambiar tu usuario y clave privada en cualquier momento.
                  </p>

                  <form onSubmit={handleSaveNewCredentials}>
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label">Nuevo Usuario</label>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Ejemplo: mi_usuario_privado"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '18px' }}>
                      <label className="form-label">Nueva Contraseña</label>
                      <input 
                        type="password" 
                        className="form-control"
                        placeholder="Ingresa tu nueva clave segura"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="submit-btn">
                      <Check size={16} />
                      <span>{credSaved ? '¡Credenciales actualizadas!' : 'Guardar Nuevas Credenciales'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
