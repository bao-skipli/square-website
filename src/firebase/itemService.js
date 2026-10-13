import { ref, set, get, update, remove, onValue } from "firebase/database";
import { database } from "./firebaseConfig";

export const INITIAL_CATEGORIES = [
  { id: "cat-food", name: "Food", parentId: null, pointsOfSale: true },
  { id: "cat-pho", name: "Pho", parentId: "cat-food", pointsOfSale: true },
  { id: "cat-beverage", name: "Beverage", parentId: null, pointsOfSale: true },
  { id: "cat-liquor", name: "Liquor", parentId: null, pointsOfSale: true },
  { id: "cat-beer", name: "Beer", parentId: null, pointsOfSale: true },
  { id: "cat-wine", name: "Wine", parentId: null, pointsOfSale: true },
  { id: "cat-coffee", name: "Coffee & Tea", parentId: null, pointsOfSale: true },
  { id: "cat-desserts", name: "Desserts", parentId: null, pointsOfSale: true },
];

export const INITIAL_LIBRARY_ITEMS = [
  { id: "item-1", name: "Banana Pudding", category: "Desserts", status: "Available", price: "$6.00" },
  { id: "item-2", name: "Brownie", category: "Desserts", status: "Available", price: "$4.50" },
  { id: "item-3", name: "Cheesecake", category: "Desserts", status: "Available", price: "$7.00" },
  { id: "item-4", name: "Cookie", category: "Desserts", status: "Available", price: "$3.00" },
  { id: "item-5", name: "Ice Cream", category: "Desserts", status: "Available", price: "$5.00" },
  { id: "item-6", name: "Pho ga", category: "Pho", status: "Available", price: "$14.50" },
];

const LOCAL_STORAGE_ITEMS_KEY = "sq_dashboard_items";
const LOCAL_STORAGE_CATEGORIES_KEY = "sq_dashboard_categories";

/**
 * Helpers to get / set guest local data as fallback
 */
function getLocalItems() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Local storage read error for items:", e);
  }
  return [...INITIAL_LIBRARY_ITEMS];
}

function setLocalItems(items) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("sq_items_updated", { detail: items }));
  } catch (e) {
    console.warn("Local storage save error for items:", e);
  }
}

function getLocalCategories() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Local storage read error for categories:", e);
  }
  return [...INITIAL_CATEGORIES];
}

function setLocalCategories(categories) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent("sq_categories_updated", { detail: categories }));
  } catch (e) {
    console.warn("Local storage save error for categories:", e);
  }
}

function toList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return Object.values(val);
}

/**
 * Realtime listener for Home dashboard data (business info).
 * Returns an object: { unsubscribe, firstPromise }
 * `firstPromise` resolves with the business info object on the very first snapshot received from Firebase.
 */
export function subscribeHomeData(userId, callback, onFirstSnapshot) {
  let isFirst = true;
  let firstResolve;
  const firstPromise = new Promise((resolve) => {
    firstResolve = resolve;
  });

  const notifyFirst = (data) => {
    if (isFirst) {
      isFirst = false;
      if (onFirstSnapshot) onFirstSnapshot(data);
      firstResolve(data);
    }
  };

  if (!userId) {
    notifyFirst(null);
    return { unsubscribe: () => {}, firstPromise };
  }

  const businessRef = ref(database, `users/${userId}/businessInfo`);
  const unsubscribe = onValue(
    businessRef,
    (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      if (callback) callback(data);
      notifyFirst(data);
    },
    (error) => {
      console.warn("Realtime home subscription error:", error);
      if (callback) callback(null);
      notifyFirst(null);
    }
  );

  return { unsubscribe, firstPromise };
}

/**
 * Realtime listener for Items.
 * Returns an object: { unsubscribe, firstPromise }
 * `firstPromise` resolves with the items array on the very first snapshot received from Firebase.
 */
export function subscribeItems(userId, callback, onFirstSnapshot) {
  let isFirst = true;
  let firstResolve;
  const firstPromise = new Promise((resolve) => {
    firstResolve = resolve;
  });

  const notifyFirst = (data) => {
    if (isFirst) {
      isFirst = false;
      if (onFirstSnapshot) onFirstSnapshot(data);
      firstResolve(data);
    }
  };

  if (!userId) {
    const local = getLocalItems();
    callback(local);
    notifyFirst(local);

    const handler = (e) => callback(e.detail || getLocalItems());
    window.addEventListener("sq_items_updated", handler);
    const unsubscribe = () => window.removeEventListener("sq_items_updated", handler);
    return { unsubscribe, firstPromise };
  }

  const itemsRef = ref(database, `users/${userId}/items`);
  const unsubscribe = onValue(
    itemsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const list = toList(snapshot.val());
        callback(list);
        notifyFirst(list);
      } else {
        // Initialize if empty
        const itemsMap = {};
        INITIAL_LIBRARY_ITEMS.forEach((i) => {
          itemsMap[i.id] = i;
        });
        set(itemsRef, itemsMap)
          .then(() => {
            const list = [...INITIAL_LIBRARY_ITEMS];
            callback(list);
            notifyFirst(list);
          })
          .catch((err) => {
            console.warn("Could not set initial items in RTDB:", err);
            const fallback = getLocalItems();
            callback(fallback);
            notifyFirst(fallback);
          });
      }
    },
    (error) => {
      console.warn("Realtime items subscription error:", error);
      const fallback = getLocalItems();
      callback(fallback);
      notifyFirst(fallback);
    }
  );

  return { unsubscribe, firstPromise };
}

