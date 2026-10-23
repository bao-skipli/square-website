import {
  VIEWS,
  parseDashboardRoute,
} from "./dashboardViews";
import {
  INITIAL_CATEGORIES,
  INITIAL_LIBRARY_ITEMS,
} from "./dashboardConstants";
import { getLocalModifierSets } from "@/firebase/modifiersService";

export const DEFAULT_ROUTE_STATE = {
  currentView: "home",
  activeMenu: "home",
  isItemsMenusOpen: false,
  isItemsOpen: false,
  isHomeLoading: false,
  isContentLoading: false,

  isCreateItemOpen: false,
  editingItemId: null,
  itemFormInitial: null,
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

  isCreateCategoryOpen: false,
  editingCategoryId: null,
  categoryFormName: "",
  categoryFormParentId: null,
  categoryFormItems: [],
  categoryFormPointsOfSale: true,
  categoryFormInitial: null,

  isCreateModifierOpen: false,
  editingModifierSetId: null,
  editingModifierSet: null,
};

export const VIEW_FORM_CONFIG = {
  modifiers: {
    createFlag: "isCreateModifierOpen",
    editingIdKey: "editingModifierSetId",
    getCached: (id) => getLocalModifierSets().find((s) => s.id === id),
    toFormState: VIEWS.modifiers.toFormState,
    emptyState: VIEWS.modifiers.emptyState,
  },
  categories: {
    createFlag: "isCreateCategoryOpen",
    editingIdKey: "editingCategoryId",
    getCached: (id) => INITIAL_CATEGORIES.find((c) => c.id === id),
    toFormState: VIEWS.categories.toFormState,
    emptyState: VIEWS.categories.emptyState,
  },
  "item-library": {
    createFlag: "isCreateItemOpen",
    editingIdKey: "editingItemId",
    getCached: (id) => INITIAL_LIBRARY_ITEMS.find((i) => i.id === id),
    toFormState: VIEWS["item-library"].toFormState,
    emptyState: VIEWS["item-library"].emptyState,
  },
};

export function getInitialDashboardRouteState(pathname) {
  const path =
    pathname ||
    (typeof window !== "undefined" ? window.location.pathname : "/dashboard");
  const { view, mode, id } = parseDashboardRoute(path);
  const state = { ...DEFAULT_ROUTE_STATE };

  if (!view) {
    const sub = path.replace(/^\/dashboard\/?/, "").split("/")[0] || "home";
    state.currentView = sub;
    state.activeMenu = sub;
    state.isContentLoading = true;
    return state;
  }

  state.currentView = view;
  state.activeMenu = view;

  if (view === "home") {
    state.isHomeLoading = true;
  }

  if (VIEWS[view]?.group === "items") {
    state.isItemsMenusOpen = true;
    state.isItemsOpen = true;
  }

  const cfg = VIEW_FORM_CONFIG[view];
  if (cfg) {
    if (mode === "new") {
      Object.assign(state, { [cfg.createFlag]: true, ...cfg.emptyState });
    } else if (mode === "edit" && id) {
      Object.assign(state, { [cfg.createFlag]: true, [cfg.editingIdKey]: id });
      const found = cfg.getCached(id);
      if (found) {
        Object.assign(state, cfg.toFormState(found));
      }
    }
  }

  return state;
}
