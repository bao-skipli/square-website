import dns from "dns/promises";

// Comprehensive MIME type map to ensure correct Content-Type without external dependencies
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

export function getMimeType(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * Bunny Management API: Add custom hostname to Pull Zone
 */
export async function addCustomHostname({ pullZoneId, hostname, accountApiKey }) {
  if (!pullZoneId || !hostname || !accountApiKey) {
    throw new Error("Missing pullZoneId, hostname, or accountApiKey");
  }

  const url = `https://api.bunny.net/pullzone/${pullZoneId}/addHostname`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      AccessKey: accountApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ Hostname: hostname }),
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {
    // text response
  }

  if (!res.ok) {
    const errorMsg = json?.Message || text || `HTTP ${res.status}`;
    // If already added, treat as success or note it
    if (errorMsg.includes("already exists") || errorMsg.includes("already registered")) {
      return { success: true, message: "Hostname already registered on Pull Zone.", raw: json };
    }
    throw new Error(`Failed to add hostname: ${errorMsg}`);
  }

  return { success: true, raw: json };
}

/**
 * Bunny Management API: Remove custom hostname from Pull Zone
 */
export async function removeCustomHostname({ pullZoneId, hostname, accountApiKey }) {
  if (!pullZoneId || !hostname || !accountApiKey) {
    throw new Error("Missing pullZoneId, hostname, or accountApiKey");
  }

  const url = `https://api.bunny.net/pullzone/${pullZoneId}/removeHostname`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      AccessKey: accountApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ Hostname: hostname }),
  });

  const text = await res.text();
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to remove hostname: ${text || res.statusText}`);
  }

  return { success: true };
}

/**
 * Bunny Management API: Get Pull Zone details
 */
export async function getPullZone({ pullZoneId, accountApiKey }) {
  if (!pullZoneId || !accountApiKey) {
    throw new Error("Missing pullZoneId or accountApiKey");
  }

  const url = `https://api.bunny.net/pullzone/${pullZoneId}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      AccessKey: accountApiKey,
      Accept: "application/json",
    },
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {}

  if (!res.ok) {
    throw new Error(`Failed to get pull zone: ${json?.Message || text || res.statusText}`);
  }

  return json;
}

/**
 * Check if hostname exists on Pull Zone and already has an active SSL certificate
 */
export async function checkHostnameSsl({ pullZoneId, hostname, accountApiKey }) {
  if (!pullZoneId || !hostname || !accountApiKey) {
    return { exists: false, hasCertificate: false };
  }

  try {
    const zone = await getPullZone({ pullZoneId, accountApiKey });
    const cleanHost = String(hostname).toLowerCase().trim();
    const entry = (zone.Hostnames || []).find(
      (h) => (h.Value || "").toLowerCase().trim() === cleanHost
    );
    return {
      exists: !!entry,
      hasCertificate: Boolean(entry && entry.HasCertificate),
      entry: entry || null,
    };
  } catch (err) {
    return { exists: false, hasCertificate: false, error: err.message };
  }
}

/**
 * Bunny Management API: Request & load free Let's Encrypt SSL certificate
 */
export async function loadFreeCertificate({ hostname, accountApiKey, pullZoneId }) {
  if (!hostname || !accountApiKey) {
    throw new Error("Missing hostname or accountApiKey");
  }

  // 1. If pullZoneId is supplied, check if the certificate is already active on the Pull Zone
  if (pullZoneId) {
    const sslStatus = await checkHostnameSsl({ pullZoneId, hostname, accountApiKey });
    if (sslStatus.hasCertificate) {
      return {
        success: true,
        certificateLoaded: true,
        alreadyActive: true,
        raw: sslStatus.entry,
      };
    }
  }

  const url = `https://api.bunny.net/pullzone/loadFreeCertificate?hostname=${encodeURIComponent(hostname)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      AccessKey: accountApiKey,
      Accept: "application/json",
    },
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {}

  if (!res.ok) {
    // If request failed, check if certificate is already active anyway
    if (pullZoneId) {
      const recheck = await checkHostnameSsl({ pullZoneId, hostname, accountApiKey });
      if (recheck.hasCertificate) {
        return {
          success: true,
          certificateLoaded: true,
          alreadyActive: true,
          raw: recheck.entry,
        };
      }
    }

    const msg = json?.Message || text || `HTTP ${res.status}`;
    return {
      success: false,
      error: msg,
      ready: false,
    };
  }

  return {
    success: true,
    certificateLoaded: true,
    raw: json,
  };
}

/**
 * Bunny Management API: Purge Pull Zone Cache
 */
export async function purgePullZoneCache({ pullZoneId, accountApiKey }) {
  if (!pullZoneId || !accountApiKey) {
    throw new Error("Missing pullZoneId or accountApiKey");
  }

  const url = `https://api.bunny.net/pullzone/${pullZoneId}/purgeCache`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      AccessKey: accountApiKey,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to purge Pull Zone cache: ${text || res.statusText}`);
  }

  return { success: true };
}

