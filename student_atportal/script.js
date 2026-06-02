function showForm(role) {
  document.getElementById('role-section').style.display = 'none';
  document.getElementById(role + '-form').classList.add('show');
}

function goBack() {
  document.getElementById('student-form').classList.remove('show');
  document.getElementById('admin-form').classList.remove('show');
  document.getElementById('role-section').style.display = 'block';
  clearAll();
}

function clearAll() {
  [
    's-username',
    's-email',
    's-phone',
    's-password',
    's-college',
    'a-username',
    'a-email',
    'a-phone'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  document.getElementById('s-error').style.display = 'none';
  document.getElementById('a-error').style.display = 'none';
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = '⚠️ ' + msg;
  el.style.display = 'block';
}

function togglePw(inputId, icon) {
  const input = document.getElementById(inputId);

  if (input.type === 'password') {
    input.type = 'text';
    icon.textContent = '🙈';
  } else {
    input.type = 'password';
    icon.textContent = '👁️';
  }
}

/* ========================= */
/* GLOBAL VARIABLES */
/* ========================= */

let loginTime;
let deskSeconds = 0;
let timerInterval;
let stream;

/* ========================= */
/* STUDENT LOGIN */
/* ========================= */

function studentLogin() {

  const username = document.getElementById('s-username').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const phone = document.getElementById('s-phone').value.trim();
  const password = document.getElementById('s-password').value.trim();
  const college = document.getElementById('s-college').value.trim();

  document.getElementById('s-error').style.display = 'none';

  if (!username || !email || !phone || !password) {
    showError('s-error', 'Please fill in all required fields.');
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    showError('s-error', 'Please enter a valid email address.');
    return;
  }

  if (phone.length < 10 || isNaN(phone)) {
    showError('s-error', 'Please enter a valid 10-digit phone number.');
    return;
  }

  /* LOGIN TIME */
  loginTime = new Date();

  const loginTimeText = loginTime.toLocaleTimeString();

  /* LATE LOGIN */
  const lateMinutes = calculateLateMinutes(loginTime);

  /* SAVE USER DATA */
  const studentData = {
    username,
    email,
    phone,
    college,
    loginTime: loginTimeText,
    lateMinutes,
    date: new Date().toLocaleDateString(),
    status: lateMinutes > 0 ? 'Late' : 'On Time'
  };

  /* SAVE TO LOCAL STORAGE */
  let records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];

  records.push(studentData);

  localStorage.setItem('attendanceRecords', JSON.stringify(records));

  /* SHOW DASHBOARD */
  document.getElementById('login-card').style.display = 'none';

  document.getElementById('main-header').style.display = 'none';

  document.getElementById('student-dashboard').classList.add('show-dashboard');

  /* DISPLAY DATA */
  document.getElementById('student-name-display').innerText =
    'Welcome, ' + username;

  document.getElementById('login-time').innerText = loginTimeText;

  document.getElementById('late-time').innerText =
    lateMinutes + ' Minutes';

  document.getElementById('current-date').innerText =
    new Date().toLocaleDateString();

  /* START TIMER */
  startDeskTimer();

  /* ATTENDANCE TABLE */
  addAttendanceRow(studentData);

  alert(
    '✅ Login successful!\nAttendance marked successfully.'
  );
}

/* ========================= */
/* ADMIN LOGIN */
/* ========================= */

function adminLogin() {

  const username = document.getElementById('a-username').value.trim();
  const email = document.getElementById('a-email').value.trim();
  const phone = document.getElementById('a-phone').value.trim();

  document.getElementById('a-error').style.display = 'none';

  if (!username || !email || !phone) {
    showError('a-error', 'Please fill in all required fields.');
    return;
  }

  if (!email.includes('@') || !email.includes('.')) {
    showError('a-error', 'Please enter a valid email address.');
    return;
  }

  if (phone.length < 10 || isNaN(phone)) {
    showError('a-error', 'Please enter a valid 10-digit phone number.');
    return;
  }

  /* SHOW ADMIN DASHBOARD */
  document.getElementById('login-card').style.display = 'none';

  document.getElementById('main-header').style.display = 'none';

  document.getElementById('admin-dashboard').classList.add('show-dashboard');

  loadAdminRecords();

  alert('✅ Admin login successful!');
}

/* ========================= */
/* CALCULATE LATE TIME */
/* ========================= */

function calculateLateMinutes(loginDate) {

  const classHour = 10;
  const classMinute = 0;

  const currentHour = loginDate.getHours();
  const currentMinute = loginDate.getMinutes();

  const loginTotalMinutes = currentHour * 60 + currentMinute;

  const classTotalMinutes = classHour * 60 + classMinute;

  if (loginTotalMinutes > classTotalMinutes) {
    return loginTotalMinutes - classTotalMinutes;
  }

  return 0;
}

/* ========================= */
/* DESK TIMER */
/* ========================= */

