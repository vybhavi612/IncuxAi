// ── app.js ─────────────────────────────────────────────────────
// All UI logic. Reads/writes exclusively through DB (db.js).

// ── state ───────────────────────────────────────────────────────
let currentUser     = null;   // user record from DB
let currentInternId = null;   // internId if role=intern
let sessionStart    = null;   // Date object of login time

// ── boot ────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  const ok = await DB.init();
  if (!ok) toast('Could not load database file.', true);
});

// ── page switch ─────────────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// ── login tab ───────────────────────────────────────────────────
function switchTab(role) {
  document.getElementById('form-intern').style.display = role === 'intern' ? 'block' : 'none';
  document.getElementById('form-admin').style.display  = role === 'admin'  ? 'block' : 'none';
  document.getElementById('tab-intern').classList.toggle('active', role === 'intern');
  document.getElementById('tab-admin').classList.toggle('active',  role === 'admin');
  document.getElementById('login-error').style.display = 'none';
}

// ── login ────────────────────────────────────────────────────────
async function doLogin(role) {
  const errEl = document.getElementById('login-error');
  errEl.style.display = 'none';

  let identifier, password;
  if (role === 'intern') {
    identifier = document.getElementById('intern-email').value.trim();
    password   = document.getElementById('intern-pass').value;
  } else {
    identifier = document.getElementById('admin-user').value.trim();
    password   = document.getElementById('admin-pass').value;
  }

  if (!identifier || !password) { errEl.style.display = 'block'; errEl.textContent = 'Please fill in all fields.'; return; }

  const user = DB.findUser(identifier, password, role);
  if (!user) { errEl.style.display = 'block'; errEl.textContent = 'Incorrect credentials. Please try again.'; return; }

  currentUser  = user;
  sessionStart = new Date();

  if (role === 'intern') {
    currentInternId = user.internId;
    await DB.recordLogin(currentInternId, sessionStart.toTimeString().slice(0,5));
    renderInternDashboard();
    showPage('intern-page');
  } else {
    currentInternId = null;
    renderAdminDashboard();
    showPage('admin-page');
  }
}

// ── logout ───────────────────────────────────────────────────────
async function doLogout() {
  if (currentInternId) {
    await DB.recordLogout(currentInternId);
  }
  currentUser     = null;
  currentInternId = null;
  sessionStart    = null;

  // clear inputs
  ['intern-email','intern-pass','admin-user','admin-pass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('login-error').style.display = 'none';
  showPage('login-page');
}

// ── enter key on login ───────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (!document.getElementById('login-page').classList.contains('active')) return;
  const isIntern = document.getElementById('form-intern').style.display !== 'none';
  doLogin(isIntern ? 'intern' : 'admin');
});

// ═══════════════════════════════════════════════════════════════
// INTERN DASHBOARD RENDER
// ═══════════════════════════════════════════════════════════════
function renderInternDashboard() {
  const intern      = DB.getIntern(currentInternId);
  const stats       = DB.computeStats(currentInternId);
  const assignments = DB.getAssignmentsForIntern(currentInternId);
  const submissions = DB.getSubmissionsForIntern(currentInternId);
  const attendance  = DB.getAttendanceForIntern(currentInternId);
  const activity    = DB.getActivityForIntern(currentInternId);
  const now         = sessionStart || new Date();
  const timeStr     = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr     = now.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  // topbar greeting
  document.getElementById('intern-greeting').textContent = 'Hi, ' + (intern?.name?.split(' ')[0] || 'Intern');
  document.getElementById('login-time-display').textContent = timeStr;
  document.getElementById('today-date').textContent = dateStr;

  // stat cards
  document.getElementById('stat-assigned').textContent  = stats.assigned;
  document.getElementById('stat-completed').textContent = stats.completed;
  document.getElementById('stat-pending').textContent   = stats.pending;
  document.getElementById('stat-overdue').textContent   = stats.overdue;
  document.getElementById('stat-attend').textContent    = stats.attend + '%';

  // tasks
  renderInternTasks(assignments);

  // submissions
  renderInternSubmissions(submissions);

  // attendance calendar
  renderCalendar(attendance);

  // activity feed
  renderActivityFeed(activity, 'intern-activity-feed');
}

