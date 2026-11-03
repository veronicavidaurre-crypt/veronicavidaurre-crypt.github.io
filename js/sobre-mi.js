/* ═══════════════════════════════════════════════════════════════
   VERUZH · PORTAFOLIO — sobre-mi.js  (sobre-mi.html)
     1. Oficios y listas de contacto (desde datos.js)
     2. Lámpara que sigue al mouse / dedo
     3. Objetos que abren notas
   ═══════════════════════════════════════════════════════════════ */
(() => {
  const { $, $$ } = V;
  const c = V.contacto;

  /* ─── 1. TEXTOS DESDE datos.js ────────────────────────────────── */
  $('[data-oficios]').textContent = c.oficio.join(', ').replace(/, ([^,]*)$/, ' y $1').replace(/^./, l => l.toUpperCase());
  const itemsContacto = `
    <li><a href="mailto:${c.correo}">${c.correo}</a></li>
    <li><a href="https://wa.me/${c.whatsapp}" target="_blank" rel="noopener">${c.telefono} (WhatsApp)</a></li>
    <li>${c.behance ? `<a href="${c.behance}" target="_blank" rel="noopener">Behance</a>` : 'Behance: próximamente'}</li>
    <li>${c.ciudad}</li>`;
  $$('[data-lista-contacto]').forEach(ul => ul.innerHTML = itemsContacto);
  $$('template').forEach(t => { const ul = t.content.querySelector('[data-lista-contacto]'); if (ul) ul.innerHTML = itemsContacto; });
  $('[data-correo]').href = `mailto:${c.correo}`;

  /* ─── 2. LÁMPARA ─────────────────────────────────────────────────
     Con mouse: la luz sigue al puntero. En táctil: la luz pasea sola
     por la mesa y salta al objeto que tocas.                         */
  const mesa = $('.escritorio');
  let lx = 50, ly = 45, objetivoX = 50, objetivoY = 45, ultimoMovimiento = 0;
  function apuntar(clientX, clientY) {
    const r = mesa.getBoundingClientRect();
    objetivoX = (clientX - r.left) / r.width * 100;
    objetivoY = (clientY - r.top) / r.height * 100;
    ultimoMovimiento = performance.now();
  }
  mesa.addEventListener('pointermove', e => apuntar(e.clientX, e.clientY));
  mesa.addEventListener('pointerdown', e => apuntar(e.clientX, e.clientY));
  (function animar(t) {
    // si nadie la mueve por 2,5 s, la lámpara pasea sola en un ocho
    if (t - ultimoMovimiento > 2500 && !V.menosMovimiento) {
      objetivoX = 50 + Math.sin(t / 2600) * 32;
      objetivoY = 48 + Math.sin(t / 1300) * 22;
    }
    lx += (objetivoX - lx) * 0.07; ly += (objetivoY - ly) * 0.07;
    mesa.style.setProperty('--lx', lx + '%'); mesa.style.setProperty('--ly', ly + '%');
    requestAnimationFrame(animar);
  })(0);

  /* ─── 3. NOTAS ────────────────────────────────────────────────── */
  const nota = $('.nota'), titulo = $('.nota__titulo'), cuerpo = $('.nota__cuerpo');
  let origen = null;
  function abrir(id, boton) {
    const t = $(`[data-nota-contenido="${id}"]`); if (!t) return;
    const copia = t.content.cloneNode(true);
    const h = copia.querySelector('h2');
    titulo.textContent = h ? h.textContent : '';
    if (h) h.remove();
    cuerpo.replaceChildren(copia);
    nota.hidden = false; origen = boton;
    document.documentElement.style.overflow = 'hidden';
    V.sonido.papel();
    V.scramble(titulo, { duracion: 400, paso: 30 });
    $('.nota__cerrar').focus();
  }
  function cerrar() {
    nota.hidden = true; document.documentElement.style.overflow = '';
    $$('.objeto.tocado').forEach(o => o.classList.remove('tocado'));
    if (origen) origen.focus();
  }
  $$('[data-nota]').forEach(b => b.addEventListener('click', () => {
    b.classList.add('tocado');
    const r = b.getBoundingClientRect(); apuntar(r.left + r.width / 2, r.top + r.height / 2);
    setTimeout(() => abrir(b.dataset.nota, b), V.esTactil ? 220 : 0);
  }));
  $('.nota__cerrar').addEventListener('click', cerrar);
  nota.addEventListener('click', e => { if (e.target === nota) cerrar(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !nota.hidden) cerrar(); });
})();
