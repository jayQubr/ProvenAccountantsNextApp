import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  // Check if analytics is supported before initializing
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export {
  app,
  db,
  auth,
  functions,
  storage,
  analytics,
  googleProvider
};