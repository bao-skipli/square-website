import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { firebaseConfig, AGENT_FIREBASE_EMAIL, AGENT_FIREBASE_PASSWORD } from "../config.js";

let db = null;
let auth = null;
let hasDbAccess = false;
let initPromise = null;

export async function initFirebase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      if (firebaseConfig.apiKey && firebaseConfig.databaseURL) {
        const existing = getApps().find((a) => a.name === "bunny-agent");
        const app = existing || initializeApp(firebaseConfig, "bunny-agent");
        db = getDatabase(app);
        auth = getAuth(app);

        if (AGENT_FIREBASE_EMAIL && AGENT_FIREBASE_PASSWORD) {
          try {
            await signInWithEmailAndPassword(auth, AGENT_FIREBASE_EMAIL, AGENT_FIREBASE_PASSWORD);
            console.log(`[Agent] Authenticated with Firebase Auth as ${AGENT_FIREBASE_EMAIL}`);
            hasDbAccess = true;
          } catch (e) {
            console.warn(`[Agent] Firebase Auth login failed: ${e.message}`);
          }
        }
      }
    } catch (e) {
      console.warn("[Agent] Firebase init notice:", e.message);
    }
    return { db, auth, hasDbAccess };
  })();

  return initPromise;
}

export function getDb() {
  return db;
}

export function getAuthInstance() {
  return auth;
}

export function getHasDbAccess() {
  return hasDbAccess;
}

export function setHasDbAccess(val) {
  hasDbAccess = val;
}
