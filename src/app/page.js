import Link from "next/link";

export default function Home() {
  return (
    <main className="container text-center" style={{ marginTop: '10vh' }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="mb-4" style={{ fontSize: '2.5rem', color: 'var(--accent-color)' }}>Smart Attendance Portal</h1>
        <p className="mb-8" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          Seamless attendance tracking with facial recognition and IoT integration.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <Link href="/login?role=student" className="btn btn-primary">
            Student Login
          </Link>
          <Link href="/login?role=faculty" className="btn glass-panel" style={{ padding: '0.75rem 1.5rem' }}>
            Faculty Login
          </Link>
        </div>
      </div>
    </main>
  );
}
