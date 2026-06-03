import React, { useState } from "react";

function AttendanceTable({ attendance }) {
const [search, setSearch] = useState("");

const filteredData = attendance.filter(
(item) =>
item.name?.toLowerCase().includes(search.toLowerCase()) ||
item.email?.toLowerCase().includes(search.toLowerCase())
);

return (
<div
style={{
marginTop: "30px",
background: "#ffffff",
padding: "20px",
borderRadius: "15px",
color: "#000",
boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
}}
>
<h2 style={{ marginBottom: "15px" }}>
📋 Attendance Records </h2>

```
  <input
    type="text"
    placeholder="🔍 Search by Name or Email"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      width: "100%",
      padding: "12px",
      marginBottom: "20px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      outline: "none",
    }}
  />

  <table
    style={{
      width: "100%",
      borderCollapse: "collapse",
    }}
  >
    <thead>
      <tr style={{ background: "#3498db", color: "white" }}>
        <th style={{ padding: "12px" }}>Name</th>
        <th style={{ padding: "12px" }}>Email</th>
        <th style={{ padding: "12px" }}>Date</th>
        <th style={{ padding: "12px" }}>Login Time</th>
        <th style={{ padding: "12px" }}>Status</th>
      </tr>
    </thead>

    <tbody>
      {filteredData.length > 0 ? (
        filteredData.map((item, index) => (
          <tr
            key={index}
            style={{
              textAlign: "center",
              borderBottom: "1px solid #ddd",
            }}
          >
            <td style={{ padding: "10px" }}>{item.name}</td>
            <td style={{ padding: "10px" }}>{item.email}</td>
            <td style={{ padding: "10px" }}>{item.date}</td>
            <td style={{ padding: "10px" }}>{item.login}</td>
            <td
              style={{
                padding: "10px",
                color: "green",
                fontWeight: "bold",
              }}
            >
              {item.status}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan="5"
            style={{
              textAlign: "center",
              padding: "20px",
            }}
          >
            No Attendance Records Found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

);
}

export default AttendanceTable;
