export default function Navbar() {

  return (

    <div style={styles.nav}>

      <h2>
        Attendance Management System
      </h2>

    </div>
  );
}

const styles = {

  nav: {

    background: "#1e3a8a",

    color: "white",

    padding: "20px",

    fontWeight: "bold",

    boxShadow:
      "0 2px 10px rgba(0,0,0,0.1)"
  }
};