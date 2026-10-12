import React, { PureComponent } from "react";
import ItemFormHeader from "./ItemFormHeader";
import ItemFormDetails from "./ItemFormDetails";
import ItemFormSettings from "./ItemFormSettings";

export default class ItemFormModal extends PureComponent {
  render() {
    const {
      isOpen,
      onScroll,
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
      detailsProps,
      settingsProps,
    } = this.props;

    if (!isOpen) return null;

    return (
      <div
        className="sq-create-item-overlay"
        onScroll={onScroll}
        role="dialog"
        aria-modal="true"
        aria-label={editingItemId ? "Edit item" : "Create item"}
      >
        <ItemFormHeader
          editingItemId={editingItemId}
          isHeaderScrolled={isHeaderScrolled}
          isItemActionsOpen={isItemActionsOpen}
          itemActionsRef={itemActionsRef}
          onClose={onClose}
          onToggleActions={onToggleActions}
          onSave={onSave}
          isSaving={isSaving}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
          onDelete={onDelete}
        />

        <div className="sq-create-content-container">
          <h1 className="sq-create-large-title">
            {editingItemId ? "Edit item" : "Create item"}
          </h1>

          <div className="sq-create-grid">
            <ItemFormDetails {...detailsProps} />
            <ItemFormSettings {...settingsProps} />
          </div>
        </div>
      </div>
    );
  }
}
