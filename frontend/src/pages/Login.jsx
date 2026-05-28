import React from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

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

        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            borderRadius: '14px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
          }}>⏱</div>
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

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <button
            onClick={() => navigate('/dashboard')}
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
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            User Login
          </button>

          <button
            onClick={() => navigate('/admin')}
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
              transition: 'opacity 0.2s',
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
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.color = '#fff'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;