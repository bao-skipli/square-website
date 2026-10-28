import { normalizeItemModifierSetsMap } from "@/shared/modifiers";

export const EMPTY_FORMS = {
  modifiers: {
    isCreateModifierOpen: true,
    editingModifierSetId: null,
    editingModifierSet: null,
  },
  categories: {
    isCreateCategoryOpen: true,
    editingCategoryId: null,
    categoryFormName: "",
    categoryFormParentId: null,
    categoryFormItems: [],
    categoryFormPointsOfSale: true,
    categoryFormInitial: { name: "", parentId: null, items: [] },
  },
  "item-library": {
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
    itemFormInitial: {
      name: "",
      price: "",
      category: "",
      status: "Available",
    },
  },
};

export function itemToFormState(item) {
  if (!item) return {};
  const rawPrice = item.price ? item.price.replace("$", "") : "";
  const name = item.name || "";
  const category = item.category || "";
  const status = item.status || "Available";
  return {
    formName: name,
    formPrice: rawPrice,
    formCategory: category,
    formDescription: item.description || "",
    formKitchenName: item.kitchenName || "",
    formMenu: item.menu || "",
    formSku: item.sku || "",
    formGtin: item.gtin || "",
    formCalories: item.calories || "",
    formAllergens: item.allergens || "",
    formImageUrl: item.imageUrl || item.image || item.photo || "",
    formStatus: status,
    formModifierSetsMap: normalizeItemModifierSetsMap(item.modifierSets),
    itemFormInitial: {
      name,
      price: rawPrice,
      category,
      status,
      calories: item.calories || "",
      allergens: item.allergens || "",
    },
  };
}

export function categoryToFormState(cat, items = []) {
  if (!cat) return {};
  const assignedItems = items
    .filter((i) => i.category && i.category.toLowerCase() === (cat.name || "").toLowerCase())
    .map((i) => i.id);
  return {
    categoryFormName: cat.name || "",
    categoryFormParentId: cat.parentId || null,
    categoryFormItems: assignedItems,
    categoryFormPointsOfSale: cat.pointsOfSale !== false,
    categoryFormInitial: {
      name: cat.name || "",
      parentId: cat.parentId || null,
      items: [...assignedItems],
    },
  };
}

export function modifierSetToFormState(set) {
  return {
    editingModifierSet: set || null,
  };
}

