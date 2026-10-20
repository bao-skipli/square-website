import { ref, get, update, set, onValue } from "firebase/database";
import { database } from "@/firebase/firebaseConfig";

const LOCAL_STORAGE_ONLINE_STORE_KEY = "sq_online_store";
const LOCAL_STORAGE_STORE_SLUGS_KEY = "sq_store_slugs";
const LOCAL_STORAGE_STORE_DOMAINS_KEY = "sq_store_domains";
const LOCAL_STORAGE_DEPLOYMENTS_KEY = "sq_store_deployments";

export const DEFAULT_ONLINE_STORE = {
  id: "store_skipli",
  name: "Skipli",
  slug: "skipli",
  logoUrl: null,
  themeColor: "#E53E3E",
  locationId: "loc-skipli",
  enabled: true,
  customDomain: null,
  deployment: null,
  menu: {
    categories: {},
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export function generateSlug(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

export async function checkSlugAvailability(slug, currentStoreId) {
  const cleanSlug = generateSlug(slug);
  if (!cleanSlug) {
    return { available: false, reason: "Slug cannot be empty." };
  }

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

    const localSlugs = getLocalStoreSlugs();
    if (localSlugs[cleanSlug] && localSlugs[cleanSlug] !== currentStoreId) {
      return { available: false, reason: "This store link is already taken." };
    }
  }

  return { available: true };
}

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

  if (userId) {
    try {
      const updates = {};
      updates[`onlineStores/${storeId}`] = normalized;
      updates[`storeSlugs/${cleanSlug}`] = storeId;

      if (oldSlug && oldSlug !== cleanSlug) {
        updates[`storeSlugs/${oldSlug}`] = null;
      }

      if (normalized.customDomain?.hostname) {
        const domainKey = domainToKey(normalized.customDomain.hostname);
        updates[`storeDomains/${domainKey}`] = {
          storeId,
          merchantId: userId,
          hostname: normalized.customDomain.hostname,
          status: normalized.customDomain.status || "ACTIVE",
          updatedAt: now,
        };
      }

      await update(ref(database), updates);
    } catch (dbErr) {
      console.warn("RTDB update failed, using local storage fallback:", dbErr);
    }
  }

  setLocalOnlineStore(normalized);
  return normalized;
}

export function cleanDomainName(raw) {
  if (!raw) return "";
  let domain = String(raw).trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//i, "");
  domain = domain.split("/")[0];
  domain = domain.split("?")[0];
  domain = domain.split(":")[0];
  domain = domain.replace(/^\.+|\.+$/g, "");
  return domain;
}

export function isValidDomain(domain) {
  if (!domain) return false;
  const cleaned = cleanDomainName(domain);
  if (!cleaned.includes(".")) return false;
  const regex = /^(?!:\/\/)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return regex.test(cleaned);
}

export function domainToKey(domain) {
  return cleanDomainName(domain).replace(/\./g, ",");
}

export function keyToDomain(key) {
  if (!key) return "";
  return key.replace(/,/g, ".");
}

export function getLocalStoreDomains() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_STORE_DOMAINS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Local storage read error for store domains:", e);
  }
  return {};
}

export function setLocalStoreDomains(domains) {
  try {
    localStorage.setItem(LOCAL_STORAGE_STORE_DOMAINS_KEY, JSON.stringify(domains));
  } catch (e) {
    console.warn("Local storage write error for store domains:", e);
  }
}

export async function checkDomainAvailability(rawDomain, currentStoreId) {
  const domain = cleanDomainName(rawDomain);
  if (!domain) {
    return { available: false, reason: "Domain cannot be empty." };
  }
  if (!isValidDomain(domain)) {
    return { available: false, reason: "Please enter a valid domain format (e.g., shop.mybrand.com)." };
  }

  const domainKey = domainToKey(domain);
  try {
    const domainRef = ref(database, `storeDomains/${domainKey}`);
    const snap = await get(domainRef);
    if (snap.exists()) {
      const val = snap.val();
      const existingStoreId = typeof val === "string" ? val : val.storeId;
      if (existingStoreId && existingStoreId !== currentStoreId) {
        return { available: false, reason: "This domain is already connected to another store." };
      }
    }
  } catch (err) {
    const localDomains = getLocalStoreDomains();
    if (localDomains[domainKey] && localDomains[domainKey] !== currentStoreId) {
      return { available: false, reason: "This domain is already connected to another store." };
    }
  }

  return { available: true };
}

