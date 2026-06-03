import React, { useState } from "react";

function AdminDashboard({ attendance }) {
  const [search, setSearch] = useState("");

  const filteredAttendance = attendance.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = attendance.length;

  const presentToday = attendance.filter(
    (item) => item.status === "Present"
  ).length;

  const absentToday = totalUsers - presentToday;

  return (
    <div
      style={{
        marginTop: "30px",
        padding: "25px",
        borderRadius: "20px",
        background: "#ffffff",
        color: "#000",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >
        👨‍💼 Admin Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "#3498db",
            color: "white",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
          }}
        >
          <h2>{totalUsers}</h2>
          <p>Total Users</p>
        </div>

        <div
          style={{
            background: "#2ecc71",
            color: "white",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
          }}
        >
          <h2>{presentToday}</h2>
          <p>Present Today</p>
        </div>

        <div
          style={{
            background: "#e74c3c",
            color: "white",
            padding: "20px",
            borderRadius: "15px",
            textAlign: "center",
          }}
        >
          <h2>{absentToday}</h2>
          <p>Absent Today</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="🔍 Search User"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "25px",
          marginBottom: "20px",
          borderRadius: "10px",
          border: "1px solid #ddd",
        }}
      />

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ background: "#f1f1f1" }}>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Login Time</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredAttendance.length > 0 ? (
            filteredAttendance.map((item, index) => (
              <tr key={index}>
                <td style={tdStyle}>{item.name}</td>
                <td style={tdStyle}>{item.email}</td>
                <td style={tdStyle}>{item.date}</td>
                <td style={tdStyle}>{item.login}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      background: "#2ecc71",
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "8px",
                    }}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                No Attendance Records Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: "12px",
  borderBottom: "2px solid #ddd",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
};

export default AdminDashboard;