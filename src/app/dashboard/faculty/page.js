"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function FacultyDashboard() {
  const router = useRouter();
  const [faculty, setFaculty] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login?role=faculty");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "faculty") {
      router.push("/login?role=faculty");
      return;
    }
    setFaculty(parsedUser);
    fetchData(parsedUser.id);
  }, [router]);

  const fetchData = async (facultyId) => {
    try {
      const res = await fetch(`/api/attendance/faculty?facultyId=${facultyId}`);
      if (res.ok) {
        const data = await res.json();
        setStudentsData(data.students);
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

  if (!faculty) return <div style={{ textAlign: 'center', marginTop: '20vh' }}>Loading...</div>;

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Faculty Dashboard</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Welcome, {faculty.name}</span>
          <button className="btn glass-panel" style={{ padding: '0.5rem 1rem' }} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section className="glass-panel">
        <h3 className="mb-4">Student Attendance Overview</h3>
        
        {loading ? (
          <p>Loading data...</p>
        ) : studentsData.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No students registered yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {studentsData.map(student => {
              const lastRecord = student.records[0];
              const isPresent = lastRecord && lastRecord.type === 'entry';
              
              return (
                <div key={student.id} style={{ display: 'flex', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', alignItems: 'center' }}>
                  <div>
                    {student.faceData ? (
                      <img src={student.faceData} alt={student.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Photo</div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{student.name}</h4>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{student.email} | {student.phone}</span>
                    <div style={{ marginTop: '0.5rem' }}>
                      Status: <span className={isPresent ? 'badge badge-success' : 'badge badge-danger'}>
                        {isPresent ? 'In Class' : 'Absent / Left'}
                      </span>
                    </div>
                  </div>

                  <div style={{ flex: 1, maxHeight: '120px', overflowY: 'auto', background: 'var(--bg-color)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Recent Activity</div>
                    {student.records.length > 0 ? student.records.slice(0, 5).map(record => (
                      <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', padding: '0.25rem 0' }}>
                        <span style={{ color: record.type === 'entry' ? 'var(--success-color)' : 'var(--danger-color)' }}>
                          {record.type.toUpperCase()}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {new Date(record.timestamp).toLocaleString()}
                        </span>
                      </div>
                    )) : (
                      <div style={{ color: 'var(--text-secondary)' }}>No records</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
