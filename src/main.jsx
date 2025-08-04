import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ManusSite from './ManusSite.jsx'

const path = window.location.pathname
const RootComponent = path.startsWith('/manus') ? ManusSite : App

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootComponent />
  </React.StrictMode>
)
