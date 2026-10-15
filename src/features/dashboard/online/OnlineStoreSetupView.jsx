import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  subscribeOnlineStore,
  saveOnlineStore,
  generateSlug,
  checkSlugAvailability,
} from "@/services/onlineStoreService";
import { UnsavedChangesModal } from "@/features/dashboard/common";
import "./OnlineStoreSetupView.css";

// SVG Icons
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

  // Store form state
  const [storeId, setStoreId] = useState(`store_${userId || "guest"}`);
  const [enabled, setEnabled] = useState(false);
  const [name, setName] = useState("Skipli");
  const [logoUrl, setLogoUrl] = useState(null);
  const [slug, setSlug] = useState("skipli");
  const [originalSlug, setOriginalSlug] = useState("skipli");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [locationId, setLocationId] = useState("loc-skipli");
  const [categoryConfigs, setCategoryConfigs] = useState([]);

  const fileInputRef = useRef(null);
  const dragItemIndex = useRef(null);
  const dragOverItemIndex = useRef(null);

  // Count items per category
  const getItemCount = useCallback(
    (cat) => {
      if (!items) return 0;
      return items.filter(
        (i) => i.categoryId === cat.id || i.category === cat.name || i.category === cat.id
      ).length;
    },
    [items]
  );

  // 1. Subscribe to online store data from Firebase / local storage
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
        setSlug(storeData.slug || "skipli");
        setOriginalSlug(storeData.slug || "skipli");
        setLocationId(storeData.locationId || "loc-skipli");

        // Merge categories with saved menu.categories
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

        // Sort by configured order
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

  // Warn on page reload if dirty
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

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle Name Change
  const handleNameChange = (val) => {
    setName(val);
    setIsDirty(true);
    if (!slugManuallyEdited) {
      const suggested = generateSlug(val);
      setSlug(suggested);
      validateSlugInput(suggested);
    }
  };

  // Handle Slug Change
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

  // Handle Logo Upload & Resizing via HTML5 Canvas
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    e.target.value = null;
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    setIsDirty(true);
  };

  // Copy Link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/store/${slug}`;
    navigator.clipboard.writeText(url).then(
      () => setToast({ message: "Store link copied to clipboard!", type: "success" }),
      () => setToast({ message: "Could not copy link", type: "error" })
    );
  };

  // Preview Store in New Tab
  const handlePreviewStore = () => {
    const url = `${window.location.origin}/store/${slug}`;
    window.open(url, "_blank");
  };

  // Category Toggle Visibility
  const handleToggleCategoryVisible = (catId) => {
    setCategoryConfigs((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, visible: !c.visible } : c))
    );
    setIsDirty(true);
  };

  // Category Move Up / Down
  const handleMoveCategory = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categoryConfigs.length) return;

    const updated = [...categoryConfigs];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Update order values
    const reordered = updated.map((c, i) => ({ ...c, order: i }));
    setCategoryConfigs(reordered);
    setIsDirty(true);
  };

  // Drag and drop reordering
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

  // Save Settings
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
      // Re-verify slug uniqueness
      const avail = await checkSlugAvailability(cleanSlug, storeId);
      if (!avail.available) {
        setSlugError(avail.reason);
        setToast({ message: avail.reason || "Store link taken", type: "error" });
        setIsSaving(false);
        return;
      }

      // Convert category configs into menu.categories map
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
        locationId,
        enabled,
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

  // Render Realtime Skeleton while fetching initial store snapshot
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
      {/* Header Bar */}
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

      {/* SECTION 1: Store Status */}
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

      {/* SECTION 2: Store Info */}
      <div className="sq-store-setup-card">
        <h2 className="sq-setup-section-title">Store info</h2>
        <p className="sq-setup-section-desc">
          Set up your branding, link URL, and order location.
        </p>

        {/* Store Name */}
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

        {/* Logo */}
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
                onClick={() => fileInputRef.current?.click()}
              >
                {logoUrl ? "Change logo" : "Upload logo"}
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

        {/* Store Link (slug) */}
        <div className="sq-setup-field-group">
          <label className="sq-setup-label" htmlFor="sq-store-slug-input">
            Store link (slug) <span className="sq-setup-label-req">*</span>
          </label>
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

        {/* Location Dropdown */}
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

      {/* SECTION 3: Menu Display */}
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

      {/* Toast Notification */}
      {toast && (
        <div className={`sq-toast sq-toast--${toast.type}`} role="status">
          {toast.message}
        </div>
      )}

      {/* Unsaved Changes Confirmation Modal */}
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
