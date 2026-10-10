import React, { Component } from "react";
import { Link } from "react-router-dom";
import { subscribeAuth, getUserBusinessInfo } from "../../firebase/authService";
import "./Dashboard.css";

/* ==========================================================================
   INLINE SVG ICONS (Pixel-perfect matching Square dashboard)
   ========================================================================== */

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <circle cx="7" cy="7" r=".7" fill="currentColor" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="8" x2="16" y1="10" y2="10" />
      <line x1="8" x2="12" y1="14" y2="14" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 17a5 5 0 0 1 10 0" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

function StaffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" x2="21" y1="22" y2="22" />
      <line x1="6" x2="6" y1="18" y2="11" />
      <line x1="10" x2="10" y1="18" y2="11" />
      <line x1="14" x2="14" y1="18" y2="11" />
      <line x1="18" x2="18" y1="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
    </svg>
  );
}

function ChannelsGridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" x2="21" y1="6" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function ChevronIcon({ rotated = false }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`sq-chevron-icon ${rotated ? "is-rotated" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function PosMonitorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function HardwareGridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="16" cy="8" r="1.5" />
      <circle cx="8" cy="16" r="1.5" />
      <circle cx="16" cy="16" r="1.5" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="19" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function StarBadgeIcon() {
  return (
    <span className="sq-star-badge" aria-hidden="true">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </span>
  );
}

