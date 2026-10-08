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
  try {
    if (sessionStorage.getItem('pausilypon-intro') && !prova) { intro.remove(); return; }
    sessionStorage.setItem('pausilypon-intro', '1');
  } catch (e) {}

  var DURATA = 3000;                 // quanto resta la schermata, in millisecondi
  var NS = 'http://www.w3.org/2000/svg';
  // le file di onde, dalla più lontana (piccola, sotto l'isola) alla più vicina (grande, in primo piano): altezza, grandezza, colore, nitidezza della cresta, secondi per un giro
  var FILE = [
    { y: 423, s: 0.45, c: "#121829", o: 0.35, t: 9.0 },
    { y: 430, s: 0.65, c: "#151b30", o: 0.45, t: 7.6 },
    { y: 440, s: 0.90, c: "#182038", o: 0.55, t: 6.4 },
    { y: 456, s: 1.25, c: "#1b2542", o: 0.66, t: 5.4 },
    { y: 479, s: 1.70, c: "#1f2b4e", o: 0.78, t: 4.5 },
    { y: 513, s: 2.30, c: "#24325c", o: 0.90, t: 3.7 },
    { y: 562, s: 3.10, c: "#293869", o: 1.00, t: 3.0 },
    { y: 626, s: 4.00, c: "#2d3d72", o: 1.00, t: 2.6 }
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
      '<path d="M-8 10Q-10 -14 2 -25Q5 -12 9 10Z" fill="#24325c" stroke="#8EA8FF" stroke-width="1.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
      '<path d="M2 -24Q-9 -28 -12 -40Q0 -36 2 -30Q4 -36 16 -40Q13 -28 2 -24Z" fill="#24325c" stroke="#8EA8FF" stroke-width="1.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
      '<path d="M-5 -2q4 -3 8 0M-4 -9q3.5 -3 7 0M-2 -16q3 -2.5 5 0M-6 -33q4 1 6 4M10 -33q-4 1 -6 4" fill="none" stroke="#8EA8FF" stroke-opacity=".55" stroke-width="1" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
      '</g>';
  }
  // Partenope, la terza sirena, in primo piano: esce dall acqua con un tuffo ad arco e si rituffa;
  // la coda la segue ed è l ultima a sparire. È disegnata lungo un cerchio che ruota attorno a un punto sott acqua.
  var PARTENOPE = { dopo: 5, lato: 0.5, pelo: 586, s: 1.45, verso: -1 };
  function sirena(c) {
    var R = 60, FONDO = 20;         // raggio dell arco e quanto sta sotto il pelo dell acqua il centro del cerchio
    function p(a, r) { a = a * Math.PI / 180; return (r * Math.cos(a)).toFixed(1) + ' ' + (r * Math.sin(a)).toFixed(1); }
    function fascia(a0, a1, w0, w1) {   // un tratto di corpo curvo, largo w0 all inizio e w1 alla fine
      var fuori = [], dentro = [];
      for (var k = 0; k <= 16; k++) {
        var t = k / 16, a = a0 + (a1 - a0) * t, w = (w0 + (w1 - w0) * t) / 2;
        fuori.push(p(a, R + w)); dentro.unshift(p(a, R - w));
      }
      return 'M' + fuori.concat(dentro).join('L') + 'Z';
    }
    var x = 600 + c.lato * larghezzaVisibile() / 2;
    var taglio = nodo('clipPath', { id: 'intro-pelo' }, mare);
    nodo('rect', { x: -160, y: -160, width: 320, height: 160 - FONDO }, taglio);
    var g = nodo('g', { transform: 'translate(' + x.toFixed(0) + ' ' + (c.pelo + FONDO * c.s) + ') scale(' + (c.s * c.verso) + ' ' + c.s + ')', 'clip-path': 'url(#intro-pelo)' }, mare);
    var linea = ' stroke="#8EA8FF" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"';
    var squame = [-104, -114, -124, -134].map(function (a) { return 'M' + p(a, R - 4) + 'Q' + p(a - 4, R) + ' ' + p(a, R + 4); }).join('');
    g.innerHTML = '<g class="sirena">' +
      // la pinna, che continua a battere
      '<path class="pinna" style="transform-origin:' + p(-150, R).replace(' ', 'px ') + 'px" d="M' + p(-149, R + 2) + 'Q' + p(-158, R + 15) + ' ' + p(-171, R + 18) + 'Q' + p(-163, R + 4) + ' ' + p(-161, R) + 'Q' + p(-163, R - 4) + ' ' + p(-169, R - 18) + 'Q' + p(-157, R - 14) + ' ' + p(-149, R - 2) + 'Z" fill="#24325c"' + linea + '/>' +
      // la coda con le squame
      '<path d="' + fascia(-151, -92, 4, 15) + '" fill="#24325c"' + linea + '/>' +
      '<path d="' + squame + '" fill="none" stroke-opacity=".55"' + linea + '/>' +
      // le braccia tese in avanti, il busto, i capelli e la testa
      '<path d="M' + p(-54, R + 4) + 'L' + p(-20, R + 3) + 'M' + p(-54, R - 4) + 'L' + p(-21, R - 5) + '" fill="none" stroke="#dfe6ff" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="' + fascia(-92, -50, 15, 11) + '" fill="#dfe6ff"' + linea + '/>' +
      '<circle cx="' + p(-40, R).split(' ')[0] + '" cy="' + p(-40, R).split(' ')[1] + '" r="6.5" fill="#dfe6ff"' + linea + '/>' +
      '<path d="M' + p(-34, R + 6) + 'Q' + p(-48, R + 17) + ' ' + p(-74, R + 12) + 'Q' + p(-58, R + 8) + ' ' + p(-46, R + 4) + 'Z" fill="#8EA8FF"/>' +
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
    nodo('path', { d: onde + 'V400H-' + PASSO + 'Z', fill: f.c, stroke: '#8EA8FF', 'stroke-opacity': f.o, 'stroke-width': 1.4, 'vector-effect': 'non-scaling-stroke' }, moto);
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
        '<path d="M-34 -8Q-30 6 -18 8H18Q30 6 36 -10Q20 -4 0 -4Q-18 -4 -34 -8Z" fill="#1c2540" stroke="#8EA8FF" stroke-width="1.6" stroke-linejoin="round"/>' + // scafo
        '<path d="M-29 0Q0 5 30 -1" fill="none" stroke="#8EA8FF" stroke-opacity=".5" stroke-width="1.1"/>' +
        '</g></g>';
    }
  });

  // Capri con i Faraglioni deve starci tutta: su schermi stretti la rimpicciolisco e la tengo al centro.
  var isola = intro.querySelector('.intro-isola'), sole = intro.querySelector('.intro-sole');
  function adatta() {
    var visibile = larghezzaVisibile();
    isola.style.transform = 'translateX(36px) scale(' + Math.min(1, (visibile - 30) / 690).toFixed(3) + ')';
    // il sole: in alto a destra su schermi larghi; su quelli stretti più piccolo, tra il titolo e l'isola
    var s = visibile >= 900 ? 1 : Math.max(0.5, visibile / 1200);
    var x = visibile >= 900 ? 600 + visibile / 2 - 190 : 600 + visibile / 2 - 60 * s - 12;
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
