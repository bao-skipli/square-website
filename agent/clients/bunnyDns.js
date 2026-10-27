/**
 * Bunny DNS Management Client
 * Covers DNS Zone CRUD, DNS Records CRUD, and Record Scan & Migration APIs
 */

import dns from "dns/promises";

const BUNNY_API_BASE = "https://api.bunny.net";

export const DNS_RECORD_TYPES = {
  A: 0,
  AAAA: 1,
  CNAME: 2,
  TXT: 3,
  MX: 4,
  REDIRECT: 5,
  FLATTEN: 6,
  PULL_ZONE: 7,
  SRV: 8,
  CAA: 9,
  PTR: 10,
  SCRIPT: 11,
  NS: 12,
  SVCB: 13,
  HTTPS: 14,
  TLSA: 15,
};

export const DNS_TYPE_LABELS = {
  0: "A",
  1: "AAAA",
  2: "CNAME",
  3: "TXT",
  4: "MX",
  5: "Redirect",
  6: "Flatten",
  7: "PullZone (PZ)",
  8: "SRV",
  9: "CAA",
  10: "PTR",
  11: "Script",
  12: "NS",
  13: "SVCB",
  14: "HTTPS",
  15: "TLSA",
};

/**
 * Get readable label for Bunny Record Type
 */
export function getRecordTypeLabel(type) {
  return DNS_TYPE_LABELS[type] || `Type ${type}`;
}

/**
 * Resolve record type integer from string or number
 */
export function resolveRecordType(typeInput) {
  if (typeof typeInput === "number") return typeInput;
  if (!typeInput) return DNS_RECORD_TYPES.A;
  const upper = String(typeInput).trim().toUpperCase();
  if (upper === "PULL_ZONE" || upper === "PZ" || upper === "PULLZONE") {
    return DNS_RECORD_TYPES.PULL_ZONE;
  }
  if (upper in DNS_RECORD_TYPES) {
    return DNS_RECORD_TYPES[upper];
  }
  const parsed = parseInt(upper, 10);
  return Number.isNaN(parsed) ? DNS_RECORD_TYPES.A : parsed;
}

/**
 * Common fetch helper for Bunny API
 */
