import React from "react";
import { TrashIcon, PlusIcon } from "@/components/ui/Icon";

export default function NestedModifierEditor({
  nestedSet,
  onChange,
  onRemove,
}) {
  if (!nestedSet) return null;

  const options = nestedSet.modifiers || [];

  const handleNameChange = (val) => {
    onChange({
      ...nestedSet,
      name: val,
    });
  };

  const handleOptionNameChange = (idx, val) => {
    const next = [...options];
    next[idx] = { ...next[idx], name: val };
    onChange({ ...nestedSet, modifiers: next });
  };

  const handleOptionPriceChange = (idx, val) => {
    // Only numeric
    const cleanNum = val.replace(/[^0-9]/g, "");
    const cents = parseInt(cleanNum, 10) || 0;
    const next = [...options];
    next[idx] = { ...next[idx], priceCents: cents };
    onChange({ ...nestedSet, modifiers: next });
  };

  const handleAddOption = () => {
    const next = [
      ...options,
      { id: `nested_mod_${Date.now()}_${options.length}`, name: "", priceCents: 0 },
    ];
    onChange({ ...nestedSet, modifiers: next });
  };

  const handleDeleteOption = (idx) => {
    const next = options.filter((_, i) => i !== idx);
    onChange({ ...nestedSet, modifiers: next });
  };

  const formatPrice = (cents) => {
    if (!cents) return "";
    return `$${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="sq-nested-mod-wrapper">
      <div className="sq-nested-mod-header">
        <div className="sq-nested-mod-title-row">
          <span className="sq-nested-mod-badge">Nested Set</span>
          <input
            type="text"
            className="sq-nested-mod-name-input"
            placeholder="Nested set name (e.g., Choose sauce)"
            value={nestedSet.name || ""}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="sq-btn-remove-nested"
          onClick={onRemove}
          title="Remove nested modifier set"
        >
          <TrashIcon size={14} color="#dc2626" />
          <span>Remove nested set</span>
        </button>
      </div>

      <div className="sq-nested-mod-options-list">
        {options.map((opt, idx) => (
          <div key={opt.id || idx} className="sq-nested-mod-row">
            <span className="sq-nested-mod-indent">↳</span>
            <input
              type="text"
              className="sq-nested-input-name"
              placeholder="Nested option name"
              value={opt.name || ""}
              onChange={(e) => handleOptionNameChange(idx, e.target.value)}
            />
            <input
              type="text"
              className="sq-nested-input-price"
              placeholder="$0.00"
              value={formatPrice(opt.priceCents)}
              onChange={(e) => handleOptionPriceChange(idx, e.target.value)}
            />
            <button
              type="button"
              className="sq-btn-delete-nested-row"
              onClick={() => handleDeleteOption(idx)}
              title="Delete option"
            >
              <TrashIcon size={14} color="#a1a1aa" />
            </button>
          </div>
        ))}

        <button
          type="button"
          className="sq-btn-add-nested-option"
          onClick={handleAddOption}
        >
          <PlusIcon size={13} />
          <span>Add option</span>
        </button>
      </div>
    </div>
  );
}
