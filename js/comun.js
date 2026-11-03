/* ═══════════════════════════════════════════════════════════════
   VERUZH · PORTAFOLIO — comun.js
   Funciones que usan TODAS las páginas:
     1. Utilidades (detectar táctil, movimiento reducido…)
     2. Cabecera + menú circular
     3. Pie de página con tus datos de contacto
     4. Texto que se desordena y se acomoda ("scramble")
     5. Aparecer al hacer scroll
     6. Cursor propio (solo con mouse)
     7. Sonido de la interfaz (sintetizado, sin archivos de audio)
     8. Transición entre páginas con la silueta del gato
     9. Pincel que revela una imagen (lo usan inicio y estudio de caso)
    10. Créditos finales (easter egg del pie)
   Se carga DESPUÉS de datos.js en cada página.
   ═══════════════════════════════════════════════════════════════ */

window.VERUZH = window.VERUZH || {};
const V = window.VERUZH;

/* ─── 1. UTILIDADES ─────────────────────────────────────────────── */
V.esTactil = window.matchMedia('(hover: none), (pointer: coarse)').matches;
V.menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
V.$ = (sel, raiz = document) => raiz.querySelector(sel);
V.$$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));
// Guardamos cada IntersectionObserver aquí para que el navegador no lo
// borre de la memoria antes de tiempo (si no, algunos efectos no se activan).
V.observadores = [];
V.observar = (callback, opciones) => { const io = new IntersectionObserver(callback, opciones); V.observadores.push(io); return io; };
V.espera = ms => new Promise(r => setTimeout(r, ms));

// Guardar y leer preferencias sin romper si el navegador lo bloquea
V.guardar = (clave, valor) => { try { sessionStorage.setItem(clave, valor); } catch (e) {} };
V.leer = clave => { try { return sessionStorage.getItem(clave); } catch (e) { return null; } };

// Flecha en SVG (la tipografía no trae el símbolo →)
V.flecha = (giro = 0) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" style="transform:rotate(${giro}deg)"><path d="M4 12h15M13 6l6 6-6 6"/></svg>`;


