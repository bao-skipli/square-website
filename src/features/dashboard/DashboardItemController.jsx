import { DashboardBase } from "./DashboardBase";
import { itemToFormState } from "./dashboardViews";
import {
  saveItemToFirebase,
  deleteItemFromFirebase,
  duplicateItemInFirebase,
  archiveItemInFirebase,
} from "@/firebase/itemService";

export class DashboardItemController extends DashboardBase {
  openCreateItem = (updateUrl = true) => {
    this.setState({
      currentView: "item-library",
      activeMenu: "item-library",
      isItemsMenusOpen: true,
      isItemsOpen: true,
      isCreateItemOpen: true,
      editingItemId: null,
      formName: "",
      formPrice: "",
      formCategory: "",
      formDescription: "",
      formKitchenName: "",
      formMenu: "",
      formSku: "",
      formGtin: "",
      formImageUrl: "",
      formStatus: "Available",
      itemFormInitial: { name: "", price: "", category: "", status: "Available", imageUrl: "" },
      isItemActionsOpen: false,
      formError: "",
    });
    if (updateUrl && this.props.router?.navigate) {
      this.props.router.navigate("/dashboard/items/library/new");
    }
  };

  openEditItem = (item, updateUrl = true) => {
    this.setState({
      currentView: "item-library",
      activeMenu: "item-library",
      isItemsMenusOpen: true,
      isItemsOpen: true,
      isCreateItemOpen: true,
      editingItemId: item.id,
      ...itemToFormState(item),
      isItemActionsOpen: false,
      formError: "",
    });
    if (updateUrl && this.props.router?.navigate) {
      this.props.router.navigate(`/dashboard/items/library/${item.id}`);
    }
  };

  handleCloseCreateItem = () => {
    const { formName, formPrice, formCategory, formStatus, formImageUrl, itemFormInitial } = this.state;
    const hasChanges = itemFormInitial
      ? formName !== itemFormInitial.name ||
      formPrice !== itemFormInitial.price ||
      formCategory !== itemFormInitial.category ||
      formStatus !== itemFormInitial.status ||
      (formImageUrl || "") !== (itemFormInitial.imageUrl || "")
      : formName.trim() !== "" || formPrice.trim() !== "" || Boolean(formImageUrl);

    if (hasChanges) {
      this.setState({
        isUnsavedChangesModalOpen: true,
        unsavedChangesTarget: "item",
      });
    } else {
      this.setState({ isCreateItemOpen: false, editingItemId: null });
      this.navigateToItemLibrary();
    }
  };

  handleSaveItem = async (e) => {
    if (e) e.preventDefault();
    const {
      formName,
      formPrice,
      formCategory,
      formStatus,
      formDescription,
      formKitchenName,
      formMenu,
      formSku,
      formGtin,
      formImageUrl,
      editingItemId,
      userId,
    } = this.state;

    if (!formName.trim()) {
      this.setState({ formError: "Item name is required." });
      return;
    }

    this.setState({ isSavingItem: true, formError: "" });
    const formattedPrice = formPrice
      ? formPrice.startsWith("$")
        ? formPrice
        : `$${formPrice}`
      : "—";

    const itemData = {
      id: editingItemId || `item-${Date.now()}`,
      name: formName.trim(),
      category: formCategory.trim() || "Uncategorized",
      status: formStatus || "Available",
      price: formattedPrice,
      description: formDescription || "",
      kitchenName: formKitchenName || "",
      menu: formMenu || "",
      sku: formSku || "",
      gtin: formGtin || "",
      imageUrl: formImageUrl || "",
    };

    try {
      await saveItemToFirebase(userId, itemData);
      this.setState({
        isSavingItem: false,
        isCreateItemOpen: false,
        editingItemId: null,
        formError: "",
        formName: "",
        formPrice: "",
        formDescription: "",
        formKitchenName: "",
        formCategory: "",
        formMenu: "",
        formSku: "",
        formGtin: "",
        formImageUrl: "",
      });
      this.navigateToItemLibrary();
    } catch (err) {
      console.error("Save item error:", err);
      this.setState({
        isSavingItem: false,
        formError: err?.message || "Failed to save item. Please try again.",
      });
    }
  };

  handleDeleteItem = async () => {
    const { editingItemId, userId } = this.state;
    if (!editingItemId) return;

    try {
      await deleteItemFromFirebase(userId, editingItemId);
    } catch (err) {
      console.warn("Delete item error:", err);
    }

    this.setState({
      isCreateItemOpen: false,
      editingItemId: null,
      isItemActionsOpen: false,
    });
    this.navigateToItemLibrary();
  };

