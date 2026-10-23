import {
  rootDir,
  AGENT_PORT,
  BUNNY_PULL_ZONE_ID,
  BUNNY_CDN_HOSTNAME,
  BUNNY_STORAGE_ZONE_NAME,
  isSimulatedMode,
  firebaseConfig,
} from "./config.js";
import { initFirebase } from "./services/firebaseClient.js";
import { createAgentServer } from "./server/server.js";
import { startDbJobListeners } from "./listeners/dbJobListener.js";
import { startHeartbeat, stopHeartbeat, updateHeartbeat } from "./listeners/heartbeat.js";

console.log("----------------------------------------------------------------");
console.log(" 🐇 Bunny.net Local Deployment & Domain Agent");
console.log("----------------------------------------------------------------");
console.log(`Working Directory: ${rootDir}`);
console.log(`Local HTTP Port:   http://127.0.0.1:${AGENT_PORT}`);
console.log(`Database URL:      ${firebaseConfig.databaseURL || "Not configured"}`);
console.log(`Bunny Pull Zone:   ${BUNNY_PULL_ZONE_ID || "Not configured"}`);
console.log(`Bunny CDN Host:    ${BUNNY_CDN_HOSTNAME}`);
console.log(`Bunny Storage:     ${BUNNY_STORAGE_ZONE_NAME || "Not configured"}`);
if (isSimulatedMode) {
  console.log("⚠️  BUNNY CREDENTIALS MISSING: Running in Simulated Mode for UI testing.");
} else {
  console.log("🔒 REAL BUNNY API MODE: Direct HTTP REST requests active.");
}
console.log("----------------------------------------------------------------");

// 1. Initialize Firebase & start listeners
initFirebase()
  .then(() => {
    startDbJobListeners();
    startHeartbeat(12000);
  })
  .catch((err) => {
    console.warn("[Agent] Firebase init warning:", err.message);
  });

// 2. Start HTTP Loopback Server for Dashboard UI
const server = createAgentServer();
server.listen(AGENT_PORT, "127.0.0.1", () => {
  console.log(`[Agent] Local HTTP loopback API listening at http://127.0.0.1:${AGENT_PORT}`);
});

// 3. Graceful shutdown
function handleShutdown() {
  console.log("\n[Agent] Shutting down agent gracefully...");
  stopHeartbeat();
  server.close(() => {
    updateHeartbeat(false).finally(() => {
      process.exit(0);
    });
  });
}

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
