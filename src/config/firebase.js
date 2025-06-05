import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// YOUR NEW Firebase configuration - replace with your actual values
const firebaseConfig = {
  apiKey: "AIzaSyDsE73klJi0P1whiO_1IVIPsDGIv13q0xY",
  authDomain: "fighttracker-app.firebaseapp.com",
  projectId: "fighttracker-app",
  storageBucket: "fighttracker-app.firebasestorage.app",
  messagingSenderId: "938372568113",
  appId: "1:938372568113:web:df02ce0666398a533c7110",
  measurementId: "G-CL7KQ15FCQ",
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;

try {
  // Initialize Firebase app
  app = initializeApp(firebaseConfig);

  // Initialize Auth with better error handling
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // If already initialized, get the existing instance
    auth = getAuth(app);
  }

  // Initialize Firestore
  db = getFirestore(app);

  // Initialize Storage
  storage = getStorage(app);

  console.log("🔥 Firebase initialized successfully for FightTracker!");
} catch (error) {
  console.error("❌ Firebase initialization error:", error);
  // Create fallback objects to prevent crashes
  auth = null;
  db = null;
  storage = null;
}

export { auth, db, storage };
export default app;
