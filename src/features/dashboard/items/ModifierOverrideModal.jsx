import React, { useState, useEffect, useRef } from "react";
import { CloseXIcon, ChevronDownIcon } from "@/components/ui/Icon";
import Toggle from "@/components/ui/Toggle";
import { UnsavedChangesModal } from "@/features/dashboard/common";
import "./ModifierOverrideModal.css";

export default function ModifierOverrideModal({
  isOpen,
  onClose,
  modifierSet,
  itemName,
  initialOverrides = null,
  onSaveOverrides,
}) {
  const [preselectMap, setPreselectMap] = useState({});
  const [selectionRules, setSelectionRules] = useState({
    required: false,
    allowMultiple: false,
  });
  const [displaySettings, setDisplaySettings] = useState({
    hideOnReceipts: false,
    conversational: false,
  });
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const actionsRef = useRef(null);
  const initialSnapshotRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !modifierSet) return;

    // Initialize preselects: start with parent set defaults, then apply overrides if present
    const initPreselect = {};
    if (modifierSet.modifiers) {
      Object.values(modifierSet.modifiers).forEach((mod) => {
        initPreselect[mod.id] = Boolean(mod.preselect);
      });
    }

    if (initialOverrides?.preselect) {
      Object.keys(initialOverrides.preselect).forEach((modId) => {
        initPreselect[modId] = Boolean(initialOverrides.preselect[modId]);
      });
    }
    setPreselectMap(initPreselect);

    // Initialize selection rules
    const initRules = {
      required: initialOverrides?.selectionRules?.required ?? Boolean(modifierSet.selectionRules?.required),
      allowMultiple: initialOverrides?.selectionRules?.allowMultiple ?? Boolean(modifierSet.selectionRules?.allowMultiple),
    };
    setSelectionRules(initRules);

    // Initialize display settings
    const initDisplay = {
      hideOnReceipts: initialOverrides?.displaySettings?.hideOnReceipts ?? Boolean(modifierSet.displaySettings?.hideOnReceipts),
      conversational: initialOverrides?.displaySettings?.conversational ?? Boolean(modifierSet.displaySettings?.conversational),
    };
    setDisplaySettings(initDisplay);

    initialSnapshotRef.current = JSON.stringify({
      preselectMap: initPreselect,
      selectionRules: initRules,
      displaySettings: initDisplay,
    });
    setError("");
    setIsActionsOpen(false);
    setIsUnsavedModalOpen(false);
    setIsResetModalOpen(false);
  }, [isOpen, modifierSet, initialOverrides]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasChanges = () => {
    const cur = JSON.stringify({ preselectMap, selectionRules, displaySettings });
    return cur !== initialSnapshotRef.current;
  };

  const handleCloseAttempt = () => {
    if (hasChanges()) {
      setIsUnsavedModalOpen(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isUnsavedModalOpen || isResetModalOpen) return;
        handleCloseAttempt();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isUnsavedModalOpen, isResetModalOpen, preselectMap, selectionRules, displaySettings]);

  if (!isOpen || !modifierSet) return null;

  const modifiersList = modifierSet.modifiers
    ? Object.values(modifierSet.modifiers).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

  const handleTogglePreselect = (modId) => {
    setPreselectMap((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const handleResetToDefaults = () => {
    setIsActionsOpen(false);
    setIsResetModalOpen(true);
  };

  const doResetToDefaults = () => {
    const defaultPreselect = {};
    if (modifierSet.modifiers) {
      Object.values(modifierSet.modifiers).forEach((mod) => {
        defaultPreselect[mod.id] = Boolean(mod.preselect);
      });
    }
    setPreselectMap(defaultPreselect);
    setSelectionRules({
      required: Boolean(modifierSet.selectionRules?.required),
      allowMultiple: Boolean(modifierSet.selectionRules?.allowMultiple),
    });
    setDisplaySettings({
      hideOnReceipts: Boolean(modifierSet.displaySettings?.hideOnReceipts),
      conversational: Boolean(modifierSet.displaySettings?.conversational),
    });
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError("");

    try {
      const overridesPayload = {
        preselect: preselectMap,
        selectionRules: {
          required: selectionRules.required,
          allowMultiple: selectionRules.allowMultiple,
        },
        displaySettings: {
          hideOnReceipts: displaySettings.hideOnReceipts,
          conversational: displaySettings.conversational,
        },
      };

      await onSaveOverrides(modifierSet.id, overridesPayload);
      onClose();
    } catch (err) {
      console.error("Failed to save overrides:", err);
      setError(err.message || "Failed to save overrides");
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (cents) => {
    if (!cents && cents !== 0) return "$0.00";
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div
      className="sq-override-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Edit ${modifierSet.name} settings for ${itemName}`}
    >
      {/* Sticky Header */}
      <div className="sq-override-modal-header">
        <button
          type="button"
          className="sq-override-close-btn"
          onClick={handleCloseAttempt}
          aria-label="Close"
        >
          <CloseXIcon size={18} />
        </button>

        <div className="sq-override-header-right">
          <div className="sq-override-actions-wrapper" ref={actionsRef}>
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
                  className="sq-actions-dropdown-item"
                  onClick={handleResetToDefaults}
                >
                  Reset to set defaults
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="sq-btn-save-pill"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="sq-override-modal-body">
        <div className="sq-override-form-container">
          <h1 className="sq-override-main-title">
            Edit “{modifierSet.name}” settings for “{itemName || "Item"}”
          </h1>
          <p className="sq-override-main-desc">
            Overrides apply only to this item—the modifier set stays the same.{" "}
            <a href="#learn" className="sq-mod-link-underline">Learn more</a>
          </p>

          {error && <div className="sq-mod-global-error">{error}</div>}

          {/* Modifier list table */}
          <div className="sq-override-section">
            <h3 className="sq-override-section-title">Modifier list</h3>
            <table className="sq-override-table">
              <thead>
                <tr>
                  <th className="sq-override-col-name">Name</th>
                  <th className="sq-override-col-price">Price</th>
                  <th className="sq-override-col-preselect">Pre-select</th>
                </tr>
              </thead>
              <tbody>
                {modifiersList.map((mod) => (
                  <tr key={mod.id}>
                    <td className="sq-override-col-name">{mod.name}</td>
                    <td className="sq-override-col-price">{formatPrice(mod.priceCents)}</td>
                    <td className="sq-override-col-preselect">
                      <input
                        type="checkbox"
                        className="sq-override-checkbox"
                        checked={Boolean(preselectMap[mod.id])}
                        onChange={() => handleTogglePreselect(mod.id)}
                        aria-label={`Preselect ${mod.name}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sq-divider-thick-block" />

          {/* Selection Rules */}
          <div className="sq-override-section">
            <h3 className="sq-override-section-title">Selection rules</h3>

            <div className="sq-mod-toggle-row">
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

          {/* Settings */}
          <div className="sq-override-section">
            <h3 className="sq-override-section-title">Settings</h3>

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
          </div>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onDiscard={() => {
          setIsUnsavedModalOpen(false);
          onClose();
        }}
        onResume={() => setIsUnsavedModalOpen(false)}
      />

      {/* Reset to defaults confirmation modal (No window.confirm) */}
      {isResetModalOpen && (
        <div className="sq-popup-modal-backdrop" style={{ zIndex: 99999 }}>
          <div
            className="sq-unsaved-changes-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Reset to defaults"
          >
            <h2 className="sq-unsaved-title">Reset to defaults?</h2>
            <p className="sq-unsaved-message">
              This will reset all overrides for “{modifierSet.name}” on this item back to the default settings.
            </p>
            <div className="sq-unsaved-actions">
              <button
                type="button"
                className="sq-btn-unsaved-resume"
                onClick={() => setIsResetModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sq-btn-unsaved-discard"
                onClick={() => {
                  setIsResetModalOpen(false);
                  doResetToDefaults();
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
