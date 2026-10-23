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
import { verifyDns } from "../clients/dnsVerifier.js";
import { getDb, getHasDbAccess } from "./firebaseClient.js";

/**
 * Attach custom hostname to Bunny Pull Zone and sync to RTDB
 */
export async function attachDomain({ hostname, storeId = "store_skipli" }) {
  if (!hostname) throw new Error("Missing hostname");

  if (!isSimulatedMode) {
    await addCustomHostname({
      pullZoneId: BUNNY_PULL_ZONE_ID,
      hostname,
      accountApiKey: BUNNY_ACCOUNT_API_KEY,
    });
    // If domain doesn't start with www., also register www.hostname so CNAME 'www' works
    if (!hostname.startsWith("www.")) {
      try {
        await addCustomHostname({
          pullZoneId: BUNNY_PULL_ZONE_ID,
          hostname: `www.${hostname}`,
          accountApiKey: BUNNY_ACCOUNT_API_KEY,
        });
      } catch (e) {
        // Ignored if already registered
      }
    }
  }

  const dnsCheck = await verifyDns({ hostname, expectedCname: BUNNY_CDN_HOSTNAME });
  const status = dnsCheck.matchesTarget ? "PENDING_SSL" : "PENDING_DNS";
  const now = Date.now();
  const domainKey = hostname.replace(/\./g, ",");

  const domainConfig = {
    hostname,
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
          hostname,
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
