import fs from "fs";
import path from "path";
import http from "node:http";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, get, set, update, onValue } from "firebase/database";
import {
  addCustomHostname,
  removeCustomHostname,
  loadFreeCertificate,
  purgePullZoneCache,
  uploadStorageFile,
  verifyDns,
  verifyLiveWebsite,
} from "./bunnyClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Load environment variables
if (fs.existsSync(path.join(rootDir, ".env"))) {
  process.loadEnvFile(path.join(rootDir, ".env"));
}
if (fs.existsSync(path.join(__dirname, ".env"))) {
  process.loadEnvFile(path.join(__dirname, ".env"));
}

const AGENT_PORT = parseInt(process.env.AGENT_PORT || "4567", 10);
const BUNNY_ACCOUNT_API_KEY = process.env.BUNNY_ACCOUNT_API_KEY || "";
const BUNNY_PULL_ZONE_ID = process.env.BUNNY_PULL_ZONE_ID || "";
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || "yourstore.b-cdn.net";
const BUNNY_STORAGE_ZONE_NAME = process.env.BUNNY_STORAGE_ZONE_NAME || "";
const BUNNY_STORAGE_ZONE_PASSWORD = process.env.BUNNY_STORAGE_ZONE_PASSWORD || "";
const BUNNY_STORAGE_HOSTNAME = process.env.BUNNY_STORAGE_HOSTNAME || "storage.bunnycdn.com";

const isSimulatedMode =
  !BUNNY_ACCOUNT_API_KEY ||
  BUNNY_ACCOUNT_API_KEY.startsWith("your_") ||
  !BUNNY_PULL_ZONE_ID ||
  BUNNY_PULL_ZONE_ID.startsWith("your_");

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
};

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

// Initialize Firebase if configured
let db = null;
let auth = null;
let hasDbAccess = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.databaseURL) {
    const app = initializeApp(firebaseConfig, "bunny-agent");
    db = getDatabase(app);
    auth = getAuth(app);

    const email = process.env.AGENT_FIREBASE_EMAIL;
    const pass = process.env.AGENT_FIREBASE_PASSWORD;
    if (email && pass) {
      signInWithEmailAndPassword(auth, email, pass)
        .then(() => {
          console.log(`[Agent] Authenticated with Firebase Auth as ${email}`);
          hasDbAccess = true;
          startDbJobListeners();
        })
        .catch((e) => {
          console.warn(`[Agent] Firebase Auth login failed: ${e.message}`);
          startDbJobListeners();
        });
    } else {
      startDbJobListeners();
    }
  }
} catch (e) {
  console.warn("[Agent] Firebase init notice:", e.message);
}

// In-memory store for active deployments & jobs
const deployments = new Map();
let isDeploying = false;

function getAgentStatusPayload() {
  return {
    online: true,
    lastHeartbeat: Date.now(),
    version: "1.0.0",
    isSimulated: isSimulatedMode,
    capabilities: {
      customDomain: Boolean(BUNNY_ACCOUNT_API_KEY && BUNNY_PULL_ZONE_ID),
      storageDeploy: Boolean(BUNNY_STORAGE_ZONE_NAME && BUNNY_STORAGE_ZONE_PASSWORD),
    },
    configSummary: {
      pullZoneId: BUNNY_PULL_ZONE_ID ? String(BUNNY_PULL_ZONE_ID) : null,
      cdnHostname: BUNNY_CDN_HOSTNAME,
      storageZone: BUNNY_STORAGE_ZONE_NAME || null,
    },
  };
}

// Heartbeat to Realtime Database if authenticated
async function updateHeartbeat(online = true) {
  if (!db || !hasDbAccess) return;
  try {
    const statusRef = ref(db, "agentStatus");
    const payload = getAgentStatusPayload();
    payload.online = online;
    await set(statusRef, payload);
  } catch (err) {
    // Non-fatal if unauthenticated
  }
}

updateHeartbeat(true);
const heartbeatInterval = setInterval(() => updateHeartbeat(true), 12000);

