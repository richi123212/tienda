export const INITIAL_CATEGORIES = [
  'Lotes de Ropa',
  'Comida y Botana',
  'Bebidas y Micheladas',
  'Ropa Mujer'
];

export const INITIAL_FOOD_SCHEDULE = {
  horario: '12:30 PM a 12:30 AM',
  dias: 'Todos los días',
  activo: true,
  nota: 'Servicio a domicilio • Aceptamos transferencia'
};

export const INITIAL_SOCIAL_LINKS = [
  {
    id: 'link-fb',
    plataforma: 'Facebook',
    nombre: 'Facebook Oficial',
    url: 'https://facebook.com',
    icono: 'facebook'
  },
  {
    id: 'link-tt',
    plataforma: 'TikTok',
    nombre: 'TikTok Universo Bonito',
    url: 'https://tiktok.com',
    icono: 'tiktok'
  },
  {
    id: 'link-ig',
    plataforma: 'Instagram',
    nombre: 'Instagram @universobonito',
    url: 'https://instagram.com',
    icono: 'instagram'
  },
  {
    id: 'link-wa',
    plataforma: 'WhatsApp',
    nombre: 'Pedidos WhatsApp: 5620068886',
    url: 'https://wa.me/525620068886',
    icono: 'whatsapp'
  }
];

export const INITIAL_BANNERS = [
  {
    id: 'banner-1',
    titulo: 'Lotes de Ropa para Emprendedoras',
    subtitulo: 'Marcas Shein, Zara, Forever 21, H&M y Old Navy en paquetes de 10 a 100 piezas.',
    imagen_url: '/banners/banner_lotes.jpg',
    categoria_destino: 'Lotes de Ropa',
    boton_texto: 'Ver Lotes Disponibles',
    activo: true
  },
  {
    id: 'banner-2',
    titulo: 'El Cuadrilátero Botana - Alitas & Papas',
    subtitulo: '¡Paquete Zero Miedo con 10 alitas, 2 micheladas y papas por solo $300! Sabores tradicionales y exóticos.',
    imagen_url: '/banners/banner_alitas.jpg',
    categoria_destino: 'Comida y Botana',
    boton_texto: 'Ver Menú de Botanas',
    activo: true
  },
  {
    id: 'banner-3',
    titulo: 'Micheladas El Cuadrilátero a Domicilio',
    subtitulo: 'Horario de 12:30 PM a 12:30 AM. Gomichelas, Caribe Cooler, Azulitos 2x$200 y Mojitos.',
    imagen_url: '/banners/banner_micheladas.jpg',
    categoria_destino: 'Bebidas y Micheladas',
    boton_texto: 'Ordenar Bebidas',
    activo: true
  }
];