/* ─── 2. CABECERA + MENÚ ───────────────────────────────────────── */
// Las páginas del sitio (se usan en la cabecera, el menú y el pie)
V.paginas = [
  { n: '01', texto: 'inicio', href: 'index.html', id: 'inicio' },
  { n: '02', texto: 'trabajos', href: 'index.html#trabajos', id: 'trabajos' },
  { n: '03', texto: 'estudio de caso', href: 'estudio-de-caso.html', id: 'caso' },
  { n: '04', texto: 'sobre mí', href: 'sobre-mi.html', id: 'sobre' },
  { n: '05', texto: 'contacto', href: '#contacto', id: 'contacto' }
];
function crearCabecera() {
  const pagina = document.body.dataset.pagina || '';
  const c = V.contacto;
  const actual = l => l.id === pagina ? 'aria-current="page"' : '';

  const cabecera = document.createElement('header');
  cabecera.className = 'cabecera';
  cabecera.innerHTML = `
    <a class="marca" href="index.html" aria-label="veruzh, ir al inicio">
      <img src="assets/img/logo/gato-indigo.png" alt="" width="34" height="32">
      <span>${c.nombre}</span>
    </a>
    <nav class="nav" aria-label="Secciones">
      ${V.paginas.map(l => `<a href="${l.href}" ${actual(l)}>${l.texto}</a>`).join('')}
    </nav>
    <div class="cabecera__derecha">
      <button class="sonido" type="button" aria-pressed="false">
        <span class="sonido__barras" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span class="sonido__texto">sonido off</span>
      </button>
      <button class="boton-menu" type="button" aria-expanded="false" aria-controls="menu">
        <span class="boton-menu__icono" aria-hidden="true"><i></i><i></i></span>
        <span class="boton-menu__texto">menú</span>
      </button>
    </div>`;

  const menu = document.createElement('nav');
  menu.className = 'menu';
  menu.id = 'menu';
  menu.setAttribute('aria-label', 'Menú principal');
  menu.innerHTML = `
    <ul class="menu__lista">
      ${V.paginas.map(l => `<li><a href="${l.href}" ${actual(l)}><small>${l.n}</small><span data-texto>${l.texto}</span></a></li>`).join('')}
    </ul>
    <div class="menu__contacto">
      <a href="mailto:${c.correo}">${c.correo}</a>
      <a href="https://wa.me/${c.whatsapp}" target="_blank" rel="noopener">WhatsApp ${c.telefono}</a>
      <span>${c.ciudad}</span>
    </div>`;

  document.body.prepend(menu);
  document.body.prepend(cabecera);

  // Abrir / cerrar
  const boton = V.$('.boton-menu', cabecera);
  function abrir(si) {
    // el círculo nace exactamente donde está el botón
    const r = boton.getBoundingClientRect();
    menu.style.setProperty('--mx', `${r.left + r.width / 2}px`);
    menu.style.setProperty('--my', `${r.top + r.height / 2}px`);
    document.body.classList.toggle('menu-abierto', si);
    boton.setAttribute('aria-expanded', String(si));
    V.$('.boton-menu__texto', boton).textContent = si ? 'cerrar' : 'menú';
    document.documentElement.style.overflow = si ? 'hidden' : '';
    if (si) {
      V.sonido.whoosh();
      V.$$('[data-texto]', menu).forEach((el, i) => setTimeout(() => V.scramble(el, { duracion: 500, paso: 35 }), 250 + i * 60));
      setTimeout(() => V.$('a', menu).focus({ preventScroll: true }), 400);
    }
  }
  V.cerrarMenu = () => abrir(false);
  boton.addEventListener('click', () => abrir(!document.body.classList.contains('menu-abierto')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('menu-abierto')) { abrir(false); boton.focus(); } });
  menu.addEventListener('click', e => { if (e.target.closest('a')) abrir(false); });
  // si la pantalla se agranda (por ejemplo al girar la tablet), se cierra el menú
  addEventListener('resize', () => { if (innerWidth > 1100 && document.body.classList.contains('menu-abierto')) abrir(false); });
}


/* ─── 3. PIE DE PÁGINA + BOTÓN "VOLVER ARRIBA" ───────────────────── */
function crearPie() {
  if (document.body.hasAttribute('data-sin-pie')) return;
  const c = V.contacto;
  const behance = c.behance
    ? `<a href="${c.behance}" target="_blank" rel="noopener">Behance</a>`
    : `<span>Behance (próximamente)</span>`;
  const pie = document.createElement('footer');
  pie.className = 'pie tema-indigo';
  pie.id = 'contacto';
  pie.innerHTML = `
    <p class="etiqueta">05 — contacto</p>
    <a class="pie__grande" href="mailto:${c.correo}" data-cursor="escríbeme">hablemos<em>.</em></a>
    <div class="pie__grid">
      <div><h3>Correo</h3><a href="mailto:${c.correo}">${c.correo}</a></div>
      <div><h3>WhatsApp</h3><a href="https://wa.me/${c.whatsapp}" target="_blank" rel="noopener">${c.telefono}</a></div>
      <div><h3>Redes</h3>${behance}</div>
      <div><h3>Ir a</h3>
        ${V.paginas.slice(0, 4).map(l => `<a href="${l.href}">${l.texto}</a><br>`).join('')}
        <button type="button" class="pie__creditos">ver créditos</button>
      </div>
    </div>
    <div class="pie__base">
      <span>© ${new Date().getFullYear()} ${c.nombreCompleto} · ${c.nombre}</span>
      <span>${c.ciudad}</span>
    </div>`;
  document.body.append(pie);
  V.$('.pie__creditos', pie).addEventListener('click', verCreditos);

  // botón flotante para volver arriba (aparece después de bajar un poco)
  const arriba = document.createElement('a');
  arriba.className = 'arriba'; arriba.href = '#'; arriba.setAttribute('aria-label', 'Volver arriba');
  arriba.innerHTML = V.flecha();
  document.body.append(arriba);
  arriba.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: V.menosMovimiento ? 'auto' : 'smooth' }); });
  addEventListener('scroll', () => arriba.classList.toggle('visible', scrollY > innerHeight * 1.2), { passive: true });
}


