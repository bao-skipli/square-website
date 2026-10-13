import React, { useEffect, useRef } from "react";

const PALETTE = [
  { label: "Default", color: null, bg: "#f4f4f5", border: "#d4d4d8" },
  { label: "Blue", color: "#3b82f6", bg: "#3b82f6" },
  { label: "Green", color: "#10b981", bg: "#10b981" },
  { label: "Amber", color: "#f59e0b", bg: "#f59e0b" },
  { label: "Red", color: "#ef4444", bg: "#ef4444" },
  { label: "Purple", color: "#8b5cf6", bg: "#8b5cf6" },
  { label: "Pink", color: "#ec4899", bg: "#ec4899" },
  { label: "Dark", color: "#18181b", bg: "#18181b" },
];

export default function ModifierAppearancePicker({
  isOpen,
  onClose,
  currentColor,
  onSelectColor,
}) {
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="sq-mod-appearance-popover"
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sq-mod-appearance-title">Tile Color on POS</div>
      <div className="sq-mod-appearance-palette">
        {PALETTE.map((item) => {
          const isSelected = currentColor === item.color || (!currentColor && !item.color);
          return (
            <button
              key={item.label}
              type="button"
              className={`sq-mod-appearance-swatch ${isSelected ? "is-selected" : ""}`}
              style={{ backgroundColor: item.bg, borderColor: item.border || item.bg }}
              title={item.label}
              onClick={() => {
                onSelectColor(item.color);
                onClose();
              }}
            >
              {isSelected && <span className="sq-mod-appearance-check">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
