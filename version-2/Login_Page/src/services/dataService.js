const storageKeys = {
  attendance: "attendanceTracker.attendance",
  currentUser: "attendanceTracker.currentUser",
  settings: "attendanceTracker.settings",
  users: "attendanceTracker.users",
};

const defaultSettings = {
  loginTime: "10:00",
  logoutTime: "18:00",
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function getDb() {
  if (!window.firebaseSettings.hasFirebaseConfig()) {
    return null;
  }

  await window.loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
  await window.loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore-compat.js");

  if (!firebase.apps.length) {
    firebase.initializeApp(window.firebaseSettings.config);
  }

  return firebase.firestore();
}

function getUsers() {
  return readJson(storageKeys.users, []);
}

async function getUsersAsync() {
  const db = await getDb();

  if (!db) {
    return getUsers();
  }

  const snapshot = await db.collection("users").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function getCurrentUser() {
  return readJson(storageKeys.currentUser, null);
}

function setCurrentUser(user) {
  writeJson(storageKeys.currentUser, user);
}

function clearCurrentUser() {
  localStorage.removeItem(storageKeys.currentUser);
}

async function createLocalUser(profile) {
  const users = getUsers();
  const existing = users.find((user) => user.email.toLowerCase() === profile.email.toLowerCase());

  if (existing) {
    throw new Error("An account already exists for this email.");
  }

  const user = {
    id: createId(),
    email: profile.email,
    name: profile.name,
    password: profile.password,
    role: profile.role,
    department: profile.department,
  };

  users.push(user);
  writeJson(storageKeys.users, users);

  const safeUser = { ...user, password: undefined };
  setCurrentUser(safeUser);
  return { user: safeUser };
}

async function loginLocalUser(email, password, adminSettings) {
  if (
    adminSettings.adminEmails.includes(email.toLowerCase()) &&
    password === adminSettings.demoAdminPassword
  ) {
    return {
      id: "demo-admin",
      email,
      name: "Admin",
      role: "admin",
      department: "Administration",
    };
  }

  const user = getUsers().find(
    (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  return { ...user, password: undefined };
}

async function saveUser(user) {
  const cleanUser = { ...user, password: undefined };
  const users = getUsers();
  const nextUsers = users.filter((item) => item.id !== cleanUser.id);
  nextUsers.push(cleanUser);
  writeJson(storageKeys.users, nextUsers);

  const db = await getDb();
  if (db) {
    await db.collection("users").doc(cleanUser.id).set(cleanUser, { merge: true });
  }

  return cleanUser;
}

async function getUser(userId) {
  const db = await getDb();

  if (db) {
    const doc = await db.collection("users").doc(userId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  return getUsers().find((user) => user.id === userId) || null;
}

function getSettings() {
  return readJson(storageKeys.settings, defaultSettings);
}

async function getSettingsAsync() {
  const db = await getDb();

  if (!db) {
    return getSettings();
  }

  const doc = await db.collection("settings").doc("attendance").get();
  return doc.exists ? { ...defaultSettings, ...doc.data() } : getSettings();
}

function saveSettings(settings) {
  const nextSettings = { ...getSettings(), ...settings };
  writeJson(storageKeys.settings, nextSettings);
  getDb().then((db) => {
    if (db) {
      db.collection("settings").doc("attendance").set(nextSettings, { merge: true });
    }
  });
  return nextSettings;
}

function getAttendanceRecords() {
  return readJson(storageKeys.attendance, []);
}

async function getAttendanceRecordsAsync() {
  const db = await getDb();

  if (!db) {
    return getAttendanceRecords();
  }

  const snapshot = await db.collection("attendance").orderBy("loginAt", "desc").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

function getActiveRecord(userId) {
  return getAttendanceRecords().find((record) => record.userId === userId && !record.logoutAt);
}

async function createAttendanceRecord(user, photoDataUrl) {
  const records = getAttendanceRecords();
  const activeRecord = getActiveRecord(user.id);

  if (activeRecord) {
    return activeRecord;
  }

  const record = {
    id: createId(),
    userId: user.id,
    userName: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    loginAt: new Date().toISOString(),
    logoutAt: "",
    photoDataUrl,
  };

  records.unshift(record);
  writeJson(storageKeys.attendance, records);

  const db = await getDb();
  if (db) {
    await db.collection("attendance").doc(record.id).set(record, { merge: true });
  }

  return record;
}

function logoutAttendance(userId) {
  const records = getAttendanceRecords();
  const logoutAt = new Date().toISOString();
  const nextRecords = records.map((record) =>
    record.userId === userId && !record.logoutAt
      ? { ...record, logoutAt }
      : record
  );

  writeJson(storageKeys.attendance, nextRecords);
  getDb().then(async (db) => {
    if (!db) {
      return;
    }

    const snapshot = await db
      .collection("attendance")
      .where("userId", "==", userId)
      .where("logoutAt", "==", "")
      .get();

    snapshot.docs.forEach((doc) => doc.ref.update({ logoutAt }));
  });
  return nextRecords;
}

function recordsForUser(userId) {
  return getAttendanceRecords().filter((record) => record.userId === userId);
}

window.dataService = {
  clearCurrentUser,
  createAttendanceRecord,
  createLocalUser,
  getAttendanceRecords,
  getAttendanceRecordsAsync,
  getCurrentUser,
  getSettings,
  getSettingsAsync,
  getUser,
  getUsers,
  getUsersAsync,
  loginLocalUser,
  logoutAttendance,
  recordsForUser,
  saveSettings,
  saveUser,
  setCurrentUser,
};