/* ─── 4. SCRAMBLE ──────────────────────────────────────────────────
   Cambia cada letra por símbolos al azar y las va fijando una por una.
   Recorre los nodos de texto, así respeta <span>, <em>, etc.
   · V.scramble(elemento)                 → desordena y vuelve al mismo texto
   · V.scrambleA(elemento, 'texto nuevo') → pasa de un texto a otro        */
const SIMBOLOS = 'アイウエオカキクケコ01▓░▒■□●◆/\\<>_—#%'.split('');
const azar = () => SIMBOLOS[Math.random() * SIMBOLOS.length | 0];

V.scramble = (el, { duracion = 700, paso = 40 } = {}) => {
  if (!el || V.menosMovimiento || el._scrambling) return;
  el._scrambling = true;
  const nodos = [];
  (function juntar(n) { n.childNodes.forEach(h => h.nodeType === 3 ? h.textContent.trim() && nodos.push(h) : juntar(h)); })(el);
  const originales = nodos.map(n => n.textContent);
  const total = originales.join('').length;
  const inicio = performance.now();
  (function cuadro(ahora) {
    const t = ahora - inicio;
    let i = 0;
    nodos.forEach((n, k) => {
      n.textContent = [...originales[k]].map(ch => {
        const listo = t > (i++) * paso + duracion * 0.25;
        return ch === ' ' || listo ? ch : azar();
      }).join('');
    });
    if (t < duracion * 0.25 + total * paso) requestAnimationFrame(cuadro);
    else { nodos.forEach((n, k) => n.textContent = originales[k]); el._scrambling = false; }
  })(inicio);
};

V.scrambleA = (el, nuevo, { paso = 45 } = {}) => {
  if (!el) return;
  if (V.menosMovimiento) { el.textContent = nuevo; return; }
  const viejo = el.textContent;
  const largo = Math.max(viejo.length, nuevo.length);
  const inicio = performance.now();
  (function cuadro(ahora) {
    const t = ahora - inicio;
    let out = '';
    for (let i = 0; i < largo; i++) {
      const fijo = t > i * paso + 120;
      if (fijo) out += nuevo[i] || '';
      else out += (nuevo[i] === ' ' ? ' ' : azar());
    }
    el.textContent = out;
    if (t < largo * paso + 140) requestAnimationFrame(cuadro); else el.textContent = nuevo;
  })(inicio);
};

// Todo elemento con data-scramble se desordena al pasar el mouse o al tocarlo
function activarScrambleHover() {
  document.addEventListener('pointerover', e => {
    const el = e.target.closest('[data-scramble]');
    if (el && !el.contains(e.relatedTarget)) V.scramble(el, { duracion: 500, paso: 30 });
  });
}


/* ─── 5. APARECER AL HACER SCROLL ──────────────────────────────── */
V.observarRevelado = (raiz = document) => {
  // un solo observador para toda la página; se puede llamar varias veces
  if (!V._ioRevela) V._ioRevela = V.observar(entradas => entradas.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('visible');
    if (en.target.hasAttribute('data-scramble-entrada')) V.scramble(en.target, { duracion: 600, paso: 35 });
    V._ioRevela.unobserve(en.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  V.$$('.revela, .barrido, [data-scramble-entrada]', raiz).forEach(el => {
    if (el._observado) return;
    el._observado = true;
    V._ioRevela.observe(el);
  });
};


/* ─── 6. ETIQUETA QUE SIGUE AL MOUSE ───────────────────────────────
   El cursor normal del sistema SIEMPRE se ve. Cuando pasas sobre algo
   con data-cursor="texto", aparece al lado una pastilla con ese texto
   ("ver", "abrir"…) que lo sigue. En táctil no existe.               */
function crearCursor() {
  if (V.esTactil) return;
  const etiqueta = document.createElement('div');
  etiqueta.className = 'cursor-etiqueta';
  etiqueta.setAttribute('aria-hidden', 'true');
  document.body.append(etiqueta);
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const objetivo = e.target.closest('[data-cursor]');
    const texto = objetivo ? objetivo.dataset.cursor : '';
    if (etiqueta.textContent !== texto) etiqueta.textContent = texto;
    etiqueta.classList.toggle('visible', !!texto);
    etiqueta.style.transform = `translate(${e.clientX + 18}px, ${e.clientY + 18}px)`;
  });
  document.addEventListener('mouseleave', () => etiqueta.classList.remove('visible'));
}


