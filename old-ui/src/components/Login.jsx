import React, { useState, useEffect } from 'react';
import { Lock, Activity } from 'lucide-react';

export default function Login({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Check if already logged in via localStorage
  useEffect(() => {
    const savedPin = localStorage.getItem('dealflow_auth_pin');
    if (savedPin) {
      onLogin(savedPin);
    }
  }, [onLogin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.length >= 4) {
      localStorage.setItem('dealflow_auth_pin', pin);
      onLogin(pin);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-logo-wrap">
          <div className="login-logo">
            <Activity size={24} strokeWidth={2.5} />
          </div>
        </div>
        <h2 className="login-title">DealFlow</h2>
        <p className="login-subtitle">Enter your PIN to access the dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="login-input-wrap">
            <Lock size={16} className="login-input-icon" />
            <input
              type="password"
              autoFocus
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              placeholder="Enter PIN"
              className={`login-input ${error ? 'login-input--error' : ''}`}
            />
          </div>
          <button type="submit" className="login-btn">
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
