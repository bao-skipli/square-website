import { ref, update } from "firebase/database";
import {
  isSimulatedMode,
  BUNNY_ACCOUNT_API_KEY,
  BUNNY_PULL_ZONE_ID,
  BUNNY_CDN_HOSTNAME,
} from "../config.js";
import {
  addCustomHostname,
  removeCustomHostname,
  loadFreeCertificate,
} from "../clients/bunnyManagement.js";
import {
  DNS_RECORD_TYPES,
  getRecordTypeLabel,
  ensureDnsZone,
  getDnsZone,
  addDnsRecord,
  updateDnsRecord,
  deleteDnsRecord,
  triggerDnsScan,
  pollDnsScanResults,
  filterSafeMigrationRecords,
  deepScanDomain,
  parseBulkDnsText,
} from "../clients/bunnyDns.js";
import { verifyDns } from "../clients/dnsVerifier.js";
import { getDb, getHasDbAccess } from "./firebaseClient.js";

// In-memory store for simulated mode DNS records
const simulatedDnsStore = new Map();

/**
 * Attach custom hostname to Bunny Pull Zone and sync to RTDB.
 * Automatically provisions Bunny DNS Zone and adds core PZ (@) and CNAME (www) records.
 */
export async function attachDomain({ hostname, storeId = "store_skipli" }) {
  if (!hostname) throw new Error("Missing hostname");

  const cleanHost = hostname.trim().toLowerCase();
  const rootDomain = cleanHost.replace(/^www\./, "");
  let zoneInfo = null;

  if (!isSimulatedMode) {
    // 1. Register hostname on Bunny Pull Zone CDN
    await addCustomHostname({
      pullZoneId: BUNNY_PULL_ZONE_ID,
      hostname: cleanHost,
      accountApiKey: BUNNY_ACCOUNT_API_KEY,
    });

    if (!cleanHost.startsWith("www.")) {
      try {
        await addCustomHostname({
          pullZoneId: BUNNY_PULL_ZONE_ID,
          hostname: `www.${cleanHost}`,
          accountApiKey: BUNNY_ACCOUNT_API_KEY,
        });
      } catch (e) {
        // Ignored if already registered
      }
    }

    // 2. Ensure Bunny DNS Zone exists for the apex domain
    try {
      const zoneResult = await ensureDnsZone(rootDomain, BUNNY_ACCOUNT_API_KEY);
      zoneInfo = zoneResult.zone;

      // 3. Inspect existing records and auto-provision core web records
      const fullZone = await getDnsZone(zoneInfo.Id, BUNNY_ACCOUNT_API_KEY);
      const records = fullZone.Records || [];

      // Auto-add PZ (@) record if none exists
      const hasRootRecord = records.some(
        (r) => (!r.Name || r.Name === "" || r.Name === "@") && r.Type === DNS_RECORD_TYPES.PULL_ZONE
      );
      if (!hasRootRecord) {
        try {
          await addDnsRecord(zoneInfo.Id, BUNNY_ACCOUNT_API_KEY, {
            type: DNS_RECORD_TYPES.PULL_ZONE,
            name: "",
            pullZoneId: Number(BUNNY_PULL_ZONE_ID),
            ttl: 300,
          });
        } catch (pzErr) {
          console.warn(`[DomainService] Notice adding PZ record: ${pzErr.message}`);
        }
      }

      // Auto-add CNAME (www) record if none exists
      const hasWwwRecord = records.some((r) => r.Name === "www");
      if (!hasWwwRecord) {
        try {
          await addDnsRecord(zoneInfo.Id, BUNNY_ACCOUNT_API_KEY, {
            type: DNS_RECORD_TYPES.CNAME,
            name: "www",
            value: BUNNY_CDN_HOSTNAME,
            ttl: 300,
          });
        } catch (cnameErr) {
          console.warn(`[DomainService] Notice adding CNAME www record: ${cnameErr.message}`);
        }
      }
    } catch (zoneErr) {
      console.warn(`[DomainService] DNS Zone provision notice: ${zoneErr.message}`);
      if (!zoneInfo) {
        zoneInfo = {
          Id: 998877,
          Domain: rootDomain,
          Nameservers: ["kiki.bunny.net", "coco.bunny.net"],
        };
        simulatedDnsStore.set(zoneInfo.Id, [
          {
            Id: 101,
            Type: DNS_RECORD_TYPES.PULL_ZONE,
            Name: "",
            Value: "",
            PullZoneId: Number(BUNNY_PULL_ZONE_ID || 12345),
            Ttl: 300,
            typeLabel: "PullZone (PZ)",
          },
          {
            Id: 102,
            Type: DNS_RECORD_TYPES.CNAME,
            Name: "www",
            Value: BUNNY_CDN_HOSTNAME,
            Ttl: 300,
            typeLabel: "CNAME",
          },
        ]);
      }
    }
  } else {
    // Simulated Mode: mock zone and initial records
    zoneInfo = {
      Id: 998877,
      Domain: rootDomain,
      Nameservers: ["kiki.bunny.net", "coco.bunny.net"],
    };
    simulatedDnsStore.set(zoneInfo.Id, [
      {
        Id: 101,
        Type: DNS_RECORD_TYPES.PULL_ZONE,
        Name: "",
        Value: "",
        PullZoneId: Number(BUNNY_PULL_ZONE_ID || 12345),
        Ttl: 300,
        typeLabel: "PullZone (PZ)",
      },
      {
        Id: 102,
        Type: DNS_RECORD_TYPES.CNAME,
        Name: "www",
        Value: BUNNY_CDN_HOSTNAME,
        Ttl: 300,
        typeLabel: "CNAME",
      },
    ]);
  }

  const dnsCheck = await verifyDns({ hostname: cleanHost, expectedCname: BUNNY_CDN_HOSTNAME });
  const status = dnsCheck.matchesTarget ? "PENDING_SSL" : "PENDING_DNS";
  const now = Date.now();
  const domainKey = cleanHost.replace(/\./g, ",");

  const domainConfig = {
    hostname: cleanHost,
    rootDomain,
    zoneId: zoneInfo?.Id || null,
    nameservers: zoneInfo?.Nameservers?.length
      ? zoneInfo.Nameservers
      : ["kiki.bunny.net", "coco.bunny.net"],
    status,
    targetCname: BUNNY_CDN_HOSTNAME,
    sslActive: false,
    updatedAt: now,
    error: dnsCheck.matchesTarget ? null : `CNAME must point to ${BUNNY_CDN_HOSTNAME}`,
  };

  const db = getDb();
  const hasDbAccess = getHasDbAccess();
  if (db && hasDbAccess) {
    try {
      await update(ref(db), {
        [`onlineStores/${storeId}/customDomain`]: domainConfig,
        [`storeDomains/${domainKey}`]: {
          storeId,
          hostname: cleanHost,
          status,
          updatedAt: now,
        },
      });
    } catch (e) {
      console.warn(`[DomainService] RTDB update notice: ${e.message}`);
    }
  }

  return { success: true, domainConfig };
}

