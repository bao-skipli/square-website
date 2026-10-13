import React, { Component } from "react";
import { subscribeAuth } from "@/firebase/authService";
import {
  subscribeHomeData,
  subscribeItems,
  subscribeCategories,
} from "@/firebase/itemService";
import { withMinDelay, MIN_LOADING_MS } from "@/util/loadingHelper";
import {
  INITIAL_CATEGORIES,
  INITIAL_LIBRARY_ITEMS,
  MENU_LABELS,
} from "./dashboardConstants";
import { getInitialDashboardRouteState } from "./dashboardRouteHelper";

export class DashboardBase extends Component {
  constructor(props) {
    super(props);
    const initialRoute = getInitialDashboardRouteState(props.router?.location?.pathname);

    this.state = {
      businessName: "Skipli",
      currentView: initialRoute.currentView,
      activeMenu: initialRoute.activeMenu,
      isItemsMenusOpen: initialRoute.isItemsMenusOpen,
      isItemsOpen: initialRoute.isItemsOpen,
      searchQuery: "",
      aiQuery: "",
      dismissedPosCard: false,
      selectedDateChip: "Oct 9",
      selectedVsChip: "Prior day",
      selectedChecksChip: "Closed",

      items: [...INITIAL_LIBRARY_ITEMS],
      librarySearchQuery: "",
      isCreateItemOpen: initialRoute.isCreateItemOpen,
      isHeaderScrolled: false,
      formError: "",

      isFilterDrawerOpen: false,
      filterDrawerView: "all",
      drawerCategorySearch: "",
      appliedCategories: [],
      draftCategories: [],
      appliedStatuses: [],
      draftStatuses: [],

      isActionsOpen: false,

      formName: initialRoute.formName,
      formItemType: "Prepared food and beverage",
      formKitchenName: initialRoute.formKitchenName,
      formPrice: initialRoute.formPrice,
      formPriceUnit: "ea",
      formDescription: initialRoute.formDescription,
      formCategory: initialRoute.formCategory,
      formMenu: initialRoute.formMenu,
      formSku: initialRoute.formSku,
      formGtin: initialRoute.formGtin,
      formStatus: initialRoute.formStatus,
      formShippingWeight: "0.00",
      formCannotBePurchasedAlone: false,
      formSkipCustomization: true,
      formContainsAlcohol: false,
      formPointsOfSale: true,

      nutritionalInfoOpen: false,
      manageCheckoutOpen: true,
      fulfillOrdersOpen: true,
      checkoutBannerVisible: true,
      statusDropdownOpen: false,

      categories: [...INITIAL_CATEGORIES],
      categoriesSearchQuery: "",
      categoryViewMode: "tree",
      expandedCategoryIds: ["cat-food"],
      selectedCategoryIds: [],

      isCreateCategoryOpen: initialRoute.isCreateCategoryOpen,
      editingCategoryId: initialRoute.editingCategoryId,
      categoryFormName: initialRoute.categoryFormName,
      categoryFormParentId: initialRoute.categoryFormParentId,
      categoryFormItems: initialRoute.categoryFormItems,
      categoryFormPointsOfSale: initialRoute.categoryFormPointsOfSale,
      categoryFormInitial: initialRoute.categoryFormInitial,
      isCategoryActionsOpen: false,

      isParentCategoryModalOpen: false,
      parentCategorySearch: "",
      draftSelectedParentId: null,

      isAddItemsModalOpen: false,
      addItemsSearch: "",
      draftSelectedItems: [],

      editingItemId: initialRoute.editingItemId,
      itemFormInitial: initialRoute.itemFormInitial,
      isItemActionsOpen: false,

      isUnsavedChangesModalOpen: false,
      unsavedChangesTarget: "item",

      userId: null,
      isHomeLoading: initialRoute.isHomeLoading,
      isContentLoading: initialRoute.isContentLoading,
      hasLoadedModifiers: false,
      isSavingItem: false,
      isSavingCategory: false,
      categoryFormError: "",
    };

    this._isMounted = false;
    this.activeLoadingId = 0;
    this.hasLoadedHome = false;
    this.hasLoadedItems = false;
    this.hasLoadedCategories = false;

    this.homeFirstPromise = new Promise((resolve) => {
      this.resolveHomeFirst = resolve;
    });
    this.itemsFirstPromise = new Promise((resolve) => {
      this.resolveItemsFirst = resolve;
    });
    this.categoriesFirstPromise = new Promise((resolve) => {
      this.resolveCategoriesFirst = resolve;
    });
    this.modifiersFirstPromise = new Promise((resolve) => {
      this.resolveModifiersFirst = resolve;
    });
    this.hasLoadedModifiers = false;

    this.unsubscribeAuth = null;
    this.unsubscribeHome = null;
    this.unsubscribeItems = null;
    this.unsubscribeCategories = null;
    this.actionsRef = null;
    this.itemActionsRef = null;
    this.catActionsRef = null;
  }

