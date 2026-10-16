import React, { useState, useEffect } from "react";
import { SearchIcon } from "@/components/ui/Icon";
import "./ApplyToItemsModal.css";

export default function ApplyToItemsModal({
  isOpen,
  onClose,
  modifierSet = null,
  items = [],
  appliedItemIds = [],
  onApply,
}) {
  const [selectedMap, setSelectedMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const initialMap = {};
    appliedItemIds.forEach((id) => {
      initialMap[id] = true;
    });
    setSelectedMap(initialMap);
    setSearchQuery("");
    setIsApplying(false);
    setError("");
  }, [isOpen, appliedItemIds]);

  if (!isOpen || !modifierSet) return null;

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const normName = (item.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normQuery = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normName.includes(normQuery);
  });

  const selectedCount = Object.keys(selectedMap).filter((id) => selectedMap[id]).length;
  const isNoneSelected = selectedCount === 0;
  const isAllSelected = items.length > 0 && selectedCount === items.length;

  const handleToggleItem = (itemId) => {
    setSelectedMap((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleSelectAll = () => {
    const next = { ...selectedMap };
    filteredItems.forEach((item) => {
      next[item.id] = true;
    });
    setSelectedMap(next);
  };

  const handleSelectNone = () => {
    const next = { ...selectedMap };
    filteredItems.forEach((item) => {
      next[item.id] = false;
    });
    setSelectedMap(next);
  };

  const handleSubmit = async () => {
    if (isApplying) return;
    setIsApplying(true);
    setError("");

    const chosenItemIds = Object.keys(selectedMap).filter((id) => selectedMap[id]);
    try {
      await onApply(modifierSet.id, chosenItemIds, appliedItemIds);
      onClose();
    } catch (err) {
      console.error("Failed to apply set to items:", err);
      setError(err.message || "Failed to apply modifier set");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="sq-apply-modal-backdrop" onClick={onClose}>
      <div
        className="sq-apply-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Apply Set to Items"
      >
        {error && (
          <div className="sq-mod-global-error" style={{ margin: "16px 24px 0" }}>
            {error}
          </div>
        )}
<div className="sq-apply-modal-header">
          <h2 className="sq-apply-modal-title">Apply Set to Items</h2>
          <div className="sq-apply-select-links">
            <button
              type="button"
              className={`sq-apply-link-action ${isAllSelected ? "is-disabled" : ""}`}
              onClick={handleSelectAll}
              disabled={isAllSelected}
            >
              Select All
            </button>
            <button
              type="button"
              className={`sq-apply-link-action ${isNoneSelected ? "is-disabled" : ""}`}
              onClick={handleSelectNone}
              disabled={isNoneSelected}
            >
              Select None
            </button>
          </div>
        </div>

<div className="sq-apply-banner">
          The modifier set <strong>{modifierSet.name}</strong> will be applied to{" "}
          <strong>{selectedCount}</strong> items.
        </div>

<div className="sq-apply-search-row">
          <span className="sq-apply-search-icon">
            <SearchIcon size={16} color="#71717a" />
          </span>
          <input
            type="text"
            className="sq-apply-search-input"
            placeholder="Search Items"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

<div className="sq-apply-items-list">
          {filteredItems.length === 0 ? (
            <div className="sq-apply-empty-text">No items found</div>
          ) : (
            filteredItems.map((item) => {
              const isChecked = Boolean(selectedMap[item.id]);
              return (
                <label key={item.id} className="sq-apply-item-row">
                  <input
                    type="checkbox"
                    className="sq-apply-item-checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleItem(item.id)}
                  />
                  <span className="sq-apply-item-name">{item.name}</span>
                </label>
              );
            })
          )}
        </div>

<div className="sq-apply-modal-footer">
          <button
            type="button"
            className="sq-btn-pill-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="sq-btn-pill-apply"
            onClick={handleSubmit}
            disabled={isApplying}
          >
            {isApplying ? "Applying..." : "Apply to Items"}
          </button>
        </div>
      </div>
    </div>
  );
}
