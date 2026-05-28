window.LandingComponent = {
  render(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="landing-container">
        <div class="landing-hero">
          <h1>Manage Interns <span class="gradient-text">Efficiently</span></h1>
          <p>The ultimate Intern Management System to monitor attendance, track daily progress, assign real-time tasks, and review analytical productivity performance reports.</p>
          
          <div class="hero-features">
            <div class="feature-card glass-panel">
              <i class="fas fa-camera"></i>
              <h4>Face Verification</h4>
              <p>Camera integration captures and logs employee photos automatically upon login for secure attendance marking.</p>
            </div>
            <div class="feature-card glass-panel">
              <i class="fas fa-bolt"></i>
              <h4>Real-time Tasks</h4>
              <p>Assign work instantly. Dashboard status updates reflect immediately across dashboards via BroadcastChannel.</p>
            </div>
            <div class="feature-card glass-panel">
              <i class="fas fa-chart-pie"></i>
              <h4>Productivity Reports</h4>
              <p>Detailed performance summaries, late statistics, and interactive charts verify progress status.</p>
            </div>
            <div class="feature-card glass-panel">
              <i class="fas fa-shield-alt"></i>
              <h4>RBAC Security</h4>
              <p>Dedicated workspaces for Admin, Managers, and Interns restrict access to verified personnel.</p>
            </div>
          </div>
        </div>

        <div class="auth-panel-wrapper">
          <div class="auth-panel glass-panel">
            <div class="auth-tabs">
              <div class="auth-tab active" data-role="intern">Intern</div>
              <div class="auth-tab" data-role="manager">Manager</div>
              <div class="auth-tab" data-role="admin">Admin</div>
            </div>

            <!-- Login Form -->
            <form id="login-form">
              <input type="hidden" id="login-role" value="intern">
              
              <div class="form-group">
                <label for="login-email">Username or Email</label>
                <div class="input-wrapper">
                  <i class="fas fa-user"></i>
                  <input type="text" id="login-email" class="form-control" placeholder="e.g. intern@system.com" required autocomplete="username">
                </div>
              </div>
              
              <div class="form-group">
                <label for="login-password">Password</label>
                <div class="input-wrapper">
                  <i class="fas fa-lock"></i>
                  <input type="password" id="login-password" class="form-control" placeholder="Enter password" required autocomplete="current-password">
                </div>
              </div>

              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                Sign In
              </button>
            </form>

            <!-- Signup Form (Intern Only) -->
            <form id="signup-form" style="display: none;">
              <div class="form-group">
                <label for="signup-name">Full Name</label>
                <div class="input-wrapper">
                  <i class="fas fa-user-circle"></i>
                  <input type="text" id="signup-name" class="form-control" placeholder="e.g. Jane Doe" required>
                </div>
              </div>

              <div class="form-group">
                <label for="signup-username">Username</label>
                <div class="input-wrapper">
                  <i class="fas fa-at"></i>
                  <input type="text" id="signup-username" class="form-control" placeholder="e.g. janedoe" required>
                </div>
              </div>
              
              <div class="form-group">
                <label for="signup-email">Email Address</label>
                <div class="input-wrapper">
                  <i class="fas fa-envelope"></i>
                  <input type="email" id="signup-email" class="form-control" placeholder="e.g. jane@system.com" required>
                </div>
              </div>
              
              <div class="form-group">
                <label for="signup-password">Password</label>
                <div class="input-wrapper">
                  <i class="fas fa-lock"></i>
                  <input type="password" id="signup-password" class="form-control" placeholder="Create secure password" required minlength="6">
                </div>
              </div>

              <div class="form-group">
                <label for="signup-phone">Phone Number (Optional)</label>
                <div class="input-wrapper">
                  <i class="fas fa-phone"></i>
                  <input type="tel" id="signup-phone" class="form-control" placeholder="e.g. +1 (555) 000-0000">
                </div>
              </div>

              <div class="form-group">
                <label for="signup-department">Department (Optional)</label>
                <div class="input-wrapper">
                  <i class="fas fa-building"></i>
                  <input type="text" id="signup-department" class="form-control" placeholder="e.g. Engineering">
                </div>
              </div>

              <button type="submit" class="btn btn-accent" style="width: 100%; margin-top: 1rem;">
                Create Account
              </button>
            </form>

            <div class="auth-footer" id="auth-footer-toggle">
              Don't have an account? <span id="toggle-signup">Create one</span>
            </div>
            
            <div id="quick-login-hints" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px dashed var(--border-color); font-size: 0.8rem; color: var(--text-muted);">
              <strong>Pre-seeded demo credentials:</strong><br>
              • Intern: <code style="cursor:pointer;" class="hint-cred">intern@system.com</code> / <code>intern123</code><br>
              • Manager: <code style="cursor:pointer;" class="hint-cred">manager@system.com</code> / <code>manager123</code><br>
              • Admin: <code style="cursor:pointer;" class="hint-cred">admin@system.com</code> / <code>admin123</code>
            </div>
          </div>
        </div>
      </div>
    `;

    this.initEvents();
  },

  initEvents() {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginRoleInput = document.getElementById('login-role');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authFooter = document.getElementById('auth-footer-toggle');
    const toggleSignupSpan = document.getElementById('toggle-signup');
    const emailInput = document.getElementById('login-email');

    // Click tabs to change role
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const role = tab.getAttribute('data-role');
        loginRoleInput.value = role;

        // Reset display state
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';

        if (role === 'intern') {
          authFooter.style.display = 'block';
          authFooter.innerHTML = `Don't have an account? <span id="toggle-signup-dynamic">Create one</span>`;
          emailInput.placeholder = 'e.g. intern@system.com';
          document.getElementById('toggle-signup-dynamic').onclick = toggleForm;
        } else {
          authFooter.style.display = 'none';
          emailInput.placeholder = role === 'manager' ? 'e.g. manager@system.com' : 'e.g. admin@system.com';
        }
      });
    });

    // Toggle Form between Login and Sign Up
    function toggleForm() {
      if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        authFooter.innerHTML = `Don't have an account? <span id="toggle-signup-dynamic">Create one</span>`;
      } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        authFooter.innerHTML = `Already have an account? <span id="toggle-login-dynamic">Sign In</span>`;
      }
      const toggleSignupDynamic = document.getElementById('toggle-signup-dynamic');
      const toggleLoginDynamic = document.getElementById('toggle-login-dynamic');
      if (toggleSignupDynamic) toggleSignupDynamic.onclick = toggleForm;
      if (toggleLoginDynamic) toggleLoginDynamic.onclick = toggleForm;
    }

    if (toggleSignupSpan) {
      toggleSignupSpan.onclick = toggleForm;
    }

    // Quick fill credentials helper
    document.querySelectorAll('.hint-cred').forEach(el => {
      el.onclick = () => {
        const text = el.innerText;
        emailInput.value = text;
        
        let pass = 'intern123';
        let role = 'intern';
        if (text.includes('manager')) {
          pass = 'manager123';
          role = 'manager';
        } else if (text.includes('admin')) {
          pass = 'admin123';
          role = 'admin';
        }

        document.getElementById('login-password').value = pass;
        
        // Find matching tab and click
        tabs.forEach(t => {
          if (t.getAttribute('data-role') === role) {
            t.click();
          }
        });
      };
    });

    // Handle Sign In submission
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass = document.getElementById('login-password').value;
      const expectedRole = loginRoleInput.value;

      const result = DB.login(email, pass);
      if (result.success) {
        // Double check role alignment
        if (result.user.role !== expectedRole) {
          window.showToast(`Logged in, but redirection based on system role: ${result.user.role.toUpperCase()}`, 'warning');
        } else {
          window.showToast(`Welcome back, ${result.user.name}!`, 'success');
        }
        
        // Redirect to dashboard hash
        window.location.hash = `#${result.user.role}`;
      } else {
        window.showToast(result.message, 'danger');
      }
    });

    // Handle Sign Up submission
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value.trim();
      const username = document.getElementById('signup-username').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const phone = document.getElementById('signup-phone').value.trim();
      const department = document.getElementById('signup-department').value.trim();

      const result = DB.signup(name, username, email, password, phone, department);
      if (result.success) {
        window.showToast(`Account created successfully! Welcome, ${result.user.name}`, 'success');
        window.location.hash = '#intern';
      } else {
        window.showToast(result.message, 'danger');
      }
    });
  }
};