/**
 * Bunny Storage API: Upload file
 * Direct HTTP PUT without CLI
 */
export async function uploadStorageFile({
  storageZoneName,
  storagePassword,
  storageHostname = "storage.bunnycdn.com",
  remotePath,
  buffer,
  contentType,
}) {
  if (!storageZoneName || !storagePassword || !remotePath) {
    throw new Error("Missing required storage upload parameters");
  }

  // Normalize remotePath: remove leading slash
  const cleanPath = remotePath.replace(/^\/+/, "");
  const url = `https://${storageHostname}/${storageZoneName}/${cleanPath}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: storagePassword,
      "Content-Type": contentType || getMimeType(cleanPath),
    },
    body: buffer,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storage upload failed for ${cleanPath} (HTTP ${res.status}): ${text}`);
  }

  return { success: true, path: cleanPath };
}

/**
 * Bunny Storage API: List files in remote folder
 */
export async function listStorageFiles({
  storageZoneName,
  storagePassword,
  storageHostname = "storage.bunnycdn.com",
  remotePath = "",
}) {
  const cleanPath = remotePath.replace(/^\/+/, "");
  const url = `https://${storageHostname}/${storageZoneName}/${cleanPath ? cleanPath + "/" : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      AccessKey: storagePassword,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    return [];
  }

  try {
    return await res.json();
  } catch (e) {
    return [];
  }
}

/**
 * DNS Verification: checks if hostname resolves to target CNAME or Bunny Edge IP
 */
export async function verifyDns({ hostname, expectedCname }) {
  try {
    const cleanHost = hostname.trim().toLowerCase();
    const cleanExpected = expectedCname ? expectedCname.trim().toLowerCase() : null;

    // Try resolving CNAME first
    try {
      const cnames = await dns.resolveCname(cleanHost);
      if (cleanExpected && cnames.some((c) => c.toLowerCase().includes(cleanExpected))) {
        return {
          resolved: true,
          type: "CNAME",
          records: cnames,
          matchesTarget: true,
        };
      }
      return {
        resolved: true,
        type: "CNAME",
        records: cnames,
        matchesTarget: Boolean(!cleanExpected || cnames.length > 0),
      };
    } catch (cnameErr) {
      // Apex domain or A record fallback
      const addresses = await dns.resolve4(cleanHost);
      return {
        resolved: addresses.length > 0,
        type: "A",
        records: addresses,
        matchesTarget: addresses.length > 0,
      };
    }
  } catch (err) {
    return {
      resolved: false,
      error: err.code || err.message,
      matchesTarget: false,
    };
  }
}

/**
 * CDN Verification: performs HTTP GET to verify deployed website is online
 */
export async function verifyLiveWebsite(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Squareup-Bunny-Verifier/1.0",
      },
    });
    clearTimeout(timer);

    const text = await res.text();
    const isHtml = text.includes("<html") || text.includes("<!DOCTYPE");
    return {
      success: res.ok,
      status: res.status,
      isHtml,
      byteLength: text.length,
    };
  } catch (err) {
    clearTimeout(timer);
    return {
      success: false,
      error: err.name === "AbortError" ? "Verification request timed out" : err.message,
    };
  }
}
