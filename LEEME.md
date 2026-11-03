# veruzh · portafolio — guía para editarlo

## Cómo abrirlo

**Para verlo:** haz doble clic en `index.html`. Se abre en el navegador; no necesita internet ni servidor.

**Para editarlo en Visual Studio Code:**
1. Abre VS Code → `Archivo > Abrir carpeta…` → elige la carpeta `mi-portafolio`.
2. A la izquierda verás todos los archivos. Haz clic en uno para abrirlo.
3. Guarda con `Ctrl + S` y recarga el navegador (`F5`) para ver el cambio.
4. (Opcional) Instala la extensión **Live Server** (pestaña de extensiones, el ícono de cuadritos). Después, clic derecho sobre `index.html` → **Open with Live Server**: la página se recarga sola cada vez que guardas.

## Qué hay en cada carpeta

```
mi-portafolio/
├─ index.html            inicio: intro, hero, reel, trabajos, adelantos
├─ proyecto.html         UNA página para los 5 proyectos (proyecto.html?p=illich)
├─ estudio-de-caso.html  caso 1 · Balas perdidas (todo el texto del caso está aquí)
├─ estudio-de-caso-2.html caso 2 · Reka, kit de stream
├─ sobre-mi.html         el escritorio + "todo en un vistazo"
├─ css/
│  ├─ base.css           paleta y temas de color, tipografías, menú, pie (todas las páginas)
│  ├─ inicio.css · proyecto.css · sobre-mi.css
│  ├─ caso.css           estilos de los dos estudios de caso
│  ├─ caso2.css          lo propio del caso Reka (simulador, alertas, cuarto)
├─ js/
│  ├─ datos.js           ★ TUS TEXTOS: contacto y proyectos
│  ├─ comun.js           menú, transición del gato, sonido, scramble, pincel, créditos
│  ├─ inicio.js · proyecto.js · caso.js · caso2.js · sobre-mi.js
│  └─ vendor/            GSAP (librería de animación, no se toca)
├─ fonts/                Getai (títulos) y Switzer (textos)
└─ assets/
   ├─ img/               logo, caso, extras, posters de los videos
   └─ video/             videos completos y previews cortos (-preview.mp4)
```

## Cambiar textos

**Contacto y proyectos → `js/datos.js`.** Es el único archivo donde hay que tocar para:
- tu correo, teléfono, ciudad;
- el link de Behance (`behance: 'https://www.behance.net/veruzh'`);
- el título, cliente, año, rol y párrafos de cada proyecto (`texto: [ '...', '...' ]`, cada párrafo entre comillas y separado por coma).

Reglas para no romperlo: cada texto va entre comillas simples `'...'`, no borres las comas del final de cada línea, y si un texto lleva apóstrofo escríbelo `\'`.

**Estudio de caso → `estudio-de-caso.html`.** El texto está escrito directo en el HTML: busca la frase con `Ctrl + F` y cámbiala. Las tarjetas de SCAMPER y las ideas del mapa mental están en `js/caso.js` (busca `const scamper` y `const nodos`).
La ficha técnica (Proyecto, Contexto, **Año**, Disciplina, Herramientas, Mi rol) está al principio del archivo, dentro de `<dl class="contenedor ficha-caso">`.

**Estudio de caso 2 (Reka) → `estudio-de-caso-2.html`.** Igual que el caso 1, el texto está en el HTML. Los mensajes del simulador del stream (quién da bits, qué escribe en el chat) están en `js/caso2.js`, busca `const ALERTAS`. Las imágenes del kit están en `assets/img/reka/` y los videos sin fondo azul en `assets/video/reka-*.mp4`.

**Sobre mí → `sobre-mi.html`.** Las notas que abren los objetos están en los bloques `<template data-nota-contenido="...">`.

## Cambiar imágenes

