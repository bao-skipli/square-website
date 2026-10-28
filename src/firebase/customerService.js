import { ref, set, get, remove, onValue } from "firebase/database";
import { database } from "./firebaseConfig";

const DEFAULT_CUSTOMERS = [
  {
    id: "cust-0912345678",
    name: "Nguyễn Văn An",
    phone: "0912345678",
    email: "an.nguyen@gmail.com",
    address: "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
    group: "VIP",
    orderCount: 8,
    totalSpent: 1250000,
    loyaltyPoints: 125,
    lastOrderDate: Date.now() - 3600000 * 24 * 2,
    notes: "Uống cà phê không đường, ít đá.",
  },
  {
    id: "cust-0987654321",
    name: "Trần Thị Mai",
    phone: "0987654321",
    email: "mai.tran@yahoo.com",
    address: "456 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
    group: "Regular",
    orderCount: 4,
    totalSpent: 480000,
    loyaltyPoints: 48,
    lastOrderDate: Date.now() - 3600000 * 24 * 5,
    notes: "Thích trà đào cam sả nhiều trân châu.",
  },
  {
    id: "cust-0903112233",
    name: "Lê Hoàng Long",
    phone: "0903112233",
    email: "long.le@outlook.com",
    address: "789 Điện Biên Phủ, Bình Thạnh, TP.HCM",
    group: "New",
    orderCount: 1,
    totalSpent: 85000,
    loyaltyPoints: 8,
    lastOrderDate: Date.now() - 3600000 * 4,
    notes: "Khách gọi giao tận nơi văn phòng.",
  },
];

function getLocalCustomers(userId) {
  try {
    const raw = localStorage.getItem(`sq_customers_${userId || "default"}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Local storage read error for customers:", e);
  }
  return DEFAULT_CUSTOMERS;
}

function setLocalCustomers(userId, data) {
  try {
    localStorage.setItem(`sq_customers_${userId || "default"}`, JSON.stringify(data));
  } catch (e) {
    console.warn("Local storage write error for customers:", e);
  }
}

export function subscribeCustomers(userId, onDataChange) {
  const safeId = userId || "default_store";
  const customersRef = ref(database, `customers/${safeId}`);

  // Initial emit from cache
  const cached = getLocalCustomers(safeId);
  onDataChange(cached);

  try {
    const unsubscribe = onValue(customersRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list = Array.isArray(val) ? val : Object.values(val);
        setLocalCustomers(safeId, list);
        onDataChange(list);
      } else {
        // Seed default customers once if empty
        const seedObj = {};
        DEFAULT_CUSTOMERS.forEach((c) => {
          seedObj[c.phone || c.id] = c;
        });
        set(customersRef, seedObj).catch(() => {});
        onDataChange(DEFAULT_CUSTOMERS);
      }
    });
    return unsubscribe;
  } catch (e) {
    console.warn("Firebase subscribe error for customers:", e);
    return () => {};
  }
}

export async function saveCustomer(userId, customer) {
  const safeId = userId || "default_store";
  const phoneKey = customer.phone ? customer.phone.replace(/[^\d]/g, "") : `cust-${Date.now()}`;
  const fullCustomer = {
    id: customer.id || `cust-${phoneKey}`,
    name: customer.name || "Khách hàng",
    phone: customer.phone || "",
    email: customer.email || "",
    address: customer.address || "",
    group: customer.group || "Regular",
    orderCount: customer.orderCount || 0,
    totalSpent: customer.totalSpent || 0,
    loyaltyPoints: customer.loyaltyPoints || 0,
    lastOrderDate: customer.lastOrderDate || Date.now(),
    notes: customer.notes || "",
    updatedAt: Date.now(),
  };

  // Local update
  const cached = getLocalCustomers(safeId);
  const idx = cached.findIndex((c) => c.phone === fullCustomer.phone || c.id === fullCustomer.id);
  let updatedList;
  if (idx !== -1) {
    updatedList = [...cached];
    updatedList[idx] = fullCustomer;
  } else {
    updatedList = [fullCustomer, ...cached];
  }
  setLocalCustomers(safeId, updatedList);

  try {
    const custRef = ref(database, `customers/${safeId}/${phoneKey}`);
    await set(custRef, fullCustomer);
  } catch (e) {
    console.warn("Firebase save customer error:", e);
  }
  return fullCustomer;
}

export async function deleteCustomer(userId, customerId, phone) {
  const safeId = userId || "default_store";
  const phoneKey = phone ? phone.replace(/[^\d]/g, "") : customerId;

  const cached = getLocalCustomers(safeId);
  const updatedList = cached.filter((c) => c.id !== customerId && c.phone !== phone);
  setLocalCustomers(safeId, updatedList);

  try {
    const custRef = ref(database, `customers/${safeId}/${phoneKey}`);
    await remove(custRef);
  } catch (e) {
    console.warn("Firebase delete customer error:", e);
  }
}

export function exportCustomersToCSV(customers = []) {
  if (customers.length === 0) {
    alert("Chưa có khách hàng nào để xuất file.");
    return;
  }

  const headers = ["Name,Phone,Email,Group,OrderCount,TotalSpent,LoyaltyPoints,Address,Notes"];
  const escapeCsv = (str) => `"${String(str ?? "").replace(/"/g, '""')}"`;

  const rows = customers.map((c) =>
    [
      escapeCsv(c.name),
      escapeCsv(c.phone),
      escapeCsv(c.email),
      escapeCsv(c.group),
      c.orderCount || 0,
      c.totalSpent || 0,
      c.loyaltyPoints || 0,
      escapeCsv(c.address),
      escapeCsv(c.notes),
    ].join(",")
  );

  const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `square_customers_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
