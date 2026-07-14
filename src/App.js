```jsx
import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Charts from "./components/Charts";
import AttendanceTable from "./components/AttendanceTable";
import DarkModeToggle from "./components/DarkModeToggle";
import AdminDashboard from "./pages/AdminDashboard";
import { auth } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [user, setUser] = useState({
    fullName: "",
    phone: "",
    department: "",
    studentId: "",
    email: "",
    password: "",
  });

  const [attendance, setAttendance] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      alert("✅ Registered Successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      const now = new Date();

      const newAttendance = {
        name: user.fullName,
        email: user.email,
        date: now.toLocaleDateString(),
        login: now.toLocaleTimeString(),
        status: "Present",
      };

      setAttendance((prev) => [...prev, newAttendance]);

      if (user.email === "admin@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      setIsLoggedIn(true);

      alert("✅ Login Successful");
    } catch (error) {
      alert(error.message);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    alert("👋 Logout Successful");
  };

  const forgotPassword = async () => {
    if (!user.email) {
      alert("Enter Email First");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, user.email);
      alert("📧 Password Reset Email Sent");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div
      style={{
        background: darkMode
          ? "linear-gradient(to right, #141e30, #243b55)"
          : "#f4f4f4",
        minHeight: "100vh",
        padding: "20px",
        color: darkMode ? "white" : "black",
      }}
    >
      <Navbar />

      {!isLoggedIn ? (
        <div
          style={{
            maxWidth: "650px",
            margin: "auto",
            background: darkMode
              ? "rgba(255,255,255,0.08)"
              : "#ffffff",
            padding: "35px",
            borderRadius: "25px",
          }}
        >
          <h1 style={{ textAlign: "center" }}>
            Smart Attendance System
          </h1>

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            style={inputStyle}
          />

          <div style={{ marginTop: "20px" }}>
            <button style={greenBtn} onClick={register}>
              Register
            </button>

            <button style={blueBtn} onClick={login}>
              Login
            </button>
          </div>

          <p
            onClick={forgotPassword}
            style={{
              cursor: "pointer",
              textAlign: "center",
              marginTop: "15px",
            }}
          >
            Forgot Password?
          </p>

          <DarkModeToggle
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />
        </div>
      ) : (
        <>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <button style={redBtn} onClick={logout}>
              Logout
            </button>
          </div>

          {isAdmin ? (
            <AdminDashboard attendance={attendance} />
          ) : (
            <AttendanceTable attendance={attendance} />
          )}

          <Charts attendance={attendance} />
        </>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  borderRadius: "10px",
  border: "1px solid #ccc",
};

const greenBtn = {
  background: "#2ecc71",
  color: "white",
  border: "none",
  padding: "10px 15px",
  marginRight: "10px",
  borderRadius: "10px",
};

const blueBtn = {
  background: "#3498db",
  color: "white",
  border: "none",
  padding: "10px 15px",
  borderRadius: "10px",
};

const redBtn = {
  background: "#e74c3c",
  color: "white",
  border: "none",
  padding: "10px 15px",
  borderRadius: "10px",
};

export default App;
```