// ── task list ────────────────────────────────────────────────────
function renderInternTasks(assignments) {
  const container = document.getElementById('intern-task-list');
  if (!assignments.length) {
    container.innerHTML = '<div class="empty-state">No tasks assigned yet.</div>';
    return;
  }

  // sort: overdue first, then by deadline
  const sorted = [...assignments].sort((a, b) => {
    const order = { overdue: 0, in_progress: 1, not_started: 2, submitted: 3, reviewed: 4 };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });

  container.innerHTML = sorted.map(a => {
    const task    = DB.getTask(a.taskId);
    if (!task) return '';
    const isOverdue = !['submitted','reviewed'].includes(a.status) && new Date() > new Date(task.deadline);
    const status  = isOverdue ? 'overdue' : a.status;
    const badge   = statusBadge(status);
    const due     = formatDeadline(task.deadline, status);
    const actions = taskActions(a, status);
    return `
      <div class="task-item" id="task-item-${a.id}">
        <div class="task-left">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">${due}</div>
          ${status === 'in_progress' ? `<div class="progress-wrap" style="width:200px"><div class="progress-fill orange" style="width:50%"></div></div>` : ''}
          ${a.feedback ? `<div style="font-size:12px;color:#2a7a3b;margin-top:4px;">Feedback: ${a.feedback}</div>` : ''}
        </div>
        <div class="task-actions">
          ${badge}
          ${actions}
        </div>
      </div>`;
  }).join('');
}