Lo más fácil: **reemplaza el archivo por otro con el mismo nombre** dentro de `assets/img/...`. Si usas otro nombre, cambia la ruta donde aparece (en `datos.js` para los posters de los proyectos, o en el HTML).

Consejo: usa imágenes de menos de 1600 px de ancho y guardadas en JPG o WebP para que la web cargue rápido.

## Agregar o cambiar un video

1. Copia el video a `assets/video/`.
2. En `js/datos.js`, dentro de `videos: [ ... ]` del proyecto, agrega una línea como las otras:
   ```js
   { archivo: 'assets/video/mi-video.mp4', preview: 'assets/video/mi-video.mp4',
     poster: 'assets/img/posters/mi-video.jpg', titulo: 'Nombre', formato: 'vertical' },
   ```
   `formato` es `'vertical'` (9:16) u `'horizontal'` (16:9). El `preview` es el clip corto y mudo que suena en la tarjeta; puede ser el mismo video.

## Cambiar colores

La web usa **solo los 12 colores de tu paleta** (sin negro). Están en `css/base.css`, al inicio, en `:root` (`--rojo`, `--vino`, `--indigo`, `--petroleo`, `--coral`, `--malva`, `--lavanda`, `--salvia`, `--arena`, `--rosa`, `--lila`, `--celeste`). Si cambias un código ahí, cambia en toda la web.

**Temas por sección.** Cada sección lleva una clase que decide su fondo y su texto, con contrastes ya revisados para que se lea bien:

| clase | fondo | texto |
|---|---|---|
| `tema-rosa` | rosa | índigo |
| `tema-celeste` | celeste | petróleo |
| `tema-lila` | lila | índigo |
| `tema-malva` | malva | índigo |
| `tema-indigo` | índigo | rosa |
| `tema-petroleo` | petróleo | celeste |
| `tema-vino` | vino | rosa |

Para cambiar el color de una sección, cambia su clase en el HTML (por ejemplo `<section class="reel tema-petroleo">` → `tema-vino`).

**Cada proyecto:** en `js/datos.js`, el campo `tema: { fondo, tinta, acento }`. Usa siempre una de las combinaciones de la tabla para `fondo` y `tinta`.

**Estudio de caso:** usa los mismos temas. La paleta del disco (morado, ciruela, durazno…) solo aparece como contenido, en la parte "pruebas de color".

## Mover los objetos del escritorio (Sobre mí)

En `css/sobre-mi.css`, cada objeto tiene `--x` y `--y` (posición), `--w` (tamaño) y `--r` (giro). Hay un juego de números para computadora y otro para celular (debajo de `@media (max-width: 700px)`).

## Bueno saber

- La tipografía **Getai no trae tildes ni ñ**. En los títulos con acento (por ejemplo "sobre mí"), esa letra se dibuja con Switzer. Si cambias un título, prefiere palabras sin tilde o revisa cómo queda.
- El nombre grande **veruzh** del inicio se dibuja en un `<canvas>` (en `js/inicio.js`, parte 2). El código mide la palabra y calcula el tamaño para que siempre quede en **una sola línea**, en cualquier pantalla.
- Abajo de cada proyecto están los 5 trabajos en fila ("estás aquí", "visto ✓"). En el último aparece un panel con **volver al inicio**, así nadie queda dando vueltas.
- Los efectos del mouse tienen su versión táctil: en celular las tarjetas se reproducen solas al quedar en el centro, el pincel se usa deslizando el dedo, el bloc de bocetos se pasa deslizando de lado y la lámpara del escritorio pasea sola.
- El botón **sonido** (arriba a la derecha) prende los sonidos de la interfaz y el audio de los videos.
- Si alguien tiene activado "reducir movimiento" en su sistema, la web apaga las animaciones más fuertes.
- **Para entregarlo o publicarlo:** comprime la carpeta `mi-portafolio` completa en un .zip. Para tener un link, puedes arrastrar la carpeta a [Netlify Drop](https://app.netlify.com/drop) o subirla a GitHub Pages.
