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

export class DashboardBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      businessName: "Skipli",
      currentView: "home",
      activeMenu: "home",
      isItemsMenusOpen: false,
      isItemsOpen: false,
      searchQuery: "",
      aiQuery: "",
      dismissedPosCard: false,
      selectedDateChip: "Oct 9",
      selectedVsChip: "Prior day",
      selectedChecksChip: "Closed",

      items: [...INITIAL_LIBRARY_ITEMS],
      librarySearchQuery: "",
      isCreateItemOpen: false,
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

      formName: "",
      formItemType: "Prepared food and beverage",
      formKitchenName: "",
      formPrice: "",
      formPriceUnit: "ea",
      formDescription: "",
      formCategory: "",
      formMenu: "",
      formSku: "",
      formGtin: "",
      formStatus: "Available",
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

      isCreateCategoryOpen: false,
      editingCategoryId: null,
      categoryFormName: "",
      categoryFormParentId: null,
      categoryFormItems: [],
      categoryFormPointsOfSale: true,
      categoryFormInitial: null,
      isCategoryActionsOpen: false,

      isParentCategoryModalOpen: false,
      parentCategorySearch: "",
      draftSelectedParentId: null,

      isAddItemsModalOpen: false,
      addItemsSearch: "",
      draftSelectedItems: [],

      editingItemId: null,
      itemFormInitial: null,
      isItemActionsOpen: false,

      isUnsavedChangesModalOpen: false,
      unsavedChangesTarget: "item",

      userId: null,
      isHomeLoading: true,
      isContentLoading: false,
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
    if (initialPath.includes("/categories")) {
      initialView = "categories";
    } else if (initialPath.includes("/library")) {
      initialView = "item-library";
    }

    this.startViewLoading(initialView);
    this.syncRouteWithState();
    document.addEventListener("mousedown", this.handleClickOutside);

    this.unsubscribeAuth = subscribeAuth(async (user) => {
      const uid = user ? user.uid : null;
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

  setupRealtimeSubscriptions = (userId) => {
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
      },
      (items) => {
        this.resolveItemsFirst(items);
      }
    );
    this.unsubscribeItems = itemsSub.unsubscribe;

    const catSub = subscribeCategories(
      userId,
      (categories) => {
        this.setState({ categories });
      },
      (categories) => {
        this.resolveCategoriesFirst(categories);
      }
    );
    this.unsubscribeCategories = catSub.unsubscribe;
  };

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

    if (pathname === "/dashboard/items/categories/new") {
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
      } else {
        this.navigateToCategories();
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
      } else {
        this.navigateToItemLibrary();
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
