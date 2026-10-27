import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  subscribeOnlineStore,
  saveOnlineStore,
  generateSlug,
  checkSlugAvailability,
  cleanDomainName,
  isValidDomain,
  checkDomainAvailability,
  requestAttachCustomDomain,
  requestVerifyCustomDomain,
  requestRemoveCustomDomain,
  createDeploymentJob,
  subscribeDeploymentJob,
  subscribeAgentStatus,
  fetchDnsRecords,
  scanDnsRecords,
  importDnsRecords,
  createDnsRecord,
  deleteDnsRecord,
  batchDeleteDnsRecords,
  parseBulkDnsRecords,
} from "@/services/onlineStoreService";
import { uploadImage } from "@/services/cloudinary";
import { PRESET_THEME_COLORS } from "@/shared/themeTokens";

import { UnsavedChangesModal } from "@/features/dashboard/common";

import "./OnlineStoreSetupView.css";

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="5" r="2" />
      <circle cx="15" cy="5" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="9" cy="19" r="2" />
      <circle cx="15" cy="19" r="2" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 15l-6-6-6 6" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function GlobeIcon({ className = "" }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function LinkIcon({ className = "" }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function RocketIcon({ className = "" }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function TerminalIcon({ className = "" }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function RefreshCwIcon({ className = "" }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function TrashIcon({ className = "" }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function UploadIcon({ className = "" }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function FileCodeIcon({ className = "" }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 13-2 2 2 2" />
      <path d="m14 17 2-2-2-2" />
    </svg>
  );
}

