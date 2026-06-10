import { useState } from 'react'
import Tesseract from 'tesseract.js'
import { parseBusinessCard } from '../parsers'

// Vyfotí/nahraje vizitku, spustí OCR a vrátí naparsovaný kontakt.
// Mezinárodní veletrh → jazyky eng+ces+deu (lze rozšířit).
const OCR_LANGS = 'eng+ces+deu'

export default function CardScanner({ onResult, onCancel }) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setPreview(URL.createObjectURL(file))
    setBusy(true)
    setProgress(0)
    try {
      const { data } = await Tesseract.recognize(file, OCR_LANGS, {
        logger: (m) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100))
        }
      })
      const contact = parseBusinessCard(data.text)
      onResult(contact)
    } catch (err) {
      setError('OCR selhalo: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card-scanner">
      <h2>Sken vizitky</h2>
      {preview && <img src={preview} alt="náhled vizitky" className="card-preview" />}

      {!busy && (
        <label className="btn btn-primary file-label">
          📷 Vyfotit / vybrat vizitku
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            hidden
          />
        </label>
      )}

      {busy && (
        <div className="ocr-progress">
          <p>Rozpoznávám text… {progress}%</p>
          <div className="bar"><div className="bar-fill" style={{ width: progress + '%' }} /></div>
        </div>
      )}

      {error && <p className="error">{error}</p>}
      <button className="btn btn-secondary" onClick={onCancel}>Zrušit</button>
    </div>
  )
}
