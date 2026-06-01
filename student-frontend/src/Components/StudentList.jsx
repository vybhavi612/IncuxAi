import { useEffect, useState } from "react";
import API from "../api";

function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await API.get("/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  return (
    <div>
      <h2>Student List</h2>

      {students.length === 0 ? (
        <p>No students found</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>

          <tbody>
  {students.map((s) => (
    <tr key={s.id}>
      <td>{s.id}</td>
      <td>{s.name}</td>
      <td>{s.email}</td>
      <td>{s.phoneNumber}</td>
    </tr>
  ))}
</tbody>
        </table>
      )}
    </div>
  );
}

export default StudentList;