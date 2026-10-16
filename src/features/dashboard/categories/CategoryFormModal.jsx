import React, { PureComponent } from "react";
import {
  CloseXIcon,
  ChevronIcon,
  TablePlaceholderThumbIcon,
  TreeHierarchyIcon,
  TagIcon,
  PosTerminalIcon,
  InfoCircleIcon,
} from "@/components/ui/Icon";

export default class CategoryFormModal extends PureComponent {
  render() {
    const {
      isOpen,
      editingCategoryId,
      isHeaderScrolled,
      isCategoryActionsOpen,
      catActionsRef,
      onClose,
      onToggleActions,
      onDelete,
      onSave,
      isSaving,
      categoryFormName,
      categoryFormError,
      onNameChange,
      parentCategoryName,
      onOpenParentCategoryModal,
      categoryFormItems,
      onOpenAddItemsModal,
      categoryFormPointsOfSale,
      onTogglePointsOfSale,
      subcategories,
    } = this.props;

    if (!isOpen) return null;

    return (
      <div
        className="sq-create-item-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={editingCategoryId ? "Edit category" : "Create category"}
      >
<div className="sq-create-sticky-header">
          <button
            type="button"
            className="sq-btn-close-create"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseXIcon />
          </button>

          <div
            className={`sq-header-centered-title ${
              isHeaderScrolled ? "is-visible" : "is-hidden"
            }`}
          >
            {editingCategoryId ? "Edit category" : "Create category"}
          </div>

          <div className="sq-create-header-right">
            {editingCategoryId && (
              <div className="sq-cat-actions-wrap" ref={catActionsRef}>
                <button
                  type="button"
                  className={`sq-btn-actions ${isCategoryActionsOpen ? "is-open" : ""}`}
                  onClick={onToggleActions}
                >
                  Actions
                  <ChevronIcon rotated={isCategoryActionsOpen} />
                </button>
                {isCategoryActionsOpen && (
                  <div className="sq-actions-dropdown-menu sq-cat-actions-dropdown-menu">
                    <button
                      type="button"
                      className="sq-actions-dropdown-item is-danger"
                      onClick={onDelete}
                    >
                      Delete category
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              className="sq-btn-save-item"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

<div className="sq-category-form-wrap">
          <h1 className="sq-category-form-title">
            {editingCategoryId ? "Edit category" : "Create category"}
          </h1>

<div className={`sq-category-name-box ${categoryFormError ? "is-error" : ""}`}>
            {editingCategoryId && (
              <label className="sq-category-name-label">Category name</label>
            )}
            <input
              type="text"
              className="sq-category-name-input"
              placeholder="Category name"
              value={categoryFormName}
              onChange={onNameChange}
              autoFocus
            />
          </div>
          {categoryFormError && (
            <div className="sq-error-msg" style={{ marginTop: "4px", marginBottom: "12px" }}>
              {categoryFormError}
            </div>
          )}

<div className="sq-category-dropzone">
            <TablePlaceholderThumbIcon />
            <span className="sq-dropzone-text">
              Drag an image here,{" "}
              <button type="button" className="sq-dropzone-link">
                upload
              </button>{" "}
              or{" "}
              <button type="button" className="sq-dropzone-link">
                browse image library
              </button>
              .
            </span>
          </div>

<div className="sq-category-row-field">
            <div className="sq-category-row-field-left">
              <div className="sq-category-field-icon">
                <TreeHierarchyIcon size={20} />
              </div>
              <div>
                <div className="sq-category-field-title">Parent category</div>
                <div className="sq-category-field-sub">
                  {parentCategoryName || "Select a parent category to make this a subcategory."}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="sq-btn-link-action"
              onClick={onOpenParentCategoryModal}
            >
              {parentCategoryName ? "Edit" : "Select"}
            </button>
          </div>

{subcategories && subcategories.length > 0 && (
            <div className="sq-category-row-field" style={{ paddingTop: "0" }}>
              <div className="sq-category-row-field-left">
                <div className="sq-category-field-icon" style={{ opacity: 0.65 }}>
                  <TreeHierarchyIcon size={18} />
                </div>
                <div>
                  <div className="sq-category-field-title">
                    Subcategories ({subcategories.length})
                  </div>
                  <div className="sq-category-field-sub">
                    {subcategories.map((s) => s.name).join(", ")}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="sq-form-divider-line" />

<div className="sq-category-section-title">Items</div>
          <div className="sq-category-row-field">
            <div className="sq-category-row-field-left">
              <div className="sq-category-field-icon">
                <TagIcon />
              </div>
              <div>
                <div className="sq-category-field-title">Items</div>
                <div className="sq-category-field-sub">
                  {categoryFormItems.length === 0
                    ? "None selected"
                    : `${categoryFormItems.length} selected`}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="sq-btn-link-action"
              onClick={onOpenAddItemsModal}
            >
              {categoryFormItems.length > 0 ? "Edit" : "Add"}
            </button>
          </div>

          <div className="sq-form-divider-line" />

<div className="sq-category-section-title">Sales channels and hours</div>
          <div className="sq-category-row-field">
            <div className="sq-category-row-field-left">
              <div className="sq-category-field-icon">
                <PosTerminalIcon />
              </div>
              <div>
                <div className="sq-category-field-title">Points of sale</div>
                <div className="sq-category-field-sub">
                  Categories appear on Standard mode and Retail mode only.
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                type="button"
                className="sq-btn-info-icon"
                title="Categories appear on Standard mode and Retail mode only."
              >
                <InfoCircleIcon />
              </button>
              <button
                type="button"
                className={`sq-toggle-switch ${categoryFormPointsOfSale ? "is-on" : ""}`}
                onClick={onTogglePointsOfSale}
                aria-label="Toggle points of sale"
              >
                <span className="sq-toggle-knob" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
