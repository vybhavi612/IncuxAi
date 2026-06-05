import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h2 style={{ marginBottom: 30 }}>Attendance</h2>

      <Link style={styles.link} to="/dashboard">Dashboard</Link>
      <Link style={styles.link} to="/history">History</Link>
      <Link style={styles.link} to="/profile">Profile</Link>
      <Link style={styles.link} to="/admin">Admin</Link>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    height: "100vh",
    background: "#111",
    color: "white",
    padding: "20px",
    position: "fixed",
    top: 0,
    left: 0
  },
  link: {
    display: "block",
    color: "white",
    textDecoration: "none",
    margin: "15px 0",
    fontSize: "16px"
  }
};