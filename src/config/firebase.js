import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration - REPLACE WITH YOUR ACTUAL VALUES
const firebaseConfig = {
  apiKey: "AIzaSyAkVZqn5pUSqd3clVxm7O2vfSwZ9HXHFaA",
  authDomain: "limbs-muay-thai.firebaseapp.com",
  projectId: "limbs-muay-thai",
  storageBucket: "limbs-muay-thai.firebasestorage.app",
  messagingSenderId: "618880283240",
  appId: "1:618880283240:web:068c1b0ca2b576642901dd",
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
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch (error) {
    // If already initialized, get the existing instance
    auth = getAuth(app);
  }

  // Initialize Firestore
  db = getFirestore(app);

  // Initialize Storage
  storage = getStorage(app);

  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create fallback objects to prevent crashes
  auth = null;
  db = null;
  storage = null;
}

export { auth, db, storage };
export default app;