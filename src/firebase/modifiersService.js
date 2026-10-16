import { ref, set, get, update, remove, onValue, push } from "firebase/database";
import { database } from "./firebaseConfig";

const LOCAL_STORAGE_MODIFIER_SETS_KEY = "sq_dashboard_modifier_sets";
const LOCAL_STORAGE_MODIFIER_SET_ITEMS_KEY = "sq_dashboard_modifier_set_items";

export function getLocalModifierSets() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MODIFIER_SETS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Local storage read error for modifier sets:", e);
  }
  return [];
}

export function setLocalModifierSets(sets) {
  try {
    localStorage.setItem(LOCAL_STORAGE_MODIFIER_SETS_KEY, JSON.stringify(sets));
    window.dispatchEvent(new CustomEvent("sq_modifier_sets_updated", { detail: sets }));
  } catch (e) {
    console.warn("Local storage save error for modifier sets:", e);
  }
}

export function getLocalModifierSetItems() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MODIFIER_SET_ITEMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Local storage read error for modifier set items:", e);
  }
  return {};
}

export function setLocalModifierSetItems(index) {
  try {
    localStorage.setItem(LOCAL_STORAGE_MODIFIER_SET_ITEMS_KEY, JSON.stringify(index));
    window.dispatchEvent(new CustomEvent("sq_modifier_set_items_updated", { detail: index }));
  } catch (e) {
    console.warn("Local storage save error for modifier set items:", e);
  }
}

function toList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return Object.values(val);
}

export function subscribeModifierSets(userId, callback, onFirstSnapshot) {
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
    const local = getLocalModifierSets();
    if (callback) callback(local);
    notifyFirst(local);

    const handler = (e) => callback(e.detail || getLocalModifierSets());
    window.addEventListener("sq_modifier_sets_updated", handler);
    const unsubscribe = () => window.removeEventListener("sq_modifier_sets_updated", handler);
    return { unsubscribe, firstPromise };
  }

  const modSetsRef = ref(database, `users/${userId}/modifierSets`);
  const unsubscribe = onValue(
    modSetsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list = toList(val);

        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (callback) callback(list);
        notifyFirst(list);
      } else {
        if (callback) callback([]);
        notifyFirst([]);
      }
    },
    (error) => {
      console.warn("Realtime modifierSets subscription error:", error);
      const fallback = getLocalModifierSets();
      if (callback) callback(fallback);
      notifyFirst(fallback);
    }
  );

  return { unsubscribe, firstPromise };
}

export function subscribeModifierSetItems(userId, callback) {
  if (!userId) {
    const local = getLocalModifierSetItems();
    if (callback) callback(local);
    const handler = (e) => callback(e.detail || getLocalModifierSetItems());
    window.addEventListener("sq_modifier_set_items_updated", handler);
    return () => window.removeEventListener("sq_modifier_set_items_updated", handler);
  }

  const indexRef = ref(database, `users/${userId}/modifierSetItems`);
  const unsubscribe = onValue(
    indexRef,
    (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : {};
      if (callback) callback(data);
    },
    (error) => {
      console.warn("Realtime modifierSetItems subscription error:", error);
      if (callback) callback(getLocalModifierSetItems());
    }
  );

  return unsubscribe;
}