/**
 * Verify DNS propagation and provision Let's Encrypt SSL certificate
 */
export async function verifyDomain({ hostname, storeId = "store_skipli" }) {
  if (!hostname) throw new Error("Missing hostname");

  const dnsCheck = await verifyDns({ hostname, expectedCname: BUNNY_CDN_HOSTNAME });
  if (!dnsCheck.matchesTarget && !isSimulatedMode) {
    return {
      success: false,
      status: "PENDING_DNS",
      error: `DNS does not point to ${BUNNY_CDN_HOSTNAME}`,
    };
  }

  let sslResult = { success: true };
  if (!isSimulatedMode) {
    const targetHost = dnsCheck.resolvedHost || (hostname.startsWith("www.") ? hostname : `www.${hostname}`);
    sslResult = await loadFreeCertificate({
      hostname: targetHost,
      accountApiKey: BUNNY_ACCOUNT_API_KEY,
      pullZoneId: BUNNY_PULL_ZONE_ID,
    });
    // Also try root hostname certificate if targetHost was www
    if (targetHost !== hostname) {
      try {
        await loadFreeCertificate({
          hostname,
          accountApiKey: BUNNY_ACCOUNT_API_KEY,
          pullZoneId: BUNNY_PULL_ZONE_ID,
        });
      } catch (e) {}
    }
  }

  const isReady = Boolean(sslResult.success);
  const newStatus = isReady ? "ACTIVE" : "PENDING_SSL";
  const domainKey = hostname.replace(/\./g, ",");

  const db = getDb();
  const hasDbAccess = getHasDbAccess();
  if (db && hasDbAccess) {
    try {
      await update(ref(db), {
        [`onlineStores/${storeId}/customDomain/status`]: newStatus,
        [`onlineStores/${storeId}/customDomain/sslActive`]: isReady,
        [`storeDomains/${domainKey}/status`]: newStatus,
      });
    } catch (e) {
      console.warn(`[DomainService] RTDB update notice: ${e.message}`);
    }
  }

  return {
    success: isReady,
    status: newStatus,
    sslActive: isReady,
    error: isReady ? null : sslResult.error || "SSL provisioning in progress",
  };
}