async function bunnyFetch(endpoint, apiKey, options = {}) {
  if (!apiKey) {
    throw new Error("Missing Bunny Account API Key");
  }

  const url = `${BUNNY_API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      AccessKey: apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    // raw text
  }

  if (!res.ok) {
    const errorMsg = json?.Message || text || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(errorMsg);
  }

  return json;
}

// ==========================================
// 1. DNS ZONE CRUD
// ==========================================

/**
 * Get all DNS Zones in account
 */
export async function getDnsZones(apiKey) {
  const result = await bunnyFetch("/dnszone", apiKey, { method: "GET" });
  if (Array.isArray(result)) return result;
  return result?.Items || [];
}

/**
 * Get DNS Zone details by zoneId (includes existing records and nameservers)
 */
export async function getDnsZone(zoneId, apiKey) {
  if (!zoneId) throw new Error("Missing zoneId");
  return await bunnyFetch(`/dnszone/${zoneId}`, apiKey, { method: "GET" });
}

/**
 * Create a new DNS Zone for domain
 */
export async function createDnsZone(domain, apiKey) {
  if (!domain) throw new Error("Missing domain");
  const cleanDomain = domain.toLowerCase().trim().replace(/^www\./, "");
  return await bunnyFetch("/dnszone", apiKey, {
    method: "POST",
    body: JSON.stringify({ Domain: cleanDomain }),
  });
}

/**
 * Ensure DNS Zone exists for domain: creates if not found, or reuses existing
 */
export async function ensureDnsZone(domain, apiKey) {
  if (!domain) throw new Error("Missing domain");
  const cleanDomain = domain.toLowerCase().trim().replace(/^www\./, "");

  try {
    const newZone = await createDnsZone(cleanDomain, apiKey);
    return { created: true, zone: newZone };
  } catch (err) {
    const msg = (err.message || "").toLowerCase();
    if (
      msg.includes("already exists") ||
      msg.includes("duplicate") ||
      msg.includes("already registered") ||
      msg.includes("already taken")
    ) {
      const allZones = await getDnsZones(apiKey);
      const existing = allZones.find(
        (z) => (z.Domain || "").toLowerCase().trim() === cleanDomain
      );
      if (existing) {
        return { created: false, zone: existing };
      }
    }
    throw err;
  }
}

/**
 * Delete a DNS Zone
 */
export async function deleteDnsZone(zoneId, apiKey) {
  if (!zoneId) throw new Error("Missing zoneId");
  return await bunnyFetch(`/dnszone/${zoneId}`, apiKey, { method: "DELETE" });
}

// ==========================================
// 2. DNS RECORDS CRUD
// ==========================================

/**
 * Add a new record to DNS Zone
 */
export async function addDnsRecord(zoneId, apiKey, {
  type = DNS_RECORD_TYPES.A,
  name = "",
  value = "",
  pullZoneId = null,
  ttl = 300,
  priority = 0,
  weight = 0,
  port = 0,
  flags = 0,
  tag = "",
}) {
  if (!zoneId) throw new Error("Missing zoneId");

  const resolvedType = resolveRecordType(type);
  const cleanName = (name || "").trim().replace(/^@$/, "");

  const payload = {
    Type: resolvedType,
    Name: cleanName,
    Value: value || "",
    Ttl: ttl || 300,
  };

  if (pullZoneId !== null && pullZoneId !== undefined && pullZoneId !== "") {
    payload.PullZoneId = Number(pullZoneId);
  }
  if (priority) payload.Priority = Number(priority);
  if (weight) payload.Weight = Number(weight);
  if (port) payload.Port = Number(port);
  if (flags) payload.Flags = Number(flags);
  if (tag) payload.Tag = tag;

  return await bunnyFetch(`/dnszone/${zoneId}/records`, apiKey, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Update existing DNS Record
 */
export async function updateDnsRecord(zoneId, recordId, apiKey, {
  type,
  name,
  value,
  pullZoneId,
  ttl = 300,
  priority,
  weight,
  port,
  flags,
  tag,
}) {
  if (!zoneId || !recordId) throw new Error("Missing zoneId or recordId");

  const resolvedType = resolveRecordType(type);
  const cleanName = (name || "").trim().replace(/^@$/, "");

  const payload = {
    Type: resolvedType,
    Name: cleanName,
    Value: value || "",
    Ttl: ttl || 300,
  };

  if (pullZoneId !== null && pullZoneId !== undefined && pullZoneId !== "") {
    payload.PullZoneId = Number(pullZoneId);
  }
  if (priority !== undefined) payload.Priority = Number(priority);
  if (weight !== undefined) payload.Weight = Number(weight);
  if (port !== undefined) payload.Port = Number(port);
  if (flags !== undefined) payload.Flags = Number(flags);
  if (tag !== undefined) payload.Tag = tag;

  return await bunnyFetch(`/dnszone/${zoneId}/records/${recordId}`, apiKey, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a DNS Record directly on Bunny.net
 */
export async function deleteDnsRecord(zoneId, recordId, apiKey) {
  if (!zoneId || !recordId) throw new Error("Missing zoneId or recordId");
  console.log(`[Bunny DNS API] Đang gửi yêu cầu DELETE /dnszone/${zoneId}/records/${recordId}...`);
  const res = await bunnyFetch(`/dnszone/${zoneId}/records/${recordId}`, apiKey, {
    method: "DELETE",
  });
  console.log(`[Bunny DNS API] ✅ Đã xóa thành công bản ghi #${recordId} khỏi DNS Zone #${zoneId} trên Bunny!`);
  return res;
}

// ==========================================
// 3. DNS RECORDS SCAN & MIGRATION API
// ==========================================

/**
 * Trigger background scan to discover pre-existing DNS records from current domain registrar
 */
