import React, { useState, useEffect } from "react";
import { CloseXIcon } from "@/components/ui/Icon";

export default function LocationsSelectModal({
  isOpen,
  onClose,
  initialLocations = { allLocations: true },
  locations = [{ id: "loc-skipli", name: "Skipli" }],
  onApply,
}) {
  const [selected, setSelected] = useState({ ...initialLocations });

  useEffect(() => {
    setSelected({ ...initialLocations });
  }, [initialLocations, isOpen]);

  if (!isOpen) return null;

  const isAll = selected.allLocations || Object.keys(selected).filter(k => k !== "allLocations" && selected[k]).length === locations.length;

  const handleToggleAll = () => {
    if (isAll) {
      setSelected({});
    } else {
      const allMap = { allLocations: true };
      locations.forEach(l => { allMap[l.id] = true; });
      setSelected(allMap);
    }
  };

  const handleToggleLoc = (id) => {
    const next = { ...selected };
    delete next.allLocations;
    next[id] = !next[id];
    const trueCount = Object.keys(next).filter(k => next[k]).length;
    if (trueCount === locations.length) {
      next.allLocations = true;
    }
    setSelected(next);
  };

  const handleSave = () => {
    onApply(selected);
    onClose();
  };

  return (
    <div className="sq-popup-modal-backdrop" onClick={onClose}>
      <div
        className="sq-popup-modal-card sq-submodal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Edit Locations"
      >
        <div className="sq-popup-modal-header">
          <button type="button" className="sq-modal-circle-close" onClick={onClose} aria-label="Close">
            <CloseXIcon />
          </button>
          <button type="button" className="sq-modal-btn-done is-active" onClick={handleSave}>
            Done
          </button>
        </div>

        <h2 className="sq-popup-modal-title">Locations</h2>

        <div className="sq-submodal-list">
          <label className="sq-submodal-row">
            <input
              type="checkbox"
              className="sq-submodal-checkbox"
              checked={isAll}
              onChange={handleToggleAll}
            />
            <span className="sq-submodal-row-label">All locations</span>
          </label>

          {locations.map((loc) => (
            <label key={loc.id} className="sq-submodal-row">
              <input
                type="checkbox"
                className="sq-submodal-checkbox"
                checked={Boolean(selected.allLocations || selected[loc.id])}
                onChange={() => handleToggleLoc(loc.id)}
              />
              <span className="sq-submodal-row-label">{loc.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
