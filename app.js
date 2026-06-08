const ADMIN_KEY = "123456";
const START_HOUR = 10;
const STORAGE_KEY = "smartwork.records.v1";
const USER_STORAGE_KEY = "smartwork.users.v1";

const pages = {
  landing: document.querySelector("#landingPage"),
  functions: document.querySelector("#functionsPage"),
  register: document.querySelector("#registerPage"),
  role: document.querySelector("#rolePage"),
  employee: document.querySelector("#employeeDashboard"),
  admin: document.querySelector("#adminDashboard"),
};

const registerForm = document.querySelector("#registerForm");
const registerError = document.querySelector("#registerError");
const loginForm = document.querySelector("#loginForm");
const selectedRoleLabel = document.querySelector("#selectedRoleLabel");
const adminKeyWrap = document.querySelector("#adminKeyWrap");
const adminKey = document.querySelector("#adminKey");
const formError = document.querySelector("#formError");
const photoInput = document.querySelector("#photo");
const photoPreview = document.querySelector("#photoPreview");
const cameraPreview = document.querySelector("#cameraPreview");
const cameraCanvas = document.querySelector("#cameraCanvas");
const startCameraButton = document.querySelector("#startCameraButton");
const captureButton = document.querySelector("#captureButton");
const stopCameraButton = document.querySelector("#stopCameraButton");
const reportRows = document.querySelector("#reportRows");

let selectedRole = null;
let currentSession = null;
let timer = null;
let cameraStream = null;
let capturedPhoto = "";

document.querySelector("#startBottomButton").addEventListener("click", () => showPage("register"));
document.querySelector("#backHomeButton").addEventListener("click", () => showPage("landing"));
document.querySelector("#functionsBackButton").addEventListener("click", () => showPage("landing"));
document.querySelector("#registerBackButton").addEventListener("click", () => showPage("landing"));
document.querySelector("#alreadyRegisteredButton").addEventListener("click", () => showPage("role"));

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  registerError.textContent = "";

  const form = new FormData(registerForm);
  const email = form.get("registerEmail").trim().toLowerCase();
  const users = readUsers();

  if (users.some((user) => user.email === email)) {
    registerError.textContent = "This email is already registered. Please continue to role selection.";
    return;
  }

  const user = {
    id: crypto.randomUUID(),
    name: form.get("registerName").trim(),
    email,
    contact: form.get("registerContact").trim(),
    department: form.get("registerDepartment").trim(),
    password: form.get("registerPassword"),
    registeredAt: new Date().toISOString(),
  };

  users.unshift(user);
  writeUsers(users);
  fillLoginFromRegistration(user);
  registerForm.reset();
  showPage("role");
});

document.querySelectorAll(".role-card").forEach((card) => {
  card.addEventListener("click", () => selectRole(card.dataset.role));
});

document.querySelector("#changeRoleButton").addEventListener("click", () => {
  selectedRole = null;
  loginForm.classList.add("hidden");
  formError.textContent = "";
  stopCamera();
});

document.querySelectorAll(".logout-button").forEach((button) => {
  button.addEventListener("click", logout);
});

document.querySelector("#clearButton").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  if (currentSession) {
    writeRecords([currentSession]);
  }
  renderAdminDashboard();
});

photoInput.addEventListener("change", async () => {
  formError.textContent = "";
  const file = photoInput.files?.[0];
  if (!file) return;
  capturedPhoto = await fileToDataUrl(file);
  showPhotoPreview(capturedPhoto);
});

startCameraButton.addEventListener("click", startCamera);
captureButton.addEventListener("click", capturePhoto);
stopCameraButton.addEventListener("click", stopCamera);

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";

  if (!selectedRole) {
    formError.textContent = "Please choose employee or admin first.";
    return;
  }

  if (selectedRole === "admin" && adminKey.value !== ADMIN_KEY) {
    formError.textContent = "Invalid admin access key.";
    return;
  }

  const form = new FormData(loginForm);
  const email = form.get("email").trim().toLowerCase();
  const registeredUser = readUsers().find((user) => user.email === email);

  if (!registeredUser) {
    formError.textContent = "Please register this email before logging in.";
    return;
  }

  if (registeredUser.password !== form.get("password")) {
    formError.textContent = "Incorrect password for this registered email.";
    return;
  }

  const photo = capturedPhoto || await getUploadedPhoto(form.get("photo"));

  if (!photo) {
    formError.textContent = "Please upload a profile picture or capture one with the camera.";
    return;
  }

  const loginAt = new Date();
  const user = {
    id: crypto.randomUUID(),
    name: form.get("name").trim(),
    email,
    contact: form.get("contact").trim(),
    department: form.get("department").trim(),
    photo,
    loginAt: loginAt.toISOString(),
    role: selectedRole,
  };

  const records = readRecords();
  records.unshift(user);
  writeRecords(records);
  currentSession = user;
  stopCamera();

  if (user.role === "admin") {
    showPage("admin");
    renderAdminDashboard();
  } else {
    showPage("employee");
    renderEmployeeDashboard();
  }

  clearInterval(timer);
  timer = setInterval(updateLiveData, 1000);
});

