import {
  INITIAL_CATEGORIES,
  INITIAL_LIBRARY_ITEMS,
} from "./dashboardConstants";
import { getLocalModifierSets } from "@/firebase/modifiersService";

export function getInitialDashboardRouteState(pathname) {
  const path =
    pathname ||
    (typeof window !== "undefined" ? window.location.pathname : "/dashboard");

  let currentView = "home";
  let activeMenu = "home";
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

  if (path.includes("/modifiers")) {
    currentView = "modifiers";
    activeMenu = "modifiers";
    isItemsMenusOpen = true;
    isItemsOpen = true;
    isHomeLoading = false;
    isContentLoading = false;

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
  } else if (path.includes("/categories")) {
    currentView = "categories";
    activeMenu = "categories";
    isItemsMenusOpen = true;
    isItemsOpen = true;
    isHomeLoading = false;
    isContentLoading = false;

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
  } else if (path.includes("/library")) {
    currentView = "item-library";
    activeMenu = "item-library";
    isItemsMenusOpen = true;
    isItemsOpen = true;
    isHomeLoading = false;
    isContentLoading = false;

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
  } else if (path.includes("/online")) {
    currentView = "online-ordering";
    activeMenu = "online-ordering";
    isHomeLoading = false;
    isContentLoading = false;
  } else if (path === "/dashboard" || path === "/dashboard/") {
    currentView = "home";
    activeMenu = "home";
    isHomeLoading = true;
    isContentLoading = false;
  } else {
    const sub = path.replace(/^\/dashboard\/?/, "").split("/")[0] || "home";
    currentView = sub;
    activeMenu = sub;
    isHomeLoading = false;
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
  };
}
