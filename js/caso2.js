/* ═══════════════════════════════════════════════════════════════
   VERUZH · PORTAFOLIO — caso2.js  (estudio-de-caso-2.html · Reka)
     1. Barra de actos e índice del proceso
     2. Cifras que cuentan desde 0
     3. Mapa: el cuarto de Reka (cada objeto dice en qué aviso se convierte)
     4. Paleta: copiar el código del color
     5. Pantallas de inicio y cierre (interruptor día / noche)
     6. Simulador del stream en vivo (overlays + alertas)
     7. Videos de las alertas (se mueven al verse, clic = sonido)
     8. Visor de imágenes (sistema)
     9. Diario de bocetos: hojas con checkbox + deslizar + teclado
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$ } = V;

  /* ─── 1. BARRA DE ACTOS E ÍNDICE ──────────────────────────────── */
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

  const linksIndice = $$('.indice a');
  const ioParte = V.observar(ents => ents.forEach(e => {
    if (e.isIntersecting) linksIndice.forEach(a => a.classList.toggle('activo', a.hash === '#' + e.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  $$('.parte').forEach(el => ioParte.observe(el));


  /* ─── 2. CIFRAS QUE CUENTAN ───────────────────────────────────── */
  const cifras = $$('[data-cuenta]');
  if (!V.menosMovimiento) {
    cifras.forEach(c => { c.textContent = '0'; });
    V.observar((ents, io) => {
      if (!ents[0].isIntersecting) return;
      io.disconnect();
      cifras.forEach((c, i) => {
        const fin = +c.dataset.cuenta, t0 = performance.now() + i * 150;
        (function paso(t) {
          const p = Math.max(0, Math.min(1, (t - t0) / 900));
          c.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(paso);
        })(performance.now());
      });
    }, { threshold: 0.5 }).observe($('.cifras'));
  }


  /* ─── 3. MAPA: EL CUARTO DE REKA ──────────────────────────────── */
  const cuarto = $('[data-cuarto]'), notaCuarto = $('.cuarto__nota');
  const notaBase = notaCuarto.textContent;
  const objetos = $$('.objeto-mapa', cuarto);
  const encender = b => {
    objetos.forEach(o => o.classList.toggle('on', o === b));
    notaCuarto.textContent = b ? `${b.querySelector('small').textContent} → ${b.querySelector('b').textContent}. ${b.dataset.dice}` : notaBase;
  };
  objetos.forEach(b => {
    b.addEventListener('pointerenter', e => e.pointerType === 'mouse' && encender(b));
    b.addEventListener('focus', () => encender(b));
    b.addEventListener('click', () => { encender(b.classList.contains('on') && V.esTactil ? null : b); V.sonido.tic(); });
  });
  cuarto.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') encender(null); });


  /* ─── 4. PALETA: copiar el código ─────────────────────────────── */
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


  /* ─── 5. PANTALLAS DE INICIO Y CIERRE ─────────────────────────────
     Dos videos encimados: el interruptor hace un fundido entre ellos.
     Solo se reproducen mientras el monitor se ve en pantalla.        */
  const videosPantalla = $$('.monitor__video');
  const textoPantalla = $('[data-texto-pantalla]');
  const textos = {
    inicio: '<b>Empezando pronto.</b> Atardecer en la ventana y el monitor encendido. El stream está por comenzar.',
    cierre: '<b>Nos vemos en el próximo stream.</b> El mismo cuarto de noche, con luna y la pantalla apagada.'
  };
  let pantallaActual = 'inicio', monitorVisible = false;
  function mostrarPantalla(cual) {
    pantallaActual = cual;
    videosPantalla.forEach(v => {
      const activo = v.dataset.pantalla === cual;
      v.classList.toggle('activo', activo);
      if (activo && monitorVisible) v.play().catch(() => {}); else v.pause();
    });
    $$('[data-ver]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ver === cual)));
    textoPantalla.innerHTML = textos[cual];
  }
  $$('[data-ver]').forEach(b => b.addEventListener('click', () => { mostrarPantalla(b.dataset.ver); V.sonido.clic(); }));
  V.observar(ents => {
    monitorVisible = ents[0].isIntersecting;
    mostrarPantalla(pantallaActual);
  }, { threshold: 0.1 }).observe($('.monitor'));
  // el video de la portada también se pausa cuando no se ve
  const videoHero = $('.reka-hero__video');
  V.observar(ents => { if (ents[0].isIntersecting) videoHero.play().catch(() => {}); else videoHero.pause(); }).observe(videoHero);


  /* ─── 6. SIMULADOR DEL STREAM ─────────────────────────────────────
     Escena = "juego de referencia" dibujado con CSS + el overlay
     recortado encima. Cada botón lanza una alerta: el objeto aparece
     con su propio movimiento y llega un mensaje al chat.             */
  const escena = $('.rs__escena'), alerta = $('.rs__alerta'), chat = $('[data-chat]'), espect = $('[data-espect]');
  const ALERTAS = {
    '1bit':        { img: 'dulce',     texto: '¡vale_m te dio 1 bit!',       mov: 'flota',    chat: ['vale_m', 'toma un dulce reka'] },
    '100bits':     { img: 'lata',      texto: '¡nico88 te dio 100 bits!',    mov: 'burbujea', chat: ['nico88', 'una soda para la partida'] },
    '1000bits':    { img: 'lampara',   texto: '¡sofi.plays te dio 1000 bits!', mov: 'brilla', chat: ['sofi.plays', 'que brille esa lámpara'] },
    'suscripcion': { img: 'audifonos', texto: '¡mateo_lp se suscribió!',     mov: 'vibra',    chat: ['mateo_lp', 'ya soy parte del cuarto'] },
    'seguidor':    { img: 'avion',     texto: '¡luna_gg te sigue!',          mov: 'vuela',    chat: ['luna_gg', 'nueva por aquí'] }
  };
  const coloresChat = ['#F47B2A', '#A9CF5E', '#FAE8C3', '#C6A5B3'];
  let reloj;
  $$('[data-alerta]').forEach(b => b.addEventListener('click', () => {
    const a = ALERTAS[b.dataset.alerta];
    const img = $('img', alerta);
    img.src = `assets/img/reka/${a.img}.webp`;
    $('span', alerta).textContent = a.texto;
    alerta.style.setProperty('--mov', a.mov);
    alerta.classList.remove('mostrar'); void alerta.offsetWidth; alerta.classList.add('mostrar');
    V.sonido.pitido(a.img === 'lampara' ? 1320 : 990);
    clearTimeout(reloj); reloj = setTimeout(() => alerta.classList.remove('mostrar'), 3300);
    // mensaje nuevo en el chat (se guardan solo los últimos 5)
    const li = document.createElement('li');
    li.innerHTML = `<b style="color:${coloresChat[Math.random() * 4 | 0]}">${a.chat[0]}</b> ${a.chat[1]}`;
    chat.append(li);
    while (chat.children.length > 5) chat.firstElementChild.remove();
    espect.textContent = +espect.textContent + (Math.random() * 4 | 0) + 1;
  }));
  $$('[data-modo-sim]').forEach(b => b.addEventListener('click', () => {
    escena.dataset.modo = b.dataset.modoSim;
    $$('[data-modo-sim]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    V.sonido.clic();
  }));


  /* ─── 7. VIDEOS DE LAS ALERTAS ────────────────────────────────────
     Con mouse: se mueven al pasar por encima. En celular: se mueven
     cuando están en pantalla. Clic o toque = activa / quita el sonido. */
  const tarjetas = $$('[data-video-alerta]');
  const cargar = v => { if (v.preload !== 'auto') { v.preload = 'auto'; v.load(); } };
  tarjetas.forEach(t => {
    const v = $('video', t);
    if (!V.esTactil) {
      t.addEventListener('pointerenter', () => { cargar(v); v.play().catch(() => {}); });
      t.addEventListener('pointerleave', () => { if (v.muted) v.pause(); });
    }
    t.addEventListener('click', () => {
      const sonar = v.muted;
      // solo suena una a la vez
      tarjetas.forEach(o => { const ov = $('video', o); ov.muted = true; o.classList.remove('con-sonido'); });
      v.muted = !sonar; t.classList.toggle('con-sonido', sonar);
      if (sonar) { v.currentTime = 0; cargar(v); v.play().catch(() => {}); }
    });
  });
  if (V.esTactil) {
    const io = V.observar(ents => ents.forEach(e => {
      const v = $('video', e.target);
      if (e.isIntersecting) { cargar(v); v.play().catch(() => {}); } else { v.pause(); v.muted = true; e.target.classList.remove('con-sonido'); }
    }), { threshold: 0.5 });
    tarjetas.forEach(t => io.observe(t));
  } else {
    // con mouse, si una alerta con sonido sale de la pantalla, se calla
    const io = V.observar(ents => ents.forEach(e => { if (!e.isIntersecting) { const v = $('video', e.target); v.pause(); v.muted = true; e.target.classList.remove('con-sonido'); } }));
    tarjetas.forEach(t => io.observe(t));
  }


  /* ─── 8. VISOR DE IMÁGENES ────────────────────────────────────────
     Se cierra tocando EN CUALQUIER PARTE, con el botón o con Esc.     */
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


  /* ─── 9. DIARIO DE BOCETOS ────────────────────────────────────────
     Igual que en el caso 1: las hojas giran por CSS cuando su
     checkbox se marca. Aquí solo se decide QUÉ checkbox marcar.      */
  const bloc = $('[data-bloc]');
  if (bloc) {
    const casillas = $$('.bloc__casilla', bloc);
    const marco = $('.bloc__marco', bloc);
    const puntos = $('.bloc__puntos', bloc);
    const contador = $('.bloc__contador', bloc);
    const btnAnt = $('[data-bloc-anterior]', bloc), btnSig = $('[data-bloc-siguiente]', bloc);
    const total = casillas.length + 1;               // hojas + contratapa
    puntos.innerHTML = '<i></i>'.repeat(total);
    const hojaActual = () => casillas.filter(c => c.checked).length;   // 0 = tapa
    const pintar = () => {
      const n = hojaActual();
      $$('i', puntos).forEach((p, i) => p.classList.toggle('on', i === n));
      contador.textContent = `${n + 1} / ${total}`;
      btnAnt.disabled = n === 0; btnSig.disabled = n === casillas.length;
    };
    const pasar = dir => {
      const n = hojaActual();
      if (dir > 0 && n < casillas.length) casillas[n].checked = true;
      else if (dir < 0 && n > 0) casillas[n - 1].checked = false;
      else return;
      V.sonido.papel(); pintar();
    };
    btnSig.addEventListener('click', () => pasar(1));
    btnAnt.addEventListener('click', () => pasar(-1));
    $('[data-bloc-reiniciar]', bloc).addEventListener('click', async e => {
      e.stopPropagation();
      for (let i = casillas.length - 1; i >= 0; i--) { casillas[i].checked = false; pintar(); V.sonido.papel(); await V.espera(110); }
    });
    bloc.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pasar(1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pasar(-1); }
    });
    // deslizar de lado pasa la hoja; un toque corto sin deslizar, también
    let x0 = null, y0 = 0, t0 = 0;
    marco.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; x0 = e.clientX; y0 = e.clientY; t0 = performance.now(); });
    marco.addEventListener('pointerup', e => {
      if (x0 === null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0, dt = performance.now() - t0; x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) pasar(dx < 0 ? 1 : -1);
      else if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && dt < 400) pasar(1);
    });
    marco.addEventListener('pointercancel', () => { x0 = null; });
    pintar();
  }
})();
