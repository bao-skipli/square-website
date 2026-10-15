import { ref, get, onValue } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";
import {
  getLocalOnlineStore,
  getLocalStoreSlugs,
  DEFAULT_ONLINE_STORE,
} from "@/services/onlineStoreService";

/**
 * Default seeded discounts for Storefront
 */
export const SEED_DISCOUNTS = [
  {
    id: "disc_10off",
    name: "10% OFF",
    type: "percent",
    value: 10,
    appliesTo: "all",
    active: true,
  },
];

/**
 * SECURITY NOTE / KIẾN TRÚC BẢO MẬT:
 * Hiện tại client đọc trực tiếp các node dữ liệu (categories, items, modifierSets) qua storefrontService.
 * RTDB không lọc field khi đọc, nghĩa là ở phase này một số field nội bộ (như SKU, giá vốn, kitchenOverride)
 * có thể đọc được trên client.
 *
 * Để chuẩn bị cho việc tách bạch mà không ảnh hưởng UI:
 * Toàn bộ việc đọc và chuẩn hoá dữ liệu Storefront đều ĐƯỢC ĐÓNG GÓI qua file `storefrontService.js` này.
 * Sau này chỉ cần đổi endpoint sang `publicMenu/{storeId}` tại đây mà không cần sửa bất kỳ UI component nào.
 */

function toList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return Object.values(val).filter(Boolean);
}

/**
 * Resolves a store slug to its storeId and merchantId.
 * @param {string} slug
 * @returns {Promise<{ storeId: string, merchantId: string|null } | null>}
 */
export async function resolveStoreSlug(slug) {
  if (!slug) return null;

  // 1. Try Firebase RTDB storeSlugs node
  try {
    const slugRef = ref(database, `storeSlugs/${slug}`);
    const snap = await get(slugRef);
    if (snap.exists()) {
      const val = snap.val();
      const storeId = typeof val === "string" ? val : val.storeId;
      const merchantId = typeof val === "object" ? val.merchantId : null;
      return { storeId, merchantId };
    }
  } catch (err) {
    console.warn("RTDB slug lookup error, trying fallback:", err);
  }

  // 2. Check local fallback
  const localSlugs = getLocalStoreSlugs();
  const localStore = getLocalOnlineStore();

  if (localSlugs[slug] || (localStore.slug === slug)) {
    return {
      storeId: localStore.id || "store_skipli",
      merchantId: localStore.merchantId || null,
    };
  }

  // 3. Fallback for default 'skipli' store
  if (slug === "skipli") {
    return {
      storeId: "store_skipli",
      merchantId: null,
    };
  }

  return null;
}

