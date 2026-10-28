import { ref, set, get, update, remove, onValue } from "firebase/database";
import { database } from "./firebaseConfig";

const LOCAL_STORAGE_ORDERS_KEY = "sq_dashboard_orders";

function getLocalOrders(storeId = "store_skipli") {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_ORDERS_KEY}_${storeId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Local storage read error for orders:", e);
  }
  return [];
}

function setLocalOrders(storeId = "store_skipli", orders = []) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_ORDERS_KEY}_${storeId}`, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent("sq_orders_updated", { detail: orders }));
  } catch (e) {
    console.warn("Local storage save error for orders:", e);
  }
}

/**
 * Generate human-friendly order number: #1001, #1002, etc.
 */
export function generateOrderNumber() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const randomSuffix = Math.floor(10 + Math.random() * 90);
  return `#${hours}${minutes}-${randomSuffix}`;
}

/**
 * Create a new order (called by Storefront Checkout or POS)
 */
export async function createOrder({
  storeId = "store_skipli",
  customer = {},
  items = [],
  subtotal = 0,
  tax = 0,
  deliveryFee = 0,
  discount = 0,
  total = 0,
  fulfillmentType = "pickup", // "pickup" | "delivery" | "dine_in"
  paymentMethod = "cod", // "cod" | "vietqr" | "card"
  paymentStatus = "unpaid", // "unpaid" | "paid"
  notes = "",
}) {
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const orderNumber = generateOrderNumber();
  const createdAt = Date.now();

  const newOrder = {
    id: orderId,
    storeId,
    orderNumber,
    createdAt,
    updatedAt: createdAt,
    status: "new", // "new" | "in_progress" | "ready" | "completed" | "cancelled"
    fulfillmentType,
    paymentMethod,
    paymentStatus,
    customer: {
      name: (customer.name || "").trim() || "Khách lẻ",
      phone: (customer.phone || "").trim() || "",
      address: (customer.address || "").trim() || "",
    },
    items: items.map((line, idx) => ({
      lineId: line.lineId || `item_${idx}_${Date.now()}`,
      itemId: line.itemId || line.id || "",
      name: line.name || line.title || "Món ăn",
      price: Number(line.price || line.lineTotalCents || 0),
      qty: Number(line.qty || line.quantity || 1),
      modifiers: Array.isArray(line.selectedModifiers)
        ? line.selectedModifiers.map((m) => m.name || m.label || m.modId).filter(Boolean)
        : Array.isArray(line.modifiers)
        ? line.modifiers
        : [],
      notes: line.notes || "",
    })),
    subtotal: Number(subtotal || 0),
    tax: Number(tax || 0),
    deliveryFee: Number(deliveryFee || 0),
    discount: Number(discount || 0),
    total: Number(total || (subtotal + tax + deliveryFee - discount)),
    notes: (notes || "").trim(),
  };

  // 1. Try Firebase RTDB write
  if (database) {
    try {
      const orderRef = ref(database, `orders/${storeId}/${orderId}`);
      await set(orderRef, newOrder);

      // Auto-update customer directory if phone provided
      if (newOrder.customer.phone) {
        const cleanPhone = newOrder.customer.phone.replace(/[^0-9]/g, "");
        if (cleanPhone) {
          const custRef = ref(database, `customers/${storeId}/${cleanPhone}`);
          const existingCustSnap = await get(custRef);
          const existingCust = existingCustSnap.exists() ? existingCustSnap.val() : {};

          const totalSpend = (existingCust.totalSpend || 0) + newOrder.total;
          const totalOrders = (existingCust.totalOrders || 0) + 1;

          await set(custRef, {
            phone: cleanPhone,
            name: newOrder.customer.name,
            address: newOrder.customer.address || existingCust.address || "",
            lastOrderAt: createdAt,
            firstOrderAt: existingCust.firstOrderAt || createdAt,
            totalSpend,
            totalOrders,
          });
        }
      }
    } catch (e) {
      console.warn("Firebase RTDB order save error, fallback local:", e);
    }
  }

  // 2. Also save to local storage as fallback / instant cache
  const localList = getLocalOrders(storeId);
  localList.unshift(newOrder);
  setLocalOrders(storeId, localList);

  return newOrder;
}

export const saveNewOrder = createOrder;

/**
 * Subscribe to realtime orders for store
 */
export function subscribeOrders(storeId = "store_skipli", onUpdate) {
  if (!onUpdate) return () => {};

  // Initial trigger with local storage
  const initialLocal = getLocalOrders(storeId);
  if (initialLocal.length > 0) {
    onUpdate(initialLocal);
  }

  if (!database) {
    const handleLocalUpdate = (e) => {
      onUpdate(e.detail || []);
    };
    window.addEventListener("sq_orders_updated", handleLocalUpdate);
    return () => window.removeEventListener("sq_orders_updated", handleLocalUpdate);
  }

  const ordersRef = ref(database, `orders/${storeId}`);
  const unsubscribe = onValue(
    ordersRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.values(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setLocalOrders(storeId, list);
        onUpdate(list);
      } else {
        const local = getLocalOrders(storeId);
        onUpdate(local);
      }
    },
    (err) => {
      console.warn("Realtime orders subscription error:", err);
      onUpdate(getLocalOrders(storeId));
    }
  );

  return unsubscribe;
}

/**
 * Update order status
 */
export async function updateOrderStatus(storeId = "store_skipli", orderId, newStatus) {
  if (!orderId || !newStatus) return;

  const validStatuses = ["new", "in_progress", "ready", "completed", "cancelled"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid order status: ${newStatus}`);
  }

  const updatedAt = Date.now();

  if (database) {
    try {
      const orderRef = ref(database, `orders/${storeId}/${orderId}`);
      await update(orderRef, {
        status: newStatus,
        updatedAt,
      });
    } catch (e) {
      console.warn("Firebase order status update failed:", e);
    }
  }

  // Update local
  const localList = getLocalOrders(storeId);
  const idx = localList.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    localList[idx].status = newStatus;
    localList[idx].updatedAt = updatedAt;
    setLocalOrders(storeId, localList);
  }
}

/**
 * Cancel order with reason
 */
export async function cancelOrder(storeId = "store_skipli", orderId, cancelReason = "") {
  if (!orderId) return;
  const updatedAt = Date.now();

  if (database) {
    try {
      const orderRef = ref(database, `orders/${storeId}/${orderId}`);
      await update(orderRef, {
        status: "cancelled",
        cancelReason: cancelReason || "Khách hủy / Cửa hàng hết món",
        updatedAt,
      });
    } catch (e) {
      console.warn("Firebase cancel order failed:", e);
    }
  }

  // Update local
  const localList = getLocalOrders(storeId);
  const idx = localList.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    localList[idx].status = "cancelled";
    localList[idx].cancelReason = cancelReason || "Khách hủy / Cửa hàng hết món";
    localList[idx].updatedAt = updatedAt;
    setLocalOrders(storeId, localList);
  }
}
