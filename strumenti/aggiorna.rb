# encoding: utf-8
# AGGIORNA IL SITO DAL FOGLIO EXCEL
#
# Legge cartoline.xlsx (una riga per cartolina), rimpicciolisce le foto della cartella "foto"
# e riscrive dati/cartoline.js, che è il file letto dal sito.
# Usa solo strumenti già presenti sul Mac (ruby, unzip, sips): non serve installare niente.
#
# Si lancia con:  ruby strumenti/aggiorna.rb

require 'rexml/document'
require 'json'
require 'date'
require 'fileutils'
require 'open3'
Encoding.default_external = Encoding::UTF_8

ROOT     = File.expand_path('..', __dir__)
XLSX     = File.join(ROOT, 'cartoline.xlsx')
FOTO     = File.join(ROOT, 'foto')            # le foto originali, come escono dal telefono
WEB      = File.join(ROOT, 'foto-web')        # le copie rimpicciolite usate dal sito
PICCOLE  = File.join(WEB, 'piccole')
LATO_GRANDE  = 1800                           # lato lungo in pixel della foto sulla cartolina
LATO_PICCOLO = 700                            # lato lungo delle miniature
QUALITA  = '82'

COLONNE = {
  'titolo' => 'titolo', 'area' => 'area', 'zona' => 'area', 'luogo' => 'luogo', 'data' => 'data',
  'testo' => 'testo', 'testo del retro' => 'testo', 'sticker' => 'sticker', 'francobollo' => 'sticker',
  'foto' => 'foto', 'nome del file della foto' => 'foto', 'file' => 'foto'
}
MESI = %w[gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre]

avvisi = []

# ---------- Lettura del foglio Excel (un .xlsx è uno zip di file XML) ----------
def parte(nome)
  out, st = Open3.capture2e('unzip', '-p', XLSX, nome)
  st.success? ? out.force_encoding('UTF-8') : nil
end
def testo_di(nodo)
  (nodo.elements.to_a('t') + nodo.elements.to_a('r/t')).map { |t| t.texts.map(&:value).join }.join
end
def indice_colonna(rif)
  rif[/[A-Z]+/].each_char.reduce(0) { |n, c| n * 26 + c.ord - 64 } - 1
end

abort "Non trovo #{XLSX}" unless File.exist?(XLSX)
foglio = parte('xl/worksheets/sheet1.xml') or abort 'Non riesco a leggere il foglio: è un file .xlsx salvato da Excel?'
condivise = []
if (sst = parte('xl/sharedStrings.xml'))
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
abort 'Il foglio è vuoto.' if righe.empty?

intestazione = righe.shift.map { |h| COLONNE[h.downcase.strip] }
mancanti = %w[titolo area luogo data testo sticker foto] - intestazione.compact
abort "Nella prima riga mancano le colonne: #{mancanti.join(', ')}" unless mancanti.empty?

# Se Excel ha trasformato "agosto 2025" in una data, la riporto a parole.
def data_leggibile(v)
  return v unless v =~ /\A\d{5}(\.\d+)?\z/
  d = Date.new(1899, 12, 30) + v.to_f.floor
  "#{MESI[d.month - 1]} #{d.year}"
end

# ---------- Zone e sticker validi ----------
zone = File.read(File.join(ROOT, 'dati', 'zone.js')).scan(/^\s*id:\s*'([^']+)'/).flatten
sticker = File.read(File.join(ROOT, 'js', 'app.js'))[/var GLYPH = \{(.*?)\};/m, 1].to_s.scan(/^\s*(\w+):/).flatten

# ---------- Foto ----------
FileUtils.mkdir_p(PICCOLE)
originali = Dir.exist?(FOTO) ? Dir.children(FOTO).reject { |f| f.start_with?('.') } : []
def trova(originali, nome)
  originali.find { |f| f == nome } ||
    originali.find { |f| f.downcase == nome.downcase } ||
    originali.find { |f| File.basename(f, '.*').downcase == File.basename(nome, '.*').downcase }
end
def rimpicciolisci(src, dst, lato)
  return false if File.exist?(dst) && File.mtime(dst) >= File.mtime(src)
  _, st = Open3.capture2e('sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', QUALITA, '-Z', lato.to_s, src, '--out', dst)
  st.success? or raise "sips non è riuscito a convertire #{File.basename(src)}"
  true
end

cartoline = []
usate = []
nuove = 0
righe.each_with_index do |celle, n|
  riga = n + 2
  c = {}
  intestazione.each_with_index { |col, i| c[col] = celle[i].to_s if col }
  next if c.values.all?(&:empty?)
  c['data'] = data_leggibile(c['data'])
  c['area'] = c['area'].downcase
  c['sticker'] = c['sticker'].downcase
  avvisi << "Riga #{riga}: manca il titolo." if c['titolo'].empty?
  avvisi << "Riga #{riga} (#{c['titolo']}): la zona \"#{c['area']}\" non esiste. Zone valide: #{zone.join(', ')}." unless zone.include?(c['area'])
  avvisi << "Riga #{riga} (#{c['titolo']}): lo sticker \"#{c['sticker']}\" non esiste, uso il sole. Sticker validi: #{sticker.join(', ')}." unless c['sticker'].empty? || sticker.include?(c['sticker'])

  unless c['foto'].empty?
    if (orig = trova(originali, c['foto']))
      web = File.basename(orig, '.*').downcase.gsub(/[^a-z0-9]+/, '-').gsub(/\A-|-\z/, '') + '.jpg'
      begin
        fatta = rimpicciolisci(File.join(FOTO, orig), File.join(WEB, web), LATO_GRANDE)
        rimpicciolisci(File.join(FOTO, orig), File.join(PICCOLE, web), LATO_PICCOLO)
        nuove += 1 if fatta
        usate << web
        c['foto'] = web
      rescue => e
        avvisi << "Riga #{riga} (#{c['titolo']}): #{e.message}. Uso il disegno segnaposto."
        c['foto'] = ''
      end
    else
      avvisi << "Riga #{riga} (#{c['titolo']}): non trovo \"#{c['foto']}\" nella cartella foto. Uso il disegno segnaposto."
      c['foto'] = ''
    end
  end
  cartoline << c
end

# tolgo le copie rimpicciolite che non servono più
[WEB, PICCOLE].each do |dir|
  Dir.children(dir).each do |f|
    path = File.join(dir, f)
    File.delete(path) if File.file?(path) && f.end_with?('.jpg') && !usate.include?(f)
  end
end

File.write(File.join(ROOT, 'dati', 'cartoline.js'),
  "// File scritto da strumenti/aggiorna.rb a partire da cartoline.xlsx: non modificarlo a mano.\n" \
  "window.PAUSILYPON_CARTOLINE = " + JSON.pretty_generate(cartoline) + ";\n")

# cambio il numero di versione dei file in index.html, in modo che i browser non mostrino una copia vecchia
index = File.join(ROOT, 'index.html')
versione = Time.now.strftime('%Y%m%d%H%M')
File.write(index, File.read(index).gsub(/((?:css|js|dati)\/[\w.-]+?\.(?:css|js))\?v=\d+/) { "#{$1}?v=#{versione}" })

puts "Cartoline: #{cartoline.size} (#{cartoline.count { |c| !c['foto'].empty? }} con foto vera, #{nuove} foto convertite adesso)"
if avvisi.empty?
  puts 'Nessun problema trovato.'
else
  puts "Da controllare (#{avvisi.size}):"
  avvisi.each { |a| puts "  - #{a}" }
end