/**
 * Realtime subscription for public storefront data.
 * Listens to store, categories, items, modifierSets, and discounts.
 * Emits granular updates as each part loads so Header / Tabs / Menu render immediately.
 *
 * @param {string} slug
 * @param {Function} onUpdate - Callback receiving state updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeStorefrontData(slug, onUpdate) {
  let isCancelled = false;
  const unsubs = [];

  const state = {
    status: "loading", // 'loading' | 'ready' | 'notFound' | 'closed' | 'error'
    loaded: {
      store: false,
      categories: false,
      items: false,
      modifierSets: false,
      discounts: false,
    },
    store: null,
    categories: [],
    items: [],
    modifierSets: [],
    discounts: [...SEED_DISCOUNTS],
    error: null,
  };

  const emit = () => {
    if (isCancelled) return;
    onUpdate({ ...state });
  };

  const checkReadyStatus = () => {
    if (!state.store) return;
    if (!state.store.enabled) {
      state.status = "closed";
    } else if (state.loaded.categories && state.loaded.items) {
      state.status = "ready";
    } else {
      state.status = "loading";
    }
    emit();
  };

  // Step 1: Resolve slug
  resolveStoreSlug(slug)
    .then((resolved) => {
      if (isCancelled) return;
      if (!resolved) {
        state.status = "notFound";
        emit();
        return;
      }

      const { storeId, merchantId } = resolved;

      // 1. Listen to store configuration
      const storeRef = ref(database, `onlineStores/${storeId}`);
      const unsubStore = onValue(
        storeRef,
        (snap) => {
          if (isCancelled) return;
          if (snap.exists()) {
            state.store = snap.val();
          } else {
            // Local store fallback
            state.store = getLocalOnlineStore();
          }
          state.loaded.store = true;
          checkReadyStatus();
        },
        (err) => {
          console.warn("Storefront store load error, using local fallback:", err);
          state.store = getLocalOnlineStore();
          state.loaded.store = true;
          checkReadyStatus();
        }
      );
      unsubs.push(unsubStore);

      // Path prefix for merchant's catalog data
      const merchantPath = merchantId
        ? `users/${merchantId}`
        : state.store?.merchantId
        ? `users/${state.store.merchantId}`
        : null;

      // 2. Listen to Categories
      const catRefPath = merchantPath ? `${merchantPath}/categories` : "categories";
      const catRef = ref(database, catRefPath);
      const unsubCat = onValue(
        catRef,
        (snap) => {
          if (isCancelled) return;
          if (snap.exists()) {
            state.categories = toList(snap.val());
          } else {
            // Local categories fallback
            try {
              const raw = localStorage.getItem("sq_dashboard_categories");
              state.categories = raw ? JSON.parse(raw) : [];
            } catch (e) {
              state.categories = [];
            }
          }
          state.loaded.categories = true;
          checkReadyStatus();
        },
        (err) => {
          console.warn("Categories fetch error, using local storage:", err);
          try {
            const raw = localStorage.getItem("sq_dashboard_categories");
            state.categories = raw ? JSON.parse(raw) : [];
          } catch (e) {
            state.categories = [];
          }
          state.loaded.categories = true;
          checkReadyStatus();
        }
      );
      unsubs.push(unsubCat);

      // 3. Listen to Items
      const itemRefPath = merchantPath ? `${merchantPath}/items` : "items";
      const itemRef = ref(database, itemRefPath);
      const unsubItems = onValue(
        itemRef,
        (snap) => {
          if (isCancelled) return;
          if (snap.exists()) {
            state.items = toList(snap.val());
          } else {
            // Local items fallback
            try {
              const raw = localStorage.getItem("sq_dashboard_items");
              state.items = raw ? JSON.parse(raw) : [];
            } catch (e) {
              state.items = [];
            }
          }
          state.loaded.items = true;
          checkReadyStatus();
        },
        (err) => {
          console.warn("Items fetch error, using local storage:", err);
          try {
            const raw = localStorage.getItem("sq_dashboard_items");
            state.items = raw ? JSON.parse(raw) : [];
          } catch (e) {
            state.items = [];
          }
          state.loaded.items = true;
          checkReadyStatus();
        }
      );
      unsubs.push(unsubItems);

      // 4. Listen to Modifier Sets
      const modRefPath = merchantPath ? `${merchantPath}/modifierSets` : "modifierSets";
      const modRef = ref(database, modRefPath);
      const unsubMods = onValue(
        modRef,
        (snap) => {
          if (isCancelled) return;
          if (snap.exists()) {
            state.modifierSets = toList(snap.val());
          } else {
            try {
              const raw = localStorage.getItem("sq_dashboard_modifier_sets");
              state.modifierSets = raw ? JSON.parse(raw) : [];
            } catch (e) {
              state.modifierSets = [];
            }
          }
          state.loaded.modifierSets = true;
          checkReadyStatus();
        },
        (err) => {
          console.warn("ModifierSets fetch error, using local storage:", err);
          try {
            const raw = localStorage.getItem("sq_dashboard_modifier_sets");
            state.modifierSets = raw ? JSON.parse(raw) : [];
          } catch (e) {
            state.modifierSets = [];
          }
          state.loaded.modifierSets = true;
          checkReadyStatus();
        }
      );
      unsubs.push(unsubMods);

      // 5. Listen to Discounts (if present)
      const discRefPath = merchantPath ? `${merchantPath}/discounts` : "discounts";
      const discRef = ref(database, discRefPath);
      const unsubDisc = onValue(
        discRef,
        (snap) => {
          if (isCancelled) return;
          if (snap.exists()) {
            const list = toList(snap.val());
            state.discounts = list.length > 0 ? list : [...SEED_DISCOUNTS];
          } else {
            state.discounts = [...SEED_DISCOUNTS];
          }
          state.loaded.discounts = true;
          emit();
        },
        () => {
          state.discounts = [...SEED_DISCOUNTS];
          state.loaded.discounts = true;
          emit();
        }
      );
      unsubs.push(unsubDisc);
    })
    .catch((err) => {
      if (isCancelled) return;
      console.error("Storefront resolution error:", err);
      state.status = "error";
      state.error = err.message || "Failed to load store";
      emit();
    });

  return () => {
    isCancelled = true;
    unsubs.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        // ignore
      }
    });
  };
}
