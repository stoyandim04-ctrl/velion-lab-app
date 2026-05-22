import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'
import { configureStatusBar, hideSplash, isNative } from './lib/capacitor.js'

if (isNative()) {
  configureStatusBar()
  // Give the cinematic intro ~1.2s before we drop the native splash.
  setTimeout(() => { hideSplash() }, 1200)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
