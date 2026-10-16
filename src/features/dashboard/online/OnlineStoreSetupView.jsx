import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  subscribeOnlineStore,
  saveOnlineStore,
  generateSlug,
  checkSlugAvailability,
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
