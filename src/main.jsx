import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { getAppRoute } from './appRoute.js'

const route = getAppRoute(window.location.pathname)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App route={route} />
  </StrictMode>,
)
