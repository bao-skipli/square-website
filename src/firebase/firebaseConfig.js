import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const env = (typeof import.meta !== "undefined" && import.meta.env) || (typeof process !== "undefined" && process.env) || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "dummy_api_key",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "dummy_auth_domain",
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || "https://square-clone-dummy.firebaseio.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "square-clone-dummy",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "dummy_bucket",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "0000000000",
  appId: env.VITE_FIREBASE_APP_ID || "1:0000000000:web:dummy",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-DUMMY",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
