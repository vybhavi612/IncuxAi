import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const u = await API.get("/admin/users");
    const a = await API.get("/admin/attendance");

    setUsers(u.data);
    setAttendance(a.data);
  };

  return (
    <Layout>
      <h1>Admin Dashboard</h1>

      <h2>Users</h2>
      <div style={styles.grid}>
        {users.map((u, i) => (
          <div key={i} style={styles.card}>
            <h3>{u.name}</h3>
            <p>{u.email}</p>
          </div>
        ))}
      </div>

      <h2>Attendance</h2>
      <div>
        {attendance.map((a, i) => (
          <div key={i} style={styles.log}>
            <p><b>User:</b> {a.userId?.name}</p>
            <p><b>Status:</b> {a.status}</p>
            <p><b>Late:</b> {a.lateMinutes} min</p>
            <p><b>Login:</b> {new Date(a.loginTime).toLocaleString()}</p>
            <p>
  <b>GitHub:</b>{" "}
  {a.githubLink ? (
    <a href={a.githubLink} target="_blank">Open Repo</a>
  ) : (
    "Not submitted"
  )}
</p>
          </div>
          
        ))}
      </div>
    </Layout>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px"
  },
  card: {
    background: "white",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  log: {
    background: "white",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px"
  }
  
};