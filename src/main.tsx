import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply saved dashboard theme before first paint to avoid flash
;(function () {
  const saved = localStorage.getItem('nyra-theme-pref') as 'default' | 'light' | 'dark' | null
  if (saved === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (saved === 'light') {
    document.documentElement.classList.remove('dark')
  } else {
    // 'default' or no pref, follow system
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  }
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
