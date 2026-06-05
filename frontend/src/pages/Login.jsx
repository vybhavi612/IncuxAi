import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";

import API from "../api";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const res = await API.post(
        "/auth/login",
        {
          email,
          password
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      if (
        res.data.user.role === "admin"
      ) {

        navigate("/admin");

      } else {

        navigate("/dashboard");
      }

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Login Failed"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div style={styles.page}>

      {/* ANIMATED BACKGROUND */}
      <div style={styles.bg1}></div>

      <div style={styles.bg2}></div>

      <div style={styles.bg3}></div>

      {/* CARD */}
      <motion.div

        initial={{
          opacity: 0,
          y: 50,
          scale: 0.9
        }}

        animate={{
          opacity: 1,
          y: 0,
          scale: 1
        }}

        transition={{
          duration: 0.7
        }}

        style={styles.card}
      >

        {/* LOGO */}
        <motion.div

          animate={{
            rotate: [0, 5, -5, 0]
          }}

          transition={{
            duration: 5,
            repeat: Infinity
          }}

          style={styles.logo}
        >
          ⚡
        </motion.div>

        <h1 style={styles.title}>
          AttendancePro
        </h1>

        <p style={styles.subtitle}>
          AI Powered Attendance Management
        </p>

        {/* FORM */}
        <form
          onSubmit={handleLogin}
          style={styles.form}
        >

          {/* EMAIL */}
          <motion.input

            whileFocus={{
              scale: 1.03
            }}

            type="email"

            placeholder="Enter Email"

            value={email}

            onChange={(e) =>
              setEmail(e.target.value)
            }

            style={styles.input}

            required
          />

          {/* PASSWORD */}
          <motion.input

            whileFocus={{
              scale: 1.03
            }}

            type="password"

            placeholder="Enter Password"

            value={password}

            onChange={(e) =>
              setPassword(e.target.value)
            }

            style={styles.input}

            required
          />

          {/* BUTTON */}
          <motion.button

            whileHover={{
              scale: 1.05
            }}

            whileTap={{
              scale: 0.95
            }}

            type="submit"

            style={styles.button}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </motion.button>

        </form>

      </motion.div>

    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#020617,#0f172a,#1e293b)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    fontFamily: "Poppins"
  },

  bg1: {
    position: "absolute",
    width: 500,
    height: 500,
    background: "#2563eb",
    borderRadius: "50%",
    filter: "blur(140px)",
    top: -150,
    left: -100,
    opacity: 0.4,
    animation:
      "float 10s ease-in-out infinite"
  },

  bg2: {
    position: "absolute",
    width: 400,
    height: 400,
    background: "#7c3aed",
    borderRadius: "50%",
    filter: "blur(120px)",
    bottom: -120,
    right: -80,
    opacity: 0.4,
    animation:
      "float 12s ease-in-out infinite"
  },

  bg3: {
    position: "absolute",
    width: 250,
    height: 250,
    background: "#06b6d4",
    borderRadius: "50%",
    filter: "blur(100px)",
    top: "40%",
    left: "60%",
    opacity: 0.3,
    animation:
      "float 8s ease-in-out infinite"
  },

  card: {
    width: 420,
    padding: 45,
    borderRadius: 35,
    background:
      "rgba(255,255,255,0.08)",
    backdropFilter: "blur(18px)",
    border:
      "1px solid rgba(255,255,255,0.1)",
    boxShadow:
      "0 10px 40px rgba(0,0,0,0.4)",
    zIndex: 10
  },

  logo: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background:
      "linear-gradient(135deg,#2563eb,#7c3aed)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 35,
    margin: "0 auto 20px auto",
    color: "white",
    boxShadow:
      "0 0 30px rgba(37,99,235,0.5)"
  },

  title: {
    color: "white",
    textAlign: "center",
    fontSize: 42,
    marginBottom: 10
  },

  subtitle: {
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 35
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 22
  },

  input: {
    padding: 18,
    borderRadius: 16,
    border:
      "1px solid rgba(255,255,255,0.1)",
    background:
      "rgba(255,255,255,0.06)",
    color: "white",
    fontSize: 15,
    outline: "none",
    transition: "0.3s"
  },

  button: {
    padding: 18,
    borderRadius: 16,
    border: "none",
    background:
      "linear-gradient(90deg,#2563eb,#7c3aed)",
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: 10,
    boxShadow:
      "0 6px 20px rgba(37,99,235,0.4)"
  }
};