/* ═══════════════════════════════════════════════════════════════
   VERUZH · PORTAFOLIO — datos.js
   ─────────────────────────────────────────────────────────────────
   ESTE ES EL ARCHIVO PARA EDITAR TEXTOS.
   Aquí están tu contacto y todos los proyectos. Las páginas leen
   estos datos y arman las tarjetas, las fichas y el pie de página.

   Reglas para no romper nada:
   · Cada texto va entre comillas simples '...'. Si dentro necesitas
     un apóstrofo, escríbelo así: \'
   · No borres las comas que separan cada línea.
   · Las rutas de imágenes y videos son relativas a la carpeta
     mi-portafolio (por ejemplo 'assets/video/archivo.mp4').
   ═══════════════════════════════════════════════════════════════ */

window.VERUZH = window.VERUZH || {};

/* ─── 1. CONTACTO ───────────────────────────────────────────── */
VERUZH.contacto = {
  nombre: 'veruzh',
  nombreCompleto: 'Verónica Vidaurre',
  oficio: ['productora audiovisual', 'diseñadora digital', 'motion graphics'],
  correo: 'pamevidaurre19@gmail.com',
  telefono: '69596914',
  // WhatsApp: código de Bolivia (591) + número, sin espacios ni signos
  whatsapp: '59169596914',
  ciudad: 'La Paz, Bolivia',
  // ⚠ PEGA AQUÍ EL LINK DE TU BEHANCE (entre las comillas).
  //   Mientras esté vacío, el botón aparece como "próximamente".
  behance: ''
};

/* ─── 2. PROYECTOS ──────────────────────────────────────────────
   Cada proyecto tiene:
   · id        → nombre corto sin espacios (se usa en el link
                 proyecto.html?p=id). No lo cambies si no es necesario.
   · tema      → los 3 colores de su página y su tarjeta, siempre
                 de tu paleta (ver base.css):
                   fondo  = color de fondo
                   tinta  = color del texto (debe contrastar con el fondo)
                   acento = detalles, números y botones
   · categorias→ sirven para los filtros de la página de inicio
   · resumen   → una frase corta para la tarjeta
   · texto     → los párrafos de la página del proyecto
                 (frases cortas y sencillas)
   · videos    → lista de clips. "formato" puede ser 'vertical'
                 (9:16) u 'horizontal' (16:9).
   ─────────────────────────────────────────────────────────────── */
