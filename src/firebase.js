import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQdiytQK4MofBfEzOxrL9PQfeyQ_BTgRQ",
  authDomain: "smart-attendance-system-26445.firebaseapp.com",
  projectId: "smart-attendance-system-26445",
  storageBucket: "smart-attendance-system-26445.firebasestorage.app",
  messagingSenderId: "671041659740",
  appId: "1:671041659740:web:5ea6103d658cea93291799",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };