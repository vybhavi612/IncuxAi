import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
function Register() {
  const [role, setRole] = useState("student");
  const navi=useNavigate();
  const [student, setStudent] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "STUDENT",
  });

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value,
    });
  };

  const handleRole = (selectedRole) => {
    setRole(selectedRole);

    setStudent({
      ...student,
      role: selectedRole.toUpperCase(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8081/student/register",
        student
      );

      console.log(response.data);
      alert("Registration Successful");

      setStudent({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        role: role.toUpperCase(),
      });
    } catch (error) {
      console.error(error);
      alert("Registration Failed");
    }
    if(student.role=="ADMIN"){
      navi("/admin-dashboard");
    }
    else{
      navi("/student-dashboard");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundColor: role === "student" ? "#2f2d35" : "#1e1e2f",
      }}
    >
      <div
        className="container p-4"
        style={{
          backgroundColor:
            role === "student" ? "#28c428" : "#ff6b35",
          borderRadius: "25px",
          width: "75%",
        }}
      >
        <div className="row align-items-center">
          <div className="col-md-5 text-white px-5">
            <div className="d-flex gap-3 mb-4">
              <button
                type="button"
                className={`btn fw-bold ${
                  role === "student"
                    ? "btn-light text-success"
                    : "btn-outline-light"
                }`}
                onClick={() => handleRole("student")}
              >
                Student
              </button>

              <button
                type="button"
                className={`btn fw-bold ${
                  role === "admin"
                    ? "btn-dark"
                    : "btn-outline-dark text-white"
                }`}
                onClick={() => handleRole("admin")}
              >
                Admin
              </button>
            </div>

            <h2 className="mb-4">
              {role === "student"
                ? "Student Registration"
                : "Admin Registration"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={student.name}
                  onChange={handleChange}
                  className="form-control rounded-pill"
                  placeholder="Enter Name"
                />
              </div>

              <div className="mb-3">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={student.email}
                  onChange={handleChange}
                  className="form-control rounded-pill"
                  placeholder="Enter Email"
                />
              </div>

              <div className="mb-3">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={student.password}
                  onChange={handleChange}
                  className="form-control rounded-pill"
                  placeholder="Enter Password"
                />
              </div>

              <div className="mb-3">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={student.phoneNumber}
                  onChange={handleChange}
                  className="form-control rounded-pill"
                  placeholder="Enter Phone Number"
                />
              </div>

              <button
                type="submit"
                className="btn w-100 fw-bold rounded-pill"
                style={{
                  backgroundColor:
                    role === "student" ? "#d9ff00" : "#111",
                  color:
                    role === "student" ? "black" : "white",
                }}
              >
                Register
              </button>
            </form>
          </div>

          <div className="col-md-7 text-center">
            <img
              src={
                role === "student"
                  ? "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                  : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
              }
              alt="role"
              className="img-fluid"
              style={{
                borderRadius: "25px",
                height: "650px",
                width: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;