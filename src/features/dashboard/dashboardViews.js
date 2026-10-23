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
    formImageUrl: item.imageUrl || item.image || item.photo || "",
    formStatus: status,
    formModifierSetsMap: normalizeItemModifierSetsMap(item.modifierSets),
    itemFormInitial: {
      name,
      price: rawPrice,
      category,
      status,
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
  "online-ordering",
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
