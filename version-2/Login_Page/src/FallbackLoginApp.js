const root = document.getElementById("root");

root.innerHTML = `
  <main class="login-page">
    <section class="login-panel" aria-label="Attendance Tracker login">
      <a class="brand" href="../Main_Page/index.html" aria-label="Attendance Tracker home">
        <span class="brand-mark">AT</span>
        <span>Attendance Tracker</span>
      </a>

      <div class="login-copy">
        <p class="eyebrow">Welcome back</p>
        <h1>Sign in to track today.</h1>
        <p>Use your registered email and password. Camera capture works on localhost.</p>
      </div>

      <form class="login-form" id="fallback-login-form">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" placeholder="you@example.com" autocomplete="email" required>

        <label for="password">Password</label>
        <input id="password" name="password" type="password" placeholder="Enter password" autocomplete="current-password" required>

        <div class="camera-box">
          <video id="camera-video" autoplay playsinline></video>
          <img class="captured-photo" id="captured-photo" alt="Captured login" hidden>
          <div class="camera-actions">
            <button type="button" class="ghost-button" id="start-camera">Start camera</button>
            <button type="button" class="ghost-button" id="capture-photo">Capture photo</button>
          </div>
          <p class="camera-status" id="camera-status">Camera is off</p>
        </div>

        <p class="form-status error" id="login-status" role="status" hidden></p>
        <button type="submit" id="login-button" disabled>Login with photo</button>
        <a class="secondary-link" href="./signup.html">Create a new account</a>
      </form>
    </section>

    <aside class="summary-panel" aria-label="Login page summary">
      <div>
        <p class="eyebrow">Today</p>
        <h2>Keep work hours visible from the first login.</h2>
      </div>
      <div class="metric-list">
        <div class="metric-card">
          <span>Expected login</span>
          <strong>10:00 AM</strong>
        </div>
        <div class="metric-card warning">
          <span>Status</span>
          <strong>Pending</strong>
        </div>
        <div class="metric-card success">
          <span>Tracking</span>
          <strong>Ready</strong>
        </div>
      </div>
    </aside>
  </main>
`;

const video = document.getElementById("camera-video");
const capturedPhoto = document.getElementById("captured-photo");
const statusText = document.getElementById("camera-status");
const loginStatus = document.getElementById("login-status");
const loginButton = document.getElementById("login-button");
let cameraStream = null;
let photoDataUrl = "";

document.getElementById("start-camera").addEventListener("click", async () => {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = cameraStream;
    statusText.textContent = "Camera ready";
  } catch {
    statusText.textContent = "Camera permission is required. Open this page with npm run dev on localhost.";
  }
});

document.getElementById("capture-photo").addEventListener("click", () => {
  if (!video.srcObject) {
    statusText.textContent = "Start camera before capturing.";
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  photoDataUrl = canvas.toDataURL("image/jpeg", 0.76);
  capturedPhoto.src = photoDataUrl;
  capturedPhoto.hidden = false;
  loginButton.disabled = false;
  statusText.textContent = "Photo captured";
});

document.getElementById("fallback-login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  loginButton.disabled = true;
  loginStatus.hidden = false;
  loginStatus.className = "form-status loading";
  loginStatus.textContent = "Checking your account...";

  try {
    await window.authService.loginWithEmailAndPhoto(
      event.target.email.value,
      event.target.password.value,
      photoDataUrl
    );
    loginStatus.className = "form-status success";
    loginStatus.textContent = "Login successful. Redirecting...";
    window.setTimeout(() => {
      window.location.href = "./dashboard.html";
    }, 800);
  } catch (error) {
    loginStatus.className = "form-status error";
    loginStatus.textContent = error.message || "Login failed.";
    loginButton.disabled = false;
  }
});
