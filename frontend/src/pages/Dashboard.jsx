import { useState } from "react";

import { motion } from "framer-motion";
import Camera from "../components/Camera";

import API from "../api";

export default function Dashboard() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const [record, setRecord] =
    useState(null);

  const [task, setTask] =
    useState("");

  const [github, setGithub] =
    useState("");

  const [photo, setPhoto] =
    useState("");

  // LOGIN
  const markLogin = async () => {

    try {

      const res = await API.post(
        "/attendance/login-time",
        {
          userId: user._id,
          photo
        }
      );

      setRecord(res.data);

    } catch (err) {

      console.log(
        err.response?.data ||
        err.message
      );
    }
  };

  // LOGOUT
  const markLogout = async () => {

    try {

      const res = await API.post(
        "/attendance/logout",
        {
          userId: user._id
        }
      );

      setRecord(res.data);

    } catch (err) {

      console.log(
        err.response?.data ||
        err.message
      );
    }
  };

  // ADD WORK
  const addProgress = async () => {

    try {

      const res = await API.post(
        "/attendance/add-progress",
        {
          userId: user._id,
          task
        }
      );

      setRecord(res.data);

      setTask("");

    } catch (err) {

      console.log(
        err.response?.data ||
        err.message
      );
    }
  };

  // SUBMIT GITHUB
  const submitGithub = async () => {

    try {

      const res = await API.post(
        "/attendance/add-github",
        {
          userId: user._id,
          githubLink: github
        }
      );

      setRecord(res.data);

      setGithub("");

    } catch (err) {

      console.log(
        err.response?.data ||
        err.message
      );
    }
  };

  // CAMERA
  

  return (

    <div style={styles.page}>

      {/* HEADER */}
      <motion.h1

        initial={{
          opacity: 0,
          y: -30
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        style={styles.heading}
      >

        Welcome {user.name}

      </motion.h1>

      {/* GRID */}
      <div style={styles.grid}>

        {/* LOGIN */}
        <motion.div

          whileHover={{
            scale: 1.03,
            y: -5
          }}

          style={styles.card}
        >

          <h2>Login Attendance</h2>

          <button
            onClick={markLogin}
            style={styles.loginBtn}
          >
            Mark Login
          </button>

        </motion.div>

        {/* LOGOUT */}
        <motion.div

          whileHover={{
            scale: 1.03,
            y: -5
          }}

          style={styles.card}
        >

          <h2>Logout Attendance</h2>

          <button
            onClick={markLogout}
            style={styles.logoutBtn}
          >
            Mark Logout
          </button>

        </motion.div>

        {/* CAMERA */}
<motion.div

  whileHover={{
    scale: 1.03
  }}

  style={styles.card}
>

  <h2>Capture Photo</h2>

  <Camera onCapture={setPhoto} />

  {photo && (

    <img
      src={photo}
      alt="capture"
      style={styles.image}
    />

  )}

</motion.div>
        

        {/* STATUS */}
        <motion.div

          whileHover={{
            scale: 1.03
          }}

          style={styles.card}
        >

          <h2>Status</h2>

          <h1>

            {record?.status || "-"}

          </h1>

          <p>
            Late Minutes:
            {" "}
            {record?.lateMinutes || 0}
          </p>

          <p>
            Total Minutes:
            {" "}
            {Math.floor(
              record?.totalMinutes || 0
            )}
          </p>

        </motion.div>

      </div>

      {/* DETAILS */}
      <motion.div

        initial={{
          opacity: 0,
          y: 30
        }}

        animate={{
          opacity: 1,
          y: 0
        }}

        style={styles.details}
      >

        <h2>
          Daily Work Progress
        </h2>

        <input
          type="text"
          placeholder="What did you work on today?"
          value={task}
          onChange={(e) =>
            setTask(e.target.value)
          }
          style={styles.input}
        />

        <button
          onClick={addProgress}
          style={styles.greenBtn}
        >
          Submit Work
        </button>

        {/* GITHUB */}
        <h2
          style={{
            marginTop: 40
          }}
        >
          GitHub Submission
        </h2>

        <input
          type="text"
          placeholder="Paste GitHub Repository Link"
          value={github}
          onChange={(e) =>
            setGithub(e.target.value)
          }
          style={styles.input}
        />

        <button
          onClick={submitGithub}
          style={styles.purpleBtn}
        >
          Submit GitHub
        </button>

        {/* SHOW GITHUB */}
        {record?.githubLink && (

          <div style={styles.workBox}>

            🔗
            {" "}

            <a
              href={record.githubLink}
              target="_blank"
              rel="noreferrer"
              style={styles.link}
            >
              Open Submitted Repository
            </a>

          </div>

        )}

        {/* WORK LIST */}
        <div
          style={{
            marginTop: 30
          }}
        >

          <h2>
            Work Updates
          </h2>

          {record?.progress?.length >
          0 ? (

            record.progress.map(
              (p, i) => (

                <div
                  key={i}
                  style={styles.workBox}
                >

                  • {p.task}

                </div>

              )
            )

          ) : (

            <p>
              No updates added
            </p>

          )}

        </div>

      </motion.div>

    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#020617,#0f172a,#1e293b)",
    color: "white",
    padding: 30,
    fontFamily: "Poppins"
  },

  heading: {
    fontSize: 42,
    marginBottom: 30,
    fontWeight: "bold",
    background:
      "linear-gradient(90deg,#60a5fa,#a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor:
      "transparent"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24
  },

  card: {
    background:
      "rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    border:
      "1px solid rgba(255,255,255,0.1)",
    borderRadius: 24,
    padding: 28,
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.3)"
  },

  details: {
    marginTop: 40,
    background:
      "rgba(255,255,255,0.08)",
    padding: 30,
    borderRadius: 24,
    backdropFilter: "blur(14px)",
    border:
      "1px solid rgba(255,255,255,0.1)"
  },

  input: {
    width: "100%",
    padding: 16,
    marginTop: 16,
    borderRadius: 14,
    border:
      "1px solid rgba(255,255,255,0.1)",
    background:
      "rgba(255,255,255,0.05)",
    color: "white",
    outline: "none",
    fontSize: 15
  },

  loginBtn: {
    background:
      "linear-gradient(90deg,#2563eb,#3b82f6)",
    color: "white",
    padding: "14px 22px",
    border: "none",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: 16
  },

  logoutBtn: {
    background:
      "linear-gradient(90deg,#dc2626,#ef4444)",
    color: "white",
    padding: "14px 22px",
    border: "none",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: 16
  },

  greenBtn: {
    marginTop: 16,
    background:
      "linear-gradient(90deg,#059669,#10b981)",
    color: "white",
    padding: "14px 22px",
    border: "none",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold"
  },

  purpleBtn: {
    marginTop: 16,
    background:
      "linear-gradient(90deg,#7c3aed,#8b5cf6)",
    color: "white",
    padding: "14px 22px",
    border: "none",
    borderRadius: 14,
    cursor: "pointer",
    fontWeight: "bold"
  },

  image: {
    width: "100%",
    marginTop: 20,
    borderRadius: 18
  },

  workBox: {
    background: "#1e293b",
    padding: 14,
    borderRadius: 14,
    marginTop: 12
  },

  link: {
    color: "#60a5fa",
    textDecoration: "none"
  }
};