import React from "react";
import { DashboardModifierController } from "@/features/dashboard/DashboardModifierController";
import { withRouter } from "@/features/dashboard/withRouter";
import {
  getFilteredItems,
  getFilteredCategories,
  getItemCountForCategory,
} from "@/features/dashboard/dashboardSelectors";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { DashboardHomeView } from "@/features/dashboard/home";
import {
  ItemLibraryView,
  ItemFilterDrawer,
  ItemFormModal,
} from "@/features/dashboard/items";
import {
  buildItemDetailsProps,
  buildItemSettingsProps,
} from "@/features/dashboard/items/itemPropsBuilder";
import {
  CategoriesView,
  CategoryFormModal,
  ParentCategoryModal,
  AddItemsModal,
} from "@/features/dashboard/categories";
import {
  GenericView,
  UnsavedChangesModal,
} from "@/features/dashboard/common";
import {
  ModifiersView,
  ModifierSetModal,
  ApplyToItemsModal,
} from "@/features/dashboard/modifiers";
import OnlineStoreSetupView from "@/features/dashboard/online/OnlineStoreSetupView";
import HomeSkeleton from "./HomeSkeleton";
import DashboardLoading from "./DashboardLoading";
import "./Dashboard.css";

class Dashboard extends DashboardModifierController {
  render() {
    const {
      businessName,
      currentView,
      activeMenu,
      isItemsMenusOpen,
      isItemsOpen,
      searchQuery,
      aiQuery,
      dismissedPosCard,
      selectedDateChip,
      selectedVsChip,
      selectedChecksChip,
      items,
      librarySearchQuery,
      isCreateItemOpen,
      isHeaderScrolled,
      isFilterDrawerOpen,
      filterDrawerView,
      drawerCategorySearch,
      appliedCategories,
      draftCategories,
      appliedStatuses,
      draftStatuses,
      isActionsOpen,
      categories,
      categoriesSearchQuery,
      categoryViewMode,
      expandedCategoryIds,
      selectedCategoryIds,
      isCreateCategoryOpen,
      editingCategoryId,
      categoryFormName,
      categoryFormParentId,
      categoryFormItems,
      categoryFormPointsOfSale,
      isCategoryActionsOpen,
      isParentCategoryModalOpen,
      parentCategorySearch,
      draftSelectedParentId,
      isAddItemsModalOpen,
      addItemsSearch,
      draftSelectedItems,
      editingItemId,
      isItemActionsOpen,
      isUnsavedChangesModalOpen,
      isHomeLoading,
      isContentLoading,
      isSavingItem,
      isSavingCategory,
      categoryFormError,
      hasLoadedModifiers = false,
      modifierSets = [],
      modifierSetItems = {},
      isCreateModifierOpen = false,
      editingModifierSetId = null,
      editingModifierSet = null,
      isApplyToItemsOpen = false,
      applyToItemsSet = null,
    } = this.state;

    const filteredItems = getFilteredItems(
      items,
      librarySearchQuery,
      appliedCategories,
      appliedStatuses
    );

    const filteredCategories = getFilteredCategories(
      categories,
      categoriesSearchQuery
    );

    const isAllCategoriesSelected =
      categories.length > 0 && selectedCategoryIds.length === categories.length;

    const parentCatObj = categoryFormParentId
      ? categories.find((c) => c.id === categoryFormParentId)
      : null;

    return (
      <div className="sq-dashboard-shell">
        <DashboardLayout
          businessName={businessName}
          searchQuery={searchQuery}
          onSearchChange={(e) => this.setState({ searchQuery: e.target.value })}
          activeMenu={activeMenu}
          currentView={currentView}
          isItemsMenusOpen={isItemsMenusOpen}
          isItemsOpen={isItemsOpen}
          onToggleItemsMenus={this.toggleItemsMenus}
          onToggleItems={this.toggleItems}
          onNavigateToHome={this.navigateToHome}
          onNavigateToItemLibrary={this.navigateToItemLibrary}
          onNavigateToCategories={this.navigateToCategories}
          onNavigateToModifiers={this.navigateToModifiers}
          onMenuClick={this.handleMenuClick}
        >
          {currentView === "home" && isHomeLoading ? (
            <HomeSkeleton />
          ) : currentView !== "home" && (isContentLoading || (currentView === "modifiers" && !hasLoadedModifiers)) ? (
            <DashboardLoading />
          ) : currentView === "modifiers" ? (
            <ModifiersView
              isLoading={!hasLoadedModifiers || isContentLoading}
              modifierSets={modifierSets}
              locations={[{ id: "loc-skipli", name: "Skipli" }]}
              onOpenCreateModifier={this.openCreateModifierSet}
              onOpenEditModifier={this.openEditModifierSet}
              onOpenApplyToItems={this.openApplyToItems}
              onReorderSets={this.handleReorderModifierSets}
            />
          ) : currentView === "categories" ? (
            <CategoriesView
              onOpenCreateCategory={this.openCreateCategory}
              categoriesSearchQuery={categoriesSearchQuery}
              onSearchChange={(e) =>
                this.setState({ categoriesSearchQuery: e.target.value })
              }
              categoryViewMode={categoryViewMode}
              onChangeViewMode={(mode) => this.setState({ categoryViewMode: mode })}
              isAllCategoriesSelected={isAllCategoriesSelected}
              onToggleSelectAllCategories={this.handleToggleSelectAllCategories}
              filteredCategories={filteredCategories}
              categories={categories}
              expandedCategoryIds={expandedCategoryIds}
              selectedCategoryIds={selectedCategoryIds}
              getItemCountForCategory={(name) =>
                getItemCountForCategory(categories, items, name)
              }
              onOpenEditCategory={this.openEditCategory}
              onToggleCategoryExpand={this.toggleCategoryExpand}
              onToggleCategorySelect={this.handleToggleCategorySelect}
            />
          ) : currentView === "item-library" ? (
            <ItemLibraryView
              librarySearchQuery={librarySearchQuery}
              onSearchChange={(e) =>
                this.setState({ librarySearchQuery: e.target.value })
              }
              appliedCategories={appliedCategories}
              appliedStatuses={appliedStatuses}
              onOpenCategoryFilter={this.openCategoryFilter}
              onOpenStatusFilter={this.openStatusFilter}
              onOpenAllFilters={this.openAllFilters}
              isActionsOpen={isActionsOpen}
              onToggleActionsDropdown={this.toggleActionsDropdown}
              actionsRef={(el) => (this.actionsRef = el)}
              onActionItemClick={this.handleActionItemClick}
              onNavigateToCreateItem={this.navigateToCreateItem}
              filteredItems={filteredItems}
              onOpenEditItem={this.openEditItem}
            />
          ) : currentView === "home" ? (
            <DashboardHomeView
              dismissedPosCard={dismissedPosCard}
              onDismissPos={this.handleDismissPos}
              aiQuery={aiQuery}
              onAiSubmit={this.handleAiSubmit}
              onAiQueryChange={(e) => this.setState({ aiQuery: e.target.value })}
              selectedDateChip={selectedDateChip}
              selectedVsChip={selectedVsChip}
              selectedChecksChip={selectedChecksChip}
            />
          ) : currentView === "online-ordering" || currentView === "online" || currentView === "store-setup" ? (
            <OnlineStoreSetupView
              userId={this.state.userId}
              categories={categories}
              items={items}
              locations={[{ id: "loc-skipli", name: "Skipli" }]}
            />
          ) : (
            <GenericView title={this.getMenuLabel(currentView)} />
          )}
        </DashboardLayout>

        <ItemFormModal
          isOpen={isCreateItemOpen}
          onScroll={this.handleCreateItemScroll}
          editingItemId={editingItemId}
          isHeaderScrolled={isHeaderScrolled}
          isItemActionsOpen={isItemActionsOpen}
          itemActionsRef={(el) => (this.itemActionsRef = el)}
          onClose={this.handleCloseCreateItem}
          onToggleActions={this.toggleItemActionsDropdown}
          onSave={this.handleSaveItem}
          isSaving={isSavingItem}
          onDuplicate={this.handleDuplicateItem}
          onArchive={this.handleArchiveItem}
          onDelete={this.handleDeleteItem}
          detailsProps={buildItemDetailsProps(this)}
          settingsProps={buildItemSettingsProps(this)}
        />

        <CategoryFormModal
          isOpen={isCreateCategoryOpen}
          editingCategoryId={editingCategoryId}
          isHeaderScrolled={isHeaderScrolled}
          isCategoryActionsOpen={isCategoryActionsOpen}
          catActionsRef={(el) => (this.catActionsRef = el)}
          onClose={this.handleCloseCategoryForm}
          onToggleActions={this.toggleCategoryActionsDropdown}
          onDelete={this.handleDeleteCategory}
          onSave={this.handleSaveCategory}
          isSaving={isSavingCategory}
          categoryFormName={categoryFormName}
          categoryFormError={categoryFormError}
          onNameChange={(e) =>
            this.setState({
              categoryFormName: e.target.value,
              categoryFormError: "",
            })
          }
          parentCategoryName={parentCatObj ? parentCatObj.name : null}
          onOpenParentCategoryModal={this.openParentCategoryModal}
          categoryFormItems={categoryFormItems}
          onOpenAddItemsModal={this.openAddItemsModal}
          categoryFormPointsOfSale={categoryFormPointsOfSale}
          onTogglePointsOfSale={() =>
            this.setState((prev) => ({
              categoryFormPointsOfSale: !prev.categoryFormPointsOfSale,
            }))
          }
          subcategories={
            editingCategoryId
              ? categories.filter((c) => c.parentId === editingCategoryId)
              : []
          }
        />

        <ParentCategoryModal
          isOpen={isParentCategoryModalOpen}
          onClose={this.closeParentCategoryModal}
          onApply={this.applyParentCategoryModal}
          parentCategorySearch={parentCategorySearch}
          onSearchChange={(e) =>
            this.setState({ parentCategorySearch: e.target.value })
          }
          draftSelectedParentId={draftSelectedParentId}
          onSelectParent={(id) => this.setState({ draftSelectedParentId: id })}
          categories={categories}
          editingCategoryId={editingCategoryId}
        />

        <AddItemsModal
          isOpen={isAddItemsModalOpen}
          onClose={this.closeAddItemsModal}
          onApply={this.applyAddItemsModal}
          draftSelectedItems={draftSelectedItems}
          addItemsSearch={addItemsSearch}
          onSearchChange={(e) =>
            this.setState({ addItemsSearch: e.target.value })
          }
          items={items}
          onToggleItem={this.toggleDraftItem}
          onCreateNewItem={() => {
            this.closeAddItemsModal();
            this.navigateToCreateItem();
          }}
        />

        <UnsavedChangesModal
          isOpen={isUnsavedChangesModalOpen}
          onDiscard={this.handleDiscardChanges}
          onResume={() => this.setState({ isUnsavedChangesModalOpen: false })}
        />

        <ItemFilterDrawer
          isOpen={isFilterDrawerOpen}
          onClose={this.closeFilterDrawer}
          filterDrawerView={filterDrawerView}
          onDrawerBack={this.handleDrawerBack}
          drawerCategorySearch={drawerCategorySearch}
          onCategorySearchChange={(e) =>
            this.setState({ drawerCategorySearch: e.target.value })
          }
          availableCategoriesList={categories.map((c) => c.name)}
          draftCategories={draftCategories}
          onToggleCategoryDraft={this.handleToggleCategoryDraft}
          onResetCategoryDraft={this.handleResetCategoryDraft}
          draftStatuses={draftStatuses}
          onToggleStatusDraft={this.handleToggleStatusDraft}
          onToggleSelectAllStatusDraft={this.handleToggleSelectAllStatusDraft}
          onResetStatusDraft={this.handleResetStatusDraft}
          onResetAllDrafts={this.handleResetAllDrafts}
          onApplyFilters={this.handleApplyFilters}
          onChangeDrawerView={(view) => this.setState({ filterDrawerView: view })}
        />

        {isCreateModifierOpen && (
          <ModifierSetModal
            key={editingModifierSetId || "new_modifier_set"}
            isOpen={isCreateModifierOpen}
            editingModifierSetId={editingModifierSetId}
            initialData={editingModifierSet}
            locations={[{ id: "loc-skipli", name: "Skipli" }]}
            modifierSets={modifierSets}
            onClose={this.handleCloseModifierSet}
            onSave={this.handleSaveModifierSet}
            onDelete={this.handleDeleteModifierSet}
          />
        )}

        <ApplyToItemsModal
          isOpen={isApplyToItemsOpen}
          onClose={this.handleCloseApplyToItems}
          modifierSet={applyToItemsSet}
          items={items}
          appliedItemIds={
            applyToItemsSet
              ? Array.from(
                  new Set([
                    ...(modifierSetItems[applyToItemsSet.id]
                      ? Object.keys(modifierSetItems[applyToItemsSet.id])
                      : []),
                    ...items
                      .filter((i) => {
                        if (!i.modifierSets) return false;
                        if (Array.isArray(i.modifierSets)) {
                          return i.modifierSets.some(
                            (m) =>
                              m === applyToItemsSet.id ||
                              m?.id === applyToItemsSet.id ||
                              m?.setId === applyToItemsSet.id
                          );
                        }
                        return Boolean(i.modifierSets[applyToItemsSet.id]);
                      })
                      .map((i) => i.id),
                  ])
                )
              : []
          }
          onApply={this.handleApplyModifierSetToItems}
        />
      </div>
    );
  }
}

export default withRouter(Dashboard);
