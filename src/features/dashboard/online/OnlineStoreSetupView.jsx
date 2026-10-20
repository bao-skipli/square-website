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
  const [activeDeploymentId, setActiveDeploymentId] = useState(null);
  const [deploymentJob, setDeploymentJob] = useState(null);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

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

  const handleTriggerDeploy = async () => {
    setIsDeploying(true);
    try {
      const job = await createDeploymentJob(userId, storeId, {
        purgeCache: true,
        verifyCdn: true,
      });
      setActiveDeploymentId(job.id);
      setDeploymentJob(job);
      setIsDeployModalOpen(true);
      setToast({
        message: "Deployment job queued! Viewing live build & upload console...",
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
                    <ol>
                      <li>Enter your custom hostname (e.g. <code>shop.mybrand.com</code>).</li>
                      <li>
                        Point your DNS CNAME record to{" "}
                        <code>
                          {agentStatus.configSummary?.cdnHostname || "yourstore.b-cdn.net"}
                        </code>
                        .
                      </li>
                      <li>
                        Once DNS propagates, click <strong>Verify DNS & SSL</strong> to automatically issue a free Let's Encrypt certificate via Bunny API.
                      </li>
                    </ol>
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

                  {/* DNS Instructions Table */}
                  <div className="sq-dns-instructions-card">
                    <div className="sq-dns-instructions-title">Required DNS Record</div>
                    <div className="sq-dns-table">
                      <div className="sq-dns-row sq-dns-head">
                        <span>Type</span>
                        <span>Host</span>
                        <span>Value / Target</span>
                        <span>Status</span>
                      </div>
                      <div className="sq-dns-row">
                        <span className="sq-dns-cell-type">CNAME</span>
                        <span className="sq-dns-cell-host">{customDomain.hostname}</span>
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

                    {customDomain.error && (
                      <div className="sq-domain-error-callout">⚠️ {customDomain.error}</div>
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
                  <div className="sq-bunny-deploy-title">Bunny CDN Deployment</div>
                  <div className="sq-bunny-deploy-desc">
                    Build production static files and upload to Bunny Storage Zone with automatic cache purge.
                  </div>
                </div>
              </div>

              <div className="sq-deploy-actions">
                <button
                  type="button"
                  className="sq-btn-deploy-bunny"
                  onClick={handleTriggerDeploy}
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
          onTriggerDeploy={handleTriggerDeploy}
          isDeploying={isDeploying}
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
