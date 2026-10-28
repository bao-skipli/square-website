export const ORDER_STATUSES = {
  new: {
    key: "new",
    label: "Đơn mới",
    badgeClass: "sq-badge-new",
    color: "#2563eb",
    bgColor: "#eff6ff",
    nextStatus: "in_progress",
    nextLabel: "Bắt đầu làm",
  },
  in_progress: {
    key: "in_progress",
    label: "Đang làm",
    badgeClass: "sq-badge-progress",
    color: "#d97706",
    bgColor: "#fffbeb",
    nextStatus: "ready",
    nextLabel: "Sẵn sàng",
  },
  ready: {
    key: "ready",
    label: "Sẵn sàng",
    badgeClass: "sq-badge-ready",
    color: "#059669",
    bgColor: "#ecfdf5",
    nextStatus: "completed",
    nextLabel: "Hoàn tất",
  },
  completed: {
    key: "completed",
    label: "Đã hoàn thành",
    badgeClass: "sq-badge-completed",
    color: "#4b5563",
    bgColor: "#f3f4f6",
    nextStatus: null,
    nextLabel: null,
  },
  cancelled: {
    key: "cancelled",
    label: "Đã hủy",
    badgeClass: "sq-badge-cancelled",
    color: "#dc2626",
    bgColor: "#fef2f2",
    nextStatus: null,
    nextLabel: null,
  },
};

export const ORDER_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "new", label: "Đơn mới" },
  { key: "in_progress", label: "Đang làm" },
  { key: "ready", label: "Sẵn sàng" },
  { key: "completed", label: "Hoàn tất" },
  { key: "cancelled", label: "Đã hủy" },
];

export const FULFILLMENT_LABELS = {
  pickup: "Mang về (Pickup)",
  delivery: "Giao hàng (Delivery)",
  dine_in: "Tại bàn (Dine-in)",
};

export const PAYMENT_METHOD_LABELS = {
  cod: "Tiền mặt / COD",
  vietqr: "Chuyển khoản VietQR",
  card: "Thẻ ngân hàng",
};
