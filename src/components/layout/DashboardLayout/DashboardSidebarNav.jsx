import React, { PureComponent } from "react";
import {
  HomeIcon,
  TagIcon,
  ChevronIcon,
  ReceiptIcon,
  CustomersIcon,
  ReportsIcon,
  StaffIcon,
  BankIcon,
  MegaphoneIcon,
  SettingsIcon,
  DotsIcon,
  ChannelsGridIcon,
  BagIcon,
  StarBadgeIcon,
} from "@/components/ui/Icon";

const PRIMARY_NAV_ITEMS = [
  { key: "orders", label: "Orders", Icon: ReceiptIcon },
  { key: "customers", label: "Customers", Icon: CustomersIcon },
  { key: "reports", label: "Reports", Icon: ReportsIcon },
  { key: "staff", label: "Staff", Icon: StaffIcon },
  { key: "banking", label: "Banking", Icon: BankIcon },
  { key: "whats-new", label: "What's new", Icon: MegaphoneIcon },
  { key: "settings", label: "Settings", Icon: SettingsIcon },
  { key: "add-more", label: "Add more", Icon: DotsIcon },
];

const SECONDARY_NAV_ITEMS = [
  { key: "channels", label: "Channels", Icon: ChannelsGridIcon },
  { key: "online-ordering", label: "Online ordering", Icon: BagIcon },
];

