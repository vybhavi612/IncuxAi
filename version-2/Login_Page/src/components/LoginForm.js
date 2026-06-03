const { useState } = React;
const h = React.createElement;
function LoginForm({ onSubmit, status }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [photo, setPhoto] = useState("");
  const isLoading = status.type === "loading";
  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }
  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({ ...formData, photo });
  }
  return h(
    "form",
    { className: "login-form", onSubmit: handleSubmit },
    h("label", { htmlFor: "email" }, "Email"),
    h("input", {
      id: "email",
      name: "email",
      type: "email",
      placeholder: "you@example.com",
      value: formData.email,
      onChange: handleChange,
      autoComplete: "email",
      required: true,
    }),
    h("label", { htmlFor: "password" }, "Password"),
    h("input", {
      id: "password",
      name: "password",
      type: "password",
      placeholder: "Enter password",
      value: formData.password,
      onChange: handleChange,
      autoComplete: "current-password",
      required: true,
    }),
    h(window.CameraCapture, { photo, onCapture: setPhoto }),
    status.message
      ? h("p", { className: `form-status ${status.type}`, role: "status" }, status.message)
      : null,
    h(
      "button",
      { type: "submit", disabled: isLoading || !photo },
      isLoading ? "Signing in..." : "Login with photo"
    ),
    h("a", { className: "secondary-link", href: "./signup.html" }, "Create a new account")
  );
}
window.LoginForm = LoginForm;
