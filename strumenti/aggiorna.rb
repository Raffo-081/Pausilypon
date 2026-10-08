# encoding: utf-8
# AGGIORNA IL SITO DAI FOGLI EXCEL
#
# Legge cartoline.xlsx (una riga per cartolina) e le foto della cartella "foto",
# poi fa lo stesso per ogni amico che ha una cartella dentro "amici":
#     amici/Marco/cartoline.xlsx   + le sue foto, nella stessa cartella oppure in amici/Marco/foto
# Il nome della cartella è il nome che compare come autore delle sue cartoline.
# Rimpicciolisce le foto e riscrive dati/cartoline.js, che è il file letto dal sito.
# Usa solo strumenti già presenti sul Mac (ruby, unzip, sips): non serve installare niente.
#
# Si lancia con:  ruby strumenti/aggiorna.rb

require 'rexml/document'
require 'json'
require 'date'
require 'fileutils'
require 'open3'
Encoding.default_external = Encoding::UTF_8

PROPRIETARIO = 'Raffaele'                     # l'autore delle cartoline del foglio principale

ROOT     = File.expand_path('..', __dir__)
AMICI    = File.join(ROOT, 'amici')
WEB      = File.join(ROOT, 'foto-web')        # le copie rimpicciolite usate dal sito
PICCOLE  = File.join(WEB, 'piccole')
LATO_GRANDE  = 1800                           # lato lungo in pixel della foto sulla cartolina
LATO_PICCOLO = 700                            # lato lungo delle miniature
QUALITA  = '82'

COLONNE = {
  'titolo' => 'titolo', 'area' => 'area', 'zona' => 'area', 'luogo' => 'luogo', 'data' => 'data',
  'testo' => 'testo', 'testo del retro' => 'testo', 'sticker' => 'sticker', 'francobollo' => 'sticker',
  'foto' => 'foto', 'nome del file della foto' => 'foto', 'file' => 'foto', 'autore' => 'autore'
}
OBBLIGATORIE = %w[titolo area luogo data testo sticker foto]
MESI = %w[gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre]

# ---------- Lettura di un foglio Excel (un .xlsx è uno zip di file XML) ----------
def parte(xlsx, nome)
  out, st = Open3.capture2e('unzip', '-p', xlsx, nome)
  st.success? ? out.force_encoding('UTF-8') : nil
end
def testo_di(nodo)
  (nodo.elements.to_a('t') + nodo.elements.to_a('r/t')).map { |t| t.texts.map(&:value).join }.join
end
def indice_colonna(rif)
  rif[/[A-Z]+/].each_char.reduce(0) { |n, c| n * 26 + c.ord - 64 } - 1
end
# Restituisce le righe del primo foglio, ognuna come elenco di celle di testo; nil se il file non si legge.
def righe_di(xlsx)
  foglio = parte(xlsx, 'xl/worksheets/sheet1.xml') or return nil
  condivise = []
  if (sst = parte(xlsx, 'xl/sharedStrings.xml'))
    REXML::Document.new(sst).elements.each('sst/si') { |si| condivise << testo_di(si) }
  end
  righe = []
  REXML::Document.new(foglio).elements.each('worksheet/sheetData/row') do |row|
    celle = []
    prossima = 0
    row.elements.each('c') do |c|
      i = c.attributes['r'] ? indice_colonna(c.attributes['r']) : prossima
      prossima = i + 1
      v = c.elements['v'] && c.elements['v'].text
      celle[i] = case c.attributes['t']
                 when 's' then condivise[v.to_i]
                 when 'inlineStr' then c.elements['is'] ? testo_di(c.elements['is']) : ''
                 else v
                 end.to_s.strip
    end
    righe << celle.map(&:to_s)
  end
  righe
end

# Se Excel ha trasformato "agosto 2025" in una data, la riporto a parole.
def data_leggibile(v)
  return v unless v =~ /\A\d{5}(\.\d+)?\z/
  d = Date.new(1899, 12, 30) + v.to_f.floor
  "#{MESI[d.month - 1]} #{d.year}"
end

# ---------- Foto ----------
def trova(originali, nome)
  originali.find { |f| File.basename(f) == nome } ||
    originali.find { |f| File.basename(f).downcase == nome.downcase } ||
    originali.find { |f| File.basename(f, '.*').downcase == File.basename(nome, '.*').downcase }
end
def rimpicciolisci(src, dst, lato)
  return false if File.exist?(dst) && File.mtime(dst) >= File.mtime(src)
  _, st = Open3.capture2e('sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', QUALITA, '-Z', lato.to_s, src, '--out', dst)
  st.success? or raise "sips non è riuscito a convertire #{File.basename(src)}"
  true
end
def nome_semplice(s)
  s.downcase.gsub(/[^a-z0-9]+/, '-').gsub(/\A-|-\z/, '')
end
def immagini_in(*cartelle)
  cartelle.select { |d| Dir.exist?(d) }.flat_map do |d|
    Dir.children(d).reject { |f| f.start_with?('.', '~') || f =~ /\.xlsx\z/i }.map { |f| File.join(d, f) }.select { |f| File.file?(f) }
  end
end

