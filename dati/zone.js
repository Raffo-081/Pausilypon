// ZONE DELLA MAPPA
// Ogni zona ha:
//   id      nome breve senza spazi: è quello che scrivi nella colonna "area" delle cartoline
//   nome    nome mostrato sul sito
//   dove    riga piccola sotto il nome
//   colori  i due colori del francobollo per le cartoline di questa zona: [fondo, disegno]
//   luoghi  (facoltativo) colori diversi per singoli luoghi della zona, scritti come nella colonna "luogo"
//   tipo    "disegnata" = area disegnata a mano, approssimata: viene arrotondata e tratteggiata
//           "punto"     = nessuna area, solo un puntino
//   centro  [longitudine, latitudine] del marcatore
//   forma   uno o più contorni, ognuno una lista di punti [longitudine, latitudine]
//
// I contorni sono volutamente approssimati: sono zone personali, non confini ufficiali.
window.PAUSILYPON_ZONE = [
  {
    id: 'napoli',
    nome: 'Napoli',
    dove: 'Golfo, isole e Costiera Amalfitana',
    colori: ['#1389C9', '#F2EDE1'],          // azzurro Napoli
    luoghi: {
      'Capri': ['#1B4FA8', '#F2EDE1'],             // blu Grotta Azzurra
      'Positano': ['#E9B93A', '#2F4A1C'],          // giallo limone e verde foglia
      'Procida': ['#E7917D', '#2B2340'],           // rosa delle case della Corricella
      'Pompei': ['#A3271F', '#F2EDE1'],            // rosso pompeiano
      'Ischia': ['#2E7D5B', '#F2EDE1']             // l isola verde
    },
    tipo: 'disegnata',
    centro: [14.25, 40.84],
    forma: [
      // terraferma: dal litorale domizio alla penisola sorrentina, fino a Vietri
      [[13.98, 40.97], [14.00, 40.86], [14.06, 40.78], [14.12, 40.76], [14.22, 40.77], [14.27, 40.81],
       [14.38, 40.74], [14.44, 40.68], [14.36, 40.66], [14.31, 40.60], [14.33, 40.555], [14.40, 40.55],
       [14.50, 40.59], [14.62, 40.60], [14.72, 40.63], [14.76, 40.67], [14.74, 40.72], [14.62, 40.72],
       [14.58, 40.78], [14.60, 40.90], [14.58, 40.98], [14.36, 41.00], [14.15, 40.99]],
      // Ischia
      [[13.99, 40.73], [13.965, 40.769], [13.905, 40.785], [13.845, 40.769], [13.82, 40.73], [13.845, 40.691],
       [13.905, 40.675], [13.965, 40.691]],
      // Procida
      [[14.055, 40.757], [14.043, 40.778], [14.015, 40.787], [13.987, 40.778], [13.975, 40.757], [13.987, 40.736],
       [14.015, 40.727], [14.043, 40.736]],
      // Capri
      [[14.285, 40.55], [14.269, 40.571], [14.23, 40.58], [14.191, 40.571], [14.175, 40.55], [14.191, 40.529],
       [14.23, 40.52], [14.269, 40.529]]
    ]
  },
  {
    id: 'salerno',
    nome: 'Salerno e Cilento',
    dove: 'Da Salerno a Sapri',
    colori: ['#5E7A3A', '#F2EDE1'],          // verde ulivo
    tipo: 'disegnata',
    centro: [15.25, 40.35],
    forma: [
      [[14.78, 40.72], [14.76, 40.65], [14.88, 40.52], [14.92, 40.38], [14.87, 40.24], [14.98, 40.13],
       [15.22, 39.97], [15.38, 39.95], [15.62, 40.01], [15.72, 40.08], [15.74, 40.25], [15.76, 40.42],
       [15.60, 40.58], [15.38, 40.70], [15.12, 40.76], [14.92, 40.77]]
    ]
  },
  {
    id: 'roma',
    nome: 'Roma',
    dove: 'Italia',
    colori: ['#8E1B1B', '#E9C46A'],          // porpora e oro
    tipo: 'punto',
    centro: [12.50, 41.90]
  },
  {
    id: 'dublino',
    nome: 'Dublino',
    dove: 'Irlanda',
    colori: ['#1E7A4C', '#F2EDE1'],          // verde irlandese
    tipo: 'punto',
    centro: [-6.26, 53.35]
  },
  {
    id: 'lofoten',
    nome: 'Lofoten',
    dove: 'Norvegia, oltre il Circolo Polare',
    colori: ['#B3261E', '#F2EDE1'],          // rosso delle casette dei pescatori
    tipo: 'disegnata',
    centro: [14.0, 68.2],
    forma: [
      [[12.85, 67.82], [13.10, 67.83], [13.55, 67.98], [14.05, 68.08], [14.65, 68.15], [15.20, 68.32],
       [15.30, 68.50], [14.90, 68.52], [14.30, 68.40], [13.70, 68.32], [13.20, 68.15], [12.85, 67.95]]
    ]
  },
  {
    id: 'oslo',
    nome: 'Oslo',
    dove: 'Norvegia',
    colori: ['#00205B', '#F2EDE1'],          // blu della bandiera norvegese
    tipo: 'punto',
    centro: [10.75, 59.91]
  },
  {
    id: 'caponord',
    nome: 'Capo Nord',
    dove: 'Troms e Finnmark, Norvegia',
    colori: ['#E07B2A', '#1B1F3A'],          // arancio del sole di mezzanotte
    tipo: 'disegnata',
    centro: [25.78, 71.0],
    forma: [
      [[16.0, 68.7], [16.8, 69.5], [18.5, 70.3], [21.5, 70.6], [23.5, 71.1], [26.0, 71.35], [28.5, 71.2],
       [31.5, 70.6], [31.2, 69.9], [30.3, 69.3], [28.8, 69.0], [28.5, 69.7], [27.0, 69.9], [25.8, 69.4],
       [24.5, 68.6], [22.5, 68.6], [21.0, 69.1], [20.0, 68.9], [19.0, 68.3], [17.3, 68.3]]
    ]
  },
  {
    id: 'svalbard',
    nome: 'Isole Svalbard',
    dove: 'Norvegia, Mar Glaciale Artico',
    colori: ['#BFE0EA', '#173042'],          // azzurro ghiaccio
    tipo: 'disegnata',
    centro: [16.0, 78.5],
    forma: [
      [[10.0, 78.9], [10.5, 79.9], [15.0, 80.4], [22.0, 80.9], [30.0, 80.6], [34.0, 80.2], [33.0, 79.0],
       [27.0, 78.0], [25.0, 77.0], [18.0, 76.3], [14.5, 76.6], [12.5, 77.8]]
    ]
  },
  {
    id: 'istanbul',
    nome: 'Istanbul',
    dove: 'Turchia',
    colori: ['#14868C', '#F2EDE1'],          // turchese delle maioliche
    tipo: 'punto',
    centro: [28.98, 41.01]
  }
];