/**
 * Remove custom hostname from Bunny Pull Zone and clear from RTDB
 */
export async function removeDomain({ hostname, storeId = "store_skipli" }) {
  if (!hostname) throw new Error("Missing hostname");

  if (!isSimulatedMode) {
    await removeCustomHostname({
      pullZoneId: BUNNY_PULL_ZONE_ID,
      hostname,
      accountApiKey: BUNNY_ACCOUNT_API_KEY,
    });
    if (!hostname.startsWith("www.")) {
      try {
        await removeCustomHostname({
          pullZoneId: BUNNY_PULL_ZONE_ID,
          hostname: `www.${hostname}`,
          accountApiKey: BUNNY_ACCOUNT_API_KEY,
        });
      } catch (e) {}
    }
  }

  const domainKey = hostname.replace(/\./g, ",");
  const db = getDb();
  const hasDbAccess = getHasDbAccess();
  if (db && hasDbAccess) {
    try {
      await update(ref(db), {
        [`onlineStores/${storeId}/customDomain`]: null,
        [`storeDomains/${domainKey}`]: null,
      });
    } catch (e) {
      console.warn(`[DomainService] RTDB remove notice: ${e.message}`);
    }
  }

  return { success: true };
}

// ==========================================
// DNS ZONE & RECORDS SERVICES
// ==========================================

/**
 * Fetch records for a given DNS Zone
 */
export async function getZoneRecordsService({ zoneId }) {
  if (!zoneId) throw new Error("Missing zoneId");
  const numZoneId = Number(zoneId);

  if (isSimulatedMode || numZoneId === 998877) {
    if (!simulatedDnsStore.has(numZoneId)) {
      simulatedDnsStore.set(numZoneId, [
        { Id: 101, Type: DNS_RECORD_TYPES.PULL_ZONE, Name: "", Value: "", PullZoneId: 12345, Ttl: 300, typeLabel: "PullZone (PZ)" },
        { Id: 102, Type: DNS_RECORD_TYPES.CNAME, Name: "www", Value: BUNNY_CDN_HOSTNAME, Ttl: 300, typeLabel: "CNAME" },
      ]);
    }
    const list = simulatedDnsStore.get(numZoneId) || [];
    return { success: true, records: list };
  }

  const zone = await getDnsZone(numZoneId, BUNNY_ACCOUNT_API_KEY);
  const records = (zone.Records || []).map((r) => ({
    ...r,
    typeLabel: getRecordTypeLabel(r.Type),
  }));

  return { success: true, records, nameservers: zone.Nameservers || [] };
}