export function normalizeModifierSetPayload(setData, currentSetsCount = 0) {
  const isText = setData.type === "text";
  const now = Date.now();
  const id = setData.id || `modset_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const cleanModifiers = {};
  if (!isText && setData.modifiers) {
    const rawList = Array.isArray(setData.modifiers)
      ? setData.modifiers
      : Object.values(setData.modifiers);

    let idx = 0;
    rawList.forEach((m) => {
      if (!m || !m.name || !m.name.trim()) return;
      const modId = m.id || `mod_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`;
      cleanModifiers[modId] = {
        id: modId,
        name: m.name.trim(),
        priceCents: Math.max(0, parseInt(m.priceCents, 10) || 0),
        preselect: Boolean(m.preselect),
        inStock: m.inStock !== false,
        order: m.order !== undefined ? m.order : idx,
        image: m.image || null,
        appearance: m.appearance && m.appearance.color ? { color: m.appearance.color } : { color: null },
        nestedSet: m.nestedSet || (Array.isArray(m.nestedSets) && m.nestedSets[0] ? m.nestedSets[0] : null),
        nestedSets: Array.isArray(m.nestedSets) && m.nestedSets.length > 0 ? m.nestedSets : (m.nestedSet ? [m.nestedSet] : null),
      };
      idx++;
    });
  }

  return {
    id,
    name: (setData.name || "").trim(),
    displayName: (setData.displayName || setData.name || "").trim(),
    type: isText ? "text" : "list",
    locationIds: setData.locationIds || { allLocations: true },
    channels: isText ? null : (setData.channels || { all: true, pointsOfSale: true }),
    modifiers: isText ? null : cleanModifiers,
    selectionRules: isText
      ? null
      : {
          required: Boolean(setData.selectionRules?.required),
          allowMultiple: Boolean(setData.selectionRules?.allowMultiple),
        },
    displaySettings: isText
      ? null
      : {
          hideOnReceipts: Boolean(setData.displaySettings?.hideOnReceipts),
          conversational: Boolean(setData.displaySettings?.conversational),
          sortSoldOutLast: Boolean(setData.displaySettings?.sortSoldOutLast),
        },
    textSettings: isText
      ? {
          charLimit: Math.max(1, Math.min(500, parseInt(setData.textSettings?.charLimit, 10) || 150)),
          required: Boolean(setData.textSettings?.required),
        }
      : null,
    order: setData.order !== undefined ? setData.order : currentSetsCount,
    createdAt: setData.createdAt || now,
    updatedAt: now,
  };
}

export async function saveModifierSet(userId, setData, currentSetsCount = 0) {
  const normalized = normalizeModifierSetPayload(setData, currentSetsCount);

  if (userId) {
    const updates = {};
    updates[`users/${userId}/modifierSets/${normalized.id}`] = normalized;

    if (setData.id && normalized.type === "list") {
      try {
        const indexSnap = await get(ref(database, `users/${userId}/modifierSetItems/${normalized.id}`));
        if (indexSnap.exists()) {
          const appliedItemIds = Object.keys(indexSnap.val() || {});
          const validModIds = Object.keys(normalized.modifiers || {});

          for (const itemId of appliedItemIds) {
            const itemModRef = ref(database, `users/${userId}/items/${itemId}/modifierSets/${normalized.id}/overrides/preselect`);
            const itemPreselectSnap = await get(itemModRef);
            if (itemPreselectSnap.exists()) {
              const preselectMap = itemPreselectSnap.val() || {};
              Object.keys(preselectMap).forEach((modId) => {
                if (!validModIds.includes(modId)) {
                  updates[`users/${userId}/items/${itemId}/modifierSets/${normalized.id}/overrides/preselect/${modId}`] = null;
                }
              });
            }
          }
        }
      } catch (err) {
        console.warn("Could not check orphan modifier overrides:", err);
      }
    }

    await update(ref(database), updates);
    return normalized;
  }

  const currentSets = getLocalModifierSets();
  const exists = currentSets.some((s) => s.id === normalized.id);
  let updated;
  if (exists) {
    updated = currentSets.map((s) => (s.id === normalized.id ? normalized : s));
  } else {
    updated = [...currentSets, normalized];
  }
  setLocalModifierSets(updated);
  return normalized;
}

export async function deleteModifierSet(userId, setId) {
  if (userId) {
    const updates = {};
    updates[`users/${userId}/modifierSets/${setId}`] = null;
    updates[`users/${userId}/modifierSetItems/${setId}`] = null;

    try {
      const indexSnap = await get(ref(database, `users/${userId}/modifierSetItems/${setId}`));
      if (indexSnap.exists()) {
        const itemIds = Object.keys(indexSnap.val() || {});
        itemIds.forEach((itemId) => {
          updates[`users/${userId}/items/${itemId}/modifierSets/${setId}`] = null;
        });
      }
    } catch (err) {
      console.warn("Error fetching items to unlink from deleted modifier set:", err);
    }

    await update(ref(database), updates);
    return true;
  }

  const currentSets = getLocalModifierSets().filter((s) => s.id !== setId);
  setLocalModifierSets(currentSets);

  const localIndex = getLocalModifierSetItems();
  delete localIndex[setId];
  setLocalModifierSetItems(localIndex);
  return true;
}

export async function reorderModifierSets(userId, sets) {
  if (userId) {
    const updates = {};
    sets.forEach((set, idx) => {
      updates[`users/${userId}/modifierSets/${set.id}/order`] = idx;
    });
    await update(ref(database), updates);
    return true;
  }

  const updated = sets.map((s, idx) => ({ ...s, order: idx }));
  setLocalModifierSets(updated);
  return true;
}

export async function applyModifierSetToItems(userId, setId, selectedItemIds = [], currentItemIds = []) {
  const toAdd = selectedItemIds.filter((id) => !currentItemIds.includes(id));
  const toRemove = currentItemIds.filter((id) => !selectedItemIds.includes(id));

  if (userId) {
    const updates = {};

    toAdd.forEach((itemId) => {
      updates[`users/${userId}/items/${itemId}/modifierSets/${setId}`] = {
        order: Date.now(),
        overrides: null,
      };
      updates[`users/${userId}/modifierSetItems/${setId}/${itemId}`] = true;
    });

    toRemove.forEach((itemId) => {
      updates[`users/${userId}/items/${itemId}/modifierSets/${setId}`] = null;
      updates[`users/${userId}/modifierSetItems/${setId}/${itemId}`] = null;
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(database), updates);
    }
    return true;
  }

  const localIndex = getLocalModifierSetItems();
  const setMap = localIndex[setId] || {};
  toAdd.forEach((id) => {
    setMap[id] = true;
  });
  toRemove.forEach((id) => {
    delete setMap[id];
  });
  localIndex[setId] = setMap;
  setLocalModifierSetItems(localIndex);

  try {
    const rawItems = localStorage.getItem("sq_dashboard_items");
    if (rawItems) {
      const items = JSON.parse(rawItems);
      let changed = false;
      items.forEach((item) => {
        if (toAdd.includes(item.id)) {
          if (!item.modifierSets) item.modifierSets = {};
          item.modifierSets[setId] = { order: Date.now(), overrides: null };
          changed = true;
        }
        if (toRemove.includes(item.id) && item.modifierSets && item.modifierSets[setId]) {
          delete item.modifierSets[setId];
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem("sq_dashboard_items", JSON.stringify(items));
        window.dispatchEvent(new CustomEvent("sq_items_updated", { detail: items }));
      }
    }
  } catch (e) {
    console.warn("Could not sync local items modifierSets:", e);
  }

  return true;
}

export async function removeModifierSetFromItem(userId, itemId, setId) {
  if (userId) {
    const updates = {};
    updates[`users/${userId}/items/${itemId}/modifierSets/${setId}`] = null;
    updates[`users/${userId}/modifierSetItems/${setId}/${itemId}`] = null;
    await update(ref(database), updates);
    return true;
  }

  const localIndex = getLocalModifierSetItems();
  if (localIndex[setId]) {
    delete localIndex[setId][itemId];
    setLocalModifierSetItems(localIndex);
  }

  try {
    const rawItems = localStorage.getItem("sq_dashboard_items");
    if (rawItems) {
      const items = JSON.parse(rawItems);
      const target = items.find((i) => i.id === itemId);
      if (target && target.modifierSets && target.modifierSets[setId]) {
        delete target.modifierSets[setId];
        localStorage.setItem("sq_dashboard_items", JSON.stringify(items));
        window.dispatchEvent(new CustomEvent("sq_items_updated", { detail: items }));
      }
    }
  } catch (e) {
    console.warn("Could not remove modifierSet from local item:", e);
  }

  return true;
}


export async function saveItemModifierOverrides(userId, itemId, setId, overrides) {
  if (userId) {
    const targetRef = ref(database, `users/${userId}/items/${itemId}/modifierSets/${setId}/overrides`);
    await set(targetRef, overrides || null);
    return true;
  }
  return true;
}

export async function reorderItemModifierSets(userId, itemId, orderedSetIds = []) {
  if (userId) {
    const updates = {};
    orderedSetIds.forEach((setId, idx) => {
      updates[`users/${userId}/items/${itemId}/modifierSets/${setId}/order`] = idx;
    });
    await update(ref(database), updates);
    return true;
  }
  return true;
}
