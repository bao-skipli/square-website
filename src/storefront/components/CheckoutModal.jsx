import React, { useState } from "react";
import { formatMoney } from "@/shared/pricing";
import { createOrder } from "@/firebase/orderService";
import { useCart } from "../context/CartContext";

export default function CheckoutModal({ store, isOpen, onClose }) {
  const { items, subtotalCents, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState("pickup"); // "pickup" | "delivery"
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" | "vietqr"
  const [orderNotes, setOrderNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const deliveryFee = fulfillmentType === "delivery" ? 15000 : 0;
  const tax = 0;
  const total = subtotalCents + deliveryFee;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!customerName.trim()) {
      setErrorMessage("Vui lòng nhập họ tên của bạn.");
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage("Vui lòng nhập số điện thoại để nhận đơn.");
      return;
    }
    if (fulfillmentType === "delivery" && !customerAddress.trim()) {
      setErrorMessage("Vui lòng nhập địa chỉ nhận hàng.");
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createOrder({
        storeId: store?.name || "store_skipli",
        customer: {
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
        },
        items: items.map((line) => ({
          itemId: line.itemId,
          name: line.name || line.title || "Món ăn",
          price: Math.round(line.lineTotalCents / (line.qty || 1)),
          qty: line.qty,
          selectedModifiers: (line.selectedModifiers || []).map((m) => ({ name: m.name || m.label || m.modId })),
          notes: line.textValues ? line.textValues.map((t) => `${t.label}: ${t.value}`).join(", ") : "",
        })),
        subtotal: subtotalCents,
        tax,
        deliveryFee,
        total,
        fulfillmentType,
        paymentMethod,
        paymentStatus: "unpaid",
        notes: orderNotes,
      });

      clearCart();
      setCompletedOrder(order);
    } catch (err) {
      console.error("Order submission failed:", err);
      setErrorMessage(`Đặt hàng thất bại: ${err.message || "Vui lòng thử lại"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setCompletedOrder(null);
    onClose();
  };

  return (
    <div className="sf-drawer-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="sf-checkout-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
      >
        {completedOrder ? (
          /* Order Placed Success Screen */
          <div className="sf-checkout-success-view">
            <div className="sf-checkout-success-icon">🎉</div>
            <h2 className="sf-checkout-success-title">Đặt hàng thành công!</h2>
            <p className="sf-checkout-success-order-no">
              Mã đơn hàng của bạn: <strong>{completedOrder.orderNumber}</strong>
            </p>
            <p className="sf-checkout-success-sub">
              Cửa hàng <strong>{store?.name || "Skipli"}</strong> đã nhận được đơn hàng và đang tiến hành chuẩn bị.
            </p>

            <div className="sf-checkout-order-summary-box">
              <div className="sf-checkout-sum-row">
                <span>Hình thức:</span>
                <strong>{fulfillmentType === "delivery" ? "Giao hàng tận nơi" : "Tự đến nhận (Pickup)"}</strong>
              </div>
              <div className="sf-checkout-sum-row">
                <span>Người nhận:</span>
                <span>{completedOrder.customer.name} - {completedOrder.customer.phone}</span>
              </div>
              {completedOrder.customer.address && (
                <div className="sf-checkout-sum-row">
                  <span>Địa chỉ:</span>
                  <span>{completedOrder.customer.address}</span>
                </div>
              )}
              <div className="sf-checkout-sum-row">
                <span>Tổng tiền:</span>
                <strong style={{ color: "#e53e3e", fontSize: "16px" }}>{formatMoney(completedOrder.total)}</strong>
              </div>
              <div className="sf-checkout-sum-row">
                <span>Thanh toán:</span>
                <span>{paymentMethod === "vietqr" ? "Chuyển khoản VietQR khi nhận" : "Tiền mặt khi nhận hàng"}</span>
              </div>
            </div>

            <button type="button" className="sf-btn-checkout-primary" onClick={handleCloseSuccess}>
              Tiếp tục xem thực đơn
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form className="sf-checkout-form" onSubmit={handleSubmitOrder}>
            <div className="sf-checkout-header">
              <h3 className="sf-checkout-title">Xác nhận đơn hàng</h3>
              <button type="button" className="sf-btn-icon-close" onClick={onClose} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="sf-checkout-body">
              {errorMessage && (
                <div className="sf-checkout-error-box">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Fulfillment Type Switcher */}
              <div className="sf-form-group">
                <label className="sf-form-label">Hình thức nhận hàng</label>
                <div className="sf-fulfillment-toggle">
                  <button
                    type="button"
                    className={`sf-toggle-btn ${fulfillmentType === "pickup" ? "is-active" : ""}`}
                    onClick={() => setFulfillmentType("pickup")}
                  >
                    🛍️ Tự đến lấy (Pickup)
                  </button>
                  <button
                    type="button"
                    className={`sf-toggle-btn ${fulfillmentType === "delivery" ? "is-active" : ""}`}
                    onClick={() => setFulfillmentType("delivery")}
                  >
                    🛵 Giao hàng (+15.000đ)
                  </button>
                </div>
              </div>

              {/* Customer Information */}
              <div className="sf-form-group">
                <label className="sf-form-label">Họ và tên *</label>
                <input
                  type="text"
                  className="sf-form-input"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="sf-form-group">
                <label className="sf-form-label">Số điện thoại *</label>
                <input
                  type="tel"
                  className="sf-form-input"
                  placeholder="Ví dụ: 0901234567"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>

              {fulfillmentType === "delivery" && (
                <div className="sf-form-group">
                  <label className="sf-form-label">Địa chỉ giao hàng chi tiết *</label>
                  <input
                    type="text"
                    className="sf-form-input"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Payment Method */}
              <div className="sf-form-group">
                <label className="sf-form-label">Phương thức thanh toán</label>
                <div className="sf-payment-options">
                  <label className={`sf-radio-card ${paymentMethod === "cod" ? "is-selected" : ""}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <div>
                      <strong>💵 Tiền mặt khi nhận</strong>
                      <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#666" }}>
                        Thanh toán trực tiếp cho nhân viên khi nhận món
                      </p>
                    </div>
                  </label>

                  <label className={`sf-radio-card ${paymentMethod === "vietqr" ? "is-selected" : ""}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vietqr"
                      checked={paymentMethod === "vietqr"}
                      onChange={() => setPaymentMethod("vietqr")}
                    />
                    <div>
                      <strong>📲 Chuyển khoản VietQR</strong>
                      <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#666" }}>
                        Quét mã QR qua app ngân hàng
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="sf-form-group">
                <label className="sf-form-label">Ghi chú cho quán (Tùy chọn)</label>
                <input
                  type="text"
                  className="sf-form-input"
                  placeholder="Ví dụ: Lấy nhiều ớt, không hành..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>

              {/* Order Breakdown */}
              <div className="sf-checkout-breakdown">
                <h4 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>Tóm tắt đơn hàng ({items.length} món)</h4>
                <div className="sf-breakdown-row">
                  <span>Tạm tính món ăn:</span>
                  <span>{formatMoney(subtotalCents)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="sf-breakdown-row">
                    <span>Phí giao hàng:</span>
                    <span>{formatMoney(deliveryFee)}</span>
                  </div>
                )}
                <div className="sf-breakdown-row sf-breakdown-total">
                  <span>Tổng thanh toán:</span>
                  <span style={{ color: "var(--sf-theme-primary, #e53e3e)" }}>{formatMoney(total)}</span>
                </div>
              </div>
            </div>

            <div className="sf-checkout-footer">
              <button
                type="submit"
                className="sf-btn-checkout-primary"
                disabled={isSubmitting || items.length === 0}
              >
                {isSubmitting ? "Đang gửi đơn hàng..." : `Đặt hàng • ${formatMoney(total)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
