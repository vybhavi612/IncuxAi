import { useState, useRef } from "react";
import Webcam from "react-webcam";

function App() {

  const [page, setPage] = useState("home");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);

  const webcamRef = useRef(null);

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setPage("login");
  };

  const handleLogin = () => {

    const email =
      document.getElementById("email").value;

    const password =
      document.getElementById("password").value;

    if(role === "Employee"){

      if(
        email === "employee@gmail.com" &&
        password === "12345"
      ){

        setPage("camera");

      }else{

        setMessage(
          "Invalid Employee Credentials"
        );
      }
    }

    if(role === "Admin"){

      if(
        email === "admin@gmail.com" &&
        password === "admin123"
      ){

        setPage("camera");

      }else{

        setMessage(
          "Invalid Admin Credentials"
        );
      }
    }
  };

  const capture = () => {
    const screenshot =
      webcamRef.current.getScreenshot();

    setImage(screenshot);
    setPage("employeeDashboard");
  };

  if(page === "home"){

    return(

      <div style={{
        minHeight:"100vh",
        background:
        "linear-gradient(135deg,#141e30,#243b55)",
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        alignItems:"center",
        color:"white"
      }}>

        <h1>
          AI Employee Monitoring System
        </h1>

        <div style={{
          display:"flex",
          gap:"30px",
          marginTop:"40px"
        }}>

          <div
            onClick={() =>
              selectRole("Employee")
            }
            style={{
              background:"white",
              color:"black",
              padding:"40px",
              borderRadius:"20px",
              cursor:"pointer"
            }}
          >
            <h2>👨‍💼 Employee</h2>
          </div>

          <div
            onClick={() =>
              selectRole("Admin")
            }
            style={{
              background:"white",
              color:"black",
              padding:"40px",
              borderRadius:"20px",
              cursor:"pointer"
            }}
          >
            <h2>🛡️ Admin</h2>
          </div>

        </div>

      </div>
    );
  }

  if(page === "login"){

    return(

      <div style={{
        minHeight:"100vh",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        background:"#0f172a"
      }}>

        <div style={{
          width:"400px",
          background:"white",
          padding:"40px",
          borderRadius:"20px"
        }}>

          <h1>{role} Login</h1>

          <input
            id="email"
            placeholder="Email"
            style={{
              width:"100%",
              padding:"15px",
              marginBottom:"10px"
            }}
          />

          <input
            id="password"
            type="password"
            placeholder="Password"
            style={{
              width:"100%",
              padding:"15px"
            }}
          />

          <button
            onClick={handleLogin}
            style={{
              width:"100%",
              padding:"15px",
              marginTop:"20px"
            }}
          >
            Login
          </button>

          <p>{message}</p>

        </div>

      </div>
    );
  }

  if(page === "camera"){

    return(

      <div style={{
        minHeight:"100vh",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        background:"#111827"
      }}>

        <div style={{
          background:"white",
          padding:"40px",
          borderRadius:"20px"
        }}>

          <h1>Face Verification</h1>

          {!image ? (

            <>
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{
                  width:"400px"
                }}
              />

              <button
                onClick={capture}
              >
                Capture Selfie
              </button>
            </>

          ) : (

            <>
              <img
                src={image}
                alt="captured"
                width="400"
              />

              <h2>
                Verification Successful
              </h2>
            </>
          )}

        </div>

      </div>
    );
  }

  if(page === "employeeDashboard"){

    return(

      <div style={{
        minHeight:"100vh",
        background:"#f3f4f6",
        padding:"40px"
      }}>

        <h1>Employee Dashboard</h1>

        {image && (

          <img
            src={image}
            alt="profile"
            style={{
              width:"150px",
              height:"150px",
              borderRadius:"50%"
            }}
          />

        )}

        <div style={{
          display:"flex",
          gap:"20px",
          marginTop:"30px"
        }}>

          <div style={{
            background:"white",
            padding:"20px",
            borderRadius:"20px"
          }}>
            <h3>Attendance</h3>
            <p>Present</p>
          </div>

          <div style={{
            background:"white",
            padding:"20px",
            borderRadius:"20px"
          }}>
            <h3>GitHub Activity</h3>
            <p>8 Commits Today</p>
          </div>

        </div>

      </div>

    );
  }

  return null;
}

export default App;
