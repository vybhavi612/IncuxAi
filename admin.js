window.AdminComponent = {
  activeTab: 'dashboard',

  render(containerId) {
    const session = DB.getCurrentSession();
    if (!session || session.role !== 'admin') {
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
                <i class="fas fa-chart-line"></i> Summary
              </li>
              <li class="menu-item" data-tab="users">
                <i class="fas fa-users-cog"></i> Users Management
              </li>
              <li class="menu-item" data-tab="tasks">
                <i class="fas fa-clipboard-list"></i> Task Records
              </li>
              <li class="menu-item" data-tab="attendance">
                <i class="fas fa-user-clock"></i> Attendance Logs
              </li>
              <li class="menu-item" data-tab="logs">
                <i class="fas fa-history"></i> System Activity
              </li>
              <li class="menu-item" data-tab="settings">
                <i class="fas fa-sliders-h"></i> System Settings
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
              <h2>Admin Console</h2>
              <p>System Administrator control room and parameter configurations.</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-primary" id="admin-create-user-quick-btn">
                <i class="fas fa-plus"></i> Create New User
              </button>
            </div>
          </div>

          <!-- Component Viewport -->
          <div id="admin-viewport">
            <!-- Loaded dynamically -->
          </div>
        </main>
      </div>

      <!-- Add/Edit User Modal -->
      <div id="user-modal" class="modal-overlay" style="display: none;">
        <div class="modal-content glass-panel" style="width: 500px;">
          <div class="modal-header">
            <h3 id="user-modal-title">Create New User Account</h3>
            <button class="btn-icon" id="close-user-modal-btn"><i class="fas fa-times"></i></button>
          </div>
          <form id="admin-user-form">
            <input type="hidden" id="user-edit-id" value="">

            <div class="form-group">
              <label for="user-name">Full Name</label>
              <div class="input-wrapper">
                <i class="fas fa-user"></i>
                <input type="text" id="user-name" class="form-control" placeholder="e.g. Jane Conner" required>
              </div>
            </div>

            <div class="form-group">
              <label for="user-username">Username</label>
              <div class="input-wrapper">
                <i class="fas fa-at"></i>
                <input type="text" id="user-username" class="form-control" placeholder="e.g. jconner" required>
              </div>
            </div>

            <div class="form-group">
              <label for="user-email">Email Address</label>
              <div class="input-wrapper">
                <i class="fas fa-envelope"></i>
                <input type="email" id="user-email" class="form-control" placeholder="e.g. jane@system.com" required>
              </div>
            </div>

            <div class="form-group">
              <label for="user-password">Password</label>
              <div class="input-wrapper">
                <i class="fas fa-lock"></i>
                <input type="password" id="user-password" class="form-control" placeholder="Enter secure password" required minlength="6">
              </div>
            </div>

            <div class="dashboard-grid equal" style="margin-bottom:0; gap:1rem;">
              <div class="form-group">
                <label for="user-role">System Role</label>
                <select id="user-role" class="select-custom" style="width:100%; height:42px;">
                  <option value="intern" selected>Intern</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="form-group">
                <label for="user-status">Status</label>
                <select id="user-status" class="select-custom" style="width:100%; height:42px;">
                  <option value="active" selected>Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div class="dashboard-grid equal" style="margin-bottom:0; gap:1rem;">
              <div class="form-group">
                <label for="user-phone">Phone Number</label>
                <input type="text" id="user-phone" class="form-control" style="padding-left:1rem;" placeholder="e.g. (555) 012-3456">
              </div>
              <div class="form-group">
                <label for="user-dept">Department</label>
                <input type="text" id="user-dept" class="form-control" style="padding-left:1rem;" placeholder="e.g. Engineering">
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" id="cancel-user-modal-btn">Cancel</button>
              <button type="submit" class="btn btn-primary" id="save-user-modal-btn">Create User</button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.activeTab = 'dashboard';
    this.initSidebarEvents();
    this.loadActiveTab();

    // Hook action buttons
    document.getElementById('admin-create-user-quick-btn').onclick = () => this.openUserModal();

    // Sync on Broadcast events
    this.unsubBroadcast = Broadcast.subscribe((action, payload) => {
      if (action === 'ATTENDANCE_MARKED' || action === 'TASK_UPDATED' || action === 'USER_UPDATED' || action === 'CONFIG_UPDATED') {
        window.showToast(`Admin Console Sync: ${action}`, 'info');
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
    const viewport = document.getElementById('admin-viewport');
    if (!viewport) return;

    switch (this.activeTab) {
      case 'dashboard':
        this.renderDashboard(viewport);
        break;
      case 'users':
        this.renderUsers(viewport);
        break;
      case 'tasks':
        this.renderTasks(viewport);
        break;
      case 'attendance':
        this.renderAttendance(viewport);
        break;
      case 'logs':
        this.renderLogs(viewport);
        break;
      case 'settings':
        this.renderSettings(viewport);
        break;
    }
  },

  /* TAB 1: SUMMARY OVERVIEW */
  renderDashboard(container) {
    const users = DB.getAllUsers();
    const managers = users.filter(u => u.role === 'manager');
    const interns = users.filter(u => u.role === 'intern');
    const logs = DB.getSystemLogs().slice(0, 5); // recent 5 logs
    const tasks = DB.getAllTasks();
    const attendance = DB.getAllAttendance();

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card glass-panel">
          <div class="stat-info">
            <h5>Total Users</h5>
            <h3>${users.length}</h3>
          </div>
          <div class="stat-icon primary"><i class="fas fa-users"></i></div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-info">
            <h5>Managers</h5>
            <h3>${managers.length}</h3>
          </div>
          <div class="stat-icon success" style="color:var(--accent); background:rgba(217, 70, 239, 0.12);"><i class="fas fa-user-shield"></i></div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-info">
            <h5>Interns</h5>
            <h3>${interns.length}</h3>
          </div>
          <div class="stat-icon success"><i class="fas fa-user-graduate"></i></div>
        </div>
        <div class="stat-card glass-panel">
          <div class="stat-info">
            <h5>Attendance logs</h5>
            <h3>${attendance.length} Record(s)</h3>
          </div>
          <div class="stat-icon warning"><i class="fas fa-history"></i></div>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Recent Logs -->
        <div class="dashboard-card glass-panel">
          <div class="card-title">
            <h3>Recent System Activity Logs</h3>
            <button class="btn btn-secondary btn-sm" id="view-all-logs-link" style="padding:0.3rem 0.6rem; font-size:0.75rem;">View All</button>
          </div>
          
          <div class="table-responsive">
            <table class="table-custom" style="font-size:0.8rem;">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(log => {
                  const actor = DB.getUser(log.userId) || { name: log.userId };
                  return `
                    <tr>
                      <td style="color:var(--text-muted);">${new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td><strong>${actor.name}</strong></td>
                      <td><span style="font-weight:600; color:var(--primary);">${log.action}</span></td>
                      <td>${log.details}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick System Stats -->
        <div class="dashboard-card glass-panel">
          <div class="card-title">
            <h3>System Status</h3>
          </div>
          <div style="display:flex; flex-direction:column; gap:1rem; font-size:0.9rem;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">
              <span>Total Active Tasks:</span>
              <strong>${tasks.length}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">
              <span>Unique Attendance Logs:</span>
              <strong>${attendance.length}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem;">
              <span>Self-Registration:</span>
              <strong style="color:var(--success);">ENABLED</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span>Framework Mode:</span>
              <span class="status-indicator present" style="font-weight:600;">Standard Sandbox</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('view-all-logs-link').addEventListener('click', () => {
      document.querySelector('.sidebar-menu .menu-item[data-tab="logs"]').click();
    });
  },

  /* TAB 2: USER MANAGEMENT */
  renderUsers(container) {
    container.innerHTML = `
      <div class="dashboard-card glass-panel">
        <div class="card-title">
          <h3>Manage System Accounts</h3>
          <button class="btn btn-primary" id="admin-create-user-tab-btn">
            <i class="fas fa-plus"></i> Add Account
          </button>
        </div>

        <div class="filter-bar">
          <div class="search-input-wrapper">
            <i class="fas fa-search"></i>
            <input type="text" id="user-search-input" class="search-input" placeholder="Search accounts by name, username, or email...">
          </div>
          <select id="user-role-filter" class="select-custom">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="intern">Intern</option>
          </select>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="admin-users-tbody">
              <!-- Loaded dynamically -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.filterAndRenderUsers();

    // Attach listeners
    document.getElementById('admin-create-user-tab-btn').onclick = () => this.openUserModal();
    document.getElementById('user-search-input').addEventListener('input', () => this.filterAndRenderUsers());
    document.getElementById('user-role-filter').addEventListener('change', () => this.filterAndRenderUsers());
  },

  filterAndRenderUsers() {
    const query = document.getElementById('user-search-input').value.toLowerCase();
    const role = document.getElementById('user-role-filter').value;
    const users = DB.getAllUsers();

    const filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(query) || 
                            user.username.toLowerCase().includes(query) || 
                            user.email.toLowerCase().includes(query);
      const matchesRole = role === 'all' || user.role === role;
      return matchesSearch && matchesRole;
    });

    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:3rem 0; color:var(--text-muted);">No accounts found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(user => `
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
        <td><code>${user.username}</code></td>
        <td><span style="font-weight:600; text-transform:capitalize;">${user.role}</span></td>
        <td><span class="status-indicator ${user.status === 'active' ? 'active' : 'inactive'}">${user.status.toUpperCase()}</span></td>
        <td style="color:var(--text-muted); font-size:0.8rem;">${new Date(user.createdAt).toLocaleDateString()}</td>
        <td>
          <div style="display:flex; gap:0.35rem;">
            <button class="btn btn-secondary btn-sm admin-edit-user-btn" data-user-id="${user.id}" style="padding:0.4rem 0.6rem;"><i class="fas fa-edit"></i></button>
            <button class="btn btn-danger btn-sm admin-delete-user-btn" data-user-id="${user.id}" style="padding:0.4rem 0.6rem;" ${user.id === 'usr_admin' ? 'disabled' : ''}><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    // Attach row events
    tbody.querySelectorAll('.admin-edit-user-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-user-id');
        this.openUserModal(id);
      };
    });

    tbody.querySelectorAll('.admin-delete-user-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-user-id');
        if (confirm('Delete this account permanently? This clears associated attendance and logs.')) {
          const result = DB.deleteUserByAdmin(id);
          if (result.success) {
            window.showToast('User deleted successfully.', 'success');
            Broadcast.publish('USER_UPDATED', { id });
            this.loadActiveTab();
          } else {
            window.showToast(result.message, 'danger');
          }
        }
      };
    });
  },

  openUserModal(editUserId = null) {
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('admin-user-form');
    const nameF = document.getElementById('user-name');
    const userF = document.getElementById('user-username');
    const emailF = document.getElementById('user-email');
    const passF = document.getElementById('user-password');
    const roleF = document.getElementById('user-role');
    const statusF = document.getElementById('user-status');
    const phoneF = document.getElementById('user-phone');
    const deptF = document.getElementById('user-dept');
    const editIdF = document.getElementById('user-edit-id');
    const titleModal = document.getElementById('user-modal-title');
    const submitBtn = document.getElementById('save-user-modal-btn');

    if (editUserId) {
      // Edit User mode
      const user = DB.getUser(editUserId);
      if (user) {
        titleModal.innerText = 'Modify Account details';
        submitBtn.innerText = 'Save Changes';
        
        editIdF.value = user.id;
        nameF.value = user.name;
        userF.value = user.username;
        emailF.value = user.email;
        passF.value = user.password;
        roleF.value = user.role;
        statusF.value = user.status;
        phoneF.value = user.contact.phone || '';
        deptF.value = user.contact.department || '';

        // Block changing username or role for primary admin to secure setup
        if (user.id === 'usr_admin') {
          roleF.disabled = true;
          statusF.disabled = true;
        } else {
          roleF.disabled = false;
          statusF.disabled = false;
        }
      }
    } else {
      // Create mode
      titleModal.innerText = 'Create New User Account';
      submitBtn.innerText = 'Create User';
      form.reset();
      editIdF.value = '';
      roleF.disabled = false;
      statusF.disabled = false;
    }

    modal.style.display = 'flex';

    const close = () => { modal.style.display = 'none'; };
    document.getElementById('close-user-modal-btn').onclick = close;
    document.getElementById('cancel-user-modal-btn').onclick = close;

    form.onsubmit = (e) => {
      e.preventDefault();
      
      const payload = {
        name: nameF.value.trim(),
        username: userF.value.trim(),
        email: emailF.value.trim(),
        password: passF.value,
        role: roleF.value,
        status: statusF.value,
        phone: phoneF.value.trim(),
        department: deptF.value.trim()
      };

      const editId = editIdF.value;
      let result;

      if (editId) {
        // Update user
        result = DB.updateUser(editId, {
          name: payload.name,
          username: payload.username,
          email: payload.email,
          password: payload.password,
          role: payload.role,
          status: payload.status,
          contact: { phone: payload.phone, department: payload.department }
        });
      } else {
        // Create user
        result = DB.addUserByAdmin(payload);
      }

      if (result.success) {
        window.showToast(editId ? 'User account details saved.' : 'User account created successfully.', 'success');
        modal.style.display = 'none';
        
        Broadcast.publish('USER_UPDATED', result.user);
        
        this.loadActiveTab();
      } else {
        window.showToast(result.message, 'danger');
      }
    };
  },

  /* TAB 3: TASK RECORDS */
  renderTasks(container) {
    const tasks = DB.getAllTasks();

    container.innerHTML = `
      <div class="dashboard-card glass-panel">
        <div class="card-title">
          <h3>Global Work Task Records</h3>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Creator (Manager)</th>
                <th>Task Title</th>
                <th>Deadline</th>
                <th>Priority</th>
                <th>Assigned Interns</th>
                <th>Progress Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.length === 0 ? '<tr><td colspan="7" style="text-align:center; padding:3rem 0; color:var(--text-muted);">No task records found in database.</td></tr>' : ''}
              ${tasks.map(task => {
                const creator = DB.getUser(task.createdBy) || { name: 'System Manager' };
                const assignedCount = task.assignedTo.length;
                const completedCount = Object.values(task.status).filter(s => s === 'completed').length;
                const progressVal = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0;
                
                return `
                  <tr>
                    <td><strong>${creator.name}</strong></td>
                    <td style="max-width: 250px;">
                      <div style="font-weight:600;">${task.title}</div>
                      <div style="font-size:0.75rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:240px;">${task.description}</div>
                    </td>
                    <td>${task.deadline}</td>
                    <td><span class="priority-badge ${task.priority.toLowerCase()}">${task.priority}</span></td>
                    <td>${assignedCount} Interns</td>
                    <td>
                      <div style="display:flex; align-items:center; gap:0.5rem;">
                        <div class="progress-bar-wrapper" style="width: 60px; height: 6px;">
                          <div class="progress-bar" style="width: ${progressVal}%;"></div>
                        </div>
                        <span style="font-size:0.8rem; font-weight:600;">${progressVal}%</span>
                      </div>
                    </td>
                    <td>
                      <button class="btn btn-danger btn-sm admin-delete-task-btn" data-task-id="${task.id}" style="padding:0.4rem 0.6rem;"><i class="fas fa-trash"></i></button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Hook delete task
    container.querySelectorAll('.admin-delete-task-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-task-id');
        if (confirm('Delete task permanently from database?')) {
          const result = DB.deleteTask(id, 'admin');
          if (result.success) {
            window.showToast('Task removed from system.', 'success');
            Broadcast.publish('TASK_UPDATED', { id });
            this.loadActiveTab();
          }
        }
      };
    });
  },

  /* TAB 4: ATTENDANCE LOGS */
  renderAttendance(container) {
    const attendance = DB.getAllAttendance();

    container.innerHTML = `
      <div class="dashboard-card glass-panel">
        <div class="card-title">
          <h3>Central Attendance registry</h3>
        </div>

        <div class="table-responsive">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Date</th>
                <th>Intern Name</th>
                <th>Clock In Time</th>
                <th>Clock Out Time</th>
                <th>Image Verification</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${attendance.length === 0 ? '<tr><td colspan="6" style="text-align:center; padding:3rem 0; color:var(--text-muted);">No attendance clocks verified in system.</td></tr>' : ''}
              ${attendance.map(a => {
                const user = DB.getUser(a.userId) || { name: 'Deactivated User', email: '' };
                return `
                  <tr>
                    <td style="font-weight: 600;">${a.date}</td>
                    <td>
                      <div style="font-weight:600;">${user.name}</div>
                      <div style="font-size:0.75rem; color:var(--text-muted);">${user.email}</div>
                    </td>
                    <td>${a.loginTime}</td>
                    <td>${a.logoutTime || '--:--:--'}</td>
                    <td>
                      ${a.photoId ? `
                        <button class="btn btn-secondary btn-sm admin-view-photo-btn" data-photo-id="${a.photoId}" style="padding:0.35rem 0.75rem; font-size:0.8rem;">
                          <i class="fas fa-image"></i> View Photo
                        </button>
                      ` : '<span style="color:var(--text-muted); font-style:italic;">No Image</span>'}
                    </td>
                    <td><span class="status-indicator ${a.status.toLowerCase()}">${a.status}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Hook Photo Buttons
    const photoButtons = container.querySelectorAll('.admin-view-photo-btn');
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

  /* TAB 5: SYSTEM ACTIVITY LOGS */
  renderLogs(container) {
    const logs = DB.getSystemLogs();

    container.innerHTML = `
      <div class="dashboard-card glass-panel">
        <div class="card-title">
          <h3>System Transaction Auditing</h3>
        </div>
        
        <div class="table-responsive" style="max-height: 480px; overflow-y:auto;">
          <table class="table-custom" style="font-size:0.85rem;">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor User ID</th>
                <th>Action Command</th>
                <th>Operation Details</th>
              </tr>
            </thead>
            <tbody>
              ${logs.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:3rem 0;">Database audit log empty.</td></tr>' : ''}
              ${logs.map(log => `
                <tr>
                  <td style="color:var(--text-muted); font-size:0.8rem; white-space:nowrap;">${new Date(log.timestamp).toLocaleString()}</td>
                  <td><code>${log.userId}</code></td>
                  <td><span style="font-weight:600; color:var(--primary);">${log.action}</span></td>
                  <td>${log.details}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* TAB 6: SYSTEM CONFIGURATION SETTINGS */
  renderSettings(container) {
    const config = DB.getSystemConfig();

    container.innerHTML = `
      <div class="dashboard-card glass-panel" style="max-width:600px; margin:0 auto;">
        <div class="card-title">
          <h3>General Parameters Control</h3>
        </div>
        
        <form id="admin-settings-form">
          <div class="form-group">
            <label for="set-shift-start">Standard Shift Start Time</label>
            <div class="input-wrapper">
              <i class="far fa-clock"></i>
              <input type="time" id="set-shift-start" class="form-control" value="${config.shiftStartTime}" required>
            </div>
            <p style="color:var(--text-muted); font-size:0.75rem; margin-top:0.25rem;">Daily base time setting for monitoring employee presence.</p>
          </div>

          <div class="form-group">
            <label for="set-late-buffer">Late Time Buffer Limit</label>
            <div class="input-wrapper">
              <i class="fas fa-hourglass-half"></i>
              <input type="time" id="set-late-buffer" class="form-control" value="${config.lateBufferTime}" required>
            </div>
            <p style="color:var(--text-muted); font-size:0.75rem; margin-top:0.25rem;">Clock-ins after this time mark the intern as "Late".</p>
          </div>

          <div class="form-group" style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem; padding: 0.75rem 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
            <div>
              <div style="font-weight:600; font-size:0.95rem;">Allow Intern Self-Signup</div>
              <div style="color:var(--text-muted); font-size:0.75rem; margin-top:0.15rem;">If disabled, interns must be created by administrators.</div>
            </div>
            <label class="theme-switch" style="width: 50px; height: 26px;">
              <input type="checkbox" id="set-self-signup" ${config.allowSelfSignup ? 'checked' : ''}>
              <span class="slider" style="border-radius: 34px;">
                <span class="slider-icons" style="font-size:8px;">
                  <i class="fas fa-check" style="color:#10b981; line-height:26px; width:20px;"></i>
                  <i class="fas fa-times" style="color:#ef4444; line-height:26px; width:20px;"></i>
                </span>
              </span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%; margin-top:2rem;">
            Save Global System Settings
          </button>
        </form>
      </div>
    `;

    // Hook settings form submit
    const settingsForm = document.getElementById('admin-settings-form');
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const session = DB.getCurrentSession();
      const shiftStartTime = document.getElementById('set-shift-start').value;
      const lateBufferTime = document.getElementById('set-late-buffer').value;
      const allowSelfSignup = document.getElementById('set-self-signup').checked;

      const result = DB.updateSystemConfig({
        shiftStartTime,
        lateBufferTime,
        allowSelfSignup
      }, session.userId);

      if (result.success) {
        window.showToast('Global settings updated and broadcasted successfully.', 'success');
        Broadcast.publish('CONFIG_UPDATED', result.config);
      } else {
        window.showToast('Error updating parameters.', 'danger');
      }
    });
  },

  destroy() {
    if (this.unsubBroadcast) {
      this.unsubBroadcast();
    }
  }
};
