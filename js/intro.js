// SCHERMATA INIZIALE
// Il mare in stile greco con Capri vista da Punta Campanella. Dura qualche secondo, poi tutto sale verso l'alto
// e compare il sito. Un clic o un tasto la saltano.
(function () {
  'use strict';
  var intro = document.getElementById('intro'), mare = document.getElementById('intro-mare');
  if (!intro || !mare) return;

  // La schermata compare solo quando si apre il sito: ricaricando la pagina o tornandoci nella stessa visita non si rivede.
  // (Con #fermo in fondo all indirizzo compare sempre, per provarla.)
  var prova = location.hash === '#fermo';
  if (window.applicaLingua) window.applicaLingua(intro);     // la scritta sotto il nome, nella lingua scelta
  try {
    if (sessionStorage.getItem('pausilypon-intro') && !prova) { intro.remove(); return; }
    sessionStorage.setItem('pausilypon-intro', '1');
  } catch (e) {}

  var DURATA = 3000;                 // quanto resta la schermata, in millisecondi
  var NS = 'http://www.w3.org/2000/svg';
  // le file di onde, dalla più lontana (piccola, sotto l isola) alla più vicina (grande, in primo piano): altezza, grandezza, colore, nitidezza della cresta, secondi per un giro.
  // Di notte il mare lontano prende il chiarore dell orizzonte e quasi si confonde con il cielo; quello vicino è più scuro e più nitido.
  var FILE = [
    { y: 423, s: 0.45, c: "#1B2852", o: 0.20, t: 9.0 },
    { y: 430, s: 0.65, c: "#192550", o: 0.25, t: 7.6 },
    { y: 440, s: 0.90, c: "#17224A", o: 0.30, t: 6.4 },
    { y: 456, s: 1.25, c: "#152044", o: 0.36, t: 5.4 },
    { y: 479, s: 1.70, c: "#131C3E", o: 0.42, t: 4.5 },
    { y: 513, s: 2.30, c: "#111937", o: 0.48, t: 3.7 },
    { y: 562, s: 3.10, c: "#0F1631", o: 0.54, t: 3.0 },
    { y: 626, s: 4.00, c: "#0D142C", o: 0.60, t: 2.6 }
  ];
  var PASSO = 48;                    // larghezza di un'onda, nel suo disegno

  // quanta parte della scena (larga 1200) si vede davvero, in base alla forma dello schermo
  function larghezzaVisibile() {
    return window.innerHeight > 0 ? Math.min(1200, 700 * window.innerWidth / window.innerHeight) : 1200;
  }
  function nodo(nome, attr, padre) {
    var n = document.createElementNS(NS, nome);
    for (var k in attr) n.setAttribute(k, attr[k]);
    if (padre) padre.appendChild(n);
    return n;
  }
  // Le code sono sparse e mezze nascoste: ognuna sta dietro una fila di onde diversa (la chiave è la fila dopo cui compare).
  // lato: da -1 (bordo sinistro dello schermo) a 1 (bordo destro); durata: dopo quanti secondi è sparita sott acqua.
  var CODE = {
    1: { lato: 0.2, y: 457, s: 0.42, verso: -1, durata: 2.3 },
    3: { lato: -0.74, y: 512, s: 0.8, verso: 1, durata: 1.6 }
  };
  function coda(c) {
    var x = 600 + c.lato * larghezzaVisibile() / 2;
    var g = nodo('g', { transform: 'translate(' + x.toFixed(0) + ' ' + c.y + ') scale(' + (c.s * c.verso) + ' ' + c.s + ')' }, mare);
    g.innerHTML = '<g class="coda" style="animation-duration:' + c.durata + 's">' +
      '<path d="M-8 10Q-10 -14 2 -25Q5 -12 9 10Z" fill="#141D3D" stroke="#8EA8FF" stroke-width="1.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
      '<path d="M2 -24Q-9 -28 -12 -40Q0 -36 2 -30Q4 -36 16 -40Q13 -28 2 -24Z" fill="#141D3D" stroke="#8EA8FF" stroke-width="1.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
      '<path d="M-5 -2q4 -3 8 0M-4 -9q3.5 -3 7 0M-2 -16q3 -2.5 5 0M-6 -33q4 1 6 4M10 -33q-4 1 -6 4" fill="none" stroke="#8EA8FF" stroke-opacity=".55" stroke-width="1" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
      '</g>';
  }
  // Partenope, la terza sirena, in primo piano: esce dall acqua con un tuffo ad arco e si rituffa;
  // la coda la segue ed è l ultima a sparire. È disegnata lungo un cerchio che ruota attorno a un punto sott acqua.
  var PARTENOPE = { dopo: 6, lato: 0.45, pelo: 600, s: 1.75, verso: -1 };
  function sirena(c) {
    var R = 60, FONDO = 20;         // raggio dell arco e quanto sta sotto il pelo dell acqua il centro del cerchio
    function p(a, r) { a = a * Math.PI / 180; return (r * Math.cos(a)).toFixed(1) + ' ' + (r * Math.sin(a)).toFixed(1); }
    // La figura è un profilo che corre lungo l arco: per ogni angolo, quanto è larga.
    // Dalle punte delle dita (davanti, verso il tuffo) alla fine della coda: braccia tese, collo, spalle, vita, fianchi, coda.
    // La testa è a parte, un cerchio tra le braccia e le spalle.
    var PROFILO = [[-22, 0.8], [-28, 2.6], [-44, 3.4], [-50, 3.2], [-57, 4.6], [-63, 12.5], [-71, 11.5],
                   [-84, 8.2], [-97, 12.5], [-110, 10], [-127, 6.2], [-141, 3], [-149, 2.2]];
    function larghezza(a) {
      for (var k = 1; k < PROFILO.length; k++) {
        var A = PROFILO[k - 1], B = PROFILO[k];
        if (a >= B[0]) { var t = (A[0] - a) / (A[0] - B[0]); t = t * t * (3 - 2 * t); return A[1] + (B[1] - A[1]) * t; }
      }
      return PROFILO[PROFILO.length - 1][1];
    }
    var fuori = [], dentro = [];
    for (var a = -22; a >= -149; a -= 1) { var w = larghezza(a) / 2; fuori.push(p(a, R + w)); dentro.unshift(p(a, R - w)); }
    var corpo = 'M' + fuori.concat(dentro).join('L') + 'Z';
    var dorso = 'M' + fuori.slice(38).join('L');           // il lato illuminato dalla luna, dalle spalle alla coda
    var braccia = 'M' + fuori.slice(2, 24).join('L');
    var testa = p(-52.5, R + 1).split(' ');
    // i capelli lunghi: nel tuffo restano indietro e scendono lungo la schiena, appena sollevati
    var capelli = 'M' + p(-48.5, R + 5) + 'Q' + p(-56, R + 8.5) + ' ' + p(-68, R + 8.6) + 'Q' + p(-82, R + 8.4) + ' ' + p(-100, R + 9.5) +
      'Q' + p(-86, R + 5.6) + ' ' + p(-72, R + 5.8) + 'Q' + p(-62, R + 5.6) + ' ' + p(-55, R + 2.5) + 'Z';
    var ciocca = 'M' + p(-53, R + 6.5) + 'Q' + p(-68, R + 7.8) + ' ' + p(-88, R + 8);
    // le squame: piccoli archi sulla coda, sempre più fitti verso la pinna
    var squame = '';
    [-104, -111, -118, -125, -131, -137].forEach(function (a, i) {
      var w = larghezza(a) / 2 - 1;
      squame += 'M' + p(a, R - w) + 'Q' + p(a - 4 + i * .3, R) + ' ' + p(a, R + w);
    });
    // la pinna, a forma di mezzaluna, che continua a battere
    var pinna = 'M' + p(-148, R + 1.5) + 'Q' + p(-156, R + 9) + ' ' + p(-170, R + 17) + 'Q' + p(-162, R + 5) + ' ' + p(-163, R) +
      'Q' + p(-162, R - 5) + ' ' + p(-170, R - 17) + 'Q' + p(-156, R - 9) + ' ' + p(-148, R - 1.5) + 'Z';
    // qualche goccia che la coda si porta dietro uscendo dall acqua
    var gocce = [[-176, R + 4, 1.3], [-183, R - 3, 1], [-190, R + 7, .8], [-196, R, .6]].map(function (g) {
      var q = p(g[0], g[1]).split(' ');
      return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + g[2] + '"/>';
    }).join('');

    var x = 600 + c.lato * larghezzaVisibile() / 2;
    var taglio = nodo('clipPath', { id: 'intro-pelo' }, mare);
    nodo('rect', { x: -160, y: -160, width: 320, height: 160 - FONDO }, taglio);
    var g = nodo('g', { transform: 'translate(' + x.toFixed(0) + ' ' + (c.pelo + FONDO * c.s) + ') scale(' + (c.s * c.verso) + ' ' + c.s + ')', 'clip-path': 'url(#intro-pelo)' }, mare);
    var bordo = ' stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"';
    g.innerHTML = '<g class="sirena">' +
      '<path class="pinna" style="transform-origin:' + p(-150, R).replace(' ', 'px ') + 'px" d="' + pinna + '" fill="#18234A" stroke="#9FB4FF" stroke-opacity=".7" stroke-width="1.2"' + bordo + '/>' +
      '<g fill="#DCE4FF" fill-opacity=".5">' + gocce + '</g>' +
      // la sagoma scura, con il contorno appena accennato
      '<path d="' + corpo + '" fill="#18234A" stroke="#9FB4FF" stroke-opacity=".55" stroke-width="1.1"' + bordo + '/>' +
      '<path d="' + squame + '" fill="none" stroke="#9FB4FF" stroke-opacity=".3" stroke-width=".9"' + bordo + '/>' +
      '<circle cx="' + testa[0] + '" cy="' + testa[1] + '" r="5.6" fill="#18234A" stroke="#9FB4FF" stroke-opacity=".6" stroke-width="1.1"' + bordo + '/>' +
      '<path d="' + capelli + '" fill="#24336A" stroke="#9FB4FF" stroke-opacity=".45" stroke-width=".9"' + bordo + '/>' +
      '<path d="' + ciocca + '" fill="none" stroke="#C9D6FF" stroke-opacity=".5" stroke-width=".8"' + bordo + '/>' +
      // il filo di luce della luna sul dorso
      '<path d="' + braccia + '" fill="none" stroke="#EEF0F8" stroke-opacity=".7" stroke-width="1.2"' + bordo + '/>' +
      '<path d="' + dorso + '" fill="none" stroke="#EEF0F8" stroke-opacity=".9" stroke-width="1.6"' + bordo + '/>' +
      '</g>';
  }
  FILE.forEach(function (f, i) {
    var quante = Math.ceil(1200 / f.s / PASSO) + 3, onde = 'M-' + PASSO + ' 24', ricci = '';
    for (var k = 0; k < quante; k++) {
      onde += 'c10 0 14-18 27-18c9 0 14 7 10 13c-2 3 3 5 11 5';          // la cresta che si piega in avanti
      ricci += 'M' + (k * PASSO - PASSO + 33) + ' 12c3 3 0 8-4 5';        // il ricciolo dentro la cresta
    }
    var strato = nodo('g', { 'class': 'strato', style: '--i:' + (i + 3) }, mare);
    var posto = nodo('g', { transform: 'translate(0 ' + f.y + ') scale(' + f.s + ')' }, strato);
    var moto = nodo('g', { 'class': 'onda' + (i % 2 ? ' contraria' : ''), style: 'animation-duration:' + f.t + 's' }, posto);
    nodo('path', { d: onde + 'V400H-' + PASSO + 'Z', fill: f.c, stroke: '#8EA8FF', 'stroke-opacity': f.o, 'stroke-width': (0.8 + i * 0.09).toFixed(2), 'vector-effect': 'non-scaling-stroke' }, moto);
    nodo('path', { d: ricci, fill: 'none', stroke: '#8EA8FF', 'stroke-opacity': f.o * 0.8, 'stroke-width': 1.2, 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke' }, moto);
    // le tre sirene che tentarono Ulisse: di due si vede solo la coda, che si muove un po e poi sparisce; la terza è Partenope
    if (CODE[i]) coda(CODE[i]);
    if (i === PARTENOPE.dopo) sirena(PARTENOPE);
    // dopo la quarta fila metto la barchetta: così le onde più vicine le passano davanti
    if (i === 3) {
      var barca = nodo('g', { transform: 'translate(560 493)' }, mare);
      barca.innerHTML = '<g class="barca-rotta"><g class="barca-dondola">' +
        '<path d="M-2 -4V-42" stroke="#8EA8FF" stroke-width="1.6" stroke-linecap="round"/>' +                                    // albero
        '<path d="M-1 -40L21 -11H-1Z" fill="#dfe6ff" fill-opacity=".9" stroke="#8EA8FF" stroke-width="1.2" stroke-linejoin="round"/>' + // vela
        '<circle cx="-19" cy="-17" r="3" fill="#dfe6ff"/><path d="M-19 -14V-5M-18 -12L-37 -23" stroke="#dfe6ff" stroke-width="1.6" stroke-linecap="round"/>' + // pescatore con la canna
        '<path d="M-37 -23V2" stroke="#dfe6ff" stroke-opacity=".6" stroke-width=".8"/>' +                                              // la lenza
        '<circle cx="30" cy="-15" r="7" fill="#dfe6ff" fill-opacity=".18"/><circle cx="30" cy="-15" r="2.4" fill="#dfe6ff"/>' +        // la lampara
        '<path d="M-34 -8Q-30 6 -18 8H18Q30 6 36 -10Q20 -4 0 -4Q-18 -4 -34 -8Z" fill="#101833" stroke="#8EA8FF" stroke-width="1.6" stroke-linejoin="round"/>' + // scafo
        '<path d="M-29 0Q0 5 30 -1" fill="none" stroke="#8EA8FF" stroke-opacity=".5" stroke-width="1.1"/>' +
        '</g></g>';
    }
  });

  // Numeri a caso ma sempre gli stessi, così il cielo non cambia da una volta all altra.
  var seme = 7;
  function caso() { seme = (seme * 16807) % 2147483647; return (seme - 1) / 2147483646; }

  // Le stelle: più fitte in alto, quasi assenti vicino all orizzonte; alcune tremolano.
  var stelle = document.getElementById('intro-stelle');
  for (var k = 0; k < 90; k++) {
    var sy = 8 + Math.pow(caso(), 1.8) * 360, sx = -300 + caso() * 1800, sr = 0.5 + caso() * caso() * 1.3;
    nodo('circle', {
      cx: sx.toFixed(0), cy: sy.toFixed(0), r: sr.toFixed(2), fill: '#DCE4FF',
      'fill-opacity': (0.25 + caso() * 0.6).toFixed(2), 'class': caso() < 0.35 ? 'stella' : '',
      style: 'animation-delay:-' + (caso() * 4).toFixed(1) + 's;animation-duration:' + (2.5 + caso() * 3).toFixed(1) + 's'
    }, stelle);
  }

  // Le luci di Capri: ognuna con il suo alone, che tremola per conto suo.
  Array.prototype.forEach.call(intro.querySelectorAll('.intro-luci circle'), function (c) {
    var alone = nodo('circle', {
      cx: c.getAttribute('cx'), cy: c.getAttribute('cy'), r: 4.5, fill: 'url(#intro-lume)', 'class': 'lume',
      style: 'animation-delay:-' + (caso() * 3).toFixed(1) + 's;animation-duration:' + (1.6 + caso() * 2.4).toFixed(1) + 's'
    });
    c.parentNode.insertBefore(alone, c);
  });

  // Il riflesso della luna sul mare: una scia di piccoli bagliori sotto la luna, più larga verso chi guarda.
  var riflesso = nodo('g', { 'class': 'intro-riflesso' }, mare);
  nodo('ellipse', { cx: 0, cy: 452, rx: 130, ry: 34, fill: 'url(#intro-alone)' }, riflesso);
  for (var k = 0; k < 70; k++) {
    var t = Math.pow(k / 69, 1.5), ry = 436 + t * 262, larga = 10 + t * 190;
    var rx = (caso() + caso() + caso() - 1.5) / 1.5 * larga, lungo = 2 + t * 16 * (0.3 + caso());
    nodo('path', {
      d: 'M' + (rx - lungo / 2).toFixed(1) + ' ' + ry.toFixed(1) + 'h' + lungo.toFixed(1),
      stroke: '#E6EBFF', 'stroke-width': (0.9 + t * 1.6).toFixed(2), 'stroke-linecap': 'round',
      'stroke-opacity': (0.8 - t * 0.6).toFixed(2), 'class': 'luccichio',
      style: 'animation-delay:-' + (caso() * 3).toFixed(1) + 's;animation-duration:' + (1.4 + caso() * 2).toFixed(1) + 's'
    }, riflesso);
  }

  // Capri con i Faraglioni deve starci tutta: su schermi stretti la rimpicciolisco e la tengo al centro.
  var isola = intro.querySelector('.intro-isola'), sole = intro.querySelector('.intro-sole');
  function adatta() {
    var visibile = larghezzaVisibile();
    isola.style.transform = 'translateX(36px) scale(' + Math.min(1, (visibile - 30) / 690).toFixed(3) + ')';
    // la luna: in alto a destra su schermi larghi; su quelli stretti più piccolo, tra il titolo e l'isola
    var s = visibile >= 900 ? 1 : Math.max(0.5, visibile / 1200);
    var x = visibile >= 900 ? 600 + visibile / 2 - 190 : 600 + visibile / 2 - 60 * s - 12;
    riflesso.setAttribute('transform', 'translate(' + x.toFixed(0) + ' 0) scale(' + s.toFixed(2) + ' 1)');
    sole.setAttribute('transform', 'translate(' + x.toFixed(0) + ' ' + (visibile >= 900 ? 150 : 275) + ') scale(' + s.toFixed(2) + ')');
  }
  adatta();
  window.addEventListener('resize', adatta);

  // il sito deve aprirsi dall'inizio della pagina, non dal punto in cui era rimasto il browser
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  document.body.classList.add('intro');
  var finita = false;
  function fine() {
    if (finita) return;
    finita = true;
    window.scrollTo(0, 0);
    document.body.classList.add('intro-via');
    setTimeout(function () {
      intro.remove();
      document.body.classList.remove('intro', 'intro-via');
      window.scrollTo(0, 0);
    }, 1900);
  }
  // aggiungendo #fermo in fondo all indirizzo la schermata non si chiude da sola: serve per provarla con calma
  if (!prova) setTimeout(fine, DURATA);
  intro.addEventListener('click', fine);
  document.addEventListener('keydown', fine, { once: true });
})();
