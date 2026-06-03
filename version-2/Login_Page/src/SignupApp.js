const hSignup = React.createElement;

function SignupApp() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
  });
  const [status, setStatus] = React.useState({ type: "idle", message: "" });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "loading", message: "Creating account..." });

    try {
      await window.authService.signupWithEmail(formData);
      setStatus({ type: "success", message: "Account created. Please login with photo." });
      window.setTimeout(() => {
        window.location.href = "./login.html";
      }, 900);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Signup failed." });
    }
  }

  return hSignup(
    "main",
    { className: "login-page single-panel" },
    hSignup(
      "section",
      { className: "login-panel", "aria-label": "Create account" },
      hSignup(
        "a",
        { className: "brand", href: "../Main_Page/index.html" },
        hSignup("span", { className: "brand-mark" }, "AT"),
        hSignup("span", null, "Attendance Tracker")
      ),
      hSignup(
        "div",
        { className: "login-copy" },
        hSignup("p", { className: "eyebrow" }, "New account"),
        hSignup("h1", null, "Create employee or student profile."),
        hSignup("p", null, "Admin access is controlled from the admin email list in Firebase config.")
      ),
      hSignup(
        "form",
        { className: "login-form", onSubmit: handleSubmit },
        hSignup("label", { htmlFor: "name" }, "Full name"),
        hSignup("input", {
          id: "name",
          name: "name",
          value: formData.name,
          onChange: handleChange,
          required: true,
        }),
        hSignup("label", { htmlFor: "email" }, "Email"),
        hSignup("input", {
          id: "email",
          name: "email",
          type: "email",
          value: formData.email,
          onChange: handleChange,
          required: true,
        }),
        hSignup("label", { htmlFor: "password" }, "Password"),
        hSignup("input", {
          id: "password",
          name: "password",
          type: "password",
          value: formData.password,
          onChange: handleChange,
          minLength: 6,
          required: true,
        }),
        hSignup("label", { htmlFor: "role" }, "Profile type"),
        hSignup(
          "select",
          { id: "role", name: "role", value: formData.role, onChange: handleChange },
          hSignup("option", { value: "student" }, "Student"),
          hSignup("option", { value: "employee" }, "Employee")
        ),
        hSignup("label", { htmlFor: "department" }, "Department / class"),
        hSignup("input", {
          id: "department",
          name: "department",
          value: formData.department,
          onChange: handleChange,
          required: true,
        }),
        status.message
          ? hSignup("p", { className: `form-status ${status.type}`, role: "status" }, status.message)
          : null,
        hSignup("button", { type: "submit", disabled: status.type === "loading" }, "Create account"),
        hSignup("a", { className: "secondary-link", href: "./login.html" }, "Already have an account")
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(hSignup(SignupApp));
