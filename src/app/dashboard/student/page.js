"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login?role=student");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "student") {
      router.push("/login?role=student");
      return;
    }
    if (!parsedUser.faceData) {
      router.push("/onboarding");
      return;
    }
    setUser(parsedUser);
    fetchRecords(parsedUser.id);
  }, [router]);

  const fetchRecords = async (userId) => {
    try {
      const res = await fetch(`/api/attendance/student?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) return <div style={{ textAlign: 'center', marginTop: '20vh' }}>Loading...</div>;

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Student Dashboard</h2>
        <button className="btn glass-panel" style={{ padding: '0.5rem 1rem' }} onClick={handleLogout}>Logout</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Profile Card */}
        <section className="glass-panel">
          <h3 className="mb-4 text-center">My Profile</h3>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <img 
              src={user.faceData} 
              alt="Profile" 
              style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--accent-color)' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>ID:</strong> #{user.id}</p>
          </div>
        </section>

        {/* Attendance Records */}
        <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="mb-4">Attendance Log</h3>
          {loading ? (
            <p>Loading records...</p>
          ) : records.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No attendance records found yet.</p>
          ) : (
            <div style={{ overflowY: 'auto', flex: 1, maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {records.map(record => (
                <div key={record.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className={record.type === 'entry' ? 'badge badge-success' : 'badge badge-danger'}>
                      {record.type.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {new Date(record.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
