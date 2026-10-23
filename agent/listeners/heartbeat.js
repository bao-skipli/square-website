import { ref, set } from "firebase/database";
import { getDb, getHasDbAccess } from "../services/firebaseClient.js";
import { getAgentStatusPayload } from "../services/jobStore.js";

let heartbeatTimer = null;

export async function updateHeartbeat(online = true) {
  const db = getDb();
  const hasDbAccess = getHasDbAccess();
  if (!db || !hasDbAccess) return;

  try {
    const statusRef = ref(db, "agentStatus");
    const payload = getAgentStatusPayload();
    payload.online = online;
    await set(statusRef, payload);
  } catch (err) {
    console.warn(`[Heartbeat] Failed to update agent heartbeat in RTDB: ${err.message}`);
  }
}

export function startHeartbeat(intervalMs = 12000) {
  updateHeartbeat(true);
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => updateHeartbeat(true), intervalMs);
}

export function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}
