import Layout from "../components/Layout";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Layout>
      <h1>My Profile</h1>

      <div style={styles.card}>
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Role:</b> {user.role}</p>

        <p>
          <b>GitHub:</b>{" "}
          <a href={user.github} target="_blank" rel="noreferrer">
            {user.github || "Not added"}
          </a>
        </p>
      </div>
    </Layout>
  );
}

const styles = {
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "400px",
    marginTop: "20px"
  }
};