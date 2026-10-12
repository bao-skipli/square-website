import React, { PureComponent } from "react";
import {
  CloseXIcon,
  ArrowLeftIcon,
  SearchIcon,
  FolderIcon,
  ImageIcon,
  ChevronRightIcon,
} from "@/components/ui/Icon";

export default class ItemFilterDrawer extends PureComponent {
  render() {
    const {
      isOpen,
      onClose,
      filterDrawerView,
      onDrawerBack,
      drawerCategorySearch,
      onCategorySearchChange,
      availableCategoriesList,
      draftCategories,
      onToggleCategoryDraft,
      onResetCategoryDraft,
      draftStatuses,
      onToggleStatusDraft,
      onToggleSelectAllStatusDraft,
      onResetStatusDraft,
      onResetAllDrafts,
      onApplyFilters,
      onChangeDrawerView,
    } = this.props;

    if (!isOpen) return null;

    return (
      <>
        <div className="sq-drawer-backdrop" onClick={onClose} />
        <aside className="sq-filter-drawer is-open" aria-label="Filter panel">
          {/* Header */}
          <div className="sq-drawer-header">
            {filterDrawerView === "all" ? (
              <button
                type="button"
                className="sq-drawer-btn-circle"
                onClick={onClose}
                title="Close filters"
              >
                <CloseXIcon />
              </button>
            ) : (
              <button
                type="button"
                className="sq-drawer-btn-circle"
                onClick={onDrawerBack}
                title="Back to all filters"
              >
                <ArrowLeftIcon />
              </button>
            )}

            <div className="sq-drawer-header-actions">
              {filterDrawerView === "category" ? (
                <button
                  type="button"
                  className="sq-drawer-btn-reset"
                  onClick={onResetCategoryDraft}
                >
                  Reset
                </button>
              ) : filterDrawerView === "status" ? (
                <button
                  type="button"
                  className="sq-drawer-btn-reset"
                  onClick={onResetStatusDraft}
                >
                  Reset
                </button>
              ) : (
                <button
                  type="button"
                  className="sq-drawer-btn-reset"
                  onClick={onResetAllDrafts}
                >
                  Reset all filters
                </button>
              )}

              <button
                type="button"
                className="sq-drawer-btn-apply"
                onClick={onApplyFilters}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="sq-drawer-body">
            {/* VIEW 1: CATEGORY */}
            {filterDrawerView === "category" && (
              <div>
                <span className="sq-drawer-sublabel">Filter by</span>
                <h2 className="sq-drawer-title">Category</h2>

                <div className="sq-drawer-search-pill">
                  <span className="sq-search-icon">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    className="sq-drawer-search-input"
                    placeholder="Search categories"
                    value={drawerCategorySearch}
                    onChange={onCategorySearchChange}
                  />
                </div>

                <div className="sq-drawer-list">
                  {availableCategoriesList.map((cat) => {
                    const isChecked = draftCategories.includes(cat);
                    return (
                      <div
                        key={cat}
                        className="sq-drawer-list-item"
                        onClick={() => onToggleCategoryDraft(cat)}
                      >
                        <div className="sq-drawer-item-left">
                          <div className="sq-drawer-item-icon">
                            {cat === "Uncategorized" ? <FolderIcon /> : <ImageIcon />}
                          </div>
                          <div>
                            <div className="sq-drawer-item-title">{cat}</div>
                            {cat === "Uncategorized" && (
                              <div className="sq-drawer-item-subtitle">
                                Items with no categorization
                              </div>
                            )}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="sq-checkbox-custom"
                          checked={isChecked}
                          onChange={() => onToggleCategoryDraft(cat)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 2: STATUS */}
            {filterDrawerView === "status" && (
              <div>
                <span className="sq-drawer-sublabel">Filter by</span>
                <h2 className="sq-drawer-title">Status</h2>

                <div className="sq-drawer-list">
                  <div
                    className="sq-drawer-list-item"
                    onClick={onToggleSelectAllStatusDraft}
                  >
                    <span className="sq-drawer-item-title">Select all</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span className="sq-drawer-count">2</span>
                      <input
                        type="checkbox"
                        className="sq-checkbox-custom"
                        checked={
                          draftStatuses.includes("Active") &&
                          draftStatuses.includes("Archived")
                        }
                        onChange={onToggleSelectAllStatusDraft}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div
                    className="sq-drawer-list-item"
                    onClick={() => onToggleStatusDraft("Active")}
                  >
                    <span className="sq-drawer-item-title">Active</span>
                    <input
                      type="checkbox"
                      className="sq-checkbox-custom"
                      checked={draftStatuses.includes("Active")}
                      onChange={() => onToggleStatusDraft("Active")}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div
                    className="sq-drawer-list-item"
                    onClick={() => onToggleStatusDraft("Archived")}
                  >
                    <span className="sq-drawer-item-title">Archived</span>
                    <input
                      type="checkbox"
                      className="sq-checkbox-custom"
                      checked={draftStatuses.includes("Archived")}
                      onChange={() => onToggleStatusDraft("Archived")}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: ALL FILTERS */}
            {filterDrawerView === "all" && (
              <div>
                <h2 className="sq-drawer-title" style={{ marginTop: "4px" }}>
                  Filter by
                </h2>

                <div className="sq-drawer-menu-list">
                  <div
                    className="sq-drawer-menu-row"
                    onClick={() => onChangeDrawerView("category")}
                  >
                    <div>
                      <div className="sq-drawer-row-label">Category</div>
                      <div className="sq-drawer-row-sub">
                        {draftCategories.length === 0
                          ? "Any"
                          : draftCategories.length === 1
                          ? draftCategories[0]
                          : `${draftCategories.length} selected`}
                      </div>
                    </div>
                    <ChevronRightIcon />
                  </div>

                  <div
                    className="sq-drawer-menu-row"
                    onClick={() => onChangeDrawerView("status")}
                  >
                    <div>
                      <div className="sq-drawer-row-label">Status</div>
                      <div className="sq-drawer-row-sub">
                        {draftStatuses.length === 0
                          ? "Any"
                          : draftStatuses.length === 2
                          ? "Any"
                          : draftStatuses.join(", ")}
                      </div>
                    </div>
                    <ChevronRightIcon />
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </>
    );
  }
}
