import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/app/App.tsx'
import { initializeAuthHttpClient } from '@/features/auth/session/authSession.ts'
import { configureZod } from '@/lib/validation.ts'
import '@/styles/index.css'

configureZod()
initializeAuthHttpClient()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Elemento #root não encontrado no documento.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
