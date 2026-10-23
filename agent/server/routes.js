import { sendJson, parseJsonBody } from "./utils.js";
import { getAgentStatusPayload, getJob } from "../services/jobStore.js";
import {
  attachDomain,
  verifyDomain,
  removeDomain,
} from "../services/domainService.js";
import { executeDeployment } from "../services/deploymentService.js";

export async function handleAgentRoutes(req, res, pathname) {
  // GET /status
  if (req.method === "GET" && pathname === "/status") {
    return sendJson(res, 200, getAgentStatusPayload());
  }

  // POST /domain/attach
  if (req.method === "POST" && pathname === "/domain/attach") {
    const body = await parseJsonBody(req);
    const hostname = body.hostname;
    if (!hostname) return sendJson(res, 400, { error: "Missing hostname" });

    const result = await attachDomain({
      hostname,
      storeId: body.storeId || "store_skipli",
    });
    return sendJson(res, 200, result);
  }

  // POST /domain/verify
  if (req.method === "POST" && pathname === "/domain/verify") {
    const body = await parseJsonBody(req);
    const hostname = body.hostname;
    if (!hostname) return sendJson(res, 400, { error: "Missing hostname" });

    const result = await verifyDomain({
      hostname,
      storeId: body.storeId || "store_skipli",
    });
    return sendJson(res, 200, result);
  }

  // POST /domain/remove
  if (req.method === "POST" && pathname === "/domain/remove") {
    const body = await parseJsonBody(req);
    const hostname = body.hostname;
    if (!hostname) return sendJson(res, 400, { error: "Missing hostname" });

    const result = await removeDomain({
      hostname,
      storeId: body.storeId || "store_skipli",
    });
    return sendJson(res, 200, result);
  }

  // POST /deploy
  if (req.method === "POST" && pathname === "/deploy") {
    const body = await parseJsonBody(req);
    const jobId = `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    // Run deployment asynchronously
    executeDeployment(jobId, body.storeId || "store_skipli", body.options || {}).catch((e) =>
      console.error("[Deploy] Async execution error:", e)
    );

    return sendJson(res, 200, {
      success: true,
      jobId,
      job: getJob(jobId),
    });
  }

  // GET /deploy/:id
  if (req.method === "GET" && pathname.startsWith("/deploy/")) {
    const jobId = pathname.replace("/deploy/", "").trim();
    const job = getJob(jobId);
    if (!job) return sendJson(res, 404, { error: "Job not found" });
    return sendJson(res, 200, job);
  }

  return sendJson(res, 404, { error: "Not found" });
}
