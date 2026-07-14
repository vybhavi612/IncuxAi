```jsx
import React from "react";

function Charts({ attendance }) {
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
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(10px)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "25px",
        }}
      >
        📊 Analytics Dashboard
      </h2>

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
            padding: "25px",
            borderRadius: "15px",
            textAlign: "center",
          }}
        >
          <h1>{totalUsers}</h1>
          <p>Total Users</p>
        </div>

        <div
          style={{
            background: "#2ecc71",
            padding: "25px",
            borderRadius: "15px",
            textAlign: "center",
          }}
        >
          <h1>{presentToday}</h1>
          <p>Present Today</p>
        </div>

        <div
          style={{
            background: "#e74c3c",
            padding: "25px",
            borderRadius: "15px",
            textAlign: "center",
          }}
        >
          <h1>{absentToday}</h1>
          <p>Absent Today</p>
        </div>

        <div
          style={{
            background: "#9b59b6",
            padding: "25px",
            borderRadius: "15px",
            textAlign: "center",
          }}
        >
          <h1>100%</h1>
          <p>System Active</p>
        </div>
      </div>
    </div>
  );
}

export default Charts;
```
