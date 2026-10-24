import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { polyfillCountryFlagEmojis } from 'country-flag-emoji-polyfill'
import flagFontUrl from 'country-flag-emoji-polyfill/dist/TwemojiCountryFlags.woff2?url'
import '@fontsource-variable/schibsted-grotesk'
import './styles/global.css'
import App from './App.tsx'

// Windows does not render flag emojis; load a self-hosted flag font only where needed.
polyfillCountryFlagEmojis('Twemoji Country Flags', flagFontUrl)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
