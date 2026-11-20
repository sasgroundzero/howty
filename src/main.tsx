import React from 'react'
import ReactDOM from 'react-dom/client'
import { inject } from '@vercel/analytics'
import App from './App'
import { Embed } from './ui/Embed'
import { CATALOG } from './data/games/catalog'
import { loadGame } from './data/games/load'
import { dailyPuzzle } from './ui/me'
import './index.css'

/**
 * Fetch the game this page is about (and Catan, the home page's table) before starting, so the app opens
 * straight onto it. Until then the page shows its pre-written guide text, so nothing is blank.
 */
const path = window.location.pathname
const embed = path.match(/^\/embed\/([\w-]+)\/?$/)?.[1]
const id = embed ?? path.match(/^\/g\/([\w-]+)\/?$/)?.[1] ?? new URLSearchParams(window.location.search).get('game')
const first = /^\/daily\/?$/.test(path) ? dailyPuzzle(CATALOG).answer.id : id && CATALOG.some((g) => g.id === id) ? id : null

// Anonymous page counts (Vercel Web Analytics: no cookies, no personal data). Built site only.
if (import.meta.env.PROD) inject({ mode: 'production' })

// Offline support: only in the built site, so local development always shows fresh code
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js').catch(() => undefined))
}

// an embedded guide only needs its own game
Promise.all([!embed && loadGame('catan'), first && loadGame(first)]).finally(() =>
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>{embed ? <Embed id={embed} /> : <App />}</React.StrictMode>,
  ),
)