/* ==========================================================================
   DASHBOARD CLASS COMPONENT
   ========================================================================== */

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      businessName: "Skipli",
      activeMenu: "home",
      isItemsMenusOpen: false,
      isItemsOpen: false,
      searchQuery: "",
      aiQuery: "",
      dismissedPosCard: false,
      selectedDateChip: "Oct 9",
      selectedVsChip: "Prior day",
      selectedChecksChip: "Closed",
    };

    this.unsubscribeAuth = null;
  }

  componentDidMount() {
    this.unsubscribeAuth = subscribeAuth(async (user) => {
      if (user) {
        try {
          const info = await getUserBusinessInfo(user.uid);
          if (info && info.businessMatch && info.businessMatch.businessName) {
            this.setState({ businessName: info.businessMatch.businessName });
          }
        } catch (err) {
          console.warn("Could not fetch business info for dashboard:", err);
        }
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }

  /* Interaction Handlers */
  toggleItemsMenus = () => {
    this.setState((prev) => ({
      isItemsMenusOpen: !prev.isItemsMenusOpen,
    }));
  };

  toggleItems = () => {
    this.setState((prev) => ({
      isItemsOpen: !prev.isItemsOpen,
      activeMenu: "items",
    }));
  };

  handleMenuClick = (menuKey) => {
    this.setState({ activeMenu: menuKey });
  };

  handleAiSubmit = (e) => {
    e.preventDefault();
    if (this.state.aiQuery.trim()) {
      alert(`Square AI query received: "${this.state.aiQuery}"`);
      this.setState({ aiQuery: "" });
    }
  };

  handleDismissPos = () => {
    this.setState({ dismissedPosCard: true });
  };

  render() {
    const {
      businessName,
      activeMenu,
      isItemsMenusOpen,
      isItemsOpen,
      searchQuery,
      aiQuery,
      dismissedPosCard,
      selectedDateChip,
      selectedVsChip,
      selectedChecksChip,
    } = this.state;

    return (
      <div className="sq-dashboard-root">
        {/* ================================================================
            LEFT SIDEBAR (Ảnh 3, Ảnh 7, Ảnh 8)
            ================================================================ */}
        <aside className="sq-sidebar" aria-label="Square Sidebar Navigation">
          {/* Top Fixed Header: Account, Progress, Search */}
          <div className="sq-sidebar-header">
            {/* 1. Account Card */}
            <div className="sq-account-card">
              <div className="sq-account-user-row">
                <span className="sq-account-avatar-icon">
                  <UserIcon />
                </span>
                <span className="sq-account-name">{businessName}</span>
              </div>
              <button type="button" className="sq-account-badge">
                Square Free <span className="sq-account-badge-dot">·</span> See plans
              </button>
            </div>

            {/* 2. Setup Progress Bar */}
            <div className="sq-progress-section">
              <div className="sq-progress-bar-track">
                <div className="sq-progress-bar-fill" style={{ width: "17%" }} />
              </div>
              <div className="sq-progress-text-row">
                <span>Complete your setup</span>
                <span className="sq-progress-percent">17%</span>
              </div>
            </div>

            {/* 3. Search Pill */}
            <div className="sq-search-wrapper">
              <span className="sq-search-icon">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="sq-search-input"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => this.setState({ searchQuery: e.target.value })}
                aria-label="Search dashboard"
              />
            </div>
          </div>

          {/* Scrollable Navigation Menu (Lines 396-742) */}
          <div className="sq-sidebar-menu-scroll">
            {/* 4. Main Menu Items */}
            <ul className="sq-nav-list">
              {/* Home */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "home" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("home")}
                >
                  <span className="sq-nav-btn-icon">
                    <HomeIcon />
                  </span>
                  <span className="sq-nav-btn-label">Home</span>
                </button>
              </li>

              {/* Items & menus (Interactive Accordion) */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${
                    activeMenu === "items-menus" || isItemsMenusOpen ? "is-active" : ""
                  }`}
                  onClick={this.toggleItemsMenus}
                  aria-expanded={isItemsMenusOpen}
                >
                  <span className="sq-nav-btn-icon">
                    <TagIcon />
                  </span>
                  <span className="sq-nav-btn-label">Items &amp; menus</span>
                  <ChevronIcon rotated={isItemsMenusOpen} />
                </button>

                {/* Submenu Level 1 (Ảnh 7) */}
                {isItemsMenusOpen && (
                  <div className="sq-submenu-level-1">
                    {/* Items (sub-level accordion) */}
                    <div>
                      <button
                        type="button"
                        className={`sq-submenu-btn ${activeMenu === "items" ? "is-active" : ""}`}
                        onClick={this.toggleItems}
                        aria-expanded={isItemsOpen}
                      >
                        <span>Items</span>
                        <ChevronIcon rotated={isItemsOpen} />
                      </button>

                      {/* Submenu Level 2 (Ảnh 8) */}
                      {isItemsOpen && (
                        <div className="sq-submenu-level-2">
                          <button
                            type="button"
                            className={`sq-subitem-btn ${
                              activeMenu === "item-library" ? "is-active" : ""
                            }`}
                            onClick={() => this.handleMenuClick("item-library")}
                          >
                            <span>Item library</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${
                              activeMenu === "channel-listings" ? "is-active" : ""
                            }`}
                            onClick={() => this.handleMenuClick("channel-listings")}
                          >
                            <span>Channel listings</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${
                              activeMenu === "service-library" ? "is-active" : ""
                            }`}
                            onClick={() => this.handleMenuClick("service-library")}
                          >
                            <span>Service library</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${
                              activeMenu === "image-library" ? "is-active" : ""
                            }`}
                            onClick={() => this.handleMenuClick("image-library")}
                          >
                            <span>Image library</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${
                              activeMenu === "modifiers" ? "is-active" : ""
                            }`}
                            onClick={() => this.handleMenuClick("modifiers")}
                          >
                            <span>Modifiers</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${
                              activeMenu === "categories" ? "is-active" : ""
                            }`}
                            onClick={() => this.handleMenuClick("categories")}
                          >
                            <span>Categories</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${
                              activeMenu === "discounts" ? "is-active" : ""
                            }`}
                            onClick={() => this.handleMenuClick("discounts")}
                          >
                            <span>Discounts</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${
                              activeMenu === "options" ? "is-active" : ""
                            }`}
                            onClick={() => this.handleMenuClick("options")}
                          >
                            <span>Options</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${
                              activeMenu === "units" ? "is-active" : ""
                            }`}
                            onClick={() => this.handleMenuClick("units")}
                          >
                            <span>Units</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${
                              activeMenu === "custom-attributes" ? "is-active" : ""
                            }`}
                            onClick={() => this.handleMenuClick("custom-attributes")}
                          >
                            <span>Custom attributes</span>
                          </button>
                          <button
                            type="button"
                            className="sq-subitem-btn"
                            onClick={() => this.handleMenuClick("item-settings")}
                          >
                            <span>Settings</span>
                            <ChevronIcon rotated={false} />
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`sq-submenu-btn ${activeMenu === "menus" ? "is-active" : ""}`}
                      onClick={() => this.handleMenuClick("menus")}
                    >
                      <span>Menus</span>
                    </button>
                    <button
                      type="button"
                      className={`sq-submenu-btn ${
                        activeMenu === "inventory-mgmt" ? "is-active" : ""
                      }`}
                      onClick={() => this.handleMenuClick("inventory-mgmt")}
                    >
                      <span>Inventory management</span>
                      <StarBadgeIcon />
                    </button>
                    <button
                      type="button"
                      className={`sq-submenu-btn ${
                        activeMenu === "order-guide" ? "is-active" : ""
                      }`}
                      onClick={() => this.handleMenuClick("order-guide")}
                    >
                      <span>Order guide</span>
                      <StarBadgeIcon />
                    </button>
                    <button
                      type="button"
                      className={`sq-submenu-btn ${
                        activeMenu === "gift-cards" ? "is-active" : ""
                      }`}
                      onClick={() => this.handleMenuClick("gift-cards")}
                    >
                      <span>Gift Cards</span>
                      <ChevronIcon rotated={false} />
                    </button>
                    <button
                      type="button"
                      className={`sq-submenu-btn ${
                        activeMenu === "subscription-plans" ? "is-active" : ""
                      }`}
                      onClick={() => this.handleMenuClick("subscription-plans")}
                    >
                      <span>Subscription plans</span>
                    </button>
                  </div>
                )}
              </li>

              {/* Orders & payments */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "orders-payments" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("orders-payments")}
                >
                  <span className="sq-nav-btn-icon">
                    <ReceiptIcon />
                  </span>
                  <span className="sq-nav-btn-label">Orders &amp; payments</span>
                </button>
              </li>

              {/* Customers */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "customers" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("customers")}
                >
                  <span className="sq-nav-btn-icon">
                    <CustomersIcon />
                  </span>
                  <span className="sq-nav-btn-label">Customers</span>
                </button>
              </li>

              {/* Reports */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "reports" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("reports")}
                >
                  <span className="sq-nav-btn-icon">
                    <ReportsIcon />
                  </span>
                  <span className="sq-nav-btn-label">Reports</span>
                </button>
              </li>

              {/* Staff */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "staff" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("staff")}
                >
                  <span className="sq-nav-btn-icon">
                    <StaffIcon />
                  </span>
                  <span className="sq-nav-btn-label">Staff</span>
                </button>
              </li>

              {/* Banking */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "banking" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("banking")}
                >
                  <span className="sq-nav-btn-icon">
                    <BankIcon />
                  </span>
                  <span className="sq-nav-btn-label">Banking</span>
                </button>
              </li>

              {/* What's new */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "whats-new" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("whats-new")}
                >
                  <span className="sq-nav-btn-icon">
                    <MegaphoneIcon />
                  </span>
                  <span className="sq-nav-btn-label">What's new</span>
                </button>
              </li>

              {/* Settings */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "settings" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("settings")}
                >
                  <span className="sq-nav-btn-icon">
                    <SettingsIcon />
                  </span>
                  <span className="sq-nav-btn-label">Settings</span>
                </button>
              </li>

              {/* Add more */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "add-more" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("add-more")}
                >
                  <span className="sq-nav-btn-icon">
                    <DotsIcon />
                  </span>
                  <span className="sq-nav-btn-label">Add more</span>
                </button>
              </li>
            </ul>

            {/* Divider */}
            <hr className="sq-sidebar-divider" />

            {/* Channels & Online ordering */}
            <ul className="sq-nav-list">
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "channels" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("channels")}
                >
                  <span className="sq-nav-btn-icon">
                    <ChannelsGridIcon />
                  </span>
                  <span className="sq-nav-btn-label">Channels</span>
                </button>
              </li>
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "online-ordering" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("online-ordering")}
                >
                  <span className="sq-nav-btn-icon">
                    <BagIcon />
                  </span>
                  <span className="sq-nav-btn-label">Online ordering</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Bottom Area: 4 Icons + Take payment */}
          <div className="sq-sidebar-bottom">
            <div className="sq-sidebar-icons-row">
              <button type="button" className="sq-icon-button" aria-label="Notifications">
                <BellIcon />
              </button>
              <button type="button" className="sq-icon-button" aria-label="Messages">
                <ChatIcon />
              </button>
              <button type="button" className="sq-icon-button" aria-label="Help">
                <HelpIcon />
              </button>
              <button type="button" className="sq-icon-button" aria-label="AI Assistant">
                <SparkleIcon />
              </button>
            </div>
            <button
              type="button"
              className="sq-btn-take-payment"
              onClick={() => alert("Take Payment Modal opened")}
            >
              Take payment
            </button>
          </div>
        </aside>

        {/* ================================================================
            MAIN CONTENT (Ảnh 1, 2, 4, 5, 6)
            ================================================================ */}
        <main className="sq-main-content">
          {/* Header (Ảnh 2) */}
          <header className="sq-dashboard-header">
            <h1 className="sq-dashboard-title">Set up your business to start selling</h1>
            <p className="sq-dashboard-subtitle">1 of 6 steps completed</p>
          </header>

          {/* Onboarding Cards Grid (Ảnh 4) */}
          <section className="sq-onboarding-grid" aria-label="Setup Guides">
            {/* Row 1, Card 1: Promo card */}
            <div className="sq-card-promo">
              <span className="sq-promo-expiry">Expires in 2 days 23 hours</span>
              <p className="sq-promo-text">
                Get free processing on up to $1,000 when you take your first card payment
              </p>
            </div>

            {/* Row 1, Card 2: Demo your new POS */}
            {!dismissedPosCard && (
              <div className="sq-card-standard">
                <div>
                  <div className="sq-card-icon-wrap">
                    <PosMonitorIcon />
                  </div>
                  <h3 className="sq-card-title">Demo your new POS</h3>
                  <p className="sq-card-desc">Run a test sale to get familiar.</p>
                </div>
                <div className="sq-card-actions">
                  <button type="button" className="sq-btn-pill-gray">
                    Try it out
                  </button>
                  <button
                    type="button"
                    className="sq-link-dismiss"
                    onClick={this.handleDismissPos}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Row 1, Card 3: Get approved to take payments */}
            <div className="sq-card-standard">
              <div>
                <div className="sq-card-icon-wrap">
                  <ShieldCheckIcon />
                </div>
                <h3 className="sq-card-title">Get approved to take payments</h3>
                <p className="sq-card-desc">Verify your identity to accept payments.</p>
              </div>
              <div className="sq-card-actions">
                <button type="button" className="sq-btn-pill-gray">
                  Verify your identity
                </button>
              </div>
            </div>

            {/* Row 2, Card 1: Add hardware */}
            <div className="sq-card-standard">
              <div>
                <div className="sq-card-icon-wrap">
                  <HardwareGridIcon />
                </div>
                <h3 className="sq-card-title">Add hardware</h3>
                <p className="sq-card-desc">Order hardware or set up devices you have.</p>
              </div>
              <div className="sq-card-actions">
                <button type="button" className="sq-btn-pill-gray">
                  Shop hardware
                </button>
                <button type="button" className="sq-link-dismiss">
                  Set up hardware
                </button>
              </div>
            </div>

            {/* Row 2, Card 2: Take your first payment */}
            <div className="sq-card-standard">
              <div>
                <div className="sq-card-icon-wrap">
                  <CreditCardIcon />
                </div>
                <h3 className="sq-card-title">Take your first payment</h3>
                <p className="sq-card-desc">Choose how you'd like to take your first payment.</p>
              </div>
              <div className="sq-card-actions">
                <button type="button" className="sq-btn-pill-gray">
                  Get started
                </button>
              </div>
            </div>

            {/* Row 2, Card 3: Empty slot (Ảnh 1 & 4) */}
            <div className="sq-card-empty" aria-hidden="true" />
          </section>

          {/* 2-Column Main Section (Ảnh 5 & 6) */}
          <section className="sq-dashboard-columns">
            {/* Left Column (~70%) */}
            <div className="sq-col-left">
              {/* AI Chat Prompt Input (Ảnh 5) */}
              <form className="sq-ai-input-card" onSubmit={this.handleAiSubmit}>
                <input
                  type="text"
                  className="sq-ai-input-field"
                  placeholder="How do I deactivate an employee?"
                  value={aiQuery}
                  onChange={(e) => this.setState({ aiQuery: e.target.value })}
                  aria-label="Ask Square AI"
                />
                <button type="submit" className="sq-ai-submit-btn" aria-label="Send Query">
                  <ArrowUpIcon />
                </button>
              </form>

              {/* Order Volume Card (Ảnh 5) */}
              <div className="sq-order-volume-card">
                <div className="sq-ov-header">
                  <div>
                    <h2 className="sq-ov-title">Order volume</h2>
                    <div className="sq-ov-legend-row">
                      <span className="sq-ov-legend-label">New orders</span>
                      <span className="sq-ov-legend-today">
                        <span className="sq-box-solid-blue" />
                        Today
                      </span>
                      <span className="sq-ov-legend-comparison">
                        <span className="sq-box-striped-blue" />
                        Friday, October 2, 2026
                      </span>
                    </div>
                  </div>
                  <a href="#view-orders" className="sq-ov-link-orders">
                    View orders
                  </a>
                </div>

                <div className="sq-chart-area">
                  <div className="sq-chart-gridlines">
                    <div className="sq-gridline" />
                    <div className="sq-gridline" />
                    <div className="sq-gridline" />
                  </div>
                  <div className="sq-chart-empty-badge">No current order activity</div>
                  <div className="sq-chart-x-axis">
                    <span>3:00 AM</span>
                    <span>4:00 AM</span>
                    <span>5:00 AM</span>
                    <span>6:00 AM</span>
                    <span>7:00 AM</span>
                    <span>8:00 AM</span>
                    <span>9:00 AM</span>
                    <span>10:00 AM</span>
                    <span>11:00 AM</span>
                  </div>
                </div>
              </div>

              {/* Performance Card (Ảnh 6) */}
              <div className="sq-performance-card">
                <h2 className="sq-perf-title">Performance</h2>

                {/* 3 Filter Chips */}
                <div className="sq-perf-filters">
                  <button type="button" className="sq-filter-chip">
                    <span className="sq-chip-prefix">Date</span>
                    <span className="sq-chip-val">{selectedDateChip}</span>
                  </button>
                  <button type="button" className="sq-filter-chip">
                    <span className="sq-chip-prefix">vs</span>
                    <span className="sq-chip-val">{selectedVsChip}</span>
                  </button>
                  <button type="button" className="sq-filter-chip">
                    <span className="sq-chip-prefix">Checks</span>
                    <span className="sq-chip-val">{selectedChecksChip}</span>
                  </button>
                </div>

                {/* Chart & Net Sales Block */}
                <div className="sq-perf-main-row">
                  <div className="sq-net-sales-block">
                    <div>
                      <span className="sq-net-sales-label">Net sales</span>
                      <h3 className="sq-net-sales-val">$0.00</h3>
                      <span className="sq-na-badge">
                        <span className="sq-na-triangle">▲</span> N/A
                      </span>
                    </div>

                    <div className="sq-perf-legend-col">
                      <div className="sq-perf-legend-item">
                        <span className="sq-box-solid-blue" />
                        <span>Today</span>
                      </div>
                      <div className="sq-perf-legend-item">
                        <span className="sq-box-light-blue" />
                        <span>Thu, Oct 8, 2026</span>
                      </div>
                    </div>
                  </div>

                  <div className="sq-perf-chart-wrap">
                    <div className="sq-chart-gridlines">
                      <div className="sq-gridline" />
                      <div className="sq-gridline" />
                      <div className="sq-gridline" />
                    </div>
                    <div className="sq-chart-empty-badge">
                      No data available for selected timeframe
                    </div>
                    <div className="sq-chart-x-axis">
                      <span>8am</span>
                      <span>9</span>
                      <span>10</span>
                      <span>11</span>
                      <span>12pm</span>
                      <span>1</span>
                      <span>2pm</span>
                    </div>
                  </div>
                </div>

                <hr className="sq-perf-divider" />

                {/* Metrics 2-Column Grid */}
                <div className="sq-metrics-grid">
                  <div className="sq-metric-item">
                    <div className="sq-metric-info">
                      <span className="sq-metric-label">Gross sales</span>
                      <span className="sq-metric-val">$0.00</span>
                    </div>
                    <span className="sq-na-badge">
                      <span className="sq-na-triangle">▲</span> N/A
                    </span>
                  </div>

                  <div className="sq-metric-item">
                    <div className="sq-metric-info">
                      <span className="sq-metric-label">Transactions</span>
                      <span className="sq-metric-val">0</span>
                    </div>
                    <span className="sq-na-badge">
                      <span className="sq-na-triangle">▲</span> N/A
                    </span>
                  </div>

                  <div className="sq-metric-item">
                    <div className="sq-metric-info">
                      <span className="sq-metric-label">Labor % of net sales</span>
                      <span className="sq-metric-val">0.00%</span>
                    </div>
                    <span className="sq-na-badge">
                      <span className="sq-na-triangle">▲</span> N/A
                    </span>
                  </div>

                  <div className="sq-metric-item">
                    <div className="sq-metric-info">
                      <span className="sq-metric-label">Average sale</span>
                      <span className="sq-metric-val">$0.00</span>
                    </div>
                    <span className="sq-na-badge">
                      <span className="sq-na-triangle">▲</span> N/A
                    </span>
                  </div>

                  <div className="sq-metric-item">
                    <div className="sq-metric-info">
                      <span className="sq-metric-label">Comps &amp; discounts</span>
                      <span className="sq-metric-val">$0.00</span>
                    </div>
                    <span className="sq-na-badge">
                      <span className="sq-na-triangle">▲</span> N/A
                    </span>
                  </div>

                  <div className="sq-metric-item">
                    <div className="sq-metric-info">
                      <span className="sq-metric-label">Tips</span>
                      <span className="sq-metric-val">$0.00</span>
                    </div>
                    <span className="sq-na-badge">
                      <span className="sq-na-triangle">▲</span> N/A
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (~30%) */}
            <div className="sq-col-right">
              {/* Banking Card (Ảnh 5 & 6) */}
              <div className="sq-banking-card">
                <h3 className="sq-banking-title">Banking</h3>
                <div className="sq-banking-row">
                  <span className="sq-banking-balance-label">Balance</span>
                  <span className="sq-banking-balance-val">0,00 US$</span>
                </div>
              </div>

              {/* Quick Actions Card (Ảnh 5 & 6) */}
              <div className="sq-quick-actions-card">
                <h3 className="sq-qa-title">Quick actions</h3>
                <ul className="sq-qa-list">
                  <li className="sq-qa-item">
                    <button
                      type="button"
                      className="sq-qa-btn"
                      onClick={() => alert("Action: Take payment")}
                    >
                      Take payment
                    </button>
                  </li>
                  <li className="sq-qa-item">
                    <button
                      type="button"
                      className="sq-qa-btn"
                      onClick={() => alert("Action: Edit menu")}
                    >
                      Edit menu
                    </button>
                  </li>
                  <li className="sq-qa-item">
                    <button
                      type="button"
                      className="sq-qa-btn"
                      onClick={() => alert("Action: Add item")}
                    >
                      Add item
                    </button>
                  </li>
                  <li className="sq-qa-item">
                    <button
                      type="button"
                      className="sq-qa-btn"
                      onClick={() => alert("Action: Pay a bill")}
                    >
                      Pay a bill
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }
}
