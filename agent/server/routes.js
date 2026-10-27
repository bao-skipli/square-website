import { sendJson, parseJsonBody } from "./utils.js";
import { getAgentStatusPayload, getJob } from "../services/jobStore.js";
import {
  attachDomain,
  verifyDomain,
  removeDomain,
  getZoneRecordsService,
  scanDomainRecordsService,
  autoMigrateDnsRecordsService,
  importSelectedRecordsService,
  createRecordService,
  deleteRecordService,
  batchDeleteRecordsService,
  parseBulkRecordsService,
} from "../services/domainService.js";
import { executeDeployment } from "../services/deploymentService.js";

export async function handleAgentRoutes(req, res, pathname) {
  const parsedUrl = new URL(req.url, "http://localhost");

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

  // ==========================================
  // DNS ZONE & RECORDS ROUTES
  // ==========================================

  // GET /domain/dns/records?zoneId=12345
  if (req.method === "GET" && pathname === "/domain/dns/records") {
    const zoneId = parsedUrl.searchParams.get("zoneId");
    if (!zoneId) return sendJson(res, 400, { error: "Missing zoneId query parameter" });

    const result = await getZoneRecordsService({ zoneId });
    return sendJson(res, 200, result);
  }

  // POST /domain/dns/scan
  if (req.method === "POST" && pathname === "/domain/dns/scan") {
    const body = await parseJsonBody(req);
    const { zoneId, domain, customNs, storeId, autoImport } = body;
    if (!zoneId && !domain) {
      return sendJson(res, 400, { error: "Missing zoneId or domain" });
    }

    const result = await scanDomainRecordsService({ zoneId, domain, customNs, storeId, autoImport });
    return sendJson(res, 200, result);
  }

  // POST /domain/dns/auto-migrate
  if (req.method === "POST" && pathname === "/domain/dns/auto-migrate") {
    const body = await parseJsonBody(req);
    const { zoneId, domain, customNs, storeId } = body;
    if (!zoneId && !domain) {
      return sendJson(res, 400, { error: "Missing zoneId or domain" });
    }

    const result = await autoMigrateDnsRecordsService({ zoneId, domain, customNs, storeId });
    return sendJson(res, 200, result);
  }

  // POST /domain/dns/parse-bulk
  if (req.method === "POST" && pathname === "/domain/dns/parse-bulk") {
    const body = await parseJsonBody(req);
    const { rawText, domain } = body;
    const result = await parseBulkRecordsService({ rawText, domain });
    return sendJson(res, 200, result);
  }

  // POST /domain/dns/import
  if (req.method === "POST" && pathname === "/domain/dns/import") {
    const body = await parseJsonBody(req);
    const { zoneId, records, storeId } = body;
    if (!zoneId) return sendJson(res, 400, { error: "Missing zoneId" });

    const result = await importSelectedRecordsService({ zoneId, records, storeId });
    return sendJson(res, 200, result);
  }

  // POST /domain/dns/record (Create single record)
  if (req.method === "POST" && pathname === "/domain/dns/record") {
    const body = await parseJsonBody(req);
    const { zoneId, record } = body;
    if (!zoneId || !record) return sendJson(res, 400, { error: "Missing zoneId or record" });

    const result = await createRecordService({ zoneId, record });
    return sendJson(res, 200, result);
  }

  // DELETE /domain/dns/record (or DELETE /domain/dns/record/:id)
  if (req.method === "DELETE" && pathname.startsWith("/domain/dns/record")) {
    let recordId = pathname.replace("/domain/dns/record/", "").trim();
    if (recordId === "/domain/dns/record" || recordId === "") {
      recordId = null;
    }
    const zoneIdFromQuery = parsedUrl.searchParams.get("zoneId");
    const recordIdFromQuery = parsedUrl.searchParams.get("recordId");

    let body = {};
    try {
      body = await parseJsonBody(req);
    } catch (e) {}

    const targetZoneId = body.zoneId || zoneIdFromQuery;
    const targetRecordId = recordId || body.recordId || recordIdFromQuery;

    if (!targetZoneId || !targetRecordId) {
      return sendJson(res, 400, { error: "Missing zoneId or recordId" });
    }

    const result = await deleteRecordService({
      zoneId: targetZoneId,
      recordId: targetRecordId,
    });
    return sendJson(res, 200, result);
  }

  // POST /domain/dns/records/batch-delete
  if (req.method === "POST" && pathname === "/domain/dns/records/batch-delete") {
    const body = await parseJsonBody(req);
    const { zoneId, recordIds } = body;
    if (!zoneId || !Array.isArray(recordIds) || recordIds.length === 0) {
      return sendJson(res, 400, { error: "Missing zoneId or recordIds array" });
    }
    const result = await batchDeleteRecordsService({ zoneId, recordIds });
    return sendJson(res, 200, result);
  }

  // ==========================================
  // DEPLOYMENT ROUTES
  // ==========================================

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
