import { DashboardItemController } from "./DashboardItemController";
import {
  saveCategoryToFirebase,
  deleteCategoryFromFirebase,
} from "@/firebase/itemService";

export class DashboardCategoryController extends DashboardItemController {
  openCreateCategory = (updateUrl = true) => {
    this.setState({
      currentView: "categories",
      activeMenu: "categories",
      isItemsMenusOpen: true,
      isItemsOpen: true,
      isCreateCategoryOpen: true,
      editingCategoryId: null,
      categoryFormName: "",
      categoryFormParentId: null,
      categoryFormItems: [],
      categoryFormPointsOfSale: true,
      categoryFormInitial: { name: "", parentId: null, items: [] },
      categoryFormError: "",
      isCategoryActionsOpen: false,
    });
    if (updateUrl && this.props.router?.navigate) {
      this.props.router.navigate("/dashboard/items/categories/new");
    }
  };

  openEditCategory = (cat, updateUrl = true) => {
    const assignedItems = this.state.items
      .filter((i) => i.category && i.category.toLowerCase() === cat.name.toLowerCase())
      .map((i) => i.id);

    this.setState({
      currentView: "categories",
      activeMenu: "categories",
      isItemsMenusOpen: true,
      isItemsOpen: true,
      isCreateCategoryOpen: true,
      editingCategoryId: cat.id,
      categoryFormName: cat.name,
      categoryFormParentId: cat.parentId || null,
      categoryFormItems: assignedItems,
      categoryFormPointsOfSale: cat.pointsOfSale !== false,
      categoryFormInitial: {
        name: cat.name,
        parentId: cat.parentId || null,
        items: [...assignedItems],
      },
      categoryFormError: "",
      isCategoryActionsOpen: false,
    });
    if (updateUrl && this.props.router?.navigate) {
      this.props.router.navigate(`/dashboard/items/categories/${cat.id}`);
    }
  };

  handleCloseCategoryForm = () => {
    const {
      categoryFormName,
      categoryFormParentId,
      categoryFormItems,
      categoryFormInitial,
    } = this.state;

    let hasChanges = false;
    if (categoryFormInitial) {
      hasChanges =
        categoryFormName !== categoryFormInitial.name ||
        categoryFormParentId !== categoryFormInitial.parentId ||
        categoryFormItems.length !== categoryFormInitial.items.length ||
        categoryFormItems.some((id) => !categoryFormInitial.items.includes(id));
    } else {
      hasChanges =
        categoryFormName.trim() !== "" ||
        categoryFormParentId !== null ||
        categoryFormItems.length > 0;
    }

    if (hasChanges) {
      this.setState({
        isUnsavedChangesModalOpen: true,
        unsavedChangesTarget: "category",
      });
    } else {
      this.setState({
        isCreateCategoryOpen: false,
        editingCategoryId: null,
        categoryFormError: "",
      });
      this.navigateToCategories();
    }
  };

  handleSaveCategory = async (e) => {
    if (e) e.preventDefault();
    const {
      categoryFormName,
      categoryFormParentId,
      categoryFormItems,
      categoryFormPointsOfSale,
      categories,
      items,
      editingCategoryId,
      userId,
    } = this.state;

    if (!categoryFormName.trim()) {
      this.setState({ categoryFormError: "Category name is required." });
      return;
    }

    this.setState({ isSavingCategory: true, categoryFormError: "" });

    const oldCat = editingCategoryId
      ? categories.find((c) => c.id === editingCategoryId)
      : null;
    const oldCatName = oldCat ? oldCat.name : null;

    const categoryData = {
      id: editingCategoryId || `cat-${Date.now()}`,
      name: categoryFormName.trim(),
      parentId: categoryFormParentId,
      pointsOfSale: categoryFormPointsOfSale,
    };

    try {
      await saveCategoryToFirebase(
        userId,
        categoryData,
        categoryFormItems,
        oldCatName,
        items
      );
      this.setState((prev) => ({
        isSavingCategory: false,
        isCreateCategoryOpen: false,
        editingCategoryId: null,
        categoryFormError: "",
        expandedCategoryIds:
          categoryFormParentId && !prev.expandedCategoryIds.includes(categoryFormParentId)
            ? [...prev.expandedCategoryIds, categoryFormParentId]
            : prev.expandedCategoryIds,
      }));
      this.navigateToCategories();
    } catch (err) {
      console.error("Save category error:", err);
      this.setState({
        isSavingCategory: false,
        categoryFormError: err?.message || "Failed to save category. Please try again.",
      });
    }
  };

