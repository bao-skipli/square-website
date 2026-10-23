/**
 * Backward compatibility facade
 * Re-exports all client methods from modularized sub-clients
 */
export { MIME_TYPES, getMimeType } from "./clients/mimeTypes.js";
export {
  addCustomHostname,
  removeCustomHostname,
  getPullZone,
  checkHostnameSsl,
  loadFreeCertificate,
  purgePullZoneCache,
} from "./clients/bunnyManagement.js";
export {
  uploadStorageFile,
  listStorageFiles,
  deleteStoragePath,
  cleanStaleStorageFiles,
} from "./clients/bunnyStorage.js";
export { verifyDns, verifyLiveWebsite } from "./clients/dnsVerifier.js";