/* ─── 7. SONIDO DE LA INTERFAZ ────────────────────────────────────
   Pequeños sonidos hechos con Web Audio (no hay archivos mp3).
   Empiezan apagados; el botón "sonido" de la cabecera los activa y
   también quita el silencio de los videos de los proyectos.
   El navegador solo permite sonar después de un clic o toque, por eso
   el contexto de audio se crea en el primer gesto.                   */
V.sonido = (() => {
  let ctx = null;
  let activo = V.leer('veruzh-sonido') === '1';
  const asegurar = () => {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  // tono corto (clic, tic)
  function tono(frec = 880, dur = 0.06, vol = 0.05, tipo = 'sine') {
    if (!activo || !asegurar()) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.value = frec;
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
  }
  // ruido filtrado (papel, aire)
  function ruido(dur = 0.25, desde = 800, hasta = 3000, vol = 0.08) {
    if (!activo || !asegurar()) return;
    const n = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    const src = ctx.createBufferSource(); src.buffer = n;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass';
    f.frequency.setValueAtTime(desde, ctx.currentTime);
    f.frequency.exponentialRampToValueAtTime(hasta, ctx.currentTime + dur);
    const g = ctx.createGain(); g.gain.value = vol;
    src.connect(f).connect(g).connect(ctx.destination); src.start();
  }
  const api = {
    get activo() { return activo; },
    cambiar(valor = !activo) {
      activo = valor; V.guardar('veruzh-sonido', activo ? '1' : '0');
      if (activo) asegurar();
      document.dispatchEvent(new CustomEvent('veruzh:sonido', { detail: activo }));
      pintarBoton();
      api.tic();
    },
    tic: () => tono(1320, 0.04, 0.035, 'triangle'),
    clic: () => tono(520, 0.08, 0.06, 'square'),
    papel: () => ruido(0.32, 600, 4200, 0.12),
    whoosh: () => ruido(0.5, 300, 1800, 0.07),
    pitido: (f = 1000) => tono(f, 0.18, 0.06, 'sine')
  };
  function pintarBoton() {
    const b = V.$('.sonido'); if (!b) return;
    b.classList.toggle('activo', activo);
    b.setAttribute('aria-pressed', String(activo));
    V.$('.sonido__texto', b).textContent = activo ? 'sonido on' : 'sonido off';
  }
  api.pintarBoton = pintarBoton;
  return api;
})();


/* ─── 8. TRANSICIÓN ENTRE PÁGINAS ─────────────────────────────── */
function crearTransicion() {
  const t = document.createElement('div');
  t.className = 'transicion';
  t.setAttribute('aria-hidden', 'true');
  t.innerHTML = '<div class="transicion__capa"></div><div class="transicion__capa"></div><div class="transicion__capa"></div><div class="transicion__entrada"></div>';
  document.body.append(t);

  // Entrada: si venimos de otra página del portafolio, se abre el "iris"
  if (V.leer('veruzh-transicion') === '1' && !V.menosMovimiento) {
    V.guardar('veruzh-transicion', '0');
    t.classList.add('entrando');
    setTimeout(() => t.classList.remove('entrando'), 1250);
  }
  // Si el navegador vuelve "atrás" desde su memoria, limpiamos la salida
  addEventListener('pageshow', e => { if (e.persisted) t.classList.remove('saliendo', 'entrando'); });

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (/^(mailto:|tel:|https?:|\/\/)/i.test(href)) return;

    // Enlaces a una sección de la MISMA página (#trabajos, #contacto…)
    const [ruta, ancla] = href.split('#');
    const actual = location.pathname.split('/').pop() || 'index.html';
    if (!ruta || ruta === actual) {
      if (!ancla) return;
      const destino = document.getElementById(ancla);
      if (!destino) return;
      e.preventDefault();
      if (V.cerrarMenu) V.cerrarMenu();
      setTimeout(() => destino.scrollIntoView({ behavior: V.menosMovimiento ? 'auto' : 'smooth' }), 320);
      return;
    }
    // Enlaces a otra página: animación de salida y luego navegar
    if (V.menosMovimiento) return;
    e.preventDefault();
    V.sonido.whoosh();
    t.classList.add('saliendo');
    V.guardar('veruzh-transicion', '1');
    setTimeout(() => { location.href = href; }, 1150);
  });
}


