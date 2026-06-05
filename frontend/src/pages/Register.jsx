import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    photo: null,
  });

  const handleChange = (e) => {
    if (e.target.name === 'photo') {
      setForm({ ...form, photo: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async () => {
    if (!form.username || !form.password || !form.photo) {
      alert('Please fill all fields and upload a photo!');
      return;
    }

    try {
      await API.post('/auth/register', {
        username: form.username,
        password: form.password,
        photo_url: form.photo.name,
      });

      alert('Registered successfully!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
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

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
          <h1 style={{
            color: '#ffffff',
            fontSize: '22px',
            fontWeight: '400',
            letterSpacing: '0.05em',
            margin: '0 0 8px',
          }}>Create Account</h1>
          <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '13px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            margin: 0,
          }}>Register</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '14px 16px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '14px 16px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />

          <div style={{
            border: '1px dashed rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: '13px',
              margin: '0 0 10px',
            }}>Profile Photo</p>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}
            />
          </div>

          <button
            onClick={handleSubmit}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
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
            Register
          </button>

          <p
            onClick={() => navigate('/')}
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
            Already have an account? Login
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;