export const VIEWS = {
  modifiers: {
    key: "modifiers",
    base: "/dashboard/items/modifiers",
    group: "items",
    loader: "modifiers",
    match: (pathname) =>
      Boolean(
        pathname &&
        (pathname.startsWith("/dashboard/items/modifiers") ||
          pathname.includes("/modifiers"))
      ),
    hasCrud: true,
    createFlag: "isCreateModifierOpen",
    editingIdKey: "editingModifierSetId",
    openEdit: "openEditModifierSet",
    listKey: "modifierSets",
    hasLoadedFlag: "hasLoadedModifiers",
    navigateList: "navigateToModifiers",
    emptyState: EMPTY_FORMS.modifiers,
    toFormState: modifierSetToFormState,
    isItemSubnav: true,
  },
  categories: {
    key: "categories",
    base: "/dashboard/items/categories",
    group: "items",
    loader: "categories",
    match: (pathname) =>
      Boolean(
        pathname &&
        (pathname.startsWith("/dashboard/items/categories") ||
          pathname.includes("/categories"))
      ),
    hasCrud: true,
    createFlag: "isCreateCategoryOpen",
    editingIdKey: "editingCategoryId",
    openEdit: "openEditCategory",
    listKey: "categories",
    hasLoadedFlag: "hasLoadedCategories",
    navigateList: "navigateToCategories",
    emptyState: EMPTY_FORMS.categories,
    toFormState: categoryToFormState,
    isItemSubnav: true,
  },
  "item-library": {
    key: "item-library",
    base: "/dashboard/items/library",
    group: "items",
    loader: "item-library",
    match: (pathname) =>
      Boolean(
        pathname &&
        (pathname.startsWith("/dashboard/items/library") ||
          pathname.includes("/library"))
      ),
    hasCrud: true,
    createFlag: "isCreateItemOpen",
    editingIdKey: "editingItemId",
    openEdit: "openEditItem",
    listKey: "items",
    hasLoadedFlag: "hasLoadedItems",
    navigateList: "navigateToItemLibrary",
    emptyState: EMPTY_FORMS["item-library"],
    toFormState: itemToFormState,
    isItemSubnav: true,
  },
  "online-ordering": {
    key: "online-ordering",
    base: "/dashboard/store-setup/review",
    group: "main",
    loader: "online-ordering",
    match: (pathname) =>
      Boolean(
        pathname &&
        (pathname.includes("/store-setup/review") ||
          pathname.startsWith("/dashboard/store-setup") ||
          pathname.startsWith("/dashboard/online") ||
          pathname.startsWith("/online") ||
          pathname.startsWith("/store-setup"))
      ),
    hasCrud: false,
    isItemSubnav: false,
  },
  orders: {
    key: "orders",
    base: "/dashboard/orders",
    group: "main",
    loader: "orders",
    match: (pathname) =>
      Boolean(
        pathname &&
        (pathname.startsWith("/dashboard/orders") ||
          pathname.includes("/orders"))
      ),
    hasCrud: false,
    isItemSubnav: false,
  },
  "item-options": {
    key: "item-options",
    base: "/dashboard/items/options",
    group: "items",
    loader: "item-options",
    match: (pathname) =>
      Boolean(pathname && (pathname.startsWith("/dashboard/items/options") || pathname.includes("/options"))),
    hasCrud: false,
    isItemSubnav: true,
  },
  units: {
    key: "units",
    base: "/dashboard/items/units",
    group: "items",
    loader: "units",
    match: (pathname) =>
      Boolean(pathname && (pathname.startsWith("/dashboard/items/units") || pathname.includes("/units"))),
    hasCrud: false,
    isItemSubnav: true,
  },
  "custom-attributes": {
    key: "custom-attributes",
    base: "/dashboard/items/custom-attributes",
    group: "items",
    loader: "custom-attributes",
    match: (pathname) =>
      Boolean(pathname && (pathname.startsWith("/dashboard/items/custom-attributes") || pathname.includes("/custom-attributes"))),
    hasCrud: false,
    isItemSubnav: true,
  },
  menus: {
    key: "menus",
    base: "/dashboard/items/menus",
    group: "items",
    loader: "menus",
    match: (pathname) =>
      Boolean(pathname && (pathname.startsWith("/dashboard/items/menus") || pathname.includes("/menus"))),
    hasCrud: false,
    isItemSubnav: true,
  },
  "kitchen-settings": {
    key: "kitchen-settings",
    base: "/dashboard/items/kitchen-settings",
    group: "items",
    loader: "kitchen-settings",
    match: (pathname) =>
      Boolean(pathname && (pathname.startsWith("/dashboard/items/kitchen-settings") || pathname.includes("/kitchen-settings"))),
    hasCrud: false,
    isItemSubnav: true,
  },
  channels: {
    key: "channels",
    base: "/dashboard/channels",
    group: "items",
    loader: "channels",
    match: (pathname) =>
      Boolean(pathname && (pathname.startsWith("/dashboard/channels") || pathname.includes("/channels"))),
    hasCrud: false,
    isItemSubnav: true,
  },
  customers: {
    key: "customers",
    base: "/dashboard/customers",
    group: "main",
    loader: "customers",
    match: (pathname) =>
      Boolean(pathname && (pathname.startsWith("/dashboard/customers") || pathname.includes("/customers"))),
    hasCrud: false,
    isItemSubnav: false,
  },
  reports: {
    key: "reports",
    base: "/dashboard/reports",
    group: "main",
    loader: "reports",
    match: (pathname) =>
      Boolean(pathname && (pathname.startsWith("/dashboard/reports") || pathname.includes("/reports"))),
    hasCrud: false,
    isItemSubnav: false,
  },
  staff: {
    key: "staff",
    base: "/dashboard/staff",
    group: "main",
    loader: "staff",
    match: (pathname) =>
      Boolean(pathname && (pathname.startsWith("/dashboard/staff") || pathname.includes("/staff"))),
    hasCrud: false,
    isItemSubnav: false,
  },
  banking: {
    key: "banking",
    base: "/dashboard/banking",
    group: "main",
    loader: "banking",
    match: (pathname) =>
      Boolean(pathname && (pathname.startsWith("/dashboard/banking") || pathname.includes("/banking"))),
    hasCrud: false,
    isItemSubnav: false,
  },
  settings: {
    key: "settings",
    base: "/dashboard/settings",
    group: "main",
    loader: "settings",
    match: (pathname) =>
      Boolean(pathname && (pathname.startsWith("/dashboard/settings") || pathname.includes("/settings"))),
    hasCrud: false,
    isItemSubnav: false,
  },
  "whats-new": {
    key: "whats-new",
    base: "/dashboard/whats-new",
    group: "main",
    loader: "whats-new",
    match: (pathname) =>
      Boolean(pathname && (pathname.startsWith("/dashboard/whats-new") || pathname.includes("/whats-new"))),
    hasCrud: false,
    isItemSubnav: false,
  },
  "add-more": {
    key: "add-more",
    base: "/dashboard/add-more",
    group: "main",
    loader: "add-more",
    match: (pathname) =>
      Boolean(pathname && (pathname.startsWith("/dashboard/add-more") || pathname.includes("/add-more"))),
    hasCrud: false,
    isItemSubnav: false,
  },
  home: {
    key: "home",
    base: "/dashboard",
    group: "main",
    loader: "home",
    match: (pathname) => pathname === "/dashboard" || pathname === "/dashboard/",
    hasCrud: false,
    isItemSubnav: false,
  },
};

export const VIEW_ORDER = [
  "modifiers",
  "categories",
  "item-library",
  "item-options",
  "units",
  "custom-attributes",
  "menus",
  "kitchen-settings",
  "channels",
  "online-ordering",
  "orders",
  "customers",
  "reports",
  "staff",
  "banking",
  "settings",
  "whats-new",
  "add-more",
  "home",
];

export function getViewFromPath(pathname) {
  if (!pathname) return null;
  for (const key of VIEW_ORDER) {
    if (VIEWS[key].match(pathname)) {
      return key;
    }
  }
  return null;
}

export function parseDashboardRoute(pathname) {
  const view = getViewFromPath(pathname);
  if (!view) {
    return { view: null, mode: "list", id: null };
  }
  const cfg = VIEWS[view];
  if (!cfg.hasCrud) {
    return { view, mode: "list", id: null };
  }
  const rest = pathname.slice(cfg.base.length).replace(/^\//, "").trim();
  if (rest === "") {
    return { view, mode: "list", id: null };
  }
  if (rest === "new") {
    return { view, mode: "new", id: null };
  }
  return { view, mode: "edit", id: rest };
}
