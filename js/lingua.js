// LINGUA DEL SITO: italiano o inglese
// Si sceglie così: ?lang=it o ?lang=en nell'indirizzo; altrimenti la scelta fatta l'ultima volta con il bottone IT/EN;
// altrimenti la lingua del browser (italiano per chi ha il browser in italiano, inglese per tutti gli altri).
// Le cartoline (titoli, testi, luoghi) restano come sono scritte nel foglio Excel: si traduce solo il sito.
(function () {
  'use strict';
  var lingua = null;
  try {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'it' || q === 'en') { lingua = q; localStorage.setItem('pausilypon-lingua', q); }
    if (!lingua) lingua = localStorage.getItem('pausilypon-lingua');
  } catch (e) {}
  if (lingua !== 'it' && lingua !== 'en') lingua = /^it\b/i.test(navigator.language || '') ? 'it' : 'en';
  document.documentElement.lang = lingua;

  // Le traduzioni inglesi. Nel codice del sito i testi brevi si cercano con la frase italiana stessa;
  // i testi lunghi delle pagine hanno un nome (l'attributo data-t nell'HTML).
  var EN = {
    // intestazione e comandi
    'Modo di visualizzazione': 'View mode',
    'Mappa': 'Map', 'Griglia': 'Grid', 'Lista': 'List', 'Il progetto': 'The project',
    'Passa al tema chiaro': 'Switch to light theme', 'Passa al tema scuro': 'Switch to dark theme',
    'Passa all’italiano': 'Passa all’italiano', 'Switch to English': 'Switch to English',
    'lemma': '<span class="sill">Pau·si·ly·pon</span> <abbr title="noun">n.</abbr> <span class="etimo">from the Greek <span lang="grc">Παυσίλυπον</span>: <i>paûsis</i> “pause” + <i>lýpē</i> “sorrow”.</span> <span class="senso">A respite from worries.</span>',
    'motto': 'A respite from worries',
    // mappa e zone
    'Scegli una zona': 'Choose an area', 'zone': 'areas',
    'Tutte le zone': 'All areas',
    'Ancora nessuna cartolina da qui.': 'No postcards from here yet.',
    'Sfoglia le cartoline di': 'Browse the postcards of',
    'Senza data': 'Undated',
    'cartolina': 'postcard', 'cartoline': 'postcards',
    'riprendi dalla': 'resume at', 'ricomincia da capo': 'start over',
    // cartolina aperta
    'Cartolina': 'Postcard', 'Chiudi': 'Close',
    'Cartolina precedente': 'Previous postcard', 'Cartolina successiva': 'Next postcard',
    'Gira la cartolina': 'Turn the postcard over',
    'Clicca la cartolina per girarla': 'Click the postcard to turn it over',
    // in fondo alle pagine: la storia del nome
    'nome-titolo': 'Why Pausilypon',
    'nome-testo': 'More than two thousand years ago the Roman Publius Vedius Pollio built a villa on the hill overlooking the Gulf of Naples, and named it <i>Pausilypon</i>: in Greek, “a respite from worries”. It was said that the view from up there was so beautiful it healed whoever looked at it, making them forget every sorrow. The hill of Posillipo takes its name from that villa, and this archive comes from that idea: a beautiful view can bring relief.',
    'come-funziona': 'How the site works',
    // la pagina del progetto
    'Pausilypon · Il progetto': 'Pausilypon · The project',
    'torna': '&#8249; Back to the map',
    'guida-titolo': 'The project',
    'guida-intro': 'Pausilypon is an archive of travel postcards. Not postcards bought at a newsstand, but photos: each one taken in a precise place, at a precise moment, and turned into a postcard with its front and its back. The project began in Naples and grows from there, one journey at a time. This page explains how to look at it.',
    'guida-mappa-titolo': 'The map',
    'guida-mappa': 'Everything starts from the map. The drawn areas and the dots mark the places the postcards come from; from afar each area is a marker, and as you zoom in its outline appears. Below the map the same areas are laid out as tiles, each with its own stamp and the number of postcards. Areas that are still empty stay dimmer, waiting.',
    'guida-mazzi-titolo': 'The decks',
    'guida-mazzi': 'When you open an area, its postcards appear in decks, one for each month of travel, from the most recent to the oldest. Click a deck to leaf through it: the postcard on top slides away to reveal the one beneath, with the arrows or the keyboard. After the last one, it starts again from the first.',
    'guida-retro-titolo': 'The back',
    'guida-retro': 'Click a postcard to turn it over. On the back there is a Greek-style stamp, with a drawing and the colours of the place: the yellow of the lemons in Sorrento, the red of the little houses in the Lofoten, the turquoise of the tiles in Istanbul. Next to it is the postmark with the month and year, and at the bottom the signature of whoever took the photo. Some postcards have a few written lines, others don’t: sometimes the postmark is enough.',
    'guida-viste-titolo': 'Grid and list',
    'guida-viste': 'If you prefer, you can leave the map and see all the postcards together: in the grid, in a different order at every visit, or in the list, grouped by place and date. The button next to the views switches between the dark and the light theme, and the one beside it between Italian and English.',
    'guida-logo-titolo': 'The logo',
    'guida-logo': 'The logo is an imaginary coin. Its rim is the tail of Parthenope, the siren who, according to legend, failed to enchant Ulysses and from whom Naples was born; at its centre is Ulysses, the traveller par excellence, who after every adventure looked for the way home.'
  };
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // T("frase italiana") restituisce la frase nella lingua scelta
  window.LINGUA = lingua;
  window.T = function (it) { return lingua === 'en' && EN[it] != null ? EN[it] : it; };
  // le date delle cartoline ("luglio 2025") nella lingua scelta
  window.T.data = function (d) {
    if (lingua !== 'en' || !d) return d;
    return String(d).replace(/[A-Za-zÀ-ÿ]+/g, function (p) { var i = MESI.indexOf(p.toLowerCase()); return i < 0 ? p : MONTHS[i]; });
  };

  // Traduce i testi fissi della pagina: data-t (contenuto), data-t-aria (aria-label), data-t-title (title).
  function applica(radice) {
    if (lingua !== 'en') return;
    (radice || document).querySelectorAll('[data-t]').forEach(function (el) { var v = EN[el.dataset.t]; if (v != null) el.innerHTML = v; });
    (radice || document).querySelectorAll('[data-t-aria]').forEach(function (el) { var v = EN[el.dataset.tAria]; if (v != null) el.setAttribute('aria-label', v); });
    if (!radice && EN[document.title] != null) document.title = EN[document.title];
  }
  window.applicaLingua = applica;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { applica(); });
  else applica();

  // Il bottone IT/EN: mostra la lingua in cui si passa, e cambiando ricarica la pagina nella nuova lingua
  // (ricaricando si torna allo stesso punto, e la schermata iniziale non si rivede).
  document.addEventListener('DOMContentLoaded', function () {
    var b = document.getElementById('lingua');
    if (!b) return;
    b.textContent = lingua === 'en' ? 'IT' : 'EN';
    b.setAttribute('aria-label', lingua === 'en' ? 'Passa all’italiano' : 'Switch to English');
    b.addEventListener('click', function () {
      var nuova = lingua === 'en' ? 'it' : 'en';
      try { localStorage.setItem('pausilypon-lingua', nuova); } catch (e) {}
      var u = new URL(location.href);
      u.searchParams.set('lang', nuova);
      location.replace(u.toString());
    });
  });
})();
