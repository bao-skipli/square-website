import test from "node:test";
import assert from "node:assert/strict";
import { getInitialDashboardRouteState } from "../dashboardRouteHelper.js";
import { getViewFromPath } from "../dashboardViews.js";
import {
  INITIAL_CATEGORIES,
  INITIAL_LIBRARY_ITEMS,
} from "../dashboardConstants.js";
import { getLocalModifierSets } from "@/firebase/modifiersService";

globalThis.localStorage = {
  getItem: (key) => {
    if (key === "sq_dashboard_modifier_sets") {
      return JSON.stringify([{ id: "mod-1", name: "Spice Level" }]);
    }
    return null;
  },
  setItem: () => {},
};

function legacyGetInitialDashboardRouteState(pathname) {
  const path =
    pathname ||
    (typeof window !== "undefined" ? window.location.pathname : "/dashboard");

  const viewKey = getViewFromPath(path);

  let currentView;
  let activeMenu;
  let isItemsMenusOpen = false;
  let isItemsOpen = false;
  let isHomeLoading = false;
  let isContentLoading = false;

  let isCreateItemOpen = false;
  let editingItemId = null;
  let itemFormInitial = null;
  let formName = "";
  let formPrice = "";
  let formCategory = "";
  let formDescription = "";
  let formKitchenName = "";
  let formMenu = "";
  let formSku = "";
  let formGtin = "";
  let formStatus = "Available";
  let formImageUrl = "";

  let isCreateCategoryOpen = false;
  let editingCategoryId = null;
  let categoryFormName = "";
  let categoryFormParentId = null;
  let categoryFormItems = [];
  let categoryFormPointsOfSale = true;
  let categoryFormInitial = null;

  let isCreateModifierOpen = false;
  let editingModifierSetId = null;
  let editingModifierSet = null;

  if (viewKey === "modifiers") {
    currentView = "modifiers";
    activeMenu = "modifiers";
    isItemsMenusOpen = true;
    isItemsOpen = true;

    if (path === "/dashboard/items/modifiers/new") {
      isCreateModifierOpen = true;
      editingModifierSetId = null;
      editingModifierSet = null;
    } else if (path.startsWith("/dashboard/items/modifiers/")) {
      const setId = path.replace("/dashboard/items/modifiers/", "").trim();
      if (setId) {
        isCreateModifierOpen = true;
        editingModifierSetId = setId;
        const cachedSets = getLocalModifierSets();
        const found = cachedSets.find((s) => s.id === setId);
        if (found) {
          editingModifierSet = found;
        }
      }
    }
  } else if (viewKey === "categories") {
    currentView = "categories";
    activeMenu = "categories";
    isItemsMenusOpen = true;
    isItemsOpen = true;

    if (path === "/dashboard/items/categories/new") {
      isCreateCategoryOpen = true;
      editingCategoryId = null;
      categoryFormInitial = { name: "", parentId: null, items: [] };
    } else if (path.startsWith("/dashboard/items/categories/")) {
      const catId = path.replace("/dashboard/items/categories/", "").trim();
      if (catId) {
        isCreateCategoryOpen = true;
        editingCategoryId = catId;
        const found = INITIAL_CATEGORIES.find((c) => c.id === catId);
        if (found) {
          categoryFormName = found.name;
          categoryFormParentId = found.parentId || null;
          categoryFormPointsOfSale = found.pointsOfSale !== false;
          categoryFormInitial = {
            name: found.name,
            parentId: found.parentId || null,
            items: [],
          };
        }
      }
    }
  } else if (viewKey === "item-library") {
    currentView = "item-library";
    activeMenu = "item-library";
    isItemsMenusOpen = true;
    isItemsOpen = true;

    if (path === "/dashboard/items/library/new") {
      isCreateItemOpen = true;
      editingItemId = null;
      itemFormInitial = {
        name: "",
        price: "",
        category: "",
        status: "Available",
      };
    } else if (path.startsWith("/dashboard/items/library/")) {
      const itemId = path.replace("/dashboard/items/library/", "").trim();
      if (itemId) {
        isCreateItemOpen = true;
        editingItemId = itemId;
        const found = INITIAL_LIBRARY_ITEMS.find((i) => i.id === itemId);
        if (found) {
          formName = found.name || "";
          formPrice = found.price ? found.price.replace("$", "") : "";
          formCategory = found.category || "";
          formDescription = found.description || "";
          formKitchenName = found.kitchenName || "";
          formMenu = found.menu || "";
          formSku = found.sku || "";
          formGtin = found.gtin || "";
          formStatus = found.status || "Available";
          itemFormInitial = {
            name: formName,
            price: formPrice,
            category: formCategory,
            status: formStatus,
          };
        }
      }
    }
  } else if (viewKey === "online-ordering") {
    currentView = "online-ordering";
    activeMenu = "online-ordering";
  } else if (viewKey === "home") {
    currentView = "home";
    activeMenu = "home";
    isHomeLoading = true;
  } else {
    const sub = path.replace(/^\/dashboard\/?/, "").split("/")[0] || "home";
    currentView = sub;
    activeMenu = sub;
    isContentLoading = true;
  }

  return {
    currentView,
    activeMenu,
    isItemsMenusOpen,
    isItemsOpen,
    isHomeLoading,
    isContentLoading,
    isCreateItemOpen,
    editingItemId,
    itemFormInitial,
    formName,
    formPrice,
    formCategory,
    formDescription,
    formKitchenName,
    formMenu,
    formSku,
    formGtin,
    formStatus,
    isCreateCategoryOpen,
    editingCategoryId,
    categoryFormName,
    categoryFormParentId,
    categoryFormItems,
    categoryFormPointsOfSale,
    categoryFormInitial,
    isCreateModifierOpen,
    editingModifierSetId,
    editingModifierSet,
    formImageUrl,
  };
}

const testPaths = [
  undefined,
  "/dashboard",
  "/dashboard/",
  "/dashboard/items/library",
  "/dashboard/items/library/",
  "/dashboard/items/library/new",
  "/dashboard/items/library/item-1",
  "/dashboard/items/library/non-existent-item",
  "/dashboard/items/categories",
  "/dashboard/items/categories/",
  "/dashboard/items/categories/new",
  "/dashboard/items/categories/cat-food",
  "/dashboard/items/categories/non-existent-cat",
  "/dashboard/items/modifiers",
  "/dashboard/items/modifiers/",
  "/dashboard/items/modifiers/new",
  "/dashboard/items/modifiers/mod-1",
  "/dashboard/items/modifiers/non-existent-mod",
  "/dashboard/store-setup/review",
  "/store-setup/review",
  "/dashboard/unknown-page",
  "/dashboard/unknown-page/abc",
];

for (const path of testPaths) {
  test(`golden test path: ${path}`, () => {
    const legacyState = legacyGetInitialDashboardRouteState(path);
    const newState = getInitialDashboardRouteState(path);
    assert.deepEqual(newState, legacyState);
  });
}
