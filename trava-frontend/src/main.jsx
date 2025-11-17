/**
 * main.jsx - Application Entry Point
 * 
 * This is the first file that runs when the app loads.
 * Sets up the React app with necessary providers:
 * 
 * - StrictMode: Development warnings and checks
 * - BrowserRouter: URL-based routing (no page reloads)
 * - TripProvider: Global state for trip data
 * 
 * Renders into <div id="root"> in index.html
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TripProvider } from './context/TripContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TripProvider>
        <App />
      </TripProvider>
    </BrowserRouter>
  </StrictMode>,
)
