
const DB = (() => {

  let _data        = null;
  let _fileHandle  = null;
  let _mode        = 'not_loaded'; // 'fsa' | 'readonly' | 'not_loaded'

  // ── called on page load — just fetch,
  async function init() {
    try {
      const res = await fetch('./db/db.json');
      if (!res.ok) throw new Error('fetch failed');
      _data = await res.json();
      _mode = 'readonly';
      setStatus('ⓘ Read-only mode. Click "Connect Database" to enable live saves.');
      return true;
    } catch (e) {
      setStatus('✗ Could not load db.json — make sure the file is in the db/ folder.');
      return false;
    }
  }

  // ── called by the "Connect Database" button (user gesture) ──
  async function connectFile() {
    if (!('showOpenFilePicker' in window)) {
      setStatus('⚠ Your browser does not support file write-back. Use Chrome or Edge.');
      return false;
    }
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'JSON Database', accept: { 'application/json': ['.json'] } }],
        multiple: false,
        startIn: 'documents'
      });
      _fileHandle = handle;
      const file  = await handle.getFile();
      const text  = await file.text();
      _data = JSON.parse(text);
      _mode = 'fsa';
      setStatus('✓ Connected — changes save directly to db.json');
      showConnectBtn(false);
      return true;
    } catch (e) {
      if (e.name !== 'AbortError') {
        setStatus('✗ Could not open file: ' + e.message);
      }
      return false;
    }
  }

  // ── write back to disk ──────────────────────────────────────
  async function _save() {
    if (_mode !== 'fsa' || !_fileHandle) return;
    try {
      const writable = await _fileHandle.createWritable();
      await writable.write(JSON.stringify(_data, null, 2));
      await writable.close();
      setStatus('✓ Saved to db.json at ' + new Date().toLocaleTimeString());
    } catch (e) {
      setStatus('⚠ Save failed — ' + e.message);
    }
  }

  function setStatus(msg) {
    ['db-status-bar', 'db-status-bar-2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = msg;
    });
  }

  function showConnectBtn(visible) {
    const btn = document.getElementById('connect-db-btn');
    if (btn) btn.style.display = visible ? 'inline-block' : 'none';
  }

  // ── USERS / AUTH ────────────────────────────────────────────
  function findUser(identifier, password, role) {
    return _data.users.find(u => {
      if (u.role !== role) return false;
      if (u.password !== password) return false;
      if (role === 'admin') return u.username === identifier;
      return u.email === identifier || u.phone === identifier;
    }) || null;
  }

  // ── INTERNS ─────────────────────────────────────────────────
  function getIntern(internId) {
    return _data.interns.find(i => i.id === internId) || null;
  }
  function getAllInterns() { return _data.interns; }

  // ── TASKS ───────────────────────────────────────────────────
  function getTask(taskId) {
    return _data.tasks.find(t => t.id === taskId) || null;
  }
  function getAllTasks() { return _data.tasks; }

  async function addTask(task) {
    task.id        = 't' + Date.now();
    task.createdAt = new Date().toISOString();
    _data.tasks.push(task);
    await _save();
    return task;
  }

  // ── TASK ASSIGNMENTS ────────────────────────────────────────
  function getAssignmentsForIntern(internId) {
    return _data.taskAssignments.filter(a => a.internId === internId);
  }
  function getAllAssignments() { return _data.taskAssignments; }

  async function updateAssignmentStatus(assignmentId, status, feedback) {
    const a = _data.taskAssignments.find(a => a.id === assignmentId);
    if (!a) return false;
    a.status = status;
    if (feedback !== undefined) a.feedback = feedback;
    if (status === 'reviewed') a.reviewedAt = new Date().toISOString();
    await _save();
    return true;
  }

  async function addAssignment(assignment) {
    assignment.id          = 'ta' + Date.now();
    assignment.assignedAt  = new Date().toISOString();
    assignment.reviewedAt  = null;
    assignment.feedback    = '';
    _data.taskAssignments.push(assignment);
    await _save();
    return assignment;
  }

  // ── SUBMISSIONS ─────────────────────────────────────────────
  function getSubmissionsForIntern(internId) {
    return _data.submissions.filter(s => s.internId === internId);
  }
  function getAllSubmissions() { return _data.submissions; }

  async function addSubmission(sub) {
    sub.id          = 's' + Date.now();
    sub.submittedAt = new Date().toISOString();
    sub.files       = sub.files || [];

    const assignment = _data.taskAssignments.find(a => a.id === sub.taskAssignmentId);
    if (assignment) {
      const task  = _data.tasks.find(t => t.id === assignment.taskId);
      sub.isLate  = task ? new Date(sub.submittedAt) > new Date(task.deadline) : false;
      assignment.status = 'submitted';
    }

    _data.submissions.push(sub);

    const intern = _data.interns.find(i => i.id === sub.internId);
    const task   = assignment ? _data.tasks.find(t => t.id === assignment.taskId) : null;
    _data.activityLog.unshift({
      id:        'act' + Date.now(),
      internId:  sub.internId,
      type:      'submission',
      message:   (intern?.name || 'Intern') + ' submitted ' + (task?.title || 'a task'),
      timestamp: sub.submittedAt
    });

    await _save();
    return sub;
  }

  // ── ATTENDANCE ──────────────────────────────────────────────
  function getAttendanceForIntern(internId) {
    return _data.attendance.filter(a => a.internId === internId);
  }
  function getAllAttendance() { return _data.attendance; }

  async function recordLogin(internId, localTime) {
    const now     = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const existing = _data.attendance.find(a => a.internId === internId && a.date === dateStr);
    if (existing) return existing;

    const intern     = _data.interns.find(i => i.id === internId);
    const [expH, expM] = (intern?.expectedStartTime || '09:00').split(':').map(Number);
    const isLate     = (now.getHours() * 60 + now.getMinutes()) > (expH * 60 + expM + 15);

    const record = {
      id: 'att' + Date.now(), internId, date: dateStr,
      loginTime:  now.toTimeString().slice(0, 5),
      localTime:  localTime || now.toTimeString().slice(0, 5),
      logoutTime: null, durationMin: null, isLate, status: 'active'
    };
    _data.attendance.unshift(record);

    _data.activityLog.unshift({
      id: 'act' + Date.now() + 'l', internId,
      type:      isLate ? 'late_login' : 'login',
      message:   (intern?.name || 'Intern') + (isLate ? ' logged in late' : ' logged in'),
      timestamp: now.toISOString()
    });

    await _save();
    return record;
  }

  async function recordLogout(internId) {
    const dateStr = new Date().toISOString().slice(0, 10);
    const record  = _data.attendance.find(a => a.internId === internId && a.date === dateStr && a.status === 'active');
    if (!record) return;
    const now          = new Date();
    record.logoutTime  = now.toTimeString().slice(0, 5);
    record.status      = 'completed';
    const [lH, lM]    = record.loginTime.split(':').map(Number);
    record.durationMin = (now.getHours() * 60 + now.getMinutes()) - (lH * 60 + lM);
    await _save();
  }

  // ── ACTIVITY LOG ────────────────────────────────────────────
  function getActivityLog(limit) { return _data.activityLog.slice(0, limit || 20); }
  function getActivityForIntern(internId, limit) {
    return _data.activityLog.filter(a => a.internId === internId).slice(0, limit || 10);
  }

  // ── STATS ───────────────────────────────────────────────────
  function computeStats(internId) {
    const assignments = getAssignmentsForIntern(internId);
    const assigned    = assignments.length;
    const overdue     = assignments.filter(a => {
      if (['submitted','reviewed'].includes(a.status)) return false;
      const task = _data.tasks.find(t => t.id === a.taskId);
      return task && new Date() > new Date(task.deadline);
    }).length;
    const completed   = assignments.filter(a => ['submitted','reviewed'].includes(a.status)).length;
    const pending     = assigned - completed - overdue;
    const subs        = getSubmissionsForIntern(internId);
    const onTime      = subs.filter(s => !s.isLate).length;
    const attend      = getIntern(internId)?.attendanceRate || 0;
    const completionRate = assigned ? (completed / assigned) * 100 : 0;
    const onTimeRate     = subs.length ? (onTime / subs.length) * 100 : 100;
    const score = Math.round(0.35 * attend + 0.40 * completionRate + 0.25 * onTimeRate);
    return { assigned, completed, overdue, pending, score, attend, subs: subs.length };
  }

  function computeCohortStats() {
    const today    = new Date().toISOString().slice(0, 10);
    const weekAgo  = new Date(Date.now() - 7 * 86400000).toISOString();
    const active   = _data.attendance.filter(a => a.date === today && a.status === 'active');
    const late     = _data.attendance.filter(a => a.date === today && a.isLate);
    const overdue  = _data.taskAssignments.filter(a => {
      if (['submitted','reviewed'].includes(a.status)) return false;
      const task = _data.tasks.find(t => t.id === a.taskId);
      return task && new Date() > new Date(task.deadline);
    }).length;
    const weekSubs = _data.submissions.filter(s => s.submittedAt >= weekAgo).length;
    const avgAttend = _data.interns.length
      ? Math.round(_data.interns.reduce((s, i) => s + i.attendanceRate, 0) / _data.interns.length) : 0;

    return {
      total: _data.interns.length,
      activeToday: active.length,
      lateLogins: late.map(a => ({
        name: _data.interns.find(i => i.id === a.internId)?.name || '?',
        time: a.loginTime
      })),
      overdue, weekSubs, avgAttend
    };
  }

  // ── PUBLIC API ───────────────────────────────────────────────
  return {
    init, connectFile,
    findUser,
    getIntern, getAllInterns,
    getTask, getAllTasks, addTask,
    getAssignmentsForIntern, getAllAssignments, updateAssignmentStatus, addAssignment,
    getSubmissionsForIntern, getAllSubmissions, addSubmission,
    getAttendanceForIntern, getAllAttendance, recordLogin, recordLogout,
    getActivityLog, getActivityForIntern,
    computeStats, computeCohortStats,
    mode: () => _mode
  };
})();
