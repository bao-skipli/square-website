import React, { PureComponent } from "react";
import {
  CloseXIcon,
  SearchIcon,
  SlashCircleIcon,
  TablePlaceholderThumbIcon,
} from "@/components/ui/Icon";

export default class ParentCategoryModal extends PureComponent {
  render() {
    const {
      isOpen,
      onClose,
      onApply,
      parentCategorySearch,
      onSearchChange,
      draftSelectedParentId,
      onSelectParent,
      categories,
      editingCategoryId,
    } = this.props;

    if (!isOpen) return null;

    return (
      <div className="sq-popup-modal-backdrop" onClick={onClose}>
        <div
          className="sq-popup-modal-card sq-parent-category-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Parent category"
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
              className="sq-modal-btn-done"
              onClick={onApply}
            >
              Done
            </button>
          </div>

          <h2 className="sq-popup-modal-title">Parent category</h2>
          <p className="sq-popup-modal-sub">
            Select a parent category to nest this category underneath it.
          </p>

          {/* Search */}
          <div className="sq-modal-search-wrapper">
            <span className="sq-modal-search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              className="sq-modal-search-input"
              placeholder="Search categories"
              value={parentCategorySearch}
              onChange={onSearchChange}
              aria-label="Search categories"
            />
          </div>

          {/* List */}
          <div className="sq-parent-cat-list">
            {/* Option: None */}
            <label className="sq-parent-cat-item">
              <div className="sq-parent-cat-item-left">
                <div className="sq-parent-cat-icon-wrap">
                  <SlashCircleIcon />
                </div>
                <span className="sq-parent-cat-name">None</span>
              </div>
              <input
                type="radio"
                name="parentCategoryRadio"
                className="sq-radio-custom"
                checked={draftSelectedParentId === null}
                onChange={() => onSelectParent(null)}
              />
            </label>

            {/* Available categories list (only root categories can be parents) */}
            {categories
              .filter((c) => {
                if (editingCategoryId && c.id === editingCategoryId) return false;
                if (c.parentId) return false; // cannot select a subcategory as a parent
                if (!parentCategorySearch.trim()) return true;
                return c.name
                  .toLowerCase()
                  .includes(parentCategorySearch.toLowerCase().trim());
              })
              .map((cat) => (
                <label key={cat.id} className="sq-parent-cat-item">
                  <div className="sq-parent-cat-item-left">
                    <div className="sq-parent-cat-thumb">
                      <TablePlaceholderThumbIcon />
                    </div>
                    <span className="sq-parent-cat-name">{cat.name}</span>
                  </div>
                  <input
                    type="radio"
                    name="parentCategoryRadio"
                    className="sq-radio-custom"
                    checked={draftSelectedParentId === cat.id}
                    onChange={() => onSelectParent(cat.id)}
                  />
                </label>
              ))}
          </div>
        </div>
      </div>
    );
  }
}
