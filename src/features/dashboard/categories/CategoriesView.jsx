import React, { PureComponent } from "react";
import {
  SearchIcon,
  TreeHierarchyIcon,
  BulletListIcon,
  ChevronIcon,
  TablePlaceholderThumbIcon,
} from "@/components/ui/Icon";

export default class CategoriesView extends PureComponent {
  render() {
    const {
      onOpenCreateCategory,
      categoriesSearchQuery,
      onSearchChange,
      categoryViewMode,
      onChangeViewMode,
      isAllCategoriesSelected,
      onToggleSelectAllCategories,
      filteredCategories,
      categories,
      expandedCategoryIds,
      selectedCategoryIds,
      getItemCountForCategory,
      onOpenEditCategory,
      onToggleCategoryExpand,
      onToggleCategorySelect,
    } = this.props;

    return (
      <section className="sq-categories-view" aria-label="Categories">
<div className="sq-categories-header">
          <h1 className="sq-categories-title">Categories</h1>
          <div className="sq-categories-header-actions">
            <button type="button" className="sq-btn-rearrange">
              Rearrange
            </button>
            <button
              type="button"
              className="sq-btn-create-category"
              onClick={() => onOpenCreateCategory(true)}
            >
              Create category
            </button>
          </div>
        </div>

<div className="sq-categories-toolbar">
          <div className="sq-search-wrapper" style={{ marginBottom: 0, width: "230px" }}>
            <span className="sq-search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              className="sq-search-input"
              placeholder="Search"
              aria-label="Search categories"
              value={categoriesSearchQuery}
              onChange={onSearchChange}
            />
          </div>

          <div className="sq-view-toggle-pill" role="group" aria-label="View toggle">
            <button
              type="button"
              className={`sq-toggle-btn ${categoryViewMode === "tree" ? "is-active" : ""}`}
              onClick={() => onChangeViewMode("tree")}
              title="Tree view"
              aria-label="Tree view"
            >
              <TreeHierarchyIcon />
            </button>
            <button
              type="button"
              className={`sq-toggle-btn ${categoryViewMode === "list" ? "is-active" : ""}`}
              onClick={() => onChangeViewMode("list")}
              title="List view"
              aria-label="List view"
            >
              <BulletListIcon />
            </button>
          </div>
        </div>

<div className="sq-table-container">
          <table className="sq-item-table sq-categories-table">
            <thead>
              <tr>
                <th
                  className="sq-col-checkbox"
                  style={{ width: categoryViewMode === "tree" ? "68px" : "48px" }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {categoryViewMode === "tree" && (
                      <span style={{ width: "22px", display: "inline-block" }} />
                    )}
                    <input
                      type="checkbox"
                      className="sq-checkbox-custom"
                      checked={isAllCategoriesSelected}
                      onChange={onToggleSelectAllCategories}
                      aria-label="Select all categories"
                    />
                  </div>
                </th>
                <th>Name</th>
                <th style={{ textAlign: "right", paddingRight: "28px", width: "100px" }}>
                  Items
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="sq-empty-state-box">
                    {categoriesSearchQuery ? (
                      <>No categories match "{categoriesSearchQuery}".</>
                    ) : (
                      <>No categories yet. Click <strong>Create category</strong> to get started.</>
                    )}
                  </td>
                </tr>
              ) : categoryViewMode === "tree" ? (

                (() => {
                  const query = (categoriesSearchQuery || "").toLowerCase().trim();
                  const rootCategories = categories.filter((c) => !c.parentId);
                  const visibleRoots = rootCategories.filter((root) => {
                    if (!query) return true;
                    if (root.name.toLowerCase().includes(query)) return true;
                    const children = categories.filter((c) => c.parentId === root.id);
                    return children.some((child) => child.name.toLowerCase().includes(query));
                  });

                  if (visibleRoots.length === 0) {
                    return (
                      <tr>
                        <td colSpan="3" className="sq-empty-state-box">
                          No categories match "{categoriesSearchQuery}".
                        </td>
                      </tr>
                    );
                  }

                  return visibleRoots.map((cat) => {
                    const childCategories = categories.filter((c) => c.parentId === cat.id);
                    const hasChildren = childCategories.length > 0;
                    const isExpanded = query ? true : expandedCategoryIds.includes(cat.id);
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    const count = getItemCountForCategory(cat.name);

                    const visibleChildren = childCategories.filter((child) => {
                      if (!query) return true;
                      return child.name.toLowerCase().includes(query) || cat.name.toLowerCase().includes(query);
                    });

                    return (
                      <React.Fragment key={cat.id}>
                        <tr
                          className="sq-category-row"
                          onClick={() => onOpenEditCategory(cat)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="sq-col-checkbox" onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              {hasChildren ? (
                                <button
                                  type="button"
                                  className="sq-cat-chevron-btn"
                                  onClick={(e) => onToggleCategoryExpand(cat.id, e)}
                                  aria-label="Expand category"
                                >
                                  <ChevronIcon size={14} rotated={isExpanded} />
                                </button>
                              ) : (
                                <span className="sq-cat-chevron-spacer" />
                              )}
                              <input
                                type="checkbox"
                                className="sq-checkbox-custom"
                                checked={isSelected}
                                onChange={(e) => onToggleCategorySelect(cat.id, e)}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="sq-table-item-cell">
                              <div className="sq-item-thumb-placeholder">
                                <TablePlaceholderThumbIcon />
                              </div>
                              <div className="sq-cat-name-block">
                                <span className="sq-item-cell-name sq-cat-name">{cat.name}</span>
                                {hasChildren && (
                                  <span className="sq-cat-sub-count-badge">
                                    {childCategories.length} {childCategories.length === 1 ? "subcategory" : "subcategories"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              paddingRight: "28px",
                              fontWeight: 500,
                              color: "#111827",
                            }}
                          >
                            {count}
                          </td>
                        </tr>

                        {isExpanded &&
                          visibleChildren.map((child) => {
                            const isChildSelected = selectedCategoryIds.includes(child.id);
                            const childCount = getItemCountForCategory(child.name);
                            return (
                              <tr
                                key={child.id}
                                className="sq-category-row sq-cat-child-row"
                                onClick={() => onOpenEditCategory(child)}
                                style={{ cursor: "pointer" }}
                              >
                                <td className="sq-col-checkbox" onClick={(e) => e.stopPropagation()}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <span className="sq-cat-chevron-spacer" />
                                    <input
                                      type="checkbox"
                                      className="sq-checkbox-custom"
                                      checked={isChildSelected}
                                      onChange={(e) => onToggleCategorySelect(child.id, e)}
                                    />
                                  </div>
                                </td>
                                <td>
                                  <div className="sq-table-item-cell sq-cat-child-indent">
                                    <span className="sq-cat-tree-branch" aria-hidden="true" />
                                    <div className="sq-item-thumb-placeholder">
                                      <TablePlaceholderThumbIcon />
                                    </div>
                                    <span className="sq-item-cell-name sq-cat-name">{child.name}</span>
                                  </div>
                                </td>
                                <td
                                  style={{
                                    textAlign: "right",
                                    paddingRight: "28px",
                                    fontWeight: 500,
                                    color: "#111827",
                                  }}
                                >
                                  {childCount}
                                </td>
                              </tr>
                            );
                          })}
                      </React.Fragment>
                    );
                  });
                })()
              ) : (

                filteredCategories.map((cat) => {
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  const count = getItemCountForCategory(cat.name);
                  const parentCat = cat.parentId ? categories.find((c) => c.id === cat.parentId) : null;

                  return (
                    <tr
                      key={cat.id}
                      className="sq-category-row"
                      onClick={() => onOpenEditCategory(cat)}
                      style={{ cursor: "pointer" }}
                    >
                      <td className="sq-col-checkbox" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="sq-checkbox-custom"
                          checked={isSelected}
                          onChange={(e) => onToggleCategorySelect(cat.id, e)}
                        />
                      </td>
                      <td>
                        <div className="sq-table-item-cell">
                          <div className="sq-item-thumb-placeholder">
                            <TablePlaceholderThumbIcon />
                          </div>
                          <div>
                            <div className="sq-item-cell-name sq-cat-name">{cat.name}</div>
                            {parentCat && (
                              <div className="sq-cat-breadcrumb">
                                {parentCat.name} / {cat.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          paddingRight: "28px",
                          fontWeight: 500,
                          color: "#111827",
                        }}
                      >
                        {count}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
}
