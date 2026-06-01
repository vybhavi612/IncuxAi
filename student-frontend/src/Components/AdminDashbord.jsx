import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import {
  FaUsers,
  FaGithub,
  FaTasks,
  FaBell,
  FaChartLine,
  FaSignOutAlt,
  FaUserCheck,
} from "react-icons/fa";

function AdminDashboard() {

  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");

  // STUDENT DATA

  // const students = [

  //   {
  //     id: 1,
  //     name: "Sridhar",
  //     attendance: "Present",
  //     github: "Active",
  //     task: "React Login UI",
  //     hours: 5,
  //     date: "2026-05-29",
  //   },

  //   {
  //     id: 2,
  //     name: "Rahul",
  //     attendance: "Absent",
  //     github: "Inactive",
  //     task: "No Submission",
  //     hours: 0,
  //     date: "2026-05-28",
  //   },

  //   {
  //     id: 3,
  //     name: "Kiran",
  //     attendance: "Present",
  //     github: "Active",
  //     task: "Attendance Module",
  //     hours: 4,
  //     date: "2026-05-29",
  //   },

  //   {
  //     id: 4,
  //     name: "Ajay",
  //     attendance: "Present",
  //     github: "Active",
  //     task: "Backend APIs",
  //     hours: 6,
  //     date: "2026-05-29",
  //   },
  // ];
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  // FILTER
  useEffect(() => {
    fetchStudents();
  }, []);
  
  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/student/students"
      );
  
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };
  const filteredStudents = selectedDate
    ? students.filter(
        (student) => student.date === selectedDate
      )
    : students;

  return (

    <div
      className="min-vh-100 d-flex"
      style={{
        background:
          "linear-gradient(135deg,#0f172a,#1e293b,#312e81)",
      }}
    >

      {/* SIDEBAR */}

      <div
        style={{
          width: "250px",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(10px)",
          color: "white",
        }}
        className="p-4 shadow-lg"
      >

        <h2 className="fw-bold mb-5 text-center">
          Admin Panel
        </h2>

        <div className="d-flex flex-column gap-4">

          <button className="btn btn-dark text-start p-3 rounded-4">
            📊 Dashboard
          </button>

          <button className="btn btn-dark text-start p-3 rounded-4">
            👨‍🎓 Students
          </button>

          <button className="btn btn-dark text-start p-3 rounded-4">
            ✅ Attendance
          </button>

          <button className="btn btn-dark text-start p-3 rounded-4">
            🔥 GitHub Activity
          </button>

          <button className="btn btn-dark text-start p-3 rounded-4">
            📈 Analytics
          </button>

          <button className="btn btn-danger text-start p-3 rounded-4 mt-5">
            <FaSignOutAlt className="me-2" />
            Logout
          </button>

        </div>

      </div>

      {/* MAIN CONTENT */}

      <div className="flex-grow-1">

        {/* NAVBAR */}

        <nav
          className="navbar navbar-dark px-4 py-3"
          style={{
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(10px)",
          }}
        >

          <h3 className="text-white fw-bold">
            Welcome Admin 👋
          </h3>

          <div className="d-flex align-items-center gap-4">

            <FaBell
              size={22}
              color="white"
            />

            <h5 className="text-white mt-2">
              {new Date().toLocaleTimeString()}
            </h5>

          </div>

        </nav>

        <div className="container-fluid py-4 px-4">

          {/* DATE CARD */}

          <div
            className="card border-0 shadow-lg p-4 mb-4"
            style={{
              borderRadius: "20px",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              color: "white",
            }}
          >

            <div className="d-flex justify-content-between">

              <h4>
                📅 Today's Date
              </h4>

              <h5 className="text-info">
                {new Date().toDateString()}
              </h5>

            </div>

          </div>

          {/* SUMMARY CARDS */}

          <div className="row g-4">

            {/* TOTAL STUDENTS */}

            <div className="col-md-3">

              <div
                className="card border-0 shadow-lg p-4 text-white"
                style={{
                  borderRadius: "20px",
                  background:
                    "linear-gradient(135deg,#3b82f6,#2563eb)",
                }}
              >

                <FaUsers size={40} />

                <h5 className="mt-3">
                  Total Students
                </h5>

                <h1>
                  120
                </h1>

              </div>

            </div>

            {/* ATTENDANCE */}

            <div className="col-md-3">

              <div
                className="card border-0 shadow-lg p-4 text-white"
                style={{
                  borderRadius: "20px",
                  background:
                    "linear-gradient(135deg,#22c55e,#15803d)",
                }}
              >

                <FaUserCheck size={40} />

                <h5 className="mt-3">
                  Present
                </h5>

                <h1>
                  95
                </h1>

              </div>

            </div>

            {/* GITHUB */}

            <div className="col-md-3">

              <div
                className="card border-0 shadow-lg p-4 text-white"
                style={{
                  borderRadius: "20px",
                  background:
                    "linear-gradient(135deg,#06b6d4,#0891b2)",
                }}
              >

                <FaGithub size={40} />

                <h5 className="mt-3">
                  GitHub Active
                </h5>

                <h1>
                  80
                </h1>

              </div>

            </div>

            {/* TASKS */}

            <div className="col-md-3">

              <div
                className="card border-0 shadow-lg p-4 text-white"
                style={{
                  borderRadius: "20px",
                  background:
                    "linear-gradient(135deg,#f97316,#ea580c)",
                }}
              >

                <FaTasks size={40} />

                <h5 className="mt-3">
                  Tasks Submitted
                </h5>

                <h1>
                  70
                </h1>

              </div>

            </div>

          </div>

          <div className="row mt-4">

            {/* LEFT SECTION */}

            <div className="col-md-8">

              {/* FILTER */}

              <div
                className="card border-0 shadow-lg p-4"
                style={{
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                }}
              >

                <div className="row align-items-center">

                  <div className="col-md-5">

                    <h3>
                      Filter Records By Date
                    </h3>

                  </div>

                  <div className="col-md-4">

                    <input
                      type="date"
                      className="form-control"
                      value={selectedDate}
                      onChange={(e) =>
                        setSelectedDate(e.target.value)
                      }
                    />

                  </div>

                  <div className="col-md-3">

                    <button
                      className="btn btn-danger w-100"
                      onClick={() => setSelectedDate("")}
                    >
                      Clear Filter
                    </button>

                  </div>

                </div>

              </div>

              {/* TABLE */}

              <div
                className="card border-0 shadow-lg p-4 mt-4"
                style={{
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                }}
              >

                <h2 className="mb-4">
                  Student Activity
                </h2>

                <div className="table-responsive">

                  <table className="table table-dark table-hover align-middle">

                    <thead>

                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Attendance</th>
                        <th>GitHub</th>
                        <th>Hours</th>
                        <th>Task</th>
                        <th>Date</th>
                      </tr>

                    </thead>

                    <tbody>

                      {filteredStudents.map((student,index) => (

                        <tr key={student.id||index}>

                          <td>{student.id}</td>

                          <td>

                            <div className="d-flex align-items-center gap-2">

                              <img
                                src={`https://i.pravatar.cc/40?img=${student.id}`}
                                alt="avatar"
                                className="rounded-circle"
                              />

                              {student.name}

                            </div>

                          </td>

                          <td>

                            <span
                              className={`badge ${
                                student.attendance === "Present"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {student.attendance}
                            </span>

                          </td>

                          <td>

                            <span
                              className={`badge ${
                                student.github === "Active"
                                  ? "bg-info"
                                  : "bg-secondary"
                              }`}
                            >
                              {student.github}
                            </span>

                          </td>

                          <td>

                            <div>

                              <p className="mb-1">
                                {student.hours}h
                              </p>

                              <div className="progress">

                                <div
                                  className="progress-bar bg-success"
                                  style={{
                                    width: `${student.hours * 15}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </td>

                          <td>{student.task}</td>

                          <td>{student.date}</td>
                          console.log(filteredStudents);
                        </tr>
                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* CHART */}

              <div
                className="card border-0 shadow-lg p-4 mt-4"
                style={{
                  borderRadius: "20px",
                  background:
                    "linear-gradient(135deg,#111827,#1e3a8a)",
                  color: "white",
                }}
              >

                <div className="d-flex align-items-center mb-4">

                  <FaChartLine
                    size={28}
                    className="me-3"
                  />

                  <h2>
                    Working Hours Analytics
                  </h2>

                </div>

                <ResponsiveContainer
                  width="100%"
                  height={350}
                >

                  <BarChart data={students}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="hours"
                      fill="#00C49F"
                      radius={[10, 10, 0, 0]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* RIGHT SIDE */}

            <div className="col-md-4">

              {/* CALENDAR */}

              <div
                className="card border-0 shadow-lg p-4"
                style={{
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                }}
              >

                <h3 className="text-center mb-4">
                  Calendar
                </h3>

                <div className="d-flex justify-content-center">

                  <Calendar
                    onChange={setDate}
                    value={date}
                  />

                </div>

              </div>

              {/* SUMMARY */}

              <div
                className="card border-0 shadow-lg p-4 mt-4"
                style={{
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                }}
              >

                <h4 className="mb-4">
                  Today's Summary
                </h4>

                <p>✅ Attendance Updated</p>

                <p>🔥 GitHub Tracking Active</p>

                <p>📝 Tasks Monitoring Enabled</p>

                <p>📊 Productivity Analytics Running</p>

              </div>

              {/* RECENT ACTIVITY */}

              <div
                className="card border-0 shadow-lg p-4 mt-4"
                style={{
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                }}
              >

                <h4 className="mb-4">
                  Recent Activity
                </h4>

                <p>🟢 Sridhar pushed code</p>

                <p>🟢 Kiran updated attendance</p>

                <p>🔴 Rahul absent today</p>

                <p>🟢 Ajay completed backend APIs</p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AdminDashboard;