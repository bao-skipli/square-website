import React from "react";
import { EmptyModifiersDeviceIcon, ChevronRightIcon } from "@/components/ui/Icon";

export default function ModifiersEmptyState({ onCreateClick }) {
  return (
    <div className="sq-modifiers-empty-wrapper">
      <div className="sq-modifiers-page-header">
        <h1 className="sq-modifiers-page-title">Modifiers</h1>
        <p className="sq-modifiers-page-desc">
          Modifiers are customizable options that can be applied to an item at checkout.
        </p>
      </div>

      <div className="sq-modifiers-empty-card">
        <div className="sq-modifiers-empty-icon-wrap">
          <EmptyModifiersDeviceIcon size={72} />
        </div>
        <h2 className="sq-modifiers-empty-title">Your item modifiers</h2>
        <p className="sq-modifiers-empty-text">
          Modifiers make custom orders simple. Create modifiers that can be applied to an item for faster checkout.
        </p>
        <button
          type="button"
          className="sq-modifiers-btn-primary-pill"
          onClick={onCreateClick}
        >
          Create a modifier
        </button>
      </div>

      <div className="sq-modifiers-learn-more-section">
        <span className="sq-modifiers-learn-more-label">LEARN MORE</span>
        <a
          href="https://squareup.com/help/us/en/article/5135-manage-item-modifiers-with-square"
          target="_blank"
          rel="noopener noreferrer"
          className="sq-modifiers-learn-more-card"
        >
          <span className="sq-modifiers-learn-more-link">Item Modifiers</span>
          <ChevronRightIcon size={16} color="#71717a" />
        </a>
      </div>
    </div>
  );
}
