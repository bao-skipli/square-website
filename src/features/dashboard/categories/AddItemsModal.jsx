import React, { PureComponent } from "react";
import {
  CloseXIcon,
  SearchIcon,
  FilterSlidersIcon,
  PlusIcon,
  TablePlaceholderThumbIcon,
} from "@/components/ui/Icon";

export default class AddItemsModal extends PureComponent {
  render() {
    const {
      isOpen,
      onClose,
      onApply,
      draftSelectedItems,
      addItemsSearch,
      onSearchChange,
      items,
      onToggleItem,
      onCreateNewItem,
    } = this.props;

    if (!isOpen) return null;

    return (
      <div className="sq-popup-modal-backdrop" onClick={onClose}>
        <div
          className="sq-popup-modal-card sq-add-items-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Add items"
        >
          {/* Header */}
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
              className={`sq-modal-btn-done ${
                draftSelectedItems.length > 0 ? "is-active" : "is-disabled"
              }`}
              onClick={onApply}
            >
              Done
            </button>
          </div>

          <h2 className="sq-popup-modal-title">Add items</h2>

          {/* Search row with filter button */}
          <div className="sq-add-items-search-row">
            <div className="sq-modal-search-wrapper" style={{ flex: 1, marginBottom: 0 }}>
              <span className="sq-modal-search-icon">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="sq-modal-search-input"
                placeholder="Search"
                value={addItemsSearch}
                onChange={onSearchChange}
                aria-label="Search items"
              />
            </div>
            <button type="button" className="sq-btn-modal-filter" title="Filter items">
              <FilterSlidersIcon />
            </button>
          </div>

          {/* Items Section Header */}
          <div className="sq-add-items-bar">
            <span>Items</span>
            <span>{draftSelectedItems.length} selected</span>
          </div>

          <div className="sq-add-items-list">
            {/* Create new items button row */}
            <div
              className="sq-add-items-create-row"
              onClick={onCreateNewItem}
            >
              <div className="sq-add-items-plus-wrap">
                <PlusIcon />
              </div>
              <span className="sq-add-items-create-text">Create new items</span>
            </div>

            {/* Items checkboxes */}
            {items
              .filter((item) => {
                if (!addItemsSearch.trim()) return true;
                return item.name
                  .toLowerCase()
                  .includes(addItemsSearch.toLowerCase().trim());
              })
              .map((item) => {
                const isChecked = draftSelectedItems.includes(item.id);
                return (
                  <label key={item.id} className="sq-add-item-row">
                    <div className="sq-add-item-row-left">
                      <div className="sq-parent-cat-thumb">
                        <TablePlaceholderThumbIcon />
                      </div>
                      <span className="sq-add-item-name">{item.name}</span>
                    </div>
                    <input
                      type="checkbox"
                      className="sq-checkbox-custom"
                      checked={isChecked}
                      onChange={() => onToggleItem(item.id)}
                    />
                  </label>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}
