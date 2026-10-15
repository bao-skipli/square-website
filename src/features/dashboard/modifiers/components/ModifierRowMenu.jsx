import React, { useEffect, useRef } from "react";
import { NestedArrowIcon, TrashIcon } from "@/components/ui/Icon";

export default function ModifierRowMenu({
  isOpen,
  onClose,
  onAddNested,
  onDelete,
  hasNested = false,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="sq-mod-row-menu-popover" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="sq-mod-row-menu-item"
        onClick={() => {
          onClose();
          onAddNested();
        }}
      >
        <span className="sq-mod-row-menu-icon">
          <NestedArrowIcon size={16} />
        </span>
        <span className="sq-mod-row-menu-label">
          {hasNested ? "Edit nested modifier sets" : "Add nested modifier set"}
        </span>
      </button>

      <div className="sq-mod-row-menu-divider" />

      <button
        type="button"
        className="sq-mod-row-menu-item is-danger"
        onClick={() => {
          onClose();
          onDelete();
        }}
      >
        <span className="sq-mod-row-menu-icon">
          <TrashIcon size={16} color="#dc2626" />
        </span>
        <span className="sq-mod-row-menu-label">Delete modifier</span>
      </button>
    </div>
  );
}
