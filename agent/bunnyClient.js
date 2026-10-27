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
export {
  DNS_RECORD_TYPES,
  DNS_TYPE_LABELS,
  getRecordTypeLabel,
  resolveRecordType,
  getDnsZones,
  getDnsZone,
  createDnsZone,
  ensureDnsZone,
  deleteDnsZone,
  addDnsRecord,
  updateDnsRecord,
  deleteDnsRecord,
  triggerDnsScan,
  getDnsScanResults,
  pollDnsScanResults,
  filterSafeMigrationRecords,
} from "./clients/bunnyDns.js";
