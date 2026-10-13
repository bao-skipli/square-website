import React, { useState } from "react";
import {
  DotsDragHandleIcon,
  SlidersIcon,
  TrashIcon,
  CloseXIcon,
} from "@/components/ui/Icon";
import ModifierOverrideModal from "./ModifierOverrideModal";
import "./ItemModifiersSection.css";

function ItemModifiersChecklistModal({
  isOpen,
  onClose,
  allModifierSets = [],
  appliedSetIds = [],
  onApply,
}) {
  const [selectedMap, setSelectedMap] = useState({});

  React.useEffect(() => {
    if (!isOpen) return;
    const initial = {};
    appliedSetIds.forEach((id) => {
      initial[id] = true;
    });
    setSelectedMap(initial);
  }, [isOpen, appliedSetIds]);

  if (!isOpen) return null;

  const handleToggle = (id) => {
    setSelectedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSave = () => {
    const nextSetIds = Object.keys(selectedMap).filter((id) => selectedMap[id]);
    onApply(nextSetIds);
    onClose();
  };

  return (
    <div className="sq-popup-modal-backdrop" onClick={onClose}>
      <div
        className="sq-popup-modal-card sq-item-mods-checklist-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Edit Item Modifiers"
      >
        <div className="sq-popup-modal-header">
          <button
            type="button"
            className="sq-modal-circle-close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseXIcon />
          </button>
          <button
            type="button"
            className="sq-modal-btn-done is-active"
            onClick={handleSave}
          >
            Done
          </button>
        </div>

        <h2 className="sq-popup-modal-title">Modifiers</h2>

        <div className="sq-item-mods-checklist-list">
          {allModifierSets.length === 0 ? (
            <div className="sq-item-mods-empty-notice">
              No modifier sets available. Create sets in the Modifiers library first.
            </div>
          ) : (
            allModifierSets.map((set) => {
              const isChecked = Boolean(selectedMap[set.id]);
              return (
                <label key={set.id} className="sq-item-mods-checklist-row">
                  <input
                    type="checkbox"
                    className="sq-submodal-checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(set.id)}
                  />
                  <div className="sq-item-mods-checklist-label-col">
                    <span className="sq-item-mods-checklist-name">{set.name}</span>
                    <span className="sq-item-mods-checklist-desc">
                      {set.type === "text"
                        ? "Text modifier"
                        : set.modifiers
                        ? Object.values(set.modifiers).map((m) => m.name).join(", ")
                        : "No modifiers"}
                    </span>
                  </div>
                </label>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function ItemModifiersSection({
  itemId,
  itemName = "",
  itemModifierSetsMap = {},
  allModifierSets = [],
  onApplyItemModifierSets,
  onRemoveItemModifierSet,
  onSaveItemModifierOverrides,
  onReorderItemModifierSets,
}) {
  const [activeTab, setActiveTab] = useState("default"); // "default" | "kitchen"
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [overrideModalSet, setOverrideModalSet] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [setToRemove, setSetToRemove] = useState(null);

  // Applied sets with their overrides and order
  const appliedSetIds = Object.keys(itemModifierSetsMap || {});

  // Match with catalog modifierSets
  const appliedSetsList = appliedSetIds
    .map((setId) => {
      const setMeta = itemModifierSetsMap[setId] || {};
      const catalogSet = allModifierSets.find((s) => s.id === setId);
      if (!catalogSet) return null; // Orphaned reference
      return {
        ...catalogSet,
        itemMeta: setMeta,
        order: setMeta.order ?? 0,
        overrides: setMeta.overrides || null,
      };
    })
    .filter(Boolean);

  appliedSetsList.sort((a, b) => a.order - b.order);

  const getModifiersSummary = (set) => {
    if (set.type === "text") {
      const limit = set.textSettings?.charLimit || 150;
      return `Text · ${limit} chars`;
    }
    if (!set.modifiers) return "";
    return Object.values(set.modifiers).map((m) => m.name).join(", ");
  };

  const getStatusText = (set) => {
    const isRequired = set.overrides?.selectionRules?.required ?? Boolean(set.selectionRules?.required);
    const isMultiple = set.overrides?.selectionRules?.allowMultiple ?? Boolean(set.selectionRules?.allowMultiple);

    const reqLabel = isRequired ? "Required" : "Optional";
    const multLabel = isMultiple ? "Multiple" : "1 max";
    return `${reqLabel}/${multLabel}`;
  };

  const handleDragStart = (e, idx) => {
    setDraggedIndex(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) {
      setDraggedIndex(null);
      return;
    }

    const reordered = [...appliedSetsList];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIdx, 0, moved);

    setDraggedIndex(null);
    if (onReorderItemModifierSets) {
      onReorderItemModifierSets(reordered.map((s) => s.id));
    }
  };

  const handleRemoveSet = (set) => {
    setSetToRemove(set);
  };

  return (
    <div className="sq-item-modifiers-section">
      {/* Header */}
      <div className="sq-item-mods-header">
        <h3 className="sq-item-mods-title">Modifiers</h3>
        <button
          type="button"
          className="sq-item-mods-link-edit"
          onClick={() => setIsChecklistModalOpen(true)}
        >
          Edit
        </button>
      </div>

      {/* Tabs */}
      <div className="sq-item-mods-tabs">
        <button
          type="button"
          className={`sq-item-mods-tab-btn ${activeTab === "default" ? "is-active" : ""}`}
          onClick={() => setActiveTab("default")}
        >
          Item Default
        </button>
        <button
          type="button"
          className={`sq-item-mods-tab-btn ${activeTab === "kitchen" ? "is-active" : ""}`}
          onClick={() => setActiveTab("kitchen")}
        >
          Kitchen Override
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "default" ? (
        <div className="sq-item-mods-list">
          {appliedSetsList.length === 0 ? (
            <div className="sq-item-mods-empty-state">
              No modifiers applied
            </div>
          ) : (
            appliedSetsList.map((set, idx) => (
              <div
                key={set.id}
                className="sq-item-mod-row"
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
              >
                <div className="sq-item-mod-drag-handle" title="Drag to reorder">
                  <DotsDragHandleIcon size={16} color="#71717a" />
                </div>

                <div className="sq-item-mod-info-col">
                  <div className="sq-item-mod-name">{set.name}</div>
                  <div className="sq-item-mod-summary">{getModifiersSummary(set)}</div>
                </div>

                <div className="sq-item-mod-status-col">
                  <div className="sq-item-mod-status-text">{getStatusText(set)}</div>
                  <div className="sq-item-mod-location-text">Skipli</div>
                </div>

                <div className="sq-item-mod-actions-col">
                  <button
                    type="button"
                    className="sq-btn-item-mod-icon"
                    title="Customize item overrides"
                    onClick={() => setOverrideModalSet(set)}
                  >
                    <SlidersIcon size={17} color="#52525b" />
                  </button>
                  <button
                    type="button"
                    className="sq-btn-item-mod-icon is-trash"
                    title="Remove from item"
                    onClick={() => handleRemoveSet(set)}
                  >
                    <TrashIcon size={17} color="#52525b" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Kitchen Override Placeholder Tab */
        <div className="sq-item-mods-kitchen-placeholder">
          <p className="sq-kitchen-placeholder-text">
            Kitchen overrides allow custom printing rules and station routing for this item.
          </p>
        </div>
      )}

      {/* Checklist popup modal */}
      <ItemModifiersChecklistModal
        isOpen={isChecklistModalOpen}
        onClose={() => setIsChecklistModalOpen(false)}
        allModifierSets={allModifierSets}
        appliedSetIds={appliedSetIds}
        onApply={(nextIds) => onApplyItemModifierSets(nextIds, appliedSetIds)}
      />

      {/* Override Fullscreen Modal */}
      {overrideModalSet && (
        <ModifierOverrideModal
          isOpen={Boolean(overrideModalSet)}
          onClose={() => setOverrideModalSet(null)}
          modifierSet={overrideModalSet}
          itemName={itemName}
          initialOverrides={overrideModalSet.overrides}
          onSaveOverrides={(setId, overrides) =>
            onSaveItemModifierOverrides(setId, overrides)
          }
        />
      )}

      {/* Remove Modifier Set Confirmation Modal */}
      {setToRemove && (
        <div className="sq-popup-modal-backdrop" style={{ zIndex: 99999 }}>
          <div
            className="sq-unsaved-changes-modal"
            role="alertdialog"
            aria-modal="true"
            aria-label="Remove modifier set"
          >
            <h2 className="sq-unsaved-title">Remove modifier set</h2>
            <p className="sq-unsaved-message">
              Remove modifier set “{setToRemove.name}” from this item?
            </p>
            <div className="sq-unsaved-actions">
              <button
                type="button"
                className="sq-btn-unsaved-resume"
                onClick={() => setSetToRemove(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sq-btn-unsaved-discard"
                onClick={() => {
                  const id = setToRemove.id;
                  setSetToRemove(null);
                  if (onRemoveItemModifierSet) {
                    onRemoveItemModifierSet(id);
                  }
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
