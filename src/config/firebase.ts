import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCSd6hLGxrJBqPSMVmIvSIq1CMn7DEGm48",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mybudgetdeal99-f5d2a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mybudgetdeal99-f5d2a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mybudgetdeal99-f5d2a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "408950158414",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:408950158414:web:8a580e622b22433aabbf1f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9SQJLP8DEH"
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics support check
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported or blocked by ad-blocker
  });
}
