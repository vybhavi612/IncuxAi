import React from "react";

function Navbar() {
  const today = new Date().toLocaleDateString();

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        padding: "15px 25px",
        borderRadius: "15px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
      }}
    >
      <div>
        <h2 style={{ margin: 0 }}>
          🚀 Smart Attendance System
        </h2>

        <small
          style={{
            opacity: 0.8,
          }}
        >
          📅 {today}
        </small>
      </div>

      <div
        style={{
          background: "#2ecc71",
          color: "white",
          padding: "8px 15px",
          borderRadius: "20px",
          fontWeight: "bold",
        }}
      >
        👨‍💼 Admin Panel
      </div>
    </div>
  );
}

export default Navbar;