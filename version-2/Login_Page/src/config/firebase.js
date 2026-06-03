const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};

const adminEmails = ["admin@attendance.local"];
const demoAdminPassword = "Admin@123";

function hasFirebaseConfig() {
  return Object.values(firebaseConfig).every((value) => value && !value.startsWith("YOUR_"));
}

window.firebaseSettings = {
  adminEmails,
  config: firebaseConfig,
  demoAdminPassword,
  hasFirebaseConfig,
};