export async function requestAttachCustomDomain(userId, storeId, rawDomain, targetCname = "cdn.bunny.net") {
  const domain = cleanDomainName(rawDomain);
  if (!isValidDomain(domain)) {
    throw new Error("Invalid domain format.");
  }

  const domainKey = domainToKey(domain);
  const now = Date.now();
  let domainConfig = {
    hostname: domain,
    status: "PENDING_DNS",
    targetCname: targetCname || "cdn.bunny.net",
    sslActive: false,
    createdAt: now,
    updatedAt: now,
    error: null,
  };

  const jobId = `dom_job_${now}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Try local agent HTTP loopback first
  try {
    const res = await fetch("http://127.0.0.1:4567/domain/attach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostname: domain, storeId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.domainConfig) domainConfig = data.domainConfig;
    }
  } catch (e) {
    // Agent offline or using cloud RTDB
  }

  // 2. Update Firebase Realtime Database
  if (userId) {
    try {
      const updates = {};
      updates[`onlineStores/${storeId}/customDomain`] = domainConfig;
      updates[`storeDomains/${domainKey}`] = {
        storeId,
        merchantId: userId,
        hostname: domain,
        status: domainConfig.status,
        updatedAt: now,
      };
      updates[`domainJobs/${jobId}`] = {
        id: jobId,
        type: "ATTACH_DOMAIN",
        storeId,
        merchantId: userId || null,
        hostname: domain,
        targetCname: domainConfig.targetCname,
        status: "QUEUED",
        createdAt: now,
      };
      await update(ref(database), updates);
    } catch (err) {
      console.warn("RTDB update notice:", err.message);
    }
  }

  const localDomains = getLocalStoreDomains();
  localDomains[domainKey] = storeId;
  setLocalStoreDomains(localDomains);

  const localStore = getLocalOnlineStore();
  localStore.customDomain = domainConfig;
  setLocalOnlineStore(localStore);

  return { domainConfig, jobId };
}

export async function requestVerifyCustomDomain(userId, storeId, rawDomain) {
  const domain = cleanDomainName(rawDomain);
  const domainKey = domainToKey(domain);
  const now = Date.now();
  const jobId = `dom_job_${now}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Try local agent HTTP loopback first
  try {
    const res = await fetch("http://127.0.0.1:4567/domain/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostname: domain }),
    });
    if (res.ok) {
      const data = await res.json();
      const localStore = getLocalOnlineStore();
      if (localStore.customDomain?.hostname === domain) {
        localStore.customDomain.status = data.status;
        localStore.customDomain.sslActive = data.sslActive;
        localStore.customDomain.error = data.error || null;
        setLocalOnlineStore(localStore);
      }

      if (userId && storeId) {
        try {
          const updates = {};
          updates[`onlineStores/${storeId}/customDomain/status`] = data.status;
          updates[`onlineStores/${storeId}/customDomain/sslActive`] = data.sslActive;
          updates[`onlineStores/${storeId}/customDomain/error`] = data.error || null;
          updates[`storeDomains/${domainKey}/status`] = data.status;
          await update(ref(database), updates);
        } catch (e) {
          console.warn("RTDB direct verify sync notice:", e.message);
        }
      }
      return data;
    }
  } catch (e) {}

  // 2. Fallback to RTDB job
  if (userId) {
    try {
      const updates = {};
      updates[`domainJobs/${jobId}`] = {
        id: jobId,
        type: "VERIFY_DNS_SSL",
        storeId,
        merchantId: userId || null,
        hostname: domain,
        status: "QUEUED",
        createdAt: now,
      };
      await update(ref(database), updates);
    } catch (err) {
      console.warn("RTDB verify job notice:", err.message);
    }
  }

  return { jobId };
}

