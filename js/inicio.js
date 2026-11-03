/* ═══════════════════════════════════════════════════════════════
   VERUZH · PORTAFOLIO — inicio.js  (solo index.html)
     1. Intro: líder de película dibujado en <canvas>
     2. Hero: el nombre "veruzh" con video adentro, SIEMPRE en una línea
     3. Reel: los cuadros de los videos se ordenan al bajar (GSAP)
     4. Trabajos: tarjetas, filtros y previews de video
     5. Estudio de caso: pincel boceto → final
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$ } = V;

  /* Colores de la paleta que usa el canvas (los mismos de base.css) */
  const PALETA = { indigo: '#2B214A', rosa: '#EFCADB', rojo: '#D3372E', celeste: '#BEDEE5', coral: '#CC8987' };

  /* Lista plana de todos los clips (sirve para el reel) */
  const clips = V.proyectos.flatMap(p => p.videos.map(v => ({ ...v, proyecto: p })));


  /* ─── 1. INTRO ──────────────────────────────────────────────────
     Un "líder" de película (la cuenta regresiva del cine) en índigo
     con líneas rosa y un barrido rojo. Al elegir "con sonido" o "sin
     sonido" cuenta 3-2-1 y se cierra como un iris. Ese clic también
     es el permiso que el navegador pide para que algo pueda sonar.  */
  let heroIniciado = false;   // evita iniciar el hero dos veces
  const intro = $('#intro');
  const yaVista = V.leer('veruzh-intro') === '1' || location.hash;
  if (!intro || yaVista) { intro && intro.remove(); iniciarHero(); }
  else iniciarIntro();

  function iniciarIntro() {
    document.body.classList.add('con-intro');
    const lienzo = $('.intro__lienzo', intro), ctx = lienzo.getContext('2d');
    const gato = new Image(); gato.src = 'assets/img/logo/gato-rosa.png';
    let w, h, dpr, numero = null, inicioCuenta = 0, vivo = true;

    function medir() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = lienzo.width = innerWidth * dpr; h = lienzo.height = innerHeight * dpr;
    }
    medir(); addEventListener('resize', medir);

    function cuadro(t) {
      if (!vivo) return;
      const cx = w / 2, cy = h / 2.25, R = Math.min(w, h) * 0.3;
      ctx.fillStyle = PALETA.indigo;
      ctx.fillRect(0, 0, w, h);
      // barrido rojo que gira (1 vuelta por segundo durante la cuenta, lento antes)
      const vel = numero ? 1 : 0.25;
      const ang = ((t - inicioCuenta) / 1000 * vel % 1) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R * 1.6, -Math.PI / 2, ang); ctx.closePath();
      ctx.fillStyle = 'rgba(211,55,46,0.28)'; ctx.fill();
      // cruz y círculos en rosa
      ctx.strokeStyle = 'rgba(239,202,219,0.45)'; ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
      [R, R * 0.82].forEach(r => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); });
      // centro: el gato o el número de la cuenta
      if (numero) {
        ctx.fillStyle = PALETA.rosa;
        ctx.font = `900 ${R * 1.1}px Getai, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(numero), cx, cy + R * 0.06);
      } else if (gato.complete && gato.naturalWidth) {
        const gw = R * 0.9, gh = gw * gato.naturalHeight / gato.naturalWidth;
        ctx.globalAlpha = 0.85 + Math.sin(t / 300) * 0.15;
        ctx.drawImage(gato, cx - gw / 2, cy - gh / 2 - R * 0.05, gw, gh);
        ctx.globalAlpha = 1;
      }
      // polvo y rayas de película (celeste muy suave)
      ctx.fillStyle = 'rgba(190,222,229,0.5)';
      for (let i = 0; i < 6; i++) ctx.fillRect(Math.random() * w, Math.random() * h, (1 + Math.random() * 2) * dpr, (1 + Math.random() * 2) * dpr);
      if (Math.random() < 0.2) ctx.fillRect(Math.random() * w, 0, 1 * dpr, h);
      requestAnimationFrame(cuadro);
    }
    requestAnimationFrame(cuadro);

    $$('[data-entrar]', intro).forEach(b => b.addEventListener('click', async () => {
      if (b.dataset.entrar === 'con' && !V.sonido.activo) V.sonido.cambiar(true);
      if (b.dataset.entrar === 'sin' && V.sonido.activo) V.sonido.cambiar(false);
      intro.classList.add('contando');
      inicioCuenta = performance.now();
      const cuenta = V.menosMovimiento ? [] : [3, 2, 1];
      for (const n of cuenta) { numero = n; V.sonido.pitido(n === 1 ? 1320 : 880); await V.espera(520); }
      intro.classList.add('saliendo');
      V.guardar('veruzh-intro', '1');
      iniciarHero();
      await V.espera(900);
      vivo = false; intro.remove();
      document.body.classList.remove('con-intro');
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }));
    setTimeout(() => $('[data-entrar]', intro).focus(), 300);
  }


  /* ─── 2. HERO ──────────────────────────────────────────────────
     El nombre se dibuja en un <canvas>, así nunca se parte en dos
     líneas: el JS mide la palabra y calcula el tamaño de letra exacto
     para que "veruzh" ocupe todo el ancho disponible.
       · capa 1 y 2: el nombre en rojo y celeste, un poco corridos
         (separación RGB que sigue al mouse o reacciona al scroll)
       · capa 3: el video recortado con la forma de las letras        */
  function iniciarHero() {
    if (heroIniciado) return; heroIniciado = true;

    const PALABRA = 'veruzh';
    const titulo = $('.hero__titulo');
    const lienzo = $('.hero__lienzo'), ctx = lienzo.getContext('2d');
    const mascara = document.createElement('canvas'), mctx = mascara.getContext('2d');
    const video = $('.hero__video');
    let medida = null;     // tamaños calculados en medir()

    // 2a. El video va pasando por los previews de cada proyecto
    const lista = ['tt-psicojornadas', 'mg-biteme-plaza21', 'logo-biteme', 'mg-grandprix', 'mg-prodovi', 'tt-illich-2', 'logo-bigtool']
      .map(n => `assets/video/${n}-preview.mp4`);
    let i = 0;
    const siguiente = () => { video.src = lista[i++ % lista.length]; video.play().catch(() => {}); };
    video.loop = false;
    video.addEventListener('ended', siguiente);
    if (!V.menosMovimiento) siguiente(); else { video.src = lista[0]; }

    // 2b. Medir: tamaño de letra para que la palabra entre justa en UNA línea
    function medir() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const ancho = titulo.clientWidth;
      ctx.font = '900 100px Getai, "Arial Black", sans-serif';
      const m = ctx.measureText(PALABRA);
      const sube = m.actualBoundingBoxAscent || 76, baja = m.actualBoundingBoxDescent || 2;
      const izq = m.actualBoundingBoxLeft || 0, der = m.actualBoundingBoxRight || m.width;
      const anchoTexto = izq + der;
      let tam = (ancho * 0.96) / anchoTexto * 100;
      // si la pantalla es baja (celular acostado), que tampoco sea demasiado alto
      const altoMax = innerHeight * (innerHeight < 560 ? 0.34 : 0.46);
      tam = Math.min(tam, altoMax / ((sube + baja) / 100));
      const relleno = tam * 0.08;                      // aire para la separación RGB
      const altoCss = (sube + baja) / 100 * tam + relleno * 2;
      lienzo.style.height = altoCss + 'px';
      lienzo.width = mascara.width = Math.round(ancho * dpr);
      lienzo.height = mascara.height = Math.round(altoCss * dpr);
      medida = {
        dpr, tam: tam * dpr,
        x: ((ancho - anchoTexto / 100 * tam) / 2 + izq / 100 * tam) * dpr,   // centrado
        y: (relleno + sube / 100 * tam) * dpr
      };
    }

    const fuente = () => `900 ${medida.tam}px Getai, "Arial Black", sans-serif`;
    const escribir = (c, color, dx = 0, dy = 0) => {
      c.font = fuente(); c.textBaseline = 'alphabetic'; c.textAlign = 'left';
      c.fillStyle = color; c.fillText(PALABRA, medida.x + dx, medida.y + dy);
    };

    // 2c. Movimiento de la separación RGB
    let ox = 0, oy = 0, tx = 0, ty = 0, rafagaHasta = 0;
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      tx = (e.clientX / innerWidth - 0.5) * 2;     // -1 a 1
      ty = (e.clientY / innerHeight - 0.5) * 2;
    });
    let ultimoScroll = scrollY;
    addEventListener('scroll', () => {
      if (!V.esTactil) return;
      const vel = scrollY - ultimoScroll; ultimoScroll = scrollY;
      tx = Math.max(-1, Math.min(1, vel / 25)); ty = tx * 0.5;
    }, { passive: true });
    // ráfaga de glitch: cada tantos segundos, y al tocar el nombre
    const rafaga = () => { rafagaHasta = performance.now() + 320; };
    if (!V.menosMovimiento) (function programar() { setTimeout(() => { rafaga(); programar(); }, 3500 + Math.random() * 3500); })();
    lienzo.addEventListener('pointerdown', () => { rafaga(); V.sonido.tic(); });

    // 2d. Dibujar cada cuadro (solo mientras el hero se ve en pantalla)
    let visible = true;
    V.observar(e => { visible = e[0].isIntersecting; if (visible) requestAnimationFrame(dibujar); }).observe(titulo);

    function dibujar(t) {
      if (!medida) return;
      ox += (tx - ox) * 0.08; oy += (ty - oy) * 0.08;
      if (V.esTactil) { tx *= 0.92; ty *= 0.92; }    // en táctil vuelve solo a su sitio
      const f = medida.tam * 0.035;
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);

      // capas de color corridas
      ctx.globalAlpha = 0.9;
      escribir(ctx, PALETA.rojo, ox * f + f * 0.25, oy * f * 0.5);
      escribir(ctx, PALETA.celeste, -ox * f * 0.8 - f * 0.25, -oy * f * 0.4);
      ctx.globalAlpha = 1;

      // video dentro de las letras: se pinta el texto y luego el video SOLO encima ("source-in")
      mctx.globalCompositeOperation = 'source-over';
      mctx.clearRect(0, 0, mascara.width, mascara.height);
      escribir(mctx, PALETA.rosa);
      if (video.readyState >= 2 && video.videoWidth) {
        mctx.globalCompositeOperation = 'source-in';
        // el video cubre todo el lienzo sin deformarse (como object-fit: cover)
        const r = Math.max(mascara.width / video.videoWidth, mascara.height / video.videoHeight);
        const vw = video.videoWidth * r, vh = video.videoHeight * r;
        mctx.drawImage(video, (mascara.width - vw) / 2, (mascara.height - vh) / 2, vw, vh);
        // un velo rosa suave para que el nombre siempre se lea sobre el índigo
        mctx.globalCompositeOperation = 'source-atop';
        mctx.fillStyle = 'rgba(239,202,219,0.18)';
        mctx.fillRect(0, 0, mascara.width, mascara.height);
      }
      // ráfaga: franjas horizontales que se desplazan un instante
      if (t < rafagaHasta) {
        const franjas = 5;
        for (let k = 0; k < franjas; k++) {
          const y = Math.random() * mascara.height, alto = mascara.height * (0.04 + Math.random() * 0.1);
          const d = (Math.random() - 0.5) * medida.tam * 0.16;
          ctx.drawImage(mascara, 0, y, mascara.width, alto, d, y, mascara.width, alto);
        }
      }
      ctx.drawImage(mascara, 0, 0);
      // contorno rosa fino: las letras se leen aunque el video sea oscuro
      ctx.lineWidth = Math.max(1, medida.tam * 0.006);
      ctx.strokeStyle = 'rgba(239,202,219,0.75)';
      ctx.font = fuente(); ctx.strokeText(PALABRA, medida.x, medida.y);
      if (visible) requestAnimationFrame(dibujar);
    }

    // esperar a la fuente Getai antes de medir (si no, mediría otra letra)
    const listo = () => { medir(); requestAnimationFrame(dibujar); };
    (document.fonts && document.fonts.load ? document.fonts.load('900 100px Getai') : Promise.resolve())
      .then(listo, listo);
    let reloj;
    addEventListener('resize', () => { clearTimeout(reloj); reloj = setTimeout(medir, 120); });

    // 2e. Código de tiempo que avanza (horas:minutos:segundos:cuadros a 24 fps)
    const tc = $('.hero__tiempo'), t0 = performance.now();
    const dos = n => String(n).padStart(2, '0');
    setInterval(() => {
      const s = (performance.now() - t0) / 1000;
      tc.textContent = `${dos(s / 3600 | 0)}:${dos(s / 60 % 60 | 0)}:${dos(s % 60 | 0)}:${dos((s * 24) % 24 | 0)}`;
    }, 1000 / 24);

    // 2f. El oficio va cambiando con efecto scramble
    const oficio = $('.hero__oficio');
    let k = 0;
    setInterval(() => { k = (k + 1) % V.contacto.oficio.length; V.scrambleA(oficio, V.contacto.oficio[k]); }, 2800);
  }


  /* ─── 3. REEL ──────────────────────────────────────────────────
     Una "hoja de contactos" con un cuadro de cada video. En pantallas
     medianas y grandes los cuadros llegan girando y se ordenan a medida
     que bajas (sin fijar la pantalla, así nunca te quedas "atrapada").
     En celular es una tira que se desliza de lado con el dedo.        */
  const reel = $('#reel'), contCuadros = $('.reel__cuadros');
  clips.forEach((c, n) => {
    const d = document.createElement('a');
    d.className = 'reel__cuadro';
    d.href = `proyecto.html?p=${c.proyecto.id}`;
    d.style.backgroundImage = `url('${c.poster}')`;
    d.dataset.n = String(n + 1).padStart(2, '0');
    d.dataset.cursor = c.proyecto.titulo.toLowerCase();
    d.setAttribute('aria-label', `${c.proyecto.titulo}, ${c.titulo}`);
    contCuadros.append(d);
  });

  const cifras = $$('[data-cifra]', reel);
  const tira = innerWidth < 700;
  if (tira) reel.classList.add('estatico');
  if (!tira && window.gsap && window.ScrollTrigger && !V.menosMovimiento) armarReel();

  function armarReel() {
    gsap.registerPlugin(ScrollTrigger);
    const cuadros = $$('.reel__cuadro', reel);
    cifras.forEach(s => { s.textContent = '0'; });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: reel, start: 'top 80%', end: 'center 55%', scrub: 0.8 }
    });
    // cada cuadro viene desde un lugar distinto, girado, y se acomoda en su sitio
    cuadros.forEach((el, i) => {
      const lado = i % 5 - 2;                 // -2 … 2 según la columna
      tl.from(el, {
        x: lado * innerWidth * 0.09 + gsap.utils.random(-40, 40),
        y: gsap.utils.random(120, 260) * (i < 5 ? 1 : 1.4),
        rotation: gsap.utils.random(-28, 28),
        opacity: 0, scale: 0.7, duration: 1, ease: 'power2.out'
      }, i * 0.06);
    });
    // los números cuentan desde 0
    cifras.forEach(s => {
      const o = { v: 0 };
      tl.to(o, { v: +s.dataset.cifra, duration: 1, ease: 'none', onUpdate: () => { s.textContent = Math.round(o.v); } }, 0);
    });
  }


  /* ─── 4. TRABAJOS ─────────────────────────────────────────────── */
  const zonaTarjetas = $('.tarjetas'), zonaFiltros = $('.filtros');

  // 4a. Botones de filtro (solo las categorías que de verdad se usan)
  const usadas = ['todo', ...new Set(V.proyectos.flatMap(p => p.categorias))];
  zonaFiltros.innerHTML = usadas.map((c, i) =>
    `<button type="button" data-filtro="${c}" aria-pressed="${i === 0}">${V.categorias[c] || c}</button>`).join('');

  // 4b. Tarjetas (una por proyecto, con los colores de su tema en datos.js)
  zonaTarjetas.innerHTML = V.proyectos.map(p => {
    const v = p.videos[0];
    const ancha = v.formato === 'horizontal';
    const n = p.videos.length;
    return `
      <a class="tarjeta revela${ancha ? ' ancha' : ''}" href="proyecto.html?p=${p.id}"
         style="--fondo-p:${p.tema.fondo};--tinta-p:${p.tema.tinta};--acento-p:${p.tema.acento}"
         data-categorias="${p.categorias.join(' ')}" data-cursor="ver proyecto">
        <div class="tarjeta__media">
          <img src="${v.poster}" alt="${p.titulo}: cuadro del video" loading="lazy">
          <video muted playsinline loop preload="none" data-src="${v.preview}" aria-hidden="true"></video>
          <div class="visor" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
          <span class="tarjeta__chip">${n > 1 ? n + ' videos' : (ancha ? 'horizontal' : 'vertical')}</span>
        </div>
        <div class="tarjeta__info">
          <span class="tarjeta__num">${p.numero}</span>
          <h3 class="tarjeta__titulo" data-scramble>${p.titulo}</h3>
          <p class="tarjeta__meta">${p.subtitulo} · ${p.cliente}</p>
          <p class="tarjeta__resumen">${p.resumen}</p>
          <span class="tarjeta__ver">ver proyecto ${V.flecha()}</span>
        </div>
      </a>`;
  }).join('');
  const tarjetas = $$('.tarjeta', zonaTarjetas);

  // 4c. Activar una tarjeta = reproducir su preview con un glitch corto
  function activar(t, si) {
    const v = $('video', t), media = $('.tarjeta__media', t);
    if (si) {
      if (!v.src) v.src = v.dataset.src;          // el video se carga recién aquí
      v.play().catch(() => {});
      t.classList.add('activa');
      media.classList.remove('glitch'); void media.offsetWidth; media.classList.add('glitch');
      V.sonido.tic();
    } else {
      t.classList.remove('activa'); v.pause();
    }
  }
  if (!V.esTactil) {
    // con mouse: al pasar por encima
    tarjetas.forEach(t => {
      t.addEventListener('pointerenter', e => e.pointerType === 'mouse' && activar(t, true));
      t.addEventListener('pointerleave', e => e.pointerType === 'mouse' && activar(t, false));
      t.addEventListener('focus', () => activar(t, true));
      t.addEventListener('blur', () => activar(t, false));
    });
  } else {
    // en táctil: se activa la tarjeta que está más centrada en la pantalla
    const visibles = new Map();
    const io = V.observar(ents => {
      ents.forEach(e => visibles.set(e.target, e.intersectionRatio));
      let mejor = null, max = 0.55;
      visibles.forEach((r, t) => { if (r > max && !t.classList.contains('fuera')) { max = r; mejor = t; } });
      tarjetas.forEach(t => { if (t !== mejor && t.classList.contains('activa')) activar(t, false); });
      if (mejor && !mejor.classList.contains('activa')) activar(mejor, true);
    }, { threshold: [0, 0.25, 0.55, 0.75, 1] });
    tarjetas.forEach(t => io.observe(t));
  }

  // 4d. Filtrar con animación FLIP (cada tarjeta se desliza a su nuevo lugar)
  zonaFiltros.addEventListener('click', e => {
    const b = e.target.closest('[data-filtro]'); if (!b) return;
    const f = b.dataset.filtro;
    $$('[data-filtro]', zonaFiltros).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    V.sonido.clic();
    const antes = new Map(tarjetas.map(t => [t, t.getBoundingClientRect()]));
    tarjetas.forEach(t => {
      const entra = f === 'todo' || t.dataset.categorias.split(' ').includes(f);
      t.classList.toggle('fuera', !entra);
      if (entra) t.classList.add('visible');
    });
    zonaTarjetas.classList.toggle('filtrado', f !== 'todo');
    tarjetas.forEach(t => {
      if (t.classList.contains('fuera')) return;
      const a = antes.get(t), d = t.getBoundingClientRect();
      const nueva = !a.width;
      t.animate(nueva
        ? [{ opacity: 0, transform: 'scale(0.92)' }, { opacity: 1, transform: 'none' }]
        : [{ transform: `translate(${a.left - d.left}px, ${a.top - d.top}px)` }, { transform: 'none' }],
        { duration: V.menosMovimiento ? 1 : 650, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });


  /* ─── 5b. CASO 2: la pantalla de Reka se mueve solo cuando se ve ── */
  const videoReka = $('.reka-adelanto video');
  if (videoReka && !V.menosMovimiento) V.observar(ents => {
    if (ents[0].isIntersecting) { videoReka.preload = 'auto'; videoReka.play().catch(() => {}); } else videoReka.pause();
  }, { threshold: 0.3 }).observe(videoReka);


  /* ─── 5. ESTUDIO DE CASO: pincel boceto → final ─────────────── */
  const area = $('.pincel__area');
  if (area) {
    const final = 'assets/img/caso/final-polaroid.jpg';
    V.pincel(area, { oculta: final, radio: innerWidth < 700 ? 46 : 70 });
    // botón accesible: cambia toda la imagen entre boceto y final
    const boton = $('[data-revelar]'), img = $('img', area);
    const boceto = img.src;
    let mostrandoFinal = false;
    boton.addEventListener('click', () => {
      mostrandoFinal = !mostrandoFinal;
      img.src = mostrandoFinal ? final : boceto;
      img.alt = mostrandoFinal ? 'Ilustración final de la portada' : 'Boceto a lápiz de la portada';
      boton.textContent = mostrandoFinal ? 'ver boceto' : 'ver final';
      area.animate([{ filter: 'brightness(1.4)' }, { filter: 'none' }], { duration: 300 });
      V.sonido.clic();
    });
  }
})();
