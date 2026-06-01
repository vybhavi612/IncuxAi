import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
function StudentDashboard() {
    const [githubUrl, setGithubUrl] = useState("");
const [loading, setLoading] = useState(false);
const [status, setStatus] = useState("");
const [task, setTask] = useState("");
const [tasks, setTasks] = useState([]);
const [date, setDate] = useState(new Date());
const [pushcount,setPushCount]=useState(0);
const [profilePic, setProfilePic] = useState(
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
);
const checkGithubActivity = async () => {
  try {
    setLoading(true);

    const response = await axios.get(
      `http://localhost:8081/github/check/${githubUrl}`
    );

    setPushCount(response.data.pushCount);

    if (response.data.pushCount > 0) {
      setStatus("success");
    } else {
      setStatus("failed");
    }
  } catch (error) {
    console.error(error);
    setStatus("failed");
  } finally {
    setLoading(false);
  }
};

const submitTask = () => {

    if (task === "") {
  
      alert("Please enter task");
  
      return;
    }
  
    const newTask = {
  
      text: task,
  
      date: new Date().toLocaleDateString(),
  
      time: new Date().toLocaleTimeString(),
    };
  
    setTasks([...tasks, newTask]);
  
    setTask("");
  };

  return (

    <div
      className="min-vh-100"
      style={{
        background: "#1e1e2f",
      }}
    >

      {/* NAVBAR */}
      <nav
        className="navbar navbar-dark px-4"
        style={{
          background: "#111827",
        }}
      >

        <h3 className="text-white">
          Student Dashboard
        </h3>

        <button className="btn btn-danger">
          Logout
        </button>

      </nav>

      {/* MAIN CONTENT */}
      <div className="container py-5">

        {/* WELCOME CARD */}
        <div
          className="card border-0 shadow-lg p-4"
          style={{
            borderRadius: "20px",
            background:
              "linear-gradient(135deg, #4facfe, #00f2fe)",
          }}
        >

          <div className="d-flex align-items-center">

            {/* PROFILE IMAGE */}
            <div className="text-center">
  <img
    src={profilePic}
    alt="student"
    style={{
      width: "90px",
      height: "90px",
      borderRadius: "50%",
      border: "4px solid white",
      objectFit: "cover",
    }}
  />

  <input
    type="file"
    accept="image/*"
    className="form-control mt-3"
    style={{ maxWidth: "250px" }}
    onChange={(e) => {
      const file = e.target.files[0];

      if (file) {
        setProfilePic(URL.createObjectURL(file));
      }
    }}
  />
</div>

            {/* TEXT */}
            <div className="ms-4 text-white">

              <h2 className="fw-bold">
                Welcome, Sridhar 👋
              </h2>

              <p className="mb-0 fs-5">
                Track your attendance and daily progress
              </p>

            </div>
          </div>
        </div>

      </div>
      {/* ATTENDANCE SECTION */}
<div className="row mt-5 g-4">

{/* LOGIN TIME CARD */}
<div className="col-md-3">

  <div
    className="card border-0 shadow-lg text-center p-4"
    style={{
      borderRadius: "20px",
      background: "#111827",
      color: "white",
    }}
  >

    <h5>Login Time</h5>

    <h3 className="mt-3 text-info">
      09:15 AM
    </h3>

  </div>
</div>

{/* LOGOUT TIME CARD */}
<div className="col-md-3">

  <div
    className="card border-0 shadow-lg text-center p-4"
    style={{
      borderRadius: "20px",
      background: "#111827",
      color: "white",
    }}
  >

    <h5>Logout Time</h5>

    <h3 className="mt-3 text-warning">
      -- : --
    </h3>

  </div>
</div>

{/* STATUS CARD */}
<div className="col-md-3">

  <div
    className="card border-0 shadow-lg text-center p-4"
    style={{
      borderRadius: "20px",
      background: "#111827",
      color: "white",
    }}
  >

    <h5>Status</h5>

    <h3 className="mt-3 text-success">
      Present
    </h3>

  </div>
</div>

{/* WORKING HOURS CARD */}
<div className="col-md-3">

  <div
    className="card border-0 shadow-lg text-center p-4"
    style={{
      borderRadius: "20px",
      background: "#111827",
      color: "white",
    }}
  >

    <h5>Working Hours</h5>

    <h3 className="mt-3 text-danger">
      2h 15m
    </h3>

  </div>
</div>

</div>
{/* GITHUB ACTIVITY SECTION */}

<div
  className="card border-0 shadow-lg p-4 mt-5"
  style={{
    borderRadius: "20px",
    background: "#111827",
    color: "white",
  }}
>

  <h2 className="mb-4">
    GitHub Activity Verification
  </h2>

  {/* INPUT + BUTTON */}
  <div className="row g-3">

    <div className="col-md-9">

      <input
        type="text"
        className="form-control p-3"
        placeholder="Enter GitHub Profile URL"
        value={githubUrl}
        onChange={(e) =>
          setGithubUrl(e.target.value)
        }
        style={{
          borderRadius: "15px",
        }}
      />
    </div>

    <div className="col-md-3">

      <button
        className="btn btn-info w-100 h-100 fw-bold"
        onClick={checkGithubActivity}
        style={{
          borderRadius: "15px",
        }}
      >
        Check Activity
      </button>
    </div>
  </div>

  {/* LOADING */}
  {loading && (

    <div className="text-center mt-4">

      <div
        className="spinner-border text-info"
        role="status"
      >
      </div>

      <h5 className="mt-3">
        Checking GitHub Activity...
      </h5>

    </div>
  )}

  {/* SUCCESS */}
  {status === "success" && (

    <div
      className="text-center mt-4 p-4"
      style={{
        background: "#14532d",
        borderRadius: "15px",
      }}
    >

      <h1 className="display-3">
        ✅
      </h1>

      <h3 className="text-success">
        GitHub Push Detected :{pushcount}
      </h3>


    </div>
  )}

  {/* FAILED */}
  {status === "failed" && (

    <div
      className="text-center mt-4 p-4"
      style={{
        background: "#7f1d1d",
        borderRadius: "15px",
      }}
    >

      <h1 className="display-3">
        ❌
      </h1>

      <h3 className="text-danger">
        No GitHub Activity Found
      </h3>

    </div>
  )}

</div>
{/* DAILY TASK SECTION */}

<div
  className="card border-0 shadow-lg p-4 mt-5"
  style={{
    borderRadius: "20px",
    background: "#111827",
    color: "white",
  }}
>

  <h2 className="mb-4">
    Daily Work Progress
  </h2>

  {/* TEXTAREA */}
  <textarea
    className="form-control p-3"
    rows="5"
    placeholder="Enter today's work..."
    value={task}
    onChange={(e) =>
      setTask(e.target.value)
    }
    style={{
      borderRadius: "15px",
    }}
  />

  {/* BUTTON */}
  <button
    className="btn btn-success mt-4 fw-bold"
    onClick={submitTask}
    style={{
      borderRadius: "15px",
      padding: "12px",
    }}
  >
    Submit Task
  </button>

</div>
{/* TASK HISTORY */}

<div
  className="card border-0 shadow-lg p-4 mt-5"
  style={{
    borderRadius: "20px",
    background: "#111827",
    color: "white",
  }}
>

  <h2 className="mb-4">
    Recent Activity
  </h2>

  <div className="table-responsive">

    <table className="table table-dark table-hover">

      <thead>

        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Task</th>
        </tr>

      </thead>

      <tbody>

        {tasks.map((item, index) => (

          <tr key={index}>

            <td>{item.date}</td>

            <td>{item.time}</td>

            <td>{item.text}</td>

          </tr>
        ))}

      </tbody>

    </table>
  </div>
</div>

    </div>
  );
}

export default StudentDashboard;