/* ═══════════════════════════════════════════════════════════════
   VERUZH · PORTAFOLIO — proyecto.js  (proyecto.html)
   Lee ?p=id del link, busca ese proyecto en datos.js y llena la
   página: títulos, ficha, texto, reproductor y "siguiente proyecto".
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$ } = V;
  const id = new URLSearchParams(location.search).get('p');
  const lista = V.proyectos;
  let indice = lista.findIndex(p => p.id === id);
  if (indice < 0) indice = 0;                 // si el link está mal, muestra el primero
  const p = lista[indice];
  const raiz = $('.proyecto');

  /* ─── 1. TEXTOS Y COLORES ───────────────────────────────────── */
  document.title = `${p.titulo} · veruzh`;
  // el tema del proyecto (datos.js) cambia los colores de toda la página:
  // se elige la clase de tema de base.css que corresponde a su color de fondo
  const temas = { '#EFCADB': 'tema-rosa', '#BEDEE5': 'tema-celeste', '#C2BBCE': 'tema-lila',
                  '#C6A5B3': 'tema-malva', '#2B214A': 'tema-indigo', '#0C3D4E': 'tema-petroleo', '#921A45': 'tema-vino' };
  document.body.classList.add(temas[p.tema.fondo.toUpperCase()] || 'tema-rosa');
  document.body.style.setProperty('--acento', p.tema.acento);
  document.querySelector('meta[name="theme-color"]').content = p.tema.fondo;
  raiz.dataset.formato = p.videos[0].formato;

  const campos = {
    contador: `proyecto ${p.numero} / ${String(lista.length).padStart(2, '0')}`,
    titulo: p.titulo,
    'titulo-corto': p.titulo.toLowerCase(),
    cuenta: `proyecto ${indice + 1} de ${lista.length}`,
    subtitulo: p.subtitulo,
    cliente: p.cliente,
    anio: p.anio,
    disciplina: p.disciplina,
    rol: p.rol,
    formato: `${p.videos.length} ${p.videos.length > 1 ? 'videos' : 'video'} · ${p.videos[0].formato === 'horizontal' ? '16:9 horizontal' : '9:16 vertical'}`
  };
  // títulos largos (como "Psicojornadas") usan una letra un poco más chica
  if (p.titulo.length > 11) $('.proyecto__titulo').classList.add('largo');
  Object.entries(campos).forEach(([k, v]) => { const el = $(`[data-campo="${k}"]`); if (el) el.textContent = v; });
  $('[data-campo="texto"]').innerHTML = p.texto.map((t, i) => `<p class="revela" data-retraso="${i}">${t}</p>`).join('');

  /* ─── 2. REPRODUCTOR ─────────────────────────────────────────── */
  const rep = $('.reproductor'), video = $('video', rep);
  const avance = $('.reproductor__avance'), tiempo = $('.reproductor__tiempo');
  const btnPlay = $('.reproductor__play'), btnGrande = $('.reproductor__grande');
  const btnMute = $('.reproductor__mute'), btnCompleta = $('.reproductor__completa');
  let actual = 0;

  const mmss = s => isFinite(s) ? `${String(s / 60 | 0).padStart(2, '0')}:${String(s % 60 | 0).padStart(2, '0')}` : '00:00';

  function cargar(n, reproducir = false) {
    actual = (n + p.videos.length) % p.videos.length;
    const v = p.videos[actual];
    rep.dataset.formato = v.formato;
    video.poster = v.poster;
    video.src = v.archivo;
    video.muted = !V.sonido.activo;
    pintarSonido();
    $$('.clips button').forEach((b, i) => b.setAttribute('aria-selected', String(i === actual)));
    if (reproducir) video.play().catch(() => {});
  }
  function alternar() {
    if (video.paused) { video.play().catch(() => {}); } else video.pause();
  }
  function pintarSonido() {
    rep.classList.toggle('con-sonido', !video.muted);
    btnMute.setAttribute('aria-label', video.muted ? 'Activar sonido' : 'Silenciar');
  }

  video.addEventListener('play', () => { rep.classList.add('reproduciendo'); document.body.classList.add('cine'); btnPlay.setAttribute('aria-label', 'Pausar'); });
  video.addEventListener('pause', () => { rep.classList.remove('reproduciendo'); document.body.classList.remove('cine'); btnPlay.setAttribute('aria-label', 'Reproducir'); });
  video.addEventListener('ended', () => { if (p.videos.length > 1) cargar(actual + 1, true); });
  video.addEventListener('timeupdate', () => {
    const r = video.currentTime / (video.duration || 1);
    if (!avance.matches(':active')) avance.value = r * 1000;
    avance.style.setProperty('--avance', `${r * 100}%`);
    tiempo.textContent = `${mmss(video.currentTime)} / ${mmss(video.duration)}`;
  });
  video.addEventListener('loadedmetadata', () => { tiempo.textContent = `00:00 / ${mmss(video.duration)}`; });
  avance.addEventListener('input', () => {
    video.currentTime = avance.value / 1000 * (video.duration || 0);
    avance.style.setProperty('--avance', `${avance.value / 10}%`);
  });

  btnGrande.addEventListener('click', e => { e.stopPropagation(); V.sonido.clic(); alternar(); });
  btnPlay.addEventListener('click', e => { e.stopPropagation(); alternar(); });
  video.addEventListener('click', alternar);                    // tocar el video = play / pausa
  btnMute.addEventListener('click', e => {
    e.stopPropagation();
    video.muted = !video.muted;
    if (!video.muted && !V.sonido.activo) V.sonido.cambiar(true);   // enciende también el sonido general
    pintarSonido();
  });
  btnCompleta.addEventListener('click', e => {
    e.stopPropagation();
    const pedir = rep.requestFullscreen || rep.webkitRequestFullscreen;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (pedir) pedir.call(rep);
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();   // iPhone
  });
  // si cambias el sonido desde la cabecera, el video lo respeta
  document.addEventListener('veruzh:sonido', e => { video.muted = !e.detail; pintarSonido(); });

  // si el video sale de la pantalla mientras suena, se pausa (y se apaga el modo cine)
  V.observar(ents => { if (!ents[0].isIntersecting && !video.paused) video.pause(); }, { threshold: 0.25 }).observe(rep);

  // con mouse: la barra se esconde si no se mueve por 2 segundos
  let quieto;
  rep.addEventListener('pointermove', () => {
    rep.classList.remove('quieto'); clearTimeout(quieto);
    if (!V.esTactil) quieto = setTimeout(() => rep.classList.add('quieto'), 2000);
  });

  // teclado: espacio = play/pausa, flechas = cambiar de clip
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea') || document.body.classList.contains('menu-abierto')) return;
    if (e.code === 'Space') { e.preventDefault(); alternar(); }
    if (p.videos.length > 1 && e.key === 'ArrowRight') cargar(actual + 1, !video.paused);
    if (p.videos.length > 1 && e.key === 'ArrowLeft') cargar(actual - 1, !video.paused);
  });

  /* ─── 3. LISTA DE CLIPS ──────────────────────────────────────── */
  if (p.videos.length > 1) {
    $('.clips').innerHTML = p.videos.map((v, i) =>
      `<button type="button" role="tab" aria-selected="${i === 0}" data-clip="${i}" data-cursor="ver">
        <img src="${v.poster}" alt="" loading="lazy"><span>${v.titulo}</span></button>`).join('');
    $('.clips').addEventListener('click', e => {
      const b = e.target.closest('[data-clip]'); if (!b) return;
      V.sonido.tic();
      rep.animate([{ filter: 'brightness(2.2) contrast(1.4)', transform: 'translateX(6px)' }, { filter: 'none', transform: 'none' }], { duration: 260, easing: 'steps(3)' });
      cargar(+b.dataset.clip, true);
    });
  }
  cargar(0);

  /* ─── 4. RECORRIDO ──────────────────────────────────────────────
     Abajo se ven los 5 proyectos en fila: el actual dice "estás aquí"
     y los que ya abriste en esta visita dicen "visto ✓".
     Después va el siguiente proyecto, y en el ÚLTIMO, un panel final
     con botones para volver al inicio, al caso o a contacto.        */
  const vistos = new Set((V.leer('veruzh-vistos') || '').split(',').filter(Boolean));
  vistos.add(p.id);
  V.guardar('veruzh-vistos', [...vistos].join(','));

  const colores = q => `--fondo-p:${q.tema.fondo};--tinta-p:${q.tema.tinta}`;
  $('.recorrido__lista').innerHTML = lista.map((q, i) => `
    <li><a href="proyecto.html?p=${q.id}" style="${colores(q)}"
           class="${vistos.has(q.id) ? 'visto' : ''}" ${i === indice ? 'aria-current="page"' : ''} data-cursor="${q.titulo.toLowerCase()}">
      <img src="${q.videos[0].poster}" alt="" loading="lazy">
      <small>${q.numero}</small><b>${q.titulo}</b>
    </a></li>`).join('');
  // en celular, la tira se desliza sola hasta el proyecto actual
  const actualLi = $('.recorrido__lista [aria-current]');
  if (actualLi) { const tira = $('.recorrido__lista'); tira.scrollLeft = actualLi.parentElement.offsetLeft - 20; }

  const final = $('.recorrido__final');
  const anterior = indice > 0 ? lista[indice - 1] : null;
  const linkAnterior = anterior
    ? `<a class="recorrido__anterior" href="proyecto.html?p=${anterior.id}">${V.flecha(180)} anterior · ${anterior.titulo}</a>` : '';

  if (indice < lista.length - 1) {
    const sig = lista[indice + 1];
    final.innerHTML = `
      <a class="siguiente" href="proyecto.html?p=${sig.id}" style="${colores(sig)}" data-cursor="siguiente">
        <span>
          <span class="etiqueta">siguiente proyecto · ${sig.numero}</span>
          <span class="siguiente__titulo" data-scramble>${sig.titulo}</span>
          <span class="siguiente__accion">ver proyecto ${V.flecha()}</span>
        </span>
        <img class="siguiente__img" src="${sig.videos[0].poster}" alt="Cuadro de ${sig.titulo}" loading="lazy">
      </a>
      ${linkAnterior}`;
  } else {
    final.innerHTML = `
      <div class="fin">
        <img src="assets/img/logo/gato-rosa.png" alt="" width="76" height="72">
        <p class="fin__titulo">¡viste todos mis trabajos!</p>
        <p>Gracias por llegar hasta aquí. Puedes volver al inicio, leer cómo trabajo en el estudio de caso o escribirme.</p>
        <div class="fin__botones">
          <a class="boton boton--lleno" href="index.html">${V.flecha(180)} volver al inicio</a>
          <a class="boton" href="estudio-de-caso.html">leer el estudio de caso</a>
          <a class="boton" href="#contacto">contacto</a>
        </div>
      </div>
      ${linkAnterior}`;
  }
})();
