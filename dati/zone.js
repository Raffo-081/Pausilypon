// ZONE DELLA MAPPA
// Ogni zona ha:
//   id      nome breve senza spazi: è quello che scrivi nella colonna "area" delle cartoline
//   nome    nome mostrato sul sito
//   dove    riga piccola sotto il nome
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
    id: 'lofoten',
    nome: 'Lofoten',
    dove: 'Norvegia, oltre il Circolo Polare',
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
    tipo: 'punto',
    centro: [10.75, 59.91]
  }
];
