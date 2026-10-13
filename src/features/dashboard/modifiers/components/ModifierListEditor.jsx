import React, { useState, useRef, useEffect } from "react";
import {
  UploadImageIcon,
  DotsIcon,
} from "@/components/ui/Icon";
import Toggle from "@/components/ui/Toggle";
import ModifierRowMenu from "./ModifierRowMenu";
import ModifierAppearancePicker from "./ModifierAppearancePicker";
import NestedModifierEditor from "./NestedModifierEditor";

function createBlankRow() {
  return {
    id: `mod_row_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: "",
    priceCents: 0,
    preselect: false,
    inStock: true,
    image: null,
    appearance: { color: null },
    nestedSet: null,
    isPlaceholder: true,
  };
}

export default function ModifierListEditor({
  modifiers = [],
  onChange,
  showAvailability = true,
  validationErrors = {},
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeAppearanceId, setActiveAppearanceId] = useState(null);
  const inputRefs = useRef({});
  const fileInputRefs = useRef({});

  const placeholderRowIdRef = useRef(`mod_placeholder_${Date.now()}`);

  // Purely derive rows to display: real modifiers + one trailing placeholder row
  const realModifiers = modifiers.filter((m) => !m.isPlaceholder);
  const placeholderRow = {
    id: placeholderRowIdRef.current,
    name: "",
    priceCents: 0,
    preselect: false,
    inStock: true,
    image: null,
    appearance: { color: null },
    nestedSet: null,
    isPlaceholder: true,
  };
  const rows = [...realModifiers, placeholderRow];

  const handleNameChange = (rowId, val) => {
    if (rowId === placeholderRowIdRef.current) {
      if (val.length > 0) {
        // User typed into the placeholder row -> promote it to a real modifier item
        const newId = `mod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const newRow = {
          id: newId,
          name: val,
          priceCents: 0,
          preselect: false,
          inStock: true,
          image: null,
          appearance: { color: null },
          nestedSet: null,
          isPlaceholder: false,
        };
        // Reset placeholder ID for the subsequent trailing row
        placeholderRowIdRef.current = `mod_placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        onChange([...realModifiers, newRow]);
        setTimeout(() => {
          if (inputRefs.current[newId]) {
            inputRefs.current[newId].focus();
          }
        }, 0);
      }
      return;
    }

    const next = realModifiers.map((r) => (r.id === rowId ? { ...r, name: val } : r));
    onChange(next);
  };

  const handleNameKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextIndex = index + 1;
      if (rows[nextIndex]) {
        const nextId = rows[nextIndex].id;
        if (inputRefs.current[nextId]) {
          inputRefs.current[nextId].focus();
        }
      }
    }
  };

  const handlePriceChange = (rowId, val) => {
    const cleanNum = val.replace(/[^0-9]/g, "");
    const cents = parseInt(cleanNum, 10) || 0;

    const next = realModifiers.map((r) => {
      if (r.id !== rowId) return r;
      return { ...r, priceCents: cents };
    });
    onChange(next);
  };

  const formatPriceDisplay = (cents) => {
    if (!cents && cents !== 0) return "";
    if (cents === 0) return "";
    return `$${(cents / 100).toFixed(2)}`;
  };

  const handlePreselectChange = (rowId, checked) => {
    const next = realModifiers.map((r) => (r.id === rowId ? { ...r, preselect: checked } : r));
    onChange(next);
  };

  const handleStockChange = (rowId, checked) => {
    const next = realModifiers.map((r) => (r.id === rowId ? { ...r, inStock: checked } : r));
    onChange(next);
  };

  const handleDeleteRow = (rowId) => {
    const next = realModifiers.filter((r) => r.id !== rowId);
    onChange(next);
  };

  const handleAddNestedSet = (rowId) => {
    const next = realModifiers.map((r) => {
      if (r.id !== rowId) return r;
      return {
        ...r,
        nestedSet: {
          id: `nested_${Date.now()}`,
          name: "",
          modifiers: [
            { id: `nested_opt_1`, name: "", priceCents: 0 },
            { id: `nested_opt_2`, name: "", priceCents: 0 },
          ],
        },
      };
    });
    onChange(next);
  };

  const handleNestedSetChange = (rowId, updatedNested) => {
    const next = realModifiers.map((r) => (r.id === rowId ? { ...r, nestedSet: updatedNested } : r));
    onChange(next);
  };

  const handleRemoveNestedSet = (rowId) => {
    const next = realModifiers.map((r) => (r.id === rowId ? { ...r, nestedSet: null } : r));
    onChange(next);
  };

  const handleImageSelect = (rowId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const img = new Image();
      img.onload = () => {
        // Resize to maximum 120x120 thumbnail for smooth local RTDB storage
        const canvas = document.createElement("canvas");
        const maxDim = 120;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

        const next = realModifiers.map((r) => (r.id === rowId ? { ...r, image: dataUrl } : r));
        onChange(next);
      };
      img.src = loadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAppearanceColor = (rowId, color) => {
    const next = realModifiers.map((r) =>
      r.id === rowId ? { ...r, appearance: { color } } : r
    );
    onChange(next);
  };

  return (
    <div className="sq-mod-list-section">
      <h3 className="sq-mod-list-section-title">Modifier list</h3>

      <div className="sq-mod-list-table-wrapper">
        <table className="sq-mod-list-table">
          <thead>
            <tr>
              <th className="sq-mod-col-photo" aria-label="Photo"></th>
              <th className="sq-mod-col-name">Name</th>
              <th className="sq-mod-col-appearance">Appearance</th>
              <th className="sq-mod-col-price">Price</th>
              <th className="sq-mod-col-preselect">Pre-select</th>
              {showAvailability && <th className="sq-mod-col-avail">Availability</th>}
              <th className="sq-mod-col-more" aria-label="More actions"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isPlaceholder = Boolean(row.isPlaceholder);
              const rowError = validationErrors[row.id];

              return (
                <React.Fragment key={row.id}>
                  <tr className={`sq-mod-row ${isPlaceholder ? "is-placeholder-row" : ""}`}>
                    {/* Image cell */}
                    <td className="sq-mod-col-photo">
                      <input
                        type="file"
                        ref={(el) => (fileInputRefs.current[row.id] = el)}
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleImageSelect(row.id, e)}
                      />
                      <button
                        type="button"
                        className="sq-btn-mod-image"
                        title={row.image ? "Change image" : "Add image"}
                        onClick={() => fileInputRefs.current[row.id]?.click()}
                        disabled={isPlaceholder}
                      >
                        {row.image ? (
                          <img src={row.image} alt="Modifier" className="sq-mod-thumb-img" />
                        ) : (
                          <UploadImageIcon size={18} color="#a1a1aa" />
                        )}
                      </button>
                    </td>

                    {/* Name cell */}
                    <td className="sq-mod-col-name">
                      <div className="sq-mod-name-input-wrapper">
                        <input
                          ref={(el) => (inputRefs.current[row.id] = el)}
                          type="text"
                          className={`sq-mod-name-input ${rowError ? "is-invalid" : ""}`}
                          placeholder="New modifier"
                          value={row.name || ""}
                          onChange={(e) => handleNameChange(row.id, e.target.value)}
                          onKeyDown={(e) => handleNameKeyDown(e, idx)}
                          aria-label="Modifier name"
                        />
                        {rowError && <span className="sq-mod-inline-error">{rowError}</span>}
                      </div>
                    </td>

                    {/* Appearance cell */}
                    <td className="sq-mod-col-appearance">
                      <div className="sq-appearance-wrapper">
                        <button
                          type="button"
                          className="sq-link-customize"
                          onClick={() => setActiveAppearanceId(activeAppearanceId === row.id ? null : row.id)}
                          disabled={isPlaceholder}
                        >
                          Customize
                          {row.appearance?.color && (
                            <span
                              className="sq-appearance-color-dot"
                              style={{ backgroundColor: row.appearance.color }}
                            />
                          )}
                        </button>
                        <ModifierAppearancePicker
                          isOpen={activeAppearanceId === row.id}
                          onClose={() => setActiveAppearanceId(null)}
                          currentColor={row.appearance?.color}
                          onSelectColor={(col) => handleAppearanceColor(row.id, col)}
                        />
                      </div>
                    </td>

                    {/* Price cell */}
                    <td className="sq-mod-col-price">
                      <input
                        type="text"
                        className="sq-mod-price-input"
                        placeholder="$0.00"
                        value={formatPriceDisplay(row.priceCents)}
                        onChange={(e) => handlePriceChange(row.id, e.target.value)}
                        disabled={isPlaceholder}
                        aria-label="Modifier price"
                      />
                    </td>

                    {/* Pre-select cell */}
                    <td className="sq-mod-col-preselect">
                      <input
                        type="checkbox"
                        className="sq-mod-preselect-checkbox"
                        checked={Boolean(row.preselect)}
                        onChange={(e) => handlePreselectChange(row.id, e.target.checked)}
                        disabled={isPlaceholder}
                        aria-label="Pre-select modifier"
                      />
                    </td>

                    {/* Availability cell */}
                    {showAvailability && (
                      <td className="sq-mod-col-avail">
                        <div className="sq-mod-avail-wrap">
                          <Toggle
                            checked={row.inStock !== false}
                            onChange={(val) => handleStockChange(row.id, val)}
                            disabled={isPlaceholder}
                            label="In stock"
                          />
                        </div>
                      </td>
                    )}

                    {/* More actions cell */}
                    <td className="sq-mod-col-more">
                      {!isPlaceholder && (
                        <div className="sq-mod-more-wrapper">
                          <button
                            type="button"
                            className="sq-btn-mod-more"
                            onClick={() => setActiveMenuId(activeMenuId === row.id ? null : row.id)}
                            aria-label="More options"
                          >
                            <DotsIcon size={16} color="#52525b" />
                          </button>
                          <ModifierRowMenu
                            isOpen={activeMenuId === row.id}
                            onClose={() => setActiveMenuId(null)}
                            onAddNested={() => handleAddNestedSet(row.id)}
                            onDelete={() => handleDeleteRow(row.id)}
                          />
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Nested set editor (if expanded) */}
                  {row.nestedSet && (
                    <tr className="sq-nested-mod-table-row">
                      <td colSpan={showAvailability ? 7 : 6}>
                        <NestedModifierEditor
                          nestedSet={row.nestedSet}
                          onChange={(updated) => handleNestedSetChange(row.id, updated)}
                          onRemove={() => handleRemoveNestedSet(row.id)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