  handleDeleteCategory = async () => {
    const { editingCategoryId, categories, items, userId } = this.state;
    if (!editingCategoryId) return;
    const cat = categories.find((c) => c.id === editingCategoryId);
    if (!cat) return;

    try {
      await deleteCategoryFromFirebase(
        userId,
        editingCategoryId,
        cat.name,
        categories,
        items
      );
    } catch (err) {
      console.warn("Delete category error:", err);
    }

    this.setState({
      isCreateCategoryOpen: false,
      editingCategoryId: null,
      isCategoryActionsOpen: false,
    });
    this.navigateToCategories();
  };

  handleDiscardChanges = () => {
    const { unsavedChangesTarget } = this.state;
    if (unsavedChangesTarget === "category") {
      this.setState({
        isUnsavedChangesModalOpen: false,
        isCreateCategoryOpen: false,
        editingCategoryId: null,
      });
      this.navigateToCategories();
    } else {
      this.setState({
        isUnsavedChangesModalOpen: false,
        isCreateItemOpen: false,
        editingItemId: null,
      });
      this.navigateToItemLibrary();
    }
  };

  openParentCategoryModal = () => {
    this.setState({
      isParentCategoryModalOpen: true,
      draftSelectedParentId: this.state.categoryFormParentId,
      parentCategorySearch: "",
    });
  };

  closeParentCategoryModal = () => {
    this.setState({ isParentCategoryModalOpen: false });
  };

  applyParentCategoryModal = () => {
    this.setState((prev) => ({
      categoryFormParentId: prev.draftSelectedParentId,
      isParentCategoryModalOpen: false,
    }));
  };

  openAddItemsModal = () => {
    this.setState({
      isAddItemsModalOpen: true,
      draftSelectedItems: [...this.state.categoryFormItems],
      addItemsSearch: "",
    });
  };

  closeAddItemsModal = () => {
    this.setState({ isAddItemsModalOpen: false });
  };

  applyAddItemsModal = () => {
    this.setState((prev) => ({
      categoryFormItems: [...prev.draftSelectedItems],
      isAddItemsModalOpen: false,
    }));
  };

  toggleDraftItem = (itemId) => {
    this.setState((prev) => {
      const exists = prev.draftSelectedItems.includes(itemId);
      return {
        draftSelectedItems: exists
          ? prev.draftSelectedItems.filter((id) => id !== itemId)
          : [...prev.draftSelectedItems, itemId],
      };
    });
  };

  toggleCategoryExpand = (catId, e) => {
    if (e) e.stopPropagation();
    this.setState((prev) => {
      const isExpanded = prev.expandedCategoryIds.includes(catId);
      return {
        expandedCategoryIds: isExpanded
          ? prev.expandedCategoryIds.filter((id) => id !== catId)
          : [...prev.expandedCategoryIds, catId],
      };
    });
  };

  handleToggleSelectAllCategories = () => {
    this.setState((prev) => {
      const allIds = prev.categories.map((c) => c.id);
      const isAllSelected = prev.selectedCategoryIds.length === allIds.length;
      return {
        selectedCategoryIds: isAllSelected ? [] : allIds,
      };
    });
  };

  handleToggleCategorySelect = (catId, e) => {
    if (e) e.stopPropagation();
    this.setState((prev) => {
      const exists = prev.selectedCategoryIds.includes(catId);
      return {
        selectedCategoryIds: exists
          ? prev.selectedCategoryIds.filter((id) => id !== catId)
          : [...prev.selectedCategoryIds, catId],
      };
    });
  };

  toggleCategoryActionsDropdown = (e) => {
    e.stopPropagation();
    this.setState((prev) => ({
      isCategoryActionsOpen: !prev.isCategoryActionsOpen,
    }));
  };
}
