import React, { useState, useEffect, useRef } from "react";
import { CloseXIcon, PlusIcon } from "@/components/ui/Icon";
import { UnsavedChangesModal } from "@/features/dashboard/common";
import { auth } from "@/firebase/firebaseConfig";
import {
  saveModifierSet,
  getLocalModifierSets,
  setLocalModifierSets,
} from "@/firebase/modifiersService";

function getLocationDisplay(set, locations = [{ id: "loc-skipli", name: "Skipli" }]) {
  if (!set.locationIds || set.locationIds.allLocations) {
    if (locations.length > 1) return "All locations";
    return locations[0]?.name || "Skipli";
  }
  const locNames = Object.keys(set.locationIds)
    .filter((k) => set.locationIds[k])
    .map((k) => locations.find((l) => l.id === k)?.name || k);
  return locNames.length > 0 ? locNames.join(", ") : "All locations";
}

function getSetOptionsSummary(set) {
  if (set.type === "text") {
    const limit = set.textSettings?.charLimit || 150;
    return `Text · ${limit} chars`;
  }
  if (!set.modifiers) return "No modifiers";
  const modList = Array.isArray(set.modifiers) ? set.modifiers : Object.values(set.modifiers);
  if (modList.length === 0) return "No modifiers";
  return modList.map((m) => m.name).filter(Boolean).join(", ");
}

export default function NestedModifierEditor({
  isOpen,
  onClose,
  initialSelectedSetIds = [],
  allModifierSets = [],
  currentModifierSetId = null,
  locations = [{ id: "loc-skipli", name: "Skipli" }],
  onSave,
}) {
  const [selectedMap, setSelectedMap] = useState({});
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSetName, setNewSetName] = useState("");
  const [createdSets, setCreatedSets] = useState([]);
  const initialSnapshotRef = useRef("");

  useEffect(() => {
    if (!isOpen) return;

    const initial = {};
    (initialSelectedSetIds || []).forEach((id) => {
      if (id) initial[id] = true;
    });

    setSelectedMap(initial);
    initialSnapshotRef.current = JSON.stringify(initial);
    setIsUnsavedModalOpen(false);
    setIsCreating(false);
    setNewSetName("");
  }, [isOpen, initialSelectedSetIds]);

  const hasChanges = () => {
    return JSON.stringify(selectedMap) !== initialSnapshotRef.current;
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
        if (isUnsavedModalOpen) return;
        if (isCreating) {
          setIsCreating(false);
          return;
        }
        handleCloseAttempt();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isUnsavedModalOpen, isCreating, selectedMap]);

  if (!isOpen) return null;

  const baseSets = allModifierSets && allModifierSets.length > 0
    ? allModifierSets
    : getLocalModifierSets();

  const combinedSets = [...createdSets, ...baseSets.filter((s) => !createdSets.some((c) => c.id === s.id))];

  const availableSets = combinedSets.filter((s) => s.id !== currentModifierSetId);

  const handleToggleSet = (setId) => {
    setSelectedMap((prev) => ({
      ...prev,
      [setId]: !prev[setId],
    }));
  };

  const handleDone = () => {
    const selectedSets = availableSets
      .filter((s) => selectedMap[s.id])
      .map((s) => ({
        id: s.id,
        name: s.name,
        displayName: s.displayName || s.name,
        type: s.type || "list",
        selectionRules: s.selectionRules || null,
        modifiers: s.modifiers || null,
        locationIds: s.locationIds || null,
      }));

    if (onSave) {
      onSave(selectedSets);
    }
    onClose();
  };

  const handleDiscard = () => {
    setIsUnsavedModalOpen(false);
    onClose();
  };

  const handleResume = () => {
    setIsUnsavedModalOpen(false);
  };

  const handleQuickCreate = async () => {
    const trimmed = newSetName.trim();
    if (!trimmed) return;

    const newId = `mod_set_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newSet = {
      id: newId,
      name: trimmed,
      displayName: trimmed,
      type: "list",
      locationIds: { allLocations: true },
      channels: { all: true, pointsOfSale: true },
      modifiers: {},
      selectionRules: { required: false, allowMultiple: false },
    };

    try {
      const user = auth?.currentUser;
      await saveModifierSet(user?.uid, newSet);
    } catch (err) {
      console.warn("Could not save to Firebase, updating local modifier sets:", err);
      const local = getLocalModifierSets();
      setLocalModifierSets([newSet, ...local]);
    }

    setCreatedSets((prev) => [newSet, ...prev]);
    setSelectedMap((prev) => ({ ...prev, [newId]: true }));
    setNewSetName("");
    setIsCreating(false);
  };

  return (
    <>
      <div className="sq-popup-modal-backdrop" onClick={handleCloseAttempt}>
        <div
          className="sq-popup-modal-card sq-nested-modal-card"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Edit nested modifier sets"
        >
<div className="sq-popup-modal-header">
            <button
              type="button"
              className="sq-modal-circle-close"
              onClick={handleCloseAttempt}
              aria-label="Close"
            >
              <CloseXIcon size={18} />
            </button>
            <button
              type="button"
              className="sq-modal-btn-done is-active"
              onClick={handleDone}
            >
              Done
            </button>
          </div>

<h2 className="sq-nested-modal-title">Edit nested modifier sets</h2>
          <p className="sq-nested-modal-subtitle">
            Search for modifiers, or select from the list below
          </p>

{isCreating ? (
            <div className="sq-nested-quick-create-box">
              <input
                type="text"
                className="sq-nested-quick-input"
                placeholder="Modifier set name"
                value={newSetName}
                onChange={(e) => setNewSetName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleQuickCreate();
                  if (e.key === "Escape") setIsCreating(false);
                }}
              />
              <div className="sq-nested-quick-btn-group">
                <button
                  type="button"
                  className="sq-nested-quick-btn-cancel"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="sq-nested-quick-btn-submit"
                  onClick={handleQuickCreate}
                  disabled={!newSetName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <div
              className="sq-nested-modal-create-row"
              onClick={() => setIsCreating(true)}
              role="button"
              tabIndex={0}
            >
              <div className="sq-nested-modal-plus-box">
                <PlusIcon size={18} color="#18181b" />
              </div>
              <span className="sq-nested-modal-create-label">
                Create modifier set
              </span>
            </div>
          )}

<div className="sq-nested-modal-divider" />

<div className="sq-nested-modal-list">
            {availableSets.length === 0 ? (
              <div className="sq-nested-modal-empty">
                No modifier sets available. Create one above to get started.
              </div>
            ) : (
              availableSets.map((set) => {
                const isChecked = Boolean(selectedMap[set.id]);
                return (
                  <label
                    key={set.id}
                    className="sq-nested-modal-item-row"
                  >
                    <div className="sq-nested-modal-item-info">
                      <div className="sq-nested-modal-item-name">
                        {set.name}
                      </div>
                      <div className="sq-nested-modal-item-desc">
                        {getSetOptionsSummary(set)}
                      </div>
                    </div>
                    <div className="sq-nested-modal-item-right">
                      <span className="sq-nested-modal-item-location">
                        {getLocationDisplay(set, locations)}
                      </span>
                      <input
                        type="checkbox"
                        className="sq-submodal-checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSet(set.id)}
                        aria-label={`Select ${set.name}`}
                      />
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>

<UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        onDiscard={handleDiscard}
        onResume={handleResume}
        onSave={handleDone}
      />
    </>
  );
}
