// Parsování QR obsahu (vCard / meCard / URL / text) a hrubé parsování OCR textu.

const EMPTY = {
  jmeno: '', firma: '', pozice: '', email: '', telefon: '', web: '', poznamka: ''
}

// --- vCard (BEGIN:VCARD ... END:VCARD) ---
function parseVCard(text) {
  const out = { ...EMPTY }
  const lines = text.split(/\r?\n/)
  for (const raw of lines) {
    const line = raw.trim()
    const upper = line.toUpperCase()
    if (upper.startsWith('FN:')) out.jmeno = line.slice(3).trim()
    else if (upper.startsWith('N:') && !out.jmeno) {
      // N:Příjmení;Jméno;...
      const parts = line.slice(2).split(';')
      out.jmeno = [parts[1], parts[0]].filter(Boolean).join(' ').trim()
    } else if (upper.startsWith('ORG:')) out.firma = line.slice(4).split(';')[0].trim()
    else if (upper.startsWith('TITLE:')) out.pozice = line.slice(6).trim()
    else if (upper.includes('EMAIL')) out.email = line.split(':').pop().trim()
    else if (upper.includes('TEL')) out.telefon = line.split(':').pop().trim()
    else if (upper.startsWith('URL:')) out.web = line.slice(4).trim()
  }
  return out
}

// --- meCard (MECARD:N:...;TEL:...;EMAIL:...;) ---
function parseMeCard(text) {
  const out = { ...EMPTY }
  const body = text.replace(/^MECARD:/i, '')
  for (const seg of body.split(';')) {
    const [keyRaw, ...rest] = seg.split(':')
    if (!keyRaw || rest.length === 0) continue
    const key = keyRaw.toUpperCase()
    const val = rest.join(':').trim()
    if (key === 'N') out.jmeno = val.split(',').reverse().join(' ').trim()
    else if (key === 'ORG') out.firma = val
    else if (key === 'EMAIL') out.email = val
    else if (key === 'TEL') out.telefon = val
    else if (key === 'URL') out.web = val
  }
  return out
}

// Hlavní vstupní bod pro QR obsah.
export function parseQR(text) {
  const t = (text || '').trim()
  if (/^BEGIN:VCARD/i.test(t)) return { ...parseVCard(t), zdroj: 'qr' }
  if (/^MECARD:/i.test(t)) return { ...parseMeCard(t), zdroj: 'qr' }
  if (/^https?:\/\//i.test(t)) return { ...EMPTY, web: t, zdroj: 'qr' }
  // Neznámý formát → ulož jako poznámku
  return { ...EMPTY, poznamka: t, zdroj: 'qr' }
}

// --- Hrubé parsování textu z OCR vizitky ---
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/
const URL_RE = /((https?:\/\/)?(www\.)?[\w-]+\.[a-z]{2,}(\/\S*)?)/i
const TITLE_HINTS = /(manažer|ředitel|director|manager|sales|obchod|ceo|cto|cfo|engineer|specialist|vedoucí|head of|founder)/i

export function parseBusinessCard(rawText) {
  const out = { ...EMPTY, zdroj: 'vizitka' }
  const text = (rawText || '').replace(/ /g, ' ')
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  const email = text.match(EMAIL_RE)
  if (email) out.email = email[0]

  const phone = text.match(PHONE_RE)
  if (phone) out.telefon = phone[0].trim()

  // web: ber jen řádek, který není email
  for (const line of lines) {
    if (EMAIL_RE.test(line)) continue
    const u = line.match(URL_RE)
    if (u && /\.(com|cz|net|org|eu|io|de|sk|at)\b/i.test(u[0])) { out.web = u[0]; break }
  }

  // jméno = první rozumný řádek bez čísel/@ (heuristika)
  const nameCandidate = lines.find(
    (l) => !EMAIL_RE.test(l) && !/\d/.test(l) && l.split(' ').length <= 4 && /[A-Za-zÀ-ž]/.test(l)
  )
  if (nameCandidate) out.jmeno = nameCandidate

  // pozice
  const title = lines.find((l) => TITLE_HINTS.test(l))
  if (title) out.pozice = title

  // firma: řádek z webové domény nebo z emailu (před @)
  if (out.web) {
    const m = out.web.replace(/^https?:\/\//, '').replace(/^www\./, '').split('.')[0]
    if (m) out.firma = m.charAt(0).toUpperCase() + m.slice(1)
  } else if (out.email) {
    const m = out.email.split('@')[1]?.split('.')[0]
    if (m) out.firma = m.charAt(0).toUpperCase() + m.slice(1)
  }

  // celý OCR text dáme do poznámky pro kontrolu
  out.poznamka = text.trim()
  return out
}
