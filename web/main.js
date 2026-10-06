/* ==========================================================================
   Print! Gráfica — main.js
   Sin frameworks ni módulos. Todo dentro de una IIFE.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     CONFIGURACIÓN — lo único que hace falta tocar para cambiar datos
     ------------------------------------------------------------------------ */

  // Número de WhatsApp. Cambiándolo acá se actualiza en TODA la web.
  var WHATSAPP = "+54 9 264 527-4654";

  // Precios. Vacío = el cotizador muestra solo los m² (o la cantidad).
  // Si cargás un precio, se muestra el precio exacto de ese tipo de trabajo.
  //   mural, vidriera  -> precio por m²
  //   guarda           -> precio por metro lineal
  //   troquelado       -> precio por kit
  //   stickers         -> precio por plancha de 55 x 55 cm
  // Precios de julio, A CONFIRMAR con Print! antes de activarlos:
  //   mural: 35000,      // papel mural, por m²
  //   stickers: 18000,   // por plancha 55 x 55 cm
  var PRECIOS = {
  };

  var INSTAGRAM = "https://www.instagram.com/print.tiendagrafica/";
  var SITIO = "https://www.printvinilos.com.ar/";

  /* ------------------------------------------------------------------------ */

  var TIPOS = {
    mural:      { label: "Mural para casa",        modo: "m2" },
    vidriera:   { label: "Vidriera para comercio", modo: "m2" },
    guarda:     { label: "Guarda",                 modo: "lineal" },
    troquelado: { label: "Vinilo troquelado",      modo: "unidad", singular: "kit", plural: "kits" },
    stickers:   { label: "Planchas de stickers (55 x 55 cm)", modo: "unidad", singular: "plancha", plural: "planchas" }
  };

  var waDigits = WHATSAPP.replace(/\D/g, "");

  function waUrl(text) {
    return "https://wa.me/" + waDigits + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  function safe(fn, name) {
    try { fn(); } catch (err) { if (window.console) console.warn("[print] " + name + " falló:", err); }
  }

  var fmtNum = function (n, dec) {
    return n.toLocaleString("es-AR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };
  var fmtPeso = function (n) {
    return "$ " + Math.round(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });
  };

  /* ---------- WhatsApp: todos los links salen de la constante ---------- */
  function initWhatsApp() {
    var links = document.querySelectorAll("[data-wa]");
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      a.href = waUrl(a.getAttribute("data-wa-text") || "");
      a.target = "_blank";
      a.rel = "noopener";
    }
    var shows = document.querySelectorAll("[data-wa-display]");
    for (var j = 0; j < shows.length; j++) shows[j].textContent = WHATSAPP;
  }

  /* ---------- Datos estructurados (SEO local) ---------- */
  function initSchema() {
    if (document.getElementById("schema-localbusiness")) return;
    var data = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": SITIO + "#negocio",
      "name": "Print! Gráfica",
      "alternateName": "Print! Tienda Gráfica",
      "slogan": "Donde tus ideas cobran vida",
      "description": "Diseño, impresión y colocación de murales y vinilos decorativos para casas y vidrieras de comercios en San Juan.",
      "url": SITIO,
      "image": SITIO + "assets/img/og-print.jpg",
      "logo": SITIO + "assets/img/apple-touch-icon.png",
      "telephone": "+" + waDigits,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "San Juan",
        "addressRegion": "San Juan",
        "addressCountry": "AR"
      },
      "areaServed": { "@type": "AdministrativeArea", "name": "San Juan, Argentina" },
      "sameAs": [INSTAGRAM],
      "makesOffer": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Murales de vinilo para casas, con colocación" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Vinilos para vidrieras de comercios" } }
      ]
    };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = "schema-localbusiness";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ---------- Header y menú ---------- */
  function initHeader() {
    var header = document.querySelector(".site-header");
    var ctas = document.querySelector(".hero-ctas");
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      var limit = ctas ? ctas.getBoundingClientRect().bottom + window.scrollY : 400;
      document.body.classList.toggle("show-wa", window.scrollY > limit - 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var btn = document.querySelector(".menu-toggle");
    var nav = document.getElementById("menu");
    function setOpen(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
    }
    btn.addEventListener("click", function () {
      setOpen(btn.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); btn.focus(); }
    });
    window.matchMedia("(min-width: 1000px)").addEventListener("change", function (m) { if (m.matches) setOpen(false); });
  }

  /* ---------- Modo claro / oscuro ---------- */
  function initTheme() {
    var btn = document.querySelector(".theme-toggle");
    var root = document.documentElement;
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    function current() {
      var t = root.getAttribute("data-theme");
      return t ? t : (mq.matches ? "dark" : "light");
    }
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("print-theme", next); } catch (e) {}
    });
  }

  /* ---------- Catálogo: filtros ---------- */
  function initFilters() {
    var buttons = document.querySelectorAll(".filter");
    var cards = document.querySelectorAll(".card");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        var f = this.getAttribute("data-filter");
        for (var b = 0; b < buttons.length; b++) {
          var on = buttons[b] === this;
          buttons[b].classList.toggle("is-active", on);
          buttons[b].setAttribute("aria-pressed", on ? "true" : "false");
        }
        for (var c = 0; c < cards.length; c++) {
          cards[c].hidden = !(f === "todos" || cards[c].getAttribute("data-cat") === f);
        }
      });
    }
  }

  /* ---------- Cotizador ---------- */
  var quote = {};

  function parseMedida(raw) {
    if (!raw) return null;
    var v = parseFloat(String(raw).trim().replace(/\s/g, "").replace(",", "."));
    return isFinite(v) && v > 0 ? v : null;
  }

  function initQuote() {
    var form = document.getElementById("quote-form");
    if (!form) return;
    quote = {
      form: form,
      ancho: document.getElementById("q-ancho"),
      alto: document.getElementById("q-alto"),
      cant: document.getElementById("q-cant"),
      diseno: document.getElementById("q-diseno"),
      hint: document.getElementById("q-hint"),
      rowMedidas: form.querySelector('[data-modo="medidas"]'),
      rowUnidad: form.querySelector('[data-modo="unidad"]'),
      altoField: form.querySelector('[data-solo="m2"]'),
      lAncho: document.getElementById("l-ancho"),
      lCant: document.getElementById("l-cant"),
      rLabel: document.getElementById("r-label"),
      rValue: document.getElementById("r-value"),
      rPrice: document.getElementById("r-price"),
      rSub: document.getElementById("r-sub")
    };

    // Sugerencias de diseño a partir del catálogo
    var dl = document.getElementById("disenos");
    if (dl && !dl.children.length) {
      var items = document.querySelectorAll("[data-cotizar]");
      for (var i = 0; i < items.length; i++) {
        var o = document.createElement("option");
        o.value = items[i].getAttribute("data-diseno");
        dl.appendChild(o);
      }
    }

    form.addEventListener("input", renderQuote);
    form.addEventListener("change", renderQuote);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var r = calcQuote();
      if (r.falta) {
        quote.hint.textContent = r.falta;
        quote.hint.classList.add("is-warn");
        (r.focus || quote.ancho).focus();
        return;
      }
      window.open(waUrl(buildMessage(r)), "_blank", "noopener");
    });
    renderQuote();
  }

  function tipoActual() {
    var checked = quote.form.querySelector('input[name="tipo"]:checked');
    return checked ? checked.value : "mural";
  }

  // Si ponen más de 20, lo tomamos como centímetros
  function normalizar(v) {
    if (v === null) return { m: null, cm: false };
    if (v > 20) return { m: v / 100, cm: true, raw: v };
    return { m: v, cm: false };
  }

  function calcQuote() {
    var tipo = tipoActual();
    var cfg = TIPOS[tipo];
    var precio = PRECIOS[tipo];
    var tienePrecio = typeof precio === "number" && precio > 0;
    var r = { tipo: tipo, cfg: cfg, avisos: [], precio: null };

    if (cfg.modo === "unidad") {
      var n = parseInt(quote.cant.value, 10);
      if (!(n > 0)) { r.falta = "Indicá cuántas " + cfg.plural + " necesitás."; r.focus = quote.cant; return r; }
      r.cantidad = n;
      if (tienePrecio) r.precio = n * precio;
      return r;
    }

    var a = normalizar(parseMedida(quote.ancho.value));
    if (a.cm) r.avisos.push("Tomamos " + fmtNum(a.raw, 0) + " como centímetros: " + fmtNum(a.m, 2) + " m.");
    if (cfg.modo === "lineal") {
      if (a.m === null) { r.falta = "Cargá el largo de la pared."; r.focus = quote.ancho; return r; }
      r.largo = a.m;
      if (tienePrecio) r.precio = a.m * precio;
      return r;
    }

    var h = normalizar(parseMedida(quote.alto.value));
    if (h.cm) r.avisos.push("Tomamos " + fmtNum(h.raw, 0) + " como centímetros: " + fmtNum(h.m, 2) + " m.");
    if (a.m === null || h.m === null) {
      r.falta = "Cargá el ancho y el alto para calcularla.";
      r.focus = a.m === null ? quote.ancho : quote.alto;
      return r;
    }
    r.ancho = a.m; r.alto = h.m;
    r.m2 = Math.round(a.m * h.m * 100) / 100;
    if (tienePrecio) r.precio = r.m2 * precio;
    return r;
  }

  function renderQuote() {
    var tipo = tipoActual();
    var cfg = TIPOS[tipo];

    // Mostrar los campos que corresponden al tipo
    var unidad = cfg.modo === "unidad";
    quote.rowMedidas.hidden = unidad;
    quote.rowUnidad.hidden = !unidad;
    quote.altoField.hidden = cfg.modo !== "m2";
    quote.rowMedidas.classList.toggle("is-lineal", cfg.modo === "lineal");
    quote.lAncho.innerHTML = (cfg.modo === "lineal" ? "Largo" : "Ancho") + " <small>(m)</small>";
    if (unidad) quote.lCant.textContent = "Cantidad de " + cfg.plural;

    var r = calcQuote();
    quote.hint.classList.remove("is-warn");
    quote.hint.textContent = r.avisos.join(" ");
    if (r.avisos.length) quote.hint.classList.add("is-warn");

    quote.rPrice.hidden = true;
    if (cfg.modo === "unidad") {
      quote.rLabel.textContent = "Cantidad";
      quote.rValue.textContent = r.cantidad ? r.cantidad + " " + (r.cantidad === 1 ? cfg.singular : cfg.plural) : "—";
      quote.rSub.textContent = tipo === "stickers" ? "Cada plancha mide 55 x 55 cm." : "Cada kit viene impreso y troquelado, listo para pegar.";
    } else if (cfg.modo === "lineal") {
      quote.rLabel.textContent = "Largo";
      quote.rValue.textContent = r.largo ? fmtNum(r.largo, 2) + " m" : "— m";
      quote.rSub.textContent = r.largo ? "Metros lineales de guarda." : "Cargá el largo de la pared.";
    } else {
      quote.rLabel.textContent = "Superficie";
      quote.rValue.textContent = r.m2 ? fmtNum(r.m2, 2) + " m²" : "— m²";
      quote.rSub.textContent = r.m2
        ? fmtNum(r.ancho, 2) + " m de ancho × " + fmtNum(r.alto, 2) + " m de alto."
        : "Cargá el ancho y el alto para calcularla.";
    }
    if (r.precio !== null && !r.falta) {
      quote.rPrice.hidden = false;
      quote.rPrice.textContent = "Precio: " + fmtPeso(r.precio);
    }
  }

  function buildMessage(r) {
    var lines = ["¡Hola Print! Quiero cotizar:", "• Trabajo: " + r.cfg.label];
    if (r.cfg.modo === "m2") {
      lines.push("• Medidas: " + fmtNum(r.ancho, 2) + " m de ancho × " + fmtNum(r.alto, 2) + " m de alto (" + fmtNum(r.m2, 2) + " m²)");
    } else if (r.cfg.modo === "lineal") {
      lines.push("• Largo: " + fmtNum(r.largo, 2) + " m");
    } else {
      lines.push("• Cantidad: " + r.cantidad + " " + (r.cantidad === 1 ? r.cfg.singular : r.cfg.plural));
    }
    var d = quote.diseno.value.trim();
    lines.push("• Diseño: " + (d || "todavía no elegí, quiero ver opciones"));
    if (r.precio !== null) lines.push("• Precio que vi en la web: " + fmtPeso(r.precio));
    lines.push("", "¿Me pasan la cotización? ¡Gracias!");
    return lines.join("\n");
  }

  /* ---------- "Cotizar este" y botones con tipo precargado ---------- */
  function initPrefill() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-cotizar], a[data-tipo]");
      if (!el || !quote.form) return;
      var tipo = el.getAttribute("data-tipo");
      var radio = tipo && quote.form.querySelector('input[name="tipo"][value="' + tipo + '"]');
      if (radio) radio.checked = true;
      if (el.hasAttribute("data-diseno")) quote.diseno.value = el.getAttribute("data-diseno");
      renderQuote();
      // el link #cotizar hace el scroll; después llevamos el foco al primer campo vacío
      if (!window.matchMedia("(pointer: fine)").matches) return;
      setTimeout(function () {
        var target = TIPOS[tipo] && TIPOS[tipo].modo === "unidad" ? quote.cant : quote.ancho;
        try { target.focus({ preventScroll: true }); } catch (err) { target.focus(); }
      }, 650);
    });
  }

  function boot() {
    safe(initWhatsApp, "whatsapp");
    safe(initSchema, "schema");
    safe(initHeader, "header");
    safe(initTheme, "theme");
    safe(initFilters, "filtros");
    safe(initQuote, "cotizador");
    safe(initPrefill, "prefill");
    safe(function () { document.getElementById("year").textContent = new Date().getFullYear(); }, "year");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
