import React, { PureComponent } from "react";
import {
  ReceiptIcon,
  PackageIcon,
  ChevronIcon,
  InfoCircleIcon,
} from "@/components/ui/Icon";

export default class ItemFormFulfillment extends PureComponent {
  render() {
    const {
      manageCheckoutOpen,
      onToggleManageCheckout,
      checkoutBannerVisible,
      onDismissCheckoutBanner,
      formCannotBePurchasedAlone,
      onToggleCannotBePurchasedAlone,
      formSkipCustomization,
      onToggleSkipCustomization,
      fulfillOrdersOpen,
      onToggleFulfillOrders,
      formContainsAlcohol,
      onToggleContainsAlcohol,
      formShippingWeight,
      onShippingWeightChange,
    } = this.props;

    return (
      <>
        {/* Manage checkout */}
        <div>
          <button
            type="button"
            className="sq-accordion-header"
            onClick={onToggleManageCheckout}
          >
            <div className="sq-accordion-header-left">
              <div className="sq-accordion-icon-box">
                <ReceiptIcon />
              </div>
              <span className="sq-accordion-title">Manage checkout</span>
            </div>
            <ChevronIcon rotated={manageCheckoutOpen} />
          </button>

          {manageCheckoutOpen && (
            <div className="sq-accordion-body">
              {checkoutBannerVisible && (
                <div className="sq-checkout-info-banner">
                  <InfoCircleIcon />
                  <span>
                    Create and manage payment links in{" "}
                    <strong>Payments &amp; invoices &gt; Payment links</strong>. Once links
                    are created, you can copy the link from your Item Library.
                  </span>
                  <button
                    type="button"
                    className="sq-btn-dismiss-banner"
                    onClick={onDismissCheckoutBanner}
                    aria-label="Dismiss banner"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="sq-toggle-row-gray">
                <div className="sq-section-row-info">
                  <span className="sq-section-row-title">
                    This item cannot be purchased on its own
                  </span>
                  <span className="sq-section-row-desc">
                    Recommended for tracking internal costs such as packing materials.{" "}
                    <a href="#learn" style={{ textDecoration: "underline", color: "#111" }}>
                      Learn more
                    </a>
                  </span>
                </div>
                <button
                  type="button"
                  className={`sq-toggle-switch ${formCannotBePurchasedAlone ? "is-on" : ""}`}
                  onClick={onToggleCannotBePurchasedAlone}
                  aria-label="Toggle item cannot be purchased alone"
                >
                  <span className="sq-toggle-knob" />
                </button>
              </div>

              <div className="sq-section-row">
                <div className="sq-section-row-info">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="sq-section-row-title">Discount eligibility</span>
                    <span
                      style={{
                        backgroundColor: "#e8f8ec",
                        color: "#1b7a2d",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "999px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      Beta <ChevronIcon size={10} />
                    </span>
                  </div>
                  <span className="sq-section-row-desc">
                    Allow or prevent discounts from being applied to this item at checkout.
                  </span>
                </div>
                <button type="button" className="sq-btn-pill-gray">
                  Eligible <ChevronIcon size={14} />
                </button>
              </div>

              <div style={{ marginTop: "16px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#71717a",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Point of sale
                </span>
                <div className="sq-section-row" style={{ borderBottom: "none" }}>
                  <div className="sq-section-row-info" style={{ maxWidth: "85%" }}>
                    <span className="sq-section-row-title">
                      Skip customization when possible
                    </span>
                    <span className="sq-section-row-desc">
                      Item customization steps (variations, modifiers, seat, etc.) will only
                      appear if selections are required. Once all required selections have
                      been made, the item will be automatically added to the cart.
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`sq-toggle-switch ${formSkipCustomization ? "is-on" : ""}`}
                    onClick={onToggleSkipCustomization}
                    aria-label="Toggle skip customization"
                  >
                    <span className="sq-toggle-knob" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sq-divider-thick-block" />

        {/* Fulfill orders */}
        <div>
          <button
            type="button"
            className="sq-accordion-header"
            onClick={onToggleFulfillOrders}
          >
            <div className="sq-accordion-header-left">
              <div className="sq-accordion-icon-box">
                <PackageIcon />
              </div>
              <span className="sq-accordion-title">Fulfill orders</span>
            </div>
            <ChevronIcon rotated={fulfillOrdersOpen} />
          </button>

          {fulfillOrdersOpen && (
            <div className="sq-accordion-body">
              <div className="sq-section-row">
                <div className="sq-section-row-info">
                  <span className="sq-section-row-title">Item prep time</span>
                  <span className="sq-section-row-desc">Based on location default</span>
                </div>
                <span className="sq-link-edit">Edit</span>
              </div>

              <div className="sq-section-row">
                <div className="sq-section-row-info">
                  <span className="sq-section-row-title">Item contains alcohol</span>
                  <span className="sq-section-row-desc">
                    Require ID on delivery and set alcohol limits for QR code orders.{" "}
                    <a href="#learn" style={{ textDecoration: "underline", color: "#111" }}>
                      Learn more
                    </a>
                  </span>
                </div>
                <button
                  type="button"
                  className={`sq-toggle-switch ${formContainsAlcohol ? "is-on" : ""}`}
                  onClick={onToggleContainsAlcohol}
                  aria-label="Toggle item contains alcohol"
                >
                  <span className="sq-toggle-knob" />
                </button>
              </div>

              <div className="sq-section-row" style={{ borderBottom: "none" }}>
                <span className="sq-section-row-title">Shipping weight</span>
                <div
                  className="sq-form-box"
                  style={{ width: "140px", marginBottom: 0, padding: "8px 12px" }}
                >
                  <input
                    type="text"
                    className="sq-form-box-input"
                    placeholder="0.00"
                    value={formShippingWeight}
                    onChange={onShippingWeightChange}
                  />
                  <span style={{ fontSize: "14px", color: "#6b7280" }}>lb</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}