/**
 * Realtime listener for Categories.
 * Returns an object: { unsubscribe, firstPromise }
 * `firstPromise` resolves with the categories array on the very first snapshot received from Firebase.
 */
export function subscribeCategories(userId, callback, onFirstSnapshot) {
  let isFirst = true;
  let firstResolve;
  const firstPromise = new Promise((resolve) => {
    firstResolve = resolve;
  });

  const notifyFirst = (data) => {
    if (isFirst) {
      isFirst = false;
      if (onFirstSnapshot) onFirstSnapshot(data);
      firstResolve(data);
    }
  };

  if (!userId) {
    const local = getLocalCategories();
    callback(local);
    notifyFirst(local);

    const handler = (e) => callback(e.detail || getLocalCategories());
    window.addEventListener("sq_categories_updated", handler);
    const unsubscribe = () => window.removeEventListener("sq_categories_updated", handler);
    return { unsubscribe, firstPromise };
  }

  const catRef = ref(database, `users/${userId}/categories`);
  const unsubscribe = onValue(
    catRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const list = toList(snapshot.val());
        callback(list);
        notifyFirst(list);
      } else {
        // Initialize if empty
        const catMap = {};
        INITIAL_CATEGORIES.forEach((c) => {
          catMap[c.id] = c;
        });
        set(catRef, catMap)
          .then(() => {
            const list = [...INITIAL_CATEGORIES];
            callback(list);
            notifyFirst(list);
          })
          .catch((err) => {
            console.warn("Could not set initial categories in RTDB:", err);
            const fallback = getLocalCategories();
            callback(fallback);
            notifyFirst(fallback);
          });
      }
    },
    (error) => {
      console.warn("Realtime categories subscription error:", error);
      const fallback = getLocalCategories();
      callback(fallback);
      notifyFirst(fallback);
    }
  );

  return { unsubscribe, firstPromise };
}

/**
 * Create or Edit Item in Firebase Realtime Database
 * Throws if Firebase write fails.
 */
export async function saveItemToFirebase(userId, itemData) {
  const itemId = itemData.id || `item-${Date.now()}`;
  const itemToSave = {
    ...itemData,
    id: itemId,
    updatedAt: new Date().toISOString(),
  };

  if (userId) {
    const itemRef = ref(database, `users/${userId}/items/${itemId}`);
    await set(itemRef, itemToSave);
    return itemToSave;
  }

  // Fallback for unauthenticated guest session
  const currentItems = getLocalItems();
  const exists = currentItems.some((i) => i.id === itemId);
  let updated;
  if (exists) {
    updated = currentItems.map((i) => (i.id === itemId ? itemToSave : i));
  } else {
    updated = [itemToSave, ...currentItems];
  }
  setLocalItems(updated);
  return itemToSave;
}

/**
 * Delete Item from Firebase Realtime Database
 */
