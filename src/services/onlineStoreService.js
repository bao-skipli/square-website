import { ref, get, update, onValue } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";

const LOCAL_STORAGE_ONLINE_STORE_KEY = "sq_online_store";
const LOCAL_STORAGE_STORE_SLUGS_KEY = "sq_store_slugs";

export const DEFAULT_ONLINE_STORE = {
  id: "store_skipli",
  name: "Skipli",
  slug: "skipli",
  logoUrl: null,
  locationId: "loc-skipli",
  enabled: false,
  menu: {
    categories: {},
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

/**
 * Generate a clean URL-friendly slug from store name.
 * Accepts lowercase letters, digits, and hyphens.
 */
export function generateSlug(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove Vietnamese diacritics
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/**
 * Local storage helpers for guest / offline mode
 */
export function getLocalOnlineStore() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ONLINE_STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Local storage read error for online store:", e);
  }
  return { ...DEFAULT_ONLINE_STORE };
}

export function setLocalOnlineStore(store) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ONLINE_STORE_KEY, JSON.stringify(store));
    const slugs = getLocalStoreSlugs();
    slugs[store.slug] = store.id;
    localStorage.setItem(LOCAL_STORAGE_STORE_SLUGS_KEY, JSON.stringify(slugs));
    window.dispatchEvent(new CustomEvent("sq_online_store_updated", { detail: store }));
  } catch (e) {
    console.warn("Local storage save error for online store:", e);
  }
}

export function getLocalStoreSlugs() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_STORE_SLUGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Local storage read error for store slugs:", e);
  }
  return { skipli: "store_skipli" };
}

/**
 * Check if a slug is available.
 * @param {string} slug
 * @param {string} currentStoreId
 * @returns {Promise<{ available: boolean, reason?: string }>}
 */
export async function checkSlugAvailability(slug, currentStoreId) {
  const cleanSlug = generateSlug(slug);
  if (!cleanSlug) {
    return { available: false, reason: "Slug cannot be empty." };
  }

  // Check in Firebase
  try {
    const slugRef = ref(database, `storeSlugs/${cleanSlug}`);
    const snap = await get(slugRef);
    if (snap.exists()) {
      const existingStoreId = snap.val();
      if (existingStoreId !== currentStoreId) {
        return { available: false, reason: "This store link is already taken." };
      }
    }
  } catch (err) {
    // Check fallback in local storage
    const localSlugs = getLocalStoreSlugs();
    if (localSlugs[cleanSlug] && localSlugs[cleanSlug] !== currentStoreId) {
      return { available: false, reason: "This store link is already taken." };
    }
  }

  return { available: true };
}

/**
 * Realtime listener for Online Store configuration in Admin.
 * Returns { unsubscribe, firstPromise }
 */
export function subscribeOnlineStore(userId, callback, onFirstSnapshot) {
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
    const local = getLocalOnlineStore();
    callback(local);
    notifyFirst(local);

    const handler = (e) => callback(e.detail || getLocalOnlineStore());
    window.addEventListener("sq_online_store_updated", handler);
    const unsubscribe = () => window.removeEventListener("sq_online_store_updated", handler);
    return { unsubscribe, firstPromise };
  }

  const storeId = `store_${userId}`;
  const storeRef = ref(database, `onlineStores/${storeId}`);

  const unsubscribe = onValue(
    storeRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const store = snapshot.val();
        callback(store);
        notifyFirst(store);
      } else {
        const initialStore = {
          ...DEFAULT_ONLINE_STORE,
          id: storeId,
          merchantId: userId,
        };
        callback(initialStore);
        notifyFirst(initialStore);
      }
    },
    (error) => {
      console.warn("Realtime online store subscription error:", error);
      const fallback = getLocalOnlineStore();
      callback(fallback);
      notifyFirst(fallback);
    }
  );

  return { unsubscribe, firstPromise };
}

/**
 * Save Online Store configuration via atomic multi-path update.
 * Updates onlineStores/{storeId} and storeSlugs/{slug} simultaneously.
 */
export async function saveOnlineStore(userId, storeData, oldSlug = null) {
  const storeId = storeData.id || (userId ? `store_${userId}` : "store_skipli");
  const cleanSlug = generateSlug(storeData.slug || storeData.name || "store");
  const now = Date.now();

  const normalized = {
    ...storeData,
    id: storeId,
    slug: cleanSlug,
    name: (storeData.name || "").trim(),
    logoUrl: storeData.logoUrl || null,
    locationId: storeData.locationId || "loc-skipli",
    enabled: Boolean(storeData.enabled),
    menu: storeData.menu || { categories: {} },
    merchantId: userId || null,
    updatedAt: now,
    createdAt: storeData.createdAt || now,
  };

  // Perform multi-path update in Firebase if authenticated
  if (userId) {
    const updates = {};
    updates[`onlineStores/${storeId}`] = normalized;
    updates[`storeSlugs/${cleanSlug}`] = storeId;

    if (oldSlug && oldSlug !== cleanSlug) {
      updates[`storeSlugs/${oldSlug}`] = null;
    }

    await update(ref(database), updates);
  }

  // Always sync to local storage for instant responsiveness
  setLocalOnlineStore(normalized);
  return normalized;
}
