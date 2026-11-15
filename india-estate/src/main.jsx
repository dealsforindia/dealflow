import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Error Handler for Debugging (injected by Agent)
window.onerror = function (message, source, lineno, colno, error) {
    fetch('/api/debug-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'onerror', message, source, lineno, colno, stack: error?.stack })
    }).catch(() => { });
};

window.onunhandledrejection = function (event) {
    fetch('/api/debug-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'unhandledrejection', reason: event.reason?.toString(), stack: event.reason?.stack })
    }).catch(() => { });
};

// Startup Log
fetch('/api/debug-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'info', message: 'Frontend Script Executing' })
}).catch(() => { });

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
