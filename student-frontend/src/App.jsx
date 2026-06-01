import Login from "./Components/Login.";
import StudentDashboard from "./Components/StudentDashboard";
import {BrowserRouter,Route,Routes} from "react-router-dom";
import AdminDashboard from "./Components/AdminDashbord";
function App() {
  return (
    <BrowserRouter>
       <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/student-dashboard" element={<StudentDashboard/>}/>
        <Route path="/Admin-dashboard" element={<AdminDashboard/>}/>

       </Routes>
    </BrowserRouter>
  );
}

export default App;