export async function requestRemoveCustomDomain(userId, storeId, rawDomain) {
  const domain = cleanDomainName(rawDomain);
  const domainKey = domainToKey(domain);
  const now = Date.now();
  const jobId = `dom_job_${now}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Try local agent HTTP loopback
  try {
    await fetch("http://127.0.0.1:4567/domain/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostname: domain }),
    });
  } catch (e) {}

  // 2. Clean up RTDB
  if (userId) {
    try {
      const updates = {};
      updates[`onlineStores/${storeId}/customDomain`] = null;
      updates[`storeDomains/${domainKey}`] = null;
      updates[`domainJobs/${jobId}`] = {
        id: jobId,
        type: "REMOVE_DOMAIN",
        storeId,
        merchantId: userId || null,
        hostname: domain,
        status: "QUEUED",
        createdAt: now,
      };
      await update(ref(database), updates);
    } catch (err) {
      console.warn("RTDB remove notice:", err.message);
    }
  }

  const localDomains = getLocalStoreDomains();
  delete localDomains[domainKey];
  setLocalStoreDomains(localDomains);

  const localStore = getLocalOnlineStore();
  localStore.customDomain = null;
  setLocalOnlineStore(localStore);

  return { jobId };
}

export async function createDeploymentJob(userId, storeId, options = {}) {
  const now = Date.now();
  const jobId = `dep_${now}_${Math.random().toString(36).substring(2, 7)}`;

  const initialJob = {
    id: jobId,
    storeId: storeId || "store_skipli",
    merchantId: userId || null,
    status: "QUEUED",
    phase: "QUEUED",
    progress: 0,
    options: {
      purgeCache: options.purgeCache !== false,
      verifyCdn: options.verifyCdn !== false,
    },
    logs: [
      {
        timestamp: now,
        message: "Deployment job created and queued by dashboard.",
        level: "info",
      },
    ],
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };

  // 1. Try triggering local agent HTTP server
  try {
    const res = await fetch("http://127.0.0.1:4567/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, options }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.jobId) {
        return data.job || { ...initialJob, id: data.jobId };
      }
    }
  } catch (e) {
    // Agent offline or running via RTDB
  }

  // 2. Update RTDB
  if (userId) {
    try {
      const updates = {};
      updates[`deploymentJobs/${jobId}`] = initialJob;
      updates[`onlineStores/${storeId}/deployment`] = {
        lastDeploymentId: jobId,
        status: "QUEUED",
        updatedAt: now,
      };
      await update(ref(database), updates);
    } catch (err) {
      console.warn("RTDB deployment job write notice:", err.message);
    }
  }

  try {
    const local = localStorage.getItem(LOCAL_STORAGE_DEPLOYMENTS_KEY);
    const parsed = local ? JSON.parse(local) : {};
    parsed[jobId] = initialJob;
    localStorage.setItem(LOCAL_STORAGE_DEPLOYMENTS_KEY, JSON.stringify(parsed));
  } catch (e) {}

  return initialJob;
}

export function subscribeDeploymentJob(jobId, callback) {
  if (!jobId) return () => {};
  let isActive = true;

  // 1. Poll local agent HTTP server
  const pollAgent = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:4567/deploy/${jobId}`);
      if (res.ok) {
        const job = await res.json();
        if (isActive && job) callback(job);
      }
    } catch (e) {}
  };

  pollAgent();
  const intervalId = setInterval(pollAgent, 1200);

  // 2. Realtime Database subscription
  let rtdbUnsub = () => {};
  try {
    const jobRef = ref(database, `deploymentJobs/${jobId}`);
    rtdbUnsub = onValue(jobRef, (snap) => {
      if (snap.exists() && isActive) {
        callback(snap.val());
      }
    });
  } catch (err) {}

  return () => {
    isActive = false;
    clearInterval(intervalId);
    if (typeof rtdbUnsub === "function") rtdbUnsub();
  };
}

export function subscribeAgentStatus(callback) {
  let isActive = true;

  // 1. Direct local HTTP check
  const checkLocalAgent = async () => {
    try {
      const res = await fetch("http://127.0.0.1:4567/status", { method: "GET" });
      if (res.ok) {
        const json = await res.json();
        if (isActive) callback(json);
        return true;
      }
    } catch (e) {
      // agent not running locally
    }
    return false;
  };

  checkLocalAgent();
  const intervalId = setInterval(checkLocalAgent, 4000);

  // 2. Realtime Database subscription
  let rtdbUnsub = () => {};
  try {
    const agentRef = ref(database, "agentStatus");
    rtdbUnsub = onValue(
      agentRef,
      (snap) => {
        if (snap.exists() && isActive) {
          callback(snap.val());
        }
      },
      () => {}
    );
  } catch (e) {}

  return () => {
    isActive = false;
    clearInterval(intervalId);
    if (typeof rtdbUnsub === "function") rtdbUnsub();
  };
}

export function subscribeDomainJob(jobId, callback) {
  if (!jobId) return () => {};
  try {
    const jobRef = ref(database, `domainJobs/${jobId}`);
    return onValue(jobRef, (snap) => {
      if (snap.exists()) {
        callback(snap.val());
      }
    });
  } catch (e) {
    return () => {};
  }
}

