import { ref, get, update } from "firebase/database";
import {
  isSimulatedMode,
  BUNNY_ACCOUNT_API_KEY,
  BUNNY_PULL_ZONE_ID,
  BUNNY_CDN_HOSTNAME,
  BUNNY_STORAGE_ZONE_NAME,
  BUNNY_STORAGE_ZONE_PASSWORD,
} from "../config.js";
import { getDb, getHasDbAccess } from "./firebaseClient.js";

const deployments = new Map();
let isDeploying = false;

export function getIsDeploying() {
  return isDeploying;
}

export function setIsDeploying(val) {
  isDeploying = Boolean(val);
}

export function getJob(jobId) {
  return deployments.get(jobId);
}

export function setJob(jobId, jobData) {
  deployments.set(jobId, jobData);
}

export function getAllDeployments() {
  return deployments;
}

export function getAgentStatusPayload() {
  return {
    online: true,
    lastHeartbeat: Date.now(),
    version: "1.0.0",
    isSimulated: isSimulatedMode,
    capabilities: {
      customDomain: Boolean(BUNNY_ACCOUNT_API_KEY && BUNNY_PULL_ZONE_ID),
      storageDeploy: Boolean(BUNNY_STORAGE_ZONE_NAME && BUNNY_STORAGE_ZONE_PASSWORD),
      landingPageDeploy: true,
    },
    configSummary: {
      pullZoneId: BUNNY_PULL_ZONE_ID ? String(BUNNY_PULL_ZONE_ID) : null,
      cdnHostname: BUNNY_CDN_HOSTNAME,
      storageZone: BUNNY_STORAGE_ZONE_NAME || null,
    },
  };
}

export async function appendJobLog(jobId, message, level = "info") {
  const timestamp = Date.now();
  console.log(`[Job ${jobId.slice(-6)}] ${message}`);

  const job = deployments.get(jobId);
  if (job) {
    job.logs.push({ timestamp, message, level });
    if (job.logs.length > 200) job.logs = job.logs.slice(-200);
    job.updatedAt = timestamp;
  }

  const db = getDb();
  const hasDbAccess = getHasDbAccess();
  if (db && hasDbAccess) {
    try {
      const jobRef = ref(db, `deploymentJobs/${jobId}`);
      const snap = await get(jobRef);
      if (snap.exists()) {
        const val = snap.val();
        const logs = val.logs || [];
        logs.push({ timestamp, message, level });
        await update(jobRef, {
          logs: logs.slice(-150),
          updatedAt: timestamp,
        });
      }
    } catch (e) {
      console.warn(`[JobStore] Failed to sync log to RTDB for job ${jobId}: ${e.message}`);
    }
  }
}

export async function updateJobState(jobId, updates) {
  const job = deployments.get(jobId);
  if (job) {
    Object.assign(job, updates, { updatedAt: Date.now() });
  }

  const db = getDb();
  const hasDbAccess = getHasDbAccess();
  if (db && hasDbAccess) {
    try {
      const jobRef = ref(db, `deploymentJobs/${jobId}`);
      await update(jobRef, {
        ...updates,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.warn(`[JobStore] Failed to sync status to RTDB for job ${jobId}: ${e.message}`);
    }
  }
}