  componentDidMount() {
    this._isMounted = true;
    const initialPath = this.props.router?.location?.pathname || "/dashboard";
    let initialView = "home";
    if (initialPath.includes("/modifiers")) {
      initialView = "modifiers";
    } else if (initialPath.includes("/categories")) {
      initialView = "categories";
    } else if (initialPath.includes("/library")) {
      initialView = "item-library";
    }

    this.startViewLoading(initialView);
    this.syncRouteWithState();
    document.addEventListener("mousedown", this.handleClickOutside);

    this.unsubscribeAuth = subscribeAuth(async (user) => {
      if (!user) {
        if (this._isMounted && this.props.router?.navigate) {
          this.props.router.navigate("/signin");
        }
        return;
      }
      const uid = user.uid;
      this.setState({ userId: uid });
      this.setupRealtimeSubscriptions(uid);
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.activeLoadingId++;
    if (this.unsubscribeAuth) this.unsubscribeAuth();
    if (this.unsubscribeHome) this.unsubscribeHome();
    if (this.unsubscribeItems) this.unsubscribeItems();
    if (this.unsubscribeCategories) this.unsubscribeCategories();
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.router &&
      prevProps.router &&
      this.props.router.location.pathname !== prevProps.router.location.pathname
    ) {
      const prevPath = prevProps.router.location.pathname;
      const newPath = this.props.router.location.pathname;
      const getBaseView = (path) => {
        if (path.includes("/modifiers")) return "modifiers";
        if (path.includes("/categories")) return "categories";
        if (path.includes("/library")) return "item-library";
        if (path === "/dashboard" || path === "/dashboard/") return "home";
        return null;
      };
      const prevView = getBaseView(prevPath);
      const newView = getBaseView(newPath);
      if (newView && newView !== prevView && newView !== this.state.currentView) {
        this.startViewLoading(newView);
      }
      this.syncRouteWithState();
    }
  }

  setupRealtimeSubscriptions(userId) {
    if (this.unsubscribeHome) this.unsubscribeHome();
    if (this.unsubscribeItems) this.unsubscribeItems();
    if (this.unsubscribeCategories) this.unsubscribeCategories();

    const homeSub = subscribeHomeData(
      userId,
      (businessInfo) => {
        if (businessInfo?.businessMatch?.businessName) {
          this.setState({ businessName: businessInfo.businessMatch.businessName });
        }
      },
      (data) => {
        this.resolveHomeFirst(data);
      }
    );
    this.unsubscribeHome = homeSub.unsubscribe;

    const itemsSub = subscribeItems(
      userId,
      (items) => {
        this.setState({ items });
        const currentPath = this.props.router?.location?.pathname || "";
        if (currentPath.startsWith("/dashboard/items/library/")) {
          const itemId = currentPath.replace("/dashboard/items/library/", "");
          const targetItem = items.find((i) => i.id === itemId);
          if (targetItem) {
            this.openEditItem(targetItem, false);
          } else if (this.hasLoadedItems) {
            this.navigateToItemLibrary();
          }
        }
      },
      (items) => {
        this.hasLoadedItems = true;
        this.resolveItemsFirst(items);
        const currentPath = this.props.router?.location?.pathname || "";
        if (currentPath.startsWith("/dashboard/items/library/")) {
          const itemId = currentPath.replace("/dashboard/items/library/", "");
          const targetItem = items.find((i) => i.id === itemId);
          if (targetItem) {
            this.openEditItem(targetItem, false);
          } else {
            this.navigateToItemLibrary();
          }
        }
      }
    );
    this.unsubscribeItems = itemsSub.unsubscribe;

    const catSub = subscribeCategories(
      userId,
      (categories) => {
        this.setState({ categories });
        const currentPath = this.props.router?.location?.pathname || "";
        if (currentPath.startsWith("/dashboard/items/categories/")) {
          const catId = currentPath.replace("/dashboard/items/categories/", "");
          const targetCat = categories.find((c) => c.id === catId);
          if (targetCat) {
            this.openEditCategory(targetCat, false);
          } else if (this.hasLoadedCategories) {
            this.navigateToCategories();
          }
        }
      },
      (categories) => {
        this.hasLoadedCategories = true;
        this.resolveCategoriesFirst(categories);
        const currentPath = this.props.router?.location?.pathname || "";
        if (currentPath.startsWith("/dashboard/items/categories/")) {
          const catId = currentPath.replace("/dashboard/items/categories/", "");
          const targetCat = categories.find((c) => c.id === catId);
          if (targetCat) {
            this.openEditCategory(targetCat, false);
          } else {
            this.navigateToCategories();
          }
        }
      }
    );
    this.unsubscribeCategories = catSub.unsubscribe;
  }

  startViewLoading = async (targetView) => {
    const loadingId = ++this.activeLoadingId;

    if (targetView === "home") {
      this.setState({ isHomeLoading: true, isContentLoading: false });
      try {
        if (!this.hasLoadedHome) {
          await withMinDelay(this.homeFirstPromise, MIN_LOADING_MS);
          this.hasLoadedHome = true;
        } else {
          await withMinDelay(Promise.resolve(), MIN_LOADING_MS);
        }
      } catch (err) {
        console.warn("Home initial load error:", err);
      }
      if (this._isMounted && this.activeLoadingId === loadingId) {
        this.setState({ isHomeLoading: false });
      }
    } else if (targetView === "item-library") {
      this.setState({ isContentLoading: true, isHomeLoading: false });
      try {
        if (!this.hasLoadedItems) {
          await withMinDelay(this.itemsFirstPromise, MIN_LOADING_MS);
          this.hasLoadedItems = true;
        } else {
          await withMinDelay(Promise.resolve(), MIN_LOADING_MS);
        }
      } catch (err) {
        console.warn("Items initial load error:", err);
      }
      if (this._isMounted && this.activeLoadingId === loadingId) {
        this.setState({ isContentLoading: false });
      }
    } else if (targetView === "categories") {
      this.setState({ isContentLoading: true, isHomeLoading: false });
      try {
        if (!this.hasLoadedCategories) {
          await withMinDelay(this.categoriesFirstPromise, MIN_LOADING_MS);
          this.hasLoadedCategories = true;
        } else {
          await withMinDelay(Promise.resolve(), MIN_LOADING_MS);
        }
      } catch (err) {
        console.warn("Categories initial load error:", err);
      }
      if (this._isMounted && this.activeLoadingId === loadingId) {
        this.setState({ isContentLoading: false });
      }
    } else if (targetView === "modifiers") {
      this.setState({ isContentLoading: true, isHomeLoading: false });
      try {
        if (!this.hasLoadedModifiers) {
          const sets = await withMinDelay(this.modifiersFirstPromise, MIN_LOADING_MS);
          this.hasLoadedModifiers = true;
          if (this._isMounted && Array.isArray(sets)) {
            this.setState({ modifierSets: sets, hasLoadedModifiers: true });
            const currentPath = this.props.router?.location?.pathname || "";
            if (currentPath.startsWith("/dashboard/items/modifiers/")) {
              const setId = currentPath.replace("/dashboard/items/modifiers/", "");
              const targetSet = sets.find((s) => s.id === setId);
              if (targetSet && this.openEditModifierSet) {
                this.openEditModifierSet(targetSet, false);
              }
            }
          }
        } else {
          await withMinDelay(Promise.resolve(), MIN_LOADING_MS);
        }
      } catch (err) {
        console.warn("Modifiers initial load error:", err);
      }
      if (this._isMounted && this.activeLoadingId === loadingId) {
        this.setState({ isContentLoading: false, hasLoadedModifiers: true });
      }
    } else {
      this.setState({ isContentLoading: true, isHomeLoading: false });
      try {
        await withMinDelay(Promise.resolve(), MIN_LOADING_MS);
      } catch (err) {
        console.warn("View load error:", err);
      }
      if (this._isMounted && this.activeLoadingId === loadingId) {
        this.setState({ isContentLoading: false });
      }
    }
  };

  getMenuLabel = (key) => {
    return MENU_LABELS[key] || "Dashboard";
  };

  syncRouteWithState = () => {
    if (!this.props.router?.location) return;
    const { pathname } = this.props.router.location;

    if (pathname === "/dashboard/items/modifiers/new") {
      this.setState({
        currentView: "modifiers",
        activeMenu: "modifiers",
        isItemsMenusOpen: true,
        isItemsOpen: true,
        isCreateModifierOpen: true,
        editingModifierSetId: null,
        editingModifierSet: null,
      });
    } else if (pathname.startsWith("/dashboard/items/modifiers/")) {
      const setId = pathname.replace("/dashboard/items/modifiers/", "");
      const set = this.state.modifierSets?.find((s) => s.id === setId);
      if (set && this.openEditModifierSet) {
        this.openEditModifierSet(set, false);
      } else if (this.hasLoadedModifiers && this.navigateToModifiers) {
        this.navigateToModifiers();
      } else {
        this.setState({
          currentView: "modifiers",
          activeMenu: "modifiers",
          isItemsMenusOpen: true,
          isItemsOpen: true,
          isCreateModifierOpen: true,
          editingModifierSetId: setId,
        });
      }
    } else if (pathname === "/dashboard/items/modifiers") {
      this.setState({
        currentView: "modifiers",
        activeMenu: "modifiers",
        isItemsMenusOpen: true,
        isItemsOpen: true,
        isCreateModifierOpen: false,
      });
    } else if (pathname === "/dashboard/items/categories/new") {
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
      });
    } else if (pathname.startsWith("/dashboard/items/categories/")) {
      const catId = pathname.replace("/dashboard/items/categories/", "");
      const cat = this.state.categories.find((c) => c.id === catId);
      if (cat) {
        this.openEditCategory(cat, false);
      } else if (this.hasLoadedCategories && this.navigateToCategories) {
        this.navigateToCategories();
      } else {
        this.setState({
          currentView: "categories",
          activeMenu: "categories",
          isItemsMenusOpen: true,
          isItemsOpen: true,
          isCreateCategoryOpen: true,
          editingCategoryId: catId,
        });
      }
    } else if (pathname === "/dashboard/items/categories") {
      this.setState({
        currentView: "categories",
        activeMenu: "categories",
        isItemsMenusOpen: true,
        isItemsOpen: true,
        isCreateCategoryOpen: false,
      });
    } else if (pathname === "/dashboard/items/library/new") {
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
        formStatus: "Available",
        itemFormInitial: { name: "", price: "", category: "", status: "Available" },
      });
    } else if (pathname.startsWith("/dashboard/items/library/")) {
      const itemId = pathname.replace("/dashboard/items/library/", "");
      const item = this.state.items.find((i) => i.id === itemId);
      if (item) {
        this.openEditItem(item, false);
      } else if (this.hasLoadedItems && this.navigateToItemLibrary) {
        this.navigateToItemLibrary();
      } else {
        this.setState({
          currentView: "item-library",
          activeMenu: "item-library",
          isItemsMenusOpen: true,
          isItemsOpen: true,
          isCreateItemOpen: true,
          editingItemId: itemId,
        });
      }
    } else if (
      pathname === "/dashboard/items/library" ||
      pathname.startsWith("/dashboard/items/library")
    ) {
      this.setState({
        currentView: "item-library",
        activeMenu: "item-library",
        isItemsMenusOpen: true,
        isItemsOpen: true,
        isCreateItemOpen: false,
      });
    } else if (pathname === "/dashboard") {
      this.setState({
        currentView: "home",
        activeMenu: "home",
        isCreateItemOpen: false,
        isCreateCategoryOpen: false,
      });
    }
  };

  navigateToHome = () => {
    if (this.state.currentView !== "home") {
      this.startViewLoading("home");
    }
    if (this.props.router?.navigate) {
      this.props.router.navigate("/dashboard");
    } else {
      this.setState({ currentView: "home", activeMenu: "home" });
    }
  };

  navigateToItemLibrary = () => {
    if (this.state.currentView !== "item-library") {
      this.startViewLoading("item-library");
    }
    if (this.props.router?.navigate) {
      this.props.router.navigate("/dashboard/items/library");
    } else {
      this.setState({
        currentView: "item-library",
        activeMenu: "item-library",
        isItemsMenusOpen: true,
        isItemsOpen: true,
        isCreateItemOpen: false,
      });
    }
  };

  navigateToCreateItem = () => {
    if (this.props.router?.navigate) {
      this.props.router.navigate("/dashboard/items/library/new");
    } else {
      this.openCreateItem(false);
    }
  };

  navigateToCategories = () => {
    if (this.state.currentView !== "categories") {
      this.startViewLoading("categories");
    }
    if (this.props.router?.navigate) {
      this.props.router.navigate("/dashboard/items/categories");
    } else {
      this.setState({
        currentView: "categories",
        activeMenu: "categories",
        isItemsMenusOpen: true,
        isItemsOpen: true,
        isCreateCategoryOpen: false,
      });
    }
  };

  navigateToCreateCategory = () => {
    if (this.props.router?.navigate) {
      this.props.router.navigate("/dashboard/items/categories/new");
    } else {
      this.openCreateCategory(false);
    }
  };

  toggleItemsMenus = () => {
    this.setState((prev) => ({ isItemsMenusOpen: !prev.isItemsMenusOpen }));
  };

  toggleItems = (e) => {
    if (e) e.stopPropagation();
    this.setState((prev) => ({ isItemsOpen: !prev.isItemsOpen }));
  };

  handleMenuClick = (menuKey) => {
    if (menuKey === "home") {
      this.navigateToHome();
    } else if (menuKey === "item-library") {
      this.navigateToItemLibrary();
    } else if (menuKey === "categories") {
      this.navigateToCategories();
    } else if (menuKey === "modifiers") {
      if (this.navigateToModifiers) {
        this.navigateToModifiers();
      } else {
        this.setState({ activeMenu: "modifiers", currentView: "modifiers" });
      }
    } else {
      if (this.state.currentView !== menuKey) {
        this.startViewLoading(menuKey);
      }
      this.setState({ activeMenu: menuKey, currentView: menuKey });
    }
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
}
