import { ref, set, get, update, remove, onValue } from "firebase/database";
import { database } from "./firebaseConfig";

// Default preset data if database is empty
export const DEFAULT_UNITS = [
  { id: "unit-ly", name: "Ly / Cốc", abbreviation: "ly", type: "quantity", isDefault: true },
  { id: "unit-phan", name: "Phần / Suất", abbreviation: "phần", type: "quantity", isDefault: true },
  { id: "unit-cai", name: "Cái / Chiếc", abbreviation: "cái", type: "quantity", isDefault: true },
  { id: "unit-dia", name: "Đĩa / Tô", abbreviation: "đĩa", type: "quantity", isDefault: true },
  { id: "unit-kg", name: "Kilogram", abbreviation: "kg", type: "weight", precision: 2, isDefault: true },
  { id: "unit-gram", name: "Gram", abbreviation: "g", type: "weight", precision: 0, isDefault: true },
  { id: "unit-lit", name: "Lít", abbreviation: "l", type: "volume", precision: 2, isDefault: true },
  { id: "unit-ml", name: "Mililít", abbreviation: "ml", type: "volume", precision: 0, isDefault: true },
  { id: "unit-hop", name: "Hộp / Lon / Chai", abbreviation: "hộp", type: "quantity", isDefault: true },
];

export const DEFAULT_OPTIONS = [
  {
    id: "opt-size",
    name: "Kích cỡ (Size)",
    values: [
      { name: "Size Nhỏ (S)", priceDelta: 0 },
      { name: "Size Vừa (M)", priceDelta: 0.5 },
      { name: "Size Lớn (L)", priceDelta: 1.0 },
    ],
    appliedItemsCount: 6,
  },
  {
    id: "opt-ice",
    name: "Lượng đá",
    values: [
      { name: "Không đá (0%)", priceDelta: 0 },
      { name: "Ít đá (50%)", priceDelta: 0 },
      { name: "Bình thường (100%)", priceDelta: 0 },
    ],
    appliedItemsCount: 4,
  },
  {
    id: "opt-sugar",
    name: "Lượng đường",
    values: [
      { name: "Không đường (0%)", priceDelta: 0 },
      { name: "Ít ngọt (30%)", priceDelta: 0 },
      { name: "Vừa ngọt (70%)", priceDelta: 0 },
      { name: "Bình thường (100%)", priceDelta: 0 },
    ],
    appliedItemsCount: 4,
  },
];

export const DEFAULT_ATTRIBUTES = [
  { id: "attr-origin", name: "Xuất xứ", type: "text", defaultValue: "Việt Nam", showOnStorefront: true },
  { id: "attr-temp", name: "Nhiệt độ bảo quản", type: "text", defaultValue: "2°C - 5°C", showOnStorefront: false },
  { id: "attr-supplier", name: "Nhà cung cấp", type: "text", defaultValue: "Cty Cà phê Trung Nguyên", showOnStorefront: false },
  { id: "attr-brand", name: "Thương hiệu", type: "text", defaultValue: "Skipli Roastery", showOnStorefront: true },
];

export const DEFAULT_MENUS = [
  {
    id: "menu-morning",
    name: "Thực đơn Điểm tâm Sáng",
    timeStart: "06:00",
    timeEnd: "10:30",
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    isActive: true,
    categories: ["Cà phê", "Bánh & Tráng miệng"],
    description: "Khởi đầu ngày mới với cà phê pha phin và bánh ngọt nướng nóng.",
  },
  {
    id: "menu-allday",
    name: "Thực đơn Cả ngày (All Day)",
    timeStart: "00:00",
    timeEnd: "23:59",
    daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
    isActive: true,
    categories: ["Cà phê", "Trà & Nước hoa quả", "Đá xay & Sinh tố", "Bánh & Tráng miệng"],
    description: "Đầy đủ các loại đồ uống và món ăn kèm phục vụ xuyên suốt ngày.",
  },
  {
    id: "menu-happyhour",
    name: "Khung giờ vàng (Happy Hour)",
    timeStart: "14:00",
    timeEnd: "17:00",
    daysOfWeek: [1, 2, 3, 4, 5],
    isActive: true,
    categories: ["Trà & Nước hoa quả", "Bánh & Tráng miệng"],
    description: "Ưu đãi trà chiều thanh mát và món tráng miệng ngọt lành.",
  },
];

export const DEFAULT_KITCHEN_SETTINGS = {
  prepTimeMinutes: 15,
  autoPrintKitchenTicket: true,
  soundAlertEnabled: true,
  stations: [
    {
      id: "st-bar",
      name: "Trạm Quầy Bar / Pha chế",
      printerName: "Máy in Bar 80mm",
      categories: ["Cà phê", "Trà & Nước hoa quả", "Đá xay & Sinh tố"],
    },
    {
      id: "st-kitchen",
      name: "Trạm Bếp nóng / Thức ăn",
      printerName: "Máy in Bếp KDS",
      categories: ["Bánh & Tráng miệng", "Món ăn"],
    },
  ],
};