export async function deleteItemFromFirebase(userId, itemId) {
  if (userId) {
    try {
      const itemSnap = await get(ref(database, `users/${userId}/items/${itemId}`));
      const updates = {};
      updates[`users/${userId}/items/${itemId}`] = null;

      if (itemSnap.exists()) {
        const itemVal = itemSnap.val();
        if (itemVal && itemVal.modifierSets) {
          Object.keys(itemVal.modifierSets).forEach((setId) => {
            updates[`users/${userId}/modifierSetItems/${setId}/${itemId}`] = null;
          });
        }
      }

      await update(ref(database), updates);
      return true;
    } catch (e) {
      console.warn("Error deleting item with modifier cleanup, falling back to direct removal:", e);
      const itemRef = ref(database, `users/${userId}/items/${itemId}`);
      await remove(itemRef);
      return true;
    }
  }

  const currentItems = getLocalItems();
  const updated = currentItems.filter((i) => i.id !== itemId);
  setLocalItems(updated);

  // Clean local modifier set items index for guest
  try {
    const raw = localStorage.getItem("sq_dashboard_modifier_set_items");
    if (raw) {
      const index = JSON.parse(raw);
      let changed = false;
      Object.keys(index).forEach((setId) => {
        if (index[setId] && index[setId][itemId]) {
          delete index[setId][itemId];
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem("sq_dashboard_modifier_set_items", JSON.stringify(index));
        window.dispatchEvent(new CustomEvent("sq_modifier_set_items_updated", { detail: index }));
      }
    }
  } catch (err) {
    console.warn("Guest local modifier index cleanup error:", err);
  }

  return true;
}

/**
 * Duplicate Item in Firebase Realtime Database
 */
export async function duplicateItemInFirebase(userId, originalItem) {
  const newItemId = `item-${Date.now()}`;
  const duplicated = {
    ...originalItem,
    id: newItemId,
    name: `${originalItem.name} (Copy)`,
    createdAt: new Date().toISOString(),
  };

  return await saveItemToFirebase(userId, duplicated);
}

/**
 * Archive Item in Firebase Realtime Database
 */
export async function archiveItemInFirebase(userId, itemId) {
  if (userId) {
    const itemRef = ref(database, `users/${userId}/items/${itemId}`);
    await update(itemRef, {
      status: "Archived",
      updatedAt: new Date().toISOString(),
    });
    return true;
  }

  const currentItems = getLocalItems();
  const updated = currentItems.map((i) =>
    i.id === itemId ? { ...i, status: "Archived" } : i
  );
  setLocalItems(updated);
  return true;
}

/**
 * Create or Edit Category in Firebase Realtime Database
 * and sync assigned items' categories. Throws on error.
 */
export async function saveCategoryToFirebase(
  userId,
  categoryData,
  assignedItemIds = [],
  oldCatName = null,
  allItems = []
) {
  const catId = categoryData.id || `cat-${Date.now()}`;
  const catToSave = {
    ...categoryData,
    id: catId,
    updatedAt: new Date().toISOString(),
  };

  if (userId) {
    // 1. Save category
    const catRef = ref(database, `users/${userId}/categories/${catId}`);
    await set(catRef, catToSave);

    // 2. Sync assigned items in Realtime Database
    const updates = {};
    allItems.forEach((item) => {
      if (assignedItemIds.includes(item.id)) {
        if (item.category !== catToSave.name) {
          updates[`users/${userId}/items/${item.id}/category`] = catToSave.name;
        }
      } else if (
        oldCatName &&
        item.category &&
        item.category.toLowerCase() === oldCatName.toLowerCase()
      ) {
        updates[`users/${userId}/items/${item.id}/category`] = "Uncategorized";
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
    }

    return catToSave;
  }

  // Fallback to local storage for guest
  const currentCats = getLocalCategories();
  const exists = currentCats.some((c) => c.id === catId);
  let updatedCats;
  if (exists) {
    updatedCats = currentCats.map((c) => (c.id === catId ? catToSave : c));
  } else {
    updatedCats = [...currentCats, catToSave];
  }
  setLocalCategories(updatedCats);

  const currentItems = getLocalItems();
  const updatedItems = currentItems.map((item) => {
    if (assignedItemIds.includes(item.id)) {
      return { ...item, category: catToSave.name };
    } else if (
      oldCatName &&
      item.category &&
      item.category.toLowerCase() === oldCatName.toLowerCase()
    ) {
      return { ...item, category: "Uncategorized" };
    }
    return item;
  });
  setLocalItems(updatedItems);

  return catToSave;
}

/**
 * Delete Category from Firebase Realtime Database
 */
export async function deleteCategoryFromFirebase(
  userId,
  categoryId,
  categoryName,
  allCategories = [],
  allItems = []
) {
  if (userId) {
    // 1. Delete category
    const catRef = ref(database, `users/${userId}/categories/${categoryId}`);
    await remove(catRef);

    // 2. Unparent child categories and unassign items
    const updates = {};
    allCategories
      .filter((c) => c.parentId === categoryId)
      .forEach((child) => {
        updates[`users/${userId}/categories/${child.id}/parentId`] = null;
      });

    allItems
      .filter(
        (item) =>
          item.category &&
          item.category.toLowerCase() === categoryName.toLowerCase()
      )
      .forEach((item) => {
        updates[`users/${userId}/items/${item.id}/category`] = "Uncategorized";
      });

    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
    }

    return true;
  }

  const currentCats = getLocalCategories();
  const updatedCats = currentCats
    .filter((c) => c.id !== categoryId)
    .map((c) => (c.parentId === categoryId ? { ...c, parentId: null } : c));
  setLocalCategories(updatedCats);

  const currentItems = getLocalItems();
  const updatedItems = currentItems.map((item) =>
    item.category && item.category.toLowerCase() === categoryName.toLowerCase()
      ? { ...item, category: "Uncategorized" }
      : item
  );
  setLocalItems(updatedItems);

  return true;
}