/* ─── 9. PINCEL QUE REVELA UNA IMAGEN ─────────────────────────────
   Uso: V.pincel(contenedor, { oculta: 'ruta.jpg' })
   El contenedor tiene una imagen visible (la de abajo). Encima se pone
   un <canvas>: donde pasas el mouse o el dedo se dibujan círculos, y con
   'source-in' la imagen oculta solo aparece dentro de esos círculos.
   En táctil, al aparecer en pantalla, el pincel hace un trazo solo
   para que se entienda que se puede deslizar.                        */
V.pincel = (caja, { oculta, radio = 70, desvanece = 0.012, auto = true } = {}) => {
  const img = new Image(); img.src = oculta;
  const lienzo = document.createElement('canvas');
  lienzo.className = 'pincel__lienzo';
  lienzo.setAttribute('aria-hidden', 'true');
  caja.append(lienzo);
  const ctx = lienzo.getContext('2d');
  let manchas = [], w = 0, h = 0, dpr = 1, corriendo = false;

  function medir() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = caja.clientWidth; h = caja.clientHeight;
    lienzo.width = w * dpr; lienzo.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const ro = new ResizeObserver(medir); ro.observe(caja); V.observadores.push(ro); medir();

  function agregar(x, y, r = radio) {
    manchas.push({ x, y, r: r * (0.8 + Math.random() * 0.4), a: 1 });
    if (manchas.length > 70) manchas.shift();
    if (!corriendo) { corriendo = true; requestAnimationFrame(dibujar); }
  }
  // dibuja la imagen como "object-fit: cover"
  function cubrir() {
    const ri = img.naturalWidth / img.naturalHeight, rc = w / h;
    let dw = w, dh = h, dx = 0, dy = 0;
    if (ri > rc) { dw = h * ri; dx = (w - dw) / 2; } else { dh = w / ri; dy = (h - dh) / 2; }
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  function dibujar() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h);
    manchas = manchas.filter(m => m.a > 0.02);
    manchas.forEach(m => {
      const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
      g.addColorStop(0, `rgba(0,0,0,${m.a})`);
      g.addColorStop(0.6, `rgba(0,0,0,${m.a * 0.8})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
      m.a -= desvanece;
    });
    if (img.complete && img.naturalWidth) { ctx.globalCompositeOperation = 'source-in'; cubrir(); }
    if (manchas.length) requestAnimationFrame(dibujar); else { corriendo = false; ctx.clearRect(0, 0, w, h); }
  }
  let ultimo = null;
  caja.addEventListener('pointermove', e => {
    const r = caja.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    // rellena el espacio entre dos movimientos rápidos para que el trazo sea continuo
    if (ultimo) {
      const d = Math.hypot(x - ultimo.x, y - ultimo.y), pasos = Math.floor(d / (radio * 0.35));
      for (let i = 1; i < pasos; i++) agregar(ultimo.x + (x - ultimo.x) * i / pasos, ultimo.y + (y - ultimo.y) * i / pasos);
    }
    agregar(x, y); ultimo = { x, y };
  });
  caja.addEventListener('pointerleave', () => { ultimo = null; });

  // Trazo automático (demostración) la primera vez que se ve
  async function demo() {
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      agregar(w * (0.18 + t * 0.64), h * (0.5 + Math.sin(t * Math.PI * 2) * 0.22), radio * 1.1);
      await V.espera(22);
    }
  }
  if (auto && !V.menosMovimiento) {
    const io = V.observar(en => { if (en[0].isIntersecting) { io.disconnect(); setTimeout(demo, 500); } }, { threshold: 0.6 });
    io.observe(caja);
  }
  return { demo, revelarTodo: () => { for (let y = 0; y < h; y += radio) for (let x = 0; x < w; x += radio) agregar(x, y, radio * 1.4); } };
};


/* ─── 10. CRÉDITOS FINALES ───────────────────────────────────────
   Una secuencia con async/await: pantalla negra, rollo de créditos
   que sube como al final de una película y un "fin".               */
async function verCreditos() {
  const c = V.contacto;
  let capa = V.$('.creditos');
  if (!capa) {
    capa = document.createElement('div');
    capa.className = 'creditos';
    capa.setAttribute('role', 'dialog');
    capa.setAttribute('aria-label', 'Créditos');
    const filas = [
      ['un portafolio de', c.nombre],
      ['producción audiovisual', c.nombreCompleto],
      ['diseño digital', c.nombreCompleto],
      ['motion graphics', c.nombreCompleto],
      ['proyectos', V.proyectos.map(p => p.titulo).join(' · ')],
      ['estudio de caso', 'Balas Perdidas'],
      ['tipografías', 'DT Getai Grotesk · Switzer'],
      ['hecho en', c.ciudad],
      ['gracias por ver', 'hasta el próximo corte']
    ];
    capa.innerHTML = `<button class="creditos__cerrar" type="button">cerrar ✕</button>
      <div class="creditos__rollo">${filas.map(f => `<p>${f[0]}<strong>${f[1]}</strong></p>`).join('')}
      <img src="assets/img/logo/logo-rosa.png" alt="veruzh"></div>
      <p class="creditos__pista">toca o haz clic en cualquier parte para salir · tecla Esc</p>`;
    document.body.append(capa);
  }
  const rollo = V.$('.creditos__rollo', capa);
  capa.classList.add('activo');
  document.documentElement.style.overflow = 'hidden';
  V.sonido.pitido(880);
  const alto = rollo.offsetHeight + innerHeight;
  const anim = rollo.animate(
    [{ transform: 'translateY(0)' }, { transform: `translateY(-${alto}px)` }],
    { duration: V.menosMovimiento ? 1 : Math.max(9000, alto * 9), easing: 'linear', fill: 'forwards' }
  );
  const cerrar = () => {
    anim.cancel(); capa.classList.remove('activo'); document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', tecla);
    V.$('.pie__creditos') && V.$('.pie__creditos').focus();
  };
  const tecla = e => { if (e.key === 'Escape') cerrar(); };
  capa.onclick = cerrar;                       // cualquier clic o toque cierra
  document.addEventListener('keydown', tecla);
  V.$('.creditos__cerrar', capa).focus();
  anim.onfinish = cerrar;
}


/* ─── ARRANQUE ─────────────────────────────────────────────────── */
crearCabecera();
crearPie();
crearCursor();
crearTransicion();
activarScrambleHover();
V.sonido.pintarBoton();
// <span data-flecha></span> en el HTML se convierte en una flecha SVG
V.$$('[data-flecha]').forEach(s => { s.outerHTML = V.flecha(+s.dataset.flecha || 0); });
V.$('.sonido').addEventListener('click', () => V.sonido.cambiar());
// Se espera a que TODO el HTML y el JS de la página estén listos
// (así también se observan las tarjetas que crea inicio.js, proyecto.js…)
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => V.observarRevelado());
else V.observarRevelado();