VERUZH.proyectos = [
  {
    id: 'psicojornadas',
    numero: '01',
    titulo: 'Psicojornadas',
    subtitulo: 'Últimas noticias',
    cliente: 'Sociedad Científica Estudiantil · Psicología UCB',
    anio: '2026',
    disciplina: 'Producción audiovisual para redes',
    rol: 'Producción y edición',
    categorias: ['redes', 'audiovisual'],
    tema: { fondo: '#EFCADB', tinta: '#2B214A', acento: '#921A45' },   // rosa · índigo · vino
    resumen: 'Un video que anuncia un evento como si fuera la noticia del día.',
    texto: [
      'La Sociedad Científica Estudiantil de Psicología de la UCB necesitaba invitar a sus Psicojornadas.',
      'Por eso el video imita un periódico. Varias personas en la calle leen la portada de "Últimas noticias" y descubren las fechas del evento.',
      'Así la invitación se siente como una noticia que da curiosidad mirar hasta el final.'
    ],
    videos: [
      { archivo: 'assets/video/tt-psicojornadas.mp4', preview: 'assets/video/tt-psicojornadas-preview.mp4',
        poster: 'assets/img/posters/tt-psicojornadas.jpg', titulo: 'Últimas noticias', formato: 'vertical' }
    ]
  },
  {
    id: 'illich',
    numero: '02',
    titulo: 'Illich',
    subtitulo: 'Contenido para redes',
    cliente: 'Cliente recurrente',
    anio: '2026',
    disciplina: 'Edición de video para redes',
    rol: 'Edición y gráficos',
    categorias: ['redes', 'audiovisual'],
    tema: { fondo: '#BEDEE5', tinta: '#0C3D4E', acento: '#2B214A' },   // celeste · petróleo · índigo
    resumen: 'Videos a cámara con subtítulos y gráficos para redes sociales.',
    texto: [
      'Son videos verticales para las redes de un cliente con el que trabajo seguido.',
      'Edito lo que graba a cámara y le sumo subtítulos, cortes con ritmo y gráficos que acompañan lo que dice.'
    ],
    videos: [
      { archivo: 'assets/video/tt-illich-1.mp4', preview: 'assets/video/tt-illich-1-preview.mp4',
        poster: 'assets/img/posters/tt-illich-1.jpg', titulo: 'Video 1', formato: 'vertical' },
      { archivo: 'assets/video/tt-illich-2.mp4', preview: 'assets/video/tt-illich-2-preview.mp4',
        poster: 'assets/img/posters/tt-illich-2.jpg', titulo: 'Video 2', formato: 'vertical' }
    ]
  },
  {
    id: 'logos',
    numero: '03',
    titulo: 'Logos animados',
    subtitulo: 'Firmas de cierre',
    cliente: 'Bigtool · Biteme · Guille · Montículo',
    anio: '2026',
    disciplina: 'Motion graphics',
    rol: 'Animación de logotipos',
    categorias: ['motion'],
    tema: { fondo: '#C2BBCE', tinta: '#2B214A', acento: '#921A45' },   // lila · índigo · vino
    resumen: 'Cuatro logos animados para cerrar los videos de TikTok de cada marca.',
    texto: [
      'Cada marca quería terminar sus videos de TikTok con una firma propia y fácil de recordar.',
      'Por eso animé cada logo a partir de su forma. La herramienta de Bigtool, la galleta mordida de Biteme, la firma de Guille y el trazo de Montículo.'
    ],
    videos: [
      { archivo: 'assets/video/logo-bigtool.mp4', preview: 'assets/video/logo-bigtool-preview.mp4',
        poster: 'assets/img/posters/logo-bigtool.jpg', titulo: 'Bigtool', formato: 'vertical' },
      { archivo: 'assets/video/logo-biteme.mp4', preview: 'assets/video/logo-biteme-preview.mp4',
        poster: 'assets/img/posters/logo-biteme.jpg', titulo: 'Biteme', formato: 'vertical' },
      { archivo: 'assets/video/logo-guille.mp4', preview: 'assets/video/logo-guille-preview.mp4',
        poster: 'assets/img/posters/logo-guille.jpg', titulo: 'Guille', formato: 'vertical' },
      { archivo: 'assets/video/logo-monticulo.mp4', preview: 'assets/video/logo-monticulo-preview.mp4',
        poster: 'assets/img/posters/logo-monticulo.jpg', titulo: 'Montículo', formato: 'vertical' }
    ]
  },
  {
    id: 'biteme-prodovi',
    numero: '04',
    titulo: 'Biteme & Prodovi',
    subtitulo: 'Motion para promocionar',
    cliente: 'Biteme · Prodovi',
    anio: '2026',
    disciplina: 'Motion graphics para redes',
    rol: 'Motion graphics y edición',
    categorias: ['motion', 'redes'],
    tema: { fondo: '#C6A5B3', tinta: '#2B214A', acento: '#921A45' },   // malva · índigo · vino
    resumen: 'Dos piezas cortas de motion graphics para promocionar marcas en redes.',
    texto: [
      'Son dos videos verticales para redes sociales. Uno es para Biteme en Plaza 21 y el otro para Prodovi.',
      'Usé formas, color y un ritmo rápido para que el mensaje se entienda en los primeros segundos.'
    ],
    videos: [
      { archivo: 'assets/video/mg-biteme-plaza21.mp4', preview: 'assets/video/mg-biteme-plaza21-preview.mp4',
        poster: 'assets/img/posters/mg-biteme-plaza21.jpg', titulo: 'Biteme · Plaza 21', formato: 'vertical' },
      { archivo: 'assets/video/mg-prodovi.mp4', preview: 'assets/video/mg-prodovi-preview.mp4',
        poster: 'assets/img/posters/mg-prodovi.jpg', titulo: 'Prodovi', formato: 'vertical' }
    ]
  },
  {
    id: 'grandprix',
    numero: '05',
    titulo: 'Grand Prix',
    subtitulo: 'Evento Unifranz',
    cliente: 'Unifranz',
    anio: '2026',
    disciplina: 'Motion graphics para evento',
    rol: 'Motion graphics',
    categorias: ['motion'],
    tema: { fondo: '#0C3D4E', tinta: '#BEDEE5', acento: '#CC8987' },   // petróleo · celeste · coral
    resumen: 'Pieza de motion graphics para el Grand Prix, un evento grande de Unifranz.',
    texto: [
      'Pieza de motion graphics para el Grand Prix, un evento grande de Unifranz.'
    ],
    videos: [
      { archivo: 'assets/video/mg-grandprix.mp4', preview: 'assets/video/mg-grandprix-preview.mp4',
        poster: 'assets/img/posters/mg-grandprix.jpg', titulo: 'Grand Prix', formato: 'horizontal' }
    ]
  }
];

/* Nombres que se muestran en los botones de filtro (inicio) */
VERUZH.categorias = {
  todo: 'todo',
  redes: 'redes sociales',
  motion: 'motion graphics',
  audiovisual: 'producción audiovisual'
};
