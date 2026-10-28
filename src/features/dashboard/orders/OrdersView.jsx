import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  subscribeOrders,
  updateOrderStatus,
  cancelOrder,
  createOrder,
} from "@/firebase/orderService";
import { playOrderChime } from "@/util/soundNotification";
import { formatMoney } from "@/shared/pricing";
import {
  ORDER_STATUSES,
  ORDER_TABS,
  FULFILLMENT_LABELS,
  PAYMENT_METHOD_LABELS,
} from "./orderConstants";
import OrderDetailDrawer from "./OrderDetailDrawer";
import ReceiptPrintModal from "./ReceiptPrintModal";
import "./OrdersView.css";

const MOCK_INITIAL_ORDERS = [
  {
    id: "ord_1082",
    orderNumber: "ORD-1082",
    storeId: "store_skipli",
    status: "new",
    fulfillmentType: "delivery",
    paymentMethod: "vietqr",
    paymentStatus: "paid",
    total: 171600,
    subtotal: 145000,
    tax: 11600,
    deliveryFee: 15000,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    customer: {
      name: "Lê Minh Tuấn",
      phone: "0987654321",
      address: "Tòa nhà Bitexco, Q.1, TP.HCM",
    },
    items: [
      { name: "Phở Bò Tái Nạm (Lớn)", price: 75000, qty: 1, selectedModifiers: [{ name: "Ít bánh" }, { name: "Thêm hành trần" }] },
      { name: "Trà Đào Cam Sả", price: 35000, qty: 2, selectedModifiers: [{ name: "50% Đường" }, { name: "Ít đá" }] },
    ],
    notes: "Giao trước 12h trưa giúp em ạ.",
  },
  {
    id: "ord_1081",
    orderNumber: "ORD-1081",
    storeId: "store_skipli",
    status: "in_progress",
    fulfillmentType: "pickup",
    paymentMethod: "cash",
    paymentStatus: "pending",
    total: 90000,
    subtotal: 90000,
    tax: 0,
    deliveryFee: 0,
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    customer: {
      name: "Trần Hoàng Nam",
      phone: "0912345678",
      address: "Mang về",
    },
    items: [
      { name: "Cà phê Muối Đặc biệt", price: 45000, qty: 2, selectedModifiers: [{ name: "Ít đá" }] },
    ],
    notes: "Mang về trong túi giấy",
  },
  {
    id: "ord_1080",
    orderNumber: "ORD-1080",
    storeId: "store_skipli",
    status: "ready",
    fulfillmentType: "dine_in",
    paymentMethod: "vietqr",
    paymentStatus: "paid",
    total: 125000,
    subtotal: 125000,
    tax: 0,
    deliveryFee: 0,
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    customer: {
      name: "Nguyễn Thị Mai",
      phone: "0908765432",
      address: "Bàn 04",
    },
    items: [
      { name: "Bạc Xỉu Kem Trứng", price: 55000, qty: 1 },
      { name: "Bánh Croissant Bơ Tỏi", price: 70000, qty: 1 },
    ],
    notes: "Bàn 4 khu vực máy lạnh",
  },
  {
    id: "ord_1079",
    orderNumber: "ORD-1079",
    storeId: "store_skipli",
    status: "completed",
    fulfillmentType: "pickup",
    paymentMethod: "card",
    paymentStatus: "paid",
    total: 55000,
    subtotal: 55000,
    tax: 0,
    deliveryFee: 0,
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    customer: {
      name: "Phạm Quốc Huy",
      phone: "0933221100",
      address: "Mang về",
    },
    items: [
      { name: "Trà sữa Ô Long Nướng", price: 55000, qty: 1, selectedModifiers: [{ name: "Trân châu hoàng kim" }] },
    ],
  },
];

