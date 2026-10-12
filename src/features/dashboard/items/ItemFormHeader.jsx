import React, { PureComponent } from "react";
import { CloseXIcon, ChevronIcon } from "@/components/ui/Icon";

export default class ItemFormHeader extends PureComponent {
  render() {
    const {
      editingItemId,
      isHeaderScrolled,
      isItemActionsOpen,
      itemActionsRef,
      onClose,
      onToggleActions,
      onSave,
      isSaving,
      onDuplicate,
      onArchive,
      onDelete,
    } = this.props;

    return (
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
          {editingItemId ? "Edit item" : "Create item"}
        </div>

        <div className="sq-create-header-right">
          {editingItemId && (
            <div className="sq-item-actions-wrap" ref={itemActionsRef}>
              <button
                type="button"
                className={`sq-btn-actions ${isItemActionsOpen ? "is-open" : ""}`}
                onClick={onToggleActions}
              >
                Actions
                <ChevronIcon rotated={isItemActionsOpen} />
              </button>
              {isItemActionsOpen && (
                <div className="sq-actions-dropdown-menu sq-item-actions-dropdown-menu">
                  <button
                    type="button"
                    className="sq-actions-dropdown-item"
                    onClick={() => {
                      onToggleActions();
                      alert("View stock history");
                    }}
                  >
                    View stock history
                  </button>
                  <div className="sq-actions-dropdown-divider" />
                  <button
                    type="button"
                    className="sq-actions-dropdown-item"
                    onClick={onDuplicate}
                  >
                    Duplicate
                  </button>
                  <div className="sq-actions-dropdown-divider" />
                  <button
                    type="button"
                    className="sq-actions-dropdown-item"
                    onClick={onArchive}
                  >
                    Archive
                  </button>
                  <div className="sq-actions-dropdown-divider" />
                  <button
                    type="button"
                    className="sq-actions-dropdown-item is-danger"
                    onClick={onDelete}
                  >
                    Delete
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
    );
  }
}
