import { ref, get, onValue } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";
import {
  getLocalOnlineStore,
  getLocalStoreSlugs,
  getLocalStoreDomains,
  DEFAULT_ONLINE_STORE,
} from "@/services/onlineStoreService";
import { INITIAL_CATEGORIES, INITIAL_LIBRARY_ITEMS } from "@/firebase/itemService";

export const SEED_DISCOUNTS = [];

function toList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return Object.values(val).filter(Boolean);
}

export async function resolveStoreDomain(domain) {
  if (!domain) return null;
  const cleanDomain = domain.trim().toLowerCase().split(":")[0];
  const domainKey = cleanDomain.replace(/\./g, ",");

  // 1. Try exact domain in Firebase RTDB
  try {
    const domainRef = ref(database, `storeDomains/${domainKey}`);
    const snap = await get(domainRef);
    if (snap.exists()) {
      const val = snap.val();
      const storeId = typeof val === "string" ? val : val.storeId;
      const merchantId = typeof val === "object" ? val.merchantId : null;
      return { storeId, merchantId };
    }
  } catch (err) {
    console.warn("RTDB domain lookup notice:", err.message);
  }

  // 2. If domain has www., also try root domain (or vice versa)
  if (cleanDomain.startsWith("www.")) {
    const rootDomain = cleanDomain.substring(4);
    const rootKey = rootDomain.replace(/\./g, ",");
    try {
      const rootRef = ref(database, `storeDomains/${rootKey}`);
      const snap = await get(rootRef);
      if (snap.exists()) {
        const val = snap.val();
        const storeId = typeof val === "string" ? val : val.storeId;
        const merchantId = typeof val === "object" ? val.merchantId : null;
        return { storeId, merchantId };
      }
    } catch (e) {}
  }

  // 3. Try local storage cache
  const localDomains = getLocalStoreDomains();
  const localStore = getLocalOnlineStore();

  if (localDomains[domainKey] || (localStore.customDomain?.hostname === cleanDomain)) {
    return {
      storeId: localStore.id || "store_skipli",
      merchantId: localStore.merchantId || null,
    };
  }

  // 4. Resilient Fallback: On deployed Bunny CDN custom domain, default to the store
  return {
    storeId: localStore.id || "store_skipli",
    merchantId: localStore.merchantId || null,
  };
}

export async function resolveStoreSlug(slug) {
  if (!slug) return null;

  if (slug.includes(".")) {
    return resolveStoreDomain(slug);
  }

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
    console.warn("RTDB slug lookup notice:", err.message);
  }

  const localSlugs = getLocalStoreSlugs();
  const localStore = getLocalOnlineStore();

  if (localSlugs[slug] || (localStore.slug === slug)) {
    return {
      storeId: localStore.id || "store_skipli",
      merchantId: localStore.merchantId || null,
    };
  }

  if (slug === "skipli") {
    return {
      storeId: "store_skipli",
      merchantId: null,
    };
  }

  // Fallback to active store
  return {
    storeId: localStore.id || "store_skipli",
    merchantId: localStore.merchantId || null,
  };
}

export function subscribeStorefrontData(slug, onUpdate) {
  let isCancelled = false;
  const unsubs = [];

  const state = {
    status: "loading",
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

  resolveStoreSlug(slug)
    .then(async (resolved) => {
      if (isCancelled) return;
      if (!resolved) {
        state.status = "notFound";
        emit();
        return;
      }

      const { storeId } = resolved;
      let effectiveMerchantId = resolved.merchantId;

      const storeRef = ref(database, `onlineStores/${storeId}`);

      if (!effectiveMerchantId) {
        try {
          const storeSnap = await get(storeRef);
          if (storeSnap.exists()) {
            const storeVal = storeSnap.val();
            effectiveMerchantId = storeVal?.merchantId || null;
            if (!state.store) state.store = storeVal;
          }
        } catch (e) {
          console.warn("Could not prefetch store for merchantId:", e);
        }
      }

      if (!effectiveMerchantId) {
        const localStore = getLocalOnlineStore();
        if (localStore?.merchantId) {
          effectiveMerchantId = localStore.merchantId;
        }
      }

      const unsubStore = onValue(
        storeRef,
        (snap) => {
          if (isCancelled) return;
          if (snap.exists()) {
            state.store = snap.val();
          } else {
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

      const merchantPath = effectiveMerchantId ? `users/${effectiveMerchantId}` : null;

      const catRefPath = merchantPath ? `${merchantPath}/categories` : "categories";
      const catRef = ref(database, catRefPath);
      const unsubCat = onValue(
        catRef,
        (snap) => {
          if (isCancelled) return;
          if (snap.exists()) {
            state.categories = toList(snap.val());
          } else {
            try {
              const raw = localStorage.getItem("sq_dashboard_categories");
              const parsed = raw ? JSON.parse(raw) : [];
              state.categories = parsed.length > 0 ? parsed : [...INITIAL_CATEGORIES];
            } catch (e) {
              state.categories = [...INITIAL_CATEGORIES];
            }
          }
          state.loaded.categories = true;
          checkReadyStatus();
        },
        (err) => {
          console.warn("Categories fetch notice, using fallback:", err.message);
          try {
            const raw = localStorage.getItem("sq_dashboard_categories");
            const parsed = raw ? JSON.parse(raw) : [];
            state.categories = parsed.length > 0 ? parsed : [...INITIAL_CATEGORIES];
          } catch (e) {
            state.categories = [...INITIAL_CATEGORIES];
          }
          state.loaded.categories = true;
          checkReadyStatus();
        }
      );
      unsubs.push(unsubCat);

      const itemRefPath = merchantPath ? `${merchantPath}/items` : "items";
      const itemRef = ref(database, itemRefPath);
      const unsubItems = onValue(
        itemRef,
        (snap) => {
          if (isCancelled) return;
          if (snap.exists()) {
            state.items = toList(snap.val());
          } else {
            try {
              const raw = localStorage.getItem("sq_dashboard_items");
              const parsed = raw ? JSON.parse(raw) : [];
              state.items = parsed.length > 0 ? parsed : [...INITIAL_LIBRARY_ITEMS];
            } catch (e) {
              state.items = [...INITIAL_LIBRARY_ITEMS];
            }
          }
          state.loaded.items = true;
          checkReadyStatus();
        },
        (err) => {
          console.warn("Items fetch notice, using fallback:", err.message);
          try {
            const raw = localStorage.getItem("sq_dashboard_items");
            const parsed = raw ? JSON.parse(raw) : [];
            state.items = parsed.length > 0 ? parsed : [...INITIAL_LIBRARY_ITEMS];
          } catch (e) {
            state.items = [...INITIAL_LIBRARY_ITEMS];
          }
          state.loaded.items = true;
          checkReadyStatus();
        }
      );
      unsubs.push(unsubItems);

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

      }
    });
  };
}
