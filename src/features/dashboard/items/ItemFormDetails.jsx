import React, { PureComponent } from "react";
import {
  ForkKnifeIcon,
  BarcodeIcon,
  DotsIcon,
  InfoCircleIcon,
  UploadImageIcon,
  StarBadgeIcon,
  ChevronIcon,
} from "@/components/ui/Icon";
import ItemFormFulfillment from "./ItemFormFulfillment";
import ItemModifiersSection from "./ItemModifiersSection";

const AVAILABLE_PRICE_UNITS = [
  { name: "Each", code: "ea" },
  { name: "Day", code: "day" },
];

export default class ItemFormDetails extends PureComponent {
  state = {
    isUnitDropdownOpen: false,
    unitSearchQuery: "",
  };

  unitDropdownRef = React.createRef();

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = (e) => {
    if (this.unitDropdownRef.current && !this.unitDropdownRef.current.contains(e.target)) {
      this.setState({ isUnitDropdownOpen: false });
    }
  };

  handleToggleUnitDropdown = () => {
    this.setState((prev) => ({ isUnitDropdownOpen: !prev.isUnitDropdownOpen }));
  };

  handleCloseUnitDropdown = () => {
    this.setState({ isUnitDropdownOpen: false });
  };

  handleSelectUnit = (code) => {
    if (this.props.onPriceUnitChange) {
      this.props.onPriceUnitChange(code);
    }
    this.setState({ isUnitDropdownOpen: false });
  };