function EyeIcon({ className = "" }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LayersIcon({ className = "" }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function PlusIcon({ className = "" }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ScanIcon({ className = "" }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  );
}

function ImportIcon({ className = "" }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export default function OnlineStoreSetupView({
  userId,
  categories = [],
  items = [],
  locations = [{ id: "loc-skipli", name: "Skipli" }],
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [toast, setToast] = useState(null);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  const [storeId, setStoreId] = useState(`store_${userId || "guest"}`);
  const [enabled, setEnabled] = useState(false);
  const [name, setName] = useState("Skipli");
  const [logoUrl, setLogoUrl] = useState(null);
  const [themeColor, setThemeColor] = useState("#E53E3E");
  const [slug, setSlug] = useState("skipli");
  const [originalSlug, setOriginalSlug] = useState("skipli");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [locationId, setLocationId] = useState("loc-skipli");
  const [categoryConfigs, setCategoryConfigs] = useState([]);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Custom Domain & Bunny Deployment State
  const [customDomain, setCustomDomain] = useState(null);
  const [deployment, setDeployment] = useState(null);
  const [linkMode, setLinkMode] = useState("slug"); // "slug" | "domain"
  const [domainInput, setDomainInput] = useState("");
  const [domainError, setDomainError] = useState("");
  const [isConnectingDomain, setIsConnectingDomain] = useState(false);
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const [isRemovingDomain, setIsRemovingDomain] = useState(false);
  const [agentStatus, setAgentStatus] = useState({ online: false, lastHeartbeat: 0, isSimulated: false, configSummary: null });
  const [dnsMethodTab, setDnsMethodTab] = useState("apex"); // "apex" (Bunny DNS Nameserver) | "cname" (Subdomain CNAME)
  const [activeDeploymentId, setActiveDeploymentId] = useState(null);
  const [deploymentJob, setDeploymentJob] = useState(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Interactive DNS Zone & Records State
  const [dnsRecords, setDnsRecords] = useState([]);
  const [isLoadingDnsRecords, setIsLoadingDnsRecords] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanningDns, setIsScanningDns] = useState(false);
  const [scannedRecordsData, setScannedRecordsData] = useState(null);
  const [selectedRecordIndexes, setSelectedRecordIndexes] = useState(new Set());
  const [isImportingDns, setIsImportingDns] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [customScanNs, setCustomScanNs] = useState("");
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [newRecordForm, setNewRecordForm] = useState({ type: 0, name: "", value: "", ttl: 300, priority: 10 });
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [deletingRecordId, setDeletingRecordId] = useState(null);
  const [selectedLiveRecordIds, setSelectedLiveRecordIds] = useState(new Set());
  const [isBatchDeletingLiveRecords, setIsBatchDeletingLiveRecords] = useState(false);

  // Deployment Mode: "storefront" | "landing"
  const [deployModeTab, setDeployModeTab] = useState("storefront");
  const [landingFile, setLandingFile] = useState(null); // { name, size, type, contentBase64, isZip, textPreview }
  const [landingError, setLandingError] = useState("");
  const [isLandingPreviewOpen, setIsLandingPreviewOpen] = useState(false);
  const landingFileInputRef = useRef(null);

  const fileInputRef = useRef(null);
  const dragItemIndex = useRef(null);
  const dragOverItemIndex = useRef(null);

  const getItemCount = useCallback(
    (cat) => {
      if (!items) return 0;
      return items.filter(
        (i) => i.categoryId === cat.id || i.category === cat.name || i.category === cat.id
      ).length;
    },
    [items]
  );

  useEffect(() => {
    let mounted = true;
    const { unsubscribe, firstPromise } = subscribeOnlineStore(
      userId,
      (storeData) => {
        if (!mounted || !storeData) return;
        setStoreId(storeData.id || `store_${userId || "guest"}`);
        setEnabled(Boolean(storeData.enabled));
        setName(storeData.name || "Skipli");
        setLogoUrl(storeData.logoUrl || null);
        setThemeColor(storeData.themeColor || "#E53E3E");
        setSlug(storeData.slug || "skipli");
        setOriginalSlug(storeData.slug || "skipli");
        setLocationId(storeData.locationId || "loc-skipli");
        setCustomDomain(storeData.customDomain || null);
        setDeployment(storeData.deployment || null);
        if (storeData.deployment?.mode === "LANDING_PAGE") {
          setDeployModeTab("landing");
        }

        if (storeData.deployment?.lastDeploymentId) {
          setActiveDeploymentId(storeData.deployment.lastDeploymentId);
        }

        const savedCatConfig = storeData.menu?.categories || {};
        const merged = (categories || []).map((cat, idx) => {
          const saved = savedCatConfig[cat.id];
          return {
            id: cat.id,
            name: cat.name,
            itemCount: getItemCount(cat),
            visible: saved ? Boolean(saved.visible) : true,
            order: saved && typeof saved.order === "number" ? saved.order : idx + 1000,
          };
        });

        merged.sort((a, b) => a.order - b.order);
        setCategoryConfigs(merged);
      },
      () => {
        if (mounted) setIsLoading(false);
      }
    );

    firstPromise.then(() => {
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [userId, categories, getItemCount]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Realtime subscription to Agent Status
  useEffect(() => {
    const unsub = subscribeAgentStatus((status) => {
      setAgentStatus(status || { online: false, lastHeartbeat: 0 });
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  // Realtime subscription to active deployment job
  useEffect(() => {
    if (!activeDeploymentId) return;
    const unsub = subscribeDeploymentJob(activeDeploymentId, (job) => {
      if (job) setDeploymentJob(job);
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [activeDeploymentId]);

  const handleConnectDomain = async () => {
    const cleaned = cleanDomainName(domainInput);
    if (!cleaned) {
      setDomainError("Please enter a domain name.");
      return;
    }
    if (!isValidDomain(cleaned)) {
      setDomainError("Please enter a valid domain format (e.g., shop.mybrand.com).");
      return;
    }

    setIsConnectingDomain(true);
    setDomainError("");

    try {
      const avail = await checkDomainAvailability(cleaned, storeId);
      if (!avail.available) {
        setDomainError(avail.reason);
        setIsConnectingDomain(false);
        return;
      }

      const targetCname = agentStatus?.configSummary?.cdnHostname || "yourstore.b-cdn.net";
      const { domainConfig } = await requestAttachCustomDomain(userId, storeId, cleaned, targetCname);
      setCustomDomain(domainConfig);
      setDomainInput("");
      setToast({
        message: `Domain ${cleaned} connected! Point your CNAME to ${targetCname}.`,
        type: "success",
      });
    } catch (err) {
      console.error("Domain attach error:", err);
      setDomainError(err.message || "Failed to attach domain.");
    } finally {
      setIsConnectingDomain(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!customDomain?.hostname) return;
    setIsVerifyingDomain(true);
    try {
      const result = await requestVerifyCustomDomain(userId, storeId, customDomain.hostname);
      if (result?.status) {
        setCustomDomain((prev) => (prev ? {
          ...prev,
          status: result.status,
          sslActive: result.sslActive ?? (result.status === "ACTIVE"),
          error: result.error || null,
        } : prev));
      }

      if (result?.status === "ACTIVE") {
        setToast({
          message: "Domain verified and active (HTTPS)! SSL certificate is live.",
          type: "success",
        });
      } else {
        setToast({
          message: "Verification job submitted! The agent is checking DNS and requesting SSL...",
          type: "info",
        });
      }
    } catch (err) {
      console.error("Domain verify error:", err);
      setToast({ message: "Verification request failed.", type: "error" });
    } finally {
      setTimeout(() => setIsVerifyingDomain(false), 1500);
    }
  };

  const handleRemoveDomain = async () => {
    if (!customDomain?.hostname) return;
    if (!window.confirm(`Are you sure you want to remove ${customDomain.hostname}?`)) return;

    setIsRemovingDomain(true);
    try {
      await requestRemoveCustomDomain(userId, storeId, customDomain.hostname);
      setCustomDomain(null);
      setToast({ message: "Custom domain removed successfully.", type: "success" });
    } catch (err) {
      console.error("Domain remove error:", err);
      setToast({ message: "Failed to remove domain.", type: "error" });
    } finally {
      setIsRemovingDomain(false);
    }
  };

  const loadDnsZoneRecords = useCallback(async (zoneId) => {
    if (!zoneId) return;
    setIsLoadingDnsRecords(true);
    try {
      const res = await fetchDnsRecords(zoneId);
      if (res.records) {
        setDnsRecords(res.records);
      }
    } catch (e) {
      console.warn("Could not load DNS records:", e.message);
    } finally {
      setIsLoadingDnsRecords(false);
    }
  }, []);

  useEffect(() => {
    if (customDomain?.zoneId) {
      loadDnsZoneRecords(customDomain.zoneId);
    } else {
      setDnsRecords([]);
    }
  }, [customDomain?.zoneId, loadDnsZoneRecords]);

  const handleTriggerScan = async (overrideNs = null) => {
    if (!customDomain) return;
    setIsScanModalOpen(true);
    setIsScanningDns(true);
    setScannedRecordsData(null);
    setSelectedRecordIndexes(new Set());

    const nsToQuery = overrideNs !== null ? overrideNs : customScanNs;

    try {
      const res = await scanDnsRecords(
        customDomain.zoneId,
        customDomain.rootDomain || customDomain.hostname,
        storeId,
        nsToQuery || null
      );
      setScannedRecordsData(res);
      const defaultSelected = new Set();
      (res.records || []).forEach((r, idx) => {
        if (r.selectedByDefault) {
          defaultSelected.add(idx);
        }
      });
      setSelectedRecordIndexes(defaultSelected);
    } catch (err) {
      console.error("DNS Scan error:", err);
      setToast({ message: `Quét bản ghi thất bại: ${err.message}`, type: "error" });
    } finally {
      setIsScanningDns(false);
    }
  };

  const handleConfirmBulkImport = async (recordsToImport) => {
    if (!customDomain?.zoneId || !recordsToImport || recordsToImport.length === 0) {
      setToast({ message: "Vui lòng chọn ít nhất 1 bản ghi để nhập.", type: "warning" });
      return;
    }
    setIsImportingDns(true);
    try {
      const res = await importDnsRecords(customDomain.zoneId, recordsToImport, storeId);
      setToast({
        message: `Đã nhập thành công ${res.importedCount} bản ghi vào Bunny DNS Zone!`,
        type: "success",
      });
      setIsBulkImportModalOpen(false);
      await loadDnsZoneRecords(customDomain.zoneId);
    } catch (err) {
      console.error("Bulk import records error:", err);
      setToast({ message: `Nhập bản ghi thất bại: ${err.message}`, type: "error" });
    } finally {
      setIsImportingDns(false);
    }
  };

  const handleToggleRecordSelect = (idx) => {
    setSelectedRecordIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleSelectAllSafe = () => {
    if (!scannedRecordsData?.records) return;
    const next = new Set();
    scannedRecordsData.records.forEach((r, idx) => {
      if (r.selectedByDefault) next.add(idx);
    });
    setSelectedRecordIndexes(next);
  };

  const handleSelectAllRecords = () => {
    if (!scannedRecordsData?.records) return;
    const next = new Set();
    scannedRecordsData.records.forEach((_, idx) => next.add(idx));
    setSelectedRecordIndexes(next);
  };

  const handleConfirmImport = async () => {
    if (!customDomain?.zoneId || !scannedRecordsData?.records) return;
    const selectedRecords = scannedRecordsData.records.filter((_, idx) =>
      selectedRecordIndexes.has(idx)
    );
    if (selectedRecords.length === 0) {
      setToast({ message: "Vui lòng chọn ít nhất 1 bản ghi để nhập.", type: "warning" });
      return;
    }

    setIsImportingDns(true);
    try {
      const res = await importDnsRecords(customDomain.zoneId, selectedRecords, storeId);
      setToast({
        message: `Đã nhập thành công ${res.importedCount} bản ghi vào Bunny DNS Zone!`,
        type: "success",
      });
      setIsScanModalOpen(false);
      await loadDnsZoneRecords(customDomain.zoneId);
    } catch (err) {
      console.error("Import records error:", err);
      setToast({ message: `Nhập bản ghi thất bại: ${err.message}`, type: "error" });
    } finally {
      setIsImportingDns(false);
    }
  };

  const handleSaveNewRecord = async (e) => {
    e.preventDefault();
    if (!customDomain?.zoneId) return;
    if (!newRecordForm.value.trim()) {
      setToast({ message: "Vui lòng nhập giá trị bản ghi.", type: "error" });
      return;
    }

    setIsSavingRecord(true);
    try {
      await createDnsRecord(customDomain.zoneId, {
        type: Number(newRecordForm.type),
        name: newRecordForm.name.trim(),
        value: newRecordForm.value.trim(),
        ttl: Number(newRecordForm.ttl) || 300,
        priority: Number(newRecordForm.priority) || 10,
      });
      setToast({ message: "Thêm bản ghi DNS thành công!", type: "success" });
      setIsAddRecordModalOpen(false);
      setNewRecordForm({ type: 0, name: "", value: "", ttl: 300, priority: 10 });
      await loadDnsZoneRecords(customDomain.zoneId);
    } catch (err) {
      console.error("Add record error:", err);
      setToast({ message: `Thêm bản ghi thất bại: ${err.message}`, type: "error" });
    } finally {
      setIsSavingRecord(false);
    }
  };

  const handleDeleteDnsRecord = async (recordId, recordName, isCore = false) => {
    if (!customDomain?.zoneId || !recordId) return;

    const confirmMsg = isCore
      ? `⚠️ CẢNH BÁO: Bản ghi '${recordName || "@"}' là bản ghi cốt lõi trỏ về Storefront. Nếu xóa, tên miền có thể tạm thời không truy cập được web store.\n\nBạn có chắc chắn muốn xóa bản ghi này TRỰC TIẾP trên Bunny DNS không?`
      : `Bạn có chắc chắn muốn xóa bản ghi '${recordName || "@"}' TRỰC TIẾP trên Bunny DNS không?`;

    if (!window.confirm(confirmMsg)) return;

    setDeletingRecordId(recordId);
    try {
      await deleteDnsRecord(customDomain.zoneId, recordId);
      setToast({ message: `Đã xóa bản ghi '${recordName || "@"}' trực tiếp trên Bunny DNS thành công.`, type: "success" });
      setSelectedLiveRecordIds((prev) => {
        const next = new Set(prev);
        next.delete(recordId);
        return next;
      });
      await loadDnsZoneRecords(customDomain.zoneId);
    } catch (err) {
      console.error("Delete record error:", err);
      setToast({ message: `Xóa bản ghi trên Bunny thất bại: ${err.message}`, type: "error" });
    } finally {
      setDeletingRecordId(null);
    }
  };

  const handleToggleLiveRecordSelect = (recordId) => {
    setSelectedLiveRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });
  };

  const handleToggleSelectAllLiveRecords = () => {
    if (selectedLiveRecordIds.size === dnsRecords.length) {
      setSelectedLiveRecordIds(new Set());
    } else {
      const allIds = new Set(dnsRecords.map((r) => r.Id).filter(Boolean));
      setSelectedLiveRecordIds(allIds);
    }
  };

  const handleBatchDeleteLiveRecords = async () => {
    if (!customDomain?.zoneId || selectedLiveRecordIds.size === 0) return;
    const count = selectedLiveRecordIds.size;
    const confirmMsg = `⚠️ Bạn có chắc chắn muốn xóa ${count} bản ghi đã chọn TRỰC TIẾP trên Bunny DNS không?\n\nThao tác này sẽ xóa vĩnh viễn dữ liệu trên hệ thống Bunny.net.`;
    if (!window.confirm(confirmMsg)) return;

    setIsBatchDeletingLiveRecords(true);
    try {
      const res = await batchDeleteDnsRecords(customDomain.zoneId, Array.from(selectedLiveRecordIds));
      setToast({
        message: `Đã xóa thành công ${res.deletedCount} bản ghi trực tiếp trên Bunny DNS!`,
        type: "success",
      });
      setSelectedLiveRecordIds(new Set());
      await loadDnsZoneRecords(customDomain.zoneId);
    } catch (err) {
      console.error("Batch delete records error:", err);
      setToast({ message: `Xóa hàng loạt trên Bunny thất bại: ${err.message}`, type: "error" });
    } finally {
      setIsBatchDeletingLiveRecords(false);
    }
  };

  const handleLandingFileSelect = (file) => {
    if (!file) return;
    setLandingError("");

    const lowerName = file.name.toLowerCase();
    const isHtml = lowerName.endsWith(".html") || lowerName.endsWith(".htm");
    const isZip = lowerName.endsWith(".zip");

    if (!isHtml && !isZip) {
      setLandingError("Please select a valid .html file or .zip archive.");
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setLandingError("File size exceeds 30 MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64 = dataUrl.split(",")[1];

      if (isHtml) {
        const textReader = new FileReader();
        textReader.onload = (te) => {
          setLandingFile({
            name: file.name,
            size: file.size,
            type: file.type || "text/html",
            contentBase64: base64,
            isZip: false,
            textPreview: te.target.result,
          });
        };
        textReader.readAsText(file);
      } else {
        setLandingFile({
          name: file.name,
          size: file.size,
          type: file.type || "application/zip",
          contentBase64: base64,
          isZip: true,
          textPreview: null,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerDeploy = async (overrideMode) => {
    const activeMode =
      overrideMode || (deployModeTab === "landing" ? "LANDING_PAGE" : "STOREFRONT");

    if (activeMode === "LANDING_PAGE" && !landingFile) {
      setLandingError("Please select an HTML file or ZIP archive to deploy.");
      return;
    }

    setIsDeploying(true);
    try {
      const deployOptions = {
        mode: activeMode,
        purgeCache: true,
        verifyCdn: true,
      };

      if (activeMode === "LANDING_PAGE") {
        deployOptions.landingFile = {
          name: landingFile.name,
          size: landingFile.size,
          type: landingFile.type,
          contentBase64: landingFile.contentBase64,
          isZip: landingFile.isZip,
        };
      }

      const job = await createDeploymentJob(userId, storeId, deployOptions);
      setActiveDeploymentId(job.id);
      setDeploymentJob(job);
      setIsDeployModalOpen(true);
      setToast({
        message:
          activeMode === "LANDING_PAGE"
            ? `Landing page upload queued (${landingFile.name})!`
            : "Storefront build & deployment queued!",
        type: "success",
      });
    } catch (err) {
      console.error("Deploy trigger error:", err);
      setToast({ message: "Failed to create deployment job.", type: "error" });
    } finally {
      setIsDeploying(false);
    }
  };

  const renderDomainStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <span className="sq-badge-active">🔒 Active (HTTPS)</span>;
      case "PENDING_SSL":
        return <span className="sq-badge-ssl">⏳ Issuing SSL...</span>;
      case "FAILED":
        return <span className="sq-badge-failed">⚠️ Error</span>;
      case "PENDING_DNS":
      default:
        return <span className="sq-badge-dns">⏳ Pending DNS</span>;
    }
  };

  const handleNameChange = (val) => {
    setName(val);
    setIsDirty(true);
    if (!slugManuallyEdited) {
      const suggested = generateSlug(val);
      setSlug(suggested);
      validateSlugInput(suggested);
    }
  };

  const handleSlugChange = (rawVal) => {
    const cleaned = rawVal.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(cleaned);
    setSlugManuallyEdited(true);
    setIsDirty(true);
    validateSlugInput(cleaned);
  };

  const validateSlugInput = async (val) => {
    if (!val) {
      setSlugError("Store link cannot be empty.");
      return;
    }
    const res = await checkSlugAvailability(val, storeId);
    if (!res.available) {
      setSlugError(res.reason || "This link is unavailable.");
    } else {
      setSlugError("");
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const result = await uploadImage(file, { folder: "square_store_logos" });
      setLogoUrl(result.url);
      setIsDirty(true);
      setToast({ message: "Store logo uploaded successfully to Cloudinary!", type: "success" });
    } catch (err) {
      console.warn("Cloudinary upload failed, using local canvas fallback:", err);
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 300;
          let w = img.width;
          let h = img.height;

          if (w > h) {
            if (w > MAX_SIZE) {
              h = Math.round((h * MAX_SIZE) / w);
              w = MAX_SIZE;
            }
          } else {
            if (h > MAX_SIZE) {
              w = Math.round((w * MAX_SIZE) / h);
              h = MAX_SIZE;
            }
          }

          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/png");

          setLogoUrl(dataUrl);
          setIsDirty(true);
        };
        img.src = loadEvt.target.result;
      };
      reader.readAsDataURL(file);

      const isPresetErr = err?.message && err.message.includes("Unsigned");
      setToast({
        message: isPresetErr
          ? err.message
          : "Cloudinary upload error. Saved locally instead.",
        type: "error",
      });
    } finally {
      setIsUploadingLogo(false);
      e.target.value = null;
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    setIsDirty(true);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/store/${slug}`;
    navigator.clipboard.writeText(url).then(
      () => setToast({ message: "Store link copied to clipboard!", type: "success" }),
      () => setToast({ message: "Could not copy link", type: "error" })
    );
  };

  const handlePreviewStore = () => {
    const url = `${window.location.origin}/store/${slug}`;
    window.open(url, "_blank");
  };

  const handleToggleCategoryVisible = (catId) => {
    setCategoryConfigs((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, visible: !c.visible } : c))
    );
    setIsDirty(true);
  };

  const handleMoveCategory = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categoryConfigs.length) return;

    const updated = [...categoryConfigs];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    const reordered = updated.map((c, i) => ({ ...c, order: i }));
    setCategoryConfigs(reordered);
    setIsDirty(true);
  };

  const handleDragStart = (e, index) => {
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (e, index) => {
    dragOverItemIndex.current = index;
    e.preventDefault();
  };

  const handleDragEnd = () => {
    const fromIndex = dragItemIndex.current;
    const toIndex = dragOverItemIndex.current;

    if (fromIndex !== null && toIndex !== null && fromIndex !== toIndex) {
      const updated = [...categoryConfigs];
      const [item] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, item);

      const reordered = updated.map((c, i) => ({ ...c, order: i }));
      setCategoryConfigs(reordered);
      setIsDirty(true);
    }

    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (!name.trim()) {
      setToast({ message: "Store name is required.", type: "error" });
      return;
    }

    const cleanSlug = generateSlug(slug);
    if (!cleanSlug) {
      setToast({ message: "Please enter a valid store link.", type: "error" });
      return;
    }

    setIsSaving(true);

    try {

      const avail = await checkSlugAvailability(cleanSlug, storeId);
      if (!avail.available) {
        setSlugError(avail.reason);
        setToast({ message: avail.reason || "Store link taken", type: "error" });
        setIsSaving(false);
        return;
      }

      const categoriesMap = {};
      categoryConfigs.forEach((c, idx) => {
        categoriesMap[c.id] = {
          visible: Boolean(c.visible),
          order: idx,
        };
      });

      const payload = {
        id: storeId,
        name: name.trim(),
        slug: cleanSlug,
        logoUrl,
        themeColor: themeColor || "#E53E3E",
        locationId,
        enabled,
        customDomain,
        deployment,
        menu: {
          categories: categoriesMap,
        },
      };


      await saveOnlineStore(userId, payload, originalSlug);

      setOriginalSlug(cleanSlug);
      setIsDirty(false);
      setToast({ message: "Store setup saved successfully!", type: "success" });
    } catch (err) {
      console.error("Failed to save store setup:", err);
      setToast({ message: "Failed to save changes. Please try again.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="sq-store-setup-container">
        <div className="sq-setup-skeleton-header sf-skeleton-shimmer" />
        <div className="sq-setup-skeleton-card sf-skeleton-shimmer" />
        <div className="sq-setup-skeleton-card sf-skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="sq-store-setup-container">
      <div className="sq-store-setup-header">
        <div className="sq-store-setup-header-left">
          <h1 className="sq-store-setup-title">Store setup</h1>
          <p className="sq-store-setup-subtitle">
            Configure your online ordering storefront, branding, and category display.
          </p>
        </div>

        <button
          type="button"
          className="sq-store-setup-save-btn"
          onClick={handleSave}
          disabled={isSaving || !isDirty || Boolean(slugError)}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="sq-store-setup-card">
        <h2 className="sq-setup-section-title">Store status</h2>
        <p className="sq-setup-section-desc">
          Control customer ordering availability on your storefront.
        </p>

        <div className="sq-setup-toggle-row">
          <div className="sq-setup-toggle-info">
            <span className="sq-setup-toggle-label">Accept online orders</span>
            <span className="sq-setup-toggle-subtext">
              {enabled
                ? "Store is open and accepting online customer orders."
                : "Store is currently closed. Customers will see 'This store is currently closed'."}
            </span>
          </div>

          <label className="sq-switch" aria-label="Toggle accept online orders">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => {
                setEnabled(e.target.checked);
                setIsDirty(true);
              }}
            />
            <span className="sq-switch-slider" />
          </label>
        </div>
      </div>

      <div className="sq-store-setup-card">
        <h2 className="sq-setup-section-title">Store info</h2>
        <p className="sq-setup-section-desc">
          Set up your branding, link URL, and order location.
        </p>

        <div className="sq-setup-field-group">
          <label className="sq-setup-label" htmlFor="sq-store-name-input">
            Store name <span className="sq-setup-label-req">*</span>
          </label>
          <input
            id="sq-store-name-input"
            type="text"
            className="sq-setup-input"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Skipli"
            required
          />
        </div>

        <div className="sq-setup-field-group">
          <label className="sq-setup-label">Logo</label>
          <div className="sq-logo-upload-box">
            <div className="sq-logo-preview-wrapper">
              {logoUrl ? (
                <img src={logoUrl} alt="Store logo" className="sq-logo-preview-img" />
              ) : (
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>NO LOGO</span>
              )}
            </div>

            <div className="sq-logo-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleLogoUpload}
              />
              <button
                type="button"
                className="sq-btn-upload"
                disabled={isUploadingLogo}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingLogo ? "Uploading..." : logoUrl ? "Change logo" : "Upload logo"}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  className="sq-btn-remove-logo"
                  onClick={handleRemoveLogo}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <p className="sq-setup-hint">
            If no logo is uploaded, your store name will be displayed in brand red in the storefront header.
          </p>
        </div>

        {/* Store Link & Custom Domain Hub */}
        <div className="sq-setup-field-group sq-domain-hub-group">
          <div className="sq-domain-header-row">
            <div>
              <label className="sq-setup-label" htmlFor="sq-store-slug-input">
                Store Link & Custom Domain <span className="sq-setup-label-req">*</span>
              </label>
              <p className="sq-setup-hint">
                Serve your online storefront via your default store slug or attach a custom branded domain with Bunny CDN.
              </p>
            </div>
            <div
              className="sq-agent-badge"
              title={
                agentStatus.online
                  ? agentStatus.isSimulated
                    ? "Agent running in simulation mode (UI testing)"
                    : "Local agent online and connected to Bunny API"
                  : "Agent offline. Start it in terminal with 'npm run agent'"
              }
            >
              <span className={`sq-agent-dot ${agentStatus.online ? "online" : "offline"}`} />
              <span>
                {agentStatus.online
                  ? agentStatus.isSimulated
                    ? "Agent (Simulated)"
                    : "Agent Connected"
                  : "Agent Offline"}
              </span>
            </div>
          </div>

          {/* Tab Switcher: Standard Link vs Custom Domain */}
          <div className="sq-link-tabs">
            <button
              type="button"
              className={`sq-link-tab ${linkMode === "slug" ? "active" : ""}`}
              onClick={() => setLinkMode("slug")}
            >
              <LinkIcon /> Standard Link (/store/{slug})
            </button>
            <button
              type="button"
              className={`sq-link-tab ${linkMode === "domain" ? "active" : ""}`}
              onClick={() => setLinkMode("domain")}
            >
              <GlobeIcon /> Custom Domain {customDomain ? `(${customDomain.hostname})` : ""}
            </button>
          </div>

          {/* TAB 1: SLUG LINK */}
          {linkMode === "slug" && (
            <div className="sq-tab-content-panel">
              <div className="sq-slug-input-wrapper">
                <span className="sq-slug-prefix">{window.location.origin}/store/</span>
                <input
                  id="sq-store-slug-input"
                  type="text"
                  className="sq-slug-field"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="skipli"
                />
              </div>

              {slugError && <div className="sq-slug-error">{slugError}</div>}

              <div className="sq-slug-actions">
                <button
                  type="button"
                  className="sq-btn-slug-action"
                  onClick={handleCopyLink}
                  title="Copy link to clipboard"
                >
                  <CopyIcon /> Copy link
                </button>
                <button
                  type="button"
                  className="sq-btn-slug-action"
                  onClick={handlePreviewStore}
                  title="Preview store in a new browser tab"
                >
                  <ExternalLinkIcon /> Preview store
                </button>
              </div>
              <p className="sq-setup-hint">
                Only lowercase letters, numbers, and hyphens [a-z0-9-] are allowed.
              </p>
            </div>
          )}

          {/* TAB 2: CUSTOM DOMAIN */}
          {linkMode === "domain" && (
            <div className="sq-tab-content-panel">
              {!customDomain ? (
                /* Connect Domain Form */
                <div className="sq-domain-connect-form">
                  <div className="sq-domain-input-row">
                    <div className="sq-domain-input-wrapper">
                      <span className="sq-domain-prefix">https://</span>
                      <input
                        type="text"
                        className="sq-domain-input"
                        placeholder="shop.yourbrand.com"
                        value={domainInput}
                        onChange={(e) => {
                          setDomainInput(e.target.value);
                          setDomainError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleConnectDomain();
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="sq-btn-connect-domain"
                      onClick={handleConnectDomain}
                      disabled={isConnectingDomain || !domainInput.trim()}
                    >
                      {isConnectingDomain ? "Connecting..." : "Connect Domain"}
                    </button>
                  </div>

                  {domainError && <div className="sq-slug-error">{domainError}</div>}

                  <div className="sq-domain-info-box">
                    <h4>💡 How Custom Domains work with Bunny CDN:</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                      <div>
                        <strong>🌐 Lựa chọn 1: Gắn Tên Miền Gốc (@) qua Bunny DNS (Khuyên dùng)</strong>
                        <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                          Đổi Nameservers sang <code>kiki.bunny.net</code> & <code>coco.bunny.net</code>. Bunny DNS có tính năng độc quyền là <strong>Bản ghi Pull Zone (PZ Record)</strong> giúp trỏ trực tiếp domain gốc <code>@</code> vào web store.
                        </p>
                      </div>
                      <div>
                        <strong>🔗 Lựa chọn 2: Gắn Subdomain qua CNAME</strong>
                        <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                          Giữ nguyên Nameserver hiện tại, chỉ cần tạo bản ghi CNAME cho <code>www</code> trỏ về <code>{agentStatus.configSummary?.cdnHostname || "yourstore.b-cdn.net"}</code>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Connected Domain Card */
                <div className="sq-domain-card">
                  <div className="sq-domain-card-header">
                    <div className="sq-domain-card-left">
                      <GlobeIcon className="sq-domain-globe-icon" />
                      <div>
                        <div className="sq-domain-name">https://{customDomain.hostname}</div>
                        <div className="sq-domain-target">
                          CNAME Target:{" "}
                          <code>
                            {customDomain.targetCname ||
                              agentStatus.configSummary?.cdnHostname ||
                              "yourstore.b-cdn.net"}
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className="sq-domain-badge-wrapper">
                      {renderDomainStatusBadge(customDomain.status)}
                    </div>
                  </div>

                  {/* DNS Instructions Card */}
                  <div className="sq-dns-instructions-card">
                    <div className="sq-dns-instructions-title" style={{ marginBottom: "12px" }}>
                      Hướng Dẫn Cấu Hình DNS Tên Miền
                    </div>

                    {/* Method Tabs */}
                    <div className="sq-link-tabs" style={{ marginBottom: "14px" }}>
                      <button
                        type="button"
                        className={`sq-link-tab ${dnsMethodTab === "apex" ? "active" : ""}`}
                        onClick={() => setDnsMethodTab("apex")}
                      >
                        🌐 Lựa chọn 1: Gắn Domain Gốc (Bunny DNS - Khuyên dùng)
                      </button>
                      <button
                        type="button"
                        className={`sq-link-tab ${dnsMethodTab === "cname" ? "active" : ""}`}
                        onClick={() => setDnsMethodTab("cname")}
                      >
                        🔗 Lựa chọn 2: Gắn Subdomain (CNAME)
                      </button>
                    </div>

                    {dnsMethodTab === "apex" ? (
                      <div className="sq-dns-method-content">
                        {/* Bước 1 */}
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b", marginBottom: "6px" }}>
                          Bước 1: Đổi 2 Nameservers tại nhà đăng ký tên miền (GoDaddy, Namecheap...) trỏ về Bunny DNS:
                        </div>

                        <div className="sq-dns-table" style={{ marginBottom: "14px" }}>
                          <div className="sq-dns-row sq-dns-head">
                            <span>Loại</span>
                            <span>Bản ghi</span>
                            <span>Địa chỉ Nameserver</span>
                            <span>Thao tác</span>
                          </div>
                          <div className="sq-dns-row">
                            <span className="sq-dns-cell-type">NS 1</span>
                            <span className="sq-dns-cell-host">Nameserver chính</span>
                            <span className="sq-dns-cell-target">
                              <code>{customDomain.nameservers?.[0] || "kiki.bunny.net"}</code>
                            </span>
                            <span>
                              <button
                                type="button"
                                className="sq-btn-mini-copy"
                                onClick={() => {
                                  const ns1 = customDomain.nameservers?.[0] || "kiki.bunny.net";
                                  navigator.clipboard.writeText(ns1);
                                  setToast({ message: `Đã copy Nameserver 1 (${ns1})!`, type: "success" });
                                }}
                                title="Copy Nameserver 1"
                              >
                                <CopyIcon /> Copy
                              </button>
                            </span>
                          </div>
                          <div className="sq-dns-row">
                            <span className="sq-dns-cell-type">NS 2</span>
                            <span className="sq-dns-cell-host">Nameserver phụ</span>
                            <span className="sq-dns-cell-target">
                              <code>{customDomain.nameservers?.[1] || "coco.bunny.net"}</code>
                            </span>
                            <span>
                              <button
                                type="button"
                                className="sq-btn-mini-copy"
                                onClick={() => {
                                  const ns2 = customDomain.nameservers?.[1] || "coco.bunny.net";
                                  navigator.clipboard.writeText(ns2);
                                  setToast({ message: `Đã copy Nameserver 2 (${ns2})!`, type: "success" });
                                }}
                                title="Copy Nameserver 2"
                              >
                                <CopyIcon /> Copy
                              </button>
                            </span>
                          </div>
                        </div>

                        {/* Interactive Bunny DNS Zone Manager */}
                        <div className="sq-dns-manager-container">
                          <div className="sq-dns-manager-top">
                            <div className="sq-dns-manager-title-group">
                              <span className="sq-dns-manager-title">
                                🛠️ Bản ghi DNS Zone
                              </span>
                              {customDomain.zoneId && (
                                <span className="sq-dns-zone-tag">
                                  Zone #{customDomain.zoneId}
                                </span>
                              )}
                            </div>

                            <div className="sq-dns-manager-actions">
                              <button
                                type="button"
                                className="sq-btn-dns-scan"
                                onClick={() => handleTriggerScan()}
                                title="Quét tự động và nhập bản ghi từ nhà đăng ký tên miền cũ (Mắt Bão, Tenten...)"
                              >
                                <ScanIcon /> Quét từ Host cũ
                              </button>
                              <button
                                type="button"
                                className="sq-btn-dns-bulk"
                                onClick={() => setIsBulkImportModalOpen(true)}
                                title="Nhập hàng loạt nhiều bản ghi DNS (dạng BIND zone, copy bảng từ host cũ, hoặc JSON)"
                              >
                                <ImportIcon /> Nhập hàng loạt
                              </button>
                              <button
                                type="button"
                                className="sq-btn-dns-add"
                                onClick={() => setIsAddRecordModalOpen(true)}
                                title="Thêm từng bản ghi DNS thủ công"
                              >
                                <PlusIcon /> Thêm bản ghi
                              </button>
                              <button
                                type="button"
                                className="sq-btn-dns-refresh"
                                onClick={() => customDomain.zoneId && loadDnsZoneRecords(customDomain.zoneId)}
                                disabled={isLoadingDnsRecords}
                                title="Làm mới danh sách bản ghi"
                              >
                                <RefreshCwIcon className={isLoadingDnsRecords ? "sq-spin" : ""} />
                              </button>
                            </div>
                          </div>
                          {/* 
                          <p className="sq-dns-manager-note">
                            Hệ thống đã tự động liên kết tên miền với Bunny DNS Zone và cấu hình sẵn bản ghi trỏ về Storefront. Bạn có thể xem, thêm hoặc nhập lại bản ghi Email (MX) / TXT từ nhà đăng ký cũ dưới đây:
                          </p> */}

                          {/* Batch Action Toolbar for Live DNS Table */}
                          {selectedLiveRecordIds.size > 0 && (
                            <div className="sq-dns-live-batch-bar">
                              <span className="sq-dns-live-batch-count">
                                Đã chọn <strong>{selectedLiveRecordIds.size}</strong> bản ghi trong DNS Zone.
                              </span>
                              <div className="sq-dns-live-batch-actions">
                                <button
                                  type="button"
                                  className="sq-btn-batch-delete-danger"
                                  onClick={handleBatchDeleteLiveRecords}
                                  disabled={isBatchDeletingLiveRecords}
                                >
                                  {isBatchDeletingLiveRecords ? (
                                    <>
                                      <RefreshCwIcon className="sq-spin" /> Đang xóa trên Bunny...
                                    </>
                                  ) : (
                                    <>
                                      <TrashIcon /> Xóa {selectedLiveRecordIds.size} bản ghi trên Bunny
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="sq-btn-batch-cancel"
                                  onClick={() => setSelectedLiveRecordIds(new Set())}
                                  disabled={isBatchDeletingLiveRecords}
                                >
                                  Bỏ chọn
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Live Records Table */}
                          <div className="sq-dns-table sq-dns-records-live-table">
                            <div className="sq-dns-row sq-dns-head">
                              <span style={{ width: 40, flex: "none", textAlign: "center" }}>
                                <input
                                  type="checkbox"
                                  checked={dnsRecords.length > 0 && selectedLiveRecordIds.size === dnsRecords.length}
                                  onChange={handleToggleSelectAllLiveRecords}
                                  title="Chọn tất cả bản ghi"
                                  disabled={dnsRecords.length === 0}
                                />
                              </span>
                              <span style={{ width: 90, flex: "none" }}>Loại</span>
                              <span style={{ width: 140, flex: "none" }}>Tên (Host)</span>
                              <span style={{ flex: 1 }}>Giá trị / Đích đến</span>
                              <span style={{ width: 70, flex: "none" }}>TTL</span>
                              <span style={{ width: 110, flex: "none", textAlign: "right" }}>Thao tác</span>
                            </div>

                            {isLoadingDnsRecords ? (
                              <div className="sq-dns-records-loading">
                                <span>Đang tải các bản ghi DNS Zone từ Bunny...</span>
                              </div>
                            ) : dnsRecords.length === 0 ? (
                              <div className="sq-dns-records-empty">
                                <span>Chưa có bản ghi nào trong DNS Zone. Bấm "Quét từ Host cũ", "Nhập hàng loạt" hoặc "Thêm bản ghi" để bắt đầu.</span>
                              </div>
                            ) : (
                              dnsRecords.map((rec, idx) => {
                                const isCoreRecord = rec.Type === 7 || (rec.Type === 2 && rec.Name === "www");
                                const isDeleting = deletingRecordId === rec.Id;
                                const isChecked = selectedLiveRecordIds.has(rec.Id);

                                return (
                                  <div key={rec.Id || idx} className={`sq-dns-row ${isChecked ? "sq-dns-row--selected" : ""}`}>
                                    <span style={{ width: 40, flex: "none", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleToggleLiveRecordSelect(rec.Id)}
                                        disabled={isDeleting || isBatchDeletingLiveRecords}
                                      />
                                    </span>
                                    <span style={{ width: 90, flex: "none" }} className="sq-dns-cell-type">
                                      <span className={`sq-dns-type-badge type-${rec.Type}`}>
                                        {rec.typeLabel || (rec.Type === 7 ? "PZ (PullZone)" : rec.Type === 8 ? "SRV" : rec.Type === 2 ? "CNAME" : rec.Type === 0 ? "A" : rec.Type === 4 ? "MX" : "TXT")}
                                      </span>
                                    </span>
                                    <span style={{ width: 140, flex: "none" }} className="sq-dns-cell-host">
                                      <code>{rec.Name || "@"}</code>
                                    </span>
                                    <span style={{ flex: 1 }} className="sq-dns-cell-target">
                                      {rec.Type === 7 ? (
                                        <span className="sq-dns-pz-val">
                                          🎯 Pull Zone #{rec.PullZoneId || agentStatus?.configSummary?.pullZoneId || "Store"} (Square CDN)
                                        </span>
                                      ) : rec.Type === 8 ? (
                                        <span className="sq-dns-val-text" title={rec.Value}>
                                          🎯 Port {rec.Port || 0} (Pri {rec.Priority || 0}, Wgt {rec.Weight || 0}) ➔ {rec.Value}
                                        </span>
                                      ) : (
                                        <span className="sq-dns-val-text" title={rec.Value}>
                                          {rec.Value}
                                          {rec.Priority ? ` (Priority ${rec.Priority})` : ""}
                                        </span>
                                      )}
                                    </span>
                                    <span style={{ width: 70, flex: "none" }} className="sq-dns-cell-ttl">
                                      {rec.Ttl || 300}s
                                    </span>
                                    <span
                                      style={{
                                        width: 110,
                                        flex: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                        gap: "6px",
                                      }}
                                      className="sq-dns-cell-actions"
                                    >
                                      {isCoreRecord && (
                                        <span className="sq-dns-core-tag" title="Bản ghi trỏ Storefront hệ thống">
                                          Cốt lõi
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        className="sq-btn-delete-record"
                                        onClick={() => handleDeleteDnsRecord(rec.Id, rec.Name, isCoreRecord)}
                                        disabled={isDeleting || isBatchDeletingLiveRecords}
                                        title={isCoreRecord ? "Xóa bản ghi này trực tiếp trên Bunny DNS" : "Xóa bản ghi này trên Bunny DNS"}
                                      >
                                        {isDeleting ? <RefreshCwIcon className="sq-spin" /> : <TrashIcon />}
                                      </button>
                                    </span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="sq-dns-method-content">
                        <div style={{ fontSize: "13px", color: "#334155", marginBottom: "8px" }}>
                          Dành cho trường hợp bạn muốn giữ nguyên DNS tại nhà đăng ký hiện tại (ví dụ đang dùng email công ty):
                        </div>
                        <div className="sq-dns-table">
                          <div className="sq-dns-row sq-dns-head">
                            <span>Type</span>
                            <span>Name / Host</span>
                            <span>Value / Target</span>
                            <span>Status</span>
                          </div>
                          <div className="sq-dns-row">
                            <span className="sq-dns-cell-type">CNAME</span>
                            <span className="sq-dns-cell-host">
                              <code>www</code>
                              <button
                                type="button"
                                className="sq-btn-mini-copy"
                                onClick={() => {
                                  navigator.clipboard.writeText("www");
                                  setToast({ message: "Host 'www' copied!", type: "success" });
                                }}
                                title="Copy Host (www)"
                              >
                                <CopyIcon />
                              </button>
                            </span>
                            <span className="sq-dns-cell-target">
                              {customDomain.targetCname || "yourstore.b-cdn.net"}
                              <button
                                type="button"
                                className="sq-btn-mini-copy"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    customDomain.targetCname || "yourstore.b-cdn.net"
                                  );
                                  setToast({ message: "CNAME target copied!", type: "success" });
                                }}
                                title="Copy CNAME target"
                              >
                                <CopyIcon />
                              </button>
                            </span>
                            <span className="sq-dns-cell-status">
                              {customDomain.status === "ACTIVE" ? "✅ Verified" : "⏳ Pending"}
                            </span>
                          </div>
                        </div>

                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px", lineHeight: "1.5" }}>
                          💡 <strong>Lưu ý:</strong> Tại nhà cung cấp tên miền (GoDaddy, Cloudflare, Namecheap...), ở cột <strong>Name / Host</strong> bạn chỉ cần nhập <code>www</code> (hệ thống sẽ tự nhận diện là <code>www.{customDomain.hostname?.replace(/^www\./, "")}</code>, không nhập cả tên miền để tránh bị lặp tên miền).
                        </div>
                      </div>
                    )}

                    {customDomain.error && (
                      <div className="sq-domain-error-callout" style={{ marginTop: "12px" }}>
                        ⚠️ {customDomain.error}
                      </div>
                    )}
                  </div>

                  {/* Domain Action Buttons */}
                  <div className="sq-domain-actions-row">
                    <button
                      type="button"
                      className="sq-btn-verify-domain"
                      onClick={handleVerifyDomain}
                      disabled={isVerifyingDomain}
                    >
                      <RefreshCwIcon className={isVerifyingDomain ? "sq-spin" : ""} />
                      {isVerifyingDomain ? "Verifying..." : "Verify DNS & SSL"}
                    </button>

                    {customDomain.status === "ACTIVE" && (
                      <button
                        type="button"
                        className="sq-btn-visit-domain"
                        onClick={() => window.open(`https://${customDomain.hostname}`, "_blank")}
                      >
                        <ExternalLinkIcon /> Visit Domain
                      </button>
                    )}

                    <button
                      type="button"
                      className="sq-btn-remove-domain"
                      onClick={handleRemoveDomain}
                      disabled={isRemovingDomain}
                      title="Remove custom domain"
                    >
                      <TrashIcon /> Remove Domain
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BUNNY CDN DEPLOYMENT HUB */}
          <div className="sq-bunny-deploy-card">
            <div className="sq-bunny-deploy-header">
              <div className="sq-bunny-deploy-title-group">
                <RocketIcon />
                <div>
                  <div className="sq-bunny-deploy-title">Bunny CDN Deployment Hub</div>
                  <div className="sq-bunny-deploy-desc">
                    Deploy your full online storefront or upload a custom HTML landing page directly to Bunny Storage.
                  </div>
                </div>
              </div>

              {/* Live Status Tag */}
              {deployment?.status === "SUCCEEDED" && (
                <div
                  className={`sq-deploy-current-mode-tag ${deployment.mode === "LANDING_PAGE" ? "landing" : "storefront"
                    }`}
                  title={
                    deployment.mode === "LANDING_PAGE"
                      ? `Currently serving Landing Page: ${deployment.landingFile?.name || "HTML"}`
                      : "Currently serving Full React Storefront"
                  }
                >
                  <span className="sq-deploy-mode-dot" />
                  {deployment.mode === "LANDING_PAGE"
                    ? `Live: Landing Page (${deployment.landingFile?.name || "HTML"})`
                    : "Live: Storefront App"}
                </div>
              )}
            </div>

            {/* Mode Selector Tabs */}
            <div className="sq-deploy-mode-selector">
              <button
                type="button"
                className={`sq-deploy-mode-btn ${deployModeTab === "storefront" ? "active" : ""}`}
                onClick={() => setDeployModeTab("storefront")}
              >
                <LayersIcon /> Full Storefront (React App)
              </button>
              <button
                type="button"
                className={`sq-deploy-mode-btn ${deployModeTab === "landing" ? "active" : ""}`}
                onClick={() => setDeployModeTab("landing")}
              >
                <FileCodeIcon /> Custom Landing Page (HTML / ZIP)
              </button>
            </div>

            {/* TAB 1: STOREFRONT */}
            {deployModeTab === "storefront" && (
              <div className="sq-deploy-mode-content">
                <p className="sq-deploy-tab-hint">
                  Build production static files (`npm run build`) and upload all application assets to your Bunny Storage Zone with automated cache purge.
                </p>

                <div className="sq-deploy-actions-row">
                  <button
                    type="button"
                    className="sq-btn-deploy-bunny"
                    onClick={() => handleTriggerDeploy("STOREFRONT")}
                    disabled={
                      isDeploying ||
                      (deploymentJob &&
                        (deploymentJob.status === "QUEUED" ||
                          deploymentJob.status === "BUILDING" ||
                          deploymentJob.status === "UPLOADING"))
                    }
                  >
                    <RocketIcon />{" "}
                    {isDeploying
                      ? "Starting..."
                      : deploymentJob?.status === "BUILDING" ||
                        deploymentJob?.status === "UPLOADING"
                        ? "Deploying..."
                        : "Build & Deploy Storefront"}
                  </button>

                  {deploymentJob && (
                    <button
                      type="button"
                      className="sq-btn-view-logs"
                      onClick={() => setIsDeployModalOpen(true)}
                    >
                      <TerminalIcon /> View Console
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: LANDING PAGE UPLOAD */}
            {deployModeTab === "landing" && (
              <div className="sq-deploy-mode-content">
                <p className="sq-deploy-tab-hint">
                  Upload an independent <code>index.html</code> landing page or a <code>.zip</code> package (with images, CSS & JS) to display at this custom domain.
                </p>

                {/* Dropzone / Upload Box */}
                {!landingFile ? (
                  <div
                    className="sq-landing-dropzone"
                    onClick={() => landingFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleLandingFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    <input
                      type="file"
                      ref={landingFileInputRef}
                      style={{ display: "none" }}
                      accept=".html,.htm,.zip"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleLandingFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="sq-landing-dropzone-icon">
                      <UploadIcon />
                    </div>
                    <div className="sq-landing-dropzone-title">
                      Click to choose or drag & drop landing page
                    </div>
                    <div className="sq-landing-dropzone-sub">
                      Supports standalone <strong>.html</strong> file or <strong>.zip</strong> archive (up to 30 MB)
                    </div>
                  </div>
                ) : (
                  <div className="sq-landing-file-card">
                    <div className="sq-landing-file-left">
                      <div className="sq-landing-file-avatar">
                        <FileCodeIcon />
                      </div>
                      <div>
                        <div className="sq-landing-file-name">{landingFile.name}</div>
                        <div className="sq-landing-file-meta">
                          {landingFile.isZip ? "ZIP Package" : "HTML Document"} •{" "}
                          {(landingFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>

                    <div className="sq-landing-file-actions">
                      {landingFile.textPreview && (
                        <button
                          type="button"
                          className="sq-btn-mini-preview"
                          onClick={() => setIsLandingPreviewOpen(true)}
                          title="Preview HTML content"
                        >
                          <EyeIcon /> Preview
                        </button>
                      )}
                      <button
                        type="button"
                        className="sq-btn-mini-change"
                        onClick={() => landingFileInputRef.current?.click()}
                        title="Choose another file"
                      >
                        <UploadIcon /> Change
                      </button>
                      <button
                        type="button"
                        className="sq-btn-mini-clear"
                        onClick={() => {
                          setLandingFile(null);
                          setLandingError("");
                        }}
                        title="Remove file"
                      >
                        <TrashIcon />
                      </button>

                      <input
                        type="file"
                        ref={landingFileInputRef}
                        style={{ display: "none" }}
                        accept=".html,.htm,.zip"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleLandingFileSelect(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {landingError && <div className="sq-slug-error">{landingError}</div>}

                <div className="sq-deploy-actions-row">
                  <button
                    type="button"
                    className="sq-btn-deploy-bunny"
                    onClick={() => handleTriggerDeploy("LANDING_PAGE")}
                    disabled={
                      isDeploying ||
                      !landingFile ||
                      (deploymentJob &&
                        (deploymentJob.status === "QUEUED" ||
                          deploymentJob.status === "PREPARING" ||
                          deploymentJob.status === "UPLOADING"))
                    }
                  >
                    <RocketIcon />{" "}
                    {isDeploying
                      ? "Deploying..."
                      : deploymentJob?.status === "PREPARING" ||
                        deploymentJob?.status === "UPLOADING"
                        ? "Deploying Landing..."
                        : "Deploy Landing Page to Bunny"}
                  </button>

                  {deploymentJob && (
                    <button
                      type="button"
                      className="sq-btn-view-logs"
                      onClick={() => setIsDeployModalOpen(true)}
                    >
                      <TerminalIcon /> View Console
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Quick Status Bar */}
            {deploymentJob && (
              <div className="sq-deploy-status-bar">
                <div className="sq-deploy-status-info">
                  <span className={`sq-deploy-pill ${deploymentJob.status.toLowerCase()}`}>
                    {deploymentJob.status}
                  </span>
                  <span className="sq-deploy-phase-text">
                    {deploymentJob.phase} {deploymentJob.progress ? `(${deploymentJob.progress}%)` : ""}
                  </span>
                  {deploymentJob.mode === "LANDING_PAGE" && (
                    <span className="sq-deploy-tag-pill">Landing Page</span>
                  )}
                </div>
                {deploymentJob.status === "SUCCEEDED" && deploymentJob.cdnUrl && (
                  <a
                    href={deploymentJob.cdnUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sq-deploy-link"
                  >
                    Live Website: {deploymentJob.cdnUrl} <ExternalLinkIcon />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="sq-setup-field-group">
          <label className="sq-setup-label" htmlFor="sq-store-location-select">
            Location
          </label>
          <select
            id="sq-store-location-select"
            className="sq-setup-select"
            value={locationId}
            onChange={(e) => {
              setLocationId(e.target.value);
              setIsDirty(true);
            }}
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
          <p className="sq-setup-hint">
            Controls which location's availability and sold-out item statuses are applied on your storefront.
          </p>
        </div>
      </div>

      <div className="sq-store-setup-card">
        <h2 className="sq-setup-section-title">Store theme & colors</h2>
        <p className="sq-setup-section-desc">
          Choose a primary brand color for your storefront. We will automatically blend complementary shades into your buttons, active tabs, badges, and drawers.
        </p>

        <div className="sq-setup-theme-section">
          <div className="sq-theme-presets-grid">
            {PRESET_THEME_COLORS.map((preset) => {
              const isSelected = (themeColor || "").toLowerCase() === preset.hex.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`sq-theme-preset-btn ${isSelected ? "sq-theme-preset-btn--active" : ""}`}
                  onClick={() => {
                    setThemeColor(preset.hex);
                    setIsDirty(true);
                  }}
                  title={preset.name}
                >
                  <span
                    className="sq-theme-color-circle"
                    style={{ backgroundColor: preset.hex }}
                  >
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="sq-theme-preset-name">{preset.name}</span>
                </button>
              );
            })}
          </div>

          <div className="sq-theme-custom-row">
            <div className="sq-theme-picker-group">
              <label className="sq-setup-label" htmlFor="sq-theme-custom-color">Custom color</label>
              <div className="sq-theme-color-inputs">
                <input
                  id="sq-theme-custom-color"
                  type="color"
                  className="sq-theme-color-picker"
                  value={themeColor}
                  onChange={(e) => {
                    setThemeColor(e.target.value);
                    setIsDirty(true);
                  }}
                />
                <input
                  type="text"
                  className="sq-theme-hex-input"
                  value={themeColor.toUpperCase()}
                  onChange={(e) => {
                    setThemeColor(e.target.value);
                    setIsDirty(true);
                  }}
                  maxLength={7}
                  placeholder="#E53E3E"
                />
              </div>
            </div>

            <div className="sq-theme-preview-card" style={{ "--preview-color": themeColor }}>
              <div className="sq-theme-preview-label">Live Preview</div>
              <div className="sq-theme-preview-content">
                <div className="sq-theme-preview-header">
                  <div className="sq-theme-preview-brand" style={{ color: themeColor }}>
                    <span className="sq-theme-preview-square" style={{ borderColor: themeColor }} />
                    <span style={{ fontWeight: 800 }}>{(name || "SKIPLI").toUpperCase()}</span>
                  </div>
                  <div className="sq-theme-preview-badge" style={{ backgroundColor: `${themeColor}1a`, color: themeColor }}>
                    10% OFF
                  </div>
                </div>
                <div className="sq-theme-preview-tabs">
                  <span
                    className="sq-theme-preview-tab sq-theme-preview-tab--active"
                    style={{ color: themeColor, borderColor: themeColor, backgroundColor: `${themeColor}14` }}
                  >
                    Appetizers
                  </span>
                  <span className="sq-theme-preview-tab">Entrees</span>
                  <span className="sq-theme-preview-tab">Drinks</span>
                </div>
                <div className="sq-theme-preview-actions">
                  <button type="button" className="sq-theme-preview-btn" style={{ backgroundColor: themeColor }}>
                    Add Item • $12.00
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sq-store-setup-card">
        <h2 className="sq-setup-section-title">Menu display</h2>

        <p className="sq-setup-section-desc">
          Choose which categories are shown on your online storefront and drag to reorder their tabs.
        </p>

        {categoryConfigs.length === 0 ? (
          <p className="sq-setup-hint">No categories created yet in Items → Categories.</p>
        ) : (
          <div className="sq-cat-list" role="list">
            {categoryConfigs.map((cat, index) => (
              <div
                key={cat.id}
                className="sq-cat-row"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                role="listitem"
              >
                <div className="sq-cat-left">
                  <div className="sq-cat-drag-handle" title="Drag to reorder">
                    <GripIcon />
                  </div>

                  <div className="sq-cat-order-btns">
                    <button
                      type="button"
                      className="sq-cat-btn-arrow"
                      disabled={index === 0}
                      onClick={() => handleMoveCategory(index, -1)}
                      aria-label={`Move ${cat.name} up`}
                    >
                      <ArrowUpIcon />
                    </button>
                    <button
                      type="button"
                      className="sq-cat-btn-arrow"
                      disabled={index === categoryConfigs.length - 1}
                      onClick={() => handleMoveCategory(index, 1)}
                      aria-label={`Move ${cat.name} down`}
                    >
                      <ArrowDownIcon />
                    </button>
                  </div>

                  <div className="sq-cat-info">
                    <span className="sq-cat-name">{cat.name}</span>
                    <span className="sq-cat-count-badge">
                      {cat.itemCount} {cat.itemCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                </div>

                <div className="sq-cat-right">
                  <span className="sq-cat-show-label">Show on store</span>
                  <label className="sq-switch" aria-label={`Show ${cat.name} on store`}>
                    <input
                      type="checkbox"
                      checked={cat.visible}
                      onChange={() => handleToggleCategoryVisible(cat.id)}
                    />
                    <span className="sq-switch-slider" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className={`sq-toast sq-toast--${toast.type}`} role="status">
          {toast.message}
        </div>
      )}

      {isDeployModalOpen && (
        <DeploymentLogsModal
          job={deploymentJob}
          agentStatus={agentStatus}
          onClose={() => setIsDeployModalOpen(false)}
          onTriggerDeploy={() =>
            handleTriggerDeploy(
              deploymentJob?.mode || (deployModeTab === "landing" ? "LANDING_PAGE" : "STOREFRONT")
            )
          }
          isDeploying={isDeploying}
        />
      )}

      {isLandingPreviewOpen && (
        <LandingPreviewModal
          file={landingFile}
          onClose={() => setIsLandingPreviewOpen(false)}
        />
      )}

      {isScanModalOpen && (
        <DnsScanImportModal
          isOpen={isScanModalOpen}
          isScanning={isScanningDns}
          scannedData={scannedRecordsData}
          selectedIndexes={selectedRecordIndexes}
          onToggleSelect={handleToggleRecordSelect}
          onSelectAllSafe={handleSelectAllSafe}
          onSelectAll={handleSelectAllRecords}
          onDeselectAll={() => setSelectedRecordIndexes(new Set())}
          onConfirmImport={handleConfirmImport}
          isImporting={isImportingDns}
          onClose={() => setIsScanModalOpen(false)}
          domainName={customDomain?.hostname || "domain"}
          customNs={customScanNs}
          onCustomNsChange={setCustomScanNs}
          onRescan={(ns) => handleTriggerScan(ns)}
        />
      )}

      {isBulkImportModalOpen && (
        <BulkImportDnsModal
          isOpen={isBulkImportModalOpen}
          domainName={customDomain?.hostname || "domain"}
          onClose={() => setIsBulkImportModalOpen(false)}
          onConfirmImport={handleConfirmBulkImport}
          isImporting={isImportingDns}
        />
      )}

      {isAddRecordModalOpen && (
        <AddDnsRecordModal
          isOpen={isAddRecordModalOpen}
          form={newRecordForm}
          onChange={setNewRecordForm}
          onSave={handleSaveNewRecord}
          onClose={() => setIsAddRecordModalOpen(false)}
          isSaving={isSavingRecord}
          domainName={customDomain?.hostname || "domain"}
        />
      )}

      <UnsavedChangesModal
        isOpen={isDiscardModalOpen}
        onDiscard={() => {
          setIsDiscardModalOpen(false);
          setIsDirty(false);
        }}
        onResume={() => setIsDiscardModalOpen(false)}
        onSave={() => {
          setIsDiscardModalOpen(false);
          handleSave();
        }}
      />
    </div>
  );
}

function DeploymentLogsModal({ job, agentStatus, onClose, onTriggerDeploy, isDeploying }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [job?.logs?.length]);

  const logs = job?.logs || [];
  const status = job?.status || "STANDBY";
  const progress = job?.progress || 0;
  const cdnUrl =
    job?.cdnUrl ||
    (agentStatus?.configSummary?.cdnHostname
      ? `https://${agentStatus.configSummary.cdnHostname}`
      : null);

  return (
    <div className="sq-deploy-modal-backdrop" onClick={onClose}>
      <div className="sq-deploy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sq-terminal-header">
          <div className="sq-terminal-title">
            <TerminalIcon />
            <span>Bunny CDN Deployment Console</span>
            <span className={`sq-deploy-pill ${status.toLowerCase()}`}>{status}</span>
          </div>
          <button type="button" className="sq-btn-terminal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="sq-terminal-progress-banner">
          <div className="sq-terminal-progress-labels">
            <span>Phase: {job?.phase || "Standby"}</span>
            <span>{progress}%</span>
          </div>
          <div className="sq-progress-bar-container">
            <div className="sq-progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="sq-terminal-body">
          {logs.length === 0 ? (
            <div className="sq-terminal-log-line">
              <span className="sq-terminal-time">--:--:--</span>
              <span className="sq-terminal-msg">Waiting for deployment activity...</span>
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="sq-terminal-log-line">
                <span className="sq-terminal-time">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`sq-terminal-msg ${log.level || "info"}`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>

        <div className="sq-terminal-footer">
          <div>
            {status === "SUCCEEDED" && cdnUrl ? (
              <a href={cdnUrl} target="_blank" rel="noopener noreferrer" className="sq-deploy-link">
                Visit Live Site: {cdnUrl} <ExternalLinkIcon />
              </a>
            ) : status === "FAILED" ? (
              <span style={{ color: "#f87171", fontWeight: 600 }}>
                Deployment failed: {job?.error || "Check terminal logs"}
              </span>
            ) : (
              <span style={{ color: "#94a3b8" }}>
                {agentStatus?.online
                  ? agentStatus.isSimulated
                    ? "Simulation agent active"
                    : "Connected to local agent"
                  : "Agent offline (run 'npm run agent' in terminal)"}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="sq-btn-deploy-bunny"
              onClick={onTriggerDeploy}
              disabled={isDeploying || status === "BUILDING" || status === "UPLOADING"}
            >
              <RocketIcon /> {isDeploying ? "Deploying..." : "Redeploy"}
            </button>
            <button type="button" className="sq-btn-view-logs" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPreviewModal({ file, onClose }) {
  if (!file) return null;

  return (
    <div className="sq-deploy-modal-backdrop" onClick={onClose}>
      <div className="sq-landing-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sq-terminal-header">
          <div className="sq-terminal-title">
            <FileCodeIcon />
            <span>HTML Preview: {file.name}</span>
          </div>
          <button type="button" className="sq-btn-terminal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="sq-landing-preview-body">
          {file.textPreview ? (
            <iframe
              title="Landing Page Preview"
              srcDoc={file.textPreview}
              className="sq-landing-preview-frame"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="sq-landing-preview-empty">
              Preview is only available for direct HTML files. ZIP packages can be deployed directly.
            </div>
          )}
        </div>

        <div className="sq-landing-preview-footer">
          <span className="sq-landing-preview-meta">
            File size: {(file.size / 1024).toFixed(1)} KB • Sandboxed render
          </span>
          <button type="button" className="sq-btn-view-logs" onClick={onClose}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}

function DnsScanImportModal({
  isOpen,
  isScanning,
  scannedData,
  selectedIndexes,
  onToggleSelect,
  onSelectAllSafe,
  onSelectAll,
  onDeselectAll,
  onConfirmImport,
  isImporting,
  onClose,
  domainName,
  customNs,
  onCustomNsChange,
  onRescan,
}) {
  const [localNs, setLocalNs] = useState(customNs || "");
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    setLocalNs(customNs || "");
  }, [customNs]);

  if (!isOpen) return null;

  const totalScanned = scannedData?.records?.length || 0;
  const safeCount = scannedData?.safeRecords?.length || 0;
  const selectedCount = selectedIndexes.size;

  const NS_PRESETS = [
    { label: "Mắt Bão", ns: "ns1.matbao.vn" },
    { label: "Tenten", ns: "ns1.tenten.vn" },
    { label: "iNET", ns: "ns1.inet.vn" },
    { label: "PA Việt Nam", ns: "ns1.pavietnam.vn" },
    { label: "Cloudflare", ns: "1.1.1.1" },
    { label: "Google DNS", ns: "8.8.8.8" },
  ];

  const handleApplyPreset = (ns) => {
    setLocalNs(ns);
    if (onCustomNsChange) onCustomNsChange(ns);
    if (onRescan) onRescan(ns);
  };

  const handleManualRescan = (e) => {
    e.preventDefault();
    if (onCustomNsChange) onCustomNsChange(localNs);
    if (onRescan) onRescan(localNs);
  };

  return (
    <div className="sq-deploy-modal-backdrop" onClick={onClose}>
      <div className="sq-dns-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sq-dns-modal-header">
          <div>
            <h3 className="sq-dns-modal-title">🔍 Quét & Khôi Phục Bản Ghi DNS Từ Host Cũ</h3>
            <p className="sq-dns-modal-desc">
              Hệ thống tự động truy vấn trực tiếp máy chủ Nameserver của nhà đăng ký cũ của <strong>{domainName}</strong> để tìm lại Email (MX), SPF, DKIM, TXT và các subdomain.
            </p>
          </div>
          <button type="button" className="sq-btn-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="sq-dns-modal-body">
          {/* Custom NS / Registrar Presets Toolbar */}
          <div className="sq-dns-scan-ns-card">
            <div className="sq-dns-scan-ns-header">
              <span className="sq-dns-scan-ns-title">🌐 Chọn nhà đăng ký / Nameserver cũ của bạn:</span>
              <div className="sq-dns-scan-presets">
                {NS_PRESETS.map((p) => (
                  <button
                    key={p.ns}
                    type="button"
                    className={`sq-btn-ns-preset ${localNs === p.ns ? "active" : ""}`}
                    onClick={() => handleApplyPreset(p.ns)}
                    disabled={isScanning}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <form className="sq-dns-scan-ns-input-row" onSubmit={handleManualRescan}>
              <input
                type="text"
                className="sq-dns-ns-input"
                placeholder="Hoặc nhập Nameserver cũ (ví dụ: ns1.matbao.vn, ns1.tenten.vn)..."
                value={localNs}
                onChange={(e) => setLocalNs(e.target.value)}
                disabled={isScanning}
              />
              <button
                type="submit"
                className="sq-btn-ns-rescan"
                disabled={isScanning}
              >
                {isScanning ? "Đang quét..." : "🔄 Quét lại"}
              </button>
            </form>
          </div>

          {isScanning ? (
            <div className="sq-dns-scan-loading-box">
              <div className="sq-scan-spinner" />
              <div className="sq-scan-loading-text">
                Đang quét các bản ghi DNS từ máy chủ cũ của <strong>{domainName}</strong>...
              </div>
              <div className="sq-scan-loading-subtext">
                Đang kiểm tra MX (Mail), TXT (SPF/DKIM), CNAME (subdomains) trên {localNs || "Mắt Bão / Tenten / DNS công khai"}...
              </div>
            </div>
          ) : !scannedData || totalScanned === 0 ? (
            <div className="sq-dns-scan-empty-box">
              <p>Chưa tìm thấy bản ghi nào trên host cũ hoặc tên miền chưa có bản ghi phụ.</p>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                💡 Hãy thử bấm chọn nhanh <strong>[Mắt Bão]</strong>, <strong>[Tenten]</strong>, <strong>[iNET]</strong> ở trên hoặc dùng tính năng <strong>"Nhập hàng loạt"</strong>.
              </p>
            </div>
          ) : (
            <div>
              <div className="sq-dns-scan-summary-bar">
                <div className="sq-dns-scan-stats">
                  <span>Tìm thấy <strong>{totalScanned}</strong> bản ghi. Đã chọn <strong>{selectedCount}</strong> bản ghi để nhập.</span>
                  {scannedData.nameserverUsed && (
                    <span className="sq-dns-ns-badge">
                      🎯 Phản hồi từ: <strong>{scannedData.nameserverUsed}</strong>
                    </span>
                  )}
                </div>
                <div className="sq-dns-scan-filter-btns">
                  <button type="button" className="sq-btn-filter-tag active" onClick={onSelectAllSafe}>
                    ✅ Khuyên dùng ({safeCount} Mail/TXT)
                  </button>
                  <button type="button" className="sq-btn-filter-tag" onClick={onSelectAll}>
                    Chọn tất cả
                  </button>
                  <button type="button" className="sq-btn-filter-tag" onClick={onDeselectAll}>
                    Bỏ chọn tất cả
                  </button>
                  {scannedData.scanLogs?.length > 0 && (
                    <button
                      type="button"
                      className="sq-btn-filter-tag sq-btn-filter-logs"
                      onClick={() => setShowLogs(!showLogs)}
                    >
                      📜 {showLogs ? "Ẩn nhật ký" : "Xem nhật ký"} ({scannedData.scanLogs.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Collapsible Scan Logs Console */}
              {showLogs && scannedData.scanLogs && (
                <div className="sq-dns-scan-logs-console">
                  <div className="sq-dns-scan-logs-title">Nhật ký truy vấn máy chủ DNS:</div>
                  {scannedData.scanLogs.map((logLine, lIdx) => (
                    <div key={lIdx} className="sq-dns-scan-log-line">
                      {logLine}
                    </div>
                  ))}
                </div>
              )}

              <div className="sq-dns-scan-table-wrapper">
                <div className="sq-dns-scan-table">
                  <div className="sq-dns-scan-head">
                    <span style={{ width: 45 }}>Chọn</span>
                    <span style={{ width: 90 }}>Loại</span>
                    <span style={{ width: 140 }}>Tên (Host)</span>
                    <span>Giá trị (Value / Target)</span>
                    <span style={{ width: 180 }}>Ghi chú thông minh</span>
                  </div>
                  <div className="sq-dns-scan-rows">
                    {scannedData.records.map((rec, idx) => {
                      const isChecked = selectedIndexes.has(idx);
                      const isConflicting = !rec.selectedByDefault;
                      return (
                        <div
                          key={idx}
                          className={`sq-dns-scan-row ${isConflicting ? "sq-dns-row--warning" : ""} ${isChecked ? "sq-dns-row--selected" : ""}`}
                          onClick={() => onToggleSelect(idx)}
                        >
                          <span style={{ width: 45 }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleSelect(idx)}
                            />
                          </span>
                          <span style={{ width: 90 }}>
                            <span className={`sq-dns-type-badge type-${rec.Type}`}>
                              {rec.typeLabel}
                            </span>
                          </span>
                          <span style={{ width: 140 }} className="sq-dns-scan-host">
                            <code>{rec.Name || "@"}</code>
                          </span>
                          <span className="sq-dns-scan-val" title={rec.Value}>
                            {rec.Type === 8 ? (
                              <span>🎯 Port {rec.Port || 0} (Pri {rec.Priority || 0}, Wgt {rec.Weight || 0}) ➔ {rec.Value}</span>
                            ) : (
                              <>
                                {rec.Value}
                                {rec.Priority ? ` (Priority ${rec.Priority})` : ""}
                              </>
                            )}
                          </span>
                          <span style={{ width: 180 }} className="sq-dns-scan-note">
                            {rec.reason}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="sq-dns-scan-conflict-alert">
                ⚠️ <strong>Lưu ý:</strong> Các bản ghi web cũ (@ và www) trỏ về hosting cũ mặc định được bỏ chọn để tránh xung đột với Store mới trên Bunny CDN.
              </div>
            </div>
          )}
        </div>

        <div className="sq-dns-modal-footer">
          <button type="button" className="sq-btn-modal-cancel" onClick={onClose} disabled={isImporting}>
            Đóng
          </button>
          <button
            type="button"
            className="sq-btn-modal-confirm"
            onClick={onConfirmImport}
            disabled={isScanning || isImporting || selectedCount === 0}
          >
            {isImporting ? "Đang nhập..." : `Nhập ${selectedCount} bản ghi đã chọn`}
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkImportDnsModal({
  isOpen,
  domainName,
  onClose,
  onConfirmImport,
  isImporting,
}) {
  const [rawText, setRawText] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [selectedIndexes, setSelectedIndexes] = useState(new Set());
  const [isParsing, setIsParsing] = useState(false);

  // Auto-parse on rawText change (debounced 300ms)
  useEffect(() => {
    if (!rawText.trim()) {
      setParsedData(null);
      setSelectedIndexes(new Set());
      return;
    }
    const timer = setTimeout(async () => {
      setIsParsing(true);
      try {
        const res = await parseBulkDnsRecords(rawText, domainName);
        setParsedData(res);
        const def = new Set();
        (res.records || []).forEach((r, idx) => {
          if (r.selectedByDefault) def.add(idx);
        });
        setSelectedIndexes(def);
      } catch (err) {
        console.error("Parse bulk DNS error:", err);
      } finally {
        setIsParsing(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [rawText, domainName]);

  const handleToggleSelect = (idx) => {
    setSelectedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleSelectAllSafe = () => {
    if (!parsedData?.records) return;
    const next = new Set();
    parsedData.records.forEach((r, idx) => {
      if (r.selectedByDefault) next.add(idx);
    });
    setSelectedIndexes(next);
  };

  const handleSelectAll = () => {
    if (!parsedData?.records) return;
    const next = new Set();
    parsedData.records.forEach((_, idx) => next.add(idx));
    setSelectedIndexes(next);
  };

  const handleDeselectAll = () => {
    setSelectedIndexes(new Set());
  };

  const fileInputRef = useRef(null);

  const CSV_SAMPLE_TEXT = `Host,Type,Data,TTL
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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setRawText(content);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDownloadCsvTemplate = () => {
    const blob = new Blob([CSV_SAMPLE_TEXT], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dns_records_${domainName || "template"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = (sampleType) => {
    if (sampleType === "csv") {
      setRawText(CSV_SAMPLE_TEXT);
    } else if (sampleType === "bind") {
      setRawText(
`${domainName}. 3600 IN MX 10 s129d209.emailserver.vn.
${domainName}. 3600 IN TXT "v=spf1 mx include:emailserver.vn include:spf.protection.outlook.com -all"
mail 300 CNAME s129d209.emailserver.vn.
webmail 300 CNAME s129d209.emailserver.vn.
cpanel 300 CNAME s129d209.emailserver.vn.
autodiscover 300 CNAME s129d209.emailserver.vn.
_dmarc 3600 TXT "v=DMARC1; p=none;"
_autodiscover._tcp 3600 IN SRV 0 0 443 s129d209.emailserver.vn.`
      );
    } else if (sampleType === "table") {
      setRawText(
`MX\t@\ts129d209.emailserver.vn\t10\t3600
TXT\t@\t"v=spf1 mx include:emailserver.vn -all"\t3600
CNAME\tmail\ts129d209.emailserver.vn\t300
CNAME\twebmail\ts129d209.emailserver.vn\t300
CNAME\tcpanel\ts129d209.emailserver.vn\t300
TXT\t_dmarc\t"v=DMARC1; p=none;"\t3600`
      );
    } else if (sampleType === "json") {
      setRawText(
JSON.stringify(
  [
    { type: "MX", name: "@", value: "s129d209.emailserver.vn", priority: 10, ttl: 3600 },
    { type: "TXT", name: "@", value: "v=spf1 mx include:emailserver.vn -all", ttl: 3600 },
    { type: "CNAME", name: "mail", value: "s129d209.emailserver.vn", ttl: 300 },
    { type: "TXT", name: "_dmarc", value: "v=DMARC1; p=none;", ttl: 3600 },
    { type: "SRV", name: "_autodiscover._tcp", value: "s129d209.emailserver.vn", port: 443, priority: 0, weight: 0, ttl: 3600 },
  ],
  null,
  2
)
      );
    } else {
      setRawText("");
    }
  };

  const handleImportSubmit = () => {
    if (!parsedData?.records) return;
    const recordsToImport = parsedData.records.filter((_, idx) => selectedIndexes.has(idx));
    onConfirmImport(recordsToImport);
  };

  if (!isOpen) return null;

  const totalParsed = parsedData?.records?.length || 0;
  const safeCount = parsedData?.safeRecords?.length || 0;
  const selectedCount = selectedIndexes.size;

  return (
    <div className="sq-deploy-modal-backdrop" onClick={onClose}>
      <div className="sq-dns-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sq-dns-modal-header">
          <div>
            <h3 className="sq-dns-modal-title">📋 Nhập Hàng Loạt Bản Ghi DNS (Bulk Import)</h3>
            <p className="sq-dns-modal-desc">
              Hỗ trợ tải lên hoặc dán file <strong>.CSV export từ Mắt Bão / cPanel</strong>, định dạng BIND Zone, bảng sao chép, hoặc mảng JSON.
            </p>
          </div>
          <button type="button" className="sq-btn-modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="sq-dns-modal-body">
          {/* Quick sample & upload bar */}
          <div className="sq-bulk-sample-bar">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,.txt,.zone"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="sq-btn-sample-tag sq-btn-upload-file-highlight"
              onClick={() => fileInputRef.current?.click()}
              title="Tải lên tệp danh sách bản ghi export từ nhà đăng ký tên miền (.csv, .zone, .txt)"
            >
              📁 Tải lên file .CSV
            </button>
            <button
              type="button"
              className="sq-btn-sample-tag"
              onClick={handleDownloadCsvTemplate}
              title="Tải tệp mẫu CSV chuẩn (Host,Type,Data,TTL) để điền bản ghi"
            >
              ⬇️ Tải file mẫu CSV
            </button>
            <span style={{ color: "#cbd5e1" }}>|</span>
            <span className="sq-bulk-sample-label">Mẫu sẵn:</span>
            <button type="button" className="sq-btn-sample-tag" onClick={() => handleLoadSample("csv")}>
              📊 Mẫu CSV Mắt Bão
            </button>
            <button type="button" className="sq-btn-sample-tag" onClick={() => handleLoadSample("bind")}>
              📄 Mẫu BIND Zone
            </button>
            <button type="button" className="sq-btn-sample-tag" onClick={() => handleLoadSample("table")}>
              📋 Mẫu Bảng sao chép
            </button>
            <button type="button" className="sq-btn-sample-tag" onClick={() => handleLoadSample("json")}>
              ⚙️ Mẫu JSON
            </button>
            {rawText && (
              <button type="button" className="sq-btn-sample-tag sq-btn-sample-clear" onClick={() => handleLoadSample("clear")}>
                🗑️ Xóa trắng
              </button>
            )}
          </div>

          {/* Raw Text Input */}
          <div className="sq-bulk-textarea-wrapper">
            <textarea
              className="sq-bulk-textarea"
              placeholder={`Dán nội dung các bản ghi DNS hoặc bấm "📁 Tải lên file .CSV" ở trên...\nVí dụ định dạng CSV Mắt Bão: Host,Type,Data,TTL\n@,MX,0 s129d209.emailserver.vn.,3600\n_autodiscover._tcp,SRV,0 0 443 s129d209.emailserver.vn.,3600`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={6}
            />
          </div>

          {/* Parsing state or Results */}
          {isParsing ? (
            <div className="sq-bulk-parsing-indicator">
              <div className="sq-scan-spinner" style={{ width: 22, height: 22, margin: 0 }} />
              <span>Đang phân tích cú pháp bản ghi DNS...</span>
            </div>
          ) : totalParsed > 0 ? (
            <div className="sq-bulk-preview-container">
              <div className="sq-dns-scan-summary-bar">
                <div className="sq-dns-scan-stats">
                  <span>Phân tích được <strong>{totalParsed}</strong> bản ghi hợp lệ. Đã chọn <strong>{selectedCount}</strong> bản ghi.</span>
                </div>
                <div className="sq-dns-scan-filter-btns">
                  <button type="button" className="sq-btn-filter-tag active" onClick={handleSelectAllSafe}>
                    ✅ Khuyên dùng ({safeCount} bản ghi an toàn)
                  </button>
                  <button type="button" className="sq-btn-filter-tag" onClick={handleSelectAll}>
                    Chọn tất cả
                  </button>
                  <button type="button" className="sq-btn-filter-tag" onClick={handleDeselectAll}>
                    Bỏ chọn tất cả
                  </button>
                </div>
              </div>

              {parsedData.errors?.length > 0 && (
                <div className="sq-bulk-errors-box">
                  <strong>⚠️ {parsedData.errors.length} dòng không phân tích được:</strong>
                  {parsedData.errors.map((errItem, eIdx) => (
                    <div key={eIdx} className="sq-bulk-error-item">
                      Dòng {errItem.line}: <code>{errItem.content}</code> ({errItem.error})
                    </div>
                  ))}
                </div>
              )}

              <div className="sq-dns-scan-table-wrapper" style={{ maxHeight: 240 }}>
                <div className="sq-dns-scan-table">
                  <div className="sq-dns-scan-head">
                    <span style={{ width: 45 }}>Chọn</span>
                    <span style={{ width: 90 }}>Loại</span>
                    <span style={{ width: 140 }}>Tên (Host)</span>
                    <span>Giá trị (Value / Target)</span>
                    <span style={{ width: 90 }}>TTL</span>
                  </div>
                  <div className="sq-dns-scan-rows">
                    {parsedData.records.map((rec, idx) => {
                      const isChecked = selectedIndexes.has(idx);
                      const isConflicting = !rec.selectedByDefault;
                      return (
                        <div
                          key={idx}
                          className={`sq-dns-scan-row ${isConflicting ? "sq-dns-row--warning" : ""} ${isChecked ? "sq-dns-row--selected" : ""}`}
                          onClick={() => handleToggleSelect(idx)}
                        >
                          <span style={{ width: 45 }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleSelect(idx)}
                            />
                          </span>
                          <span style={{ width: 90 }}>
                            <span className={`sq-dns-type-badge type-${rec.Type}`}>
                              {rec.typeLabel}
                            </span>
                          </span>
                          <span style={{ width: 140 }} className="sq-dns-scan-host">
                            <code>{rec.Name || "@"}</code>
                          </span>
                          <span className="sq-dns-scan-val" title={rec.Value}>
                            {rec.Type === 8 ? (
                              <span>🎯 Port {rec.Port || 0} (Pri {rec.Priority || 0}, Wgt {rec.Weight || 0}) ➔ {rec.Value}</span>
                            ) : (
                              <>
                                {rec.Value}
                                {rec.Priority ? ` (Priority ${rec.Priority})` : ""}
                              </>
                            )}
                          </span>
                          <span style={{ width: 90 }} className="sq-dns-scan-note">
                            {rec.Ttl || 3600}s
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : rawText.trim() ? (
            <div className="sq-dns-scan-empty-box" style={{ padding: "20px" }}>
              <p>Chưa tìm thấy bản ghi hợp lệ từ văn bản đã nhập. Hãy kiểm tra lại cú pháp (Type, Host, Value).</p>
            </div>
          ) : null}
        </div>

        <div className="sq-dns-modal-footer">
          <button type="button" className="sq-btn-modal-cancel" onClick={onClose} disabled={isImporting}>
            Đóng
          </button>
          <button
            type="button"
            className="sq-btn-modal-confirm"
            onClick={handleImportSubmit}
            disabled={isImporting || selectedCount === 0}
          >
            {isImporting ? "Đang nhập..." : `Nhập ${selectedCount} bản ghi đã chọn`}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddDnsRecordModal({
  isOpen,
  form,
  onChange,
  onSave,
  onClose,
  isSaving,
  domainName,
}) {
  if (!isOpen) return null;

  return (
    <div className="sq-deploy-modal-backdrop" onClick={onClose}>
      <div className="sq-dns-modal sq-dns-modal--small" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={onSave}>
          <div className="sq-dns-modal-header">
            <div>
              <h3 className="sq-dns-modal-title">➕ Thêm Bản Ghi DNS Mới</h3>
              <p className="sq-dns-modal-desc">
                Thêm bản ghi vào DNS Zone của <strong>{domainName}</strong>
              </p>
            </div>
            <button type="button" className="sq-btn-modal-close" onClick={onClose}>&times;</button>
          </div>

          <div className="sq-dns-modal-body" style={{ padding: "20px" }}>
            <div className="sq-dns-form-group">
              <label className="sq-dns-form-label">Loại bản ghi (Record Type)</label>
              <select
                className="sq-dns-form-select"
                value={form.type}
                onChange={(e) => onChange({ ...form, type: Number(e.target.value) })}
              >
                <option value={0}>A (Địa chỉ IPv4)</option>
                <option value={2}>CNAME (Bí danh tên miền)</option>
                <option value={3}>TXT (Văn bản xác thực / SPF / DKIM)</option>
                <option value={4}>MX (Máy chủ Email)</option>
                <option value={8}>SRV (Dịch vụ tự động cấu hình)</option>
              </select>
            </div>

            <div className="sq-dns-form-group">
              <label className="sq-dns-form-label">Tên bản ghi / Host (Để @ nếu là root domain)</label>
              <input
                type="text"
                className="sq-dns-form-input"
                placeholder={form.type === 8 ? "ví dụ: _autodiscover._tcp" : "ví dụ: @, www, mail, api..."}
                value={form.name}
                onChange={(e) => onChange({ ...form, name: e.target.value })}
              />
            </div>

            <div className="sq-dns-form-group">
              <label className="sq-dns-form-label">Giá trị (Value / Target)</label>
              <input
                type="text"
                className="sq-dns-form-input"
                placeholder={
                  form.type === 0
                    ? "192.0.2.1"
                    : form.type === 2
                    ? "target.example.com"
                    : form.type === 4
                    ? "mail.example.com"
                    : form.type === 8
                    ? "target-server.com"
                    : "v=spf1..."
                }
                value={form.value}
                onChange={(e) => onChange({ ...form, value: e.target.value })}
                required
              />
            </div>

            {form.type === 8 && (
              <div style={{ display: "flex", gap: "10px" }}>
                <div className="sq-dns-form-group" style={{ flex: 1 }}>
                  <label className="sq-dns-form-label">Cổng (Port)</label>
                  <input
                    type="number"
                    className="sq-dns-form-input"
                    placeholder="443"
                    value={form.port || ""}
                    onChange={(e) => onChange({ ...form, port: e.target.value })}
                    required
                  />
                </div>
                <div className="sq-dns-form-group" style={{ flex: 1 }}>
                  <label className="sq-dns-form-label">Priority</label>
                  <input
                    type="number"
                    className="sq-dns-form-input"
                    placeholder="0"
                    value={form.priority !== undefined ? form.priority : 0}
                    onChange={(e) => onChange({ ...form, priority: e.target.value })}
                  />
                </div>
                <div className="sq-dns-form-group" style={{ flex: 1 }}>
                  <label className="sq-dns-form-label">Weight</label>
                  <input
                    type="number"
                    className="sq-dns-form-input"
                    placeholder="0"
                    value={form.weight !== undefined ? form.weight : 0}
                    onChange={(e) => onChange({ ...form, weight: e.target.value })}
                  />
                </div>
              </div>
            )}

            {form.type === 4 && (
              <div className="sq-dns-form-group">
                <label className="sq-dns-form-label">Độ ưu tiên (Priority)</label>
                <input
                  type="number"
                  className="sq-dns-form-input"
                  value={form.priority}
                  onChange={(e) => onChange({ ...form, priority: e.target.value })}
                />
              </div>
            )}

            <div className="sq-dns-form-group">
              <label className="sq-dns-form-label">Thời gian Cache (TTL tính theo giây)</label>
              <input
                type="number"
                className="sq-dns-form-input"
                value={form.ttl}
                onChange={(e) => onChange({ ...form, ttl: e.target.value })}
              />
            </div>
          </div>

          <div className="sq-dns-modal-footer">
            <button type="button" className="sq-btn-modal-cancel" onClick={onClose} disabled={isSaving}>
              Hủy
            </button>
            <button type="submit" className="sq-btn-modal-confirm" disabled={isSaving || !form.value.trim()}>
              {isSaving ? "Đang lưu..." : "Lưu bản ghi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
