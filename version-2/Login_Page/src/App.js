const { useState } = React;
const h = React.createElement;

function App() {
  const [status, setStatus] = useState({ type: "idle", message: "" });

  async function handleLogin(credentials) {
    setStatus({ type: "loading", message: "Checking your account..." });

    try {
      await window.authService.loginWithEmailAndPhoto(
        credentials.email,
        credentials.password,
        credentials.photo
      );
      setStatus({ type: "success", message: "Login successful. Redirecting..." });
      window.setTimeout(() => {
        window.location.href = "./dashboard.html";
      }, 800);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Login failed. Please check your details.",
      });
    }
  }

  return h(
    "main",
    { className: "login-page" },
    h(
      "section",
      { className: "login-panel", "aria-label": "Attendance Tracker login" },
      h(
        "a",
        {
          className: "brand",
          href: "../Main_Page/index.html",
          "aria-label": "Attendance Tracker home",
        },
        h("span", { className: "brand-mark" }, "AT"),
        h("span", null, "Attendance Tracker")
      ),
      h(
        "div",
        { className: "login-copy" },
        h("p", { className: "eyebrow" }, "Welcome back"),
        h("h1", null, "Sign in to track today."),
        h("p", null, "Use your registered email and password to open your attendance dashboard.")
      ),
      h(window.LoginForm, { onSubmit: handleLogin, status })
    ),
    h(
      "aside",
      { className: "summary-panel", "aria-label": "Login page summary" },
      h(
        "div",
        null,
        h("p", { className: "eyebrow" }, "Today"),
        h("h2", null, "Keep work hours visible from the first login.")
      ),
      h(
        "div",
        { className: "metric-list" },
        h(
          "div",
          { className: "metric-card" },
          h("span", null, "Expected login"),
          h("strong", null, "10:00 AM")
        ),
        h(
          "div",
          { className: "metric-card warning" },
          h("span", null, "Status"),
          h("strong", null, "Pending")
        ),
        h(
          "div",
          { className: "metric-card success" },
          h("span", null, "Tracking"),
          h("strong", null, "Ready")
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
