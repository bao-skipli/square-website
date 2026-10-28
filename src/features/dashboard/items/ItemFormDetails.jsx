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
import { uploadImage } from "@/services/cloudinary";
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
    isUploadingImage: false,
    uploadError: "",
  };

  unitDropdownRef = React.createRef();
  fileInputRef = React.createRef();

  handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    this.setState({ isUploadingImage: true, uploadError: "" });
    try {
      const result = await uploadImage(file, { folder: "square_items" });
      if (this.props.onImageUrlChange) {
        this.props.onImageUrlChange(result.url);
      }
    } catch (err) {
      console.error("Item image upload error:", err);
      this.setState({
        uploadError: err?.message || "Failed to upload image. Please try again.",
      });
    } finally {
      this.setState({ isUploadingImage: false });
      if (this.fileInputRef.current) {
        this.fileInputRef.current.value = "";
      }
    }
  };

  handleRemoveImage = () => {
    if (this.props.onImageUrlChange) {
      this.props.onImageUrlChange("");
    }
    this.setState({ uploadError: "" });
  };

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
      formImageUrl,
      onImageUrlChange,
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
      formCalories,
      onCaloriesChange,
      formAllergens,
      onAllergensChange,
      ...fulfillmentProps
    } = this.props;

    const { isUnitDropdownOpen, unitSearchQuery, isUploadingImage, uploadError } = this.state;
    const filteredUnits = AVAILABLE_PRICE_UNITS.filter((u) =>
      u.name.toLowerCase().includes(unitSearchQuery.toLowerCase()) ||
      u.code.toLowerCase().includes(unitSearchQuery.toLowerCase())
    );

    return (
      <div className="sq-create-form-left">
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

        <div className="sq-chip-margin">Add unit cost to see margins</div>

        <textarea
          className="sq-textarea-desc"
          placeholder="Customer-facing description"
          value={formDescription}
          onChange={onDescriptionChange}
        />

        <input
          type="file"
          ref={this.fileInputRef}
          style={{ display: "none" }}
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          onChange={this.handleImageFileChange}
        />

        {formImageUrl ? (
          <div className="sq-item-image-preview-card">
            <div className="sq-item-image-preview-thumb">
              <img src={formImageUrl} alt={formName || "Item image"} />
            </div>
            <div className="sq-item-image-preview-info">
              <div className="sq-item-image-actions">
                <button
                  type="button"
                  className="sq-btn-pill-gray"
                  disabled={isUploadingImage}
                  onClick={() => this.fileInputRef.current?.click()}
                >
                  {isUploadingImage ? "Uploading..." : "Replace image"}
                </button>
                <button
                  type="button"
                  className="sq-btn-remove-image"
                  onClick={this.handleRemoveImage}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="sq-upload-dropzone"
            onClick={() => !isUploadingImage && this.fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                this.fileInputRef.current?.click();
              }
            }}
          >
            {isUploadingImage ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <span className="sq-spinner" />
                <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#111" }}>
                  Uploading image to Cloudinary...
                </span>
              </div>
            ) : (
              <>
                <div className="sq-upload-icon">
                  <UploadImageIcon />
                </div>
                <div className="sq-upload-text">
                  Drop images here,{" "}
                  <span className="sq-upload-link">browse files</span>, or upload from your device
                </div>
                <span style={{ fontSize: "11.5px", color: "#9ca3af" }}>
                  JPEG, PNG, WebP (Max 5MB)
                </span>
              </>
            )}
          </div>
        )}

        {uploadError && (
          <div className="sq-upload-error-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{uploadError}</span>
          </div>
        )}

        <div className="sq-section-row">
          <div className="sq-section-row-info">
            <span className="sq-section-row-title">Taxes</span>
            <span className="sq-section-row-desc">No taxes created</span>
          </div>
          <button type="button" className="sq-btn-pill-gray">
            Set up
          </button>
        </div>

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
                value={formCalories || ""}
                onChange={onCaloriesChange}
              />
            </div>
            <div className="sq-form-box">
              <input
                type="text"
                className="sq-form-box-input"
                placeholder="Allergens (e.g. Milk, Nuts, Soy)"
                value={formAllergens || ""}
                onChange={onAllergensChange}
              />
            </div>
          </div>
        )}

        <div className="sq-divider-thick-block" />

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

        <ItemFormFulfillment {...fulfillmentProps} />
      </div>
    );
  }
}