// Helper: Append log to deployment job (in memory + RTDB)
async function appendJobLog(jobId, message, level = "info") {
  const timestamp = Date.now();
  console.log(`[Job ${jobId.slice(-6)}] ${message}`);

  const job = deployments.get(jobId);
  if (job) {
    job.logs.push({ timestamp, message, level });
    if (job.logs.length > 200) job.logs = job.logs.slice(-200);
    job.updatedAt = timestamp;
  }

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
    } catch (e) {}
  }
}

// Helper: Update deployment job state
async function updateJobState(jobId, updates) {
  const job = deployments.get(jobId);
  if (job) {
    Object.assign(job, updates, { updatedAt: Date.now() });
  }

  if (db && hasDbAccess) {
    try {
      const jobRef = ref(db, `deploymentJobs/${jobId}`);
      await update(jobRef, {
        ...updates,
        updatedAt: Date.now(),
      });
    } catch (e) {}
  }
}

// Recursively get all files from directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

// Execute complete build, upload, cache purge, and verification
async function executeDeployment(jobId, storeId = "store_skipli", options = {}) {
  if (isDeploying) throw new Error("Another deployment is already in progress.");
  isDeploying = true;
  const startTime = Date.now();

  const initialJob = {
    id: jobId,
    storeId,
    status: "VALIDATING",
    phase: "VALIDATING",
    progress: 5,
    logs: [{ timestamp: startTime, message: "Deployment started by agent.", level: "info" }],
    createdAt: startTime,
    updatedAt: startTime,
    completedAt: null,
    cdnUrl: null,
  };
  deployments.set(jobId, initialJob);

  console.log(`\n======================================================`);
  console.log(`🚀 STARTING DEPLOYMENT: ${jobId}`);
  console.log(`======================================================`);

  try {
    // 1. VALIDATING
    await updateJobState(jobId, { status: "VALIDATING", phase: "VALIDATING", progress: 5 });
    await appendJobLog(jobId, "Phase 1: Validating project workspace and credentials...");

    const distDir = path.join(rootDir, "dist");
    const packageJsonPath = path.join(rootDir, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`Project package.json not found at ${packageJsonPath}`);
    }

    if (!isSimulatedMode && (!BUNNY_STORAGE_ZONE_NAME || !BUNNY_STORAGE_ZONE_PASSWORD)) {
      throw new Error("Bunny Storage Zone credentials (BUNNY_STORAGE_ZONE_NAME / BUNNY_STORAGE_ZONE_PASSWORD) are not set.");
    }
    await appendJobLog(jobId, "Workspace and credentials validated.");

    // 2. BUILDING
    await updateJobState(jobId, { status: "BUILDING", phase: "BUILDING", progress: 20 });
    await appendJobLog(jobId, "Phase 2: Executing build command: npm run build...");

    await new Promise((resolve, reject) => {
      const buildProc = spawn("npm", ["run", "build"], {
        cwd: rootDir,
        shell: true,
      });

      buildProc.stdout.on("data", (data) => {
        const text = data.toString();
        const lines = text.split("\n").filter((l) => l.trim().length > 0);
        lines.forEach((line) => {
          if (line.includes("dist/") || line.includes("built in") || line.includes("vite")) {
            appendJobLog(jobId, line);
          }
        });
      });

      buildProc.stderr.on("data", (data) => {
        const text = data.toString();
        console.error(`[build stderr] ${text.trim()}`);
      });

      buildProc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Build command exited with error code ${code}`));
      });
    });

    const indexHtmlPath = path.join(distDir, "index.html");
    if (!fs.existsSync(indexHtmlPath)) {
      throw new Error("Build succeeded but dist/index.html was not generated.");
    }
    await appendJobLog(jobId, "Build succeeded. Output bundle verified.");

    // 3. UPLOADING
    await updateJobState(jobId, { status: "UPLOADING", phase: "UPLOADING", progress: 40 });
    await appendJobLog(jobId, "Phase 3: Uploading static files via Bunny Storage API...");

    const allFiles = getAllFiles(distDir);
    const totalFiles = allFiles.length;
    await appendJobLog(jobId, `Found ${totalFiles} static assets to deploy.`);

    let uploadedCount = 0;
    for (const filePath of allFiles) {
      const relativePath = path.relative(distDir, filePath).replace(/\\/g, "/");
      const fileBuffer = fs.readFileSync(filePath);

      if (!isSimulatedMode) {
        await uploadStorageFile({
          storageZoneName: BUNNY_STORAGE_ZONE_NAME,
          storagePassword: BUNNY_STORAGE_ZONE_PASSWORD,
          storageHostname: BUNNY_STORAGE_HOSTNAME,
          remotePath: relativePath,
          buffer: fileBuffer,
        });
      }

      uploadedCount++;
      const currentProgress = 40 + Math.round((uploadedCount / totalFiles) * 40); // 40% -> 80%
      if (uploadedCount % 5 === 0 || uploadedCount === totalFiles) {
        await updateJobState(jobId, { progress: currentProgress });
        await appendJobLog(jobId, `Uploaded ${uploadedCount}/${totalFiles} files (${relativePath})...`);
      }
    }
    await appendJobLog(jobId, "All static files uploaded successfully to Bunny Storage.");

    // 4. PURGING CACHE
    if (options.purgeCache !== false && BUNNY_PULL_ZONE_ID) {
      await updateJobState(jobId, { status: "PURGING_CACHE", phase: "PURGING_CACHE", progress: 85 });
      await appendJobLog(jobId, `Phase 4: Purging CDN cache for Pull Zone ID ${BUNNY_PULL_ZONE_ID}...`);

      if (!isSimulatedMode) {
        await purgePullZoneCache({
          pullZoneId: BUNNY_PULL_ZONE_ID,
          accountApiKey: BUNNY_ACCOUNT_API_KEY,
        });
      }
      await appendJobLog(jobId, "Pull Zone cache invalidated successfully.");
    }

    // 5. VERIFYING
    await updateJobState(jobId, { status: "VERIFYING", phase: "VERIFYING", progress: 92 });
    const targetCdnUrl = `https://${BUNNY_CDN_HOSTNAME}`;
    await appendJobLog(jobId, `Phase 5: Verifying live website at ${targetCdnUrl}...`);

    if (!isSimulatedMode) {
      const verification = await verifyLiveWebsite(targetCdnUrl);
      if (verification.success) {
        await appendJobLog(jobId, `Website responded HTTP ${verification.status} OK (${verification.byteLength} bytes).`);
      } else {
        await appendJobLog(jobId, `Notice: ${verification.error || "Edge cache still propagating."}`, "warning");
      }
    } else {
      await appendJobLog(jobId, `[Simulated] CDN verification passed for ${targetCdnUrl}.`);
    }

    // 6. SUCCEEDED
    const totalSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    await appendJobLog(jobId, `🎉 Deployment completed successfully in ${totalSeconds} seconds!`);

    await updateJobState(jobId, {
      status: "SUCCEEDED",
      phase: "SUCCEEDED",
      progress: 100,
      completedAt: Date.now(),
      cdnUrl: targetCdnUrl,
    });

    if (db && hasDbAccess) {
      try {
        await update(ref(db, `onlineStores/${storeId}/deployment`), {
          lastDeploymentId: jobId,
          status: "SUCCEEDED",
          lastDeployedAt: Date.now(),
          cdnUrl: targetCdnUrl,
        });
      } catch (e) {}
    }

    console.log(`======================================================`);
    console.log(`✅ DEPLOYMENT ${jobId} FINISHED SUCCESSFULLY`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error(`[Deployment] Error in job ${jobId}:`, err);
    await appendJobLog(jobId, `Deployment failed: ${err.message}`, "error");

    await updateJobState(jobId, {
      status: "FAILED",
      phase: "FAILED",
      completedAt: Date.now(),
      error: err.message,
    });

    if (db && hasDbAccess) {
      try {
        await update(ref(db, `onlineStores/${storeId}/deployment`), {
          lastDeploymentId: jobId,
          status: "FAILED",
          lastDeployedAt: Date.now(),
          error: err.message,
        });
      } catch (e) {}
    }
  } finally {
    isDeploying = false;
  }
}

// ------------------------------------------------------------------
// LOCAL HTTP API SERVER (Direct loopback for browser dashboard)
// ------------------------------------------------------------------
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${AGENT_PORT}`);
  const pathname = url.pathname;

  try {
    // GET /status
    if (req.method === "GET" && pathname === "/status") {
      return sendJson(res, 200, getAgentStatusPayload());
    }

    // POST /domain/attach
    if (req.method === "POST" && pathname === "/domain/attach") {
      const body = await parseJsonBody(req);
      const hostname = body.hostname;
      if (!hostname) return sendJson(res, 400, { error: "Missing hostname" });

      if (!isSimulatedMode) {
        await addCustomHostname({
          pullZoneId: BUNNY_PULL_ZONE_ID,
          hostname,
          accountApiKey: BUNNY_ACCOUNT_API_KEY,
        });
      }
      const dnsCheck = await verifyDns({ hostname, expectedCname: BUNNY_CDN_HOSTNAME });
      const status = dnsCheck.matchesTarget ? "PENDING_SSL" : "PENDING_DNS";
      return sendJson(res, 200, {
        success: true,
        domainConfig: {
          hostname,
          status,
          targetCname: BUNNY_CDN_HOSTNAME,
          sslActive: false,
          updatedAt: Date.now(),
          error: dnsCheck.matchesTarget ? null : `CNAME must point to ${BUNNY_CDN_HOSTNAME}`,
        },
      });
    }

    // POST /domain/verify
    if (req.method === "POST" && pathname === "/domain/verify") {
      const body = await parseJsonBody(req);
      const hostname = body.hostname;
      if (!hostname) return sendJson(res, 400, { error: "Missing hostname" });

      const dnsCheck = await verifyDns({ hostname, expectedCname: BUNNY_CDN_HOSTNAME });
      if (!dnsCheck.matchesTarget && !isSimulatedMode) {
        return sendJson(res, 200, {
          success: false,
          status: "PENDING_DNS",
          error: `DNS does not point to ${BUNNY_CDN_HOSTNAME}`,
        });
      }

      let sslResult = { success: true };
      if (!isSimulatedMode) {
        sslResult = await loadFreeCertificate({
          hostname,
          accountApiKey: BUNNY_ACCOUNT_API_KEY,
          pullZoneId: BUNNY_PULL_ZONE_ID,
        });
      }
      const isReady = sslResult.success;
      return sendJson(res, 200, {
        success: isReady,
        status: isReady ? "ACTIVE" : "PENDING_SSL",
        sslActive: isReady,
        error: isReady ? null : sslResult.error || "SSL provisioning in progress",
      });
    }

    // POST /domain/remove
    if (req.method === "POST" && pathname === "/domain/remove") {
      const body = await parseJsonBody(req);
      const hostname = body.hostname;
      if (!hostname) return sendJson(res, 400, { error: "Missing hostname" });

      if (!isSimulatedMode) {
        await removeCustomHostname({
          pullZoneId: BUNNY_PULL_ZONE_ID,
          hostname,
          accountApiKey: BUNNY_ACCOUNT_API_KEY,
        });
      }
      return sendJson(res, 200, { success: true });
    }

    // POST /deploy
    if (req.method === "POST" && pathname === "/deploy") {
      const body = await parseJsonBody(req);
      const jobId = `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      // Run deployment asynchronously
      executeDeployment(jobId, body.storeId || "store_skipli", body.options || {}).catch((e) =>
        console.error("Deploy async execution error:", e)
      );

      return sendJson(res, 200, {
        success: true,
        jobId,
        job: deployments.get(jobId),
      });
    }

    // GET /deploy/:id
    if (req.method === "GET" && pathname.startsWith("/deploy/")) {
      const jobId = pathname.replace("/deploy/", "").trim();
      const job = deployments.get(jobId);
      if (!job) return sendJson(res, 404, { error: "Job not found" });
      return sendJson(res, 200, job);
    }

    return sendJson(res, 404, { error: "Not found" });
  } catch (err) {
    console.error("[Agent HTTP Error]", err);
    return sendJson(res, 500, { error: err.message });
  }
});