function selectRole(role) {
  selectedRole = role;
  selectedRoleLabel.textContent = role === "admin" ? "Admin Login" : "Employee Login";
  adminKeyWrap.classList.toggle("hidden", role !== "admin");
  adminKey.required = role === "admin";
  loginForm.classList.remove("hidden");
  formError.textContent = "";
  loginForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fillLoginFromRegistration(user) {
  document.querySelector("#name").value = user.name;
  document.querySelector("#email").value = user.email;
  document.querySelector("#contact").value = user.contact;
  document.querySelector("#department").value = user.department;
}

function showPage(pageName) {
  Object.values(pages).forEach((page) => page.classList.add("hidden"));
  pages[pageName].classList.remove("hidden");
}

function renderEmployeeDashboard() {
  const user = currentSession;
  if (!user) return;

  document.querySelector("#employeeWelcome").textContent = `Welcome, ${user.name}`;
  document.querySelector("#employeePhoto").src = user.photo;
  document.querySelector("#employeeName").textContent = user.name;
  document.querySelector("#employeeEmail").textContent = user.email;
  document.querySelector("#employeeContact").textContent = user.contact;
  document.querySelector("#employeeDepartment").textContent = user.department || "Department not added";
  document.querySelector("#employeeLoginTime").textContent = formatTime(user.loginAt);
  document.querySelector("#employeeDelay").textContent = formatDelay(user.loginAt);
  document.querySelector("#employeeWorkingTime").textContent = formatDuration(Date.now() - new Date(user.loginAt).getTime());
}

function renderAdminDashboard() {
  const records = readRecords();
  const lateCount = records.filter((record) => formatDelay(record.loginAt) !== "On time").length;

  document.querySelector("#adminWelcome").textContent = currentSession ? `Team Attendance, ${currentSession.name}` : "Team Attendance";
  document.querySelector("#totalRecords").textContent = records.length;
  document.querySelector("#lateRecords").textContent = lateCount;
  document.querySelector("#onTimeRecords").textContent = records.length - lateCount;
  document.querySelector("#adminLoginTime").textContent = currentSession ? formatTime(currentSession.loginAt) : "-";

  if (!records.length) {
    reportRows.innerHTML = `<tr><td colspan="8">No attendance records yet.</td></tr>`;
    return;
  }

  reportRows.innerHTML = records.map((record) => {
    const delay = formatDelay(record.loginAt);
    const delayClass = delay === "On time" ? "on-time" : "late";

    return `
      <tr>
        <td><img class="record-photo" src="${record.photo}" alt="${escapeHtml(record.name)} photo"></td>
        <td>${escapeHtml(record.name)}</td>
        <td>${escapeHtml(record.email)}</td>
        <td>${escapeHtml(record.contact)}</td>
        <td>${escapeHtml(record.department || "-")}</td>
        <td>${formatTime(record.loginAt)}</td>
        <td class="${delayClass}">${delay}</td>
        <td>${formatDuration(Date.now() - new Date(record.loginAt).getTime())}</td>
      </tr>
    `;
  }).join("");
}

function updateLiveData() {
  if (!currentSession) return;

  if (currentSession.role === "admin") {
    renderAdminDashboard();
  } else {
    renderEmployeeDashboard();
  }
}

async function startCamera() {
  formError.textContent = "";

  if (!navigator.mediaDevices?.getUserMedia) {
    formError.textContent = "Camera access is not available in this browser. Please use image upload.";
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    cameraPreview.srcObject = cameraStream;
    cameraPreview.classList.remove("hidden");
    captureButton.classList.remove("hidden");
    stopCameraButton.classList.remove("hidden");
  } catch {
    formError.textContent = "Camera permission was blocked or unavailable. Open this site on localhost/HTTPS and allow camera access.";
  }
}

function capturePhoto() {
  if (!cameraStream) return;

  const width = cameraPreview.videoWidth || 640;
  const height = cameraPreview.videoHeight || 480;
  cameraCanvas.width = width;
  cameraCanvas.height = height;
  cameraCanvas.getContext("2d").drawImage(cameraPreview, 0, 0, width, height);
  capturedPhoto = cameraCanvas.toDataURL("image/png");
  showPhotoPreview(capturedPhoto);
  stopCamera();
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
  }

  cameraStream = null;
  cameraPreview.srcObject = null;
  cameraPreview.classList.add("hidden");
  captureButton.classList.add("hidden");
  stopCameraButton.classList.add("hidden");
}

function showPhotoPreview(src) {
  photoPreview.src = src;
  photoPreview.classList.remove("hidden");
}

async function getUploadedPhoto(file) {
  if (!file || !file.size) return "";
  return fileToDataUrl(file);
}

function logout() {
  currentSession = null;
  clearInterval(timer);
  timer = null;
  selectedRole = null;
  capturedPhoto = "";
  loginForm.reset();
  loginForm.classList.add("hidden");
  photoPreview.classList.add("hidden");
  adminKeyWrap.classList.add("hidden");
  adminKey.required = false;
  stopCamera();
  showPage("landing");
}

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

function formatDelay(loginAt) {
  const login = new Date(loginAt);
  const start = new Date(login);
  start.setHours(START_HOUR, 0, 0, 0);

  const delayMs = login.getTime() - start.getTime();
  return delayMs <= 0 ? "On time" : formatDuration(delayMs);
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function formatTime(value) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function readRecords() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function writeRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}
