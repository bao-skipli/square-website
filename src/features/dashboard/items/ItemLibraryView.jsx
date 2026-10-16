import React, { PureComponent } from "react";
import {
  SearchIcon,
  FilterSlidersIcon,
  ChevronIcon,
  PlusIcon,
  DotsIcon,
  TablePlaceholderThumbIcon,
} from "@/components/ui/Icon";

export default class ItemLibraryView extends PureComponent {
  render() {
    const {
      librarySearchQuery,
      onSearchChange,
      appliedCategories,
      appliedStatuses,
      onOpenCategoryFilter,
      onOpenStatusFilter,
      onOpenAllFilters,
      isActionsOpen,
      onToggleActionsDropdown,
      actionsRef,
      onActionItemClick,
      onNavigateToCreateItem,
      filteredItems,
      onOpenEditItem,
    } = this.props;

    return (
      <section className="sq-item-library-view" aria-label="Item Library">
<div className="sq-library-toolbar">
          <div className="sq-toolbar-left">
<div className="sq-search-wrapper" style={{ marginBottom: 0, width: "230px" }}>
              <span className="sq-search-icon">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="sq-search-input"
                placeholder="Search"
                aria-label="Search items"
                value={librarySearchQuery}
                onChange={onSearchChange}
              />
            </div>

<button
              type="button"
              className={`sq-chip-btn ${appliedCategories.length > 0 ? "is-filtered" : ""}`}
              onClick={onOpenCategoryFilter}
            >
              Category
              {appliedCategories.length > 0 && (
                <span className="sq-chip-val">
                  : <strong>{appliedCategories.length === 1 ? appliedCategories[0] : `${appliedCategories.length} selected`}</strong>
                </span>
              )}
            </button>

            <button
              type="button"
              className={`sq-chip-btn ${appliedStatuses.length > 0 && appliedStatuses.length < 2 ? "is-filtered" : ""}`}
              onClick={onOpenStatusFilter}
            >
              Status
              {appliedStatuses.length === 1 && (
                <span className="sq-chip-val">
                  : <strong>{appliedStatuses[0]}</strong>
                </span>
              )}
            </button>

            <button
              type="button"
              className="sq-chip-btn"
              onClick={onOpenAllFilters}
            >
              <FilterSlidersIcon />
              All filters
            </button>
          </div>

          <div className="sq-toolbar-right">
<div className="sq-actions-dropdown-wrap" ref={actionsRef}>
              <button
                type="button"
                className={`sq-btn-actions ${isActionsOpen ? "is-open" : ""}`}
                onClick={onToggleActionsDropdown}
              >
                Actions
                <ChevronIcon rotated={isActionsOpen} />
              </button>
              {isActionsOpen && (
                <div className="sq-actions-dropdown-menu">
                  <button
                    type="button"
                    className="sq-actions-dropdown-item"
                    onClick={() => onActionItemClick("Import library")}
                  >
                    Import library
                  </button>
                  <div className="sq-actions-dropdown-divider" />
                  <button
                    type="button"
                    className="sq-actions-dropdown-item"
                    onClick={() => onActionItemClick("Export library")}
                  >
                    Export library
                  </button>
                  <div className="sq-actions-dropdown-divider" />
                  <button
                    type="button"
                    className="sq-actions-dropdown-item"
                    onClick={() => onActionItemClick("Collapse all items")}
                  >
                    Collapse all items
                  </button>
                  <div className="sq-actions-dropdown-divider" />
                  <button
                    type="button"
                    className="sq-actions-dropdown-item"
                    onClick={() => onActionItemClick("Create items from template")}
                  >
                    Create items from template
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              className="sq-btn-create-item"
              onClick={onNavigateToCreateItem}
            >
              Create item
            </button>
          </div>
        </div>

<div className="sq-table-container">
          <table className="sq-item-table">
            <thead>
              <tr>
                <th className="sq-col-checkbox">
                  <input type="checkbox" className="sq-checkbox-custom" aria-label="Select all items" />
                </th>
                <th>Item</th>
                <th>Reporting category</th>
                <th>Status</th>
                <th>Price</th>
                <th style={{ textAlign: "right", width: "40px" }}>
                  <button type="button" className="sq-btn-add-col" title="Add column">
                    +
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
<tr>
                <td colSpan="6" style={{ padding: 0 }}>
                  <div
                    className="sq-quick-create-row"
                    onClick={onNavigateToCreateItem}
                  >
                    <PlusIcon />
                    <span className="underline-text">Quick create</span>
                  </div>
                </td>
              </tr>

{filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="sq-empty-state-box">
                    {librarySearchQuery || appliedCategories.length > 0 || (appliedStatuses.length > 0 && appliedStatuses.length < 2) ? (
                      <>No items match your search or filter criteria.</>
                    ) : (
                      <>
                        No items yet. Click <strong>Create item</strong> to get started.
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="sq-item-row"
                    onClick={() => onOpenEditItem(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="sq-col-checkbox" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="sq-checkbox-custom" />
                    </td>
                    <td>
                      <div className="sq-table-item-cell">
                        {item.imageUrl || item.image || item.photo ? (
                          <div className="sq-item-thumb-img-wrap">
                            <img
                              src={item.imageUrl || item.image || item.photo}
                              alt={item.name}
                              className="sq-item-thumb-img"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget.parentElement?.querySelector(".sq-item-thumb-placeholder");
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                            <div className="sq-item-thumb-placeholder" style={{ display: "none" }}>
                              <TablePlaceholderThumbIcon />
                            </div>
                          </div>
                        ) : (
                          <div className="sq-item-thumb-placeholder">
                            <TablePlaceholderThumbIcon />
                          </div>
                        )}
                        <span className="sq-item-cell-name">{item.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "#555555" }}>{item.category}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="sq-badge-available">
                        {item.status} <ChevronIcon />
                      </button>
                    </td>
                    <td style={{ fontWeight: 500 }}>{item.price}</td>
                    <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="sq-btn-row-more" aria-label="More item options">
                        <DotsIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
}