# ---------- Da dove arrivano le cartoline: il foglio principale, poi una cartella per ogni amico ----------
fonti = [{ autore: PROPRIETARIO, xlsx: File.join(ROOT, 'cartoline.xlsx'), foto: immagini_in(File.join(ROOT, 'foto')), prefisso: '', etichetta: '' }]
if Dir.exist?(AMICI)
  Dir.children(AMICI).sort.each do |nome|
    dir = File.join(AMICI, nome)
    next unless File.directory?(dir) && !nome.start_with?('.')
    xlsx = Dir.children(dir).find { |f| f =~ /\.xlsx\z/i && !f.start_with?('~', '.') }
    fonti << { autore: nome, xlsx: xlsx && File.join(dir, xlsx), foto: immagini_in(dir, File.join(dir, 'foto')), prefisso: nome_semplice(nome) + '-', etichetta: "#{nome}, " }
  end
end

abort "Non trovo #{fonti[0][:xlsx]}" unless File.exist?(fonti[0][:xlsx])
zone = File.read(File.join(ROOT, 'dati', 'zone.js')).scan(/^\s*id:\s*'([^']+)'/).flatten
sticker = File.read(File.join(ROOT, 'js', 'app.js'))[/var GLYPH = \{(.*?)\};/m, 1].to_s.scan(/^\s*(\w+):/).flatten

FileUtils.mkdir_p(PICCOLE)
avvisi = []
cartoline = []
usate = []
nuove = 0
conteggio = {}

fonti.each do |fonte|
  e = fonte[:etichetta]
  unless fonte[:xlsx]
    avvisi << "#{fonte[:autore]}: nella sua cartella non c'è nessun foglio Excel."
    next
  end
  righe = righe_di(fonte[:xlsx])
  if righe.nil? || righe.empty?
    avvisi << "#{fonte[:autore]}: non riesco a leggere il foglio, o è vuoto."
    next
  end
  intestazione = righe.shift.map { |h| COLONNE[h.downcase.strip] }
  mancanti = OBBLIGATORIE - intestazione.compact
  unless mancanti.empty?
    abort "Nella prima riga del tuo foglio mancano le colonne: #{mancanti.join(', ')}" if fonte[:prefisso].empty?
    avvisi << "#{fonte[:autore]}: nella prima riga del foglio mancano le colonne #{mancanti.join(', ')}. Le sue cartoline sono saltate."
    next
  end

  righe.each_with_index do |celle, n|
    riga = n + 2
    c = {}
    intestazione.each_with_index { |col, i| c[col] = celle[i].to_s if col }
    next if c.values.all?(&:empty?)
    c['autore'] = fonte[:autore] if c['autore'].to_s.empty?
    c['data'] = data_leggibile(c['data'])
    c['area'] = c['area'].downcase
    c['sticker'] = c['sticker'].downcase
    avvisi << "#{e}riga #{riga} (#{c['titolo']}): la zona \"#{c['area']}\" non esiste. Zone valide: #{zone.join(', ')}." unless zone.include?(c['area'])
    avvisi << "#{e}riga #{riga} (#{c['titolo']}): lo sticker \"#{c['sticker']}\" non esiste, uso il sole. Sticker validi: #{sticker.join(', ')}." unless c['sticker'].empty? || sticker.include?(c['sticker'])

    unless c['foto'].empty?
      if (orig = trova(fonte[:foto], c['foto']))
        web = fonte[:prefisso] + nome_semplice(File.basename(orig, '.*')) + '.jpg'
        begin
          fatta = rimpicciolisci(orig, File.join(WEB, web), LATO_GRANDE)
          rimpicciolisci(orig, File.join(PICCOLE, web), LATO_PICCOLO)
          nuove += 1 if fatta
          usate << web
          c['foto'] = web
        rescue => err
          avvisi << "#{e}riga #{riga} (#{c['titolo']}): #{err.message}. Uso il disegno segnaposto."
          c['foto'] = ''
        end
      else
        avvisi << "#{e}riga #{riga} (#{c['titolo']}): non trovo la foto \"#{c['foto']}\". Uso il disegno segnaposto."
        c['foto'] = ''
      end
    end
    cartoline << c
    conteggio[c['autore']] = conteggio[c['autore']].to_i + 1
  end
end

# tolgo le copie rimpicciolite che non servono più
[WEB, PICCOLE].each do |dir|
  Dir.children(dir).each do |f|
    path = File.join(dir, f)
    File.delete(path) if File.file?(path) && f.end_with?('.jpg') && !usate.include?(f)
  end
end

File.write(File.join(ROOT, 'dati', 'cartoline.js'),
  "// File scritto da strumenti/aggiorna.rb a partire dai fogli Excel: non modificarlo a mano.\n" \
  "window.PAUSILYPON_CARTOLINE = " + JSON.pretty_generate(cartoline) + ";\n")

# cambio il numero di versione dei file in index.html, in modo che i browser non mostrino una copia vecchia
index = File.join(ROOT, 'index.html')
versione = Time.now.strftime('%Y%m%d%H%M')
File.write(index, File.read(index).gsub(/((?:css|js|dati)\/[\w.-]+?\.(?:css|js))\?v=\d+/) { "#{$1}?v=#{versione}" })

puts "Cartoline: #{cartoline.size} (#{cartoline.count { |c| !c['foto'].empty? }} con foto vera, #{nuove} foto convertite adesso)"
puts "Per autore: " + conteggio.map { |a, n| "#{a} #{n}" }.join(', ')
senza_testo = cartoline.select { |c| c['testo'].to_s.empty? }
puts "Ancora senza testo (#{senza_testo.size}): " + senza_testo.map { |c| "#{c['titolo'].empty? ? c['luogo'] : c['titolo']} (#{c['autore']})" }.join(', ') unless senza_testo.empty?
if avvisi.empty?
  puts 'Nessun problema trovato.'
else
  puts "Da controllare (#{avvisi.size}):"
  avvisi.each { |a| puts "  - #{a}" }
end
