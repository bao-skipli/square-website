import React, { useState, useRef, useEffect } from "react";
import {
  HamburgerIcon,
  DiscountBadgeIcon,
  BasketIcon,
  CloseIcon,
  SkipliBrandMark,
  PlusSmallIcon,
  MinusSmallIcon,
} from "./StorefrontIcons";
import { formatMoney } from "@/shared/pricing";
import { useCart } from "../context/CartContext";

export function DiscountPopover({ isOpen, onClose, discounts = [] }) {
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="sf-discount-popover" ref={popoverRef} role="dialog" aria-label="Active promotions">
      <div className="sf-discount-popover-header">
        <h4 className="sf-discount-popover-title">Active Promotions</h4>
        <button type="button" className="sf-btn-icon-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={16} />
        </button>
      </div>
      <div className="sf-discount-popover-list">
        {discounts.length === 0 ? (
          <p className="sf-discount-empty">No active promotions right now.</p>
        ) : (
          discounts.map((disc) => (
            <div key={disc.id || disc.name} className="sf-discount-item">
              <span className="sf-discount-badge">{disc.name}</span>
              <p className="sf-discount-desc">
                {disc.type === "percent"
                  ? `${disc.value}% discount applied to menu items at checkout.`
                  : `${formatMoney(disc.value)} off your order.`}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function CategoryDrawer({ isOpen, onClose, store, categories = [], onSelectCategory }) {
  if (!isOpen) return null;

  return (
    <div className="sf-drawer-overlay" onClick={onClose}>
      <div
        className="sf-drawer-card sf-drawer-left"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Categories navigation"
      >
        <div className="sf-drawer-header">
          <div className="sf-drawer-title-row">
            <SkipliBrandMark size={24} />
            <h3 className="sf-drawer-store-name">{store?.name || "Skipli"}</h3>
          </div>
          <button type="button" className="sf-btn-icon-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="sf-drawer-menu-list">
          <p className="sf-drawer-label">Menu Categories</p>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className="sf-drawer-cat-btn"
              onClick={() => {
                onSelectCategory(cat.id);
                onClose();
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CartDrawer({ isOpen, onClose }) {
  const { items, totalCount, subtotalCents, updateQty, removeItem, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="sf-drawer-overlay" onClick={onClose}>
      <div
        className="sf-drawer-card sf-drawer-right"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Cart items"
      >
        <div className="sf-drawer-header">
          <div className="sf-drawer-title-row">
            <BasketIcon size={20} color="#18181b" />
            <h3 className="sf-drawer-store-name">Your Cart ({totalCount})</h3>
          </div>
          <button type="button" className="sf-btn-icon-close" onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="sf-cart-body">
          {items.length === 0 ? (
            <div className="sf-cart-empty">
              <BasketIcon size={40} color="#a1a1aa" />
              <p className="sf-cart-empty-text">Your cart is empty.</p>
              <p className="sf-cart-empty-sub">Add delicious items from the menu to get started.</p>
            </div>
          ) : (
            <div className="sf-cart-list">
              {items.map((line) => (
                <div key={line.lineId} className="sf-cart-line-item">
                  <div className="sf-cart-line-info">
                    <div className="sf-cart-line-title">{line.itemName}</div>
                    {line.variation && (
                      <div className="sf-cart-line-variation">Size: {line.variation.name}</div>
                    )}
                    {line.selectedModifiers && line.selectedModifiers.length > 0 && (
                      <div className="sf-cart-line-mods">
                        {line.selectedModifiers.map((m) => m.name).join(", ")}
                      </div>
                    )}
                    {line.textValues && line.textValues.length > 0 && (
                      <div className="sf-cart-line-notes">
                        {line.textValues.map((t) => `${t.label}: ${t.value}`).join(" | ")}
                      </div>
                    )}
                    <div className="sf-cart-line-price">
                      {line.lineOriginalCents > line.lineTotalCents && (
                        <span className="sf-price-original">
                          {formatMoney(line.lineOriginalCents)}
                        </span>
                      )}
                      <span className="sf-price-current">
                        {formatMoney(line.lineTotalCents)}
                      </span>
                    </div>
                  </div>

                  <div className="sf-cart-line-actions">
                    <div className="sf-qty-selector sf-qty-selector-sm">
                      <button
                        type="button"
                        className="sf-btn-qty"
                        onClick={() => updateQty(line.lineId, line.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        <MinusSmallIcon size={14} />
                      </button>
                      <span className="sf-qty-number">{line.qty}</span>
                      <button
                        type="button"
                        className="sf-btn-qty"
                        onClick={() => updateQty(line.lineId, line.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        <PlusSmallIcon size={14} color="#18181b" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="sf-cart-footer">
            <div className="sf-cart-subtotal-row">
              <span className="sf-cart-subtotal-label">Subtotal</span>
              <span className="sf-cart-subtotal-amount">{formatMoney(subtotalCents)}</span>
            </div>
            <p className="sf-cart-tax-notice">Taxes and delivery calculated at checkout.</p>
            <button type="button" className="sf-btn-checkout" disabled>
              Checkout (Coming Soon)
            </button>
            <button type="button" className="sf-btn-clear-cart" onClick={clearCart}>
              Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function StoreHeader({ store, discounts = [], categories = [], onSelectCategory }) {
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { totalCount } = useCart();
  const activeDiscounts = discounts.filter((d) => d && d.active);

  return (
    <>
      <header className="sf-header">
        {/* Left: Hamburger menu */}
        <div className="sf-header-left">
          <button
            type="button"
            className="sf-btn-hamburger"
            onClick={() => setIsCategoryDrawerOpen(true)}
            aria-label="Open categories navigation"
          >
            <HamburgerIcon size={22} />
          </button>
        </div>

        {/* Center: Logo or Red Store Name (matching image 1) */}
        <div className="sf-header-center">
          {store?.logoUrl ? (
            <img src={store.logoUrl} alt={store.name || "Store logo"} className="sf-store-logo-img" />
          ) : (
            <div className="sf-store-brand-text">
              <SkipliBrandMark size={28} />
              <span className="sf-store-name-red">{(store?.name || "SKIPLI").toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Right: Promotions pill + Cart pill */}
        <div className="sf-header-right">
          <div className="sf-discount-pill-wrapper">
            <button
              type="button"
              className="sf-header-pill-btn"
              onClick={() => setIsDiscountOpen((v) => !v)}
              aria-label={`View active promotions (${activeDiscounts.length})`}
            >
              <DiscountBadgeIcon size={18} />
              <span className="sf-header-pill-count">{activeDiscounts.length}</span>
            </button>
            <DiscountPopover
              isOpen={isDiscountOpen}
              onClose={() => setIsDiscountOpen(false)}
              discounts={activeDiscounts}
            />
          </div>

          <button
            type="button"
            className="sf-header-pill-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label={`View cart (${totalCount} items)`}
          >
            <BasketIcon size={18} />
            <span className="sf-header-pill-count">{totalCount}</span>
          </button>
        </div>
      </header>

      {/* Category Drawer */}
      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        store={store}
        categories={categories}
        onSelectCategory={onSelectCategory}
      />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

export default StoreHeader;

