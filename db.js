// Database abstraction layer using LocalStorage and IndexedDB

const DB = (() => {
  // Database keys in LocalStorage
  const KEYS = {
    USERS: 'ims_users',
    ATTENDANCE: 'ims_attendance',
    TASKS: 'ims_tasks',
    LOGS: 'ims_logs',
    CONFIG: 'ims_config',
    SESSION: 'ims_session'
  };

  // Helper to get from localstorage
  function getJSON(key, defaultValue = []) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  // Helper to set to localstorage
  function setJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // IndexedDB Configuration for Photos
  const DB_NAME = 'IMS_Photos_DB';
  const DB_VERSION = 1;
  const STORE_NAME = 'photos';

  let dbInstance = null;

  // Initialize IndexedDB
  function initIndexedDB() {
    return new Promise((resolve, reject) => {
      if (dbInstance) return resolve(dbInstance);

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = event.target.result;
        resolve(dbInstance);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // Save photo to IndexedDB
  async function savePhoto(id, base64Data) {
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id, photo: base64Data, timestamp: Date.now() });

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  // Get photo from IndexedDB
  async function getPhoto(id) {
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result ? request.result.photo : null);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete photo from IndexedDB
  async function deletePhoto(id) {
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Seed default configuration & users
  function seed() {
    // 1. Seed Config
    if (!localStorage.getItem(KEYS.CONFIG)) {
      setJSON(KEYS.CONFIG, {
        shiftStartTime: '09:00',
        lateBufferTime: '09:15',
        currency: 'USD',
        allowSelfSignup: true
      });
    }

    // 2. Seed Users (Admin, Manager, default Intern)
    const users = getJSON(KEYS.USERS);
    let updated = false;

    // Admin Account
    if (!users.some(u => u.email === 'admin@system.com')) {
      users.push({
        id: 'usr_admin',
        username: 'admin',
        email: 'admin@system.com',
        name: 'System Admin',
        password: 'admin123', // Clean text for mockup purposes
        role: 'admin',
        status: 'active',
        contact: { phone: '+1 (555) 019-9000', department: 'Administration' },
        avatar: '',
        createdAt: new Date().toISOString()
      });
      updated = true;
    }

    // Manager Account
    if (!users.some(u => u.email === 'manager@system.com')) {
      users.push({
        id: 'usr_manager',
        username: 'manager',
        email: 'manager@system.com',
        name: 'Sarah Connor',
        password: 'manager123',
        role: 'manager',
        status: 'active',
        contact: { phone: '+1 (555) 014-4821', department: 'Engineering' },
        avatar: '',
        createdAt: new Date().toISOString()
      });
      updated = true;
    }

    // Intern Account
    if (!users.some(u => u.email === 'intern@system.com')) {
      users.push({
        id: 'usr_intern',
        username: 'intern',
        email: 'intern@system.com',
        name: 'John Doe',
        password: 'intern123',
        role: 'intern',
        status: 'active',
        contact: { phone: '+1 (555) 018-8742', department: 'Engineering' },
        avatar: '',
        createdAt: new Date().toISOString()
      });
      updated = true;
    }

    if (updated) {
      setJSON(KEYS.USERS, users);
      logActivity('system', 'System database pre-seeded with default roles.');
    }

    // 3. Seed some dummy tasks for default Intern if tasks are empty
    const tasks = getJSON(KEYS.TASKS);
    if (tasks.length === 0) {
      tasks.push({
        id: 'tsk_1',
        title: 'Review System Documentation',
        description: 'Read the intern handbook and set up your local workspace environment.',
        deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
        priority: 'High',
        assignedTo: ['usr_intern'],
        status: { usr_intern: 'pending' },
        createdBy: 'usr_manager',
        createdAt: new Date().toISOString()
      });
      tasks.push({
        id: 'tsk_2',
        title: 'Create Dashboard Design Draft',
        description: 'Create an initial UI draft of the user metrics dashboard panel.',
        deadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days from now
        priority: 'Medium',
        assignedTo: ['usr_intern'],
        status: { usr_intern: 'completed' },
        createdBy: 'usr_manager',
        createdAt: new Date().toISOString()
      });
      setJSON(KEYS.TASKS, tasks);
    }
  }

  // Log system activity
  function logActivity(userId, action, details = '') {
    const logs = getJSON(KEYS.LOGS);
    logs.push({
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId,
      action,
      details
    });
    setJSON(KEYS.LOGS, logs);
  }

  // Initialize immediately
  initIndexedDB();
  seed();

  return {
    // Authentication & Session
    login(emailOrUsername, password) {
      const users = getJSON(KEYS.USERS);
      const user = users.find(
        u => (u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
              u.username.toLowerCase() === emailOrUsername.toLowerCase()) && 
              u.password === password
      );

      if (!user) {
        return { success: false, message: 'Invalid credentials. Please check your username/email and password.' };
      }

      if (user.status !== 'active') {
        return { success: false, message: 'Your account is deactivated. Please contact an admin.' };
      }

      // Store in session
      const session = {
        userId: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        loggedInAt: new Date().toISOString()
      };
      setJSON(KEYS.SESSION, session);
      logActivity(user.id, 'User Login', `Logged in from role: ${user.role}`);
      return { success: true, user: session };
    },

    signup(name, username, email, password, phone = '', department = '') {
      const users = getJSON(KEYS.USERS);

      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'Email address already registered.' };
      }
      if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Username already taken.' };
      }

      const newUser = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        username,
        email,
        name,
        password,
        role: 'intern', // Users signing up are default interns
        status: 'active',
        contact: { phone, department },
        avatar: '',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      setJSON(KEYS.USERS, users);
      logActivity(newUser.id, 'User Signup', 'Self-registered as an intern.');
      
      // Auto login after sign up
      return this.login(email, password);
    },

    logout() {
      const session = getJSON(KEYS.SESSION, null);
      if (session) {
        logActivity(session.userId, 'User Logout', `Logged out.`);
        localStorage.removeItem(KEYS.SESSION);
      }
      return true;
    },

    getCurrentSession() {
      return getJSON(KEYS.SESSION, null);
    },

    getUser(userId) {
      const users = getJSON(KEYS.USERS);
      return users.find(u => u.id === userId) || null;
    },

    getUsersByRole(role) {
      const users = getJSON(KEYS.USERS);
      return users.filter(u => u.role === role);
    },

    getAllUsers() {
      return getJSON(KEYS.USERS);
    },

    updateUser(userId, updatedData) {
      const users = getJSON(KEYS.USERS);
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) return { success: false, message: 'User not found.' };

      // Prevent altering role or username easily if not admin
      users[index] = { ...users[index], ...updatedData };
      setJSON(KEYS.USERS, users);
      logActivity(userId, 'Profile Updated', 'Modified profile details.');
      
      // If updating currently logged in user, sync session
      const session = getJSON(KEYS.SESSION, null);
      if (session && session.userId === userId) {
        session.name = users[index].name;
        session.email = users[index].email;
        session.username = users[index].username;
        setJSON(KEYS.SESSION, session);
      }

      return { success: true, user: users[index] };
    },

    addUserByAdmin(userData) {
      const users = getJSON(KEYS.USERS);
      if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        return { success: false, message: 'Email address already registered.' };
      }
      if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
        return { success: false, message: 'Username already taken.' };
      }

      const newUser = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        username: userData.username,
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: userData.role || 'intern',
        status: userData.status || 'active',
        contact: {
          phone: userData.phone || '',
          department: userData.department || 'Engineering'
        },
        avatar: userData.avatar || '',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      setJSON(KEYS.USERS, users);
      
      const adminSession = getJSON(KEYS.SESSION);
      logActivity(adminSession ? adminSession.userId : 'admin', 'User Created By Admin', `Created ${newUser.role}: ${newUser.username}`);
      return { success: true, user: newUser };
    },

    deleteUserByAdmin(userId) {
      const users = getJSON(KEYS.USERS);
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) return { success: false, message: 'User not found.' };

      const user = users[index];
      if (user.role === 'admin') {
        return { success: false, message: 'Cannot delete primary admin account.' };
      }

      users.splice(index, 1);
      setJSON(KEYS.USERS, users);

      // Clean up attendance
      let attendance = getJSON(KEYS.ATTENDANCE);
      attendance = attendance.filter(a => a.userId !== userId);
      setJSON(KEYS.ATTENDANCE, attendance);

      // Clean up task assignments
      const tasks = getJSON(KEYS.TASKS);
      tasks.forEach(task => {
        if (task.assignedTo.includes(userId)) {
          task.assignedTo = task.assignedTo.filter(id => id !== userId);
          delete task.status[userId];
        }
      });
      setJSON(KEYS.TASKS, tasks);

      const adminSession = getJSON(KEYS.SESSION);
      logActivity(adminSession ? adminSession.userId : 'admin', 'User Deleted By Admin', `Deleted user: ${user.username}`);
      return { success: true };
    },

    // Attendance Management
    async clockIn(userId, photoBase64) {
      const attendance = getJSON(KEYS.ATTENDANCE);
      const config = getJSON(KEYS.CONFIG);
      const todayStr = new Date().toISOString().split('T')[0];

      // Check if already clocked in today
      const existing = attendance.find(a => a.userId === userId && a.date === todayStr);
      if (existing) {
        return { success: false, message: 'You have already clocked in today.' };
      }

      // Capture time
      const now = new Date();
      const loginTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Check if late
      const [lateH, lateM] = config.lateBufferTime.split(':').map(Number);
      let status = 'Present';
      if (hours > lateH || (hours === lateH && minutes > lateM)) {
        status = 'Late';
      }

      // Generate photo key
      const photoId = `photo_${userId}_${Date.now()}`;
      if (photoBase64) {
        await savePhoto(photoId, photoBase64);
      }

      const newRecord = {
        id: 'att_' + Math.random().toString(36).substr(2, 9),
        userId,
        date: todayStr,
        loginTime,
        logoutTime: null,
        status,
        photoId: photoBase64 ? photoId : null
      };

      attendance.push(newRecord);
      setJSON(KEYS.ATTENDANCE, attendance);
      logActivity(userId, 'Clock In', `Status: ${status} at ${loginTime}`);

      return { success: true, record: newRecord };
    },

    clockOut(userId) {
      const attendance = getJSON(KEYS.ATTENDANCE);
      const todayStr = new Date().toISOString().split('T')[0];

      const recordIndex = attendance.findIndex(a => a.userId === userId && a.date === todayStr);
      if (recordIndex === -1) {
        return { success: false, message: 'No clock-in record found for today. Please clock in first.' };
      }

      if (attendance[recordIndex].logoutTime) {
        return { success: false, message: 'You have already clocked out today.' };
      }

      const now = new Date();
      const logoutTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
      attendance[recordIndex].logoutTime = logoutTime;

      setJSON(KEYS.ATTENDANCE, attendance);
      logActivity(userId, 'Clock Out', `Clocked out at ${logoutTime}`);

      return { success: true, record: attendance[recordIndex] };
    },

    getAttendanceForUser(userId) {
      const attendance = getJSON(KEYS.ATTENDANCE);
      return attendance.filter(a => a.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
    },

    getAllAttendance() {
      const attendance = getJSON(KEYS.ATTENDANCE);
      return attendance.sort((a, b) => b.date.localeCompare(a.date));
    },

    async getAttendancePhoto(photoId) {
      if (!photoId) return null;
      try {
        return await getPhoto(photoId);
      } catch (e) {
        console.error('Error fetching photo:', e);
        return null;
      }
    },

    // Task Management
    createTask(title, description, deadline, priority, assignedToUserIds, managerId) {
      const tasks = getJSON(KEYS.TASKS);
      const newTaskId = 'tsk_' + Math.random().toString(36).substr(2, 9);
      
      const statusMap = {};
      assignedToUserIds.forEach(id => {
        statusMap[id] = 'pending';
      });

      const newTask = {
        id: newTaskId,
        title,
        description,
        deadline,
        priority,
        assignedTo: assignedToUserIds,
        status: statusMap,
        createdBy: managerId,
        createdAt: new Date().toISOString()
      };

      tasks.push(newTask);
      setJSON(KEYS.TASKS, tasks);
      logActivity(managerId, 'Create Task', `Created task: "${title}" assigned to ${assignedToUserIds.length} interns.`);
      return { success: true, task: newTask };
    },

    updateTask(taskId, updatedFields, managerId) {
      const tasks = getJSON(KEYS.TASKS);
      const index = tasks.findIndex(t => t.id === taskId);
      if (index === -1) return { success: false, message: 'Task not found.' };

      const oldTask = tasks[index];
      
      // If assignedTo is modified, sync statusMap keys
      let newStatusMap = { ...oldTask.status };
      if (updatedFields.assignedTo) {
        // Remove keys not in new list
        Object.keys(newStatusMap).forEach(uid => {
          if (!updatedFields.assignedTo.includes(uid)) {
            delete newStatusMap[uid];
          }
        });
        // Add new keys
        updatedFields.assignedTo.forEach(uid => {
          if (!newStatusMap[uid]) {
            newStatusMap[uid] = 'pending';
          }
        });
      }

      tasks[index] = {
        ...oldTask,
        ...updatedFields,
        status: updatedFields.assignedTo ? newStatusMap : oldTask.status
      };

      setJSON(KEYS.TASKS, tasks);
      logActivity(managerId || 'system', 'Update Task', `Updated task: "${tasks[index].title}"`);
      return { success: true, task: tasks[index] };
    },

    updateTaskStatusByIntern(taskId, internId, newStatus) {
      const tasks = getJSON(KEYS.TASKS);
      const index = tasks.findIndex(t => t.id === taskId);
      if (index === -1) return { success: false, message: 'Task not found.' };

      const task = tasks[index];
      if (!task.assignedTo.includes(internId)) {
        return { success: false, message: 'You are not assigned to this task.' };
      }

      task.status[internId] = newStatus;
      setJSON(KEYS.TASKS, tasks);
      logActivity(internId, 'Task Progress Update', `Marked task "${task.title}" as ${newStatus}`);
      return { success: true, task };
    },

    deleteTask(taskId, managerId) {
      const tasks = getJSON(KEYS.TASKS);
      const index = tasks.findIndex(t => t.id === taskId);
      if (index === -1) return { success: false, message: 'Task not found.' };

      const title = tasks[index].title;
      tasks.splice(index, 1);
      setJSON(KEYS.TASKS, tasks);
      logActivity(managerId, 'Delete Task', `Deleted task: "${title}"`);
      return { success: true };
    },

    getTasksForIntern(internId) {
      const tasks = getJSON(KEYS.TASKS);
      return tasks.filter(t => t.assignedTo.includes(internId));
    },

    getAllTasks() {
      return getJSON(KEYS.TASKS);
    },

    // System Logs & Configurations
    getSystemLogs() {
      const logs = getJSON(KEYS.LOGS);
      return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    },

    getSystemConfig() {
      return getJSON(KEYS.CONFIG);
    },

    updateSystemConfig(newConfig, adminId) {
      const config = getJSON(KEYS.CONFIG);
      const updated = { ...config, ...newConfig };
      setJSON(KEYS.CONFIG, updated);
      logActivity(adminId, 'Config Updated', 'Modified system general parameters.');
      return { success: true, config: updated };
    },

    // Data Stats Helper
    getInternProductivityStats(internId) {
      const tasks = getJSON(KEYS.TASKS).filter(t => t.assignedTo.includes(internId));
      const total = tasks.length;
      const completed = tasks.filter(t => t.status[internId] === 'completed').length;
      const pending = total - completed;
      const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

      const attendance = getJSON(KEYS.ATTENDANCE).filter(a => a.userId === internId);
      const presentCount = attendance.filter(a => a.status === 'Present').length;
      const lateCount = attendance.filter(a => a.status === 'Late').length;
      const totalPresentDays = presentCount + lateCount;

      return {
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: pending,
        progressPercent,
        presentDays: totalPresentDays,
        lateDays: lateCount,
        absentDays: 0 // Mocked or calculated relative to start date
      };
    }
  };
})();

window.DB = DB;
