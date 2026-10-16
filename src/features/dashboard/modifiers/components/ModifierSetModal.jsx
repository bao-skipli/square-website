import React, { useState, useEffect, useRef } from "react";
import {
  CloseXIcon,
  ChevronDownIcon,
  TrashIcon,
  StoreIcon,
  ChannelsGridIcon,
} from "@/components/ui/Icon";
import Toggle from "@/components/ui/Toggle";
import { UnsavedChangesModal } from "@/features/dashboard/common";
import ModifierListEditor from "./ModifierListEditor";
import LocationsSelectModal from "./LocationsSelectModal";
import ChannelsSelectModal from "./ChannelsSelectModal";
import DashboardLoading from "@/components/Dashboard/DashboardLoading";
import "./ModifierSetModal.css";

const MODIFIER_TYPES = [
  {
    key: "list",
    title: "List modifier",
    desc: "Customers can make a selection from a list of choices",
  },
  {
    key: "text",
    title: "Text modifier",
    desc: "Customers answer a prompt by typing into a text box\nWebsites, Kiosks, Ordering profiles, and payment links only",
  },
];

function getInitialModifiers(data) {
  if (!data?.modifiers) return [];
  const list = Array.isArray(data.modifiers)
    ? data.modifiers
    : Object.values(data.modifiers);
  return list.filter(Boolean).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export default function ModifierSetModal({
  isOpen,
  onClose,
  editingModifierSetId = null,
  initialData = null,
  locations = [{ id: "loc-skipli", name: "Skipli" }],
  modifierSets = [],
  onSave,
  onDelete,
}) {
  const [name, setName] = useState(() => initialData?.name || "");
  const [displayName, setDisplayName] = useState(() => initialData?.displayName || "");
  const [type, setType] = useState(() => initialData?.type || "list");
  const [locationIds, setLocationIds] = useState(() => initialData?.locationIds || { allLocations: true });
  const [channels, setChannels] = useState(() => initialData?.channels || { all: true, pointsOfSale: true });
  const [modifiers, setModifiers] = useState(() => getInitialModifiers(initialData));
  const [selectionRules, setSelectionRules] = useState(() => initialData?.selectionRules || {
    required: false,
    allowMultiple: false,
  });
  const [displaySettings, setDisplaySettings] = useState(() => initialData?.displaySettings || {
    hideOnReceipts: false,
    conversational: false,
    sortSoldOutLast: false,
  });
  const [textSettings, setTextSettings] = useState(() => initialData?.textSettings || {
    charLimit: 150,
    required: false,
  });

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isLocationsModalOpen, setIsLocationsModalOpen] = useState(false);
  const [isChannelsModalOpen, setIsChannelsModalOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [rowErrors, setRowErrors] = useState({});

  const initialSnapshotRef = useRef(
    JSON.stringify({
      name: initialData?.name || "",
      displayName: initialData?.displayName || "",
      type: initialData?.type || "list",
      locationIds: initialData?.locationIds || { allLocations: true },
      channels: initialData?.channels || { all: true, pointsOfSale: true },
      modifiers: getInitialModifiers(initialData),
      selectionRules: initialData?.selectionRules || { required: false, allowMultiple: false },
      displaySettings: initialData?.displaySettings || {
        hideOnReceipts: false,
        conversational: false,
        sortSoldOutLast: false,
      },
      textSettings: initialData?.textSettings || { charLimit: 150, required: false },
    })
  );
  const typeDropdownRef = useRef(null);
  const actionsRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setName(initialData.name || "");
      setDisplayName(initialData.displayName || "");
      setType(initialData.type || "list");
      setLocationIds(initialData.locationIds || { allLocations: true });
      setChannels(initialData.channels || { all: true, pointsOfSale: true });

      const rawMods = getInitialModifiers(initialData);
      setModifiers(rawMods);

      const initRules = initialData.selectionRules || { required: false, allowMultiple: false };
      const initDisplay = initialData.displaySettings || {
        hideOnReceipts: false,
        conversational: false,
        sortSoldOutLast: false,
      };
      const initText = initialData.textSettings || { charLimit: 150, required: false };

      setSelectionRules(initRules);
      setDisplaySettings(initDisplay);
      setTextSettings(initText);

      initialSnapshotRef.current = JSON.stringify({
        name: initialData.name || "",
        displayName: initialData.displayName || "",
        type: initialData.type || "list",
        locationIds: initialData.locationIds || { allLocations: true },
        channels: initialData.channels || { all: true, pointsOfSale: true },
        modifiers: rawMods,
        selectionRules: initRules,
        displaySettings: initDisplay,
        textSettings: initText,
      });
    } else {
      setName("");
      setDisplayName("");
      setType("list");
      setLocationIds({ allLocations: true });
      setChannels({ all: true, pointsOfSale: true });
      setModifiers([]);
      setSelectionRules({ required: false, allowMultiple: false });
      setDisplaySettings({
        hideOnReceipts: false,
        conversational: false,
        sortSoldOutLast: false,
      });
      setTextSettings({ charLimit: 150, required: false });

      initialSnapshotRef.current = JSON.stringify({
        name: "",
        displayName: "",
        type: "list",
        locationIds: { allLocations: true },
        channels: { all: true, pointsOfSale: true },
        modifiers: [],
        selectionRules: { required: false, allowMultiple: false },
        displaySettings: {
          hideOnReceipts: false,
          conversational: false,
          sortSoldOutLast: false,
        },
        textSettings: { charLimit: 150, required: false },
      });
    }

    setFormError("");
    setRowErrors({});
    setIsSaving(false);
    setIsTypeDropdownOpen(false);
    setIsActionsOpen(false);
    setIsUnsavedModalOpen(false);
  }, [isOpen, initialData]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setIsTypeDropdownOpen(false);
      }
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isUnsavedModalOpen || isDeleteModalOpen || isLocationsModalOpen || isChannelsModalOpen) {
          return;
        }
        handleCloseAttempt();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isUnsavedModalOpen, isDeleteModalOpen, isLocationsModalOpen, isChannelsModalOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean((initialData && initialData.id) || editingModifierSetId);

  const hasUnsavedChanges = () => {
    const currentSnapshot = JSON.stringify({
      name,
      displayName,
      type,
      locationIds,
      channels,
      modifiers: modifiers.filter((m) => !m.isPlaceholder),
      selectionRules,
      displaySettings,
      textSettings,
    });
    return currentSnapshot !== initialSnapshotRef.current;
  };

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges()) {
      setIsUnsavedModalOpen(true);
    } else {
      onClose();
    }
  };

  const getLocationSummary = () => {
    if (locationIds.allLocations) return "Skipli";
    const names = Object.keys(locationIds)
      .filter((k) => locationIds[k])
      .map((k) => locations.find((l) => l.id === k)?.name || k);
    return names.length > 0 ? names.join(", ") : "Skipli";
  };

  const getChannelsSummary = () => {
    if (channels.all) return "Points of sale";
    const selected = [];
    if (channels.pointsOfSale) selected.push("Points of sale");
    if (channels.online) selected.push("Online");
    if (channels.kiosk) selected.push("Kiosk");
    return selected.length > 0 ? selected.join(", ") : "Points of sale";
  };

  const isSingleLocation =
    Boolean(locationIds.allLocations && locations.length === 1) ||
    Object.keys(locationIds).filter((k) => k !== "allLocations" && locationIds[k]).length === 1;

  const handleValidateAndSave = async (e) => {
    if (e) e.preventDefault();
    if (isSaving) return;

    setFormError("");
    const newRowErrors = {};

    if (!name.trim()) {
      setFormError("Name is required");
      return;
    }

    if (type === "list") {
      const realModifiers = modifiers.filter((m) => !m.isPlaceholder);
      if (realModifiers.length === 0) {
        setFormError("Please add at least one modifier to the list");
        return;
      }

      realModifiers.forEach((m) => {
        if (!m.name || !m.name.trim()) {
          newRowErrors[m.id] = "Modifier name cannot be empty";
        }
      });

      if (Object.keys(newRowErrors).length > 0) {
        setRowErrors(newRowErrors);
        setFormError("Please fix empty modifier names before saving");
        return;
      }
    } else if (type === "text") {
      const limit = parseInt(textSettings.charLimit, 10);
      if (isNaN(limit) || limit < 1 || limit > 500) {
        setFormError("Character limit must be an integer between 1 and 500");
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        ...(initialData || {}),
        name: name.trim(),
        displayName: (displayName.trim() || name.trim()),
        type,
        locationIds: type === "text" ? { allLocations: true } : locationIds,
        channels: type === "text" ? null : channels,
        modifiers: type === "text" ? null : modifiers.filter((m) => !m.isPlaceholder),
        selectionRules: type === "text" ? null : selectionRules,
        displaySettings: type === "text" ? null : displaySettings,
        textSettings: type === "text" ? textSettings : null,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error("Failed to save modifier set:", err);
      setFormError(err.message || "Failed to save modifier set. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSet = () => {
    setIsActionsOpen(false);
    setIsDeleteModalOpen(true);
  };

  return (
    <div
      className="sq-mod-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? "Edit modifier set" : "Create modifier set"}
    >
<div className="sq-mod-modal-header">
        <button
          type="button"
          className="sq-mod-modal-close-btn"
          onClick={handleCloseAttempt}
          aria-label="Close"
        >
          <CloseXIcon size={18} />
        </button>

        <div className="sq-mod-modal-header-right">
          {isEditing && (
            <div className="sq-mod-actions-wrapper" ref={actionsRef}>
              <button
                type="button"
                className="sq-btn-actions"
                onClick={() => setIsActionsOpen(!isActionsOpen)}
              >
                Actions
                <ChevronDownIcon size={14} />
              </button>
              {isActionsOpen && (
                <div className="sq-actions-dropdown-menu">
                  <button
                    type="button"
                    className="sq-actions-dropdown-item is-danger"
                    onClick={handleDeleteSet}
                  >
                    <TrashIcon size={15} color="#dc2626" />
                    <span>Delete modifier set</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="sq-btn-save-pill"
            onClick={handleValidateAndSave}
            disabled={isSaving || (isEditing && !initialData)}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

<div className="sq-mod-modal-scroll-body">
        {isEditing && !initialData ? (
          <div className="sq-mod-modal-loading-wrapper">
            <DashboardLoading message="Loading modifier set..." />
          </div>
        ) : (
          <div className="sq-mod-form-container">
<h1 className="sq-mod-form-title">
              {isEditing ? "Edit modifier set" : "Create modifier set"}
            </h1>

          {formError && <div className="sq-mod-global-error">{formError}</div>}

<div className="sq-mod-field-block">
            <input
              type="text"
              className={`sq-mod-input-lg ${!name.trim() && formError ? "is-invalid" : ""}`}
              placeholder="Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError("");
              }}
              autoFocus
            />
          </div>

<div className="sq-mod-two-col-row">
            <div className="sq-mod-field-block" style={{ marginBottom: 0 }}>
              <input
                type="text"
                className="sq-mod-input"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="sq-mod-type-dropdown-wrapper" ref={typeDropdownRef}>
              <button
                type="button"
                className={`sq-mod-type-selector-btn ${isTypeDropdownOpen ? "is-active" : ""}`}
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                aria-haspopup="listbox"
                aria-expanded={isTypeDropdownOpen}
              >
                <div className="sq-mod-type-btn-content">
                  <span className="sq-mod-type-inner-label">
                    What kind of modifier set is this?
                  </span>
                  <span className="sq-mod-type-inner-val">
                    {type === "text" ? "Text modifier" : "List modifier"}
                  </span>
                </div>
                <ChevronDownIcon
                  size={14}
                  color="#18181b"
                  className={isTypeDropdownOpen ? "is-rotated-180" : ""}
                />
              </button>

              {isTypeDropdownOpen && (
                <div className="sq-mod-type-dropdown-menu" role="listbox">
                  {MODIFIER_TYPES.map((t) => (
                    <div
                      key={t.key}
                      className={`sq-mod-type-option ${type === t.key ? "is-selected" : ""}`}
                      onClick={() => {
                        setType(t.key);
                        setIsTypeDropdownOpen(false);
                      }}
                      role="option"
                      aria-selected={type === t.key}
                    >
                      <div className="sq-mod-type-option-title">{t.title}</div>
                      <div className="sq-mod-type-option-desc">{t.desc}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

{type === "text" && (
            <p className="sq-mod-text-info-note">
              Text modifiers are only available on Websites, Kiosks, Ordering profiles, and payment links.
            </p>
          )}

<div className="sq-mod-info-row">
            <div className="sq-mod-info-left">
              <span className="sq-mod-info-icon">
                <StoreIcon size={20} color="#18181b" />
              </span>
              <div className="sq-mod-info-text-col">
                <div className="sq-mod-info-title-badge">
                  <span className="sq-mod-info-label">Locations</span>
                  <span className="sq-mod-badge-pill">All</span>
                </div>
                <div className="sq-mod-info-value">{getLocationSummary()}</div>
              </div>
            </div>
            <button
              type="button"
              className="sq-mod-link-edit"
              onClick={() => setIsLocationsModalOpen(true)}
            >
              Edit
            </button>
          </div>

{type === "list" && (
            <div className="sq-mod-info-row">
              <div className="sq-mod-info-left">
                <span className="sq-mod-info-icon">
                  <ChannelsGridIcon size={20} color="#18181b" />
                </span>
                <div className="sq-mod-info-text-col">
                  <div className="sq-mod-info-title-badge">
                    <span className="sq-mod-info-label">Channels</span>
                    <span className="sq-mod-badge-pill">All</span>
                  </div>
                  <div className="sq-mod-info-value">{getChannelsSummary()}</div>
                </div>
              </div>
              <button
                type="button"
                className="sq-mod-link-edit"
                onClick={() => setIsChannelsModalOpen(true)}
              >
                Edit
              </button>
            </div>
          )}

          <div className="sq-divider-thick-block" />

{type === "list" ? (
            <>
<ModifierListEditor
                modifiers={modifiers}
                onChange={setModifiers}
                showAvailability={isSingleLocation}
                validationErrors={rowErrors}
                modifierSets={modifierSets}
                currentModifierSetId={initialData?.id || editingModifierSetId}
                locations={locations}
              />

              <div className="sq-divider-thick-block" />

<div className="sq-mod-rules-section">
                <h3 className="sq-mod-section-title">Selection rules</h3>
                <p className="sq-mod-section-subdesc">
                  These settings are the default for the modifier set. You can override them for a specific item after applying the set.{" "}
                  <a href="#learn" className="sq-mod-link-underline">Learn more</a>
                </p>

                <div className="sq-mod-rules-box-highlight">
                  <div className="sq-mod-toggle-info">
                    <span className="sq-mod-toggle-title">Require a selection</span>
                  </div>
                  <Toggle
                    checked={selectionRules.required}
                    onChange={(val) =>
                      setSelectionRules((prev) => ({ ...prev, required: val }))
                    }
                  />
                </div>

                <div className="sq-mod-toggle-row">
                  <div className="sq-mod-toggle-info">
                    <span className="sq-mod-toggle-title">
                      Allow more than one modifier to be selected
                    </span>
                  </div>
                  <Toggle
                    checked={selectionRules.allowMultiple}
                    onChange={(val) =>
                      setSelectionRules((prev) => ({ ...prev, allowMultiple: val }))
                    }
                  />
                </div>
              </div>

              <div className="sq-divider-thick-block" />

<div className="sq-mod-display-section">
                <h3 className="sq-mod-section-title">Modifier display settings</h3>

                <div className="sq-mod-toggle-row">
                  <div className="sq-mod-toggle-info">
                    <span className="sq-mod-toggle-title">
                      Hide modifiers on customer receipts
                    </span>
                    <span className="sq-mod-toggle-desc">
                      Modifiers from this set won't show on customer receipts
                    </span>
                  </div>
                  <Toggle
                    checked={displaySettings.hideOnReceipts}
                    onChange={(val) =>
                      setDisplaySettings((prev) => ({ ...prev, hideOnReceipts: val }))
                    }
                  />
                </div>

                <div className="sq-mod-toggle-row">
                  <div className="sq-mod-toggle-info">
                    <span className="sq-mod-toggle-title">
                      Use conversational modifiers on POS
                    </span>
                    <span className="sq-mod-toggle-desc">
                      Modifier operators ("Add", "Extra", "No", etc.) will appear when viewing this modifier set with the Restaurant POS.
                    </span>
                  </div>
                  <Toggle
                    checked={displaySettings.conversational}
                    onChange={(val) =>
                      setDisplaySettings((prev) => ({ ...prev, conversational: val }))
                    }
                  />
                </div>

                <div className="sq-mod-toggle-row">
                  <div className="sq-mod-toggle-info">
                    <span className="sq-mod-toggle-title">
                      Sort sold-out modifiers last during checkout on the POS
                    </span>
                    <span className="sq-mod-toggle-desc">
                      Sold-out modifier options will appear below available modifiers on POS checkout flow.
                    </span>
                  </div>
                  <Toggle
                    checked={displaySettings.sortSoldOutLast}
                    onChange={(val) =>
                      setDisplaySettings((prev) => ({ ...prev, sortSoldOutLast: val }))
                    }
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="sq-mod-text-settings-section">
              <h3 className="sq-mod-section-title">Settings</h3>

              <div className="sq-mod-text-setting-row">
                <span className="sq-mod-text-setting-label">Character limit</span>
                <input
                  type="number"
                  className="sq-mod-char-limit-input"
                  min="1"
                  max="500"
                  value={textSettings.charLimit}
                  onChange={(e) =>
                    setTextSettings((prev) => ({
                      ...prev,
                      charLimit: parseInt(e.target.value, 10) || "",
                    }))
                  }
                />
              </div>

              <div className="sq-mod-toggle-row" style={{ marginTop: "16px" }}>
                <div className="sq-mod-toggle-info">
                  <span className="sq-mod-toggle-title">Modifier is required</span>
                  <span className="sq-mod-toggle-desc">
                    Buyers will be required to complete the modifier to purchase
                  </span>
                </div>
                <Toggle
                  checked={textSettings.required}
                  onChange={(val) =>
                    setTextSettings((prev) => ({ ...prev, required: val }))
                  }
                />
              </div>
            </div>
          )}
        </div>
        )}
      </div>

<LocationsSelectModal
        isOpen={isLocationsModalOpen}
        onClose={() => setIsLocationsModalOpen(false)}
        initialLocations={locationIds}
        locations={locations}
        onApply={(updated) => setLocationIds(updated)}
      />

      <ChannelsSelectModal
        isOpen={isChannelsModalOpen}
        onClose={() => setIsChannelsModalOpen(false)}
        initialChannels={channels}
        onApply={(updated) => setChannels(updated)}
      />

<UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onDiscard={() => {
          setIsUnsavedModalOpen(false);
          onClose();
        }}
        onResume={() => setIsUnsavedModalOpen(false)}
      />

{isDeleteModalOpen && (
        <div className="sq-popup-modal-backdrop" style={{ zIndex: 99999 }}>
          <div
            className="sq-unsaved-changes-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Delete modifier set"
          >
            <h2 className="sq-unsaved-title">Delete modifier set</h2>
            <p className="sq-unsaved-message">
              Are you sure you want to delete the modifier set "{name}"? This will remove it from all items.
            </p>
            <div className="sq-unsaved-actions">
              <button
                type="button"
                className="sq-btn-unsaved-resume"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sq-btn-unsaved-discard"
                style={{ backgroundColor: "#dc2626", color: "#ffffff" }}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  if (onDelete && initialData?.id) {
                    onDelete(initialData.id);
                    onClose();
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
