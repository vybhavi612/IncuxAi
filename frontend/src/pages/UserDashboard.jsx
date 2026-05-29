import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(0);
  const [loginTime] = useState(new Date());
  const [commitCount] = useState(0); // will come from backend later

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleLogout = () => {
    navigate('/');
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

      {/* Main Card */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '50px',
        width: '700px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '50px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <h1 style={{
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '400',
                letterSpacing: '0.05em',
                margin: 0,
              }}>Welcome back</h1>
              <p style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                margin: 0,
              }}>Session Active</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              padding: '10px 24px',
              fontSize: '13px',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.color = '#fff'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            Logout
          </button>
        </div>

        {/* Two columns — Timer + Commits */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
        }}>

          {/* Timer Card */}
          <div style={{
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '18px',
            padding: '36px',
            textAlign: 'center',
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: '12px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              margin: '0 0 20px',
            }}>Session Time</p>

            <div style={{
              fontSize: '42px',
              fontWeight: '300',
              letterSpacing: '0.05em',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 20px',
            }}>
              {formatTime(seconds)}
            </div>

            <p style={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: '12px',
              margin: 0,
            }}>
              Logged in at {loginTime.toLocaleTimeString()}
            </p>
          </div>

          {/* Commits Card */}
          <div style={{
            background: 'rgba(168,85,247,0.08)',
            border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: '18px',
            padding: '36px',
            textAlign: 'center',
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: '12px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              margin: '0 0 20px',
            }}>Git Commits</p>

            <div style={{
              fontSize: '62px',
              fontWeight: '300',
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 20px',
            }}>
              {commitCount}
            </div>

            <p style={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: '12px',
              margin: 0,
            }}>
              Repo assigned by admin
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserDashboard;