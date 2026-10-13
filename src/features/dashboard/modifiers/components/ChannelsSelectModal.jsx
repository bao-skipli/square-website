import React, { useState, useEffect } from "react";
import { CloseXIcon } from "@/components/ui/Icon";

const AVAILABLE_CHANNELS = [
  { id: "pointsOfSale", name: "Points of sale" },
  { id: "online", name: "Online" },
  { id: "kiosk", name: "Kiosk" },
];

export default function ChannelsSelectModal({
  isOpen,
  onClose,
  initialChannels = { all: true, pointsOfSale: true },
  onApply,
}) {
  const [selected, setSelected] = useState({ ...initialChannels });

  useEffect(() => {
    setSelected({ ...initialChannels });
  }, [initialChannels, isOpen]);

  if (!isOpen) return null;

  const isAll = selected.all || AVAILABLE_CHANNELS.every(c => selected[c.id]);

  const handleToggleAll = () => {
    if (isAll) {
      setSelected({});
    } else {
      const allMap = { all: true };
      AVAILABLE_CHANNELS.forEach(c => { allMap[c.id] = true; });
      setSelected(allMap);
    }
  };

  const handleToggleChannel = (id) => {
    const next = { ...selected };
    delete next.all;
    next[id] = !next[id];
    if (AVAILABLE_CHANNELS.every(c => next[c.id])) {
      next.all = true;
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
        aria-label="Edit Channels"
      >
        <div className="sq-popup-modal-header">
          <button type="button" className="sq-modal-circle-close" onClick={onClose} aria-label="Close">
            <CloseXIcon />
          </button>
          <button type="button" className="sq-modal-btn-done is-active" onClick={handleSave}>
            Done
          </button>
        </div>

        <h2 className="sq-popup-modal-title">Channels</h2>

        <div className="sq-submodal-list">
          <label className="sq-submodal-row">
            <input
              type="checkbox"
              className="sq-submodal-checkbox"
              checked={isAll}
              onChange={handleToggleAll}
            />
            <span className="sq-submodal-row-label">All channels</span>
          </label>

          {AVAILABLE_CHANNELS.map((ch) => (
            <label key={ch.id} className="sq-submodal-row">
              <input
                type="checkbox"
                className="sq-submodal-checkbox"
                checked={Boolean(selected.all || selected[ch.id])}
                onChange={() => handleToggleChannel(ch.id)}
              />
              <span className="sq-submodal-row-label">{ch.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