export default class DashboardSidebarNav extends PureComponent {
  render() {
    const {
      activeMenu,
      currentView,
      isItemsMenusOpen,
      isItemsOpen,
      onToggleItemsMenus,
      onToggleItems,
      onNavigateToHome,
      onNavigateToItemLibrary,
      onNavigateToCategories,
      onMenuClick,
      newOrdersCount = 0,
    } = this.props;

    return (
      <div className="sq-sidebar-menu-scroll">
        <ul className="sq-nav-list">
<li className="sq-nav-item">
            <button
              type="button"
              className={`sq-nav-btn ${activeMenu === "home" && currentView === "home" ? "is-active" : ""}`}
              onClick={onNavigateToHome}
            >
              <span className="sq-nav-btn-icon">
                <HomeIcon />
              </span>
              <span className="sq-nav-btn-label">Home</span>
            </button>
          </li>

<li className="sq-nav-item">
            <button
              type="button"
              className={`sq-nav-btn sq-nav-btn-accordion ${
                activeMenu === "items-menus" ? "is-active" : isItemsMenusOpen ? "is-expanded" : ""
              }`}
              onClick={onToggleItemsMenus}
              aria-expanded={isItemsMenusOpen}
            >
              <span className="sq-nav-btn-icon">
                <TagIcon />
              </span>
              <span className="sq-nav-btn-label">Items &amp; menus</span>
              <ChevronIcon rotated={isItemsMenusOpen} />
            </button>

<div
              className={`sq-subnav-collapse ${isItemsMenusOpen ? "is-open" : ""}`}
              aria-hidden={!isItemsMenusOpen}
            >
              <div className="sq-subnav-collapse-inner">
                <ul className="sq-subnav-list">
<li className="sq-subitem">
                    <button
                      type="button"
                      className={`sq-subitem-btn sq-subitem-btn-accordion ${
                        isItemsOpen ? "is-expanded" : ""
                      }`}
                      onClick={onToggleItems}
                      aria-expanded={isItemsOpen}
                    >
                      <span className="sq-subitem-btn-label">Items</span>
                      <ChevronIcon rotated={isItemsOpen} />
                    </button>

<div
                      className={`sq-subsubnav-collapse ${isItemsOpen ? "is-open" : ""}`}
                      aria-hidden={!isItemsOpen}
                    >
                      <div className="sq-subsubnav-collapse-inner">
                        <ul className="sq-subsubnav-list">
                          <li className="sq-subsubitem">
                            <button
                              type="button"
                              className={`sq-subsubitem-btn ${
                                activeMenu === "item-library" && currentView === "item-library"
                                  ? "is-active"
                                  : ""
                              }`}
                              onClick={onNavigateToItemLibrary}
                            >
                              Item library
                            </button>
                          </li>
                          <li className="sq-subsubitem">
                            <button
                              type="button"
                              className={`sq-subsubitem-btn ${
                                activeMenu === "item-options" || currentView === "item-options" ? "is-active" : ""
                              }`}
                              onClick={() => onMenuClick("item-options")}
                            >
                              Item options
                            </button>
                          </li>
                          <li className="sq-subsubitem">
                            <button
                              type="button"
                              className={`sq-subsubitem-btn ${
                                (activeMenu === "modifiers" && currentView === "modifiers") || currentView === "modifiers"
                                  ? "is-active"
                                  : ""
                              }`}
                              onClick={() => onMenuClick("modifiers")}
                            >
                              Modifiers
                            </button>
                          </li>
                          <li className="sq-subsubitem">
                            <button
                              type="button"
                              className={`sq-subsubitem-btn ${
                                (activeMenu === "categories" && currentView === "categories") || currentView === "categories"
                                  ? "is-active"
                                  : ""
                              }`}
                              onClick={onNavigateToCategories}
                            >
                              Categories
                            </button>
                          </li>
                          <li className="sq-subsubitem">
                            <button
                              type="button"
                              className={`sq-subsubitem-btn ${
                                activeMenu === "units" || currentView === "units" ? "is-active" : ""
                              }`}
                              onClick={() => onMenuClick("units")}
                            >
                              <span className="sq-subsubitem-label">Units</span>
                              <StarBadgeIcon />
                            </button>
                          </li>
                          <li className="sq-subsubitem">
                            <button
                              type="button"
                              className={`sq-subsubitem-btn ${
                                activeMenu === "custom-attributes" || currentView === "custom-attributes" ? "is-active" : ""
                              }`}
                              onClick={() => onMenuClick("custom-attributes")}
                            >
                              Custom attributes
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </li>

                  <li className="sq-subitem">
                    <button
                      type="button"
                      className={`sq-subitem-btn ${
                        activeMenu === "menus" || currentView === "menus" ? "is-active" : ""
                      }`}
                      onClick={() => onMenuClick("menus")}
                    >
                      Menus
                    </button>
                  </li>
                  <li className="sq-subitem">
                    <button
                      type="button"
                      className={`sq-subitem-btn ${
                        activeMenu === "kitchen-settings" || currentView === "kitchen-settings" ? "is-active" : ""
                      }`}
                      onClick={() => onMenuClick("kitchen-settings")}
                    >
                      Kitchen settings
                    </button>
                  </li>
                  <li className="sq-subitem">
                    <button
                      type="button"
                      className={`sq-subitem-btn ${
                        activeMenu === "channels-sub" || currentView === "channels" ? "is-active" : ""
                      }`}
                      onClick={() => onMenuClick("channels-sub")}
                    >
                      Channels
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {PRIMARY_NAV_ITEMS.map(({ key, label, Icon }) => {
            const isActive = activeMenu === key || (key === "orders" && currentView === "orders");
            const badgeCount = key === "orders" ? newOrdersCount : 0;

            return (
              <li key={key} className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${isActive ? "is-active" : ""}`}
                  onClick={() => onMenuClick(key)}
                >
                  <span className="sq-nav-btn-icon">
                    <Icon />
                  </span>
                  <span
                    className="sq-nav-btn-label"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <span>{label}</span>
                    {badgeCount > 0 && (
                      <span
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#ffffff",
                          fontSize: "11px",
                          fontWeight: 700,
                          borderRadius: "10px",
                          padding: "1px 6px",
                          lineHeight: "16px",
                        }}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <hr className="sq-sidebar-divider" />

<ul className="sq-nav-list">
          {SECONDARY_NAV_ITEMS.map(({ key, label, Icon }) => (
            <li key={key} className="sq-nav-item">
              <button
                type="button"
                className={`sq-nav-btn ${activeMenu === key || (key === "channels" && currentView === "channels") ? "is-active" : ""}`}
                onClick={() => onMenuClick(key)}
              >
                <span className="sq-nav-btn-icon">
                  <Icon />
                </span>
                <span className="sq-nav-btn-label">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
