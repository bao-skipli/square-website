import React, { useState, useEffect } from "react";
import { playNewOrderSound } from "@/util/soundNotification";
import "./TakePaymentModal.css";

const PRESET_AMOUNTS = [30000, 45000, 65000, 100000, 200000, 500000];

export default function TakePaymentModal({
  isOpen,
  onClose,
  storeName = "Skipli Roastery & Coffee",
  items = [],
}) {
  const [amount, setAmount] = useState(45000);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash"); // 'cash' | 'vietqr' | 'card'
  const [cashTendered, setCashTendered] = useState(50000);
  const [orderNote, setOrderNote] = useState("Thanh toán nhanh tại quầy");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setAmount(45000);
      setCashTendered(50000);
      setCompletedOrder(null);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const changeDue = Math.max(0, cashTendered - amount);

  const handlePresetAmount = (val) => {
    setAmount(val);
    if (cashTendered < val) {
      setCashTendered(val);
    }
  };

  const handleAddItemToCharge = (item) => {
    const raw = item.price ? Number(String(item.price).replace(/[^0-9]/g, "")) : 0;
    const itemPrice = raw > 0 ? (raw < 1000 ? raw * 25000 : raw) : 45000;
    setAmount((prev) => prev + itemPrice);
  };

  const handleConfirmPayment = () => {
    if (amount <= 0) return;
    setIsProcessing(true);

    const orderData = {
      id: `ord_${Date.now().toString().slice(-6)}`,
      orderType: "dine-in",
      channel: "pos_quick_charge",
      customer: {
        name: customerName.trim() || "Khách lẻ tại quầy",
        phone: customerPhone.trim() || "0900000000",
        address: "Tại quầy POS",
      },
      items: [
        {
          name: "Thanh toán nhanh POS (Quick Charge)",
          qty: 1,
          price: amount,
          notes: orderNote,
        },
      ],
      total: amount,
      subtotal: amount,
      paymentMethod: paymentMethod === "vietqr" ? "vietqr" : paymentMethod === "card" ? "card" : "cash",
      paymentStatus: "paid",
      status: "COMPLETED",
      notes: orderNote,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setCompletedOrder(orderData);
      playNewOrderSound();
      setIsProcessing(false);
    }, 300);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="sq-take-pay-overlay" onClick={onClose}>
      <div
        className="sq-take-pay-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="sq-take-pay-header">
          <div>
            <h2 className="sq-take-pay-title">Thu tiền nhanh (Take Payment / POS Terminal)</h2>
            <p className="sq-take-pay-subtitle">{storeName} • Quầy thu ngân</p>
          </div>
          <button type="button" className="sq-take-pay-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* If Order is already completed -> show receipt card */}
        {completedOrder ? (
          <div className="sq-take-pay-success-body">
            <div className="sq-success-icon-wrap">✓</div>
            <h3 className="sq-success-title">Thu tiền thành công!</h3>
            <p className="sq-success-desc">
              Mã giao dịch: <strong>#{completedOrder.id}</strong> •{" "}
              {completedOrder.paymentMethod === "cash"
                ? "Tiền mặt"
                : completedOrder.paymentMethod === "vietqr"
                ? "Chuyển khoản VietQR"
                : "Thẻ ngân hàng POS"}
            </p>

            <div className="sq-success-receipt-box">
              <div className="sq-receipt-row">
                <span>Số tiền thanh toán:</span>
                <strong className="sq-receipt-price">{amount.toLocaleString("vi-VN")}đ</strong>
              </div>
              {completedOrder.paymentMethod === "cash" && (
                <>
                  <div className="sq-receipt-row">
                    <span>Khách đưa:</span>
                    <span>{cashTendered.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="sq-receipt-row sq-receipt-highlight">
                    <span>Tiền thối lại:</span>
                    <strong>{changeDue.toLocaleString("vi-VN")}đ</strong>
                  </div>
                </>
              )}
              <div className="sq-receipt-row">
                <span>Khách hàng:</span>
                <span>{completedOrder.customer?.name} ({completedOrder.customer?.phone})</span>
              </div>
            </div>

            <div className="sq-success-actions">
              <button
                type="button"
                className="sq-btn-print-receipt"
                onClick={handlePrint}
              >
                🖨️ In hóa đơn 80mm
              </button>
              <button
                type="button"
                className="sq-btn-new-charge"
                onClick={() => {
                  setCompletedOrder(null);
                  setAmount(45000);
                }}
              >
                + Thu giao dịch mới
              </button>
              <button
                type="button"
                className="sq-btn-close-modal"
                onClick={onClose}
              >
                Hoàn tất & Đóng
              </button>
            </div>
          </div>
        ) : (
          /* Payment Entry Form */
          <div className="sq-take-pay-content">
            <div className="sq-take-pay-left">
              {/* Charge Amount Display */}
              <div className="sq-amount-card">
                <span className="sq-amount-label">Số tiền cần thu</span>
                <div className="sq-amount-input-row">
                  <input
                    type="number"
                    className="sq-amount-input"
                    value={amount}
                    min="1000"
                    step="1000"
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  />
                  <span className="sq-amount-currency">VNĐ</span>
                </div>

                {/* Preset Chips */}
                <div className="sq-preset-chips">
                  {PRESET_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      className={`sq-chip-btn ${amount === val ? "is-selected" : ""}`}
                      onClick={() => handlePresetAmount(val)}
                    >
                      {(val / 1000).toLocaleString()}k
                    </button>
                  ))}
                  <button
                    type="button"
                    className="sq-chip-btn sq-chip-reset"
                    onClick={() => setAmount(0)}
                  >
                    Xóa
                  </button>
                </div>
              </div>

              {/* Quick Item Picker */}
              {items && items.length > 0 && (
                <div className="sq-quick-items-section">
                  <span className="sq-section-sub">Chọn nhanh món trong thực đơn (+ cộng tiền):</span>
                  <div className="sq-quick-items-scroll">
                    {items.slice(0, 8).map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        className="sq-quick-item-btn"
                        onClick={() => handleAddItemToCharge(it)}
                      >
                        <span className="sq-quick-item-name">{it.name}</span>
                        <span className="sq-quick-item-price">{it.price || "45.000đ"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer info */}
              <div className="sq-pay-customer-row">
                <input
                  type="text"
                  className="sq-form-input sq-input-flex"
                  placeholder="Tên khách hàng (tùy chọn)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <input
                  type="tel"
                  className="sq-form-input sq-input-flex"
                  placeholder="Số điện thoại CRM"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              <input
                type="text"
                className="sq-form-input"
                placeholder="Ghi chú đơn (ví dụ: Bàn 3, mang về...)"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
              />
            </div>

            {/* Right: Payment Method Selector & Confirmation */}
            <div className="sq-take-pay-right">
              <span className="sq-section-sub">Phương thức thanh toán:</span>

              <div className="sq-method-tabs">
                <button
                  type="button"
                  className={`sq-method-tab ${paymentMethod === "cash" ? "is-active" : ""}`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  💵 Tiền mặt
                </button>
                <button
                  type="button"
                  className={`sq-method-tab ${paymentMethod === "vietqr" ? "is-active" : ""}`}
                  onClick={() => setPaymentMethod("vietqr")}
                >
                  📱 VietQR 247
                </button>
                <button
                  type="button"
                  className={`sq-method-tab ${paymentMethod === "card" ? "is-active" : ""}`}
                  onClick={() => setPaymentMethod("card")}
                >
                  💳 Thẻ POS
                </button>
              </div>

              {/* Cash Sub-panel */}
              {paymentMethod === "cash" && (
                <div className="sq-method-panel">
                  <div className="sq-form-field">
                    <label className="sq-form-label">Tiền khách đưa:</label>
                    <input
                      type="number"
                      className="sq-form-input sq-cash-tendered-input"
                      value={cashTendered}
                      step="1000"
                      onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="sq-cash-change-box">
                    <span>Tiền thối lại khách:</span>
                    <strong className="sq-change-number">
                      {changeDue.toLocaleString("vi-VN")}đ
                    </strong>
                  </div>
                </div>
              )}

              {/* VietQR Sub-panel */}
              {paymentMethod === "vietqr" && (
                <div className="sq-method-panel sq-vietqr-panel">
                  <p className="sq-qr-instruction">Quét mã VietQR thanh toán tự động:</p>
                  <img
                    src={`https://img.vietqr.io/image/970436-0123456789-compact.png?amount=${amount}&addInfo=${encodeURIComponent("POS " + (customerName || "ORDER"))}`}
                    alt="VietQR code"
                    className="sq-vietqr-code-img"
                  />
                  <span className="sq-qr-subtext">NAPAS 24/7 • Vietcombank</span>
                </div>
              )}

              {/* Card Sub-panel */}
              {paymentMethod === "card" && (
                <div className="sq-method-panel sq-card-panel">
                  <div className="sq-card-tap-box">
                    <span className="sq-card-icon">💳</span>
                    <p>Chạm hoặc cắm thẻ Visa / Mastercard / Napas vào thiết bị quẹt thẻ Square Reader.</p>
                  </div>
                </div>
              )}

              {/* Confirm Charge Button */}
              <button
                type="button"
                className="sq-btn-submit-charge"
                disabled={amount <= 0 || isProcessing}
                onClick={handleConfirmPayment}
              >
                {isProcessing
                  ? "Đang xác nhận..."
                  : `Xác nhận thu ${amount.toLocaleString("vi-VN")}đ`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
