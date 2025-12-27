import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import getStorage

// Helper function to resolve environment variables in Vite or standard React environments
const getEnv = (key: string) => {
  let val: string | undefined = undefined;
  
  // Try import.meta.env (Vite)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      const viteKey = `VITE_${key}`;
      const env = (import.meta as any).env;
      if (env[viteKey]) val = env[viteKey];
      else if (env[key]) val = env[key];
    }
  } catch (e) {}
  
  // Try process.env (Standard/CRA/Next)
  if (!val) {
    try {
      if (typeof process !== 'undefined' && process.env) {
        const reactKey = `REACT_APP_${key}`;
        const nextKey = `NEXT_PUBLIC_${key}`;
        // @ts-ignore
        if (process.env[reactKey]) val = process.env[reactKey];
        // @ts-ignore
        else if (process.env[nextKey]) val = process.env[nextKey];
        // @ts-ignore
        else if (process.env[key]) val = process.env[key];
      }
    } catch (e) {}
  }

  return val;
};

// Use environment variables or fall back to dummy values to prevent 'auth/invalid-api-key' crash
const firebaseConfig = {
  apiKey: getEnv("FIREBASE_API_KEY") || "demo-api-key",
  authDomain: getEnv("FIREBASE_AUTH_DOMAIN") || "demo-project.firebaseapp.com",
  projectId: getEnv("FIREBASE_PROJECT_ID") || "demo-project",
  storageBucket: getEnv("FIREBASE_STORAGE_BUCKET") || "demo-project.appspot.com",
  messagingSenderId: getEnv("FIREBASE_MESSAGING_SENDER_ID") || "00000000000",
  appId: getEnv("FIREBASE_APP_ID") || "1:00000000000:web:00000000000000"
};

// Warn if running in demo mode
if (firebaseConfig.apiKey === "demo-api-key") {
  console.warn(
    "%c FIREBASE CONFIG MISSING %c\nApp is running in Demo Mode. Auth and DB will fail.\nSet VITE_FIREBASE_API_KEY (or REACT_APP_/NEXT_PUBLIC_) in your .env file.",
    "background: orange; color: black; font-weight: bold; padding: 4px; border-radius: 4px;",
    "background: transparent; color: inherit;"
  );
}

// Singleton pattern
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Export storage