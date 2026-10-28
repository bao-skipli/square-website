import React, { useState } from "react";
import { formatMoney } from "@/shared/pricing";
import { ORDER_STATUSES, FULFILLMENT_LABELS, PAYMENT_METHOD_LABELS } from "./orderConstants";

export default function OrderDetailDrawer({
  order,
  onClose,
  onUpdateStatus,
  onCancelOrder,
  onOpenPrint,
}) {
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.new;
  const nextStatus = statusConfig.nextStatus;
  const nextLabel = statusConfig.nextLabel;

  const formattedDate = new Date(order.createdAt).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleAdvanceStatus = async () => {
    if (!nextStatus) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmCancel = async () => {
    setIsUpdating(true);
    try {
      await onCancelOrder(order.id, cancelReason);
      setIsCancelConfirmOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="sq-drawer-overlay" onClick={onClose}>
      <div className="sq-drawer-right sq-order-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sq-order-drawer-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 className="sq-order-drawer-title">{order.orderNumber}</h2>
              <span
                className="sq-status-badge"
                style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="sq-order-drawer-subtitle">{formattedDate}</p>
          </div>
          <button type="button" className="sq-btn-icon-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="sq-order-drawer-content">
          {/* Quick Actions Bar */}
          <div className="sq-order-action-bar">
            {nextStatus && (
              <button
                type="button"
                className="sq-btn-primary sq-btn-advance"
                onClick={handleAdvanceStatus}
                disabled={isUpdating}
              >
                {isUpdating ? "Đang xử lý..." : `➔ ${nextLabel}`}
              </button>
            )}

            <button
              type="button"
              className="sq-btn-pill-gray"
              onClick={() => onOpenPrint(order)}
              title="In hóa đơn bán hàng"
            >
              🖨️ In bill
            </button>

            {order.status !== "cancelled" && order.status !== "completed" && (
              <button
                type="button"
                className="sq-btn-pill-danger"
                onClick={() => setIsCancelConfirmOpen(true)}
                disabled={isUpdating}
              >
                Hủy đơn
              </button>
            )}
          </div>

          {/* Customer & Fulfillment Info */}
          <div className="sq-order-card-section">
            <h3 className="sq-section-title">Thông tin giao nhận</h3>
            <div className="sq-info-grid">
              <div className="sq-info-item">
                <span className="sq-info-label">Hình thức:</span>
                <span className="sq-info-val">
                  <strong>{FULFILLMENT_LABELS[order.fulfillmentType] || order.fulfillmentType}</strong>
                </span>
              </div>
              <div className="sq-info-item">
                <span className="sq-info-label">Khách hàng:</span>
                <span className="sq-info-val">{order.customer?.name || "Khách lẻ"}</span>
              </div>
              {order.customer?.phone && (
                <div className="sq-info-item">
                  <span className="sq-info-label">Số điện thoại:</span>
                  <a href={`tel:${order.customer.phone}`} className="sq-info-link">
                    📞 {order.customer.phone}
                  </a>
                </div>
              )}
              {order.customer?.address && (
                <div className="sq-info-item" style={{ gridColumn: "span 2" }}>
                  <span className="sq-info-label">Địa chỉ nhận hàng:</span>
                  <span className="sq-info-val">📍 {order.customer.address}</span>
                </div>
              )}
              {order.notes && (
                <div className="sq-info-item sq-notes-box" style={{ gridColumn: "span 2" }}>
                  <span className="sq-info-label">Ghi chú của khách:</span>
                  <p className="sq-notes-text">"{order.notes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="sq-order-card-section">
            <h3 className="sq-section-title">Danh sách món ({(order.items || []).length})</h3>
            <div className="sq-order-items-list">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="sq-order-item-row">
                  <div className="sq-order-item-qty">{item.qty}x</div>
                  <div className="sq-order-item-info">
                    <span className="sq-order-item-name">{item.name}</span>
                    {item.modifiers && item.modifiers.length > 0 && (
                      <span className="sq-order-item-mods">
                        + {item.modifiers.join(", ")}
                      </span>
                    )}
                    {item.notes && (
                      <span className="sq-order-item-note">Ghi chú: {item.notes}</span>
                    )}
                  </div>
                  <div className="sq-order-item-price">
                    {formatMoney(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Totals */}
          <div className="sq-order-card-section">
            <h3 className="sq-section-title">Thanh toán</h3>
            <div className="sq-payment-summary">
              <div className="sq-pay-row">
                <span>Phương thức:</span>
                <strong>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</strong>
              </div>
              <div className="sq-pay-row">
                <span>Trạng thái:</span>
                <span className={order.paymentStatus === "paid" ? "sq-tag-paid" : "sq-tag-unpaid"}>
                  {order.paymentStatus === "paid" ? "✓ Đã thanh toán" : "Chưa thanh toán"}
                </span>
              </div>
              <hr className="sq-divider" />
              <div className="sq-pay-row">
                <span>Tạm tính:</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="sq-pay-row sq-text-green">
                  <span>Giảm giá:</span>
                  <span>-{formatMoney(order.discount)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="sq-pay-row">
                  <span>Thuế (VAT):</span>
                  <span>{formatMoney(order.tax)}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className="sq-pay-row">
                  <span>Phí giao hàng:</span>
                  <span>{formatMoney(order.deliveryFee)}</span>
                </div>
              )}
              <div className="sq-pay-row sq-pay-total">
                <span>Tổng đơn:</span>
                <span>{formatMoney(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Cancellation Info (if cancelled) */}
          {order.status === "cancelled" && (
            <div className="sq-order-card-section sq-cancelled-box">
              <h4 style={{ color: "#dc2626", margin: "0 0 6px 0" }}>Đơn hàng đã bị hủy</h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
                Lý do: {order.cancelReason || "Không có lý do"}
              </p>
            </div>
          )}
        </div>

        {/* Cancel Confirmation Dialog */}
        {isCancelConfirmOpen && (
          <div className="sq-modal-overlay" style={{ zIndex: 1000 }} onClick={() => setIsCancelConfirmOpen(false)}>
            <div className="sq-modal-card" style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: "0 0 8px 0" }}>Xác nhận hủy đơn hàng</h3>
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "12px" }}>
                Vui lòng nhập lý do hủy đơn {order.orderNumber}:
              </p>
              <input
                type="text"
                className="sq-form-input"
                placeholder="Ví dụ: Quán hết món, Khách đổi ý..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                autoFocus
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                <button
                  type="button"
                  className="sq-btn-pill-gray"
                  onClick={() => setIsCancelConfirmOpen(false)}
                >
                  Bỏ qua
                </button>
                <button
                  type="button"
                  className="sq-btn-pill-danger"
                  onClick={handleConfirmCancel}
                  disabled={isUpdating}
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
