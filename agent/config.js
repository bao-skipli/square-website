import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const agentDir = __dirname;
export const rootDir = path.resolve(__dirname, "..");

// Load environment variables (.env from rootDir and agentDir)
if (fs.existsSync(path.join(rootDir, ".env"))) {
  process.loadEnvFile(path.join(rootDir, ".env"));
}
if (fs.existsSync(path.join(__dirname, ".env"))) {
  process.loadEnvFile(path.join(__dirname, ".env"));
}

export const AGENT_PORT = parseInt(process.env.AGENT_PORT || "4567", 10);
export const BUNNY_ACCOUNT_API_KEY = process.env.BUNNY_ACCOUNT_API_KEY || "";
export const BUNNY_PULL_ZONE_ID = process.env.BUNNY_PULL_ZONE_ID || "";
export const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || "yourstore.b-cdn.net";
export const BUNNY_STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME || "";
export const BUNNY_STORAGE_ZONE_PASSWORD = process.env.BUNNY_STORAGE_ZONE_PASSWORD || "";
export const BUNNY_STORAGE_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME || "storage.bunnycdn.com";

export const isSimulatedMode =
  !BUNNY_ACCOUNT_API_KEY ||
  BUNNY_ACCOUNT_API_KEY.startsWith("your_") ||
  !BUNNY_PULL_ZONE_ID ||
  BUNNY_PULL_ZONE_ID.startsWith("your_");

export const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

export const AGENT_FIREBASE_EMAIL = process.env.AGENT_FIREBASE_EMAIL;
export const AGENT_FIREBASE_PASSWORD = process.env.AGENT_FIREBASE_PASSWORD;
