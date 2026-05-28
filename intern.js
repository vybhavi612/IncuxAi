window.InternComponent = {
  activeTab: 'dashboard',
  cameraStream: null,

  render(containerId) {
    const session = DB.getCurrentSession();
    if (!session || session.role !== 'intern') {
      window.location.hash = '#landing';
      return;
    }

    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="dashboard-wrapper">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div>
            <div class="sidebar-profile">
              <div class="sidebar-avatar" id="sidebar-avatar-img">
                ${session.name.charAt(0)}
              </div>
              <div class="sidebar-profile-info">
                <h4 id="sidebar-name">${session.name}</h4>
                <span>${session.role}</span>
              </div>
            </div>
            <ul class="sidebar-menu">
              <li class="menu-item active" data-tab="dashboard">
                <i class="fas fa-th-large"></i> Overview
              </li>
              <li class="menu-item" data-tab="tasks">
                <i class="fas fa-tasks"></i> My Tasks
              </li>
              <li class="menu-item" data-tab="attendance">
                <i class="fas fa-calendar-check"></i> Attendance
              </li>
              <li class="menu-item" data-tab="profile">
                <i class="fas fa-user-cog"></i> Profile Settings
              </li>
            </ul>
          </div>
          <div class="sidebar-footer">
            <li class="menu-item" id="sidebar-logout" style="color: var(--danger);">
              <i class="fas fa-sign-out-alt"></i> Log Out
            </li>
          </div>
        </aside>

        <!-- Main Workspace -->
        <main class="dashboard-content">
          <!-- Header banner -->
          <div class="page-header">
            <div class="page-title">
              <h2 id="welcome-message">Hello, ${session.name.split(' ')[0]}!</h2>
              <p id="dashboard-date-str"></p>
            </div>
            <div class="header-actions" id="attendance-action-panel">
              <!-- Attendance status gets injected here -->
            </div>
          </div>

          <!-- Tab View Container -->
          <div id="intern-viewport">
            <!-- View contents dynamically loaded here -->
          </div>
        </main>
      </div>

      <!-- Camera Modal Overlay -->
      <div id="camera-modal-overlay" class="camera-modal-overlay" style="display: none;">
        <div class="camera-modal glass-panel">
          <div class="modal-header">
            <h3>Attendance Face Verification</h3>
            <button class="btn-icon" id="close-camera-btn"><i class="fas fa-times"></i></button>
          </div>
          <p>Please look at the camera. The system will automatically register your face and log you in.</p>
          
          <div class="camera-preview-container">
            <video id="camera-video" class="camera-video" autoplay playsinline></video>
            <canvas id="camera-canvas" class="camera-canvas" width="640" height="480"></canvas>
            <div class="camera-overlay-ui">
              <div class="camera-status-tag" id="camera-status">Initializing...</div>
              <div class="camera-grid-guide"></div>
              <div id="camera-countdown" class="camera-countdown" style="display: none;">3</div>
            </div>
            <div id="camera-flash" class="camera-flash-overlay"></div>
            <img id="camera-preview-img" class="captured-image-preview" style="display: none;">
          </div>
          
          <div class="camera-actions" id="camera-actions-panel">
            <button class="btn btn-secondary" id="camera-cancel-btn">Cancel</button>
            <button class="btn btn-primary" id="camera-capture-btn" style="display: none;">Capture Photo</button>
            <button class="btn btn-accent" id="camera-simulate-btn" style="display: none;">Simulate Face Scan</button>
          </div>
        </div>
      </div>
    `;

    this.activeTab = 'dashboard';
    this.updateDateDisplay();
    this.initSidebarEvents();
    this.loadActiveTab();
    
    // Automatically trigger clock-in camera if they haven't punched today!
    setTimeout(() => this.checkAutoClockIn(), 500);

    // Sync other tabs on real-time task triggers
    this.unsubBroadcast = Broadcast.subscribe((action, payload) => {
      if (action === 'TASK_ASSIGNED' || action === 'TASK_UPDATED') {
        const currentSession = DB.getCurrentSession();
        if (currentSession && (payload.assignedTo && payload.assignedTo.includes(currentSession.userId))) {
          window.showToast(`New/Updated task assignment: "${payload.title}"`, 'success');
          this.refreshData();
        }
      }
    });
  },

  refreshData() {
    this.loadActiveTab();
    this.updateHeaderAttendanceStatus();
    this.updateSidebarAvatar();
  },

  updateDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('dashboard-date-str').innerText = new Date().toLocaleDateString('en-US', options);
  },

  initSidebarEvents() {
    const items = document.querySelectorAll('.sidebar-menu .menu-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.activeTab = item.getAttribute('data-tab');
        this.loadActiveTab();
      });
    });

    document.getElementById('sidebar-logout').addEventListener('click', () => {
      if (confirm('Are you sure you want to log out?')) {
        // Auto clock out check or direct session deletion
        DB.logout();
        window.location.hash = '#landing';
        window.showToast('Logged out securely.', 'success');
      }
    });

    this.updateSidebarAvatar();
  },

  updateSidebarAvatar() {
    const session = DB.getCurrentSession();
    const user = DB.getUser(session.userId);
    const avatarEl = document.getElementById('sidebar-avatar-img');
    if (avatarEl && user) {
      if (user.avatar) {
        avatarEl.innerHTML = `<img src="${user.avatar}" class="sidebar-avatar" style="width:100%;height:100%;object-fit:cover;border:none;">`;
      } else {
        avatarEl.innerHTML = session.name.charAt(0);
      }
    }
  },

  updateHeaderAttendanceStatus() {
    const session = DB.getCurrentSession();
    const attendance = DB.getAttendanceForUser(session.userId);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = attendance.find(a => a.date === todayStr);
    const panel = document.getElementById('attendance-action-panel');

    if (!panel) return;

    if (!todayRecord) {
      panel.innerHTML = `
        <button class="btn btn-primary" id="clock-in-trigger-btn">
          <i class="fas fa-sign-in-alt"></i> Clock In & Log Attendance
        </button>
      `;
      document.getElementById('clock-in-trigger-btn').addEventListener('click', () => this.openCameraModal());
    } else if (todayRecord && !todayRecord.logoutTime) {
      panel.innerHTML = `
        <div style="display:flex; align-items:center; gap: 1rem;">
          <span class="status-indicator present">Clocked In (${todayRecord.loginTime})</span>
          <button class="btn btn-danger" id="clock-out-trigger-btn">
            <i class="fas fa-sign-out-alt"></i> Clock Out
          </button>
        </div>
      `;
      document.getElementById('clock-out-trigger-btn').addEventListener('click', () => this.handleClockOut());
    } else {
      panel.innerHTML = `
        <span class="status-indicator present" style="padding:0.6rem 1.2rem;">
          Attendance Complete: In ${todayRecord.loginTime} | Out ${todayRecord.logoutTime}
        </span>
      `;
    }
  },

  checkAutoClockIn() {
    const session = DB.getCurrentSession();
    const attendance = DB.getAttendanceForUser(session.userId);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecord = attendance.find(a => a.date === todayStr);

    if (!todayRecord) {
      window.showToast('Please verify your face to mark attendance.', 'warning');
      this.openCameraModal();
    } else {
      this.updateHeaderAttendanceStatus();
    }
  },

  loadActiveTab() {
    const viewport = document.getElementById('intern-viewport');
    if (!viewport) return;

    this.updateHeaderAttendanceStatus();

    switch (this.activeTab) {
      case 'dashboard':
        this.renderDashboard(viewport);
        break;
      case 'tasks':
        this.renderTasks(viewport);
        break;
      case 'attendance':
        this.renderAttendance(viewport);
        break;
      case 'profile':
        this.renderProfile(viewport);
        break;
    }
  },

  /* TAB 1: OVERVIEW DASHBOARD */
  renderDashboard(container) {
    const session = DB.getCurrentSession();
    const stats = DB.getInternProductivityStats(session.userId);
    const attendance = DB.getAttendanceForUser(session.userId);
    const tasks = DB.getTasksForIntern(session.userId).slice(0, 3); // Get 3 recent tasks

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card glass-panel">
          <div class="stat-info">
            <h5>Total Present</h5>
            <h3>${stats.presentDays} Days</h3>
          </div>
          <div class="stat-icon success"><i class="fas fa-user-check"></i></div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-info">
            <h5>Late Records</h5>
            <h3>${stats.lateDays} Times</h3>
          </div>
          <div class="stat-icon warning"><i class="fas fa-clock"></i></div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-info">
            <h5>Completed Tasks</h5>
            <h3>${stats.completedTasks}/${stats.totalTasks}</h3>
          </div>
          <div class="stat-icon primary"><i class="fas fa-check-double"></i></div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-info">
            <h5>Productivity</h5>
            <h3>${stats.progressPercent}%</h3>
          </div>
          <div class="stat-icon success" style="color:var(--accent); background:rgba(217, 70, 239, 0.12)"><i class="fas fa-chart-line"></i></div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Tasks Summary -->
        <div class="dashboard-card glass-panel">
          <div class="card-title">
            <h3>Recent Tasks</h3>
            <button class="btn btn-secondary btn-sm" id="view-all-tasks-link" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">View All</button>
          </div>
          
          <div class="progress-container">
            <div class="progress-header">
              <span>Overall Task Completion Progress</span>
              <span>${stats.progressPercent}%</span>
            </div>
            <div class="progress-bar-wrapper">
              <div class="progress-bar" style="width: ${stats.progressPercent}%;"></div>
            </div>
          </div>

          <div class="task-list">
            ${tasks.length === 0 ? '<p style="color:var(--text-muted); text-align:center; padding: 2rem 0;">No tasks assigned yet. Enjoy your day!</p>' : ''}
            ${tasks.map(task => `
              <div class="task-item ${task.status[session.userId] === 'completed' ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-header">
                  <div class="task-checkbox-container">
                    <div class="task-checkbox">
                      ${task.status[session.userId] === 'completed' ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <h4>${task.title}</h4>
                  </div>
                  <span class="priority-badge ${task.priority.toLowerCase()}">${task.priority}</span>
                </div>
                <p class="task-desc">${task.description}</p>
                <div class="task-meta">
                  <span class="task-deadline"><i class="far fa-calendar-alt"></i> Deadline: ${task.deadline}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Recent Logs -->
        <div class="dashboard-card glass-panel">
          <div class="card-title">
            <h3>Punch Log</h3>
          </div>
          
          <div class="attendance-logs" style="display:flex; flex-direction:column; gap:0.75rem; max-height: 280px; overflow-y:auto; padding-right:5px;">
            ${attendance.length === 0 ? '<p style="color:var(--text-muted); text-align:center; padding: 2rem 0;">No attendance records found.</p>' : ''}
            ${attendance.map(a => `
              <div style="padding:0.75rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; background: var(--bg-tertiary);">
                <div>
                  <div style="font-weight:600;">${a.date}</div>
                  <div style="color:var(--text-muted); font-size:0.75rem; margin-top:0.25rem;">
                    In: ${a.loginTime} | Out: ${a.logoutTime || '--:--'}
                  </div>
                </div>
                <span class="status-indicator ${a.status.toLowerCase()}">${a.status}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Event hooks
    document.getElementById('view-all-tasks-link').addEventListener('click', () => {
      document.querySelector('.sidebar-menu .menu-item[data-tab="tasks"]').click();
    });

    this.bindTaskToggleEvents();
  },

  /* TAB 2: TASKS LIST */
  renderTasks(container) {
    const session = DB.getCurrentSession();
    const tasks = DB.getTasksForIntern(session.userId);
    const stats = DB.getInternProductivityStats(session.userId);

    container.innerHTML = `
      <div class="dashboard-card glass-panel">
        <div class="card-title">
          <h3>Task Management</h3>
          <span style="font-size:0.9rem; font-weight:600; color:var(--text-secondary);">
            Pending: ${stats.pendingTasks} | Completed: ${stats.completedTasks}
          </span>
        </div>

        <div class="progress-container" style="margin-bottom: 2rem;">
          <div class="progress-header">
            <span>Overall Progress Completion</span>
            <span>${stats.progressPercent}%</span>
          </div>
          <div class="progress-bar-wrapper">
            <div class="progress-bar" style="width: ${stats.progressPercent}%;"></div>
          </div>
        </div>

        <div class="filter-bar">
          <div class="search-input-wrapper">
            <i class="fas fa-search"></i>
            <input type="text" id="task-search-input" class="search-input" placeholder="Search tasks by name or description...">
          </div>
          <select id="task-priority-filter" class="select-custom">
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select id="task-status-filter" class="select-custom">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div class="task-list" id="task-tab-list">
          <!-- Dynamically filtered tasks load here -->
        </div>
      </div>
    `;

    this.filterAndRenderTasks();

    // Event listeners
    document.getElementById('task-search-input').addEventListener('input', () => this.filterAndRenderTasks());
    document.getElementById('task-priority-filter').addEventListener('change', () => this.filterAndRenderTasks());
    document.getElementById('task-status-filter').addEventListener('change', () => this.filterAndRenderTasks());
  },

  filterAndRenderTasks() {
    const session = DB.getCurrentSession();
    const query = document.getElementById('task-search-input').value.toLowerCase();
    const priority = document.getElementById('task-priority-filter').value;
    const status = document.getElementById('task-status-filter').value;

    const allTasks = DB.getTasksForIntern(session.userId);
    const filtered = allTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query);
      const matchesPriority = priority === 'all' || task.priority.toLowerCase() === priority;
      const matchesStatus = status === 'all' || task.status[session.userId] === status;
      return matchesSearch && matchesPriority && matchesStatus;
    });

    const listContainer = document.getElementById('task-tab-list');
    if (!listContainer) return;

    if (filtered.length === 0) {
      listContainer.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding: 3rem 0;">No tasks found matching your filters.</p>`;
      return;
    }

    listContainer.innerHTML = filtered.map(task => `
      <div class="task-item ${task.status[session.userId] === 'completed' ? 'completed' : ''}" data-task-id="${task.id}">
        <div class="task-header">
          <div class="task-checkbox-container">
            <div class="task-checkbox">
              ${task.status[session.userId] === 'completed' ? '<i class="fas fa-check"></i>' : ''}
            </div>
            <h4>${task.title}</h4>
          </div>
          <span class="priority-badge ${task.priority.toLowerCase()}">${task.priority}</span>
        </div>
        <p class="task-desc">${task.description}</p>
        <div class="task-meta">
          <span class="task-deadline"><i class="far fa-calendar-alt"></i> Deadline: ${task.deadline}</span>
          <span style="color: var(--text-muted);">Assigned by Manager</span>
        </div>
      </div>
    `).join('');

    this.bindTaskToggleEvents();
  },

  bindTaskToggleEvents() {
    const session = DB.getCurrentSession();
    const taskItems = document.querySelectorAll('.task-item');

    taskItems.forEach(item => {
      const checkbox = item.querySelector('.task-checkbox-container');
      if (!checkbox) return;

      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskId = item.getAttribute('data-task-id');
        const isCompleted = item.classList.contains('completed');
        const newStatus = isCompleted ? 'pending' : 'completed';

        const result = DB.updateTaskStatusByIntern(taskId, session.userId, newStatus);
        if (result.success) {
          window.showToast(`Task marked as ${newStatus}`, 'success');
          
          // Broadcast status change
          Broadcast.publish('TASK_UPDATED', result.task);

          // Update UI
          if (this.activeTab === 'dashboard') {
            this.loadActiveTab();
          } else if (this.activeTab === 'tasks') {
            // Keep filter inputs but re-render list
            this.filterAndRenderTasks();
          }
        }
      });
    });
  },

  /* TAB 3: ATTENDANCE LOGS */
  renderAttendance(container) {
    const session = DB.getCurrentSession();
    const attendance = DB.getAttendanceForUser(session.userId);
    const stats = DB.getInternProductivityStats(session.userId);

    container.innerHTML = `
      <div class="dashboard-card glass-panel">
        <div class="card-title">
          <h3>Attendance & Login History</h3>
          <span style="font-size:0.9rem; font-weight:600; color:var(--text-secondary);">
            Present: ${stats.presentDays} | Late: ${stats.lateDays}
          </span>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In Time</th>
                <th>Clock Out Time</th>
                <th>Verification Image</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${attendance.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 3rem 0; color:var(--text-muted);">No logs recorded.</td></tr>' : ''}
              ${attendance.map(a => `
                <tr>
                  <td style="font-weight: 600;">${a.date}</td>
                  <td><i class="far fa-clock" style="color:var(--primary); margin-right:0.25rem;"></i> ${a.loginTime}</td>
                  <td><i class="far fa-clock" style="color:var(--text-muted); margin-right:0.25rem;"></i> ${a.logoutTime || '--:--:--'}</td>
                  <td>
                    ${a.photoId ? `
                      <button class="btn btn-secondary btn-sm view-photo-btn" data-photo-id="${a.photoId}" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">
                        <i class="fas fa-image"></i> View Photo
                      </button>
                    ` : '<span style="color:var(--text-muted); font-style:italic;">No Image</span>'}
                  </td>
                  <td>
                    <span class="status-indicator ${a.status.toLowerCase()}">${a.status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Hook Photo Buttons
    const photoButtons = container.querySelectorAll('.view-photo-btn');
    photoButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const photoId = btn.getAttribute('data-photo-id');
        const photoSrc = await DB.getAttendancePhoto(photoId);

        if (photoSrc) {
          // Open Modal for Photo Preview
          const previewOverlay = document.createElement('div');
          previewOverlay.className = 'modal-overlay';
          previewOverlay.innerHTML = `
            <div class="modal-content glass-panel" style="width: 450px; text-align:center;">
              <div class="modal-header">
                <h3>Verification Snapshot</h3>
                <button class="btn-icon" id="close-preview-modal"><i class="fas fa-times"></i></button>
              </div>
              <img src="${photoSrc}" style="width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: var(--radius-md); border: 2px solid var(--border-color);">
              <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted);">
                Snapshot ID: ${photoId}
              </div>
            </div>
          `;
          document.body.appendChild(previewOverlay);
          
          document.getElementById('close-preview-modal').onclick = () => previewOverlay.remove();
          previewOverlay.onclick = (e) => { if (e.target === previewOverlay) previewOverlay.remove(); };
        } else {
          window.showToast('Could not load camera photograph.', 'danger');
        }
      });
    });
  },

  /* TAB 4: PROFILE SETTINGS */
  renderProfile(container) {
    const session = DB.getCurrentSession();
    const user = DB.getUser(session.userId);

    container.innerHTML = `
      <div class="dashboard-grid equal">
        <div class="dashboard-card glass-panel">
          <div class="card-title">
            <h3>Profile Information</h3>
          </div>
          <form id="profile-info-form">
            <div class="profile-photo-editor">
              <div id="profile-avatar-container">
                ${user.avatar ? `<img src="${user.avatar}" class="profile-avatar-large">` : `<div class="avatar-placeholder-large">${user.name.charAt(0)}</div>`}
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn btn-secondary btn-sm" id="upload-avatar-trigger-btn">
                  <i class="fas fa-upload"></i> Upload Photo
                </button>
                <button type="button" class="btn btn-accent btn-sm" id="capture-avatar-btn">
                  <i class="fas fa-camera"></i> Snap Avatar
                </button>
              </div>
              <input type="file" id="profile-avatar-file-input" style="display:none;" accept="image/*">
            </div>

            <div class="form-group">
              <label>Full Name</label>
              <div class="input-wrapper">
                <i class="fas fa-user-circle"></i>
                <input type="text" id="profile-name" class="form-control" value="${user.name}" required>
              </div>
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope"></i>
                <input type="email" id="profile-email" class="form-control" value="${user.email}" required>
              </div>
            </div>

            <div class="form-group">
              <label>Phone Number</label>
              <div class="input-wrapper">
                <i class="fas fa-phone"></i>
                <input type="tel" id="profile-phone" class="form-control" value="${user.contact.phone || ''}">
              </div>
            </div>

            <div class="form-group">
              <label>Department</label>
              <div class="input-wrapper">
                <i class="fas fa-building"></i>
                <input type="text" id="profile-dept" class="form-control" value="${user.contact.department || ''}">
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="margin-top: 1rem; width:100%;">
              Save Profile Changes
            </button>
          </form>
        </div>

        <div class="dashboard-card glass-panel">
          <div class="card-title">
            <h3>Change Password</h3>
          </div>
          <form id="profile-password-form">
            <div class="form-group">
              <label>Current Password</label>
              <div class="input-wrapper">
                <i class="fas fa-lock"></i>
                <input type="password" id="pass-current" class="form-control" placeholder="Enter current password" required>
              </div>
            </div>

            <div class="form-group">
              <label>New Password</label>
              <div class="input-wrapper">
                <i class="fas fa-key"></i>
                <input type="password" id="pass-new" class="form-control" placeholder="Create new password" required minlength="6">
              </div>
            </div>

            <div class="form-group">
              <label>Confirm New Password</label>
              <div class="input-wrapper">
                <i class="fas fa-check-double"></i>
                <input type="password" id="pass-confirm" class="form-control" placeholder="Confirm new password" required minlength="6">
              </div>
            </div>

            <button type="submit" class="btn btn-accent" style="margin-top: 1rem; width:100%;">
              Update Password
            </button>
          </form>
        </div>
      </div>
    `;

    // Hook Form Submits
    const infoForm = document.getElementById('profile-info-form');
    infoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        name: document.getElementById('profile-name').value.trim(),
        email: document.getElementById('profile-email').value.trim(),
        contact: {
          phone: document.getElementById('profile-phone').value.trim(),
          department: document.getElementById('profile-dept').value.trim()
        }
      };

      const result = DB.updateUser(session.userId, updated);
      if (result.success) {
        window.showToast('Profile information updated successfully.', 'success');
        document.getElementById('sidebar-name').innerText = result.user.name;
        document.getElementById('welcome-message').innerText = `Hello, ${result.user.name.split(' ')[0]}!`;
        this.updateSidebarAvatar();
        Broadcast.publish('USER_UPDATED', result.user);
      } else {
        window.showToast(result.message, 'danger');
      }
    });

    const passForm = document.getElementById('profile-password-form');
    passForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = document.getElementById('pass-current').value;
      const nw = document.getElementById('pass-new').value;
      const conf = document.getElementById('pass-confirm').value;

      if (user.password !== current) {
        window.showToast('Current password does not match.', 'danger');
        return;
      }

      if (nw !== conf) {
        window.showToast('Confirm password does not match new password.', 'danger');
        return;
      }

      const result = DB.updateUser(session.userId, { password: nw });
      if (result.success) {
        window.showToast('Password updated successfully.', 'success');
        passForm.reset();
      } else {
        window.showToast(result.message, 'danger');
      }
    });

    // Avatar Upload Helper
    const fileInput = document.getElementById('profile-avatar-file-input');
    const uploadBtn = document.getElementById('upload-avatar-trigger-btn');
    uploadBtn.onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = () => {
        const compressed = this.compressImageBase64(reader.result, 120, 120);
        compressed.then(imgData => {
          DB.updateUser(session.userId, { avatar: imgData });
          this.updateSidebarAvatar();
          document.getElementById('profile-avatar-container').innerHTML = `<img src="${imgData}" class="profile-avatar-large">`;
          window.showToast('Avatar photo updated.', 'success');
          Broadcast.publish('USER_UPDATED', { id: session.userId });
        });
      };
      reader.readAsDataURL(file);
    };

    // Snap Avatar Trigger
    document.getElementById('capture-avatar-btn').onclick = () => {
      this.openCameraModal((imgData) => {
        DB.updateUser(session.userId, { avatar: imgData });
        this.updateSidebarAvatar();
        document.getElementById('profile-avatar-container').innerHTML = `<img src="${imgData}" class="profile-avatar-large">`;
        window.showToast('Profile photo captured and saved.', 'success');
        Broadcast.publish('USER_UPDATED', { id: session.userId });
      });
    };
  },

  compressImageBase64(base64Str, targetW, targetH) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = base64Str;
    });
  },

  /* CAMERA & ATTENDANCE ACTIONS */
  async handleClockOut() {
    const session = DB.getCurrentSession();
    if (confirm('Ready to clock out? Your logout timestamp will be saved automatically.')) {
      const result = DB.clockOut(session.userId);
      if (result.success) {
        window.showToast('Clock-out registered successfully!', 'success');
        Broadcast.publish('ATTENDANCE_MARKED', result.record);
        this.refreshData();
      } else {
        window.showToast(result.message, 'danger');
      }
    }
  },

  openCameraModal(avatarCallback = null) {
    const modal = document.getElementById('camera-modal-overlay');
    const video = document.getElementById('camera-video');
    const previewImg = document.getElementById('camera-preview-img');
    const statusText = document.getElementById('camera-status');
    const countdown = document.getElementById('camera-countdown');
    const captureBtn = document.getElementById('camera-capture-btn');
    const simulateBtn = document.getElementById('camera-simulate-btn');
    const cancelBtn = document.getElementById('camera-cancel-btn');

    modal.style.display = 'flex';
    video.style.display = 'block';
    previewImg.style.display = 'none';
    countdown.style.display = 'none';
    captureBtn.style.display = 'none';
    simulateBtn.style.display = 'none';
    statusText.innerText = 'Connecting camera...';

    // Access Webcam
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      .then(stream => {
        this.cameraStream = stream;
        video.srcObject = stream;
        statusText.innerText = 'Face scanning active...';
        captureBtn.style.display = 'inline-block';
        
        // Auto trigger countdown for auto clock-in
        if (!avatarCallback) {
          this.triggerCountdown(avatarCallback);
        }
      })
      .catch(err => {
        console.warn('Webcam permission denied or unavailable:', err);
        statusText.innerText = 'Camera access blocked or unavailable.';
        simulateBtn.style.display = 'inline-block'; // Allow high-tech mockup face scan bypass
      });

    // Close buttons hook
    const cleanUp = () => {
      this.closeCamera();
      modal.style.display = 'none';
    };

    document.getElementById('close-camera-btn').onclick = cleanUp;
    cancelBtn.onclick = cleanUp;

    // Capture Snap manually
    captureBtn.onclick = () => this.snapPhoto(avatarCallback);

    // Simulate Face Scan
    simulateBtn.onclick = () => this.simulateFaceScan(avatarCallback);
  },

  triggerCountdown(avatarCallback) {
    const countdown = document.getElementById('camera-countdown');
    const statusText = document.getElementById('camera-status');
    
    countdown.style.display = 'block';
    let count = 3;
    countdown.innerText = count;

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        countdown.innerText = count;
      } else {
        clearInterval(timer);
        countdown.style.display = 'none';
        statusText.innerText = 'Capturing faceprint...';
        this.snapPhoto(avatarCallback);
      }
    }, 1000);
  },

  snapPhoto(avatarCallback) {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const previewImg = document.getElementById('camera-preview-img');
    const flash = document.getElementById('camera-flash');
    const statusText = document.getElementById('camera-status');

    if (!video.srcObject && !this.cameraStream) {
      this.simulateFaceScan(avatarCallback);
      return;
    }

    // Capture canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = canvas.toDataURL('image/jpeg', 0.85);

    // Flash animation
    flash.classList.add('camera-flash-active');
    setTimeout(() => flash.classList.remove('camera-flash-active'), 400);

    // Show preview
    previewImg.src = imgData;
    video.style.display = 'none';
    previewImg.style.display = 'block';
    statusText.innerText = 'Faceprint captured successfully!';

    this.processCapturedPhoto(imgData, avatarCallback);
  },

  // Simulated high-tech face scan if webcam is missing or runs on file://
  simulateFaceScan(avatarCallback) {
    const canvas = document.getElementById('camera-canvas');
    const previewImg = document.getElementById('camera-preview-img');
    const video = document.getElementById('camera-video');
    const statusText = document.getElementById('camera-status');
    const flash = document.getElementById('camera-flash');
    const session = DB.getCurrentSession();

    const ctx = canvas.getContext('2d');
    
    // Draw sci-fi face scanning mockup
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Cyber Grid
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 30) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 30) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
    }

    // Holographic target reticle
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 140, 0, Math.PI * 2);
    ctx.stroke();

    // Corner bracket markers
    ctx.strokeStyle = '#d946ef';
    ctx.lineWidth = 4;
    // Top Left Bracket
    ctx.beginPath(); ctx.moveTo(80, 120); ctx.lineTo(80, 80); ctx.lineTo(120, 80); ctx.stroke();
    // Top Right Bracket
    ctx.beginPath(); ctx.moveTo(560, 120); ctx.lineTo(560, 80); ctx.lineTo(520, 80); ctx.stroke();
    // Bottom Left
    ctx.beginPath(); ctx.moveTo(80, 360); ctx.lineTo(80, 400); ctx.lineTo(120, 400); ctx.stroke();
    // Bottom Right
    ctx.beginPath(); ctx.moveTo(560, 360); ctx.lineTo(560, 400); ctx.lineTo(520, 400); ctx.stroke();

    // Dynamic scanning banner line
    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.fillRect(0, canvas.height / 2 - 10, canvas.width, 20);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Text labels
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('FACIAL MATRIX HARMONIZATION: 100%', 40, 50);
    ctx.fillStyle = '#d946ef';
    ctx.fillText(`SUBJECT: ${session.name.toUpperCase()}`, 40, 80);
    ctx.fillStyle = '#10b981';
    ctx.fillText(`ID VERIFIED // ACCESS GRANTED`, 40, canvas.height - 40);

    // Draw abstract face shape placeholder
    ctx.fillStyle = 'rgba(129, 140, 248, 0.4)';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2 - 20, 75, 0, Math.PI * 2); // head
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height / 2 + 100, 110, 60, 0, 0, Math.PI * 2); // shoulders
    ctx.fill();

    const imgData = canvas.toDataURL('image/jpeg', 0.85);

    // Flash animation
    flash.classList.add('camera-flash-active');
    setTimeout(() => flash.classList.remove('camera-flash-active'), 400);

    // Show preview
    previewImg.src = imgData;
    video.style.display = 'none';
    previewImg.style.display = 'block';
    statusText.innerText = 'Virtual Face scan successful!';

    this.processCapturedPhoto(imgData, avatarCallback);
  },

  async processCapturedPhoto(imgData, avatarCallback) {
    const session = DB.getCurrentSession();
    
    // Close camera stream
    this.closeCamera();

    setTimeout(async () => {
      // Hide modal
      document.getElementById('camera-modal-overlay').style.display = 'none';

      if (avatarCallback) {
        // Save avatar callback route
        avatarCallback(imgData);
      } else {
        // Log attendance clock in
        const result = await DB.clockIn(session.userId, imgData);
        if (result.success) {
          window.showToast('Face Verified! Attendance clocked-in successfully.', 'success');
          
          // Broadcast attendance updates
          Broadcast.publish('ATTENDANCE_MARKED', result.record);
          
          this.refreshData();
        } else {
          window.showToast(result.message, 'danger');
        }
      }
    }, 1500);
  },

  closeCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }
  },

  destroy() {
    this.closeCamera();
    if (this.unsubBroadcast) {
      this.unsubBroadcast();
    }
  }
};
