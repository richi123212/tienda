import React, { useState } from 'react';
import { X, GitBranch, Terminal, Globe, ArrowRight, Check, Copy } from 'lucide-react';

export default function GitGuideModal({ isOpen, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Paso 1: Inicializar Git en tu computadora',
      desc: 'Abre la terminal de PowerShell en tu carpeta de proyecto y escribe:',
      command: `git init\ngit add .\ngit commit -m "Mi primera tienda web profesional"`
    },
    {
      title: 'Paso 2: Crear tu repositorio gratuito en GitHub',
      desc: 'Entra a https://github.com, inicia sesión o crea tu cuenta gratis, y haz clic en "New Repository". Llámalo por ejemplo "tienda-ropa-comida" y déjalo en Público o Privado.',
      command: `# Conecta tu carpeta con GitHub (reemplaza 'tu-usuario'):\ngit branch -M main\ngit remote add origin https://github.com/tu-usuario/tienda-ropa-comida.git\ngit push -u origin main`
    },
    {
      title: 'Paso 3: Publicar gratis en Vercel',
      desc: 'Entra a https://vercel.com, inicia sesión conectando tu cuenta de GitHub con 1 solo clic. Elige tu repositorio "tienda-ropa-comida" y presiona "Deploy".',
      command: `# ¡Listo! En 60 segundos Vercel te dará un enlace público como:\n# https://tienda-ropa-comida.vercel.app`
    },
    {
      title: 'Paso 4: Agregar tus variables de Supabase en Vercel',
      desc: 'En el panel de Vercel de tu proyecto, ve a Settings -> Environment Variables y pega tus claves de Supabase (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY). Así tu tienda quedará 100% en vivo.',
      command: `VITE_SUPABASE_URL=tu_url_de_supabase\nVITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase\nVITE_WHATSAPP_NUMBER=525512345678`
    }
  ];

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="admin-modal-card" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        
        <div className="admin-header">
          <div className="admin-title-wrap">
            <div className="admin-icon-pill">
              <GitBranch size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>
                Guía Paso a Paso: De tu Computadora a Internet
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Cómo subir tu código a GitHub y publicarlo gratis en Vercel
              </p>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-body">
          <div style={{ 
            background: 'rgba(212, 175, 55, 0.05)', 
            border: '1px solid rgba(212, 175, 55, 0.2)', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '24px' 
          }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
              No te preocupes si nunca has usado Git. Es simplemente una herramienta para guardar tu proyecto y enviarlo a GitHub. Vercel lee tu GitHub y coloca tu página en internet automáticamente.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {steps.map((s, idx) => (
              <div key={idx} style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border-subtle)', 
                borderRadius: '10px', 
                padding: '20px' 
              }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--text-gold)', marginBottom: '6px' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {s.desc}
                </p>

                <div className="code-box" style={{ margin: 0 }}>
                  <button 
                    className="copy-pill-btn"
                    onClick={() => handleCopy(s.command, idx)}
                  >
                    {copiedIndex === idx ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copiedIndex === idx ? 'Copiado' : 'Copiar comando'}</span>
                  </button>
                  {s.command}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
