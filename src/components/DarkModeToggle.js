import React from "react";

function DarkModeToggle({ darkMode, setDarkMode }) {
  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      style={{
        marginTop: "20px",
        width: "100%",
        padding: "12px",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
        transition: "0.3s",
        background: darkMode ? "#f1c40f" : "#2c3e50",
        color: darkMode ? "#000" : "#fff",
      }}
    >
      {darkMode
        ? "☀ Switch to Light Mode"
        : "🌙 Switch to Dark Mode"}
    </button>
  );
}

export default DarkModeToggle;