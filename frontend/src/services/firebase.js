import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app = null;
let auth = null;
let isMockFirebase = false;

const hasRealConfig = (
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'mock-api-key' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'mock-project'
);

if (hasRealConfig) {
  try {
    // Prevent duplicate app initialization (HMR safe)
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    console.log('[Firebase] Real Firebase initialized for project:', firebaseConfig.projectId);
  } catch (error) {
    console.error('[Firebase] Web SDK Initialization Error:', error.message);
    isMockFirebase = true;
  }
} else {
  console.warn('[Firebase] Running in Client-Side MOCK FIREBASE mode. Set VITE_FIREBASE_* env vars to use real Firebase.');
  isMockFirebase = true;

  // Simulated auth object for development without Firebase config
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signInWithEmail: async (email) => ({
      user: { email, uid: `mock_uid_${email.split('@')[0]}`, getIdToken: async () => `mock_token_${email}` }
    }),
    createUserWithEmail: async (email, displayName) => ({
      user: {
        email,
        uid: `mock_uid_${email.split('@')[0]}`,
        displayName,
        getIdToken: async () => `mock_token_${email}`,
        sendEmailVerification: async () => {}
      }
    }),
    logOut: async () => {}
  };
}

export { 
  app, 
  auth, 
  isMockFirebase,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendEmailVerification,
  updateProfile
};