export async function triggerDnsScan({ zoneId, domain, apiKey }) {
  if (!zoneId && !domain) {
    throw new Error("Must provide either zoneId or domain to scan");
  }

  const payload = {};
  if (zoneId) {
    payload.ZoneId = Number(zoneId);
  } else {
    payload.Domain = domain.toLowerCase().trim().replace(/^www\./, "");
  }

  return await bunnyFetch("/dnszone/records/scan", apiKey, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Get latest scan results for a specific DNS Zone
 */
export async function getDnsScanResults(zoneId, apiKey) {
  if (!zoneId) throw new Error("Missing zoneId");
  return await bunnyFetch(`/dnszone/${zoneId}/records/scan`, apiKey, {
    method: "GET",
  });
}

/**
 * Poll scan results until completion or timeout
 */
export async function pollDnsScanResults(zoneId, apiKey, { maxAttempts = 6, delayMs = 1500 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const scan = await getDnsScanResults(zoneId, apiKey);
      // Status 0 usually indicates completed
      if (scan && (scan.Status === 0 || (Array.isArray(scan.Records) && scan.Records.length > 0))) {
        return scan;
      }
    } catch (e) {
      // If scan not ready yet or 404, wait
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  // Fallback return latest attempt
  return await getDnsScanResults(zoneId, apiKey);
}

/**
 * Smart Filter helper: separates safe records (MX, TXT, SPF, DKIM, SRV)
 * from conflicting root/www web records (A, CNAME) and apex NS
 */
export function filterSafeMigrationRecords(scannedRecords = []) {
  const safe = [];
  const conflictingWeb = [];

  for (const record of scannedRecords) {
    const cleanName = (record.Name || "").trim().toLowerCase();
    const type = resolveRecordType(record.Type);

    // Conflict: Apex domain (@) or www pointing to old A or CNAME host
    const isRootOrWww = cleanName === "" || cleanName === "@" || cleanName === "www";
    const isWebType = type === DNS_RECORD_TYPES.A || type === DNS_RECORD_TYPES.AAAA || type === DNS_RECORD_TYPES.CNAME;
    const isApexNs = isRootOrWww && type === DNS_RECORD_TYPES.NS;

    if (isApexNs) {
      conflictingWeb.push({
        ...record,
        typeLabel: getRecordTypeLabel(type),
        reason: "Bản ghi Nameserver cũ. Không cần nhập vì tên miền đã trỏ Nameserver về Bunny.",
        selectedByDefault: false,
      });
    } else if (isRootOrWww && isWebType) {
      conflictingWeb.push({
        ...record,
        typeLabel: getRecordTypeLabel(type),
        reason: "Bản ghi trỏ web cũ (@ hoặc www). Nếu nhập sẽ xung đột với Square Store trên Bunny CDN.",
        selectedByDefault: false,
      });
    } else {
      safe.push({
        ...record,
        typeLabel: getRecordTypeLabel(type),
        reason:
          type === DNS_RECORD_TYPES.MX
            ? "Email MX record"
            : type === DNS_RECORD_TYPES.TXT
            ? "Xác thực domain / SPF / DKIM"
            : type === DNS_RECORD_TYPES.SRV
            ? "Dịch vụ cấu hình tự động (SRV)"
            : "Subdomain hoặc dịch vụ phụ",
        selectedByDefault: true,
      });
    }
  }

  return { safe, conflictingWeb, all: [...safe, ...conflictingWeb] };
}

// ==========================================
// 4. DEEP SCAN & MULTI-SOURCE REGISTRAR PROBE
// ==========================================

export const KNOWN_REGISTRAR_NAMESERVERS = [
  { name: "Mắt Bão", host: "ns1.matbao.vn" },
  { name: "Mắt Bão (Backup)", host: "ns2.matbao.vn" },
  { name: "Tenten", host: "ns1.tenten.vn" },
  { name: "iNET", host: "ns1.inet.vn" },
  { name: "PA Việt Nam", host: "ns1.pavietnam.vn" },
  { name: "Nhân Hòa", host: "ns1.nhanhoa.com" },
  { name: "BKNS", host: "ns1.bkns.vn" },
  { name: "Cloudflare", host: "1.1.1.1" },
  { name: "Google Public DNS", host: "8.8.8.8" },
];

export const COMMON_SUBDOMAINS = [
  "", "www", "mail", "webmail", "email", "cpanel", "whm", "webdisk",
  "cpcalendars", "cpcontacts", "autoconfig", "autodiscover",
  "send", "smtp", "pop", "pop3", "imap", "mailgun", "sendgrid", "em",
  "bounce", "news", "newsletter", "admin", "api", "app", "dev", "staging",
  "cdn", "shop", "store", "sip", "msoid",
  "_dmarc", "resend._domainkey", "default._domainkey", "google._domainkey",
  "k1._domainkey", "s1._domainkey", "s2._domainkey", "smtp._domainkey",
  "mail._domainkey", "selector1._domainkey", "private._domainkey"
];

export const COMMON_SRV_PREFIXES = [
  "_autodiscover._tcp",
  "_sip._tls",
  "_sipfederationtls._tcp",
  "_caldav._tcp",
  "_carddav._tcp",
  "_imaps._tcp",
  "_submission._tcp"
];

/**
 * Clean and relative-ize record hostname against domain
 */
export function cleanRecordHost(name = "", domain = "") {
  let clean = (name || "").trim().toLowerCase();
  if (clean === "@" || clean === "." || !clean) return "";
  const cleanDomain = (domain || "").toLowerCase().trim().replace(/^www\./, "");
  if (cleanDomain) {
    clean = clean.replace(new RegExp(`\\.?${cleanDomain}\\.?$`), "");
  }
  return clean.replace(/^\.+|\.+$/g, "");
}

/**
 * Deep multi-source DNS scanner:
 * 1. Queries authoritative registrar nameservers (or custom specified NS)
 * 2. Scans apex and standard subdomains for A, CNAME, MX, TXT, SPF, DKIM, SRV
 * 3. Falls back/supplements with Bunny DNS Scan API if zoneId/apiKey provided
 * 4. Produces structured execution logs and isolates safe migration records
 */
export async function deepScanDomain(domain, { customNs = null, zoneId = null, apiKey = null } = {}) {
  if (!domain) throw new Error("Missing domain to scan");
  const cleanDomain = domain.toLowerCase().trim().replace(/^www\./, "");

  const scanLogs = [];
  function log(msg) {
    const timestamp = new Date().toLocaleTimeString("vi-VN", { hour12: false });
    const line = `[${timestamp}] ${msg}`;
    scanLogs.push(line);
    console.log(`[DNS Scan] ${line}`);
  }

  log(`Bắt đầu quét sâu bản ghi DNS cho tên miền: ${cleanDomain}`);
  if (customNs) {
    log(`Sử dụng Nameserver chỉ định bởi người dùng: ${customNs}`);
  }

  const rawDiscovered = [];
  const seenKeys = new Set();

  function recordUnique(name, type, value, ttl = 3600, priority = null, weight = null, port = null) {
    const host = cleanRecordHost(name, cleanDomain);
    let val = typeof value === "string" ? value.trim() : String(value);
    if (type === "CNAME" || type === "MX" || type === "SRV") {
      val = val.replace(/\.$/, "");
    }
    const resolvedType = resolveRecordType(type);
    const key = `${resolvedType}:${host}:${val}:${port || 0}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      const rec = {
        Name: host,
        Type: resolvedType,
        typeLabel: getRecordTypeLabel(resolvedType),
        Value: val,
        Ttl: ttl || 3600,
        Priority: priority !== null && priority !== undefined ? Number(priority) : 0,
        Weight: weight !== null && weight !== undefined ? Number(weight) : 0,
        Port: port !== null && port !== undefined ? Number(port) : 0,
      };
      rawDiscovered.push(rec);
      const extra = [];
      if (rec.Priority) extra.push(`Priority: ${rec.Priority}`);
      if (rec.Weight) extra.push(`Weight: ${rec.Weight}`);
      if (rec.Port) extra.push(`Port: ${rec.Port}`);
      const extraStr = extra.length > 0 ? ` (${extra.join(", ")})` : "";
      log(`  ↳ Tìm thấy: [${rec.typeLabel}] ${host || "@"} ➔ ${val}${extraStr}`);
    }
  }

  // 1. Build list of nameservers to probe
  const serversToTry = [];
  if (customNs) {
    serversToTry.push({ name: `Tùy chọn (${customNs})`, host: customNs.trim() });
  } else {
    // Add public resolvers first
    serversToTry.push(
      { name: "Google Public DNS", host: "8.8.8.8" },
      { name: "Cloudflare DNS", host: "1.1.1.1" }
    );
    // Add common registrar servers in Vietnam
    serversToTry.push(...KNOWN_REGISTRAR_NAMESERVERS);
  }

  let responsiveServerUsed = null;

  for (const target of serversToTry) {
    let resolver;
    let targetIp = target.host;

    try {
      if (!/^\d+\.\d+\.\d+\.\d+$/.test(target.host)) {
        const lookup = await dns.lookup(target.host).catch(() => null);
        if (!lookup?.address) continue;
        targetIp = lookup.address;
      }
      resolver = new dns.Resolver();
      resolver.setServers([targetIp]);
    } catch (e) {
      continue;
    }

    try {
      // Test if server answers authoritatively or has records for cleanDomain
      const [testA, testMx, testTxt] = await Promise.allSettled([
        resolver.resolve4(cleanDomain),
        resolver.resolveMx(cleanDomain),
        resolver.resolveTxt(cleanDomain),
      ]);

      const aValues = testA.status === "fulfilled" ? testA.value : null;
      const mxValues = testMx.status === "fulfilled" ? testMx.value : null;
      const txtValues = testTxt.status === "fulfilled" ? testTxt.value : null;

      if (aValues?.length || mxValues?.length || txtValues?.length) {
        log(`Máy chủ phản hồi tích cực: ${target.name} (${target.host})`);
        responsiveServerUsed = `${target.name} (${target.host})`;

        if (aValues) {
          aValues.forEach((ip) => recordUnique("", "A", ip));
        }
        if (mxValues) {
          mxValues.forEach((m) => recordUnique("", "MX", m.exchange, 3600, m.priority));
        }
        if (txtValues) {
          txtValues.forEach((t) => {
            const str = Array.isArray(t) ? t.join("") : String(t);
            recordUnique("", "TXT", str);
          });
        }

        // Scan subdomains on this responsive nameserver
        for (const sub of COMMON_SUBDOMAINS) {
          if (!sub) continue;
          const subHost = `${sub}.${cleanDomain}`;

          const [subCname, subA, subTxt, subMx] = await Promise.allSettled([
            resolver.resolveCname(subHost),
            resolver.resolve4(subHost),
            resolver.resolveTxt(subHost),
            resolver.resolveMx(subHost),
          ]);

          if (subCname.status === "fulfilled" && subCname.value) {
            subCname.value.forEach((c) => recordUnique(sub, "CNAME", c));
          }
          if (subA.status === "fulfilled" && subA.value) {
            subA.value.forEach((ip) => recordUnique(sub, "A", ip));
          }
          if (subTxt.status === "fulfilled" && subTxt.value) {
            subTxt.value.forEach((t) => {
              const str = Array.isArray(t) ? t.join("") : String(t);
              recordUnique(sub, "TXT", str);
            });
          }
          if (subMx.status === "fulfilled" && subMx.value) {
            subMx.value.forEach((m) => recordUnique(sub, "MX", m.exchange, 3600, m.priority));
          }
        }

        // Scan SRV records
        for (const srvPrefix of COMMON_SRV_PREFIXES) {
          const srvHost = `${srvPrefix}.${cleanDomain}`;
          try {
            const srvs = await resolver.resolveSrv(srvHost);
            if (Array.isArray(srvs)) {
              srvs.forEach((s) => {
                recordUnique(srvPrefix, "SRV", s.name, 3600, s.priority, s.weight, s.port);
              });
            }
          } catch (e) {}
        }

        // If substantial records found from an authoritative nameserver, stop probing further registrars
        if (rawDiscovered.length >= 2) {
          break;
        }
      }
    } catch (err) {
      // Ignore individual server probe errors and continue to next
    }
  }

  // 2. Also query Bunny Scan API as supplementary source if zoneId and apiKey are available
  if (zoneId && apiKey) {
    try {
      log(`Truy vấn bổ sung qua Bunny DNS Scan API (Zone #${zoneId})...`);
      await triggerDnsScan({ zoneId, apiKey }).catch(() => null);
      const bunnyScan = await pollDnsScanResults(zoneId, apiKey, { maxAttempts: 3, delayMs: 1000 }).catch(() => null);
      const bunnyRecords = bunnyScan?.Records || [];
      if (bunnyRecords.length > 0) {
        log(`Bunny API phát hiện thêm ${bunnyRecords.length} bản ghi`);
        for (const br of bunnyRecords) {
          recordUnique(br.Name, br.Type, br.Value, br.Ttl, br.Priority, br.Weight, br.Port);
        }
      }
    } catch (e) {
      // Ignored
    }
  }

  log(`Quét hoàn tất! Tổng cộng phát hiện ${rawDiscovered.length} bản ghi hợp lệ.`);
  console.log(`------------------------------------------------------`);
  console.log(`[DNS Deep Scan] TỔNG HỢP BẢN GHI ĐÃ QUÉT CHO: ${cleanDomain}`);
  rawDiscovered.forEach((r, idx) => {
    const extra = [];
    if (r.Priority) extra.push(`Priority: ${r.Priority}`);
    if (r.Weight) extra.push(`Weight: ${r.Weight}`);
    if (r.Port) extra.push(`Port: ${r.Port}`);
    const extraStr = extra.length > 0 ? `, ${extra.join(", ")}` : "";
    console.log(`  ${idx + 1}. [${r.typeLabel.padEnd(5)}] ${r.Name || "@"} -> ${r.Value} (TTL: ${r.Ttl || 300}s${extraStr})`);
  });
  console.log(`------------------------------------------------------`);

  const filtered = filterSafeMigrationRecords(rawDiscovered);

  return {
    success: true,
    domain: cleanDomain,
    records: filtered.all,
    safeRecords: filtered.safe,
    conflictingRecords: filtered.conflictingWeb,
    scanLogs,
    nameserverUsed: responsiveServerUsed || "Public DNS",
    total: rawDiscovered.length,
  };
}

// ==========================================
// 5. BULK DNS TEXT & CSV PARSER
// ==========================================

export const SAMPLE_CSV_TEMPLATE = `Host,Type,Data,TTL
@,A,216.198.79.1,3600
autoconfig,CNAME,s129d209.emailserver.vn.,3600
autodiscover,CNAME,s129d209.emailserver.vn.,3600
cpanel,CNAME,s129d209.emailserver.vn.,3600
cpcalendars,CNAME,s129d209.emailserver.vn.,3600
cpcontacts,CNAME,s129d209.emailserver.vn.,3600
mail,CNAME,s129d209.emailserver.vn.,3600
webmail,CNAME,s129d209.emailserver.vn.,3600
@,MX,0 s129d209.emailserver.vn.,3600
send,MX,10 feedback-smtp.ap-northeast-1.amazonses.com.,3600
@,TXT,"""v=spf1 mx include:emailserver.vn include:spf.protection.outlook.com -all""",3600
_dmarc,TXT,"""v=DMARC1; p=none;""",3600
resend._domainkey,TXT,"""p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC6X9EdmN/P760LUAOMVtA70MjEjMKtVyTyztHzmh6Nafw1fVeSN5Vm2p93RNgcW5WORSd6qJl9qOvzkYZT5SDadGxjexxkdese1uoe1NJe2ly3wY5DEZKN2UgBk3Mcduqjuv6vP15kCv8xt7KH7VI4j0zRENBc3sXtTnZE8aPpXwIDAQAB""",3600
send,TXT,"""v=spf1 include:amazonses.com ~all""",3600
_autodiscover._tcp,SRV,0 0 443 s129d209.emailserver.vn.,3600`;

/**
 * RFC 4180 compliant CSV line tokenizer
 */
export function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  let i = 0;
  while (i < line.length) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      i++;
    } else {
      current += char;
      i++;
    }
  }
  result.push(current);
  return result.map((s) => s.trim());
}

