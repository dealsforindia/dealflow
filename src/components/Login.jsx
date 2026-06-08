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
    <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center', background: '#09090b' }}>
      <div style={{ background: '#18181b', padding: '40px', borderRadius: '16px', border: '1px solid #27272a', width: '320px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={24} strokeWidth={2.5} />
          </div>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '600' }}>DealFlow Admin</h2>
        <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#a1a1aa' }}>Enter your PIN to access the dashboard</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
            <input 
              type="password"
              autoFocus
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              placeholder="Enter PIN"
              style={{
                width: '100%',
                background: '#09090b',
                border: `1px solid ${error ? '#ef4444' : '#27272a'}`,
                color: '#fff',
                padding: '12px 12px 12px 36px',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
          <button 
            type="submit"
            style={{
              width: '100%',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#4f46e5'}
            onMouseOut={(e) => e.target.style.background = '#6366f1'}
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
