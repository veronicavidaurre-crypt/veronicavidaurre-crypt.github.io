/* ═══════════════════════════════════════════════════════════════
   VERUZH · PORTAFOLIO — caso.js  (estudio-de-caso.html)
     1. Barra de actos e índice del proceso que se iluminan al leer
     2. Mapa mental interactivo
     3. SCAMPER: tarjetas que giran
     4. Bloc de bocetos: hojas con checkbox + deslizar + teclado
     5. Paleta: copiar el código del color
     6. Portada/contraportada que se da vuelta arrastrando
     7. Antes / después (comparar original y rediseño)
     8. Visor de imágenes (mockups)
     9. Cierre poético: palabras, pétalos y foto que se revela
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$ } = V;

  /* ─── 1. BARRA DE ACTOS ───────────────────────────────────────── */
  const linksActos = $$('.actos a');
  const relleno = $('.actos__barra span');
  const actos = $$('[data-acto]');
  addEventListener('scroll', () => {
    const inicio = actos[0].offsetTop, fin = document.body.scrollHeight - innerHeight;
    relleno.style.width = `${Math.max(0, Math.min(1, (scrollY - inicio) / (fin - inicio))) * 100}%`;
  }, { passive: true });
  const ioActo = V.observar(ents => ents.forEach(e => {
    if (e.isIntersecting) linksActos.forEach((a, i) => a.classList.toggle('activo', i === +e.target.dataset.acto));
  }), { rootMargin: '-45% 0px -50% 0px' });
  actos.forEach(a => ioActo.observe(a));

  // el índice del acto 2 marca la parte que estás leyendo
  const linksIndice = $$('.indice a');
  const ioParte = V.observar(ents => ents.forEach(e => {
    if (e.isIntersecting) linksIndice.forEach(a => a.classList.toggle('activo', a.hash === '#' + e.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  $$('.parte').forEach(el => ioParte.observe(el));


  /* ─── 2. MAPA MENTAL ──────────────────────────────────────────────
     Cada idea tiene dos posiciones (en %): una para pantallas anchas
     y otra para celular. "con" dice con qué otras ideas se conecta. */
  const mapa = $('[data-mapa]');
  const nodos = [
    { id: 'cancion',   t: 'canción',              a: [16, 18], m: [24, 8],  con: ['destino'], d: 'Cada canción sale disparada sin saber a quién llega.' },
    { id: 'destino',   t: 'destino incierto',     a: [9, 42],  m: [74, 8],  con: ['cancion'], d: 'Las canciones alcanzan a quien no esperaban.' },
    { id: 'nostalgia', t: 'nostalgia',            a: [12, 68], m: [16, 26], con: ['melancolia'], d: 'Lo que se extraña al escuchar una canción.' },
    { id: 'melancolia',t: 'melancolía (morado)',  a: [26, 88], m: [70, 26], con: ['nostalgia'], d: 'El morado: lo que fue y todavía se extraña.' },
    { id: 'disparo',   t: 'disparo',              a: [37, 12], m: [22, 74], con: ['camara'], clave: true, d: 'La bala dispara… y la cámara también.' },
    { id: 'camara',    t: 'cámara',               a: [62, 12], m: [76, 74], con: ['disparo', 'foto'], clave: true, d: 'La cámara reemplaza al arma: dispara fotos en vez de balas.' },
    { id: 'foto',      t: 'foto',                 a: [86, 28], m: [20, 88], con: ['camara', 'polaroid'], d: 'Una foto, como una canción, congela un momento.' },
    { id: 'polaroid',  t: 'polaroid',             a: [90, 55], m: [80, 88], con: ['foto', 'recuerdo'], d: 'La polaroid guarda el momento, como una canción guarda una historia.' },
    { id: 'recuerdo',  t: 'recuerdo',             a: [74, 86], m: [50, 96], con: ['polaroid', 'flores'], d: 'Las canciones se atan a momentos y personas.' },
    { id: 'flores',    t: 'flores',               a: [50, 90], m: [50, 12], con: ['recuerdo'], d: 'Algo vivo que se guarda, como una canción.' }
  ];
  const svg = $('.mapa__lineas', mapa);
  const nota = $('.mapa__nota');
  const notaBase = nota.textContent;
  mapa.insertAdjacentHTML('beforeend', '<div class="mapa__centro">balas<br>perdidas</div>');
  nodos.forEach(n => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'mapa__nodo' + (n.clave ? ' clave' : '');
    b.textContent = n.t; b.dataset.id = n.id;
    mapa.append(b); n.el = b;
  });
  function posicionar() {
    const movil = innerWidth <= 700;
    svg.setAttribute('viewBox', '0 0 100 100');
    let lineas = '';
    nodos.forEach(n => {
      const [x, y] = movil ? n.m : n.a;
      n.x = x; n.y = y;
      n.el.style.left = x + '%'; n.el.style.top = y + '%';
      lineas += `<line data-de="${n.id}" data-a="centro" x1="50" y1="50" x2="${x}" y2="${y}"/>`;
    });
    // conexiones entre ideas (sin repetir)
    const hechas = new Set();
    nodos.forEach(n => n.con.forEach(c => {
      const k = [n.id, c].sort().join('-'); if (hechas.has(k)) return; hechas.add(k);
      const o = nodos.find(z => z.id === c);
      const clave = n.clave && o.clave;
      lineas += `<line class="${clave ? 'clave' : ''}" data-de="${n.id}" data-a="${c}" x1="${n.x}" y1="${n.y}" x2="${o.x}" y2="${o.y}"/>`;
    }));
    svg.innerHTML = lineas;
  }
  posicionar();
  addEventListener('resize', posicionar);
  function encender(id) {
    $$('line', svg).forEach(l => l.classList.toggle('on', !!id && (l.dataset.de === id || l.dataset.a === id)));
    const n = nodos.find(z => z.id === id);
    nodos.forEach(z => z.el.classList.toggle('on', !!n && (z.id === id || n.con.includes(z.id))));
    nota.textContent = n ? `${n.t}: ${n.d}` : notaBase;
  }
  mapa.addEventListener('pointerover', e => { const b = e.target.closest('.mapa__nodo'); if (b && e.pointerType === 'mouse') encender(b.dataset.id); });
  mapa.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') encender(null); });
  // al tocar: enciende esa idea; si tocas la misma otra vez, se apaga
  let elegido = null;
  mapa.addEventListener('click', e => {
    const b = e.target.closest('.mapa__nodo'); if (!b) return;
    elegido = elegido === b.dataset.id ? null : b.dataset.id;
    encender(elegido); V.sonido.tic();
  });
  mapa.addEventListener('focusin', e => { const b = e.target.closest('.mapa__nodo'); if (b) encender(b.dataset.id); });


  /* ─── 3. SCAMPER ──────────────────────────────────────────────── */
  const scamper = [
    ['S', 'Sustituir', 'la bala por el disparo de una cámara'],
    ['C', 'Combinar', 'fotografía y flores'],
    ['A', 'Adaptar', 'el formato polaroid como portada'],
    ['M', 'Modificar', 'la paleta hacia un morado melancólico'],
    ['P', 'Poner otro uso', 'la polaroid como contenedor de recuerdos'],
    ['E', 'Eliminar', 'armas y violencia literal'],
    ['R', 'Reorganizar', 'la flor sale del marco hacia la realidad']
  ];
  $('.scamper').innerHTML = scamper.map(([l, p, d], i) => `
    <li class="revela" data-retraso="${i % 4}">
      <button type="button" aria-label="${p}: ${d}">
        <span class="cara cara--frente"><b>${l}</b><span>${p}</span></span>
        <span class="cara cara--dorso"><small>${p}</small>${d}</span>
      </button>
    </li>`).join('');
  $('.scamper').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    b.classList.toggle('volteada'); V.sonido.papel();
  });


  /* ─── 4. BLOC DE BOCETOS ─────────────────────────────────────────
     Las hojas giran por CSS cuando su checkbox se marca. Aquí solo
     decidimos QUÉ checkbox marcar: con los botones, con las flechas
     del teclado o deslizando el dedo / arrastrando el mouse.         */
  const bloc = $('[data-bloc]');
  const casillas = $$('.bloc__casilla', bloc);
  const marco = $('.bloc__marco', bloc);
  const puntos = $('.bloc__puntos', bloc);
  const contador = $('.bloc__contador', bloc);
  const btnAnt = $('[data-bloc-anterior]', bloc), btnSig = $('[data-bloc-siguiente]', bloc);
  const total = casillas.length + 1;               // hojas + contratapa
  puntos.innerHTML = '<i></i>'.repeat(total);

  const hojaActual = () => casillas.filter(c => c.checked).length;   // 0 = tapa
  function pintarBloc() {
    const n = hojaActual();
    $$('i', puntos).forEach((p, i) => p.classList.toggle('on', i === n));
    contador.textContent = `${n + 1} / ${total}`;
    btnAnt.disabled = n === 0; btnSig.disabled = n === casillas.length;
  }
  function pasar(dir) {
    const n = hojaActual();
    if (dir > 0 && n < casillas.length) casillas[n].checked = true;
    else if (dir < 0 && n > 0) casillas[n - 1].checked = false;
    else return;
    V.sonido.papel();
    pintarBloc();
  }
  btnSig.addEventListener('click', () => pasar(1));
  btnAnt.addEventListener('click', () => pasar(-1));
  $('[data-bloc-reiniciar]', bloc).addEventListener('click', async e => {
    e.stopPropagation();
    // vuelve a la tapa hoja por hoja, en cascada
    for (let i = casillas.length - 1; i >= 0; i--) { casillas[i].checked = false; pintarBloc(); V.sonido.papel(); await V.espera(120); }
  });
  // teclado (cuando el foco está en los controles del bloc)
  bloc.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pasar(1); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pasar(-1); }
  });
  // deslizar: dedo hacia la izquierda = siguiente; hacia la derecha = anterior.
  // Un clic/toque corto sin deslizar también pasa a la siguiente hoja.
  let x0 = null, y0 = 0, t0 = 0;
  marco.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    x0 = e.clientX; y0 = e.clientY; t0 = performance.now();
  });
  marco.addEventListener('pointerup', e => {
    if (x0 === null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0, dt = performance.now() - t0;
    x0 = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) pasar(dx < 0 ? 1 : -1);
    else if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && dt < 400) pasar(1);
  });
  marco.addEventListener('pointercancel', () => { x0 = null; });
  pintarBloc();


  /* ─── 5. PALETA: copiar el código ─────────────────────────────── */
  $$('.paleta li').forEach(li => {
    li.tabIndex = 0; li.setAttribute('role', 'button');
    li.setAttribute('aria-label', `${li.querySelector('b').textContent} ${li.dataset.hex}: copiar código`);
    const copiar = async () => {
      try { await navigator.clipboard.writeText(li.dataset.hex); } catch (e) { /* si no se puede copiar, igual se muestra el código */ }
      $$('.paleta li').forEach(x => x.classList.remove('copiado'));
      li.classList.add('copiado'); V.sonido.tic();
      setTimeout(() => li.classList.remove('copiado'), 1600);
    };
    li.addEventListener('click', copiar);
    li.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), copiar()));
  });


  /* ─── 6. PORTADA / CONTRAPORTADA QUE GIRA ───────────────────────
     Al arrastrar, el ángulo sigue al dedo o al mouse; al soltar, se
     acomoda de frente o de espaldas (0° o 180°).                     */
  const giro = $('[data-giro]');
  let angulo = 0, arrastre = null;
  const lado = $('.giro__lado b');
  const fijar = a => {
    angulo = a; giro.style.setProperty('--ry', `${a}deg`);
    // ¿qué cara se ve? (0° = portada, 180° = contraportada)
    const vuelta = ((Math.round(a / 180) % 2) + 2) % 2;
    lado.textContent = vuelta ? 'contraportada' : 'portada';
  };
  // al soltar: si giraste más de 40°, termina de darse vuelta hacia ese lado
  const acomodar = () => {
    const base = arrastre ? arrastre.a : Math.round(angulo / 180) * 180;
    const delta = angulo - base;
    fijar(Math.abs(delta) > 40 ? base + Math.sign(delta) * 180 : base);
  };
  $('[data-girar]').addEventListener('click', () => { fijar(Math.round(angulo / 180) * 180 + 180); V.sonido.whoosh(); });
  giro.addEventListener('pointerdown', e => { arrastre = { x: e.clientX, a: angulo, movido: false }; giro.setPointerCapture(e.pointerId); });
  giro.addEventListener('pointermove', e => {
    if (!arrastre) return;
    const dx = e.clientX - arrastre.x;
    if (Math.abs(dx) > 4) { arrastre.movido = true; giro.classList.add('arrastrando'); }
    if (arrastre.movido) fijar(arrastre.a + dx * 0.6);
  });
  const soltar = () => {
    if (!arrastre) return;
    giro.classList.remove('arrastrando');
    if (!arrastre.movido) fijar(Math.round(angulo / 180) * 180 + 180);   // toque simple = dar vuelta
    else acomodar();
    arrastre = null; V.sonido.whoosh();
  };
  giro.addEventListener('pointerup', soltar);
  giro.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fijar(Math.round(angulo / 180) * 180 + 180); V.sonido.whoosh(); }
  });
  giro.addEventListener('pointercancel', () => { giro.classList.remove('arrastrando'); if (arrastre) acomodar(); arrastre = null; });


  /* ─── 7. ANTES / DESPUÉS ─────────────────────────────────────────
     Arrastrar (mouse o dedo) mueve la línea. El deslizador invisible
     permite hacerlo también con las flechas del teclado.              */
  const comparar = $('[data-comparar]');
  if (comparar) {
    const control = $('.comparar__control', comparar);
    const poner = p => { p = Math.max(0, Math.min(100, p)); comparar.style.setProperty('--p', p + '%'); control.value = p; };
    const desdeX = x => { const r = comparar.getBoundingClientRect(); poner((x - r.left) / r.width * 100); };
    let moviendo = false;
    comparar.addEventListener('pointerdown', e => { moviendo = true; comparar.setPointerCapture(e.pointerId); desdeX(e.clientX); });
    comparar.addEventListener('pointermove', e => { if (moviendo) desdeX(e.clientX); });
    ['pointerup', 'pointercancel'].forEach(t => comparar.addEventListener(t, () => { moviendo = false; }));
    control.addEventListener('input', () => poner(+control.value));
    // una pequeña demostración al aparecer, para que se note que se mueve
    V.observar((ents, io) => {
      if (!ents[0].isIntersecting || V.menosMovimiento) return;
      io.disconnect();
      comparar.animate([{ '--p': '50%' }, { '--p': '30%' }, { '--p': '70%' }, { '--p': '50%' }], { duration: 1600, easing: 'ease-in-out' });
    }, { threshold: 0.6 }).observe(comparar);
  }


  /* ─── 8. VISOR DE IMÁGENES ──────────────────────────────────────
     Se cierra tocando EN CUALQUIER PARTE (también sobre la imagen),
     con el botón "cerrar" o con la tecla Esc.                       */
  const visor = $('.lightbox'), imgVisor = $('img', visor);
  $$('[data-ampliar]').forEach(b => b.addEventListener('click', () => {
    imgVisor.src = b.dataset.ampliar;
    imgVisor.alt = $('img', b).alt;
    if (visor.showModal) visor.showModal(); else visor.setAttribute('open', '');
    V.sonido.clic();
  }));
  const cerrarVisor = () => { visor.close ? visor.close() : visor.removeAttribute('open'); };
  visor.addEventListener('click', cerrarVisor);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && visor.open) cerrarVisor(); });


  /* ─── 9. CIERRE POÉTICO ──────────────────────────────────────────
     Separa cada palabra en un <span> para que aparezcan una por una,
     crea pétalos que caen y, al entrar en pantalla, "revela" la foto. */
  const cierre = $('.cierre');
  if (cierre) {
    let retraso = 0;
    $$('[data-palabras]', cierre).forEach(p => {
      const palabras = p.textContent.trim().split(/\s+/);
      p.setAttribute('aria-label', p.textContent.trim());
      p.innerHTML = palabras.map((w, i) => `<span class="p" aria-hidden="true" style="--i:${i};--d:${retraso}ms">${w}</span>`).join(' ');
      retraso += palabras.length * 70 + 300;
    });
    if (!V.menosMovimiento) {
      const colores = ['#EFCADB', '#CC8987', '#C6A5B3', '#C2BBCE'];
      $('.cierre__petalos').innerHTML = Array.from({ length: innerWidth < 700 ? 10 : 18 }, () => {
        const t = 10 + Math.random() * 16;
        return `<i class="petalo" style="left:${Math.random() * 100}%;--t:${t}px;--c:${colores[Math.random() * 4 | 0]};--dur:${9 + Math.random() * 8}s;--del:${-Math.random() * 12}s"></i>`;
      }).join('');
    }
    V.observar((ents, io) => { if (ents[0].isIntersecting) { cierre.classList.add('visto'); io.disconnect(); } }, { threshold: 0.35 }).observe(cierre);
  }
})();
