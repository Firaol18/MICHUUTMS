import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@tms/shared/styles/globals.css'
import '@tms/shared/styles/components.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
