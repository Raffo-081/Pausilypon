(function () {
  'use strict';

  var ZONE = window.PAUSILYPON_ZONE || [];
  var CARDS = window.PAUSILYPON_CARTOLINE || [];

  // Un'area diventa visibile quando sullo schermo è larga almeno così (in pixel); prima è un marcatore.
  var SOGLIA_AREA = 90;

  var GLYPH = {
    vulcano:  '<path d="M3 20 L10 8 H14 L21 20 Z"/><path d="M12 6 q-2 -2 0 -4"/>',
    onda:     '<path d="M2 15 q3 -4 6 0 t6 0 t6 0"/><circle cx="16" cy="7" r="2.5"/>',
    montagna: '<path d="M2 20 L9 8 L13 14 L16 10 L22 20 Z"/><circle cx="18" cy="5" r="1.8"/>',
    pesce:    '<path d="M3 12 q6 -6 12 0 q-6 6 -12 0 Z"/><path d="M15 12 l5 -4 v8 Z"/>',
    casa:     '<path d="M5 17 V10 L12 5 L19 10 V17 Z"/><path d="M7 17 V21 M17 17 V21 M10 17 V12 H14 V17"/>',
    aurora:   '<path d="M3 8 q4 -5 8 0 t10 -2"/><path d="M3 12 q4 -5 8 0 t10 -2"/><path d="M2 21 L8 16 L12 19 L16 15 L22 21"/>',
    barca:    '<path d="M3 16 H21 L18 20 H6 Z"/><path d="M12 16 V4 L18 13 H12"/>',
    sole:     '<circle cx="12" cy="12" r="4"/><path d="M12 3 V5 M12 19 V21 M3 12 H5 M19 12 H21 M5.6 5.6 L7 7 M17 17 L18.4 18.4 M5.6 18.4 L7 17 M17 7 L18.4 5.6"/>',
    faraglioni: '<path d="M4 18 L7 7 Q9 4.5 10.5 8 L12.5 18 Z"/><path d="M14 18 L15.5 11.5 Q17 9.5 18.5 12 L20 18 Z"/><path d="M2 21.5 q3 -3 6 0 t6 0 t6 0"/>',
    limone:   '<ellipse cx="11.5" cy="13.5" rx="7" ry="5.3" transform="rotate(-30 11.5 13.5)"/><path d="M17.6 10 l2 -1.4 M5.4 17 l-1.8 1.3"/><path d="M13.5 5.5 q3 -3.5 6.5 -1.5 q-2.5 3.5 -6.5 1.5 Z"/>',
    orca:     '<path d="M2 17 Q8 11 15 13 Q20 14.5 22 17"/><path d="M9.5 12.3 Q10.5 5 15 3.5 Q14 9 15.5 13.2"/><path d="M17.5 15 l1.6 .5"/><path d="M2 21 q3 -2.5 6 0 t6 0 t6 0"/>',
    arco:     '<path d="M4 20 V12 a3 3 0 0 1 6 0 V20 M14 20 V12 a3 3 0 0 1 6 0 V20 M2 20 H22"/>'
  };
  var ICON = {
    sole: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">' + GLYPH.sole + '</svg>',
    luna: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5 A8 8 0 1 1 9.5 4 A6.5 6.5 0 0 0 20 14.5 Z"/></svg>'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function quante(n) { return n + (n === 1 ? ' cartolina' : ' cartoline'); }
  var fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Foto segnaposto (disegni, usati quando la colonna "foto" è vuota) ----------
  var PAL = [
    { sky: ['#BFD9E8', '#EAF3F8'], sun: '#FFFFFF', h1: '#5C8CA8', h2: '#2F5775' },
    { sky: ['#F2B8A0', '#F7E3CF'], sun: '#FFF4E0', h1: '#6C5B7B', h2: '#3C3552' },
    { sky: ['#F5D58B', '#FBEBC4'], sun: '#FFFFFF', h1: '#B58A4A', h2: '#7D5A2A' },
    { sky: ['#C9CFD6', '#EEF0F3'], sun: '#FFFFFF', h1: '#8A94A0', h2: '#586270' },
    { sky: ['#CFE3D0', '#EEF6EA'], sun: '#FFFFFF', h1: '#6F9A74', h2: '#3D6A4B' },
    { sky: ['#2B3A67', '#6D7BA6'], sun: '#F2F2E6', h1: '#1D2540', h2: '#10162B' },
    { sky: ['#D8D2C6', '#F0ECE4'], sun: '#FFFFFF', h1: '#A39B8B', h2: '#6E675B' }
  ];
  function art(i) {
    var p = PAL[i % PAL.length], sx = 20 + (i * 37) % 60;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.sky[0] + '"/><stop offset="1" stop-color="' + p.sky[1] + '"/></linearGradient></defs>' +
      '<rect width="600" height="400" fill="url(#g)"/>' +
      '<circle cx="' + (sx * 6) + '" cy="140" r="38" fill="' + p.sun + '" opacity=".9"/>' +
      '<path d="M0 290 Q120 215 250 270 T470 250 T600 275 V400 H0Z" fill="' + p.h1 + '"/>' +
      '<path d="M0 335 Q160 290 300 330 T600 320 V400 H0Z" fill="' + p.h2 + '"/></svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }
  CARDS.forEach(function (c, i) {
    c.id = i;
    c.img = c.foto ? 'foto-web/' + encodeURIComponent(c.foto) : art(i);
    c.thumb = c.foto ? 'foto-web/piccole/' + encodeURIComponent(c.foto) : c.img;
  });
  function zona(id) { return ZONE.filter(function (z) { return z.id === id; })[0]; }
  function cardsOf(id) { return CARDS.filter(function (c) { return c.area === id; }); }

  // ---------- Mappa ----------
  // Arrotonda un contorno disegnato a mano (ogni passaggio taglia gli angoli).
  function arrotonda(ring, passaggi) {
    for (var k = 0; k < passaggi; k++) {
      var out = [];
      for (var i = 0; i < ring.length; i++) {
        var a = ring[i], b = ring[(i + 1) % ring.length];
        out.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25]);
        out.push([a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]);
      }
      ring = out;
    }
    return ring;
  }
  function ll(p) { return [p[1], p[0]]; }   // i dati sono [lon, lat], Leaflet vuole [lat, lon]

  var map = L.map('map', { zoomSnap: 0.5, minZoom: 2, worldCopyJump: true });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  var tutto = L.latLngBounds([]);
  ZONE.forEach(function (z) {
    var n = cardsOf(z.id).length;
    z.marker = L.marker(ll(z.centro), {
      icon: L.divIcon({
        className: '', iconSize: [44, 44], iconAnchor: [22, 22],
        html: '<div class="pin"><span>' + esc(z.nome) + '<small>' + n + '</small></span></div>'
      }),
      title: z.nome + ', ' + quante(n), alt: z.nome
    }).on('click', function () { selectZona(z.id); });

    if (z.tipo !== 'punto' && z.forma) {
      var rings = z.forma.map(function (r) {
        return (z.tipo === 'disegnata' ? arrotonda(r, 3) : r).map(ll);
      });
      z.area = L.polygon(rings.map(function (r) { return [r]; }), {
        className: 'zona-area' + (z.tipo === 'disegnata' ? ' disegnata' : '')
      }).on('click', function () { selectZona(z.id); });
      z.bounds = z.area.getBounds();
      tutto.extend(z.bounds);
    } else {
      tutto.extend(ll(z.centro));
    }
  });

  // Zoom a livelli: da lontano il marcatore, da vicino l'area.
  function aggiornaLivelli() {
    ZONE.forEach(function (z) {
      var vicino = false;
      if (z.area) {
        var a = map.latLngToLayerPoint(z.bounds.getNorthWest()), b = map.latLngToLayerPoint(z.bounds.getSouthEast());
        vicino = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)) >= SOGLIA_AREA;
      }
      if (z.area) { if (vicino) z.area.addTo(map); else z.area.remove(); }
      if (vicino) z.marker.remove(); else z.marker.addTo(map);
    });
    segnaScelta();
  }
  function segnaScelta() {
    ZONE.forEach(function (z) {
      var scelta = z.id === state.zona, el;
      if (z.area && (el = z.area.getElement())) el.classList.toggle('scelta', scelta);
      if ((el = z.marker.getElement()) && (el = el.querySelector('.pin'))) el.classList.toggle('scelta', scelta);
    });
  }
  function vistaIntera() { map.fitBounds(tutto, { padding: [48, 48], animate: !fermo }); }

  // ---------- Viste ----------
  var state = { view: 'map', zona: null };
  var ctx = [];      // elenco delle cartoline in cui si naviga
  var pos = 0;

  function thumb(c, showWhere) {
    return '<button type="button" class="thumb" data-card="' + c.id + '"><img src="' + c.thumb + '" alt="" loading="lazy">' +
      '<span class="cap">' + esc(c.titolo) + '</span>' +
      '<span class="where">' + esc(showWhere ? c.luogo + ', ' + c.data : c.luogo) + '</span></button>';
  }
  function renderPanel() {
    var el = document.getElementById('panel');
    if (!state.zona) {
      el.innerHTML = '<h2>Scegli una zona</h2><p class="sub">' + ZONE.length + ' zone, ' + quante(CARDS.length) + '</p>' +
        '<ul class="levels">' + ZONE.map(function (z) {
          return '<li><button type="button" data-zona="' + esc(z.id) + '"><span><span class="n">' + esc(z.nome) + '</span>' +
            '<span class="d">' + esc(z.dove) + '</span></span><span class="c">' + quante(cardsOf(z.id).length) + '</span></button></li>';
        }).join('') + '</ul>';
      return;
    }
    var z = zona(state.zona), list = cardsOf(z.id);
    el.innerHTML = '<button type="button" class="back-link" data-zona="">&#8249; Tutte le zone</button>' +
      '<h2>' + esc(z.nome) + '</h2><p class="sub">' + esc(z.dove) + ' &middot; ' + quante(list.length) + '</p>' +
      (list.length
        ? '<button type="button" class="mazzetto" data-card="' + list[0].id + '" aria-label="Sfoglia le cartoline di ' + esc(z.nome) + '">' +
          list.slice(0, 3).map(function (c, i) { return '<img class="m' + i + '" src="' + c.thumb + '" alt="">'; }).reverse().join('') +
          '</button><p class="mazzetto-cap">' + esc(list[0].titolo) + '<span>Clicca per sfogliare</span></p>'
        : '<p class="empty">Ancora nessuna cartolina da qui.</p>');
  }
  // La griglia mostra le cartoline in ordine casuale, diverso a ogni apertura della pagina.
  var GRIGLIA = CARDS.slice();
  for (var gi = GRIGLIA.length - 1; gi > 0; gi--) {
    var gj = Math.floor(Math.random() * (gi + 1)), gt = GRIGLIA[gi];
    GRIGLIA[gi] = GRIGLIA[gj]; GRIGLIA[gj] = gt;
  }
  function renderGrid() {
    document.getElementById('v-grid').innerHTML = GRIGLIA.map(function (c) { return thumb(c, true); }).join('');
  }
  function renderList() {
    document.getElementById('v-list').innerHTML = CARDS.map(function (c) {
      return '<button type="button" class="row" data-card="' + c.id + '"><img src="' + c.thumb + '" alt="" loading="lazy">' +
        '<span><span class="t">' + esc(c.titolo) + '</span><span class="m">' + esc(c.testo) + '</span></span>' +
        '<span class="w">' + esc(c.luogo + ', ' + c.data) + '</span></button>';
    }).join('');
  }
  function setView(v) {
    state.view = v;
    ['map', 'grid', 'list'].forEach(function (k) { document.getElementById('v-' + k).hidden = (k !== v); });
    document.querySelectorAll('.switch button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === v)); });
    if (v === 'map') map.invalidateSize();
  }
  function selectZona(id) {
    state.zona = id || null;
    renderPanel();
    segnaScelta();
    if (!state.zona) { vistaIntera(); return; }
    var z = zona(id);
    if (z.area) map.flyToBounds(z.bounds, { padding: [48, 48], maxZoom: 12, animate: !fermo, duration: 1.1 });
    else map.flyTo(ll(z.centro), 11, { animate: !fermo, duration: 1.1 });
  }

  // ---------- Cartolina ----------
  var modal = document.getElementById('modal'), cardEl = document.getElementById('card');
  var lastFocus = null;
  function stampHtml(c) {
    return '<div class="stamp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (GLYPH[c.sticker] || GLYPH.sole) + '</svg><span>' + esc(c.luogo) + '</span></div>';
  }
  // le cartolina che si intravedono sotto quella in primo piano
  function sotto(el, k) {
    el.hidden = ctx.length <= k;
    el.innerHTML = el.hidden ? '' : '<img src="' + ctx[(pos + k) % ctx.length].img + '" alt="">';
  }
  function showCard() {
    var c = ctx[pos];
    cardEl.classList.remove('flipped');
    cardEl.innerHTML = '<div class="inner">' +
      '<div class="face front"><img src="' + c.img + '" alt="' + esc(c.titolo) + '"></div>' +
      '<div class="face back"><span class="mark"><svg class="logo" aria-hidden="true"><use href="#logo"/></svg>Pausilypon</span><p class="msg">' + esc(c.testo) + '</p><div class="lines"><i></i><i></i><i></i></div>' +
      '<span class="meta">' + esc(c.luogo + ', ' + c.data) + '</span>' + stampHtml(c) + '</div></div>';
    document.getElementById('cap-title').textContent = c.titolo === c.luogo ? c.titolo : c.titolo + ' — ' + c.luogo;
    document.getElementById('prev').disabled = document.getElementById('next').disabled = ctx.length < 2;
    sotto(document.getElementById('pila1'), 1);
    sotto(document.getElementById('pila2'), 2);
  }
  function openCard(id, list) {
    ctx = list; pos = list.map(function (c) { return c.id; }).indexOf(id);
    lastFocus = document.activeElement;
    showCard();
    modal.classList.add('open');
    document.getElementById('close').focus();
  }
  function closeCard() {
    modal.classList.remove('open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  // Sfogliare: andando avanti la cartolina in cima vola via e finisce in fondo al mazzo; indietro, rientra.
  var mazzo = document.getElementById('mazzo'), inMoto = false;
  function step(d) {
    if (ctx.length < 2 || inMoto) return;
    var n = (pos + d + ctx.length) % ctx.length;
    if (fermo) { pos = n; showCard(); return; }
    inMoto = true;
    if (d > 0) {
      mazzo.classList.add('sfoglia');
      setTimeout(function () { pos = n; showCard(); mazzo.classList.remove('sfoglia'); inMoto = false; }, 360);
    } else {
      pos = n; showCard();
      mazzo.classList.add('rientra');
      setTimeout(function () { mazzo.classList.remove('rientra'); inMoto = false; }, 360);
    }
  }
  function flip() { cardEl.classList.toggle('flipped'); }

  // ---------- Tema chiaro / scuro ----------
  var themeBtn = document.getElementById('theme');
  function mostraTema() {
    themeBtn.innerHTML = document.documentElement.dataset.theme === 'dark' ? ICON.sole : ICON.luna;
  }
  themeBtn.addEventListener('click', function () {
    var t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('pausilypon-tema', t); } catch (e) {}
    mostraTema();
  });

  // ---------- Eventi ----------
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-view],[data-zona],[data-card]');
    if (!t) return;
    if (t.dataset.view) { setView(t.dataset.view); return; }
    if (t.dataset.zona !== undefined) { selectZona(t.dataset.zona); return; }
    if (t.dataset.card !== undefined) {
      var id = Number(t.dataset.card);
      openCard(id, state.view === 'map' ? cardsOf(CARDS[id].area) : state.view === 'grid' ? GRIGLIA : CARDS);
    }
  });
  cardEl.addEventListener('click', flip);
  cardEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
  });
  document.getElementById('close').addEventListener('click', closeCard);
  document.getElementById('prev').addEventListener('click', function () { step(-1); });
  document.getElementById('next').addEventListener('click', function () { step(1); });
  modal.addEventListener('click', function (e) { if (e.target === modal) closeCard(); });
  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeCard();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  map.on('zoomend', aggiornaLivelli);
  map.fitBounds(tutto, { padding: [48, 48], animate: false });
  aggiornaLivelli();
  mostraTema(); renderPanel(); renderGrid(); renderList(); setView('map');
})();
