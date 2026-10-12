import React, { PureComponent } from "react";
import {
  ChevronIcon,
  SearchIcon,
  BankIcon,
  GlobeIcon,
  PlusIcon,
} from "@/components/ui/Icon";

export default class ItemFormSettings extends PureComponent {
  render() {
    const {
      formStatus,
      statusDropdownOpen,
      onToggleStatusDropdown,
      onSelectStatus,
      formCategory,
      onCategoryChange,
      formMenu,
      onMenuChange,
      businessName,
      formPointsOfSale,
      onTogglePointsOfSale,
    } = this.props;

    return (
      <div className="sq-create-cards-right">
        {/* Card 1: Status */}
        <div className="sq-create-card">
          <div className="sq-create-card-header" style={{ marginBottom: 0 }}>
            <h3 className="sq-create-card-title">Status</h3>
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="sq-badge-available"
                onClick={onToggleStatusDropdown}
              >
                {formStatus} <ChevronIcon rotated={statusDropdownOpen} />
              </button>
              {statusDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "100%",
                    marginTop: "6px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "10px",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                    padding: "4px",
                    zIndex: 10,
                    minWidth: "120px",
                  }}
                >
                  <button
                    type="button"
                    className="sq-nav-btn"
                    style={{ padding: "6px 10px", fontSize: "13px" }}
                    onClick={() => onSelectStatus("Available")}
                  >
                    Available
                  </button>
                  <button
                    type="button"
                    className="sq-nav-btn"
                    style={{ padding: "6px 10px", fontSize: "13px" }}
                    onClick={() => onSelectStatus("Unavailable")}
                  >
                    Unavailable
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Categories */}
        <div className="sq-create-card">
          <h3 className="sq-create-card-title">Categories</h3>
          <p className="sq-create-card-desc">
            For printer routing and sales reporting.
          </p>
          <div className="sq-card-search-pill">
            <span className="sq-search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              className="sq-card-search-input"
              placeholder="Add to categories"
              value={formCategory}
              onChange={onCategoryChange}
            />
          </div>
        </div>

        {/* Card 3: Menus */}
        <div className="sq-create-card">
          <h3 className="sq-create-card-title">Menus</h3>
          <p className="sq-create-card-desc">
            For online ordering sites, delivery apps, kiosks, and any restaurant POS modes.
          </p>
          <div className="sq-card-search-pill">
            <span className="sq-search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              className="sq-card-search-input"
              placeholder="Add to menus"
              value={formMenu}
              onChange={onMenuChange}
            />
          </div>
        </div>

        {/* Card 4: Locations and channels */}
        <div className="sq-create-card">
          <div className="sq-create-card-header">
            <h3 className="sq-create-card-title">Locations and channels</h3>
            <span className="sq-link-edit">Edit POS tile</span>
          </div>

          {/* Location Row */}
          <div className="sq-location-row">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ color: "#111" }}>
                <BankIcon />
              </span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>Locations</span>
                  <span
                    style={{
                      backgroundColor: "#f4f4f5",
                      color: "#555",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "1px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    All
                  </span>
                </div>
                <span style={{ fontSize: "12.5px", color: "#6b7280" }}>
                  {businessName}
                </span>
              </div>
            </div>
            <span className="sq-link-edit">Edit</span>
          </div>

          {/* Points of sale */}
          <div className="sq-location-row">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <GlobeIcon />
              <span style={{ fontSize: "14px", fontWeight: 600 }}>Points of sale</span>
            </div>
            <button
              type="button"
              className={`sq-toggle-switch ${formPointsOfSale ? "is-on" : ""}`}
              onClick={onTogglePointsOfSale}
              aria-label="Toggle points of sale"
            >
              <span className="sq-toggle-knob" />
            </button>
          </div>

          {/* Add channel */}
          <button type="button" className="sq-btn-add-channel">
            <PlusIcon />
            Add channel
          </button>
        </div>
      </div>
    );
  }
}