function startDeskTimer() {

  clearInterval(timerInterval);

  deskSeconds = 0;

  timerInterval = setInterval(() => {

    deskSeconds++;

    const hrs = String(Math.floor(deskSeconds / 3600)).padStart(2, '0');

    const mins = String(
      Math.floor((deskSeconds % 3600) / 60)
    ).padStart(2, '0');

    const secs = String(deskSeconds % 60).padStart(2, '0');

    document.getElementById('desk-time').innerText =
      `${hrs}:${mins}:${secs}`;

  }, 1000);
}

/* ========================= */
/* CAMERA */
/* ========================= */

async function startCamera() {

  try {

    stream = await navigator.mediaDevices.getUserMedia({
      video: true
    });

    document.getElementById('video').srcObject = stream;

  } catch (error) {

    alert('❌ Unable to access camera.');

  }
}

/* ========================= */
/* CAPTURE PHOTO */
/* ========================= */

function capturePhoto() {

  const video = document.getElementById('video');

  const canvas = document.getElementById('canvas');

  const preview = document.getElementById('photo-preview');

  const context = canvas.getContext('2d');

  canvas.width = video.videoWidth;

  canvas.height = video.videoHeight;

  context.drawImage(video, 0, 0);

  const imageData = canvas.toDataURL('image/png');

  preview.src = imageData;

  preview.style.display = 'block';

  localStorage.setItem('studentPhoto', imageData);

  alert('📸 Photo captured successfully!');
}

/* ========================= */
/* SAVE WORK PROGRESS */
/* ========================= */

function saveWorkProgress() {

  const tasks = document.getElementById('task-input').value.trim();

  const notes = document.getElementById('notes-input').value.trim();

  if (!tasks && !notes) {
    alert('⚠️ Please enter work progress.');
    return;
  }

  const workData = {
    tasks,
    notes,
    savedAt: new Date().toLocaleString()
  };

  localStorage.setItem(
    'workProgress',
    JSON.stringify(workData)
  );

  alert('✅ Work progress saved successfully!');
}

/* ========================= */
/* SAVE GITHUB LINK */
/* ========================= */

function saveGithubLink() {

  const githubLink =
    document.getElementById('github-link').value.trim();

  if (!githubLink) {
    alert('⚠️ Please enter GitHub repository link.');
    return;
  }

  localStorage.setItem('githubLink', githubLink);

  document.getElementById('github-display').innerHTML =
    `<a href="${githubLink}" target="_blank">${githubLink}</a>`;

  alert('✅ GitHub link saved!');
}

/* ========================= */
/* ATTENDANCE TABLE */
/* ========================= */

function addAttendanceRow(data) {

  const tbody = document.getElementById('attendance-body');

  const row = document.createElement('tr');

  row.innerHTML = `
    <td>${data.date}</td>
    <td>${data.loginTime}</td>
    <td>${data.status}</td>
  `;

  tbody.appendChild(row);
}

/* ========================= */
/* LOAD ADMIN RECORDS */
/* ========================= */

function loadAdminRecords() {

  const records =
    JSON.parse(localStorage.getItem('attendanceRecords')) || [];

  const tbody = document.getElementById('admin-records');

  tbody.innerHTML = '';

  let lateCount = 0;

  records.forEach(record => {

    if (record.lateMinutes > 0) {
      lateCount++;
    }

    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${record.username}</td>
      <td>${record.email}</td>
      <td>${record.loginTime}</td>
      <td>${record.lateMinutes} min</td>
      <td>${record.status}</td>
    `;

    tbody.appendChild(row);

  });

  document.getElementById('total-students').innerText =
    records.length;

  document.getElementById('present-students').innerText =
    records.length;

  document.getElementById('late-students').innerText =
    lateCount;
}

/* ========================= */
/* LOGOUT STUDENT */
/* ========================= */

function logoutStudent() {

  clearInterval(timerInterval);

  const logoutTime = new Date().toLocaleTimeString();

  alert(
    '👋 Logged out successfully!\nLogout Time: ' + logoutTime
  );

  document.getElementById('student-dashboard')
    .classList.remove('show-dashboard');

  document.getElementById('login-card').style.display = 'block';

  document.getElementById('main-header').style.display = 'block';

  goBack();
}

/* ========================= */
/* LOGOUT ADMIN */
/* ========================= */

function logoutAdmin() {

  alert('👋 Admin logged out successfully!');

  document.getElementById('admin-dashboard')
    .classList.remove('show-dashboard');

  document.getElementById('login-card').style.display = 'block';

  document.getElementById('main-header').style.display = 'block';

  goBack();
}

/* ========================= */
/* PAGE LOAD */
/* ========================= */

window.onload = function () {

  const savedGithub =
    localStorage.getItem('githubLink');

  if (savedGithub) {

    document.getElementById('github-display').innerHTML =
      `<a href="${savedGithub}" target="_blank">${savedGithub}</a>`;
  }

};