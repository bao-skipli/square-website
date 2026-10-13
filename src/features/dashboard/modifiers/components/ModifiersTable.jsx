import React, { useState } from "react";
import { DragHandleIcon } from "@/components/ui/Icon";

export default function ModifiersTable({
  modifierSets = [],
  locations = [{ id: "loc-skipli", name: "Skipli" }],
  onEditSet,
  onApplyToItems,
  onReorderSets,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const getLocationDisplay = (set) => {
    if (!set.locationIds || set.locationIds.allLocations) {
      if (locations.length > 1) return "All locations";
      return locations[0]?.name || "Skipli";
    }
    const locNames = Object.keys(set.locationIds)
      .filter((k) => set.locationIds[k])
      .map((k) => locations.find((l) => l.id === k)?.name || k);
    return locNames.length > 0 ? locNames.join(", ") : "All locations";
  };

  const getDetailsDisplay = (set) => {
    if (set.type === "text") {
      const limit = set.textSettings?.charLimit || 150;
      return `Text · ${limit} chars`;
    }
    if (!set.modifiers) return "No modifiers";
    const modList = Object.values(set.modifiers);
    if (modList.length === 0) return "No modifiers";
    return modList.map((m) => m.name).join(", ");
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...modifierSets];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);
    if (onReorderSets) {
      onReorderSets(reordered);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="sq-modifiers-table-wrapper">
      <table className="sq-modifiers-table">
        <thead>
          <tr>
            <th className="sq-col-drag" aria-label="Sort"></th>
            <th className="sq-col-name">Name</th>
            <th className="sq-col-type">Type</th>
            <th className="sq-col-location">Location</th>
            <th className="sq-col-details">Details</th>
            <th className="sq-col-actions" aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {modifierSets.map((set, idx) => {
            const isDragging = draggedIndex === idx;
            const isOver = dragOverIndex === idx;

            return (
              <tr
                key={set.id}
                className={`sq-modifiers-row ${isDragging ? "is-dragging" : ""} ${isOver ? "is-drag-over" : ""}`}
                onClick={() => onEditSet(set)}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
              >
                <td
                  className="sq-col-drag"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sq-drag-handle-btn" title="Drag to reorder">
                    <DragHandleIcon size={18} color="#a1a1aa" />
                  </span>
                </td>
                <td className="sq-col-name">
                  <span className="sq-modifier-name-text">{set.name}</span>
                </td>
                <td className="sq-col-type">
                  <span className="sq-modifier-type-text">
                    {set.type === "text" ? "Text" : "List"}
                  </span>
                </td>
                <td className="sq-col-location">
                  <span className="sq-modifier-location-text">
                    {getLocationDisplay(set)}
                  </span>
                </td>
                <td className="sq-col-details">
                  <span className="sq-modifier-details-text" title={getDetailsDisplay(set)}>
                    {getDetailsDisplay(set)}
                  </span>
                </td>
                <td className="sq-col-actions">
                  <button
                    type="button"
                    className="sq-btn-apply-items-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyToItems(set);
                    }}
                  >
                    Apply to Items
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
