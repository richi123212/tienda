export const INITIAL_PRODUCTS = [
  // COMIDA (Envíos Locales)
  {
    id: 'food-1',
    nombre: 'Corte Rib Eye Marinado',
    precio: 380,
    categoria: 'Comida',
    descripcion: 'Corte selecto de 400g preparado a fuego lento con especias de la casa, papas al romero y mantequilla trufada.',
    imagen_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Local'
  },
  {
    id: 'food-2',
    nombre: 'Pastel de Chocolate Belga y Frutos Rojos',
    precio: 420,
    categoria: 'Comida',
    descripcion: 'Elaboración artesanal con cacao al 70%, relleno de ganache suave y frutos silvestres frescos.',
    imagen_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Local'
  },
  {
    id: 'food-3',
    nombre: 'Hamburguesa Gourmet Angus en Pan Brioche',
    precio: 210,
    categoria: 'Comida',
    descripcion: 'Carne Black Angus 200g, queso gouda añejo, cebolla caramelizada al vino tinto y aderezo especial.',
    imagen_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Local'
  },
  {
    id: 'food-4',
    nombre: 'Tabla de Charcutería y Quesos Madurados',
    precio: 490,
    categoria: 'Comida',
    descripcion: 'Selección de jamón serrano, lomo embuchado, quesos manchego y brie, frutos secos y mermelada de higo.',
    imagen_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Local'
  },

  // ROPA MUJER (Envíos Nacionales)
  {
    id: 'women-1',
    nombre: 'Vestido Midi en Lino Natural',
    precio: 890,
    categoria: 'Ropa Mujer',
    descripcion: 'Diseño holgado con caída impecable confeccionado en 100% lino orgánico prelavado en tono marfil.',
    imagen_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Nacional'
  },
  {
    id: 'women-2',
    nombre: 'Abrigo Minimalista de Lana Taupe',
    precio: 1650,
    categoria: 'Ropa Mujer',
    descripcion: 'Corte sastre estructurado con solapa clásica y botones carey. Ideal para entretiempo y noches frescas.',
    imagen_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Nacional'
  },
  {
    id: 'women-3',
    nombre: 'Blusa Camisera en Seda Lavada',
    precio: 720,
    categoria: 'Ropa Mujer',
    descripcion: 'Prenda versátil de silueta limpia, tacto ultrasuave y puños acampanados con botones de nácar.',
    imagen_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Nacional'
  },
  {
    id: 'women-4',
    nombre: 'Pantalón Palazzo en Algodón Pima',
    precio: 790,
    categoria: 'Ropa Mujer',
    descripcion: 'Tiro alto con elástico posterior y pretina limpia al frente. Comodidad y elegancia relajada.',
    imagen_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Nacional'
  },

  // ROPA HOMBRE (Envíos Nacionales)
  {
    id: 'men-1',
    nombre: 'Camisa Guayabera Moderna de Lino',
    precio: 850,
    categoria: 'Ropa Hombre',
    descripcion: 'Confección artesanal en lino puro, alforzas sutiles frontales y cuello mao contemporáneo.',
    imagen_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Nacional'
  },
  {
    id: 'men-2',
    nombre: 'Chaqueta Cazadora en Gamuza Carbón',
    precio: 1850,
    categoria: 'Ropa Hombre',
    descripcion: 'Acabado aterciopelado con forro satinado, cierre metálico de alta resistencia y bolsillos ojal.',
    imagen_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Nacional'
  },
  {
    id: 'men-3',
    nombre: 'Pantalón Chino Slim Fit en Verde Oliva',
    precio: 780,
    categoria: 'Ropa Hombre',
    descripcion: 'Tejido twill stretch de alta densidad, corte afilado para el calzado y cintura confortable.',
    imagen_url: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Nacional'
  },
  {
    id: 'men-4',
    nombre: 'Playera Básica Pesada en Algodón Egipcio',
    precio: 450,
    categoria: 'Ropa Hombre',
    descripcion: 'Gramaje 240g con caída firme, cuello acanalado reforzado y tonalidad negra profunda sin desteñir.',
    imagen_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Nacional'
  },

  // LUCHA LIBRE (Envíos Nacionales)
  {
    id: 'lucha-1',
    nombre: 'Máscara Profesional Réplica Fina Clásica',
    precio: 950,
    categoria: 'Lucha Libre',
    descripcion: 'Elaborada a mano en vinipiel reforzado con forro interno de esponja transpirable y agujetas dobles.',
    imagen_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Nacional'
  },
  {
    id: 'lucha-2',
    nombre: 'Máscara de Colección Conmemorativa Oro y Plata',
    precio: 1250,
    categoria: 'Lucha Libre',
    descripcion: 'Edición especial con aplicaciones metálicas doradas cosidas punto por punto. Pieza de vitrina o uso.',
    imagen_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Nacional'
  },
  {
    id: 'lucha-3',
    nombre: 'Playera Gráfica Vintage Lucha Tradicional',
    precio: 480,
    categoria: 'Lucha Libre',
    descripcion: 'Serigrafía en tinta tacto cero sobre algodón peinado negro. Ilustración original inspirada en la época de oro.',
    imagen_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Nacional'
  },
  {
    id: 'lucha-4',
    nombre: 'Capa Artesanal de Presentación con Bordado',
    precio: 1400,
    categoria: 'Lucha Libre',
    descripcion: 'Satín brillante de grueso calibre con ribetes dorados y broche metálico superior de ajuste seguro.',
    imagen_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Nacional'
  }
];
