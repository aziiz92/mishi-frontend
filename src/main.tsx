import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { alignHeroDotTarget } from './dot/state.ts'
import { legalPageFromPath } from './legal/routes.ts'

// Before React: pin the CSS drop target to the MEASURED mark position (the
// shell hero is already in the DOM), so the falling dot lands exactly where
// the journey takes over — no visible re-alignment. Re-run on load in case
// late layout (fonts) moved anything.
if (legalPageFromPath(window.location.pathname)) {
  document.documentElement.classList.add('legal-page')
} else {
  alignHeroDotTarget()
  window.addEventListener('load', alignHeroDotTarget)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