export default function OrdersView({ storeId = "store_skipli", storeName = "Skipli" }) {
  const [orders, setOrders] = useState(MOCK_INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // "table" | "kanban"
  const [searchQuery, setSearchQuery] = useState("");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [printOrder, setPrintOrder] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    return localStorage.getItem("sq_orders_sound_enabled") !== "false";
  });

  // Track previous order IDs to detect brand new incoming orders
  const knownOrderIdsRef = useRef(new Set(MOCK_INITIAL_ORDERS.map((o) => o.id)));
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    localStorage.setItem("sq_orders_sound_enabled", String(isSoundEnabled));
  }, [isSoundEnabled]);

  useEffect(() => {
    const unsubscribe = subscribeOrders(storeId, (incomingOrders) => {
      if (incomingOrders && incomingOrders.length > 0) {
        // Check for brand new orders to play sound chime
        if (!isFirstLoadRef.current && isSoundEnabled) {
          const hasBrandNew = incomingOrders.some(
            (o) => o.status === "new" && !knownOrderIdsRef.current.has(o.id)
          );
          if (hasBrandNew) {
            playOrderChime();
          }
        }

        // Update known IDs
        const currentIds = new Set(incomingOrders.map((o) => o.id));
        knownOrderIdsRef.current = currentIds;

        setOrders(incomingOrders);

        // Keep selected order updated if it was edited
        setSelectedOrder((prev) => {
          if (!prev) return null;
          return incomingOrders.find((o) => o.id === prev.id) || prev;
        });
      }
      isFirstLoadRef.current = false;
    });

    return () => unsubscribe();
  }, [storeId, isSoundEnabled]);

  // Compute status counts
  const statusCounts = useMemo(() => {
    const counts = { all: orders.length, new: 0, in_progress: 0, ready: 0, completed: 0, cancelled: 0 };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Tab filter
      if (activeTab !== "all" && o.status !== activeTab) {
        return false;
      }
      // Fulfillment filter
      if (fulfillmentFilter !== "all" && o.fulfillmentType !== fulfillmentFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNo = (o.orderNumber || "").toLowerCase().includes(q);
        const matchesName = (o.customer?.name || "").toLowerCase().includes(q);
        const matchesPhone = (o.customer?.phone || "").toLowerCase().includes(q);
        const matchesItems = (o.items || []).some((item) => (item.name || "").toLowerCase().includes(q));
        if (!matchesNo && !matchesName && !matchesPhone && !matchesItems) {
          return false;
        }
      }
      return true;
    });
  }, [orders, activeTab, fulfillmentFilter, searchQuery]);

  // Kanban columns definition
  const kanbanColumns = [
    { key: "new", title: "Đơn mới", color: "#2563eb", bgColor: "#eff6ff" },
    { key: "in_progress", title: "Đang làm", color: "#d97706", bgColor: "#fffbeb" },
    { key: "ready", title: "Sẵn sàng", color: "#059669", bgColor: "#ecfdf5" },
    { key: "completed", title: "Đã hoàn thành", color: "#4b5563", bgColor: "#f3f4f6" },
  ];

  const handleAdvanceStatus = async (orderId, targetStatus, e) => {
    if (e) e.stopPropagation();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: targetStatus } : o))
    );
    try {
      await updateOrderStatus(storeId, orderId, targetStatus);
    } catch (err) {
      // Local state already updated
    }
  };

  const handleCancelOrder = async (orderId, reason) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "cancelled", cancelReason: reason } : o
      )
    );
    try {
      await cancelOrder(storeId, orderId, reason);
    } catch (err) {
      // Local state already updated
    }
  };

  const handleCreateSampleOrder = async () => {
    const sampleItems = [
      { name: "Phở Bò Tái Nạm (Lớn)", price: 75000, qty: 1, selectedModifiers: [{ name: "Ít bánh" }, { name: "Thêm hành trần" }] },
      { name: "Trà Đào Cam Sả", price: 35000, qty: 2, selectedModifiers: [{ name: "50% Đường" }, { name: "Ít đá" }] },
    ];
    const newOrd = {
      id: `ord_${Date.now()}`,
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      storeId,
      customer: {
        name: "Lê Minh Tuấn",
        phone: "0987654321",
        address: "Tòa nhà Bitexco, Q.1, TP.HCM",
      },
      items: sampleItems,
      subtotal: 145000,
      tax: 11600,
      deliveryFee: 15000,
      discount: 0,
      total: 171600,
      fulfillmentType: "delivery",
      paymentMethod: "vietqr",
      paymentStatus: "paid",
      status: "new",
      createdAt: new Date().toISOString(),
      notes: "Giao trước 12h trưa giúp em ạ.",
    };

    setOrders((prev) => [newOrd, ...prev]);
    if (isSoundEnabled) {
      playOrderChime();
    }

    try {
      await createOrder(newOrd);
    } catch (err) {
      // Local state already updated
    }
  };

  return (
    <section className="sq-orders-container" aria-label="Quản lý đơn hàng">
      {/* Header */}
      <div className="sq-orders-header">
        <div className="sq-orders-title-group">
          <h1 className="sq-orders-title">Đơn hàng</h1>
          {statusCounts.new > 0 && (
            <span className="sq-tab-counter is-new-alert" style={{ fontSize: "13px", padding: "4px 10px" }}>
              🔔 {statusCounts.new} đơn mới
            </span>
          )}
        </div>

        <div className="sq-orders-header-actions">
          {/* Sound Notification Toggle */}
          <button
            type="button"
            className={`sq-btn-sound ${!isSoundEnabled ? "is-muted" : ""}`}
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            title={isSoundEnabled ? "Âm thanh thông báo đang bật" : "Âm thanh thông báo đã tắt"}
          >
            {isSoundEnabled ? "🔔 Chuông: Bật" : "🔕 Chuông: Tắt"}
          </button>

          {/* Table / Kanban View Switcher */}
          <div className="sq-view-switcher">
            <button
              type="button"
              className={`sq-view-switch-btn ${viewMode === "table" ? "is-active" : ""}`}
              onClick={() => setViewMode("table")}
            >
              ☰ Bảng
            </button>
            <button
              type="button"
              className={`sq-view-switch-btn ${viewMode === "kanban" ? "is-active" : ""}`}
              onClick={() => setViewMode("kanban")}
            >
              ⊞ Kanban
            </button>
          </div>

          <button
            type="button"
            className="sq-btn-pill-gray"
            onClick={handleCreateSampleOrder}
            title="Tạo nhanh 1 đơn hàng giả lập để thử nghiệm luồng thông báo và trạng thái"
          >
            + Đơn mẫu
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="sq-orders-tabs-bar">
        {ORDER_TABS.map((tab) => {
          const count = statusCounts[tab.key] || 0;
          const isActive = activeTab === tab.key;
          const isNewAlert = tab.key === "new" && count > 0;

          return (
            <button
              key={tab.key}
              type="button"
              className={`sq-order-tab-btn ${isActive ? "is-active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.label}</span>
              <span className={`sq-tab-counter ${isNewAlert ? "is-new-alert" : ""}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="sq-orders-toolbar">
        <div className="sq-toolbar-left">
          <div className="sq-orders-search-wrap">
            <span style={{ fontSize: "14px", color: "#9ca3af" }}>🔍</span>
            <input
              type="text"
              className="sq-orders-search-input"
              placeholder="Tìm theo mã đơn, khách hàng, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="sq-select-fulfillment"
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
          >
            <option value="all">Tất cả hình thức</option>
            <option value="pickup">Mang về (Pickup)</option>
            <option value="delivery">Giao hàng (Delivery)</option>
          </select>
        </div>

        <div style={{ fontSize: "13.5px", color: "#6b7280" }}>
          Hiển thị <strong>{filteredOrders.length}</strong> đơn hàng
        </div>
      </div>

      {/* View Mode: Table or Kanban */}
      {filteredOrders.length === 0 ? (
        <div className="sq-generic-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📦</div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px 0" }}>
            Không tìm thấy đơn hàng nào
          </h3>
          <p style={{ color: "#6b7280", margin: "0 0 16px 0", fontSize: "14px" }}>
            {orders.length === 0
              ? "Cửa hàng chưa có đơn hàng nào. Khách hàng đặt trên Storefront hoặc bạn có thể tạo đơn mẫu bên dưới."
              : "Không có đơn hàng nào khớp với điều kiện lọc hiện tại."}
          </p>
          {orders.length === 0 && (
            <button
              type="button"
              className="sq-btn-pill-black"
              style={{ margin: "0 auto" }}
              onClick={handleCreateSampleOrder}
            >
              + Tạo đơn hàng mẫu ngay
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        <div className="sq-orders-table-card">
          <table className="sq-orders-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Món ăn</th>
                <th>Hình thức</th>
                <th>Tổng tiền</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusCfg = ORDER_STATUSES[order.status] || ORDER_STATUSES.new;
                const nextStatus = statusCfg.nextStatus;
                const nextLabel = statusCfg.nextLabel;

                const itemsSummary = (order.items || [])
                  .map((i) => `${i.qty}x ${i.name}`)
                  .join(", ");

                const timeStr = new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={order.id} onClick={() => setSelectedOrder(order)}>
                    <td className="sq-table-order-no">{order.orderNumber}</td>
                    <td>
                      <div className="sq-table-customer-name">{order.customer?.name || "Khách lẻ"}</div>
                      {order.customer?.phone && (
                        <div className="sq-table-customer-phone">{order.customer.phone}</div>
                      )}
                    </td>
                    <td>
                      <div className="sq-table-items-summary" title={itemsSummary}>
                        {itemsSummary}
                      </div>
                    </td>
                    <td>
                      <span className="sq-badge-fulfillment">
                        {order.fulfillmentType === "delivery" ? "🛵 Giao hàng" : "🛍️ Mang về"}
                      </span>
                    </td>
                    <td className="sq-table-total-amount">{formatMoney(order.total)}</td>
                    <td style={{ color: "#6b7280", fontSize: "13px" }}>{timeStr}</td>
                    <td>
                      <span
                        className="sq-status-badge"
                        style={{ backgroundColor: statusCfg.bgColor, color: statusCfg.color }}
                      >
                        {statusCfg.label}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        {nextStatus && (
                          <button
                            type="button"
                            className="sq-btn-pill-gray"
                            style={{ fontSize: "12px", padding: "4px 10px" }}
                            onClick={(e) => handleAdvanceStatus(order.id, nextStatus, e)}
                          >
                            ➔ {nextLabel}
                          </button>
                        )}
                        <button
                          type="button"
                          className="sq-btn-pill-gray"
                          style={{ fontSize: "12px", padding: "4px 8px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrintOrder(order);
                          }}
                          title="In hóa đơn"
                        >
                          🖨️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="sq-kanban-board">
          {kanbanColumns.map((col) => {
            const colOrders = filteredOrders.filter((o) => o.status === col.key);

            return (
              <div key={col.key} className="sq-kanban-col">
                <div className="sq-kanban-header">
                  <span style={{ color: col.color }}>{col.title}</span>
                  <span className="sq-tab-counter">{colOrders.length}</span>
                </div>

                <div className="sq-kanban-list">
                  {colOrders.length === 0 ? (
                    <div style={{ padding: "30px 10px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
                      Trống
                    </div>
                  ) : (
                    colOrders.map((order) => {
                      const statusCfg = ORDER_STATUSES[order.status] || ORDER_STATUSES.new;
                      const nextStatus = statusCfg.nextStatus;
                      const nextLabel = statusCfg.nextLabel;

                      const timeStr = new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      const itemsSummary = (order.items || [])
                        .map((i) => `${i.qty}x ${i.name}`)
                        .join(", ");

                      return (
                        <div
                          key={order.id}
                          className="sq-kanban-card"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="sq-kanban-card-top">
                            <span className="sq-kanban-card-order-no">{order.orderNumber}</span>
                            <span style={{ fontSize: "12px", color: "#6b7280" }}>{timeStr}</span>
                          </div>

                          <div className="sq-kanban-card-customer">
                            {order.customer?.name || "Khách lẻ"}
                            {order.customer?.phone && (
                              <span style={{ fontWeight: 400, color: "#6b7280", marginLeft: "6px" }}>
                                ({order.customer.phone})
                              </span>
                            )}
                          </div>

                          <div className="sq-kanban-card-items-desc">{itemsSummary}</div>

                          <div className="sq-kanban-card-bottom">
                            <span className="sq-kanban-card-total">{formatMoney(order.total)}</span>
                            {nextStatus && (
                              <button
                                type="button"
                                className="sq-btn-pill-black"
                                style={{ fontSize: "11.5px", padding: "3px 8px" }}
                                onClick={(e) => handleAdvanceStatus(order.id, nextStatus, e)}
                              >
                                {nextLabel} ➔
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={(orderId, nextStatus) => handleAdvanceStatus(orderId, nextStatus)}
          onCancelOrder={handleCancelOrder}
          onOpenPrint={(order) => setPrintOrder(order)}
        />
      )}

      {/* Receipt Print Modal */}
      {printOrder && (
        <ReceiptPrintModal
          order={printOrder}
          storeName={storeName}
          onClose={() => setPrintOrder(null)}
        />
      )}
    </section>
  );
}
