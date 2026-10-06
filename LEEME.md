# Web de Print! Gráfica

## Qué subir a Hostinger
Subí **todo el contenido de la carpeta `web/`** a `public_html`, incluido el archivo oculto `.htaccess`.
La carpeta `material-instagram/` NO se sube: tiene las fotos originales y los datos que bajamos de Instagram.

## Cambios rápidos (en `web/main.js`, arriba de todo)
- **WhatsApp**: `var WHATSAPP = "+54 9 264 527-4654";` Se actualizan todos los botones, el contacto y los datos para Google.
- **Precios**: `var PRECIOS = { };` Mientras esté vacío, el cotizador muestra solo m² o cantidades. Para activar un precio:
  ```js
  var PRECIOS = {
    mural: 35000,     // por m²
    stickers: 18000,  // por plancha de 55 x 55 cm
  };
  ```
  Claves posibles: `mural` y `vidriera` (por m²), `guarda` (por metro), `troquelado` (por kit), `stickers` (por plancha).
  Los precios de julio están **a confirmar** antes de cargarlos.

## Dominio
La web asume `https://www.printvinilos.com.ar/`. Si el dominio es otro, reemplazalo en:
`web/index.html` (canonical y las líneas `og:`), `web/main.js` (`SITIO`), `web/sitemap.xml` y `web/robots.txt`.

## Después de cada cambio
En `web/index.html`, cambiá el `?v=20261005` de `styles.css` y `main.js` por la fecha del día. Así los celulares descargan la versión nueva y no usan la que tenían guardada.

## Agregar un diseño al catálogo
En `web/index.html`, copiá un bloque `<li class="card" ...>` del catálogo y cambiá la foto, el código, el nombre y el link.
`data-cat` puede ser `infantiles`, `decorativos`, `guardas` o `troquelados`.
Las fotos van en `web/assets/img/catalogo/`, en formato WebP de 720 x 540.
