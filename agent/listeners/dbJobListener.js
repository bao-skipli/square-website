import { ref, onValue, update } from "firebase/database";
import { getDb } from "../services/firebaseClient.js";
import { getIsDeploying } from "../services/jobStore.js";
import {
  attachDomain,
  verifyDomain,
  removeDomain,
} from "../services/domainService.js";
import { executeDeployment } from "../services/deploymentService.js";

export function startDbJobListeners() {
  const db = getDb();
  if (!db) return;

  try {
    const domainJobsRef = ref(db, "domainJobs");
    onValue(domainJobsRef, (snap) => {
      if (!snap.exists()) return;
      const jobs = snap.val();
      Object.keys(jobs).forEach((key) => {
        const job = jobs[key];
        if (job && job.status === "QUEUED") {
          handleDbDomainJob(job);
        }
      });
    });
  } catch (e) {
    console.warn("[Agent] Failed to attach domainJobs listener:", e.message);
  }

  try {
    const depJobsRef = ref(db, "deploymentJobs");
    onValue(depJobsRef, (snap) => {
      if (!snap.exists()) return;
      const jobs = snap.val();
      Object.keys(jobs).forEach((key) => {
        const job = jobs[key];
        if (job && job.status === "QUEUED" && !getIsDeploying()) {
          const deployOpts = {
            ...(job.options || {}),
            mode: job.mode || job.options?.mode || (job.landingFile ? "LANDING_PAGE" : "STOREFRONT"),
            landingFile: job.landingFile || job.options?.landingFile,
          };
          executeDeployment(job.id, job.storeId, deployOpts).catch(console.error);
        }
      });
    });
  } catch (e) {
    console.warn("[Agent] Failed to attach deploymentJobs listener:", e.message);
  }
}

export async function handleDbDomainJob(job) {
  const db = getDb();
  if (!db || !job?.id) return;
  const jobRef = ref(db, `domainJobs/${job.id}`);

  try {
    await update(jobRef, { status: "PROCESSING", updatedAt: Date.now() });
    const hostname = job.hostname;
    const storeId = job.storeId || "store_skipli";

    if (job.type === "ATTACH_DOMAIN") {
      await attachDomain({ hostname, storeId });
      await update(ref(db), {
        [`domainJobs/${job.id}/status`]: "SUCCEEDED",
        [`domainJobs/${job.id}/updatedAt`]: Date.now(),
      });
    } else if (job.type === "VERIFY_DNS_SSL") {
      const verifyResult = await verifyDomain({ hostname, storeId });
      if (verifyResult.success) {
        await update(ref(db), {
          [`domainJobs/${job.id}/status`]: "SUCCEEDED",
          [`domainJobs/${job.id}/updatedAt`]: Date.now(),
        });
      } else if (verifyResult.status === "PENDING_SSL") {
        await update(ref(db), {
          [`domainJobs/${job.id}/status`]: "PENDING",
          [`domainJobs/${job.id}/updatedAt`]: Date.now(),
        });
      } else {
        await update(ref(db), {
          [`domainJobs/${job.id}/status`]: "FAILED",
          [`domainJobs/${job.id}/error`]: verifyResult.error || "DNS verification failed",
          [`domainJobs/${job.id}/updatedAt`]: Date.now(),
        });
      }
    } else if (job.type === "REMOVE_DOMAIN") {
      await removeDomain({ hostname, storeId });
      await update(ref(db), {
        [`domainJobs/${job.id}/status`]: "SUCCEEDED",
        [`domainJobs/${job.id}/updatedAt`]: Date.now(),
      });
    }
  } catch (e) {
    await update(jobRef, {
      status: "FAILED",
      error: e.message,
      updatedAt: Date.now(),
    });
  }
}
