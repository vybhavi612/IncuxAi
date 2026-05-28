// Global scripts loaded sequentially in index.html

// Central Application Coordinator and Router
const App = (() => {
  let activeComponent = null;

  // Render main application shell
  function init() {
    const root = document.getElementById('app-root');
    root.innerHTML = `
      <!-- Global Navigation Header -->
      <header class="app-header glass-panel">
        <div class="logo-container">
          <div class="logo-icon"><i class="fas fa-graduation-cap"></i></div>
          <div>IMS <span class="gradient-text">Sync</span></div>
        </div>
        <div class="nav-actions">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <i class="far fa-moon" style="font-size:0.85rem; color:var(--text-secondary);"></i>
            <label class="theme-switch">
              <input type="checkbox" id="theme-toggle-checkbox">
              <span class="slider">
                <span class="slider-icons">
                  <i class="fas fa-sun"></i>
                  <i class="fas fa-moon"></i>
                </span>
              </span>
            </label>
          </div>
          <div id="nav-user-session" style="display: flex; align-items: center; gap: 1rem;">
            <!-- Session actions injected here -->
          </div>
        </div>
      </header>

      <!-- Main Router Viewport -->
      <div id="router-viewport"></div>

      <!-- Toast Notification Container -->
      <div id="toast-container" class="notification-container"></div>
    `;

    initTheme();
    initRouter();
    window.showToast = showToast;
  }

  // Dark/Light Theme Control
  function initTheme() {
    const toggle = document.getElementById('theme-toggle-checkbox');
    const savedTheme = localStorage.getItem('ims_theme') || 'dark'; // Default to premium dark mode!

    document.documentElement.setAttribute('data-theme', savedTheme);
    toggle.checked = savedTheme === 'dark';

    toggle.addEventListener('change', () => {
      const theme = toggle.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('ims_theme', theme);
      showToast(`Switched to ${theme} mode`, 'info');
    });
  }

  // Routing System using hashtags
  function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    // Initial route handling
    handleRoute();
  }

  function handleRoute() {
    const hash = window.location.hash || '#landing';
    const viewport = 'router-viewport';

    // Route Guards
    const session = DB.getCurrentSession();

    // Destroy active component to free resources (like camera stream, charts, event hooks)
    if (activeComponent && typeof activeComponent.destroy === 'function') {
      activeComponent.destroy();
    }

    // Refresh navbar actions
    updateNavbarActions();

    if (hash === '#landing') {
      if (session) {
        // Logged in user tries to visit landing page -> redirect to their dashboard
        window.location.hash = `#${session.role}`;
        return;
      }
      activeComponent = window.LandingComponent;
      window.LandingComponent.render(viewport);
      return;
    }

    // Authenticated routes check
    if (!session) {
      window.location.hash = '#landing';
      showToast('Session expired. Please sign in.', 'warning');
      return;
    }

    // RBAC: Verify role permissions matches targeted URL hash
    if (hash === '#intern' && session.role === 'intern') {
      activeComponent = window.InternComponent;
      window.InternComponent.render(viewport);
    } else if (hash === '#manager' && session.role === 'manager') {
      activeComponent = window.ManagerComponent;
      window.ManagerComponent.render(viewport);
    } else if (hash === '#admin' && session.role === 'admin') {
      activeComponent = window.AdminComponent;
      window.AdminComponent.render(viewport);
    } else {
      // Role mismatch -> redirect to their authorized landing dashboard
      window.location.hash = `#${session.role}`;
      showToast('Unauthorized workspace access. Redirecting...', 'danger');
    }
  }

  // Update Header details based on session status
  function updateNavbarActions() {
    const container = document.getElementById('nav-user-session');
    if (!container) return;

    const session = DB.getCurrentSession();
    if (!session) {
      container.innerHTML = `
        <span style="font-size: 0.85rem; color: var(--text-muted);">Guest Workspace</span>
      `;
      return;
    }

    const user = DB.getUser(session.userId);
    const avatarImg = user && user.avatar 
      ? `<img src="${user.avatar}" style="width:28px; height:28px; border-radius:50%; object-fit:cover; border:1px solid var(--primary);">`
      : `<span style="font-size:0.75rem; font-weight:700;">${session.name.charAt(0)}</span>`;

    container.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem;">
        <div style="width:28px; height:28px; border-radius:50%; background:var(--bg-tertiary); display:flex; align-items:center; justify-content:center; border:1px solid var(--border-color); overflow:hidden;">
          ${avatarImg}
        </div>
        <span style="font-weight:600;">${session.name.split(' ')[0]}</span>
        <span style="font-size:0.75rem; background:rgba(99, 102, 241, 0.15); color:var(--primary); padding: 0.15rem 0.4rem; border-radius:var(--radius-sm); text-transform:uppercase;">${session.role}</span>
      </div>
      <button class="btn btn-secondary" id="nav-logout-btn" style="padding:0.4rem 0.8rem; font-size:0.8rem; border-radius: var(--radius-sm);">
        Sign Out
      </button>
    `;

    document.getElementById('nav-logout-btn').onclick = () => {
      if (confirm('Sign out of your active session?')) {
        DB.logout();
        window.location.hash = '#landing';
        showToast('Logged out successfully.', 'success');
      }
    };
  }

  // Toast Notification Service
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast glass-panel ${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    else if (type === 'warning') icon = 'fa-exclamation-triangle';
    else if (type === 'danger') icon = 'fa-times-circle';

    toast.innerHTML = `
      <i class="fas ${icon}" style="font-size: 1.15rem;"></i>
      <span class="toast-message">${message}</span>
      <span class="toast-close"><i class="fas fa-times"></i></span>
    `;

    container.appendChild(toast);

    // Auto dismiss after 4 seconds
    const dismissTimer = setTimeout(() => {
      toast.style.animation = 'toast-slide-in 0.3s ease-in reverse forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);

    // Manual close hook
    toast.querySelector('.toast-close').onclick = () => {
      clearTimeout(dismissTimer);
      toast.remove();
    };
  }

  return {
    init
  };
})();

// Bootstrap App
document.addEventListener('DOMContentLoaded', App.init);
