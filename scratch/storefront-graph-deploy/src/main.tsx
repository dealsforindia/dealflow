import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { RecoveryBoundary } from './components/RecoveryBoundary'
import './mobile.css'
import './premium.css'
import './premium-dark.css'
import './commerce.css'
import './mobile-reference.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoveryBoundary><App /></RecoveryBoundary>
  </React.StrictMode>,
)