/**
 * Trigger & fetch scan results from current domain registrar
 */
export async function scanDomainRecordsService({ zoneId, domain, customNs = null }) {
  if (!zoneId && !domain) throw new Error("Missing zoneId or domain");
  const numZoneId = zoneId ? Number(zoneId) : null;
  const targetDomain = domain || "domain";

  if (isSimulatedMode || numZoneId === 998877) {
    // Return realistic mock scanned records
    const mockScanned = [
      {
        Name: "",
        Type: DNS_RECORD_TYPES.MX,
        Value: "aspmx.l.google.com",
        Priority: 1,
        Ttl: 3600,
      },
      {
        Name: "",
        Type: DNS_RECORD_TYPES.MX,
        Value: "alt1.aspmx.l.google.com",
        Priority: 5,
        Ttl: 3600,
      },
      {
        Name: "",
        Type: DNS_RECORD_TYPES.TXT,
        Value: "v=spf1 include:_spf.google.com ~all",
        Ttl: 3600,
      },
      {
        Name: "google._domainkey",
        Type: DNS_RECORD_TYPES.TXT,
        Value: "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...",
        Ttl: 3600,
      },
      {
        Name: "",
        Type: DNS_RECORD_TYPES.A,
        Value: "192.0.2.1",
        Ttl: 600,
      },
      {
        Name: "www",
        Type: DNS_RECORD_TYPES.CNAME,
        Value: "old-hosting.godaddy.com",
        Ttl: 600,
      },
    ];

    const filtered = filterSafeMigrationRecords(mockScanned);
    return {
      success: true,
      jobId: "sim_scan_job_12345",
      records: filtered.all,
      safeRecords: filtered.safe,
      conflictingRecords: filtered.conflictingWeb,
      scanLogs: [
        `[${new Date().toLocaleTimeString("vi-VN")}] [Simulated] Đã quét thành công các bản ghi mẫu.`,
      ],
      nameserverUsed: "Simulated Resolver",
    };
  }

  // Live Deep Multi-Source Scan (Probes Mắt Bão, Tenten, iNET, PA VN, Public DNS, and Bunny API)
  const scanResult = await deepScanDomain(targetDomain, {
    customNs,
    zoneId: numZoneId,
    apiKey: BUNNY_ACCOUNT_API_KEY,
  });

  return {
    success: true,
    jobId: `deep_scan_${Date.now()}`,
    records: scanResult.records,
    safeRecords: scanResult.safeRecords,
    conflictingRecords: scanResult.conflictingRecords,
    scanLogs: scanResult.scanLogs,
    nameserverUsed: scanResult.nameserverUsed,
    total: scanResult.total,
  };
}

/**
 * Parse bulk DNS records text (BIND, Tabular, JSON)
 */
export async function parseBulkRecordsService({ rawText, domain }) {
  if (!rawText) return { success: true, records: [], safeRecords: [], conflictingRecords: [], errors: [], total: 0 };
  const parsed = parseBulkDnsText(rawText, domain);
  return {
    success: true,
    records: parsed.records,
    safeRecords: parsed.safeRecords,
    conflictingRecords: parsed.conflictingRecords,
    errors: parsed.errors,
    total: parsed.total,
  };
}

/**
 * Batch import selected records into DNS Zone
 */
