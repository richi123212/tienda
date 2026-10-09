import React, { useState, useEffect } from 'react';
import { 
  X, PlusCircle, Trash2, Phone, Check, 
  Upload, Lock, LogOut, ArrowRight, ArrowLeft, KeyRound,
  Eye, EyeOff, Edit3, AlertOctagon, CheckCircle2, RotateCcw, Package,
  Home, ChevronRight, Camera, Layers, Image as ImageIcon, Link as LinkIcon, 
  Clock, Tag, Truck, Shield, MapPin, Globe, ExternalLink, MessageSquare, Sparkles, HelpCircle
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { getProductImages } from './ProductCard';
import { DEFAULT_WHATSAPP_TEMPLATE, INITIAL_LOTES_CONFIG } from '../data/initialProducts';

export default function AdminModal({
  isOpen,
  onClose,
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onToggleAgotado,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
  banners,
  onAddBanner,
  onDeleteBanner,
  onToggleBannerActive,
  socialLinks,
  onAddSocialLink,
  onDeleteSocialLink,
  foodSchedule,
  onUpdateFoodSchedule,
  whatsappNumber,
  onSaveWhatsAppNumber,
  whatsappTemplate,
  onSaveWhatsAppTemplate,
  lotesConfig,
  onSaveLotesConfig
}) {
  // Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAuthenticated(false);
      setUserInput('');
      setPasswordInput('');
      setLoginError('');
      setEditingProduct(null);
      setTempTemplate(whatsappTemplate || DEFAULT_WHATSAPP_TEMPLATE);
      setTempLotesConfig(lotesConfig || INITIAL_LOTES_CONFIG);
      setLotesSaved(false);
      setPhotoSlots([
        { file: null, preview: '', url: '' },
        { file: null, preview: '', url: '' },
        { file: null, preview: '', url: '' }
      ]);
      setActiveTab('menu');
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
  
  // Tabs: 'menu', 'list', 'new', 'categories', 'banners', 'links', 'schedule', 'whatsapp', 'security'
  const [activeTab, setActiveTab] = useState('menu');

  // Product Editor State
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State para productos
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    precio_anterior: '',
    stock: 5,
    categoria: categories?.[0] || 'Lotes de Ropa',
    descripcion: '',
    tipo_envio: 'Local',
    imagen_url: ''
  });
  
  // Soporte de fotos para producto
  const [photoSlots, setPhotoSlots] = useState([
    { file: null, preview: '', url: '' },
    { file: null, preview: '', url: '' },
    { file: null, preview: '', url: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  // Estado para Nueva Categoría
  const [newCategoryName, setNewCategoryName] = useState('');

  // Estado para Nuevo Banner
  const [newBannerData, setNewBannerData] = useState({
    titulo: '',
    subtitulo: '',
    imagen_url: '',
    categoria_destino: categories?.[0] || '',
    boton_texto: 'Ver Promoción'
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');

  // Estado para Redes Sociales
  const [newLinkData, setNewLinkData] = useState({
    plataforma: 'Facebook',
    nombre: '',
    url: ''
  });

  // Estado para Horario de Comida
  const [tempSchedule, setTempSchedule] = useState({
    horario: foodSchedule?.horario || '12:30 PM a 12:30 AM',
    dias: foodSchedule?.dias || 'Todos los días',
    nota: foodSchedule?.nota || 'Servicio a domicilio y pedidos por WhatsApp',
    activo: foodSchedule?.activo ?? true
  });
  const [scheduleSaved, setScheduleSaved] = useState(false);

  // Security credentials change
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [credSaved, setCredSaved] = useState(false);

  // WhatsApp
  const [tempPhone, setTempPhone] = useState(whatsappNumber);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [tempTemplate, setTempTemplate] = useState(whatsappTemplate || DEFAULT_WHATSAPP_TEMPLATE);
  const [templateSaved, setTemplateSaved] = useState(false);

  // Lotes de Ropa y Guía Dinámica
  const [tempLotesConfig, setTempLotesConfig] = useState(() => lotesConfig || INITIAL_LOTES_CONFIG);
  const [lotesSaved, setLotesSaved] = useState(false);
  const [newTierPieces, setNewTierPieces] = useState('');
  const [newTierPrice, setNewTierPrice] = useState('');
  const [newTierDesc, setNewTierDesc] = useState('');
  const [newTierPopular, setNewTierPopular] = useState(false);

  useEffect(() => {
    if (lotesConfig) {
      setTempLotesConfig(lotesConfig);
    }
  }, [lotesConfig]);

  if (!isOpen) return null;

  const getStoredCredentials = () => {
    const stored = localStorage.getItem('tienda_credentials');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.usuario && parsed.usuario !== 'admin' && parsed.usuario !== 'richi') {
          return parsed;
        }
      } catch (e) {}
    }
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const trimmedUser = userInput.trim().toLowerCase();
    const enteredPassword = passwordInput.trim();

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

    const masterUser = (import.meta.env.VITE_ADMIN_USER || 'adm_x92_tiendapro').toLowerCase();
    const masterPass = import.meta.env.VITE_ADMIN_PASS || 'Wp8$mX#92vL!kQ2026&';
    const customCreds = getStoredCredentials();

    const cleanUser = trimmedUser.replace(/[\u200B-\u200D\uFEFF]/g, '');
    const cleanPass = enteredPassword.replace(/[\u200B-\u200D\uFEFF]/g, '');

    const isMasterValid = (
      (cleanUser === masterUser || cleanUser === 'adm_x92_tiendapro') &&
      (cleanPass === masterPass || cleanPass === 'Wp8$mX#92vL!kQ2026&')
    );

    const isCustomValid = Boolean(
      customCreds?.usuario &&
      cleanUser === customCreds.usuario.toLowerCase().trim() &&
      cleanPass === customCreds.password.trim()
    );

    if (isMasterValid || isCustomValid) {
      if (isMasterValid && customCreds) {
        localStorage.removeItem('tienda_credentials');
      }
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
      precio_anterior: product.precio_anterior || '',
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
    setActiveTab('new');
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      precio: '',
      precio_anterior: '',
      stock: 5,
      categoria: categories?.[0] || 'Lotes de Ropa',
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
    const isFood = cat.toLowerCase().includes('comida') || cat.toLowerCase().includes('bebida') || cat.toLowerCase().includes('botana');
    const defaultEnvio = isFood ? 'Local' : 'Nacional';
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
        const updated = {
          ...editingProduct,
          nombre: formData.nombre,
          precio: parseFloat(formData.precio),
          precio_anterior: formData.precio_anterior ? parseFloat(formData.precio_anterior) : null,
          stock: parseInt(formData.stock, 10) || 0,
          categoria: formData.categoria,
          descripcion: formData.descripcion,
          tipo_envio: formData.tipo_envio,
          agotado: (parseInt(formData.stock, 10) || 0) <= 0
        };
        await onUpdateProduct(updated, photoSlots);
        handleCancelEdit();
      } else {
        const newProduct = {
          id: 'prod-' + Date.now(),
          nombre: formData.nombre,
          precio: parseFloat(formData.precio),
          precio_anterior: formData.precio_anterior ? parseFloat(formData.precio_anterior) : null,
          stock: parseInt(formData.stock, 10) || 5,
          categoria: formData.categoria,
          descripcion: formData.descripcion || 'Producto disponible en Universo Bonito.',
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

  // Manejar creación de categoría
  const handleCreateCategory = (e) => {
    e.preventDefault();
    const clean = newCategoryName.trim();
    if (!clean) return;
    if (categories.includes(clean)) {
      alert('Esa categoría ya existe.');
      return;
    }
    onAddCategory(clean);
    setNewCategoryName('');
  };

  // Manejar creación de banner
  const handleBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    let finalImageUrl = newBannerData.imagen_url;

    if (!finalImageUrl && !bannerFile && !bannerPreview) {
      alert('Por favor selecciona una imagen para el banner o escribe una URL.');
      return;
    }

    const newBanner = {
      id: 'banner-' + Date.now(),
      titulo: newBannerData.titulo || 'Promoción Universo Bonito',
      subtitulo: newBannerData.subtitulo || '',
      imagen_url: finalImageUrl || bannerPreview || '',
      categoria_destino: newBannerData.categoria_destino || categories?.[0] || 'Lotes de Ropa',
      boton_texto: newBannerData.boton_texto || 'Ver Promoción',
      activo: true
    };

    await onAddBanner(newBanner, bannerFile);
    setNewBannerData({
      titulo: '',
      subtitulo: '',
      imagen_url: '',
      categoria_destino: categories?.[0] || '',
      boton_texto: 'Ver Promoción'
    });
    setBannerFile(null);
    setBannerPreview('');
    alert('¡Banner promocional agregado exitosamente!');
  };

  // Manejar creación de enlace de red social
  const handleCreateSocialLink = (e) => {
    e.preventDefault();
    if (!newLinkData.url) {
      alert('Por favor ingresa la URL o enlace.');
      return;
    }
    const cleanUrl = newLinkData.url.startsWith('http') ? newLinkData.url : `https://${newLinkData.url}`;
    const newLink = {
      id: 'link-' + Date.now(),
      plataforma: newLinkData.plataforma,
      nombre: newLinkData.nombre.trim() || newLinkData.plataforma,
      url: cleanUrl
    };

    onAddSocialLink(newLink);
    setNewLinkData({
      plataforma: 'Facebook',
      nombre: '',
      url: ''
    });
  };

  // Manejar guardado de horario de comida
  const handleSaveSchedule = (e) => {
    e.preventDefault();
    onUpdateFoodSchedule(tempSchedule);
    setScheduleSaved(true);
    setTimeout(() => setScheduleSaved(false), 2500);
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

  // Manejadores para Lotes de Ropa
  const handleSaveLotes = (e) => {
    if (e) e.preventDefault();
    if (onSaveLotesConfig) {
      onSaveLotesConfig(tempLotesConfig);
    }
    setLotesSaved(true);
    setTimeout(() => setLotesSaved(false), 2500);
  };

  const handleResetLotes = () => {
    if (confirm('¿Restablecer toda la sección de Lotes de Ropa y su guía a los valores iniciales predeterminados?')) {
      setTempLotesConfig(INITIAL_LOTES_CONFIG);
      if (onSaveLotesConfig) {
        onSaveLotesConfig(INITIAL_LOTES_CONFIG);
      }
      setLotesSaved(true);
      setTimeout(() => setLotesSaved(false), 2500);
    }
  };

  const handleAddTier = (e) => {
    e.preventDefault();
    const piecesNum = parseInt(newTierPieces, 10);
    const priceNum = parseFloat(newTierPrice);
    if (!piecesNum || !priceNum) {
      alert('Por favor indica el número de piezas y el precio.');
      return;
    }

    const newTier = {
      piezas: piecesNum,
      precio: priceNum,
      popular: newTierPopular,
      desc: newTierDesc.trim() || `Paquete surtido de ${piecesNum} piezas`
    };

    setTempLotesConfig(prev => {
      const currentTiers = prev.tiers || [];
      const updatedTiers = [...currentTiers.filter(t => t.piezas !== piecesNum), newTier].sort((a, b) => a.piezas - b.piezas);
      return { ...prev, tiers: updatedTiers };
    });

    setNewTierPieces('');
    setNewTierPrice('');
    setNewTierDesc('');
    setNewTierPopular(false);
  };

  const handleDeleteTier = (piezas) => {
    if (confirm(`¿Eliminar el paquete de ${piezas} piezas?`)) {
      setTempLotesConfig(prev => ({
        ...prev,
        tiers: (prev.tiers || []).filter(t => t.piezas !== piezas)
      }));
    }
  };

  const handleTogglePopularTier = (piezas) => {
    setTempLotesConfig(prev => ({
      ...prev,
      tiers: (prev.tiers || []).map(t => ({
        ...t,
        popular: t.piezas === piezas ? !t.popular : false
      }))
    }));
  };

  const handleUpdateGuidePoint = (index, field, value) => {
    setTempLotesConfig(prev => {
      const puntos = [...(prev.guia?.puntos || INITIAL_LOTES_CONFIG.guia.puntos)];
      puntos[index] = { ...puntos[index], [field]: value };
      return {
        ...prev,
        guia: {
          ...prev.guia,
          puntos
        }
      };
    });
  };

  const handleAddGuidePoint = () => {
    setTempLotesConfig(prev => {
      const puntos = [...(prev.guia?.puntos || INITIAL_LOTES_CONFIG.guia.puntos)];
      puntos.push({
        pregunta: 'Nueva Pregunta Frecuente',
        respuesta: 'Escribe aquí la respuesta o detalle para tus clientes.'
      });
      return {
        ...prev,
        guia: {
          ...prev.guia,
          puntos
        }
      };
    });
  };

  const handleDeleteGuidePoint = (index) => {
    if (confirm('¿Eliminar esta pregunta de la guía?')) {
      setTempLotesConfig(prev => {
        const puntos = [...(prev.guia?.puntos || INITIAL_LOTES_CONFIG.guia.puntos)];
        puntos.splice(index, 1);
        return {
          ...prev,
          guia: {
            ...prev.guia,
            puntos
          }
        };
      });
    }
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
                {isAuthenticated ? 'Administración Universo Bonito' : 'Acceso Administrador'}
              </h2>
              {isAuthenticated && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Gestión integral de catálogo, lotes, banners, categorías y redes
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
                  <div style={{ textAlign: 'left', marginTop: '6px' }}>
                    <div style={{ color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '8px' }}>
                      {loginError}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('tienda_credentials');
                        setUserInput('adm_x92_tiendapro');
                        setPasswordInput('Wp8$mX#92vL!kQ2026&');
                        setLoginError('');
                      }}
                      style={{
                        background: '#f4f4f5',
                        border: '1px solid var(--border-medium)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.74rem',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100%',
                        marginBottom: '8px'
                      }}
                    >
                      Limpiar caché y rellenar usuario oficial
                    </button>
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
              >
                <Home size={15} />
                <span>Menú</span>
              </button>

              <button 
                className={`menu-pill-btn ${activeTab === 'list' ? 'active' : ''}`}
                onClick={() => { setActiveTab('list'); setEditingProduct(null); }}
              >
                <Package size={15} />
                <span>Productos</span>
              </button>

              <button 
                className={`menu-pill-btn ${activeTab === 'new' ? 'active' : ''}`}
                onClick={() => {
                  if (!editingProduct) {
                    setFormData({
                      nombre: '',
                      precio: '',
                      precio_anterior: '',
                      stock: 5,
                      categoria: categories?.[0] || 'Lotes de Ropa',
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
              >
                <PlusCircle size={15} />
                <span>{editingProduct ? 'Editar' : 'Publicar'}</span>
              </button>

              <button 
                className={`menu-pill-btn ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                <Layers size={15} />
                <span>Categorías</span>
              </button>

              <button 
                className={`menu-pill-btn ${activeTab === 'banners' ? 'active' : ''}`}
                onClick={() => setActiveTab('banners')}
              >
                <ImageIcon size={15} />
                <span>Banners</span>
              </button>

              <button 
                className={`menu-pill-btn ${activeTab === 'links' ? 'active' : ''}`}
                onClick={() => setActiveTab('links')}
              >
                <LinkIcon size={15} />
                <span>Redes</span>
              </button>

              <button 
                className={`menu-pill-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                <Clock size={15} />
                <span>Horarios</span>
              </button>

              <button 
                className={`menu-pill-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
                onClick={() => setActiveTab('whatsapp')}
              >
                <Phone size={15} />
                <span>WhatsApp</span>
              </button>

              <button 
                className={`menu-pill-btn ${activeTab === 'lotes' ? 'active' : ''}`}
                onClick={() => setActiveTab('lotes')}
              >
                <Sparkles size={15} />
                <span>Lotes</span>
              </button>

              <button 
                className={`menu-pill-btn ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <KeyRound size={15} />
                <span>Seguridad</span>
              </button>
            </div>

            <div className="admin-body">
              {/* TAB 0: MENU PRINCIPAL / DASHBOARD */}
              {activeTab === 'menu' && (
                <div className="admin-menu-view">
                  <div className="admin-menu-welcome">
                    <h3 className="admin-menu-title">Panel de Control Universo Bonito</h3>
                    <p className="admin-menu-desc">
                      Selecciona una opción para administrar tu catálogo, volantes y atención:
                    </p>
                  </div>

                  <div className="admin-cards-grid">
                    {/* Tarjeta: Inventario */}
                    <div 
                      className="admin-dashboard-card"
                      onClick={() => { setActiveTab('list'); setEditingProduct(null); }}
                      role="button"
                    >
                      <div className="card-top-row">
                        <div className="card-icon-box">
                          <Package size={22} />
                        </div>
                        <span className="card-badge">
                          {products.length} artículos
                        </span>
                      </div>
                      <div className="card-text-wrap">
                        <h4 className="card-heading">Productos y Existencias</h4>
                        <p className="card-subtext">
                          Ajusta precios, ofertas/descuentos, existencias, tipo de envío o elimina.
                        </p>
                      </div>
                      <div className="card-action-link">
                        <span>Ver Productos</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    {/* Tarjeta: Categorías dinámicas */}
                    <div 
                      className="admin-dashboard-card"
                      onClick={() => setActiveTab('categories')}
                      role="button"
                    >
                      <div className="card-top-row">
                        <div className="card-icon-box">
                          <Layers size={22} />
                        </div>
                        <span className="card-badge highlight">
                          {categories.length} categorías
                        </span>
                      </div>
                      <div className="card-text-wrap">
                        <h4 className="card-heading">Crear y Borrar Categorías</h4>
                        <p className="card-subtext">
                          Organiza tu tienda: añade nuevas secciones o elimina las que ya no ocupes.
                        </p>
                      </div>
                      <div className="card-action-link">
                        <span>Administrar Categorías</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    {/* Tarjeta: Banners Horizontales */}
                    <div 
                      className="admin-dashboard-card"
                      onClick={() => setActiveTab('banners')}
                      role="button"
                    >
                      <div className="card-top-row">
                        <div className="card-icon-box">
                          <ImageIcon size={22} />
                        </div>
                        <span className="card-badge">
                          {banners.length} banners
                        </span>
                      </div>
                      <div className="card-text-wrap">
                        <h4 className="card-heading">Banners Horizontales</h4>
                        <p className="card-subtext">
                          Sube volantes, fotos promocionales horizontales, activa o desactiva banners.
                        </p>
                      </div>
                      <div className="card-action-link">
                        <span>Gestionar Banners</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    {/* Tarjeta: Redes Sociales */}
                    <div 
                      className="admin-dashboard-card"
                      onClick={() => setActiveTab('links')}
                      role="button"
                    >
                      <div className="card-top-row">
                        <div className="card-icon-box">
                          <LinkIcon size={22} />
                        </div>
                        <span className="card-badge">
                          {socialLinks.length} links
                        </span>
                      </div>
                      <div className="card-text-wrap">
                        <h4 className="card-heading">Redes Sociales y Links</h4>
                        <p className="card-subtext">
                          Configura tus perfiles de Facebook, TikTok, Instagram y WhatsApp para tus clientes.
                        </p>
                      </div>
                      <div className="card-action-link">
                        <span>Configurar Redes</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    {/* Tarjeta: Horarios Comida */}
                    <div 
                      className="admin-dashboard-card"
                      onClick={() => setActiveTab('schedule')}
                      role="button"
                    >
                      <div className="card-top-row">
                        <div className="card-icon-box">
                          <Clock size={22} />
                        </div>
                        <span className="card-badge highlight">
                          {foodSchedule?.horario || '12:30 PM a 12:30 AM'}
                        </span>
                      </div>
                      <div className="card-text-wrap">
                        <h4 className="card-heading">Horario de Comida & Botana</h4>
                        <p className="card-subtext">
                          Define el horario de atención para los pedidos de cocina y entrega a domicilio.
                        </p>
                      </div>
                      <div className="card-action-link">
                        <span>Editar Horario</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    {/* Tarjeta: WhatsApp */}
                    <div 
                      className="admin-dashboard-card"
                      onClick={() => setActiveTab('whatsapp')}
                      role="button"
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
                          El celular oficial donde te llegan las bolsas de compras listas para cobrar.
                        </p>
                      </div>
                      <div className="card-action-link">
                        <span>Configurar Celular</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>

                    {/* Tarjeta: Lotes de Ropa y Guía */}
                    <div 
                      className="admin-dashboard-card"
                      onClick={() => setActiveTab('lotes')}
                      role="button"
                    >
                      <div className="card-top-row">
                        <div className="card-icon-box" style={{ background: '#fdf2f8', color: '#db2777' }}>
                          <Sparkles size={22} />
                        </div>
                        <span className="card-badge highlight">
                          {(tempLotesConfig.tiers || []).length} Paquetes
                        </span>
                      </div>
                      <div className="card-text-wrap">
                        <h4 className="card-heading">Lotes de Ropa & Guía de Emprendedoras</h4>
                        <p className="card-subtext">
                          Edita paquetes por piezas/precio, marcas, títulos y las respuestas de qué es y cómo funciona.
                        </p>
                      </div>
                      <div className="card-action-link">
                        <span>Configurar Lotes</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: LISTADO DE PRODUCTOS CON EXISTENCIAS, DESCUENTOS Y TIPO DE ENVÍO */}
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
                    <span className="section-badge-info">{products.length} Artículos en Tienda</span>
                  </div>

                  <div className="admin-quick-shortcuts">
                    <button 
                      className="submit-btn" 
                      style={{ padding: '9px 14px', fontSize: '0.82rem', flex: '1 1 auto' }}
                      onClick={() => {
                        handleCancelEdit();
                        setActiveTab('new');
                      }}
                    >
                      <PlusCircle size={15} />
                      <span>+ Publicar Nuevo Producto / Lote</span>
                    </button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="product-admin-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Categoría</th>
                          <th>Precio Venta</th>
                          <th>Envío</th>
                          <th>Stock</th>
                          <th>Estado</th>
                          <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => {
                          const stock = p.stock !== undefined ? parseInt(p.stock, 10) : 5;
                          const isAgotado = Boolean(p.agotado) || stock <= 0;
                          const hasDiscount = Boolean(p.precio_anterior && p.precio_anterior > p.precio);

                          return (
                            <tr key={p.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <img 
                                    src={p.imagen_url || getProductImages(p)[0]} 
                                    alt={p.nombre} 
                                    style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }} 
                                  />
                                  <div>
                                    <strong>{p.nombre}</strong>
                                    {hasDiscount && (
                                      <div style={{ fontSize: '0.70rem', color: 'var(--accent-pink)', fontWeight: 600 }}>
                                        🔥 Oferta (Antes: ${p.precio_anterior})
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="admin-category-badge">{p.categoria}</span>
                              </td>
                              <td style={{ fontWeight: 700 }}>
                                ${p.precio} MXN
                              </td>
                              <td>
                                <span style={{ fontSize: '0.74rem', padding: '3px 8px', borderRadius: '12px', background: p.tipo_envio === 'Local' ? '#fdf2f8' : p.tipo_envio === 'Punto' ? '#fef3c7' : '#ecfdf5', color: p.tipo_envio === 'Local' ? 'var(--accent-pink)' : p.tipo_envio === 'Punto' ? '#b45309' : '#059669', fontWeight: 600 }}>
                                  {p.tipo_envio === 'Local' ? 'Local' : p.tipo_envio === 'Punto' ? 'Punto Entrega' : 'Paquetería'}
                                </span>
                              </td>
                              <td>
                                <strong>{stock} pzs</strong>
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
                                  <button 
                                    className="edit-btn"
                                    onClick={() => handleStartEdit(p)}
                                    title="Modificar precio, oferta, foto o stock"
                                  >
                                    <Edit3 size={13} />
                                    <span>Editar</span>
                                  </button>

                                  <button 
                                    className={`toggle-agotado-btn ${isAgotado ? 'reactivar' : 'marcar-agotado'}`}
                                    onClick={() => onToggleAgotado(p)}
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

                                  <button 
                                    className="delete-btn"
                                    onClick={() => {
                                      if (confirm(`¿Eliminar definitivamente "${p.nombre}"?`)) {
                                        onDeleteProduct(p.id);
                                      }
                                    }}
                                  >
                                    <Trash2 size={13} />
                                    <span>Borrar</span>
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

              {/* TAB 2: PUBLICAR / EDITAR PRODUCTO CON DESCUENTOS Y TIPO DE ENTREGA */}
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
                    <span className="section-badge-info">{editingProduct ? 'Editar Artículo' : 'Nuevo Artículo / Lote'}</span>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: 0 }}>
                        {editingProduct ? `Editando: ${editingProduct.nombre}` : 'Publicar Nuevo Producto o Lote'}
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
                      <div className="form-group full-width">
                        <label className="form-label">Nombre del Producto, Lote o Platillo</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="Ej. Lote de Ropa Dama 22 Piezas, Alitas 10 Piezas o Vestido Zara"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          required
                        />
                      </div>

                      {/* Precio de venta actual */}
                      <div className="form-group">
                        <label className="form-label">Precio de Venta ($ MXN)</label>
                        <input 
                          type="number" 
                          className="form-control"
                          placeholder="Ej. 120"
                          value={formData.precio}
                          onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                          required
                        />
                      </div>

                      {/* Precio anterior para ofertas / descuentos */}
                      <div className="form-group">
                        <label className="form-label">
                          Precio Original / Antes del Descuento ($ MXN)
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-pink)', marginLeft: '4px' }}>(Opcional)</span>
                        </label>
                        <input 
                          type="number" 
                          className="form-control"
                          placeholder="Ej. 150 (Se mostrará tachado con -20% OFF)"
                          value={formData.precio_anterior}
                          onChange={(e) => setFormData({ ...formData, precio_anterior: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Existencias Disponibles (Stock)</label>
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

                      {/* Categoría Dinámica */}
                      <div className="form-group">
                        <label className="form-label">Categoría</label>
                        <select 
                          className="form-control"
                          value={formData.categoria}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Tipo de Entrega Configurable */}
                      <div className="form-group full-width">
                        <label className="form-label">Modalidad de Entrega del Producto</label>
                        <select 
                          className="form-control"
                          value={formData.tipo_envio}
                          onChange={(e) => setFormData({ ...formData, tipo_envio: e.target.value })}
                        >
                          <option value="Local">Zona Local (Alimentos / Botanas / Entrega Inmediata)</option>
                          <option value="Nacional">Paquetería Nacional (Lotes de Ropa / Toda la República)</option>
                          <option value="Punto">Punto de Entrega / A convenir</option>
                        </select>
                      </div>

                      <div className="form-group full-width">
                        <label className="form-label">Descripción o Detalles</label>
                        <textarea 
                          className="form-control"
                          rows="2"
                          placeholder="Tallas (XS a XL), marcas (Shein, Zara), sabores de salsa o ingredientes..."
                          value={formData.descripcion}
                          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                      </div>

                      {/* Fotos */}
                      <div className="form-group full-width">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label className="form-label" style={{ margin: 0 }}>
                            Fotos del Producto (de 1 a 3 fotos)
                          </label>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {photoSlots.filter(s => s.preview || s.url).length}/3 fotos agregadas
                          </span>
                        </div>

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
                                      title="Quitar foto"
                                    >
                                      <Trash2 size={12} />
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
                              : (editingProduct ? 'Guardar Cambios' : 'Publicar Artículo')}
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

              {/* TAB 3: ADMINISTRAR CATEGORÍAS (CREAR Y BORRAR) */}
              {activeTab === 'categories' && (
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
                    <span className="section-badge-info">Gestión de Categorías</span>
                  </div>

                  <div className="settings-card-box">
                    <div className="settings-card-header">
                      <div className="settings-icon-pill">
                        <Layers size={22} />
                      </div>
                      <div>
                        <h3 className="settings-box-title">
                          Categorías de la Tienda
                        </h3>
                        <p className="settings-box-desc">
                          Crea nuevas categorías o borra las que ya no uses. Se actualizarán en el catálogo y filtros.
                        </p>
                      </div>
                    </div>

                    {/* Formulario para Crear Categoría */}
                    <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
                      <input 
                        type="text" 
                        className="form-control"
                        placeholder="Nombre de la nueva categoría (ej. Calzado, Postres, etc.)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        required
                        style={{ flex: 1 }}
                      />
                      <button type="submit" className="submit-btn" style={{ padding: '0 18px', whiteSpace: 'nowrap' }}>
                        <PlusCircle size={16} />
                        <span>Crear Categoría</span>
                      </button>
                    </form>

                    {/* Lista de Categorías Existentes */}
                    <div style={{ marginTop: '24px' }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
                        Categorías Activas ({categories.length}):
                      </h4>
                      <div className="categories-admin-list">
                        {categories.map((cat) => {
                          const productCount = products.filter(p => p.categoria === cat).length;

                          return (
                            <div key={cat} className="category-admin-item">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="cat-bullet"></span>
                                <strong className="cat-name">{cat}</strong>
                                <span className="cat-count-pill">
                                  {productCount} {productCount === 1 ? 'artículo' : 'artículos'}
                                </span>
                              </div>

                              <button
                                type="button"
                                className="cat-delete-btn"
                                onClick={() => {
                                  if (confirm(`¿Eliminar la categoría "${cat}"? Los productos que la tengan conservarán sus datos pero la pestaña desaparecerá.`)) {
                                    onDeleteCategory(cat);
                                  }
                                }}
                                title="Eliminar categoría"
                              >
                                <Trash2 size={14} />
                                <span>Borrar</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: BANNERS HORIZONTALES (PONER Y QUITAR) */}
              {activeTab === 'banners' && (
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
                    <span className="section-badge-info">{banners.length} Banners Registrados</span>
                  </div>

                  {/* Formulario para Añadir Nuevo Banner */}
                  <div className="settings-card-box" style={{ marginBottom: '24px' }}>
                    <div className="settings-card-header">
                      <div className="settings-icon-pill">
                        <ImageIcon size={22} />
                      </div>
                      <div>
                        <h3 className="settings-box-title">
                          Agregar Nuevo Banner Horizontal
                        </h3>
                        <p className="settings-box-desc">
                          Sube un volante o imagen horizontal que aparecerá en el carrusel principal de la página.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleCreateBanner} style={{ marginTop: '16px' }}>
                      <div className="form-grid">
                        <div className="form-group full-width">
                          <label className="form-label">Título del Banner</label>
                          <input 
                            type="text" 
                            className="form-control"
                            placeholder="Ej. Promoción de Lotes de Ropa o Alitas al 2x1"
                            value={newBannerData.titulo}
                            onChange={(e) => setNewBannerData({ ...newBannerData, titulo: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group full-width">
                          <label className="form-label">Subtítulo o Descripción de la Promoción</label>
                          <input 
                            type="text" 
                            className="form-control"
                            placeholder="Ej. Tallas XS a XL, marcas originales Shein y Zara..."
                            value={newBannerData.subtitulo}
                            onChange={(e) => setNewBannerData({ ...newBannerData, subtitulo: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Categoría a la que Dirige al hacer Clic</label>
                          <select 
                            className="form-control"
                            value={newBannerData.categoria_destino}
                            onChange={(e) => setNewBannerData({ ...newBannerData, categoria_destino: e.target.value })}
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Texto del Botón</label>
                          <input 
                            type="text" 
                            className="form-control"
                            placeholder="Ej. Ver Oferta o Pedir Ahora"
                            value={newBannerData.boton_texto}
                            onChange={(e) => setNewBannerData({ ...newBannerData, boton_texto: e.target.value })}
                          />
                        </div>

                        {/* Subir archivo de imagen */}
                        <div className="form-group full-width">
                          <label className="form-label">Imagen o Volante del Banner</label>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <label className="action-btn" style={{ cursor: 'pointer' }}>
                              <Upload size={15} />
                              <span>Subir Imagen desde mi dispositivo</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleBannerFileChange}
                                style={{ display: 'none' }}
                              />
                            </label>

                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>O escribe una URL:</span>
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="https://... o /banners/banner_lotes.jpg"
                              value={newBannerData.imagen_url}
                              onChange={(e) => setNewBannerData({ ...newBannerData, imagen_url: e.target.value })}
                              style={{ flex: 1, minWidth: '200px' }}
                            />
                          </div>

                          {(bannerPreview || newBannerData.imagen_url) && (
                            <div style={{ marginTop: '10px' }}>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Vista previa:</span>
                              <img 
                                src={bannerPreview || newBannerData.imagen_url} 
                                alt="Previa" 
                                style={{ maxHeight: '120px', borderRadius: '6px', border: '1px solid var(--border-medium)', objectFit: 'contain' }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="form-group full-width">
                          <button type="submit" className="submit-btn" style={{ width: '100%' }}>
                            <PlusCircle size={16} />
                            <span>Guardar y Publicar Banner</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Banners existentes */}
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
                    Banners Activos y Desactivados:
                  </h4>
                  <div className="banners-admin-list">
                    {banners.map((b) => (
                      <div key={b.id} className="banner-admin-card">
                        <img src={b.imagen_url} alt={b.titulo} className="banner-admin-thumb" />
                        <div className="banner-admin-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '0.92rem' }}>{b.titulo}</strong>
                            <span className={`status-pill ${b.activo !== false ? 'active' : 'inactive'}`}>
                              {b.activo !== false ? 'Activo' : 'Oculto'}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            {b.subtitulo}
                          </p>
                          <span style={{ fontSize: '0.74rem', color: 'var(--accent-pink)' }}>
                            Enlace: {b.categoria_destino}
                          </span>
                        </div>

                        <div className="banner-admin-actions">
                          <button
                            type="button"
                            className="toggle-agotado-btn"
                            style={{ fontSize: '0.76rem', padding: '6px 10px' }}
                            onClick={() => onToggleBannerActive(b.id)}
                          >
                            {b.activo !== false ? 'Pausar' : 'Activar'}
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => {
                              if (confirm(`¿Eliminar el banner "${b.titulo}"?`)) {
                                onDeleteBanner(b.id);
                              }
                            }}
                          >
                            <Trash2 size={13} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: REDES SOCIALES Y LINKS */}
              {activeTab === 'links' && (
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
                    <span className="section-badge-info">Enlaces y Redes Sociales</span>
                  </div>

                  <div className="settings-card-box" style={{ marginBottom: '24px' }}>
                    <div className="settings-card-header">
                      <div className="settings-icon-pill">
                        <LinkIcon size={22} />
                      </div>
                      <div>
                        <h3 className="settings-box-title">
                          Agregar Enlace o Red Social
                        </h3>
                        <p className="settings-box-desc">
                          Facebook, TikTok, Instagram, canal o página. Se mostrarán en la cabecera y pie de página.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleCreateSocialLink} style={{ marginTop: '16px' }}>
                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Plataforma</label>
                          <select 
                            className="form-control"
                            value={newLinkData.plataforma}
                            onChange={(e) => setNewLinkData({ ...newLinkData, plataforma: e.target.value })}
                          >
                            <option value="Facebook">Facebook</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Instagram">Instagram</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="YouTube">YouTube</option>
                            <option value="Página Web">Página Web</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Etiqueta o Nombre</label>
                          <input 
                            type="text" 
                            className="form-control"
                            placeholder="Ej. TikTok @universobonito"
                            value={newLinkData.nombre}
                            onChange={(e) => setNewLinkData({ ...newLinkData, nombre: e.target.value })}
                          />
                        </div>

                        <div className="form-group full-width">
                          <label className="form-label">Enlace URL (Link)</label>
                          <input 
                            type="text" 
                            className="form-control"
                            placeholder="https://tiktok.com/@... o https://facebook.com/..."
                            value={newLinkData.url}
                            onChange={(e) => setNewLinkData({ ...newLinkData, url: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group full-width">
                          <button type="submit" className="submit-btn" style={{ width: '100%' }}>
                            <PlusCircle size={16} />
                            <span>Guardar Red Social</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Lista de enlaces guardados */}
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
                    Enlaces Activos ({socialLinks.length}):
                  </h4>
                  <div className="links-admin-list">
                    {socialLinks.map((link) => (
                      <div key={link.id || link.url} className="link-admin-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="link-platform-tag">
                            {link.plataforma}
                          </div>
                          <div>
                            <strong>{link.nombre}</strong>
                            <a 
                              href={link.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: 'var(--text-muted)' }}
                            >
                              <span>{link.url}</span>
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => onDeleteSocialLink(link.id || link.url)}
                          title="Eliminar enlace"
                        >
                          <Trash2 size={13} />
                          <span>Borrar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: HORARIOS DE COMIDA */}
              {activeTab === 'schedule' && (
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
                    <span className="section-badge-info">Horario de Comida</span>
                  </div>

                  <div className="settings-card-box">
                    <div className="settings-card-header">
                      <div className="settings-icon-pill">
                        <Clock size={22} />
                      </div>
                      <div>
                        <h3 className="settings-box-title">
                          Horario de Atención para Comida & Botana
                        </h3>
                        <p className="settings-box-desc">
                          Configura las horas en que recibes pedidos de comida, alitas y micheladas a domicilio.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveSchedule} style={{ marginTop: '18px' }}>
                      <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label className="form-label">Horario de Servicio</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="Ej. De 12:30 PM a 12:30 AM"
                          value={tempSchedule.horario}
                          onChange={(e) => setTempSchedule({ ...tempSchedule, horario: e.target.value })}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '14px' }}>
                        <label className="form-label">Días de Atención</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="Ej. Todos los días o Martes a Domingo"
                          value={tempSchedule.dias}
                          onChange={(e) => setTempSchedule({ ...tempSchedule, dias: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">Nota o Instrucciones de Entrega</label>
                        <input 
                          type="text" 
                          className="form-control"
                          placeholder="Ej. Servicio a domicilio • Aceptamos transferencia bancaria"
                          value={tempSchedule.nota}
                          onChange={(e) => setTempSchedule({ ...tempSchedule, nota: e.target.value })}
                        />
                      </div>

                      <button type="submit" className="submit-btn" style={{ width: '100%', padding: '12px' }}>
                        <Check size={17} />
                        <span>{scheduleSaved ? '¡Horario guardado correctamente!' : 'Guardar Horario de Comida'}</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 7: WHATSAPP */}
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
                          placeholder="Ejemplo: 525620068886"
                          required
                          style={{ fontSize: '1rem', padding: '12px 14px' }}
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'block', marginTop: '6px' }}>
                          Escribe los 10 dígitos de tu celular precedidos por el código de país (ej. <strong>52</strong> para México).
                        </small>
                      </div>

                      <button type="submit" className="submit-btn" style={{ width: '100%', padding: '12px' }}>
                        <Check size={17} />
                        <span>{phoneSaved ? '¡Número guardado correctamente!' : 'Guardar Número de WhatsApp'}</span>
                      </button>
                    </form>
                  </div>

                  {/* SECCIÓN EDITAR PLANTILLA DE MENSAJE DE WHATSAPP */}
                  <div className="settings-card-box" style={{ marginTop: '20px' }}>
                    <div className="settings-card-header">
                      <div className="settings-icon-pill whatsapp-icon-pill">
                        <MessageSquare size={22} />
                      </div>
                      <div>
                        <h3 className="settings-box-title">
                          Mensaje que Recibirás por WhatsApp
                        </h3>
                        <p className="settings-box-desc">
                          Edita la redacción exacta del mensaje que se abrirá en WhatsApp cuando tus clientes hagan un pedido.
                        </p>
                      </div>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        onSaveWhatsAppTemplate(tempTemplate);
                        setTemplateSaved(true);
                        setTimeout(() => setTemplateSaved(false), 2000);
                      }} 
                      style={{ marginTop: '18px' }}
                    >
                      <div className="form-group" style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label className="form-label" style={{ margin: 0 }}>Texto del Mensaje</label>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Personalizable
                          </span>
                        </div>
                        <textarea 
                          className="form-control"
                          rows="8"
                          value={tempTemplate}
                          onChange={(e) => setTempTemplate(e.target.value)}
                          style={{ fontFamily: 'monospace', fontSize: '0.86rem', lineHeight: '1.5', padding: '12px' }}
                          required
                        />
                      </div>

                      {/* Etiquetas automáticas */}
                      <div style={{ marginBottom: '16px', background: '#fdf2f8', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                        <strong style={{ fontSize: '0.76rem', color: 'var(--accent-pink)', display: 'block', marginBottom: '4px' }}>
                          Etiquetas automáticas (se reemplazan con los datos del pedido):
                        </strong>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          Toca una etiqueta para insertarla en el mensaje:
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button 
                            type="button"
                            className="action-btn"
                            style={{ padding: '4px 10px', height: 'auto', fontSize: '0.74rem' }}
                            onClick={() => setTempTemplate(prev => prev + '\n{PRODUCTOS}')}
                          >
                            + {'{PRODUCTOS}'} (Lista de artículos)
                          </button>
                          <button 
                            type="button"
                            className="action-btn"
                            style={{ padding: '4px 10px', height: 'auto', fontSize: '0.74rem' }}
                            onClick={() => setTempTemplate(prev => prev + ' {TOTAL}')}
                          >
                            + {'{TOTAL}'} (Monto total en pesos)
                          </button>
                          <button 
                            type="button"
                            className="action-btn"
                            style={{ padding: '4px 10px', height: 'auto', fontSize: '0.74rem' }}
                            onClick={() => setTempTemplate(prev => prev + '\n{NOTAS_ENVIO}')}
                          >
                            + {'{NOTAS_ENVIO}'} (Aviso de envío local/nacional)
                          </button>
                        </div>
                      </div>

                      {/* Botones de guardar y restaurar */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button type="submit" className="submit-btn" style={{ flex: 1, padding: '12px' }}>
                          <Check size={17} />
                          <span>{templateSaved ? '¡Mensaje guardado correctamente!' : 'Guardar Mensaje de WhatsApp'}</span>
                        </button>

                        <button 
                          type="button" 
                          className="action-btn"
                          onClick={() => {
                            if (confirm('¿Restablecer el mensaje al texto predeterminado?')) {
                              setTempTemplate(DEFAULT_WHATSAPP_TEMPLATE);
                              onSaveWhatsAppTemplate(DEFAULT_WHATSAPP_TEMPLATE);
                              setTemplateSaved(true);
                              setTimeout(() => setTemplateSaved(false), 2000);
                            }
                          }}
                          title="Restablecer plantilla al original"
                        >
                          <RotateCcw size={14} />
                          <span>Restablecer Mensaje Predeterminado</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB LOTES: CONFIGURAR LOTES DE ROPA Y GUÍA DE EMPRENDEDORAS */}
              {activeTab === 'lotes' && (
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
                    <span className="section-badge-info">Lotes de Ropa & Guía</span>
                  </div>

                  {lotesSaved && (
                    <div style={{ background: '#dcfce7', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.88rem' }}>
                      <CheckCircle2 size={18} />
                      <span>¡Cambios de lotes guardados exitosamente en la tienda!</span>
                    </div>
                  )}

                  {/* 1. TEXTOS PRINCIPALES Y MARCAS */}
                  <div className="settings-card-box">
                    <div className="settings-card-header">
                      <div className="settings-icon-pill" style={{ background: '#fdf2f8', color: '#db2777' }}>
                        <Sparkles size={22} />
                      </div>
                      <div>
                        <h3 className="settings-box-title">
                          Textos y Marcas del Lote
                        </h3>
                        <p className="settings-box-desc">
                          Personaliza el distintivo, título principal, descripción y marcas comerciales incluidas.
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="form-group">
                        <label className="form-label">Distintivo Superior (Badge)</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={tempLotesConfig.badge || ''}
                          onChange={(e) => setTempLotesConfig({ ...tempLotesConfig, badge: e.target.value })}
                          placeholder="Ej: Venta Especial para Emprendedoras"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Título Principal</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={tempLotesConfig.titulo || ''}
                          onChange={(e) => setTempLotesConfig({ ...tempLotesConfig, titulo: e.target.value })}
                          placeholder="Ej: Lotes de Ropa Universo Bonito"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Descripción / Subtítulo</label>
                        <textarea 
                          className="form-control"
                          rows="2"
                          value={tempLotesConfig.descripcion || ''}
                          onChange={(e) => setTempLotesConfig({ ...tempLotesConfig, descripcion: e.target.value })}
                          placeholder="Descripción breve para animar a las emprendedoras..."
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Marcas Incluidas (separadas por coma)</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={tempLotesConfig.marcas || ''}
                          onChange={(e) => setTempLotesConfig({ ...tempLotesConfig, marcas: e.target.value })}
                          placeholder="Shein, Zara, Forever 21, Old Navy, H&M"
                        />
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '4px', display: 'block' }}>
                          Aparecerán como etiquetas llamativas en la sección de lotes.
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* 2. PAQUETES Y PRECIOS DE LOTES (TIERS) */}
                  <div className="settings-card-box" style={{ marginTop: '20px' }}>
                    <div className="settings-card-header">
                      <div className="settings-icon-pill" style={{ background: '#fdf2f8', color: '#db2777' }}>
                        <Tag size={22} />
                      </div>
                      <div>
                        <h3 className="settings-box-title">
                          Paquetes de Lotes (Tamaño y Precios)
                        </h3>
                        <p className="settings-box-desc">
                          Define los tamaños de bultos (ej. 10, 15, 22, 30, 50, 60, 100 piezas) y sus precios al por mayor.
                        </p>
                      </div>
                    </div>

                    {/* Lista de tiers actuales */}
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(tempLotesConfig.tiers || []).map((tier, idx) => {
                        const avgPrice = Math.round(tier.precio / (tier.piezas || 1));
                        return (
                          <div 
                            key={tier.piezas || idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: '#fdfbfe',
                              border: tier.popular ? '2px solid var(--accent-pink)' : '1px solid var(--border-subtle)',
                              padding: '12px 14px',
                              borderRadius: '8px',
                              gap: '12px',
                              flexWrap: 'wrap'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 200px' }}>
                              <div style={{ background: '#ffffff', border: '1px solid var(--border-medium)', borderRadius: '6px', padding: '6px 10px', textAlign: 'center', minWidth: '70px' }}>
                                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)', display: 'block' }}>
                                  {tier.piezas}
                                </strong>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Piezas</span>
                              </div>

                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <strong style={{ fontSize: '1rem', color: 'var(--accent-pink)' }}>
                                    ${tier.precio} MXN
                                  </strong>
                                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                    (~${avgPrice}/pz)
                                  </span>
                                  {tier.popular && (
                                    <span style={{ background: 'var(--accent-pink)', color: '#fff', fontSize: '0.64rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                      Más vendido
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                  {tier.desc || 'Paquete surtido'}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                className="action-btn"
                                style={{ 
                                  background: tier.popular ? '#fdf2f8' : '#fff',
                                  borderColor: tier.popular ? 'var(--accent-pink)' : 'var(--border-medium)',
                                  color: tier.popular ? 'var(--accent-pink)' : 'var(--text-secondary)',
                                  fontSize: '0.74rem',
                                  padding: '5px 9px',
                                  height: 'auto'
                                }}
                                onClick={() => handleTogglePopularTier(tier.piezas)}
                                title="Marcar/desmarcar como paquete más vendido"
                              >
                                {tier.popular ? '★ Destacado' : '☆ Marcar Destacado'}
                              </button>

                              <button
                                type="button"
                                className="action-btn delete"
                                style={{ padding: '6px 8px', height: 'auto' }}
                                onClick={() => handleDeleteTier(tier.piezas)}
                                title="Eliminar este paquete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Formulario rápido para agregar un nuevo tier */}
                    <form onSubmit={handleAddTier} style={{ marginTop: '16px', background: '#fafaf9', padding: '14px', borderRadius: '8px', border: '1px dashed var(--border-medium)' }}>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block', marginBottom: '10px' }}>
                        + Agregar Nuevo Tamaño de Paquete
                      </strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>No. de Piezas</label>
                          <input 
                            type="number"
                            className="form-control"
                            placeholder="Ej: 40"
                            value={newTierPieces}
                            onChange={(e) => setNewTierPieces(e.target.value)}
                            min="1"
                            style={{ padding: '8px 10px', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Precio Total (MXN)</label>
                          <input 
                            type="number"
                            className="form-control"
                            placeholder="Ej: 2800"
                            value={newTierPrice}
                            onChange={(e) => setNewTierPrice(e.target.value)}
                            min="1"
                            style={{ padding: '8px 10px', fontSize: '0.84rem' }}
                          />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Descripción Corta</label>
                          <input 
                            type="text"
                            className="form-control"
                            placeholder="Ej: Ideal para emprendedoras con venta semanal"
                            value={newTierDesc}
                            onChange={(e) => setNewTierDesc(e.target.value)}
                            style={{ padding: '8px 10px', fontSize: '0.84rem' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <input 
                            type="checkbox"
                            checked={newTierPopular}
                            onChange={(e) => setNewTierPopular(e.target.checked)}
                          />
                          <span>Marcar como más vendido</span>
                        </label>

                        <button 
                          type="submit" 
                          className="action-btn"
                          style={{ background: 'var(--accent-pink)', color: '#fff', border: 'none', padding: '6px 14px', height: 'auto', fontSize: '0.78rem' }}
                        >
                          <PlusCircle size={14} />
                          <span>Agregar Paquete</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* 3. GUÍA EXPLICATIVA: ¿QUÉ ES UN LOTE DE ROPA? */}
                  <div className="settings-card-box" style={{ marginTop: '20px' }}>
                    <div className="settings-card-header">
                      <div className="settings-icon-pill" style={{ background: '#fdf2f8', color: '#db2777' }}>
                        <HelpCircle size={22} />
                      </div>
                      <div>
                        <h3 className="settings-box-title">
                          Guía para Emprendedoras: ¿Qué es un Lote de Ropa?
                        </h3>
                        <p className="settings-box-desc">
                          Edita la guía explicativa que enseña a tus clientes cómo funciona y la ventaja de ganancias.
                        </p>
                      </div>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox"
                            checked={tempLotesConfig.guia?.mostrar !== false}
                            onChange={(e) => setTempLotesConfig({
                              ...tempLotesConfig,
                              guia: {
                                ...tempLotesConfig.guia,
                                mostrar: e.target.checked
                              }
                            })}
                          />
                          <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>Mostrar Guía en la tienda</span>
                        </label>

                        <button 
                          type="button"
                          className="action-btn"
                          style={{ padding: '4px 10px', height: 'auto', fontSize: '0.74rem' }}
                          onClick={handleAddGuidePoint}
                        >
                          <PlusCircle size={13} />
                          <span>+ Agregar Pregunta</span>
                        </button>
                      </div>

                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">Título de la Guía</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={tempLotesConfig.guia?.titulo || ''}
                          onChange={(e) => setTempLotesConfig({
                            ...tempLotesConfig,
                            guia: {
                              ...tempLotesConfig.guia,
                              titulo: e.target.value
                            }
                          })}
                          placeholder="¿Qué es exactamente un Lote de Ropa y cómo funciona?"
                        />
                      </div>

                      {/* Lista de Puntos / Preguntas */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {(tempLotesConfig.guia?.puntos || INITIAL_LOTES_CONFIG.guia.puntos).map((pt, idx) => (
                          <div 
                            key={idx}
                            style={{
                              background: '#fafafa',
                              border: '1px solid var(--border-medium)',
                              borderRadius: '8px',
                              padding: '14px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent-pink)', textTransform: 'uppercase' }}>
                                Punto #{idx + 1}
                              </span>
                              <button 
                                type="button"
                                className="action-btn delete"
                                style={{ padding: '3px 6px', height: 'auto' }}
                                onClick={() => handleDeleteGuidePoint(idx)}
                                title="Eliminar este punto"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>

                            <div className="form-group" style={{ marginBottom: '8px' }}>
                              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Pregunta</label>
                              <input 
                                type="text"
                                className="form-control"
                                value={pt.pregunta}
                                onChange={(e) => handleUpdateGuidePoint(idx, 'pregunta', e.target.value)}
                                style={{ padding: '8px 10px', fontSize: '0.84rem' }}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Respuesta Explicativa</label>
                              <textarea 
                                className="form-control"
                                rows="3"
                                value={pt.respuesta}
                                onChange={(e) => handleUpdateGuidePoint(idx, 'respuesta', e.target.value)}
                                style={{ padding: '8px 10px', fontSize: '0.84rem', lineHeight: '1.4' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4. BOTONES DE GUARDAR Y RESTABLECER */}
                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      className="submit-btn" 
                      style={{ flex: 1, padding: '14px' }}
                      onClick={handleSaveLotes}
                    >
                      <Check size={18} />
                      <span>{lotesSaved ? '¡Configuración Guardada!' : 'Guardar Todos los Cambios de Lotes'}</span>
                    </button>

                    <button 
                      type="button" 
                      className="action-btn"
                      onClick={handleResetLotes}
                      title="Restablecer toda la sección de lotes al contenido original"
                    >
                      <RotateCcw size={15} />
                      <span>Restablecer Predeterminados</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 8: SEGURIDAD (CAMBIAR USUARIO Y CONTRASEÑA) */}
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
                            style={{ paddingRight: '44px' }}
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
                              color: 'var(--text-muted)'
                            }}
                          >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <button type="submit" className="submit-btn" style={{ width: '100%', padding: '12px' }}>
                        <Check size={17} />
                        <span>{credSaved ? '¡Credenciales actualizadas!' : 'Guardar Nuevas Credenciales'}</span>
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
