import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const navigate = useNavigate();
  const [repo, setRepo] = useState('');
  const [assignedRepo, setAssignedRepo] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const users = [
    {
      name: 'swarag',
      loginTime: '09:00 AM',
      logoutTime: '06:00 PM',
      hours: '9hrs',
      commits: 12,
      attendance: {
        startDate: '2025-05-01',
        present: ['2025-05-01','2025-05-02','2025-05-05','2025-05-06','2025-05-07','2025-05-08','2025-05-09','2025-05-12','2025-05-13','2025-05-14','2025-05-15','2025-05-16','2025-05-19','2025-05-20','2025-05-21','2025-05-22','2025-05-23','2025-05-26','2025-04-01','2025-04-02','2025-04-03','2025-04-07','2025-04-08'],
      },
    },
    {
      name: 'vybhavi',
      loginTime: '09:30 AM',
      logoutTime: '06:00 PM',
      hours: '8.5hrs',
      commits: 8,
      attendance: {
        startDate: '2025-05-01',
        present: ['2025-05-01','2025-05-02','2025-05-05','2025-05-06','2025-05-07','2025-05-08','2025-05-12','2025-05-13','2025-05-14','2025-05-19','2025-05-20','2025-05-21','2025-04-01','2025-04-03','2025-04-07'],
      },
    },
    {
      name: 'ravi',
      loginTime: '10:00 AM',
      logoutTime: '06:30 PM',
      hours: '8.5hrs',
      commits: 5,
      attendance: {
        startDate: '2025-05-01',
        present: ['2025-05-01','2025-05-05','2025-05-06','2025-05-07','2025-05-08','2025-05-09','2025-05-12','2025-05-13','2025-04-02','2025-04-04','2025-04-08'],
      },
    },
  ];

  const handleAssign = () => {
    if (repo.trim()) {
      setAssignedRepo(repo.trim());
      setRepo('');
    }
  };

  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);

  const CalendarModal = ({ user, onClose }) => {
    const now = new Date();
    const [calMonth, setCalMonth] = useState(now.getMonth());
    const [calYear, setCalYear] = useState(now.getFullYear());

    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const firstDay = new Date(calYear, calMonth, 1).getDay();

    const presentDays = user.attendance.present
      .filter(d => {
        const date = new Date(d);
        return date.getMonth() === calMonth && date.getFullYear() === calYear;
      })
      .map(d => new Date(d).getDate());

    const totalPresent = user.attendance.present.filter(d => {
      const date = new Date(d);
      return date.getMonth() === calMonth && date.getFullYear() === calYear;
    }).length;

    const selectStyle = {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: '8px 12px',
      color: '#fff',
      fontSize: '13px',
      fontFamily: 'inherit',
      outline: 'none',
      cursor: 'pointer',
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        backdropFilter: 'blur(4px)',
      }}>
        <div style={{
          background: '#0f0f1a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '40px',
          width: '480px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}>

          {/* Modal Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <div>
              <h2 style={{
                color: '#fff',
                fontSize: '18px',
                fontWeight: '400',
                margin: '0 0 4px',
              }}>{user.name}'s Attendance</h2>
              <p style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: '12px',
                margin: 0,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>{totalPresent} days present this month</p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.5)',
                padding: '8px 14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '13px',
              }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}
            >
              ✕ Close
            </button>
          </div>

          {/* Month + Year Dropdowns */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
          }}>
            <select
              value={calMonth}
              onChange={e => setCalMonth(Number(e.target.value))}
              style={selectStyle}
            >
              {months.map((m, i) => (
                <option key={m} value={i} style={{ background: '#0f0f1a' }}>{m}</option>
              ))}
            </select>

            <select
              value={calYear}
              onChange={e => setCalYear(Number(e.target.value))}
              style={selectStyle}
            >
              {years.map(y => (
                <option key={y} value={y} style={{ background: '#0f0f1a' }}>{y}</option>
              ))}
            </select>
          </div>

          {/* Day labels */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
            marginBottom: '8px',
          }}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.25)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                padding: '4px 0',
              }}>{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
          }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isPresent = presentDays.includes(day);
              const isToday = day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();

              return (
                <div key={day} style={{
                  aspectRatio: '1',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: isToday ? '600' : '400',
                  background: isPresent
                    ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                    : 'rgba(255,255,255,0.03)',
                  border: isToday
                    ? '1px solid rgba(99,102,241,0.6)'
                    : '1px solid rgba(255,255,255,0.05)',
                  color: isPresent ? '#fff' : 'rgba(255,255,255,0.2)',
                }}>
                  {day}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginTop: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '3px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              }} />
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>Present</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '3px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
              }} />
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>Absent</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      fontFamily: "'Georgia', serif",
      position: 'relative',
      overflow: 'hidden',
      padding: '40px',
    }}>

      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        top: '10%',
        left: '20%',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
        bottom: '20%',
        right: '15%',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '40px',
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
              }}>Admin Dashboard</h1>
              <p style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                margin: 0,
              }}>IncuxAi Attendance</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
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

        {/* Assign Repo */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px',
          padding: '30px',
          marginBottom: '24px',
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '12px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            margin: '0 0 16px',
          }}>Assign GitHub Repo to All Users</p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="e.g. vybhavi612/IncuxAi"
              value={repo}
              onChange={e => setRepo(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              onClick={handleAssign}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '14px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => e.target.style.opacity = '0.85'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              Assign
            </button>
          </div>

          {assignedRepo && (
            <p style={{
              color: 'rgba(99,102,241,0.8)',
              fontSize: '13px',
              margin: '12px 0 0',
            }}>
              ✓ Currently assigned: <strong>{assignedRepo}</strong>
            </p>
          )}
        </div>

        {/* Users Table */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px',
          padding: '30px',
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: '12px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            margin: '0 0 24px',
          }}>All Users</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1.5fr',
            gap: '12px',
            marginBottom: '12px',
            padding: '0 16px',
          }}>
            {['Name', 'Login Time', 'Logout Time', 'Hours', 'Commits', 'Attendance'].map(col => (
              <p key={col} style={{
                color: 'rgba(255,255,255,0.25)',
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                margin: 0,
              }}>{col}</p>
            ))}
          </div>

          <div style={{
            height: '1px',
            background: 'rgba(255,255,255,0.06)',
            marginBottom: '12px',
          }} />

          {users.map((user, index) => (
            <div key={index} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1.5fr',
              gap: '12px',
              padding: '16px',
              borderRadius: '10px',
              marginBottom: '4px',
              background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              alignItems: 'center',
            }}>
              <p style={{ color: '#fff', fontSize: '14px', margin: 0 }}>{user.name}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>{user.loginTime}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>{user.logoutTime}</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>{user.hours}</p>
              <p style={{
                fontSize: '14px',
                margin: 0,
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '600',
              }}>{user.commits}</p>
              <button
                onClick={() => setSelectedUser(user)}
                style={{
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.color = '#fff'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.color = 'rgba(255,255,255,0.5)'; }}
              >
                View Calendar
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedUser && (
        <CalendarModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

export default Admin;