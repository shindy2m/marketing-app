import { useEffect, useState } from 'react'
import QrScanner from './components/QrScanner'
import CardScanner from './components/CardScanner'
import ContactForm from './components/ContactForm'
import { addContact, getAllContacts, deleteContact } from './db'
import { parseQR } from './parsers'
import { exportToXlsx } from './export'

const HODNOCENI_ICON = { hot: '🔥', warm: '🙂', cold: '❄️' }

export default function App() {
  const [view, setView] = useState('home') // home | qr | card | form
  const [draft, setDraft] = useState(null)
  const [contacts, setContacts] = useState([])
  const [search, setSearch] = useState('')
  const [akce, setAkce] = useState(() => localStorage.getItem('akce') || '')

  async function refresh() {
    setContacts(await getAllContacts())
  }
  useEffect(() => { refresh() }, [])
  useEffect(() => { localStorage.setItem('akce', akce) }, [akce])

  function handleQrResult(text) {
    setDraft({ ...parseQR(text), akce })
    setView('form')
  }
  function handleCardResult(contact) {
    setDraft({ ...contact, akce })
    setView('form')
  }
  async function handleSave(form) {
    await addContact({ ...form, akce })
    setDraft(null)
    setView('home')
    refresh()
  }
  async function handleDelete(id) {
    if (confirm('Smazat tento kontakt?')) {
      await deleteContact(id)
      refresh()
    }
  }
  function handleExport() {
    if (contacts.length === 0) { alert('Žádné kontakty k exportu.'); return }
    exportToXlsx(contacts, akce)
  }

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase()
    return !q || [c.jmeno, c.firma, c.email].some((v) => (v || '').toLowerCase().includes(q))
  })

  if (view === 'qr') return <QrScanner onResult={handleQrResult} onCancel={() => setView('home')} />
  if (view === 'card') return <CardScanner onResult={handleCardResult} onCancel={() => setView('home')} />
  if (view === 'form') return <ContactForm initial={draft} onSave={handleSave} onCancel={() => setView('home')} />

  return (
    <div className="app">
      <header className="header">
        <h1>📇 Sběr kontaktů</h1>
        <input
          className="akce-input"
          placeholder="Název veletrhu / akce"
          value={akce}
          onChange={(e) => setAkce(e.target.value)}
        />
      </header>

      <div className="actions">
        <button className="btn btn-primary big" onClick={() => setView('qr')}>
          📷 Skenovat QR
        </button>
        <button className="btn btn-primary big" onClick={() => setView('card')}>
          🪪 Skenovat vizitku
        </button>
        <button className="btn btn-secondary" onClick={() => { setDraft(null); setView('form') }}>
          ✍️ Zadat ručně
        </button>
      </div>

      {contacts.length > 0 && (
        <div className="reminder">
          💾 Máš {contacts.length} kontaktů uložených jen v tomto telefonu.
          Pravidelně exportuj na SharePoint, ať se nic neztratí.
        </div>
      )}

      <div className="list-header">
        <input
          className="search"
          placeholder="Hledat…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-export" onClick={handleExport}>
          ⬇️ Export .xlsx ({contacts.length})
        </button>
      </div>

      <ul className="contact-list">
        {filtered.length === 0 && <li className="empty">Zatím žádné kontakty.</li>}
        {filtered.map((c) => (
          <li key={c.id} className="contact-item">
            <div className="contact-main">
              <strong>{c.jmeno || '(bez jména)'}</strong>
              <span className="hodnoceni">{HODNOCENI_ICON[c.hodnoceni] || ''}</span>
            </div>
            <div className="contact-sub">
              {[c.firma, c.email, c.telefon].filter(Boolean).join(' · ')}
            </div>
            <button className="link-danger" onClick={() => handleDelete(c.id)}>Smazat</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
