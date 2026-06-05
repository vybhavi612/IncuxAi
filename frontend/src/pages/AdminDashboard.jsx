import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import API from "../api";

export default function AdminDashboard() {

  const [records, setRecords] =
    useState([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {

    try {

      const res = await API.get(
        "/admin/attendance"
      );

      setRecords(res.data);

    } catch (err) {

      console.log(
        err.response?.data || err.message
      );
    }
  };

  return (

    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>

        <h1 style={styles.heading}>
          Admin Dashboard
        </h1>

        <p style={styles.subText}>
          Attendance Monitoring System
        </p>

      </div>

      {/* STATS */}
      <div style={styles.statsGrid}>

        <motion.div
          whileHover={{
            scale: 1.03
          }}
          style={styles.statCard}
        >

          <h3 style={styles.whiteText}>
            Total Records
          </h3>

          <h1 style={styles.whiteText}>
            {records.length}
          </h1>

        </motion.div>

        <motion.div
          whileHover={{
            scale: 1.03
          }}
          style={styles.statCard}
        >

          <h3 style={styles.whiteText}>
            Late Employees
          </h3>

          <h1 style={styles.whiteText}>
            {
              records.filter(
                (r) =>
                  r.status === "LATE"
              ).length
            }
          </h1>

        </motion.div>

        <motion.div
          whileHover={{
            scale: 1.03
          }}
          style={styles.statCard}
        >

          <h3 style={styles.whiteText}>
            On Time
          </h3>

          <h1 style={styles.whiteText}>
            {
              records.filter(
                (r) =>
                  r.status === "ON_TIME"
              ).length
            }
          </h1>

        </motion.div>

      </div>

      {/* TABLE */}
      <div style={styles.tableContainer}>

        <table style={styles.table}>

          <thead>

            <tr>

              <th style={styles.th}>
                Name
              </th>

              <th style={styles.th}>
                Email
              </th>

              <th style={styles.th}>
                Login Time
              </th>

              <th style={styles.th}>
                Logout Time
              </th>

              <th style={styles.th}>
                Status
              </th>

              <th style={styles.th}>
                Late Minutes
              </th>

              <th style={styles.th}>
                Total Minutes
              </th>

              <th style={styles.th}>
                GitHub
              </th>

              <th style={styles.th}>
                Work Updates
              </th>

            </tr>

          </thead>

          <tbody>

            {records.map((item) => (

              <motion.tr

                key={item._id}

                style={styles.tr}

                whileHover={{
                  backgroundColor:
                    "rgba(255,255,255,0.04)"
                }}

              >

                {/* NAME */}
                <td style={styles.td}>
                  {item.userId?.name}
                </td>

                {/* EMAIL */}
                <td style={styles.td}>
                  {item.userId?.email}
                </td>

                {/* LOGIN */}
                <td style={styles.td}>

                  {item.loginTime
                    ? new Date(
                        item.loginTime
                      ).toLocaleString()
                    : "-"}

                </td>

                {/* LOGOUT */}
                <td style={styles.td}>

                  {item.logoutTime
                    ? new Date(
                        item.logoutTime
                      ).toLocaleString()
                    : "-"}

                </td>

                {/* STATUS */}
                <td style={styles.td}>

                  <span
                    style={{
                      ...styles.badge,

                      background:
                        item.status === "LATE"
                          ? "#dc2626"
                          : "#059669"
                    }}
                  >

                    {item.status}

                  </span>

                </td>

                {/* LATE */}
                <td style={styles.td}>
                  {item.lateMinutes}
                </td>

                {/* TOTAL */}
                <td style={styles.td}>
                  {Math.floor(
                    item.totalMinutes || 0
                  )}
                </td>

                {/* GITHUB */}
                <td style={styles.td}>

                  {item.githubLink ? (

                    <a
                      href={item.githubLink}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.link}
                    >
                      Open Repo
                    </a>

                  ) : (

                    "No Link"

                  )}

                </td>

                {/* WORK */}
                <td style={styles.td}>

                  {item.progress?.length > 0 ? (

                    item.progress.map(
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

                    "No Updates"

                  )}

                </td>

              </motion.tr>

            ))}

          </tbody>

        </table>

      </div>

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

  header: {
    marginBottom: 30
  },

  heading: {
    fontSize: 42,
    marginBottom: 5,
    color: "white",
    fontWeight: "bold"
  },

  subText: {
    color: "#cbd5e1"
  },

  whiteText: {
    color: "white"
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
    marginBottom: 30
  },

  statCard: {
    background:
      "rgba(255,255,255,0.08)",
    padding: 25,
    borderRadius: 24,
    backdropFilter: "blur(12px)",
    border:
      "1px solid rgba(255,255,255,0.1)",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.3)"
  },

  tableContainer: {
    overflowX: "auto",
    background:
      "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 20,
    backdropFilter: "blur(12px)",
    border:
      "1px solid rgba(255,255,255,0.08)"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "white"
  },

  th: {
    textAlign: "left",
    padding: 16,
    color: "white",
    borderBottom:
      "1px solid rgba(255,255,255,0.1)"
  },

  td: {
    padding: 16,
    color: "white",
    borderBottom:
      "1px solid rgba(255,255,255,0.05)",
    verticalAlign: "top"
  },

  tr: {
    transition: "0.3s"
  },

  badge: {
    padding: "8px 14px",
    borderRadius: 12,
    color: "white",
    fontSize: 13,
    fontWeight: "bold"
  },

  link: {
    color: "#60a5fa",
    textDecoration: "none",
    fontWeight: "bold"
  },

  workBox: {
    background: "#1e293b",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    color: "white"
  }
};