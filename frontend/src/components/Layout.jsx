import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div>
      <Sidebar />

      <div style={styles.main}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  main: {
    marginLeft: "240px",
    padding: "20px",
    background: "#f4f6f8",
    minHeight: "100vh"
  }
};