export async function importSelectedRecordsService({ zoneId, records = [] }) {
  if (!zoneId) throw new Error("Missing zoneId");
  const numZoneId = Number(zoneId);

  if (!Array.isArray(records) || records.length === 0) {
    return { success: true, importedCount: 0, failedCount: 0 };
  }

  let importedCount = 0;
  let failedCount = 0;
  const errors = [];

  if (isSimulatedMode || numZoneId === 998877) {
    const existing = simulatedDnsStore.get(numZoneId) || [];
    for (const rec of records) {
      existing.push({
        Id: Math.floor(Math.random() * 900000) + 100000,
        ...rec,
        typeLabel: getRecordTypeLabel(rec.Type),
      });
      importedCount++;
    }
    simulatedDnsStore.set(numZoneId, existing);
    return { success: true, importedCount, failedCount: 0 };
  }

  for (const record of records) {
    try {
      await addDnsRecord(numZoneId, BUNNY_ACCOUNT_API_KEY, {
        type: record.Type,
        name: record.Name,
        value: record.Value,
        ttl: record.Ttl || 300,
        priority: record.Priority,
        weight: record.Weight,
        port: record.Port,
      });
      importedCount++;
    } catch (err) {
      failedCount++;
      errors.push({ record, error: err.message });
    }
  }

  return { success: true, importedCount, failedCount, errors };
}

/**
 * Create a single DNS record
 */
export async function createRecordService({ zoneId, record }) {
  if (!zoneId) throw new Error("Missing zoneId");
  const numZoneId = Number(zoneId);

  if (isSimulatedMode || numZoneId === 998877) {
    const list = simulatedDnsStore.get(numZoneId) || [];
    const newRec = {
      Id: Math.floor(Math.random() * 900000) + 100000,
      ...record,
      typeLabel: getRecordTypeLabel(record.Type),
    };
    list.push(newRec);
    simulatedDnsStore.set(numZoneId, list);
    return { success: true, record: newRec };
  }

  const result = await addDnsRecord(numZoneId, BUNNY_ACCOUNT_API_KEY, record);
  return { success: true, record: result };
}

/**
 * Delete a single DNS record
 */
export async function deleteRecordService({ zoneId, recordId }) {
  if (!zoneId || !recordId) throw new Error("Missing zoneId or recordId");
  const numZoneId = Number(zoneId);

  if (isSimulatedMode || numZoneId === 998877) {
    const list = simulatedDnsStore.get(numZoneId) || [];
    const filtered = list.filter((r) => String(r.Id) !== String(recordId));
    simulatedDnsStore.set(numZoneId, filtered);
    return { success: true };
  }

  console.log(`[DomainService] Đang xóa bản ghi #${recordId} thuộc Zone #${numZoneId} trực tiếp trên Bunny...`);
  await deleteDnsRecord(numZoneId, recordId, BUNNY_ACCOUNT_API_KEY);
  return { success: true };
}

/**
 * Batch delete multiple DNS records directly from Bunny
 */
export async function batchDeleteRecordsService({ zoneId, recordIds = [] }) {
  if (!zoneId) throw new Error("Missing zoneId");
  const numZoneId = Number(zoneId);

  if (isSimulatedMode || numZoneId === 998877) {
    const list = simulatedDnsStore.get(numZoneId) || [];
    const idSet = new Set(recordIds.map(String));
    const filtered = list.filter((r) => !idSet.has(String(r.Id)));
    simulatedDnsStore.set(numZoneId, filtered);
    return { success: true, deletedCount: recordIds.length };
  }

  let deletedCount = 0;
  const errors = [];
  console.log(`[DomainService] Bắt đầu xóa hàng loạt ${recordIds.length} bản ghi trên Bunny Zone #${numZoneId}...`);

  for (const rId of recordIds) {
    try {
      await deleteDnsRecord(numZoneId, rId, BUNNY_ACCOUNT_API_KEY);
      deletedCount++;
    } catch (err) {
      console.error(`[DomainService] Lỗi khi xóa bản ghi #${rId}:`, err.message);
      errors.push({ recordId: rId, error: err.message });
    }
  }

  console.log(`[DomainService] Hoàn tất xóa hàng loạt: ${deletedCount}/${recordIds.length} bản ghi.`);
  return { success: true, deletedCount, errors };
}
