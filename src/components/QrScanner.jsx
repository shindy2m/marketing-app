import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

// Skenuje QR kód z kamery a vrací načtený text přes onResult.
export default function QrScanner({ onResult, onCancel }) {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    let active = true

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result, err, controls) => {
        if (!active) return
        controlsRef.current = controls
        if (result) {
          controls.stop()
          onResult(result.getText())
        }
      })
      .catch((e) => setError('Nelze spustit kameru: ' + e.message))

    return () => {
      active = false
      if (controlsRef.current) controlsRef.current.stop()
    }
  }, [onResult])

  return (
    <div className="scanner">
      <video ref={videoRef} className="scanner-video" />
      <div className="scanner-overlay">
        <div className="scanner-frame" />
        <p>Namiř kameru na QR kód</p>
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn btn-secondary" onClick={onCancel}>Zrušit</button>
    </div>
  )
}
