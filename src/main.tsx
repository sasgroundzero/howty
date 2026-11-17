import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CATALOG } from './data/games/catalog'
import { loadGame } from './data/games/load'
import { dailyPuzzle } from './ui/me'
import './index.css'

/**
 * Fetch the game this page is about (and Catan, the home page's table) before starting, so the app opens
 * straight onto it. Until then the page shows its pre-written guide text, so nothing is blank.
 */
const path = window.location.pathname
const id = path.match(/^\/g\/([\w-]+)\/?$/)?.[1] ?? new URLSearchParams(window.location.search).get('game')
const first = /^\/daily\/?$/.test(path) ? dailyPuzzle(CATALOG).answer.id : id && CATALOG.some((g) => g.id === id) ? id : null

Promise.all([loadGame('catan'), first && loadGame(first)]).finally(() =>
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  ),
)
