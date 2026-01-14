import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { DarkModeProvider } from './contexts/DarkModeContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <DarkModeProvider>
    <App />
  </DarkModeProvider>
)