server.listen(AGENT_PORT, "127.0.0.1", () => {
  console.log(`[Agent] Local HTTP loopback API listening at http://127.0.0.1:${AGENT_PORT}`);
});

// Database job listeners
function startDbJobListeners() {
  if (!db) return;
  try {
    const domainJobsRef = ref(db, "domainJobs");
    onValue(domainJobsRef, (snap) => {
      if (!snap.exists()) return;
      const jobs = snap.val();
      Object.keys(jobs).forEach((key) => {
        const job = jobs[key];
        if (job && job.status === "QUEUED") {
          // Process job
          handleDbDomainJob(job);
        }
      });
    });
  } catch (e) {}

  try {
    const depJobsRef = ref(db, "deploymentJobs");
    onValue(depJobsRef, (snap) => {
      if (!snap.exists()) return;
      const jobs = snap.val();
      Object.keys(jobs).forEach((key) => {
        const job = jobs[key];
        if (job && job.status === "QUEUED" && !isDeploying) {
          executeDeployment(job.id, job.storeId, job.options || {}).catch(console.error);
        }
      });
    });
  } catch (e) {}
}

async function handleDbDomainJob(job) {
  if (!db || !job?.id) return;
  const jobRef = ref(db, `domainJobs/${job.id}`);
  try {
    await update(jobRef, { status: "PROCESSING", updatedAt: Date.now() });
    const hostname = job.hostname;
    const storeId = job.storeId || "store_skipli";
    const domainKey = hostname.replace(/\./g, ",");

    if (job.type === "ATTACH_DOMAIN") {
      if (!isSimulatedMode) {
        await addCustomHostname({
          pullZoneId: BUNNY_PULL_ZONE_ID,
          hostname,
          accountApiKey: BUNNY_ACCOUNT_API_KEY,
        });
      }
      const dnsCheck = await verifyDns({ hostname, expectedCname: BUNNY_CDN_HOSTNAME });
      const status = dnsCheck.matchesTarget ? "PENDING_SSL" : "PENDING_DNS";
      await update(ref(db), {
        [`onlineStores/${storeId}/customDomain`]: {
          hostname,
          status,
          targetCname: BUNNY_CDN_HOSTNAME,
          sslActive: false,
          updatedAt: Date.now(),
        },
        [`storeDomains/${domainKey}`]: {
          storeId,
          hostname,
          status,
          updatedAt: Date.now(),
        },
        [`domainJobs/${job.id}/status`]: "SUCCEEDED",
      });
    } else if (job.type === "VERIFY_DNS_SSL") {
      const dnsCheck = await verifyDns({ hostname, expectedCname: BUNNY_CDN_HOSTNAME });
      if (dnsCheck.matchesTarget || isSimulatedMode) {
        let sslResult = { success: true };
        if (!isSimulatedMode) {
          sslResult = await loadFreeCertificate({
            hostname,
            accountApiKey: BUNNY_ACCOUNT_API_KEY,
            pullZoneId: BUNNY_PULL_ZONE_ID,
          });
        }
        const isReady = sslResult.success;
        const newStatus = isReady ? "ACTIVE" : "PENDING_SSL";
        await update(ref(db), {
          [`onlineStores/${storeId}/customDomain/status`]: newStatus,
          [`onlineStores/${storeId}/customDomain/sslActive`]: isReady,
          [`storeDomains/${domainKey}/status`]: newStatus,
          [`domainJobs/${job.id}/status`]: isReady ? "SUCCEEDED" : "PENDING",
        });
      } else {
        await update(ref(db), {
          [`domainJobs/${job.id}/status`]: "FAILED",
          [`domainJobs/${job.id}/error`]: "DNS does not point to target",
        });
      }
    } else if (job.type === "REMOVE_DOMAIN") {
      if (!isSimulatedMode) {
        await removeCustomHostname({
          pullZoneId: BUNNY_PULL_ZONE_ID,
          hostname,
          accountApiKey: BUNNY_ACCOUNT_API_KEY,
        });
      }
      await update(ref(db), {
        [`onlineStores/${storeId}/customDomain`]: null,
        [`storeDomains/${domainKey}`]: null,
        [`domainJobs/${job.id}/status`]: "SUCCEEDED",
      });
    }
  } catch (e) {
    await update(jobRef, { status: "FAILED", error: e.message, updatedAt: Date.now() });
  }
}

// Graceful shutdown
function handleShutdown() {
  console.log("\n[Agent] Shutting down agent gracefully...");
  clearInterval(heartbeatInterval);
  server.close(() => {
    updateHeartbeat(false).finally(() => {
      process.exit(0);
    });
  });
}
process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
