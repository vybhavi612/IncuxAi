"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "student";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("user", JSON.stringify(data.user));

      if (role === "student") {
        if (!data.user.faceData) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard/student");
        }
      } else {
        router.push("/dashboard/faculty");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="mb-2 text-center" style={{ textTransform: 'capitalize' }}>{role} Login</h2>
      <p className="mb-8 text-center" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        {role === 'student' ? 'Enter your details to access your portal' : 'Faculty access portal'}
      </p>

      {error && <div className="badge badge-danger mb-4" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <input 
            className="form-input" 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input 
            className="form-input" 
            type="email" 
            id="email" 
            name="email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </div>
        {role === 'student' && (
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Mobile Number</label>
            <input 
              className="form-input" 
              type="tel" 
              id="phone" 
              name="phone" 
              value={formData.phone}
              onChange={handleChange}
              required 
            />
          </div>
        )}
        <button type="submit" className="btn btn-primary mt-4" style={{ width: '100%' }} disabled={loading}>
          {loading ? "Processing..." : "Login / Register"}
        </button>
      </form>
    </>
  );
}

export default function Login() {
  return (
    <main className="container" style={{ marginTop: '10vh' }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
