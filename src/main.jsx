import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// Požádej prohlížeč o trvalé úložiště, ať data nezmizí (best-effort).
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persisted().then((already) => {
    if (!already) navigator.storage.persist()
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