export const DEFAULT_CHANNELS = [
  {
    id: "channel-pos",
    name: "Point of Sale (POS tại quầy)",
    type: "pos",
    status: "active",
    description: "Bán hàng trực tiếp tại quầy thu ngân, in hóa đơn nhanh và tích hợp máy quét mã vạch.",
    badge: "Mặc định",
  },
  {
    id: "channel-online",
    name: "Cửa hàng Online (Storefront Website)",
    type: "storefront",
    status: "active",
    description: "Khách hàng truy cập website đặt món online, thanh toán VietQR và giao tận nơi.",
    badge: "Đang hoạt động",
  },
  {
    id: "channel-qr",
    name: "Gọi món tại bàn (QR Table Ordering)",
    type: "qr_table",
    status: "active",
    description: "Khách quét mã QR dán tại bàn để tự xem menu, chọn món và gửi thẳng về Bếp.",
    badge: "Tiện lợi",
  },
  {
    id: "channel-delivery",
    name: "Đối tác giao hàng (Delivery Integration)",
    type: "delivery",
    status: "inactive",
    description: "Đồng bộ menu và nhận đơn từ các ứng dụng GrabFood, ShopeeFood.",
    badge: "Tùy chọn",
  },
];

// Helper: read local cache fallback
function getLocalCache(key, fallback) {
  try {
    const raw = localStorage.getItem(`sq_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Local storage read error:", e);
  }
  return fallback;
}

function setLocalCache(key, data) {
  try {
    localStorage.setItem(`sq_${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn("Local storage write error:", e);
  }
}

/**
 * Generic realtime subscriber with localStorage fallback
 */
export function subscribeCatalogEntity(userId, entityName, defaultData, onDataChange) {
  const safeId = userId || "default_store";
  const entityRef = ref(database, `${entityName}/${safeId}`);

  // Initial load from local cache if exists
  const cached = getLocalCache(`${entityName}_${safeId}`, defaultData);
  onDataChange(cached);

  try {
    const unsubscribe = onValue(entityRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const arrayData = Array.isArray(val) ? val : Object.values(val);
        setLocalCache(`${entityName}_${safeId}`, arrayData);
        onDataChange(arrayData);
      } else {
        // If empty on firebase, save defaults once
        set(entityRef, defaultData).catch(() => {});
        onDataChange(defaultData);
      }
    });
    return unsubscribe;
  } catch (e) {
    console.warn(`Firebase subscribe error for ${entityName}:`, e);
    return () => {};
  }
}

/**
 * Generic save or update an entity
 */
export async function saveCatalogEntity(userId, entityName, item) {
  const safeId = userId || "default_store";
  const itemId = item.id || `${entityName.slice(0, 3)}-${Date.now()}`;
  const fullItem = { ...item, id: itemId, updatedAt: Date.now() };

  // Update local cache immediately
  const cached = getLocalCache(`${entityName}_${safeId}`, []);
  const idx = cached.findIndex((i) => i.id === itemId);
  let updatedList;
  if (idx !== -1) {
    updatedList = [...cached];
    updatedList[idx] = fullItem;
  } else {
    updatedList = [fullItem, ...cached];
  }
  setLocalCache(`${entityName}_${safeId}`, updatedList);

  try {
    const itemRef = ref(database, `${entityName}/${safeId}/${itemId}`);
    await set(itemRef, fullItem);
  } catch (e) {
    console.warn(`Firebase save error for ${entityName}:`, e);
  }
  return fullItem;
}

/**
 * Delete an entity
 */
export async function deleteCatalogEntity(userId, entityName, itemId) {
  const safeId = userId || "default_store";

  // Update local cache immediately
  const cached = getLocalCache(`${entityName}_${safeId}`, []);
  const updatedList = cached.filter((i) => i.id !== itemId);
  setLocalCache(`${entityName}_${safeId}`, updatedList);

  try {
    const itemRef = ref(database, `${entityName}/${safeId}/${itemId}`);
    await remove(itemRef);
  } catch (e) {
    console.warn(`Firebase delete error for ${entityName}:`, e);
  }
}

/**
 * Save settings object (Kitchen, Channels, etc.)
 */
export async function saveSettingsObject(userId, settingsKey, data) {
  const safeId = userId || "default_store";
  setLocalCache(`settings_${settingsKey}_${safeId}`, data);

  try {
    const settingsRef = ref(database, `settings/${safeId}/${settingsKey}`);
    await set(settingsRef, data);
  } catch (e) {
    console.warn(`Firebase save settings error for ${settingsKey}:`, e);
  }
  return data;
}

export function subscribeSettingsObject(userId, settingsKey, defaultData, onDataChange) {
  const safeId = userId || "default_store";
  const cached = getLocalCache(`settings_${settingsKey}_${safeId}`, defaultData);
  onDataChange(cached);

  try {
    const settingsRef = ref(database, `settings/${safeId}/${settingsKey}`);
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setLocalCache(`settings_${settingsKey}_${safeId}`, val);
        onDataChange(val);
      } else {
        set(settingsRef, defaultData).catch(() => {});
        onDataChange(defaultData);
      }
    });
    return unsubscribe;
  } catch (e) {
    console.warn(`Firebase subscribe settings error for ${settingsKey}:`, e);
    return () => {};
  }
}
