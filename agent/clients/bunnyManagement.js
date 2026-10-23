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
