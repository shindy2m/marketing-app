import * as XLSX from 'xlsx'

const COLUMNS = [
  ['jmeno', 'Jméno'],
  ['firma', 'Firma'],
  ['pozice', 'Pozice'],
  ['email', 'Email'],
  ['telefon', 'Telefon'],
  ['web', 'Web'],
  ['zajem', 'Zájem'],
  ['hodnoceni', 'Hodnocení'],
  ['poznamka', 'Poznámka'],
  ['zdroj', 'Zdroj'],
  ['akce', 'Akce'],
  ['vytvoreno', 'Vytvořeno']
]

export function exportToXlsx(contacts, akce) {
  const rows = contacts.map((c) => {
    const row = {}
    for (const [key, label] of COLUMNS) {
      let val = c[key] ?? ''
      if (key === 'vytvoreno' && val) val = new Date(val).toLocaleString('cs-CZ')
      row[label] = val
    }
    return row
  })

  const ws = XLSX.utils.json_to_sheet(rows, { header: COLUMNS.map((c) => c[1]) })
  ws['!cols'] = COLUMNS.map(() => ({ wch: 18 }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Kontakty')

  const safe = (akce || 'kontakty').replace(/[^\w\-]+/g, '_')
  const stamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `${safe}_${stamp}.xlsx`)
}
