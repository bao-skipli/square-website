import React, { PureComponent } from "react";
import DashboardSidebarHeader from "./DashboardSidebarHeader";
import DashboardSidebarNav from "./DashboardSidebarNav";
import DashboardSidebarFooter from "./DashboardSidebarFooter";

export default class DashboardSidebar extends PureComponent {
  render() {
    const {
      businessName,
      searchQuery,
      onSearchChange,
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
    } = this.props;

    return (
      <aside className="sq-sidebar" aria-label="Square Sidebar Navigation">
        <DashboardSidebarHeader
          businessName={businessName}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
        <DashboardSidebarNav
          activeMenu={activeMenu}
          currentView={currentView}
          isItemsMenusOpen={isItemsMenusOpen}
          isItemsOpen={isItemsOpen}
          onToggleItemsMenus={onToggleItemsMenus}
          onToggleItems={onToggleItems}
          onNavigateToHome={onNavigateToHome}
          onNavigateToItemLibrary={onNavigateToItemLibrary}
          onNavigateToCategories={onNavigateToCategories}
          onMenuClick={onMenuClick}
        />
        <DashboardSidebarFooter />
      </aside>
    );
  }
}
