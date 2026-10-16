import { Component } from "react";
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
import {
  VIEWS,
  getViewFromPath,
  EMPTY_FORMS,
  parseDashboardRoute,
} from "./dashboardViews";

const LOADERS = {
  home: {
    promiseKey: "homeFirstPromise",
    flagKey: "hasLoadedHome",
    isHome: true,
  },
  "item-library": {
    promiseKey: "itemsFirstPromise",
    flagKey: "hasLoadedItems",
    isHome: false,
  },
  categories: {
    promiseKey: "categoriesFirstPromise",
    flagKey: "hasLoadedCategories",
    isHome: false,
  },
  modifiers: {
    promiseKey: "modifiersFirstPromise",
    flagKey: "hasLoadedModifiers",
    isHome: false,
  },
};

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
    this.hasLoadedModifiers = false;

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
    const initialView = getViewFromPath(initialPath) || "home";

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
      const prevView = getViewFromPath(prevPath);
      const newView = getViewFromPath(newPath);
      if (newView && newView !== prevView && newView !== this.state.currentView) {
        this.startViewLoading(newView);
      }
      this.syncRouteWithState();
    }
  }

  createCatalogSubscriptionCallbacks = ({
    listKey,
    pathPrefix,
    openEditMethod,
    navigateMethod,
    resolveFirstMethod,
    loadedFlagKey,
  }) => {
    const handleEntityMatch = (list, isFirstLoad) => {
      const currentPath = this.props.router?.location?.pathname || "";
      if (currentPath.startsWith(pathPrefix)) {
        const id = currentPath.replace(pathPrefix, "");
        const target = list.find((item) => item.id === id);
        if (target && this[openEditMethod]) {
          this[openEditMethod](target, false);
        } else if (isFirstLoad || this[loadedFlagKey]) {
          if (this[navigateMethod]) {
            this[navigateMethod]();
          }
        }
      }
    };

    return {
      onChange: (data) => {
        this.setState({ [listKey]: data });
        handleEntityMatch(data, false);
      },
      onFirstLoad: (data) => {
        this[loadedFlagKey] = true;
        if (this[resolveFirstMethod]) {
          this[resolveFirstMethod](data);
        }
        handleEntityMatch(data, true);
      },
    };
  };

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

    const itemCallbacks = this.createCatalogSubscriptionCallbacks({
      listKey: "items",
      pathPrefix: "/dashboard/items/library/",
      openEditMethod: "openEditItem",
      navigateMethod: "navigateToItemLibrary",
      resolveFirstMethod: "resolveItemsFirst",
      loadedFlagKey: "hasLoadedItems",
    });
    const itemsSub = subscribeItems(
      userId,
      itemCallbacks.onChange,
      itemCallbacks.onFirstLoad
    );
    this.unsubscribeItems = itemsSub.unsubscribe;

    const catCallbacks = this.createCatalogSubscriptionCallbacks({
      listKey: "categories",
      pathPrefix: "/dashboard/items/categories/",
      openEditMethod: "openEditCategory",
      navigateMethod: "navigateToCategories",
      resolveFirstMethod: "resolveCategoriesFirst",
      loadedFlagKey: "hasLoadedCategories",
    });
    const catSub = subscribeCategories(
      userId,
      catCallbacks.onChange,
      catCallbacks.onFirstLoad
    );
    this.unsubscribeCategories = catSub.unsubscribe;
  }

  startViewLoading = async (targetView) => {
    const loadingId = ++this.activeLoadingId;
    const loaderConfig = LOADERS[targetView];
    const isHome = loaderConfig?.isHome ?? (targetView === "home");

    if (isHome) {
      this.setState({ isHomeLoading: true, isContentLoading: false });
    } else {
      this.setState({ isContentLoading: true, isHomeLoading: false });
    }

    try {
      if (loaderConfig && !this[loaderConfig.flagKey]) {
        const result = await withMinDelay(this[loaderConfig.promiseKey], MIN_LOADING_MS);
        this[loaderConfig.flagKey] = true;
        if (targetView === "modifiers") {
          if (this._isMounted && Array.isArray(result)) {
            this.setState({ modifierSets: result, hasLoadedModifiers: true });
            const currentPath = this.props.router?.location?.pathname || "";
            if (currentPath.startsWith("/dashboard/items/modifiers/")) {
              const setId = currentPath.replace("/dashboard/items/modifiers/", "");
              const targetSet = result.find((s) => s.id === setId);
              if (targetSet && this.openEditModifierSet) {
                this.openEditModifierSet(targetSet, false);
              }
            }
          }
        }
      } else {
        await withMinDelay(Promise.resolve(), MIN_LOADING_MS);
      }
    } catch (err) {
      console.warn(`${targetView} initial load error:`, err);
    }

    if (this._isMounted && this.activeLoadingId === loadingId) {
      if (isHome) {
        this.setState({ isHomeLoading: false });
      } else if (targetView === "modifiers") {
        this.setState({ isContentLoading: false, hasLoadedModifiers: true });
      } else {
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
    const { view, mode, id } = parseDashboardRoute(pathname);
    if (!view) return;

    const cfg = VIEWS[view];
    if (cfg.hasCrud) {
      if (mode === "new") {
        this.setState({
          currentView: view,
          activeMenu: view,
          isItemsMenusOpen: true,
          isItemsOpen: true,
          ...EMPTY_FORMS[view],
        });
      } else if (mode === "edit" && id) {
        const list = this.state[cfg.listKey] || [];
        const entity = list.find((item) => item.id === id);
        if (entity && this[cfg.openEdit]) {
          this[cfg.openEdit](entity, false);
        } else if (this[cfg.hasLoadedFlag] && this[cfg.navigateList]) {
          this[cfg.navigateList]();
        } else {
          this.setState({
            currentView: view,
            activeMenu: view,
            isItemsMenusOpen: true,
            isItemsOpen: true,
            [cfg.createFlag]: true,
            [cfg.editingIdKey]: id,
          });
        }
      } else {
        this.setState({
          currentView: view,
          activeMenu: view,
          isItemsMenusOpen: true,
          isItemsOpen: true,
          [cfg.createFlag]: false,
        });
      }
    } else if (view === "online-ordering") {
      this.setState({
        currentView: "online-ordering",
        activeMenu: "online-ordering",
        isItemsMenusOpen: false,
        isCreateItemOpen: false,
        isCreateCategoryOpen: false,
        isCreateModifierOpen: false,
      });
    } else if (view === "home") {
      this.setState({
        currentView: "home",
        activeMenu: "home",
        isCreateItemOpen: false,
        isCreateCategoryOpen: false,
      });
    }
  };

  navigateTo = (viewKey, sub = "") => {
    const cfg = VIEWS[viewKey];
    if (!cfg) return;
    if (this.state.currentView !== viewKey) {
      this.startViewLoading(viewKey);
    }
    const path = sub ? `${cfg.base}/${sub}` : cfg.base;
    if (this.props.router?.navigate) {
      this.props.router.navigate(path);
    } else {
      if (viewKey === "home") {
        this.setState({ currentView: "home", activeMenu: "home" });
      } else if (viewKey === "online-ordering") {
        this.setState({
          currentView: "online-ordering",
          activeMenu: "online-ordering",
          isItemsMenusOpen: false,
          isCreateItemOpen: false,
          isCreateCategoryOpen: false,
          isCreateModifierOpen: false,
        });
      } else if (cfg.isItemSubnav) {
        this.setState({
          currentView: viewKey,
          activeMenu: viewKey,
          isItemsMenusOpen: true,
          isItemsOpen: true,
          [cfg.createFlag]: false,
        });
      } else {
        this.setState({ currentView: viewKey, activeMenu: viewKey });
      }
    }
  };

  navigateToHome = () => {
    this.navigateTo("home");
  };

  navigateToItemLibrary = () => {
    this.navigateTo("item-library");
  };

  navigateToCreateItem = () => {
    if (this.props.router?.navigate) {
      this.props.router.navigate("/dashboard/items/library/new");
    } else {
      this.openCreateItem(false);
    }
  };

  navigateToCategories = () => {
    this.navigateTo("categories");
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

  navigateToOnlineOrdering = () => {
    this.navigateTo("online-ordering");
    this.setState({
      currentView: "online-ordering",
      activeMenu: "online-ordering",
      isItemsMenusOpen: false,
      isCreateItemOpen: false,
      isCreateCategoryOpen: false,
      isCreateModifierOpen: false,
    });
  };

  handleMenuClick = (menuKey) => {
    if (menuKey === "home") {
      this.navigateToHome();
    } else if (menuKey === "item-library") {
      this.navigateToItemLibrary();
    } else if (menuKey === "categories") {
      this.navigateToCategories();
    } else if (menuKey === "online-ordering") {
      this.navigateToOnlineOrdering();
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