export const INITIAL_PRODUCTS = [
  // 1. LOTES DE ROPA (Envíos Nacionales / Paquetería)
  {
    id: 'lote-10',
    nombre: 'Lote de Ropa Dama - 10 Piezas',
    precio: 850,
    precio_anterior: 1000,
    categoria: 'Lotes de Ropa',
    stock: 12,
    descripcion: 'Paquete de inicio para emprendedoras con 10 piezas de dama al azar en tallas XS, S, M, L y XL. Marcas de prestigio: Shein, Zara, Forever 21, H&M y Old Navy. ¡Cambios en tu 2da compra!',
    imagen_url: '/banners/banner_lotes.jpg',
    imagenes: [
      '/banners/banner_lotes.jpg',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Nacional'
  },
  {
    id: 'lote-15',
    nombre: 'Lote de Ropa Dama - 15 Piezas',
    precio: 1200,
    precio_anterior: 1450,
    categoria: 'Lotes de Ropa',
    stock: 8,
    descripcion: '15 prendas surtidas de dama (vestidos, blusas, tops, faldas, pantalones). Marcas originales surtidas al azar. Excelente margen de ganancia para venta individual.',
    imagen_url: '/banners/banner_lotes.jpg',
    imagenes: [
      '/banners/banner_lotes.jpg',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Nacional'
  },
  {
    id: 'lote-22',
    nombre: 'Lote de Ropa Dama - 22 Piezas',
    precio: 1650,
    precio_anterior: 1980,
    categoria: 'Lotes de Ropa',
    stock: 10,
    descripcion: '22 piezas de temporada para dama en tallas XS a XL. Marcas Shein, Zara, Forever 21, Old Navy, H&M. Envíos a toda la República Mexicana por paquetería.',
    imagen_url: '/banners/banner_lotes.jpg',
    imagenes: [
      '/banners/banner_lotes.jpg',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Nacional'
  },
  {
    id: 'lote-30',
    nombre: 'Lote de Ropa Dama - 30 Piezas',
    precio: 2150,
    precio_anterior: 2600,
    categoria: 'Lotes de Ropa',
    stock: 6,
    descripcion: 'Paquete mediano de 30 piezas ideales para boutique o venta en línea. Piezas de dama surtidas con etiquetas de marcas comerciales reconocidas.',
    imagen_url: '/banners/banner_lotes.jpg',
    imagenes: [
      '/banners/banner_lotes.jpg',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Nacional'
  },
  {
    id: 'lote-50',
    nombre: 'Lote Mayorista de Ropa Dama - 50 Piezas',
    precio: 3450,
    precio_anterior: 4100,
    categoria: 'Lotes de Ropa',
    stock: 5,
    descripcion: 'Surtido mayorista con 50 piezas de dama. Mayor variedad de estilos, tallas XS a XL y marcas (Zara, Shein, Forever 21, Old Navy, H&M). Garantía de cambios en 2da compra.',
    imagen_url: '/banners/banner_lotes.jpg',
    imagenes: [
      '/banners/banner_lotes.jpg',
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Nacional'
  },
  {
    id: 'lote-100',
    nombre: 'Mega Lote Mayorista - 100 Piezas',
    precio: 6500,
    precio_anterior: 7800,
    categoria: 'Lotes de Ropa',
    stock: 4,
    descripcion: 'El lote más rentable con 100 prendas exclusivas de dama. Máxima ganancia por prenda para surtir tu negocio. Envío seguro por paquetería nacional.',
    imagen_url: '/banners/banner_lotes.jpg',
    imagenes: [
      '/banners/banner_lotes.jpg',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Nacional'
  },

  // 2. COMIDA Y BOTANA (El Cuadrilátero - Envío Local / Entrega Inmediata)
  {
    id: 'botana-zero-miedo',
    nombre: 'Paquete Zero Miedo (Alitas + Micheladas + Papas)',
    precio: 300,
    precio_anterior: 350,
    categoria: 'Comida y Botana',
    stock: 20,
    descripcion: '¡La mejor combinación del Cuadrilátero! Incluye: 2 Micheladas clásicas de 1 Litro + 10 Alitas con salsa a tu gusto + Orden de Papas a la francesa. ¡Todo por $300!',
    imagen_url: '/banners/banner_alitas.jpg',
    imagenes: [
      '/banners/banner_alitas.jpg',
      'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527477378408-1bc09a42111c?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Local'
  },
  {
    id: 'botana-alitas-6',
    nombre: 'Alitas de Pollo Crujientes (6 Piezas)',
    precio: 75,
    precio_anterior: 90,
    categoria: 'Comida y Botana',
    stock: 30,
    descripcion: '6 piezas de alitas doraditas bañadas en tu salsa favorita (BBQ, BBQ Picoso, Maggi, Maggi Tajín, Búfalo o Habanero). Por $20 extra agrega papas.',
    imagen_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
      '/banners/banner_alitas.jpg'
    ],
    tipo_envio: 'Local'
  },
  {
    id: 'botana-alitas-10',
    nombre: 'Alitas de Pollo Crujientes (10 Piezas)',
    precio: 120,
    precio_anterior: 140,
    categoria: 'Comida y Botana',
    stock: 25,
    descripcion: '10 deliciosas piezas de alitas con tu sabor favorito. Sabores tradicionales incluidos o prueba los exóticos (Pica Fresa, Frutos Rojos, Maracuyá Habanero +$15).',
    imagen_url: 'https://images.unsplash.com/photo-1527477378408-1bc09a42111c?auto=format&fit=crop&w=800&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1527477378408-1bc09a42111c?auto=format&fit=crop&w=800&q=80',
      '/banners/banner_alitas.jpg'
    ],
    tipo_envio: 'Local'
  },
  {
    id: 'botana-alitas-15',
    nombre: 'Alitas de Pollo Crujientes (15 Piezas)',
    precio: 180,
    precio_anterior: 200,
    categoria: 'Comida y Botana',
    stock: 20,
    descripcion: '15 piezas jugosas de alitas sazonadas a la perfección. Puedes combinar hasta 2 sabores de salsas.',
    imagen_url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80',
      '/banners/banner_alitas.jpg'
    ],
    tipo_envio: 'Local'
  },
  {
    id: 'botana-alitas-20',
    nombre: 'Alitas de Pollo Crujientes (20 Piezas)',
    precio: 240,
    precio_anterior: 270,
    categoria: 'Comida y Botana',
    stock: 15,
    descripcion: 'Paquete de 20 alitas ideal para compartir entre amigos o familia. Elige tus salsas favoritas y acompáñalas con papas.',
    imagen_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Local'
  },
  {
    id: 'botana-papas-extra',
    nombre: 'Orden de Papas a la Francesa Extra',
    precio: 20,
    categoria: 'Comida y Botana',
    stock: 40,
    descripcion: 'Papas a la francesa sazonadas, doraditas y crujientes para complementar tus alitas o botana.',
    imagen_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Local'
  },

  // 3. BEBIDAS Y MICHELADAS (El Cuadrilátero A Domicilio - Envío Local)
  {
    id: 'bebida-michelada-litro',
    nombre: 'Michelada Clásica de 1 Litro',
    precio: 100,
    categoria: 'Bebidas y Micheladas',
    stock: 35,
    descripcion: 'Michelada de un litro con escarchado especial de la casa, limón, salsas negras y sal. La mejor tradición y sabor.',
    imagen_url: '/banners/banner_micheladas.jpg',
    imagenes: [
      '/banners/banner_micheladas.jpg',
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Local'
  },
  {
    id: 'bebida-gomichela',
    nombre: 'Gomichela Especial de 1 Litro',
    precio: 125,
    categoria: 'Bebidas y Micheladas',
    stock: 25,
    descripcion: 'Litro preparado con cerveza, salsas, limón, chamoy, chilito en polvo y coronado con gomitas dulces y picositas.',
    imagen_url: '/banners/banner_micheladas.jpg',
    imagenes: [
      '/banners/banner_micheladas.jpg'
    ],
    tipo_envio: 'Local'
  },
  {
    id: 'bebida-caribe-cooler',
    nombre: 'Michelada Caribe Cooler (1 Litro)',
    precio: 125,
    categoria: 'Bebidas y Micheladas',
    stock: 20,
    descripcion: 'Refrescante combinación dulce y cítrica preparada con Caribe Cooler y escarchado especial de la casa.',
    imagen_url: '/banners/banner_micheladas.jpg',
    tipo_envio: 'Local'
  },
  {
    id: 'bebida-clamato',
    nombre: 'Michelada Clamato Preparada (1 Litro)',
    precio: 130,
    categoria: 'Bebidas y Micheladas',
    stock: 20,
    descripcion: 'Michelada premium con jugo de Clamato, salsas sazonadoras, limón, sal de apio y escarchado de tamarindo con chilito.',
    imagen_url: '/banners/banner_micheladas.jpg',
    tipo_envio: 'Local'
  },
  {
    id: 'bebida-cubana',
    nombre: 'Michelada Cubana de 1 Litro',
    precio: 135,
    categoria: 'Bebidas y Micheladas',
    stock: 18,
    descripcion: 'Receta tradicional cubana bien cargada con combinación de salsas inglesas, jugo de limón y escarchado profundo.',
    imagen_url: '/banners/banner_micheladas.jpg',
    tipo_envio: 'Local'
  },
  {
    id: 'bebida-azulito',
    nombre: 'Azulito Preparado de 1 Litro (¡Promo 2 por $200!)',
    precio: 120,
    precio_anterior: 140,
    categoria: 'Bebidas y Micheladas',
    stock: 30,
    descripcion: 'El clásico Azulito refrescante con vodka, curaçao azul, bebida energética, escarchado de mora azul y gomitas. ¡Pide 2 litros por solo $200!',
    imagen_url: '/banners/banner_micheladas.jpg',
    imagenes: [
      '/banners/banner_micheladas.jpg',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Local'
  },
  {
    id: 'bebida-mojito',
    nombre: 'Mojito Refrescante (Natural, Fresa o Mango)',
    precio: 120,
    precio_anterior: 135,
    categoria: 'Bebidas y Micheladas',
    stock: 25,
    descripcion: 'Mojito con hierbabuena fresca machacada, ron blanco, toque de limón y agua mineral. Natural a $120 (2x$200) o de sabor Fresa/Mango a $135 (2x$250).',
    imagen_url: '/banners/banner_micheladas.jpg',
    tipo_envio: 'Local'
  },
  {
    id: 'bebida-cerillos',
    nombre: 'Cerillos Escarchados (1 Pieza o Paquete 6 Cerillos)',
    precio: 45,
    categoria: 'Bebidas y Micheladas',
    stock: 50,
    descripcion: 'Shots estilo cerillo con escarchado picosito de sabores. 1 Cerillo escarchado a $45 o Paquete de 6 Cerillos a solo $265.',
    imagen_url: '/banners/banner_micheladas.jpg',
    tipo_envio: 'Local'
  },
  {
    id: 'bebida-sin-alcohol',
    nombre: 'Bebidas Preparadas Sin Alcohol (1 Litro)',
    precio: 60,
    categoria: 'Bebidas y Micheladas',
    stock: 25,
    descripcion: 'Opciones refrescantes 100% sin alcohol: Tehuacán preparado ($60), Sangría preparada ($60), o versión sin alcohol de Azulito/Mojito ($70).',
    imagen_url: '/banners/banner_micheladas.jpg',
    tipo_envio: 'Local'
  },

  // 4. ROPA DE DAMA INDIVIDUAL (Universo Bonito - Envíos Nacionales / Paquetería)
  {
    id: 'women-vestido-lino',
    nombre: 'Vestido Midi en Lino Natural Premium',
    precio: 490,
    precio_anterior: 650,
    categoria: 'Ropa Mujer',
    stock: 7,
    descripcion: 'Diseño holgado con caída impecable confeccionado en lino suave prelavado en tono rosa marfil. Elegancia fresca para cualquier ocasión.',
    imagen_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    imagenes: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80'
    ],
    tipo_envio: 'Nacional'
  },
  {
    id: 'women-blusa-seda',
    nombre: 'Blusa Camisera en Seda Satinada',
    precio: 380,
    precio_anterior: 480,
    categoria: 'Ropa Mujer',
    stock: 9,
    descripcion: 'Prenda versátil de silueta limpia, tacto ultrasuave y botones nácar. Combina perfecto con jeans o faldas formales.',
    imagen_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Nacional'
  },
  {
    id: 'women-palazzo',
    nombre: 'Pantalón Palazzo de Algodón Suave',
    precio: 420,
    precio_anterior: 520,
    categoria: 'Ropa Mujer',
    stock: 8,
    descripcion: 'Tiro alto con elástico posterior y pretina limpia al frente. Comodidad y elegancia relajada para el día a día.',
    imagen_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    tipo_envio: 'Nacional'
  }
];
