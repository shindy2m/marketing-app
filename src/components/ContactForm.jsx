import { useState } from 'react'

const FIELDS = [
  ['jmeno', 'Jméno'],
  ['firma', 'Firma'],
  ['pozice', 'Pozice'],
  ['email', 'Email'],
  ['telefon', 'Telefon'],
  ['web', 'Web'],
  ['zajem', 'Zájem o produkt / téma']
]

// Formulář pro potvrzení/úpravu kontaktu před uložením.
export default function ContactForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    jmeno: '', firma: '', pozice: '', email: '', telefon: '', web: '',
    zajem: '', poznamka: '', hodnoceni: 'warm', zdroj: 'rucni',
    ...initial
  })

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  return (
    <div className="form">
      <h2>Kontakt</h2>
      {FIELDS.map(([key, label]) => (
        <label key={key} className="field">
          <span>{label}</span>
          <input value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />
        </label>
      ))}

      <label className="field">
        <span>Hodnocení leadu</span>
        <select value={form.hodnoceni} onChange={(e) => set('hodnoceni', e.target.value)}>
          <option value="hot">🔥 Žhavý</option>
          <option value="warm">🙂 Vlažný</option>
          <option value="cold">❄️ Studený</option>
        </select>
      </label>

      <label className="field">
        <span>Poznámka</span>
        <textarea
          rows={3}
          value={form.poznamka || ''}
          onChange={(e) => set('poznamka', e.target.value)}
        />
      </label>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onCancel}>Zrušit</button>
        <button className="btn btn-primary" onClick={() => onSave(form)}>Uložit kontakt</button>
      </div>
    </div>
  )
}