function statusBadge(status) {
  const map = {
    not_started: ['grey',   'Not Started'],
    in_progress: ['orange', 'In Progress'],
    submitted:   ['blue',   'Submitted'],
    reviewed:    ['green',  'Reviewed ✓'],
    overdue:     ['red',    'Overdue'],
  };
  const [cls, label] = map[status] || ['grey', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

function formatDeadline(deadline, status) {
  const d   = new Date(deadline);
  const now = new Date();
  const fmt = d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  if (['submitted','reviewed'].includes(status)) return `Due ${fmt}`;
  if (now > d) {
    const diffDays = Math.floor((now - d) / 86400000);
    return `<span class="due-red">Due ${fmt} — overdue by ${diffDays} day${diffDays !== 1 ? 's' : ''}</span>`;
  }
  const diffDays = Math.ceil((d - now) / 86400000);
  const cls      = diffDays <= 2 ? 'due-orange' : '';
  return `<span class="${cls}">Due ${fmt}</span>`;
}

function taskActions(assignment, status) {
  if (status === 'not_started') {
    return `<button class="btn-secondary" style="font-size:12px;padding:4px 10px" onclick="startTask('${assignment.id}')">Start</button>`;
  }
  if (status === 'in_progress' || status === 'overdue') {
    return `<button class="btn-secondary" style="font-size:12px;padding:4px 10px;color:#2a7a3b;border-color:#a5d6a7" onclick="openSubmitModal('${assignment.id}')">Submit</button>`;
  }
  return '';
}

async function startTask(assignmentId) {
  await DB.updateAssignmentStatus(assignmentId, 'in_progress');
  renderInternDashboard();
  toast('Task started!');
}

// ── submissions list ─────────────────────────────────────────────
function renderInternSubmissions(submissions) {
  const container = document.getElementById('intern-submission-list');
  if (!submissions.length) {
    container.innerHTML = '<div class="empty-state">No submissions yet.</div>';
    return;
  }
  const sorted = [...submissions].sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  container.innerHTML = sorted.slice(0, 5).map(s => {
    const assignment = DB.getAllAssignments().find(a => a.id === s.taskAssignmentId);
    const task       = assignment ? DB.getTask(assignment.taskId) : null;
    const timeStr    = new Date(s.submittedAt).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
    return `
      <div class="activity-item">
        <div class="dot ${s.isLate ? 'orange' : 'green'}"></div>
        <div class="act-text">
          <strong>${task?.title || 'Task'}</strong>${s.isLate ? ' <span style="color:#b96a00;font-size:11px">(late)</span>' : ''}<br>
          ${s.githubUrl ? `<a href="${s.githubUrl}" target="_blank" style="font-size:12px">${s.githubUrl.replace('https://','')}</a>` : ''}
          ${s.notes ? `<span style="font-size:12px;color:#aaa"> — ${s.notes}</span>` : ''}
        </div>
        <div class="act-time">${timeStr}</div>
      </div>`;
  }).join('');
}

// ── activity feed (shared) ───────────────────────────────────────
function renderActivityFeed(items, containerId) {
  const container = document.getElementById(containerId);
  if (!items.length) { container.innerHTML = '<div class="empty-state">No activity yet.</div>'; return; }

  const dotColor = { submission: 'blue', login: 'green', late_login: 'red', status_change: 'orange' };

  container.innerHTML = items.map(item => {
    const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    return `
      <div class="activity-item">
        <div class="dot ${dotColor[item.type] || 'grey'}"></div>
        <div class="act-text">${item.message}</div>
        <div class="act-time">${timeStr}</div>
      </div>`;
  }).join('');
}

// ── attendance calendar ──────────────────────────────────────────
function renderCalendar(attendance) {
  const container = document.getElementById('cal-body');
  const today     = new Date();
  const year      = today.getFullYear();
  const month     = today.getMonth();   // 0-indexed

  // map date strings to status
  const attMap = {};
  attendance.forEach(a => { attMap[a.date] = a; });

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  // shift so Monday=0
  const offset   = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr  = today.toISOString().slice(0, 10);

  let html = '';
  for (let i = 0; i < offset; i++) html += '<div class="cal-day empty"></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dow     = new Date(year, month, d).getDay(); // 0=Sun,6=Sat
    const isWeekend = dow === 0 || dow === 6;
    const isFuture  = dateStr > todayStr;
    const isToday   = dateStr === todayStr;
    const rec       = attMap[dateStr];

    let cls = 'cal-day';
    if (isWeekend || isFuture) cls += ' empty';
    else if (isToday)          cls += ' today';
    else if (rec?.isLate)      cls += ' late';
    else if (rec)              cls += ' present';
    else                       cls += ' absent';

    html += `<div class="${cls}">${d}</div>`;
  }

  container.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════
// ADMIN DASHBOARD RENDER
// ═══════════════════════════════════════════════════════════════
function renderAdminDashboard() {
  const cohort = DB.computeCohortStats();

  // stat cards
  document.getElementById('admin-stat-total').textContent   = cohort.total;
  document.getElementById('admin-stat-active').textContent  = cohort.activeToday;
  document.getElementById('admin-stat-overdue').textContent = cohort.overdue;
  document.getElementById('admin-stat-subs').textContent    = cohort.weekSubs;
  document.getElementById('admin-stat-attend').textContent  = cohort.avgAttend + '%';

  // late login alert
  const alertEl = document.getElementById('late-alert');
  if (cohort.lateLogins.length) {
    alertEl.style.display = 'block';
    alertEl.innerHTML = '⚠ &nbsp;<strong>Late login today:</strong>&nbsp; ' +
      cohort.lateLogins.map(l => `${l.name} (${l.time})`).join(', ') +
      ' — expected start 09:00 AM.';
  } else {
    alertEl.style.display = 'none';
  }

  // intern table
  renderAdminInternTable();

  // activity feed
  renderActivityFeed(DB.getActivityLog(10), 'admin-activity-feed');

  // pending reviews
  renderPendingReviews();
}

function renderAdminInternTable() {
  const interns   = DB.getAllInterns();
  const tbody     = document.getElementById('intern-table-body');
  const today     = new Date().toISOString().slice(0, 10);
  const allAttend = DB.getAllAttendance();

  tbody.innerHTML = interns.map(intern => {
    const stats    = DB.computeStats(intern.id);
    const todayRec = allAttend.find(a => a.internId === intern.id && a.date === today);
    let todayBadge, lastSeen;

    if (todayRec?.status === 'active' && !todayRec.isLate) {
      todayBadge = '<span class="badge green">Active</span>';
      lastSeen   = todayRec.loginTime;
    } else if (todayRec?.isLate) {
      todayBadge = '<span class="badge orange">Late</span>';
      lastSeen   = todayRec.loginTime;
    } else if (todayRec?.status === 'completed') {
      todayBadge = '<span class="badge grey">Left</span>';
      lastSeen   = todayRec.logoutTime;
    } else {
      todayBadge = '<span class="badge red">Absent</span>';
      // find last attendance
      const last = allAttend.filter(a => a.internId === intern.id).sort((a,b) => b.date.localeCompare(a.date))[0];
      lastSeen   = last ? `<span style="color:#e53935">${last.date}</span>` : '—';
    }

    const scoreCls = stats.score >= 80 ? '' : stats.score >= 60 ? 'mid' : 'low';
    const overdueColor = stats.overdue > 0 ? '#b00020' : '#4caf50';

    return `
      <tr>
        <td><div class="intern-name">${intern.name}</div><div class="intern-dept">${intern.department}</div></td>
        <td>${todayBadge}</td>
        <td>${intern.attendanceRate}%</td>
        <td>${stats.completed} / ${stats.assigned}</td>
        <td style="color:${overdueColor};font-weight:bold">${stats.overdue}</td>
        <td><span class="score-chip ${scoreCls}">${stats.score}</span></td>
        <td>${lastSeen}</td>
        <td>
          <button class="btn-secondary" style="font-size:11px;padding:3px 8px"
            onclick="openReviewModalForIntern('${intern.id}')">View</button>
        </td>
      </tr>`;
  }).join('');
}

function renderPendingReviews() {
  const container   = document.getElementById('pending-reviews');
  const assignments = DB.getAllAssignments().filter(a => a.status === 'submitted');

  if (!assignments.length) {
    container.innerHTML = '<div class="empty-state">Nothing pending review.</div>';
    return;
  }

  container.innerHTML = assignments.map(a => {
    const task   = DB.getTask(a.taskId);
    const intern = DB.getIntern(a.internId);
    const sub    = DB.getAllSubmissions().find(s => s.taskAssignmentId === a.id);
    const time   = sub ? new Date(sub.submittedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '—';
    return `
      <div class="task-item">
        <div class="task-left">
          <div class="task-title">${task?.title || '—'}</div>
          <div class="task-meta">${intern?.name || '—'} · submitted ${time}</div>
        </div>
        <span class="inline-link" onclick="openReviewModal('${a.id}')">Review →</span>
      </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
// SUBMIT TASK MODAL
// ═══════════════════════════════════════════════════════════════
let _activeAssignmentId = null;

function openSubmitModal(assignmentId) {
  _activeAssignmentId = assignmentId;

  // populate task dropdown to the right one
  const sel = document.getElementById('submit-task-select');
  const assignments = DB.getAssignmentsForIntern(currentInternId)
    .filter(a => ['in_progress','overdue','not_started'].includes(a.status));

  sel.innerHTML = assignments.map(a => {
    const task = DB.getTask(a.taskId);
    return `<option value="${a.id}" ${a.id === assignmentId ? 'selected' : ''}>${task?.title || a.id}</option>`;
  }).join('');

  document.getElementById('submit-github').value = '';
  document.getElementById('submit-notes').value  = '';
  document.getElementById('submit-modal').classList.add('open');
}

function closeSubmitModal() {
  document.getElementById('submit-modal').classList.remove('open');
  _activeAssignmentId = null;
}

async function doSubmit() {
  const assignmentId = document.getElementById('submit-task-select').value;
  const githubUrl    = document.getElementById('submit-github').value.trim();
  const notes        = document.getElementById('submit-notes').value.trim();

  if (!assignmentId) { toast('Please select a task.', true); return; }
  if (!githubUrl && !document.getElementById('submit-file').files.length) {
    toast('Add a GitHub URL or upload a file.', true); return;
  }

  const assignment = DB.getAllAssignments().find(a => a.id === assignmentId);
  if (!assignment) return;

  await DB.addSubmission({
    taskAssignmentId: assignmentId,
    internId:         currentInternId,
    githubUrl,
    notes,
    files: []
  });

  closeSubmitModal();
  toast('Task submitted successfully! Timestamp: ' + new Date().toLocaleString());
  renderInternDashboard();
}

// ═══════════════════════════════════════════════════════════════
// ASSIGN TASK MODAL (admin)
// ═══════════════════════════════════════════════════════════════
function openAssignModal() {
  // populate intern list
  const sel = document.getElementById('assign-intern-select');
  const interns = DB.getAllInterns();
  sel.innerHTML = `<option value="all">All Interns</option>` +
    interns.map(i => `<option value="${i.id}">${i.name}</option>`).join('');

  document.getElementById('assign-title').value    = '';
  document.getElementById('assign-desc').value     = '';
  document.getElementById('assign-deadline').value = '';
  document.getElementById('assign-modal').classList.add('open');
}

function closeAssignModal() {
  document.getElementById('assign-modal').classList.remove('open');
}

async function doAssign() {
  const title    = document.getElementById('assign-title').value.trim();
  const desc     = document.getElementById('assign-desc').value.trim();
  const deadline = document.getElementById('assign-deadline').value;
  const priority = document.getElementById('assign-priority').value;
  const internSel= document.getElementById('assign-intern-select').value;

  if (!title || !deadline) { toast('Title and deadline are required.', true); return; }

  const task = await DB.addTask({ title, description: desc, deadline, priority, createdBy: 'a1' });

  const interns = internSel === 'all' ? DB.getAllInterns().map(i => i.id) : [internSel];
  for (const iid of interns) {
    await DB.addAssignment({ taskId: task.id, internId: iid, status: 'not_started' });
  }

  closeAssignModal();
  toast(`Task assigned to ${interns.length} intern${interns.length !== 1 ? 's' : ''}!`);
  renderAdminDashboard();
}

// ═══════════════════════════════════════════════════════════════
// REVIEW MODAL (admin)
// ═══════════════════════════════════════════════════════════════
let _reviewAssignmentId = null;

function openReviewModal(assignmentId) {
  _reviewAssignmentId = assignmentId;
  const assignment = DB.getAllAssignments().find(a => a.id === assignmentId);
  const task       = assignment ? DB.getTask(assignment.taskId) : null;
  const intern     = assignment ? DB.getIntern(assignment.internId) : null;
  const sub        = DB.getAllSubmissions().find(s => s.taskAssignmentId === assignmentId);

  document.getElementById('review-title').textContent  = task?.title || '—';
  document.getElementById('review-intern').textContent = intern?.name || '—';
  document.getElementById('review-time').textContent   = sub
    ? new Date(sub.submittedAt).toLocaleString('en-IN') : '—';
  document.getElementById('review-github').innerHTML   = sub?.githubUrl
    ? `<a href="${sub.githubUrl}" target="_blank">${sub.githubUrl}</a>` : '—';
  document.getElementById('review-notes').textContent  = sub?.notes || '(none)';
  document.getElementById('review-late').textContent   = sub?.isLate ? '⚠ Late submission' : '✓ On time';
  document.getElementById('review-late').style.color   = sub?.isLate ? '#b00020' : '#2a7a3b';
  document.getElementById('review-feedback').value     = '';
  document.getElementById('review-modal').classList.add('open');
}

function openReviewModalForIntern(internId) {
  // open first submitted task for this intern
  const a = DB.getAllAssignments().find(a => a.internId === internId && a.status === 'submitted');
  if (a) openReviewModal(a.id);
  else toast('No pending submissions for this intern.');
}

function closeReviewModal() {
  document.getElementById('review-modal').classList.remove('open');
  _reviewAssignmentId = null;
}

async function doMarkReviewed() {
  const feedback = document.getElementById('review-feedback').value.trim();
  await DB.updateAssignmentStatus(_reviewAssignmentId, 'reviewed', feedback);
  closeReviewModal();
  toast('Marked as reviewed!');
  renderAdminDashboard();
}

async function doRequestRevision() {
  const feedback = document.getElementById('review-feedback').value.trim();
  if (!feedback) { toast('Please add feedback before requesting revision.', true); return; }
  await DB.updateAssignmentStatus(_reviewAssignmentId, 'in_progress', feedback);
  closeReviewModal();
  toast('Revision requested — intern notified.');
  renderAdminDashboard();
}

// ── close modals on bg click ─────────────────────────────────────
['submit-modal','assign-modal','review-modal'].forEach(id => {
  document.getElementById(id)?.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });
});

// ── toast ────────────────────────────────────────────────────────
function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = 'show' + (isError ? ' error' : '');
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ''; }, 3200);
}
