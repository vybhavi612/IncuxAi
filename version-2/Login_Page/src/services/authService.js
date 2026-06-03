function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);

    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(script);
  });
}

window.loadScript = loadScript;

async function loadFirebase() {
  await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
  await loadScript("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js");
}

function getFirebaseAuth() {
  const settings = window.firebaseSettings;

  if (!settings.hasFirebaseConfig()) {
    throw new Error("Add your Firebase config in src/config/firebase.js before logging in.");
  }

  const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(settings.config);
  return app.auth();
}

async function loginWithEmail(email, password) {
  await loadFirebase();
  const auth = getFirebaseAuth();

  return auth.signInWithEmailAndPassword(email, password);
}

async function signupWithEmail(profile) {
  if (!window.firebaseSettings.hasFirebaseConfig()) {
    return window.dataService.createLocalUser(profile);
  }

  await loadFirebase();
  const auth = getFirebaseAuth();
  const result = await auth.createUserWithEmailAndPassword(profile.email, profile.password);
  await result.user.updateProfile({ displayName: profile.name });

  const user = {
    id: result.user.uid,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    department: profile.department,
  };

  await window.dataService.saveUser(user);
  window.dataService.setCurrentUser(user);
  return { user };
}

async function loginWithEmailAndPhoto(email, password, photoDataUrl) {
  const settings = window.firebaseSettings;

  if (!settings.hasFirebaseConfig()) {
    const user = await window.dataService.loginLocalUser(email, password, {
      adminEmails: settings.adminEmails,
      demoAdminPassword: settings.demoAdminPassword,
    });
    await window.dataService.createAttendanceRecord(user, photoDataUrl);
    window.dataService.setCurrentUser(user);
    return { user };
  }

  const result = await loginWithEmail(email, password);
  const firebaseUser = result.user;
  const profile = await window.dataService.getUser(firebaseUser.uid);
  const user = profile || {
    id: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.displayName || firebaseUser.email,
    role: settings.adminEmails.includes(firebaseUser.email) ? "admin" : "student",
    department: "General",
  };

  await window.dataService.saveUser(user);
  await window.dataService.createAttendanceRecord(user, photoDataUrl);
  window.dataService.setCurrentUser(user);
  return { user };
}

function logout() {
  const user = window.dataService.getCurrentUser();

  if (user) {
    window.dataService.logoutAttendance(user.id);
  }

  window.dataService.clearCurrentUser();
}

window.authService = {
  loginWithEmail,
  loginWithEmailAndPhoto,
  logout,
  signupWithEmail,
};
