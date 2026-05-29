import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [view, setView] = useState('landing'); // 'landing', 'user', 'admin'
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (view === 'user') {
      navigate('/dashboard');
    } else if (view === 'admin') {
      navigate('/admin');
    }
  };

  const Logo = () => (
    <div style={{
      width: '50px',
      height: '50px',
      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
      borderRadius: '14px',
      margin: '0 auto 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    </div>
  );

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Georgia', serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        top: '10%',
        left: '20%',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
        bottom: '20%',
        right: '15%',
        borderRadius: '50%',
      }} />

      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '60px 50px',
        width: '380px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* LANDING VIEW */}
        {view === 'landing' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <Logo />
              <h1 style={{
                color: '#ffffff',
                fontSize: '26px',
                fontWeight: '400',
                letterSpacing: '0.05em',
                margin: '0 0 8px',
              }}>IncuxAi</h1>
              <p style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: '13px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                margin: 0,
              }}>Attendance Tracker</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <button
                onClick={() => setView('user')}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => e.target.style.opacity = '0.85'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >
                User Login
              </button>

              <button
                onClick={() => setView('admin')}
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => e.target.style.opacity = '0.85'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >
                Admin Login
              </button>

              <button
                onClick={() => navigate('/register')}
                style={{
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.color = '#fff'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                Register
              </button>
            </div>
          </>
        )}

        {/* USER / ADMIN LOGIN FORM */}
        {(view === 'user' || view === 'admin') && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <Logo />
              <h1 style={{
                color: '#ffffff',
                fontSize: '22px',
                fontWeight: '400',
                letterSpacing: '0.05em',
                margin: '0 0 8px',
              }}>{view === 'user' ? 'User Login' : 'Admin Login'}</h1>
              <p style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: '13px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                margin: 0,
              }}>IncuxAi Attendance</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                style={inputStyle}
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                style={inputStyle}
              />

              <button
                onClick={handleSubmit}
                style={{
                  background: view === 'user'
                    ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                    : 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '14px',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  marginTop: '6px',
                }}
                onMouseEnter={e => e.target.style.opacity = '0.85'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >
                Login
              </button>

              <p
                onClick={() => setView('landing')}
                style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '13px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  margin: '4px 0 0',
                }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}
              >
                ← Back
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Login;