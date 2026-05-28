window.ManagerComponent = {
  activeTab: 'dashboard',
  chartInstanceTask: null,
  chartInstanceAttendance: null,

  render(containerId) {
    const session = DB.getCurrentSession();
    if (!session || session.role !== 'manager') {
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
                <i class="fas fa-chart-line"></i> Dashboard
              </li>
              <li class="menu-item" data-tab="interns">
                <i class="fas fa-users"></i> Manage Interns
              </li>
              <li class="menu-item" data-tab="tasks">
                <i class="fas fa-tasks"></i> Task Assigner
              </li>
              <li class="menu-item" data-tab="reports">
                <i class="fas fa-file-invoice"></i> Analytics Reports
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
          <!-- Header -->
          <div class="page-header">
            <div class="page-title">
              <h2>Manager Control Panel</h2>
              <p>Welcome, ${session.name}. Oversee your team and manage workflows.</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-primary" id="assign-task-quick-btn">
                <i class="fas fa-plus"></i> Assign New Task
              </button>
            </div>
          </div>

          <!-- Component Viewport -->
          <div id="manager-viewport">
            <!-- Loaded dynamically -->
          </div>
        </main>
      </div>

      <!-- Assign Task Modal -->
      <div id="task-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content glass-panel" style="width: 550px;">
          <div class="modal-header">
            <h3 id="task-modal-title">Assign New Work Task</h3>
            <button class="btn-icon" id="close-task-modal-btn"><i class="fas fa-times"></i></button>
          </div>
          <form id="task-assignment-form">
            <input type="hidden" id="task-edit-id" value="">
            
            <div class="form-group">
              <label for="task-title">Task Title</label>
              <div class="input-wrapper">
                <i class="fas fa-heading"></i>
                <input type="text" id="task-title" class="form-control" placeholder="e.g. Design Landing Page Mockup" required>
              </div>
            </div>

            <div class="form-group">
              <label for="task-desc">Task Description</label>
              <textarea id="task-desc" class="form-control" style="padding-left: 1rem; height: 100px; resize:none;" placeholder="Detail task goals, resources, and expectations..." required></textarea>
            </div>

            <div class="dashboard-grid equal" style="margin-bottom:0; gap:1rem;">
              <div class="form-group">
                <label for="task-deadline">Deadline Date</label>
                <div class="input-wrapper">
                  <i class="far fa-calendar-alt"></i>
                  <input type="date" id="task-deadline" class="form-control" required>
                </div>
              </div>
              <div class="form-group">
                <label for="task-priority">Priority</label>
                <select id="task-priority" class="select-custom" style="width:100%; height:42px;">
                  <option value="High">High</option>
                  <option value="Medium" selected>Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-top:0.5rem;">
              <label>Assign to Interns</label>
              <div id="task-assignees-checkboxes" style="max-height: 120px; overflow-y: auto; border: 1px solid var(--border-color); padding: 0.75rem; border-radius: var(--radius-md); background: var(--bg-primary); display:flex; flex-direction:column; gap:0.5rem;">
                <!-- Intern Checkboxes Loaded Here -->
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" id="cancel-task-modal-btn">Cancel</button>
              <button type="submit" class="btn btn-primary" id="save-task-modal-btn">Assign Task</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.activeTab = 'dashboard';
    this.initSidebarEvents();
    this.loadActiveTab();

    // Hook quick action button
    document.getElementById('assign-task-quick-btn').onclick = () => this.openTaskModal();

    // Sync on Broadcast events
    this.unsubBroadcast = Broadcast.subscribe((action, payload) => {
      if (action === 'ATTENDANCE_MARKED' || action === 'TASK_UPDATED' || action === 'USER_UPDATED') {
        window.showToast(`System update received: ${action.replace('_', ' ')}`, 'info');
        this.refreshData();
      }
    });
  },

  refreshData() {
    this.loadActiveTab();
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
        DB.logout();
        window.location.hash = '#landing';
        window.showToast('Logged out securely.', 'success');
      }
    });

    this.updateSidebarAvatar();
  },

  loadActiveTab() {
    const viewport = document.getElementById('manager-viewport');
    if (!viewport) return;

    // Clear old charts before rendering new tabs
    if (this.chartInstanceTask) { this.chartInstanceTask.destroy(); this.chartInstanceTask = null; }
    if (this.chartInstanceAttendance) { this.chartInstanceAttendance.destroy(); this.chartInstanceAttendance = null; }

    switch (this.activeTab) {
      case 'dashboard':
        this.renderDashboard(viewport);
        break;
      case 'interns':
        this.renderInterns(viewport);
        break;
      case 'tasks':
        this.renderTasks(viewport);
        break;
      case 'reports':
        this.renderReports(viewport);
        break;
    }
  },

  /* TAB 1: OVERVIEW DASHBOARD */
  renderDashboard(container) {
    const interns = DB.getUsersByRole('intern');
    const tasks = DB.getAllTasks();
    const attendance = DB.getAllAttendance();
    const todayStr = new Date().toISOString().split('T')[0];
    const clockedInToday = attendance.filter(a => a.date === todayStr);

    const completedTasksCount = tasks.reduce((sum, task) => {
      const completedAssignees = Object.values(task.status).filter(s => s === 'completed').length;
      return sum + completedAssignees;
    }, 0);

    const totalTaskTargets = tasks.reduce((sum, task) => sum + task.assignedTo.length, 0);
    const overallProgress = totalTaskTargets > 0 ? Math.round((completedTasksCount / totalTaskTargets) * 100) : 0;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card glass-panel">
          <div class="stat-info">
            <h5>Total Interns</h5>
            <h3>${interns.length}</h3>
          </div>
          <div class="stat-icon primary"><i class="fas fa-user-friends"></i></div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-info">
            <h5>Clocked In Today</h5>
            <h3>${clockedInToday.length}/${interns.length}</h3>
          </div>
          <div class="stat-icon success"><i class="fas fa-user-check"></i></div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-info">
            <h5>Tasks Assigned</h5>
            <h3>${tasks.length}</h3>
          </div>
          <div class="stat-icon warning"><i class="fas fa-clipboard-list"></i></div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-info">
            <h5>Team Progress</h5>
            <h3>${overallProgress}%</h3>
          </div>
          <div class="stat-icon success" style="color:var(--accent); background:rgba(217, 70, 239, 0.12);"><i class="fas fa-tasks"></i></div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Live attendance logs -->
        <div class="dashboard-card glass-panel">
          <div class="card-title">
            <h3>Active Login Actions (Today)</h3>
            <span style="font-size:0.8rem; color:var(--text-muted);">${todayStr}</span>
          </div>

          <div class="table-responsive">
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Intern Name</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Image</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${clockedInToday.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 2rem 0; color:var(--text-muted);">No logs recorded today.</td></tr>' : ''}
                ${clockedInToday.map(a => {
                  const user = DB.getUser(a.userId);
                  return `
                    <tr>
                      <td>
                        <div class="user-cell">
                          <div class="user-cell-avatar">
                            ${user.avatar ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : user.name.charAt(0)}
                          </div>
                          <div>
                            <div style="font-weight:600;">${user.name}</div>
                            <div style="font-size:0.75rem; color:var(--text-muted);">${user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>${a.loginTime}</td>
                      <td>${a.logoutTime || '--:--'}</td>
                      <td>
                        ${a.photoId ? `
                          <button class="btn btn-secondary btn-sm view-photo-btn" data-photo-id="${a.photoId}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">
                            <i class="fas fa-image"></i> View Photo
                          </button>
                        ` : '--'}
                      </td>
                      <td><span class="status-indicator ${a.status.toLowerCase()}">${a.status}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Task Completion rates -->
        <div class="dashboard-card glass-panel">
          <div class="card-title">
            <h3>Task Completion Status</h3>
          </div>
          <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height: 180px;">
            <div style="position:relative; width: 120px; height: 120px; display:flex; align-items:center; justify-content:center; border-radius:50%; background: radial-gradient(circle, var(--bg-secondary) 55%, transparent 56%), conic-gradient(var(--primary) 0% ${overallProgress}%, var(--bg-tertiary) ${overallProgress}% 100%);">
              <span style="font-size:1.5rem; font-family:var(--font-display); font-weight:700;">${overallProgress}%</span>
            </div>
            <div style="margin-top:1.5rem; display:flex; gap:1.5rem; font-size:0.85rem;">
              <span><i class="fas fa-circle" style="color:var(--primary); margin-right:0.25rem;"></i> Completed: ${completedTasksCount}</span>
              <span><i class="fas fa-circle" style="color:var(--text-muted); margin-right:0.25rem;"></i> Pending: ${Math.max(0, totalTaskTargets - completedTasksCount)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindPhotoViewEvents(container);
  },

  bindPhotoViewEvents(container) {
    const photoButtons = container.querySelectorAll('.view-photo-btn');
    photoButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const photoId = btn.getAttribute('data-photo-id');
        const photoSrc = await DB.getAttendancePhoto(photoId);

        if (photoSrc) {
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

  /* TAB 2: MANAGE INTERNS */
  renderInterns(container) {
    container.innerHTML = `
      <div class="dashboard-card glass-panel">
        <div class="card-title">
          <h3>Team Intern Directory</h3>
        </div>

        <div class="filter-bar">
          <div class="search-input-wrapper">
            <i class="fas fa-search"></i>
            <input type="text" id="intern-search-input" class="search-input" placeholder="Search interns by name, email, or department...">
          </div>
          <select id="intern-dept-filter" class="select-custom">
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Marketing">Marketing</option>
            <option value="Design">Design</option>
          </select>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Intern Name</th>
                <th>Department</th>
                <th>Task Completion</th>
                <th>Attendance (Present/Late)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="interns-tbody">
              <!-- Loaded Dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.filterAndRenderInterns();

    document.getElementById('intern-search-input').addEventListener('input', () => this.filterAndRenderInterns());
    document.getElementById('intern-dept-filter').addEventListener('change', () => this.filterAndRenderInterns());
  },

  filterAndRenderInterns() {
    const query = document.getElementById('intern-search-input').value.toLowerCase();
    const dept = document.getElementById('intern-dept-filter').value;
    const interns = DB.getUsersByRole('intern');

    const filtered = interns.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(query) || 
                            user.email.toLowerCase().includes(query) || 
                            (user.contact.department && user.contact.department.toLowerCase().includes(query));
      const matchesDept = dept === 'all' || (user.contact.department && user.contact.department.toLowerCase() === dept.toLowerCase());
      return matchesSearch && matchesDept;
    });

    const tbody = document.getElementById('interns-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:3rem 0; color:var(--text-muted);">No interns found matching details.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(user => {
      const stats = DB.getInternProductivityStats(user.id);
      return `
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-cell-avatar">
                ${user.avatar ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : user.name.charAt(0)}
              </div>
              <div>
                <div style="font-weight:600;">${user.name}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${user.email}</div>
              </div>
            </div>
          </td>
          <td>${user.contact.department || 'General'}</td>
          <td>
            <div style="display:flex; align-items:center; gap: 0.5rem;">
              <div class="progress-bar-wrapper" style="width: 80px; height: 6px;">
                <div class="progress-bar" style="width: ${stats.progressPercent}%;"></div>
              </div>
              <span style="font-size:0.8rem; font-weight:600;">${stats.progressPercent}%</span>
            </div>
          </td>
          <td>
            <span style="font-weight:600;">Present: ${stats.presentDays}</span>
            <span style="color:var(--text-muted); font-size:0.8rem; margin-left:0.25rem;">(Late: ${stats.lateDays})</span>
          </td>
          <td>
            <button class="btn btn-secondary btn-sm view-intern-details-btn" data-intern-id="${user.id}">
              <i class="far fa-eye"></i> View Profile
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Details event listeners
    const buttons = tbody.querySelectorAll('.view-intern-details-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-intern-id');
        this.openInternDetailsModal(id);
      });
    });
  },

  openInternDetailsModal(internId) {
    const user = DB.getUser(internId);
    const stats = DB.getInternProductivityStats(internId);
    const attendance = DB.getAttendanceForUser(internId);
    const tasks = DB.getTasksForIntern(internId);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content glass-panel" style="width: 750px; max-width:95%; max-height:85vh; overflow-y:auto;">
        <div class="modal-header">
          <h3>Intern Employee Dossier</h3>
          <button class="btn-icon" id="close-dossier-modal"><i class="fas fa-times"></i></button>
        </div>
        
        <div style="display:grid; grid-template-columns: 180px 1fr; gap:2rem; margin-bottom: 2rem;">
          <div style="text-align:center;">
            ${user.avatar ? `<img src="${user.avatar}" style="width:140px; height:140px; border-radius:50%; object-fit:cover; border: 3px solid var(--primary);">` : `<div style="width:140px; height:140px; border-radius:50%; background:var(--bg-tertiary); display:flex; align-items:center; justify-content:center; font-size:4rem; color:var(--primary); border: 3px solid var(--primary); font-weight:700;">${user.name.charAt(0)}</div>`}
            <h4 style="margin-top:1rem; font-size:1.15rem;">${user.name}</h4>
            <span style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">${user.contact.department || 'Engineering'}</span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap: 1rem;">
            <div>
              <div style="color:var(--text-muted); font-size:0.8rem;">Username</div>
              <div style="font-weight:600; margin-bottom:0.75rem;">${user.username}</div>
              
              <div style="color:var(--text-muted); font-size:0.8rem;">Email Address</div>
              <div style="font-weight:600; margin-bottom:0.75rem;">${user.email}</div>
            </div>
            <div>
              <div style="color:var(--text-muted); font-size:0.8rem;">Phone Number</div>
              <div style="font-weight:600; margin-bottom:0.75rem;">${user.contact.phone || 'N/A'}</div>
              
              <div style="color:var(--text-muted); font-size:0.8rem;">Member Since</div>
              <div style="font-weight:600; margin-bottom:0.75rem;">${new Date(user.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <div class="auth-tabs" style="margin-bottom:1.5rem;">
          <div class="auth-tab active" id="tab-dossier-tasks">Work Tasks (${tasks.length})</div>
          <div class="auth-tab" id="tab-dossier-attendance">Attendance Records (${attendance.length})</div>
        </div>

        <div id="dossier-tab-content">
          <!-- Load sub tab values -->
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const tasksTabBtn = document.getElementById('tab-dossier-tasks');
    const attendanceTabBtn = document.getElementById('tab-dossier-attendance');
    const contentViewport = document.getElementById('dossier-tab-content');

    const renderDossierTasks = () => {
      tasksTabBtn.classList.add('active');
      attendanceTabBtn.classList.remove('active');
      contentViewport.innerHTML = `
        <div class="task-list">
          ${tasks.length === 0 ? '<p style="color:var(--text-muted); text-align:center; padding: 2rem 0;">No tasks assigned.</p>' : ''}
          ${tasks.map(task => `
            <div class="task-item ${task.status[internId] === 'completed' ? 'completed' : ''}">
              <div class="task-header" style="margin-bottom:0.25rem;">
                <h4>${task.title}</h4>
                <span class="priority-badge ${task.priority.toLowerCase()}">${task.priority}</span>
              </div>
              <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.5rem;">${task.description}</p>
              <div class="task-meta" style="font-size:0.8rem;">
                <span>Deadline: ${task.deadline}</span>
                <span style="font-weight:600; color: ${task.status[internId] === 'completed' ? 'var(--success)' : 'var(--warning)'}">
                  Status: ${task.status[internId].toUpperCase()}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    };

    const renderDossierAttendance = () => {
      attendanceTabBtn.classList.add('active');
      tasksTabBtn.classList.remove('active');
      contentViewport.innerHTML = `
        <div class="table-responsive">
          <table class="table-custom" style="font-size:0.85rem;">
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Snapshot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${attendance.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 2rem 0; color:var(--text-muted);">No records logged.</td></tr>' : ''}
              ${attendance.map(a => `
                <tr>
                  <td>${a.date}</td>
                  <td>${a.loginTime}</td>
                  <td>${a.logoutTime || '--:--'}</td>
                  <td>
                    ${a.photoId ? `
                      <button class="btn btn-secondary btn-sm view-photo-btn" data-photo-id="${a.photoId}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                        View Photo
                      </button>
                    ` : '--'}
                  </td>
                  <td><span class="status-indicator ${a.status.toLowerCase()}">${a.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      this.bindPhotoViewEvents(contentViewport);
    };

    // Default load tasks
    renderDossierTasks();

    // Event Triggers
    tasksTabBtn.onclick = renderDossierTasks;
    attendanceTabBtn.onclick = renderDossierAttendance;
    document.getElementById('close-dossier-modal').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  },

  /* TAB 3: TASK ASSIGNER */
  renderTasks(container) {
    const tasks = DB.getAllTasks();

    container.innerHTML = `
      <div class="dashboard-card glass-panel">
        <div class="card-title">
          <h3>Assigned Work Tasks</h3>
          <button class="btn btn-primary" id="assign-task-tab-btn">
            <i class="fas fa-plus"></i> Assign Task
          </button>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Deadline</th>
                <th>Priority</th>
                <th>Assigned Interns</th>
                <th>Progress Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding: 3rem 0; color:var(--text-muted);">No tasks assigned yet.</td></tr>' : ''}
              ${tasks.map(task => {
                const assignedCount = task.assignedTo.length;
                const completedCount = Object.values(task.status).filter(s => s === 'completed').length;
                const progressVal = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0;
                
                return `
                  <tr>
                    <td style="max-width: 250px;">
                      <div style="font-weight:600;">${task.title}</div>
                      <div style="font-size:0.75rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:240px;">${task.description}</div>
                    </td>
                    <td>${task.deadline}</td>
                    <td><span class="priority-badge ${task.priority.toLowerCase()}">${task.priority}</span></td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.25rem;">
                        <span style="font-weight:600;">${assignedCount} Interns</span>
                      </div>
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.5rem;">
                        <div class="progress-bar-wrapper" style="width: 60px; height: 6px;">
                          <div class="progress-bar" style="width: ${progressVal}%;"></div>
                        </div>
                        <span style="font-size:0.8rem; font-weight:600;">${completedCount}/${assignedCount}</span>
                      </div>
                    </td>
                    <td>
                      <div style="display:flex; gap:0.35rem;">
                        <button class="btn btn-secondary btn-sm edit-task-btn" data-task-id="${task.id}" style="padding:0.4rem 0.6rem;"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm delete-task-btn" data-task-id="${task.id}" style="padding:0.4rem 0.6rem;"><i class="fas fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Hook task add btn
    document.getElementById('assign-task-tab-btn').onclick = () => this.openTaskModal();

    // Hook action buttons
    container.querySelectorAll('.edit-task-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-task-id');
        this.openTaskModal(id);
      };
    });

    container.querySelectorAll('.delete-task-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-task-id');
        if (confirm('Are you sure you want to delete this task? It will be removed from all assigned interns.')) {
          const session = DB.getCurrentSession();
          const result = DB.deleteTask(id, session.userId);
          if (result.success) {
            window.showToast('Task deleted successfully.', 'success');
            
            // Broadcast task deletion
            Broadcast.publish('TASK_UPDATED', { id });
            
            this.loadActiveTab();
          }
        }
      };
    });
  },

  openTaskModal(editTaskId = null) {
    const modal = document.getElementById('task-modal');
    const form = document.getElementById('task-assignment-form');
    const titleField = document.getElementById('task-title');
    const descField = document.getElementById('task-desc');
    const dateField = document.getElementById('task-deadline');
    const priorityField = document.getElementById('task-priority');
    const editIdField = document.getElementById('task-edit-id');
    const checkboxesDiv = document.getElementById('task-assignees-checkboxes');
    const modalTitle = document.getElementById('task-modal-title');
    const submitBtn = document.getElementById('save-task-modal-btn');

    // Populate Intern list
    const interns = DB.getUsersByRole('intern');
    if (interns.length === 0) {
      checkboxesDiv.innerHTML = `<span style="color:var(--text-muted); font-size:0.85rem;">No interns registered in the system yet.</span>`;
    } else {
      checkboxesDiv.innerHTML = interns.map(u => `
        <label style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; font-weight:500; cursor:pointer;">
          <input type="checkbox" name="assignees" value="${u.id}" class="intern-chk">
          ${u.name} (${u.contact.department || 'General'})
        </label>
      `).join('');
    }

    if (editTaskId) {
      // Load Existing Data
      const tasks = DB.getAllTasks();
      const task = tasks.find(t => t.id === editTaskId);
      if (task) {
        modalTitle.innerText = 'Edit Assigned Task';
        submitBtn.innerText = 'Save Changes';
        
        editIdField.value = task.id;
        titleField.value = task.title;
        descField.value = task.description;
        dateField.value = task.deadline;
        priorityField.value = task.priority;

        // Check assigned interns
        const checkboxes = checkboxesDiv.querySelectorAll('.intern-chk');
        checkboxes.forEach(chk => {
          chk.checked = task.assignedTo.includes(chk.value);
        });
      }
    } else {
      // Clear Form
      modalTitle.innerText = 'Assign New Work Task';
      submitBtn.innerText = 'Assign Task';
      
      form.reset();
      editIdField.value = '';
      
      // Default to tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateField.value = tomorrow.toISOString().split('T')[0];
    }

    modal.style.display = 'flex';

    // Cancel hooks
    const close = () => { modal.style.display = 'none'; };
    document.getElementById('close-task-modal-btn').onclick = close;
    document.getElementById('cancel-task-modal-btn').onclick = close;

    // Handle Assignment Submit
    form.onsubmit = (e) => {
      e.preventDefault();
      
      // Collect checked assignees
      const checkedBoxes = checkboxesDiv.querySelectorAll('.intern-chk:checked');
      const assignees = Array.from(checkedBoxes).map(chk => chk.value);

      if (assignees.length === 0 && interns.length > 0) {
        alert('Please assign this task to at least one intern.');
        return;
      }

      const session = DB.getCurrentSession();
      const title = titleField.value.trim();
      const desc = descField.value.trim();
      const deadline = dateField.value;
      const priority = priorityField.value;
      const editId = editIdField.value;

      let result;
      let broadcastAction;

      if (editId) {
        // Edit Mode
        result = DB.updateTask(editId, {
          title,
          description: desc,
          deadline,
          priority,
          assignedTo: assignees
        }, session.userId);
        broadcastAction = 'TASK_UPDATED';
      } else {
        // Create Mode
        result = DB.createTask(title, desc, deadline, priority, assignees, session.userId);
        broadcastAction = 'TASK_ASSIGNED';
      }

      if (result.success) {
        window.showToast(editId ? 'Task modifications saved.' : 'Task assigned to interns!', 'success');
        modal.style.display = 'none';
        
        // Broadcast the change in real-time
        Broadcast.publish(broadcastAction, result.task);

        this.loadActiveTab();
      } else {
        window.showToast(result.message, 'danger');
      }
    };
  },

  /* TAB 4: ANALYTICS REPORTS */
  renderReports(container) {
    const interns = DB.getUsersByRole('intern');
    const tasks = DB.getAllTasks();
    const attendance = DB.getAllAttendance();

    // Stats calculations
    const completedTasksCount = tasks.reduce((sum, t) => sum + Object.values(t.status).filter(s => s === 'completed').length, 0);
    const totalTaskTargets = tasks.reduce((sum, t) => sum + t.assignedTo.length, 0);
    const pendingTasksCount = totalTaskTargets - completedTasksCount;

    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const lateCount = attendance.filter(a => a.status === 'Late').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;

    container.innerHTML = `
      <div class="dashboard-grid equal">
        <!-- Task completion chart -->
        <div class="dashboard-card glass-panel">
          <div class="card-title">
            <h3>Team Task Ratios</h3>
          </div>
          <div class="chart-container">
            <canvas id="task-ratios-chart"></canvas>
          </div>
          <div style="margin-top:1.5rem; text-align:center; font-size:0.9rem; color:var(--text-secondary);">
            Assigned Task Objectives: <strong>${totalTaskTargets}</strong> | Finished: <strong>${completedTasksCount}</strong>
          </div>
        </div>

        <!-- Attendance Stats chart -->
        <div class="dashboard-card glass-panel">
          <div class="card-title">
            <h3>Attendance breakdown</h3>
          </div>
          <div class="chart-container">
            <canvas id="attendance-ratio-chart"></canvas>
          </div>
          <div style="margin-top:1.5rem; text-align:center; font-size:0.9rem; color:var(--text-secondary);">
            Punch-Ins: <strong>${attendance.length}</strong> (Punctual: <strong>${presentCount}</strong> | Late: <strong>${lateCount}</strong>)
          </div>
        </div>
      </div>

      <div class="dashboard-card glass-panel" style="margin-top:2rem;">
        <div class="card-title">
          <h3>Individual Intern Productivity metrics</h3>
        </div>
        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Intern Name</th>
                <th>Tasks Pending</th>
                <th>Tasks Completed</th>
                <th>Productivity Index</th>
                <th>Punctuality Rate</th>
              </tr>
            </thead>
            <tbody>
              ${interns.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding:2rem 0; color:var(--text-muted);">No interns registered.</td></tr>' : ''}
              ${interns.map(u => {
                const stats = DB.getInternProductivityStats(u.id);
                const totalAtt = stats.presentDays;
                const punctuality = totalAtt > 0 ? Math.round(((totalAtt - stats.lateDays) / totalAtt) * 100) : 100;
                
                return `
                  <tr>
                    <td>
                      <div class="user-cell">
                        <div class="user-cell-avatar">
                          ${u.avatar ? `<img src="${u.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : u.name.charAt(0)}
                        </div>
                        <div>
                          <div style="font-weight:600;">${u.name}</div>
                          <div style="font-size:0.75rem; color:var(--text-muted);">${u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><strong style="color:var(--warning);">${stats.pendingTasks}</strong></td>
                    <td><strong style="color:var(--success);">${stats.completedTasks}</strong></td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.5rem;">
                        <div class="progress-bar-wrapper" style="width:70px; height:6px;">
                          <div class="progress-bar" style="width:${stats.progressPercent}%;"></div>
                        </div>
                        <span>${stats.progressPercent}%</span>
                      </div>
                    </td>
                    <td>
                      <span style="font-weight:600; color: ${punctuality > 80 ? 'var(--success)' : 'var(--warning)'}">${punctuality}%</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Load dynamic ChartJS configurations
    setTimeout(() => {
      this.initReportsCharts(completedTasksCount, pendingTasksCount, presentCount, lateCount, absentCount);
    }, 100);
  },

  initReportsCharts(completedT, pendingT, presentA, lateA, absentA) {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js CDN is unavailable. Falling back to SVG charts is not required in full mockup but charts will just render blank canvas.');
      return;
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textCol = isDark ? '#94a3b8' : '#475569';
    const gridCol = isDark ? '#1f2937' : '#e2e8f0';

    // 1. Task chart
    const taskCtx = document.getElementById('task-ratios-chart');
    if (taskCtx) {
      this.chartInstanceTask = new Chart(taskCtx, {
        type: 'doughnut',
        data: {
          labels: ['Completed Tasks', 'Pending Tasks'],
          datasets: [{
            data: [completedT, pendingT],
            backgroundColor: ['#6366f1', '#e2e8f0'],
            borderColor: isDark ? '#111827' : '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textCol, font: { family: 'Inter' } }
            }
          }
        }
      });
    }

    // 2. Attendance chart
    const attCtx = document.getElementById('attendance-ratio-chart');
    if (attCtx) {
      this.chartInstanceAttendance = new Chart(attCtx, {
        type: 'pie',
        data: {
          labels: ['Punctual Punch-In', 'Late Clock-In', 'Absent'],
          datasets: [{
            data: [presentA, lateA, absentA],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderColor: isDark ? '#111827' : '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textCol, font: { family: 'Inter' } }
            }
          }
        }
      });
    }
  },

  destroy() {
    if (this.unsubBroadcast) {
      this.unsubBroadcast();
    }
    if (this.chartInstanceTask) {
      this.chartInstanceTask.destroy();
    }
    if (this.chartInstanceAttendance) {
      this.chartInstanceAttendance.destroy();
    }
  }
};
