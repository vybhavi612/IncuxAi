import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../api";

export default function History() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const res = await API.get(`/attendance/history/${user._id}`);
    setData(res.data);
  };

  return (
    <Layout>
      <h1>Attendance History</h1>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Login</th>
            <th>Status</th>
            <th>Late (min)</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              <td>{new Date(item.loginTime).toDateString()}</td>
              <td>{new Date(item.loginTime).toLocaleTimeString()}</td>

              <td style={{
                color: item.status === "LATE" ? "red" : "green"
              }}>
                {item.status}
              </td>

              <td>{item.lateMinutes || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

const styles = {
  table: {
    width: "100%",
    marginTop: "20px",
    background: "white",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
  }
};