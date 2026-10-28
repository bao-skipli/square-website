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
      formCalories: "",
      formAllergens: "",
      formImageUrl: "",
      formStatus: "Available",
      formModifierSetsMap: {},
      itemFormInitial: { name: "", price: "", category: "", status: "Available", imageUrl: "", calories: "", allergens: "" },
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
      this.setState({ isCreateItemOpen: false, editingItemId: null, formModifierSetsMap: {} });
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
      formCalories,
      formAllergens,
      formImageUrl,
      editingItemId,
      userId,
      items,
      formModifierSetsMap,
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

    const currentItem = editingItemId ? items.find((i) => i.id === editingItemId) : null;
    const modifierSetsToSave = formModifierSetsMap !== undefined
      ? formModifierSetsMap
      : currentItem?.modifierSets || null;

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
      calories: formCalories ? String(formCalories).trim() : "",
      allergens: formAllergens ? String(formAllergens).trim() : "",
      imageUrl: formImageUrl || "",
      modifierSets: modifierSetsToSave && Object.keys(modifierSetsToSave).length > 0 ? modifierSetsToSave : null,
    };

    try {
      await saveItemToFirebase(userId, itemData);
      this.setState({
        isSavingItem: false,
        isCreateItemOpen: false,
        editingItemId: null,
        formModifierSetsMap: {},
        formError: "",
        formName: "",
        formPrice: "",
        formDescription: "",
        formKitchenName: "",
        formCategory: "",
        formCalories: "",
        formAllergens: "",
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

  handleExportLibrary = () => {
    const { items = [] } = this.state;
    if (items.length === 0) {
      alert("Chưa có món nào trong thư viện để xuất file.");
      return;
    }

    const headers = ["Name", "Category", "Price", "SKU", "GTIN", "Calories", "Allergens", "Status", "Description"];
    const escapeCsv = (str) => {
      const s = String(str ?? "").replace(/"/g, '""');
      return `"${s}"`;
    };

    const csvRows = [
      headers.join(","),
      ...items.map((item) =>
        [
          escapeCsv(item.name),
          escapeCsv(item.category),
          escapeCsv(item.price),
          escapeCsv(item.sku),
          escapeCsv(item.gtin),
          escapeCsv(item.calories),
          escapeCsv(item.allergens),
          escapeCsv(item.status),
          escapeCsv(item.description),
        ].join(",")
      ),
    ];

    const blob = new Blob(["\uFEFF" + csvRows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `square_items_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  handleBatchImportItems = async (parsedItems) => {
    const { userId } = this.state;
    if (!userId || !parsedItems?.length) return;

    for (const item of parsedItems) {
      await saveItemToFirebase(userId, item);
    }
    this.setState({ isImportItemModalOpen: false });
  };

  handleCreateTemplateItems = async () => {
    const { userId } = this.state;
    if (!userId) return;

    const templates = [
      { id: `item-tmpl-1`, name: "Cà phê sữa đá Sài Gòn", category: "Cà phê", price: "$2.50", calories: "180", allergens: "Sữa bò", description: "Cà phê Robusta pha phin truyền thống kết hợp sữa đặc Ông Thọ.", status: "Available" },
      { id: `item-tmpl-2`, name: "Bạc xỉu 3 tầng", category: "Cà phê", price: "$2.75", calories: "210", allergens: "Sữa bò", description: "Nhiều sữa ít cà phê, béo ngậy ngọt ngào vị tuổi thơ.", status: "Available" },
      { id: `item-tmpl-3`, name: "Trà đào cam sả trân châu", category: "Trà & Nước hoa quả", price: "$3.50", calories: "140", allergens: "", description: "Trà đen thanh mát kết hợp đào miếng giòn sần sật và hương sả nồng nàn.", status: "Available" },
      { id: `item-tmpl-4`, name: "Matcha Latte đá xay", category: "Đá xay & Sinh tố", price: "$4.00", calories: "290", allergens: "Sữa bò", description: "Matcha Uji Nhật Bản nguyên chất phủ kem tươi whipping cream mịn màng.", status: "Available" },
      { id: `item-tmpl-5`, name: "Bánh Croissant bơ tỏi phô mai", category: "Bánh & Tráng miệng", price: "$3.20", calories: "320", allergens: "Gluten, Sữa bò", description: "Bánh sừng bò nướng nóng giòn tan thơm lừng sốt bơ tỏi.", status: "Available" },
    ];

    for (const item of templates) {
      await saveItemToFirebase(userId, item);
    }
  };

  handleActionItemClick = (actionName) => {
    this.setState({ isActionsOpen: false });
    if (actionName === "Export library") {
      this.handleExportLibrary();
    } else if (actionName === "Import library") {
      this.setState({ isImportItemModalOpen: true });
    } else if (actionName === "Create items from template") {
      if (window.confirm("Thêm 5 món mẫu chuẩn (Cà phê, Trà đào, Matcha Latte, Bánh...) vào thư viện?")) {
        this.handleCreateTemplateItems();
      }
    } else if (actionName === "Collapse all items") {
      this.setState((prev) => ({ areItemsCollapsed: !prev.areItemsCollapsed }));
    }
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
