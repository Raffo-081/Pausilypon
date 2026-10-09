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
    limoni:   '<ellipse cx="8" cy="15" rx="5" ry="3.8" transform="rotate(-30 8 15)"/><path d="M3.6 17.6l-1.3 1"/><ellipse cx="16.5" cy="14" rx="4.8" ry="3.6" transform="rotate(28 16.5 14)"/><path d="M20.7 16.3l1.3 .8"/><path d="M10.5 10.5Q11.5 7.5 12.5 6M14.5 10.3Q13.5 7.8 12.5 6"/><path d="M12.5 6q3-3.5 6.5-1.5q-2.5 3.5-6.5 1.5Z"/><path d="M12.5 6q-3.5-2.5-6.5 0q3 2.8 6.5 0Z"/>',
    vesuvio:  '<path d="M1 18.5L6.5 10.5Q8 9 9.5 10.5L11.5 13L14 8.5Q15.5 7 17 8.5L23 18.5"/><path d="M15.5 5.5q-1.6-1.6 0-3.2"/><path d="M2 22q2.5-2 5 0t5 0t5 0t5 0"/>',
    moschea:  '<path d="M6.5 20V14.5a5.5 5.5 0 0 1 11 0V20"/><path d="M12 9V6.6"/><path d="M12.9 3.2a1.7 1.7 0 1 0 .9 2.9a1.4 1.4 0 0 1-.9-2.9Z"/><path d="M2.6 20V9.5l1-2.6l1 2.6V20M19.4 20V9.5l1-2.6l1 2.6V20"/><path d="M1.5 20H22.5"/><path d="M10.4 20v-2.6a1.6 1.6 0 0 1 3.2 0V20"/>',
    sirena:   '<path d="M9.5 20.5Q8.5 13.5 13 9.5Q14.5 14 16 20.5"/><path d="M13 9.5Q7.5 8 6.5 2.5Q12 3.5 13 6.8Q14 3.5 19.5 2.5Q18.5 8 13 9.5Z"/><path d="M10.6 16.5q2-1.5 4 0M11.3 13.2q1.4-1 2.8 0"/><path d="M2 21.5q3-2.5 6 0M17 21.5q2.5-2.5 5 0"/>',
    orca:     '<path d="M2 17 Q8 11 15 13 Q20 14.5 22 17"/><path d="M9.5 12.3 Q10.5 5 15 3.5 Q14 9 15.5 13.2"/><path d="M17.5 15 l1.6 .5"/><path d="M2 21 q3 -2.5 6 0 t6 0 t6 0"/>',
    arco:     '<path d="M4 20 V12 a3 3 0 0 1 6 0 V20 M14 20 V12 a3 3 0 0 1 6 0 V20 M2 20 H22"/>'
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

  // In orizzontale la mappa si ripete all'infinito, come un globo; in verticale si ferma ai poli.
  var map = L.map('map', {
    zoomSnap: 0.5, minZoom: 2, worldCopyJump: true,
    maxBounds: [[-85, -36000], [85, 36000]], maxBoundsViscosity: 1
  });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // La vista di partenza: l Europa, da Dublino a Istanbul e fino a Capo Nord. Le Svalbard restano appena fuori, più su.
  var VISTA = L.latLngBounds([[36, -11], [72, 33]]);
  ZONE.forEach(function (z) {
    var n = cardsOf(z.id).length;
    z.marker = L.marker(ll(z.centro), {
      icon: L.divIcon({
        className: '', iconSize: [44, 44], iconAnchor: [22, 22],
        html: '<div class="pin"><span>' + esc(z.nome) + '</span></div>'
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
    sistemaEtichette();
    segnaScelta();
  }
  // Quando due marcatori sono vicini le etichette si coprirebbero: provo a destra, poi a sinistra, altrimenti resta solo il puntino.
  function sistemaEtichette() {
    var occupati = [];
    function libero(r) {
      return occupati.every(function (o) { return r.x1 < o.x0 || r.x0 > o.x1 || r.y1 < o.y0 || r.y0 > o.y1; });
    }
    ZONE.forEach(function (z) {
      var el = z.marker.getElement();
      if (!el || !(el = el.querySelector('.pin'))) return;
      var p = map.latLngToContainerPoint(z.marker.getLatLng()), w = z.nome.length * 7.5 + 26;
      var destra = { x0: p.x + 10, x1: p.x + 14 + w, y0: p.y - 10, y1: p.y + 10 };
      var sinistra = { x0: p.x - 14 - w, x1: p.x - 10, y0: p.y - 10, y1: p.y + 10 };
      var scelta = libero(destra) ? destra : libero(sinistra) ? sinistra : null;
      el.classList.toggle('sx', scelta === sinistra);
      el.classList.toggle('muta', !scelta);
      if (scelta) occupati.push(scelta);
    });
  }
  function segnaScelta() {
    ZONE.forEach(function (z) {
      var scelta = z.id === state.zona, el;
      if (z.area && (el = z.area.getElement())) el.classList.toggle('scelta', scelta);
      if ((el = z.marker.getElement()) && (el = el.querySelector('.pin'))) el.classList.toggle('scelta', scelta);
    });
  }
  function vistaIntera() { map.fitBounds(VISTA, { animate: !fermo }); }

  // ---------- Viste ----------
  var state = { view: 'map', zona: null };
  var ctx = [];      // elenco delle cartoline in cui si naviga
  var pos = 0;

  function thumb(c, showWhere) {
    return '<button type="button" class="thumb" data-card="' + c.id + '"><img src="' + c.thumb + '" alt="" loading="lazy">' +
      (c.titolo ? '<span class="cap">' + esc(c.titolo) + '</span>' : '') +
      '<span class="where">' + esc((showWhere ? c.luogo + ', ' + c.data : c.luogo) + (showWhere && c.autore ? ' \u00b7 ' + c.autore : '')) + '</span></button>';
  }
  // Le cartoline di una zona divise per mese (la colonna "data"), dal più recente al più vecchio: un mazzo per ogni mese.
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  function quando(data) {      // "agosto 2025" diventa un numero che si può mettere in ordine; le date scritte in altro modo vanno in fondo
    var p = String(data).trim().toLowerCase().split(/\s+/), anno = Number(p[p.length - 1]), mese = MESI.indexOf(p[0]);
    return anno > 1000 ? anno * 12 + Math.max(mese, 0) : -1;
  }
  function perMese(list) {
    var gruppi = [], indice = {};
    list.forEach(function (c) {
      var k = String(c.data).trim().toLowerCase();
      if (!(k in indice)) { indice[k] = gruppi.length; gruppi.push({ mese: c.data || 'Senza data', t: quando(c.data), carte: [] }); }
      gruppi[indice[k]].carte.push(c);
    });
    return gruppi.sort(function (a, b) { return b.t - a.t; });
  }
  function stessoMese(c) {
    var k = String(c.data).trim().toLowerCase();
    return cardsOf(c.area).filter(function (x) { return String(x.data).trim().toLowerCase() === k; });
  }
  function renderPanel() {
    var el = document.getElementById('panel');
    if (!state.zona) {
      el.innerHTML = '<h2>Scegli una zona</h2><p class="sub">' + ZONE.length + ' zone, ' + quante(CARDS.length) + '</p>' +
        '<ul class="levels">' + ZONE.map(function (z) {
          var n = cardsOf(z.id).length;
          return '<li><button type="button"' + (n ? '' : ' class="vuota"') + ' data-zona="' + esc(z.id) + '"><span><span class="n">' + esc(z.nome) + '</span>' +
            '<span class="d">' + esc(z.dove) + '</span></span><span class="c">' + quante(n) + '</span></button></li>';
        }).join('') + '</ul>';
      return;
    }
    var z = zona(state.zona), list = cardsOf(z.id);
    el.innerHTML = '<button type="button" class="back-link" data-zona="">&#8249; Tutte le zone</button>' +
      '<h2>' + esc(z.nome) + '</h2><p class="sub">' + esc(z.dove) + ' &middot; ' + quante(list.length) + '</p>' +
      (list.length
        ? '<div class="mazzi">' + perMese(list).map(function (g) {
            return '<div class="mese"><button type="button" class="mazzetto" data-card="' + g.carte[0].id + '" aria-label="Sfoglia le cartoline di ' + esc(g.mese) + '">' +
              g.carte.slice(0, 3).map(function (c, i) { return '<img class="m' + i + '" src="' + c.thumb + '" alt="" loading="lazy">'; }).reverse().join('') +
              '</button><p class="mazzetto-cap">' + esc(g.mese) + '<span>' + quante(g.carte.length) + '</span></p></div>';
          }).join('') + '</div>'
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
        '<span>' + (c.titolo ? '<span class="t">' + esc(c.titolo) + '</span>' : '') + '<span class="m">' + esc(c.testo || (c.titolo ? '' : c.luogo + ', ' + c.data)) + '</span></span>' +
        '<span class="w">' + esc(c.luogo + ', ' + c.data) + (c.autore ? '<br>' + esc(c.autore) : '') + '</span></button>';
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
  // Il francobollo, in stile greco: cornice, due fasce di greca, lo sticker della cartolina e il nome del luogo.
  // I due colori sono quelli del luogo (se in zone.js ne ha di suoi) oppure quelli della zona.
  function coloriDi(c) {
    var z = zona(c.area) || {};
    return (z.luoghi && z.luoghi[c.luogo]) || z.colori || ['#2347C5', '#F2EDE1'];
  }
  function stampHtml(c) {
    var col = coloriDi(c);
    return '<div class="francobollo"><svg viewBox="0 0 80 100" aria-hidden="true" style="--fb-fondo:' + col[0] + ';--fb-segno:' + col[1] + '">' +
      '<defs><pattern id="fb-greca" x="11" y="11" width="8.2857" height="8" patternUnits="userSpaceOnUse"><path d="M0 7H6.6V1H1.7V4.8H4.4V3M6.6 7H8.3" class="fb-segno" fill="none" stroke-width="1"/></pattern></defs>' +
      '<rect width="80" height="100" class="fb-fondo"/>' +
      '<rect width="80" height="100" class="fb-denti" fill="none" stroke-width="6.5" stroke-linecap="round" stroke-dasharray="0 8.18"/>' +
      '<rect x="8.5" y="8.5" width="63" height="83" class="fb-segno" fill="none" stroke-width="1.1"/>' +
      '<rect x="11" y="11" width="58" height="8" fill="url(#fb-greca)"/><rect x="11" y="81" width="58" height="8" fill="url(#fb-greca)"/>' +
      '<path d="M11 20.5H69M11 79.5H69" class="fb-segno" stroke-width=".8"/>' +
      '<g transform="translate(22 25) scale(1.5)" class="fb-segno" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + (GLYPH[c.sticker] || GLYPH.sole) + '</g>' +
      '<text x="40" y="74" text-anchor="middle" class="fb-luogo" textLength="' + Math.min(54, c.luogo.length * 6.2) + '" lengthAdjust="spacingAndGlyphs">' + esc(c.luogo.toUpperCase()) + '</text></svg></div>';
  }
  // Il timbro postale: il nome del sito e della zona in tondo, mese e anno al centro, le onde dell annullo a lato.
  function timbroHtml(c) {
    var z = zona(c.area), giro = 'PAUSILYPON \u00b7 ' + (z ? z.nome : c.luogo).toUpperCase() + ' \u00b7 ';
    if (giro.length < 24) giro += giro;
    var parti = String(c.data).trim().split(/\s+/), anno = /^\d{4}$/.test(parti[parti.length - 1]) ? parti.pop() : '';
    var sopra = parti.join(' ').toUpperCase();
    return '<div class="timbro"><svg viewBox="0 0 170 110" aria-hidden="true">' +
      '<g fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="112" cy="55" r="50"/><circle cx="112" cy="55" r="33"/>' +
      '<path d="M2 34q9-8 18 0t18 0t18 0M2 48q9-8 18 0t18 0t18 0M2 62q9-8 18 0t18 0t18 0M2 76q9-8 18 0t18 0t18 0" stroke-linecap="round"/></g>' +
      '<text class="tb-giro" textLength="252" lengthAdjust="spacing"><textPath href="#timbro-giro" textLength="252" lengthAdjust="spacing">' + esc(giro) + '</textPath></text>' +
      (anno
        ? '<text x="112" y="52" text-anchor="middle" class="tb-mese">' + esc(sopra) + '</text><text x="112" y="68" text-anchor="middle" class="tb-anno">' + anno + '</text>'
        : '<text x="112" y="59" text-anchor="middle" class="tb-mese">' + esc(sopra) + '</text>') +
      '</svg></div>';
  }
  // Le righe dell indirizzo: titolo, luogo e zona (senza ripetere due volte la stessa parola).
  function righeHtml(c) {
    var z = zona(c.area), righe = c.titolo ? [c.titolo] : [];
    if (c.luogo && c.luogo !== c.titolo) righe.push(c.luogo);
    if (z && righe.indexOf(z.nome) < 0) righe.push(z.nome);
    while (righe.length < 3) righe.push('');
    return '<div class="righe">' + righe.map(function (r) { return '<span>' + esc(r) + '</span>'; }).join('') + '</div>';
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
      '<div class="face front"><img src="' + c.img + '" alt="' + esc(c.titolo || c.luogo) + '"></div>' +
      '<div class="face back' + (c.testo ? '' : ' muta') + '"><span class="mark"><svg class="logo" aria-hidden="true"><use href="#logo"/></svg>Pausilypon</span><i class="mezzo"></i><p class="msg">' + esc(c.testo) + '</p>' + righeHtml(c) + timbroHtml(c) +
      (c.autore ? '<span class="firma">' + esc(c.autore) + '</span>' : '') + '<span class="meta">' + esc(c.luogo + ', ' + c.data) + '</span>' + stampHtml(c) + '</div></div>';
    // sotto la cartolina: titolo e luogo; se il titolo non c'è resta solo una riga piccola con luogo e data
    var did = document.getElementById('cap-title');
    did.classList.toggle('sotto', !c.titolo);
    did.textContent = !c.titolo ? c.luogo + ', ' + c.data : c.titolo === c.luogo ? c.titolo : c.titolo + ' \u2014 ' + c.luogo;
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

  // ---------- Eventi ----------
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-view],[data-zona],[data-card]');
    if (!t) return;
    if (t.dataset.view) { setView(t.dataset.view); return; }
    if (t.dataset.zona !== undefined) { selectZona(t.dataset.zona); return; }
    if (t.dataset.card !== undefined) {
      var id = Number(t.dataset.card);
      openCard(id, state.view === 'map' ? stessoMese(CARDS[id]) : state.view === 'grid' ? GRIGLIA : CARDS);
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
  map.fitBounds(VISTA, { animate: false });
  aggiornaLivelli();
  renderPanel(); renderGrid(); renderList(); setView('map');
})();