/**
 * Robust DNS parser supporting:
 * - Registrar CSV export format (Mắt Bão, cPanel, DirectAdmin): `Host,Type,Data,TTL`
 * - BIND Zone export format (RFC 1035): `jobsnow.id.vn. 3600 IN A 216.198.79.1`
 * - Tab/space separated web tables: `A  @  216.198.79.1  3600`
 * - JSON list format: `[{"type": "A", "name": "@", "value": "1.2.3.4"}]`
 */
export function parseBulkDnsText(rawText = "", domain = "") {
  const cleanDomain = (domain || "").toLowerCase().trim().replace(/^www\./, "");
  const lines = (rawText || "").split("\n");
  const parsedRecords = [];
  const errors = [];
  const KNOWN_TYPES = ["A", "AAAA", "CNAME", "TXT", "MX", "SRV", "CAA", "PZ", "PULLZONE", "NS"];

  // 1. Try parsing whole block as JSON
  const trimmedAll = (rawText || "").trim();
  if (trimmedAll.startsWith("[") && trimmedAll.endsWith("]")) {
    try {
      const json = JSON.parse(trimmedAll);
      if (Array.isArray(json)) {
        for (const item of json) {
          const type = (item.type || item.Type || "A").toString().toUpperCase();
          const name = (item.name || item.Name || "@").toString();
          const value = (item.value || item.Value || "").toString();
          const ttl = Number(item.ttl || item.Ttl) || 3600;
          const priority = Number(item.priority || item.Priority) || 0;
          const weight = Number(item.weight || item.Weight) || 0;
          const port = Number(item.port || item.Port) || 0;
          if (value) {
            parsedRecords.push({
              Type: resolveRecordType(type),
              typeLabel: type,
              Name: cleanRecordHost(name, cleanDomain),
              Value: value.replace(/^"(.*)"$/, "$1").trim(),
              Ttl: ttl,
              Priority: priority,
              Weight: weight,
              Port: port,
              originalLine: JSON.stringify(item),
            });
          }
        }
        const filtered = filterSafeMigrationRecords(parsedRecords);
        return {
          records: filtered.all,
          safeRecords: filtered.safe,
          conflictingRecords: filtered.conflictingWeb,
          errors: [],
          total: filtered.all.length,
        };
      }
    } catch (e) {}
  }

  // 2. Detect CSV Header
  let csvHeaderMap = null;
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith("#") || rawLine.startsWith(";")) continue;
    if (rawLine.includes(",")) {
      const parts = parseCsvLine(rawLine).map((p) => p.toLowerCase());
      if (parts.includes("type") || parts.includes("loại") || parts.includes("loại bản ghi")) {
        csvHeaderMap = {
          headerLineIndex: i,
          colHost: parts.findIndex((p) => ["host", "name", "tên", "domain", "hostname"].includes(p)),
          colType: parts.findIndex((p) => ["type", "loại", "loại bản ghi", "record type"].includes(p)),
          colData: parts.findIndex((p) => ["data", "value", "content", "target", "giá trị", "đích", "rdata"].includes(p)),
          colTtl: parts.findIndex((p) => ["ttl", "thời gian sống", "time to live"].includes(p)),
        };
      }
    }
    break;
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine || rawLine.startsWith("#") || rawLine.startsWith(";")) {
      continue;
    }

    // Skip header line if matched
    if (csvHeaderMap && i === csvHeaderMap.headerLineIndex) {
      continue;
    }

    // A. CSV line parsing
    if (rawLine.includes(",")) {
      const cols = parseCsvLine(rawLine);
      if (cols.length >= 3) {
        let hostCol = cols[0];
        let typeCol = cols[1].toUpperCase();
        let dataCol = cols[2];
        let ttlCol = cols[3] || "3600";

        if (csvHeaderMap) {
          if (csvHeaderMap.colHost !== -1) hostCol = cols[csvHeaderMap.colHost];
          if (csvHeaderMap.colType !== -1) typeCol = (cols[csvHeaderMap.colType] || "").toUpperCase();
          if (csvHeaderMap.colData !== -1) dataCol = cols[csvHeaderMap.colData];
          if (csvHeaderMap.colTtl !== -1 && cols[csvHeaderMap.colTtl]) ttlCol = cols[csvHeaderMap.colTtl];
        } else {
          // Auto-detect if column 0 is type instead of host
          if (KNOWN_TYPES.includes(cols[0].toUpperCase()) && !KNOWN_TYPES.includes(cols[1].toUpperCase())) {
            typeCol = cols[0].toUpperCase();
            hostCol = cols[1];
            dataCol = cols[2];
            ttlCol = cols[3] || "3600";
          }
        }

        if (KNOWN_TYPES.includes(typeCol)) {
          let priority = 0;
          let weight = 0;
          let port = 0;
          let value = dataCol || "";
          const ttl = parseInt(ttlCol, 10) || 3600;

          if (typeCol === "MX") {
            const mxMatch = value.match(/^(\d+)\s+(.+)$/);
            if (mxMatch) {
              priority = parseInt(mxMatch[1], 10);
              value = mxMatch[2];
            }
          } else if (typeCol === "SRV") {
            const srvMatch = value.match(/^(\d+)\s+(\d+)\s+(\d+)\s+(.+)$/);
            if (srvMatch) {
              priority = parseInt(srvMatch[1], 10);
              weight = parseInt(srvMatch[2], 10);
              port = parseInt(srvMatch[3], 10);
              value = srvMatch[4];
            }
          } else if (typeCol === "TXT") {
            value = value.replace(/^"+|"+$/g, "").trim();
          }

          value = value.replace(/\.$/, "").trim();
          const cleanHost = cleanRecordHost(hostCol, cleanDomain);

          if (value) {
            parsedRecords.push({
              Type: resolveRecordType(typeCol),
              typeLabel: typeCol,
              Name: cleanHost,
              Value: value,
              Ttl: ttl,
              Priority: priority,
              Weight: weight,
              Port: port,
              originalLine: rawLine,
            });
            continue;
          }
        }
      }
    }

    // B. Standard BIND or Tabular parsing
    let textToTokenize = rawLine;
    let quotedTxt = null;
    const quoteMatch = rawLine.match(/"([^"]*)"/);
    if (quoteMatch) {
      quotedTxt = quoteMatch[1];
      textToTokenize = rawLine.replace(/"[^"]*"/, "__QUOTED_TXT__");
    }

    const tokens = textToTokenize.split(/[\s,\t]+/).filter(Boolean);
    if (tokens.length < 2) {
      errors.push({ line: i + 1, content: rawLine, error: "Dòng không đủ thông tin (cần Loại, Tên, Giá trị)" });
      continue;
    }

    // Find token matching record type
    let typeIndex = -1;
    let matchedType = null;
    for (let t = 0; t < tokens.length; t++) {
      const up = tokens[t].toUpperCase();
      if (KNOWN_TYPES.includes(up)) {
        typeIndex = t;
        matchedType = up;
        break;
      }
    }

    if (typeIndex === -1) {
      errors.push({ line: i + 1, content: rawLine, error: "Không tìm thấy loại bản ghi hợp lệ (A, CNAME, TXT, MX, SRV...)" });
      continue;
    }

    let name = "@";
    if (typeIndex > 0) {
      // Type is not first token: e.g. BIND `host 3600 IN A ...` or `host A ...`
      if (tokens[typeIndex - 1].toUpperCase() === "IN" && typeIndex >= 2) {
        if (/^\d+$/.test(tokens[typeIndex - 2]) && typeIndex >= 3) {
          name = tokens[typeIndex - 3];
        } else {
          name = tokens[typeIndex - 2];
        }
      } else if (!/^\d+$/.test(tokens[typeIndex - 1])) {
        name = tokens[typeIndex - 1];
      } else if (typeIndex >= 2) {
        name = tokens[0];
      }
    } else {
      // Type is first token: e.g. Table `A  @  1.2.3.4  3600`
      if (tokens.length > 1) {
        name = tokens[1];
      }
    }

    const afterTypeTokens = tokens.slice(typeIndex + 1);
    const valueTokens = afterTypeTokens.filter((tok) => tok.toUpperCase() !== "IN");
    if (typeIndex === 0 && valueTokens.length > 0 && valueTokens[0] === name) {
      valueTokens.shift();
    }

    let value = "";
    let priority = 0;
    let weight = 0;
    let port = 0;
    let ttl = 3600;

    if (matchedType === "MX") {
      const numIdx = valueTokens.findIndex((tok) => /^\d+$/.test(tok));
      if (numIdx !== -1) {
        priority = parseInt(valueTokens[numIdx], 10);
        valueTokens.splice(numIdx, 1);
      }
    } else if (matchedType === "SRV") {
      const nums = [];
      while (valueTokens.length > 0 && /^\d+$/.test(valueTokens[0])) {
        nums.push(parseInt(valueTokens.shift(), 10));
      }
      if (nums.length >= 3) {
        priority = nums[0];
        weight = nums[1];
        port = nums[2];
      }
    }

    const ttlIdx = valueTokens.findIndex((tok) => /^\d+$/.test(tok) && parseInt(tok, 10) >= 60);
    if (ttlIdx !== -1) {
      ttl = parseInt(valueTokens[ttlIdx], 10);
      valueTokens.splice(ttlIdx, 1);
    }

    if (quotedTxt !== null) {
      value = quotedTxt;
    } else {
      value = valueTokens.join(" ").replace(/__QUOTED_TXT__/, quotedTxt || "").trim();
    }

    value = value.replace(/^"(.*)"$/, "$1").replace(/\.$/, "").trim();
    const cleanHost = cleanRecordHost(name, cleanDomain);

    if (!value) {
      errors.push({ line: i + 1, content: rawLine, error: "Thiếu giá trị (Value / Target)" });
      continue;
    }

    parsedRecords.push({
      Type: resolveRecordType(matchedType),
      typeLabel: matchedType,
      Name: cleanHost,
      Value: value,
      Ttl: ttl || 3600,
      Priority: priority || 0,
      Weight: weight || 0,
      Port: port || 0,
      originalLine: rawLine,
    });
  }

  const filtered = filterSafeMigrationRecords(parsedRecords);

  return {
    records: filtered.all,
    safeRecords: filtered.safe,
    conflictingRecords: filtered.conflictingWeb,
    errors,
    total: filtered.all.length,
  };
}