  handleDuplicateItem = async () => {
    const { editingItemId, items, userId } = this.state;
    if (!editingItemId) return;
    const item = items.find((i) => i.id === editingItemId);
    if (!item) return;

    try {
      await duplicateItemInFirebase(userId, item);
    } catch (err) {
      console.warn("Duplicate item error:", err);
    }

    this.setState({
      isCreateItemOpen: false,
      editingItemId: null,
      isItemActionsOpen: false,
    });
    this.navigateToItemLibrary();
  };

  handleArchiveItem = async () => {
    const { editingItemId, userId } = this.state;
    if (!editingItemId) return;

    try {
      await archiveItemInFirebase(userId, editingItemId);
    } catch (err) {
      console.warn("Archive item error:", err);
    }

    this.setState({
      isCreateItemOpen: false,
      editingItemId: null,
      isItemActionsOpen: false,
    });
    this.navigateToItemLibrary();
  };

  handleCreateItemScroll = (e) => {
    const isScrolled = e.target.scrollTop > 50;
    if (isScrolled !== this.state.isHeaderScrolled) {
      this.setState({ isHeaderScrolled: isScrolled });
    }
  };

  openCategoryFilter = () => {
    this.setState((prev) => ({
      isFilterDrawerOpen: true,
      filterDrawerView: "category",
      draftCategories: [...prev.appliedCategories],
      draftStatuses: [...prev.appliedStatuses],
      drawerCategorySearch: "",
      isActionsOpen: false,
    }));
  };

  openStatusFilter = () => {
    this.setState((prev) => ({
      isFilterDrawerOpen: true,
      filterDrawerView: "status",
      draftCategories: [...prev.appliedCategories],
      draftStatuses: [...prev.appliedStatuses],
      isActionsOpen: false,
    }));
  };

  openAllFilters = () => {
    this.setState((prev) => ({
      isFilterDrawerOpen: true,
      filterDrawerView: "all",
      draftCategories: [...prev.appliedCategories],
      draftStatuses: [...prev.appliedStatuses],
      isActionsOpen: false,
    }));
  };

  closeFilterDrawer = () => {
    this.setState({ isFilterDrawerOpen: false });
  };

  handleDrawerBack = () => {
    this.setState({ filterDrawerView: "all" });
  };

  handleToggleCategoryDraft = (catName) => {
    this.setState((prev) => {
      const exists = prev.draftCategories.includes(catName);
      return {
        draftCategories: exists
          ? prev.draftCategories.filter((c) => c !== catName)
          : [...prev.draftCategories, catName],
      };
    });
  };

  handleToggleStatusDraft = (statusName) => {
    this.setState((prev) => {
      const exists = prev.draftStatuses.includes(statusName);
      return {
        draftStatuses: exists
          ? prev.draftStatuses.filter((s) => s !== statusName)
          : [...prev.draftStatuses, statusName],
      };
    });
  };

  handleToggleSelectAllStatusDraft = () => {
    this.setState((prev) => {
      const allChecked =
        prev.draftStatuses.includes("Active") &&
        prev.draftStatuses.includes("Archived");
      return {
        draftStatuses: allChecked ? [] : ["Active", "Archived"],
      };
    });
  };

  handleResetCategoryDraft = () => {
    this.setState({ draftCategories: [] });
  };

  handleResetStatusDraft = () => {
    this.setState({ draftStatuses: [] });
  };

  handleResetAllDrafts = () => {
    this.setState({ draftCategories: [], draftStatuses: [] });
  };

  handleApplyFilters = () => {
    this.setState((prev) => ({
      appliedCategories: [...prev.draftCategories],
      appliedStatuses: [...prev.draftStatuses],
      isFilterDrawerOpen: false,
    }));
  };

  toggleActionsDropdown = (e) => {
    e.stopPropagation();
    this.setState((prev) => ({ isActionsOpen: !prev.isActionsOpen }));
  };

  handleActionItemClick = (actionName) => {
    this.setState({ isActionsOpen: false });
    alert(`Action: ${actionName}`);
  };

  toggleItemActionsDropdown = (e) => {
    e.stopPropagation();
    this.setState((prev) => ({ isItemActionsOpen: !prev.isItemActionsOpen }));
  };

  handleClickOutside = (e) => {
    if (this.actionsRef && !this.actionsRef.contains(e.target)) {
      if (this.state.isActionsOpen) {
        this.setState({ isActionsOpen: false });
      }
    }
    if (this.itemActionsRef && !this.itemActionsRef.contains(e.target)) {
      if (this.state.isItemActionsOpen) {
        this.setState({ isItemActionsOpen: false });
      }
    }
    if (this.catActionsRef && !this.catActionsRef.contains(e.target)) {
      if (this.state.isCategoryActionsOpen) {
        this.setState({ isCategoryActionsOpen: false });
      }
    }
  };
}
