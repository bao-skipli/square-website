import React, { PureComponent } from "react";
import DashboardSidebar from "./DashboardSidebar";

export default class DashboardLayout extends PureComponent {
  render() {
    const {
      children,
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
      <div className="sq-dashboard-root">
        <DashboardSidebar
          businessName={businessName}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
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
        <main className="sq-main-content">
          {children}
        </main>
      </div>
    );
  }
}
