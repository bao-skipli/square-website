import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import AdmZip from "adm-zip";
import { ref, update } from "firebase/database";
import {
  rootDir,
  isSimulatedMode,
  BUNNY_ACCOUNT_API_KEY,
  BUNNY_PULL_ZONE_ID,
  BUNNY_CDN_HOSTNAME,
  BUNNY_STORAGE_ZONE_NAME,
  BUNNY_STORAGE_ZONE_PASSWORD,
  BUNNY_STORAGE_HOSTNAME,
} from "../config.js";
import {
  getIsDeploying,
  setIsDeploying,
  setJob,
  appendJobLog,
  updateJobState,
} from "./jobStore.js";
import { getDb, getHasDbAccess } from "./firebaseClient.js";
import {
  uploadStorageFile,
  cleanStaleStorageFiles,
} from "../clients/bunnyStorage.js";
import { purgePullZoneCache } from "../clients/bunnyManagement.js";
import { verifyLiveWebsite } from "../clients/dnsVerifier.js";

export function getAllFiles(dirPath, arrayOfFiles = []) {
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

export async function executeDeployment(jobId, storeId = "store_skipli", options = {}) {
  if (getIsDeploying()) throw new Error("Another deployment is already in progress.");

  setIsDeploying(true);
  const startTime = Date.now();
  const isLandingMode =
    options.mode === "LANDING_PAGE" ||
    String(options.mode || "").toUpperCase() === "LANDING_PAGE" ||
    Boolean(options.landingFile);

  const initialJob = {
    id: jobId,
    storeId,
    mode: isLandingMode ? "LANDING_PAGE" : "STOREFRONT",
    status: isLandingMode ? "PREPARING" : "VALIDATING",
    phase: isLandingMode ? "PREPARING" : "VALIDATING",
    progress: 5,
    logs: [
      {
        timestamp: startTime,
        message: isLandingMode
          ? "Landing page deployment started by agent."
          : "Storefront deployment started by agent.",
        level: "info",
      },
    ],
    createdAt: startTime,
    updatedAt: startTime,
    completedAt: null,
    cdnUrl: null,
    landingFile: options.landingFile
      ? { name: options.landingFile.name, size: options.landingFile.size }
      : null,
  };
  setJob(jobId, initialJob);

  console.log(`\n======================================================`);
  console.log(`🚀 STARTING DEPLOYMENT [${isLandingMode ? "LANDING_PAGE" : "STOREFRONT"}]: ${jobId}`);
  console.log(`======================================================`);

  try {
    let deploySourceDir = "";

    if (isLandingMode) {
      await updateJobState(jobId, { status: "PREPARING", phase: "PREPARING", progress: 10 });
      await appendJobLog(jobId, "Phase 1: Validating uploaded landing package and credentials...");

      if (!isSimulatedMode && (!BUNNY_STORAGE_ZONE_NAME || !BUNNY_STORAGE_ZONE_PASSWORD)) {
        throw new Error(
          "Bunny Storage Zone credentials (BUNNY_STORAGE_ZONE_NAME / BUNNY_STORAGE_ZONE_PASSWORD) are not set."
        );
      }

      const stagingDir = path.join(rootDir, "scratch", "landing-deploy");
      if (fs.existsSync(stagingDir)) {
        fs.rmSync(stagingDir, { recursive: true, force: true });
      }
      fs.mkdirSync(stagingDir, { recursive: true });

      const landingFile = options.landingFile;
      if (!landingFile || !landingFile.contentBase64) {
        throw new Error("No landing page file content received.");
      }

      await appendJobLog(
        jobId,
        `Processing file: ${landingFile.name} (${Math.round((landingFile.size || 0) / 1024)} KB)...`
      );
      const fileBuffer = Buffer.from(landingFile.contentBase64, "base64");
      const isZip = Boolean(
        landingFile.isZip || (landingFile.name && landingFile.name.toLowerCase().endsWith(".zip"))
      );

      if (isZip) {
        await appendJobLog(jobId, "Extracting ZIP archive assets with AdmZip...");
        const zip = new AdmZip(fileBuffer);
        zip.extractAllTo(stagingDir, true);

        // Check if index.html is directly in stagingDir
        const directIndex = path.join(stagingDir, "index.html");
        if (!fs.existsSync(directIndex)) {
          // If zip contained a single wrapping folder, move files up to staging root
          const entries = fs.readdirSync(stagingDir);
          const subdirs = entries.filter((e) => {
            const p = path.join(stagingDir, e);
            return fs.existsSync(p) && fs.statSync(p).isDirectory();
          });
          if (subdirs.length === 1 && fs.existsSync(path.join(stagingDir, subdirs[0], "index.html"))) {
            const innerDir = path.join(stagingDir, subdirs[0]);
            const innerItems = fs.readdirSync(innerDir);
            for (const item of innerItems) {
              fs.renameSync(path.join(innerDir, item), path.join(stagingDir, item));
            }
            fs.rmdirSync(innerDir);
          }
        }
      } else {
        // Single HTML file: save as index.html
        fs.writeFileSync(path.join(stagingDir, "index.html"), fileBuffer);
      }

      if (!fs.existsSync(path.join(stagingDir, "index.html"))) {
        throw new Error(
          "Landing package must contain an 'index.html' file at the root level."
        );
      }

      deploySourceDir = stagingDir;
      await appendJobLog(jobId, "Landing page assets unpacked and verified.");
    } else {
      // 1. VALIDATING STOREFRONT
      await updateJobState(jobId, { status: "VALIDATING", phase: "VALIDATING", progress: 5 });
      await appendJobLog(jobId, "Phase 1: Validating project workspace and credentials...");

      const distDir = path.join(rootDir, "dist");
      const packageJsonPath = path.join(rootDir, "package.json");
      if (!fs.existsSync(packageJsonPath)) {
        throw new Error(`Project package.json not found at ${packageJsonPath}`);
      }

      if (!isSimulatedMode && (!BUNNY_STORAGE_ZONE_NAME || !BUNNY_STORAGE_ZONE_PASSWORD)) {
        throw new Error(
          "Bunny Storage Zone credentials (BUNNY_STORAGE_ZONE_NAME / BUNNY_STORAGE_ZONE_PASSWORD) are not set."
        );
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
      deploySourceDir = distDir;
    }

    // 3. UPLOADING
    await updateJobState(jobId, { status: "UPLOADING", phase: "UPLOADING", progress: 40 });
    await appendJobLog(jobId, "Phase 3: Uploading static files via Bunny Storage API...");

    const allFiles = getAllFiles(deploySourceDir);
    const totalFiles = allFiles.length;
    await appendJobLog(jobId, `Found ${totalFiles} static assets to deploy.`);

    let uploadedCount = 0;
    for (const filePath of allFiles) {
      const relativePath = path.relative(deploySourceDir, filePath).replace(/\\/g, "/");
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

    // 3.5 SMART SYNC & AUTO-CLEAN OBSOLETE ASSETS
    await updateJobState(jobId, { status: "CLEANING", phase: "CLEANING", progress: 83 });
    await appendJobLog(jobId, "Phase 3.5: Scanning and cleaning obsolete assets on Bunny Storage...");

    const activeRelativePaths = allFiles.map((f) =>
      path.relative(deploySourceDir, f).replace(/\\/g, "/")
    );

    if (!isSimulatedMode) {
      try {
        const cleanResult = await cleanStaleStorageFiles({
          storageZoneName: BUNNY_STORAGE_ZONE_NAME,
          storagePassword: BUNNY_STORAGE_ZONE_PASSWORD,
          storageHostname: BUNNY_STORAGE_HOSTNAME,
          activeFilesList: activeRelativePaths,
          onLog: (msg, level) => appendJobLog(jobId, msg, level),
        });
        await appendJobLog(
          jobId,
          cleanResult.deletedCount > 0
            ? `Cleaned ${cleanResult.deletedCount} obsolete files/folders from Bunny Storage.`
            : "No obsolete files found. Storage is clean and synchronized."
        );
      } catch (cleanErr) {
        await appendJobLog(jobId, `Auto-clean notice: ${cleanErr.message}`, "warning");
      }
    } else {
      await appendJobLog(jobId, "[Simulated] Storage auto-clean verified (0 obsolete files).");
    }

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

    const db = getDb();
    const hasDbAccess = getHasDbAccess();
    if (db && hasDbAccess) {
      try {
        await update(ref(db, `onlineStores/${storeId}/deployment`), {
          lastDeploymentId: jobId,
          status: "SUCCEEDED",
          mode: isLandingMode ? "LANDING_PAGE" : "STOREFRONT",
          lastDeployedAt: Date.now(),
          cdnUrl: targetCdnUrl,
          landingFile:
            isLandingMode && options.landingFile
              ? {
                name: options.landingFile.name || "index.html",
                size: options.landingFile.size || 0,
                uploadedAt: Date.now(),
              }
              : null,
        });
      } catch (e) {
        console.warn(`[Deployment] Failed to update store deployment status (SUCCEEDED) in RTDB: ${e.message}`);
      }
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

    const db = getDb();
    const hasDbAccess = getHasDbAccess();
    if (db && hasDbAccess) {
      try {
        await update(ref(db, `onlineStores/${storeId}/deployment`), {
          lastDeploymentId: jobId,
          status: "FAILED",
          lastDeployedAt: Date.now(),
          error: err.message,
        });
      } catch (e) {
        console.warn(`[Deployment] Failed to update store deployment status (FAILED) in RTDB: ${e.message}`);
      }
    }
  } finally {
    setIsDeploying(false);
  }
}