  render() {
    const {
      formItemType,
      formName,
      formError,
      onNameChange,
      formKitchenName,
      onKitchenNameChange,
      formPrice,
      onPriceChange,
      formPriceUnit,
      onPriceUnitChange,
      formDescription,
      onDescriptionChange,
      nutritionalInfoOpen,
      onToggleNutritionalInfo,
      businessName,
      formSku,
      onSkuChange,
      formGtin,
      onGtinChange,
      editingItemId,
      itemModifierSetsMap,
      allModifierSets,
      onApplyItemModifierSets,
      onRemoveItemModifierSet,
      onSaveItemModifierOverrides,
      onReorderItemModifierSets,
      ...fulfillmentProps
    } = this.props;

    const { isUnitDropdownOpen, unitSearchQuery } = this.state;
    const filteredUnits = AVAILABLE_PRICE_UNITS.filter((u) =>
      u.name.toLowerCase().includes(unitSearchQuery.toLowerCase()) ||
      u.code.toLowerCase().includes(unitSearchQuery.toLowerCase())
    );

    return (
      <div className="sq-create-form-left">
        {/* Item Type */}
        <div className="sq-item-type-box">
          <div className="sq-item-type-left">
            <div className="sq-item-type-icon-wrap">
              <ForkKnifeIcon />
            </div>
            <div className="sq-item-type-text-col">
              <span className="sq-item-type-label">Item type</span>
              <span className="sq-item-type-val">{formItemType}</span>
            </div>
          </div>
          <ChevronIcon />
        </div>

        {/* Name (required) */}
        <div className={`sq-form-box ${formError ? "is-error" : ""}`}>
          <input
            type="text"
            className="sq-form-box-input"
            placeholder="Name (required)"
            value={formName}
            onChange={onNameChange}
            autoFocus
          />
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#555" }}>
            <BarcodeIcon />
            <DotsIcon />
          </div>
        </div>
        {formError && <div className="sq-error-msg">{formError}</div>}

        {/* Kitchen name */}
        <div className="sq-form-box">
          <input
            type="text"
            className="sq-form-box-input"
            placeholder="Kitchen name"
            value={formKitchenName}
            onChange={onKitchenNameChange}
          />
          <span style={{ color: "#71717a" }}>
            <InfoCircleIcon />
          </span>
        </div>

        {/* Price */}
        <div className="sq-form-box">
          <input
            type="text"
            className="sq-form-box-input"
            placeholder="Price"
            value={formPrice}
            onChange={onPriceChange}
          />
          <div className="sq-price-unit-container" ref={this.unitDropdownRef}>
            <button
              type="button"
              className="sq-price-unit-btn"
              onClick={this.handleToggleUnitDropdown}
              aria-haspopup="listbox"
              aria-expanded={isUnitDropdownOpen}
            >
              <span className="sq-price-unit-text">{formPriceUnit || "ea"}</span>
              <ChevronIcon size={14} rotated={isUnitDropdownOpen} />
            </button>

            {isUnitDropdownOpen && (
              <div className="sq-unit-dropdown-popover" role="dialog">
                <div className="sq-unit-search-wrapper">
                  <svg
                    className="sq-unit-search-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#111111"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="sq-unit-search-input"
                    value={unitSearchQuery}
                    onChange={(e) => this.setState({ unitSearchQuery: e.target.value })}
                    autoFocus
                  />
                </div>

                <div
                  className="sq-unit-action-item"
                  onClick={this.handleCloseUnitDropdown}
                >
                  Create custom unit
                </div>

                <div
                  className="sq-unit-action-item sq-unit-action-star"
                  onClick={this.handleCloseUnitDropdown}
                >
                  <span>Sell multiple units</span>
                  <StarBadgeIcon />
                </div>

                <div className="sq-unit-list-items">
                  {filteredUnits.map((u) => {
                    const isSelected = (formPriceUnit || "ea").toLowerCase() === u.code.toLowerCase();
                    return (
                      <button
                        key={u.code}
                        type="button"
                        className={`sq-unit-list-row ${isSelected ? "is-selected" : ""}`}
                        onClick={() => this.handleSelectUnit(u.code)}
                      >
                        <span className="sq-unit-list-name">{u.name}</span>
                        <span className="sq-unit-list-code">{u.code}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Margin Chip */}
        <div className="sq-chip-margin">Add unit cost to see margins</div>

        {/* Customer-facing description */}
        <textarea
          className="sq-textarea-desc"
          placeholder="Customer-facing description"
          value={formDescription}
          onChange={onDescriptionChange}
        />

        {/* Image Upload Dropzone */}
        <div className="sq-upload-dropzone">
          <div className="sq-upload-icon">
            <UploadImageIcon />
          </div>
          <div className="sq-upload-text">
            Drop images here,{" "}
            <span className="sq-upload-link">browse files</span>, or{" "}
            <span className="sq-upload-link">add from image library</span>
          </div>
        </div>

        {/* Taxes */}
        <div className="sq-section-row">
          <div className="sq-section-row-info">
            <span className="sq-section-row-title">Taxes</span>
            <span className="sq-section-row-desc">No taxes created</span>
          </div>
          <button type="button" className="sq-btn-pill-gray">
            Set up
          </button>
        </div>

        {/* Nutritional Information Accordion */}
        <button
          type="button"
          className="sq-accordion-header"
          onClick={onToggleNutritionalInfo}
        >
          <div className="sq-section-row-info">
            <span className="sq-section-row-title">Nutritional information</span>
            <span className="sq-section-row-desc">
              Calorie count, dietary preferences, and food allergens.
            </span>
          </div>
          <ChevronIcon rotated={nutritionalInfoOpen} />
        </button>
        {nutritionalInfoOpen && (
          <div className="sq-accordion-body">
            <div className="sq-form-box">
              <input
                type="text"
                className="sq-form-box-input"
                placeholder="Calories (kcal)"
              />
            </div>
            <div className="sq-form-box">
              <input
                type="text"
                className="sq-form-box-input"
                placeholder="Allergens (e.g. Milk, Nuts, Soy)"
              />
            </div>
          </div>
        )}

        <div className="sq-divider-thick-block" />

        {/* Manage Inventory */}
        <div style={{ marginTop: "8px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 10px 0" }}>
            Manage inventory
          </h3>
          <table className="sq-inventory-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{businessName}</td>
                <td>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <button type="button" className="sq-badge-available">
                      Available <ChevronIcon size={12} />
                    </button>
                    <DotsIcon />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SKU and GTIN */}
        <div className="sq-two-inputs-row">
          <div className="sq-form-box" style={{ marginBottom: 0 }}>
            <input
              type="text"
              className="sq-form-box-input"
              placeholder="SKU"
              value={formSku}
              onChange={onSkuChange}
            />
            <InfoCircleIcon />
          </div>
          <div className="sq-form-box" style={{ marginBottom: 0 }}>
            <input
              type="text"
              className="sq-form-box-input"
              placeholder="GTIN"
              value={formGtin}
              onChange={onGtinChange}
            />
            <InfoCircleIcon />
          </div>
        </div>

        <div style={{ marginTop: "12px" }}>
          <span className="sq-link-blue-star">
            Add unit cost and vendor
            <StarBadgeIcon />
          </span>
        </div>

        <div className="sq-divider-thick-block" />

        {/* Modifiers Section */}
        <ItemModifiersSection
          itemId={editingItemId}
          itemName={formName}
          itemModifierSetsMap={itemModifierSetsMap}
          allModifierSets={allModifierSets}
          onApplyItemModifierSets={onApplyItemModifierSets}
          onRemoveItemModifierSet={onRemoveItemModifierSet}
          onSaveItemModifierOverrides={onSaveItemModifierOverrides}
          onReorderItemModifierSets={onReorderItemModifierSets}
        />

        <div className="sq-divider-thick-block" />

        {/* Variations */}
        <div className="sq-section-row">
          <div className="sq-section-row-info">
            <span className="sq-section-row-title">Variations</span>
            <span className="sq-section-row-desc">
              Add options like portions or sizes, then set prices and availability.
            </span>
          </div>
          <button type="button" className="sq-btn-pill-gray">
            Add <ChevronIcon size={14} />
          </button>
        </div>

        {/* Units */}
        <div className="sq-section-row">
          <div className="sq-section-row-info">
            <span className="sq-section-row-title">
              Units <StarBadgeIcon />
            </span>
            <span className="sq-section-row-desc">
              Sell this item in multiple units, such as individually or by the case.
            </span>
          </div>
          <button type="button" className="sq-btn-pill-gray">
            Add <ChevronIcon size={14} />
          </button>
        </div>

        {/* Bundle */}
        <div className="sq-section-row">
          <div className="sq-section-row-info">
            <span className="sq-section-row-title">
              Bundle <StarBadgeIcon />
            </span>
            <span className="sq-section-row-desc">
              Sell goods from your library as a bundle
            </span>
          </div>
          <button type="button" className="sq-btn-pill-gray">
            Add <ChevronIcon size={14} />
          </button>
        </div>

        {/* Custom attributes */}
        <div className="sq-section-row">
          <div className="sq-section-row-info">
            <span className="sq-section-row-title">Custom attributes</span>
            <span className="sq-section-row-desc">
              Track additional details for this item.{" "}
              <a href="#learn" style={{ textDecoration: "underline", color: "#111" }}>
                Learn more
              </a>
            </span>
          </div>
          <button type="button" className="sq-btn-pill-gray">
            Add <ChevronIcon size={14} />
          </button>
        </div>

        <div className="sq-divider-thick-block" />

        {/* Fulfillment & Checkout Sections */}
        <ItemFormFulfillment {...fulfillmentProps} />
      </div>
    );
  }
}
