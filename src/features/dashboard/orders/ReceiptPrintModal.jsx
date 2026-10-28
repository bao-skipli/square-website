import React from "react";
import { formatMoney } from "@/shared/pricing";
import { FULFILLMENT_LABELS, PAYMENT_METHOD_LABELS } from "./orderConstants";

export default function ReceiptPrintModal({ order, storeName = "Skipli", onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="sq-modal-overlay" onClick={onClose}>
      <div className="sq-modal-card sq-receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sq-receipt-modal-actions no-print">
          <button type="button" className="sq-btn-pill-gray" onClick={onClose}>
            Đóng
          </button>
          <button type="button" className="sq-btn-pill-black" onClick={handlePrint}>
            🖨️ In hóa đơn
          </button>
        </div>

        {/* Printable Thermal Receipt (80mm width) */}
        <div className="sq-thermal-receipt" id="printable-receipt">
          <div className="sq-receipt-header">
            <h2 className="sq-receipt-store">{storeName.toUpperCase()}</h2>
            <p className="sq-receipt-sub">HÓA ĐƠN BÁN HÀNG</p>
            <p className="sq-receipt-order-no">{order.orderNumber}</p>
            <p className="sq-receipt-date">{formattedDate}</p>
          </div>

          <div className="sq-receipt-divider" />

          <div className="sq-receipt-customer-info">
            <div className="sq-receipt-row">
              <span>Hình thức:</span>
              <strong>{FULFILLMENT_LABELS[order.fulfillmentType] || order.fulfillmentType}</strong>
            </div>
            <div className="sq-receipt-row">
              <span>Khách hàng:</span>
              <strong>{order.customer?.name || "Khách lẻ"}</strong>
            </div>
            {order.customer?.phone && (
              <div className="sq-receipt-row">
                <span>Số điện thoại:</span>
                <span>{order.customer.phone}</span>
              </div>
            )}
            {order.customer?.address && (
              <div className="sq-receipt-row">
                <span>Địa chỉ:</span>
                <span>{order.customer.address}</span>
              </div>
            )}
            {order.notes && (
              <div className="sq-receipt-row sq-receipt-notes">
                <span>Ghi chú:</span>
                <em>{order.notes}</em>
              </div>
            )}
          </div>

          <div className="sq-receipt-divider" />

          <table className="sq-receipt-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Tên món</th>
                <th style={{ textAlign: "center", width: "40px" }}>SL</th>
                <th style={{ textAlign: "right", width: "80px" }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => (
                <React.Fragment key={idx}>
                  <tr className="sq-receipt-item-row">
                    <td className="sq-receipt-item-name">{item.name}</td>
                    <td style={{ textAlign: "center" }}>{item.qty}</td>
                    <td style={{ textAlign: "right" }}>{formatMoney(item.price * item.qty)}</td>
                  </tr>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <tr className="sq-receipt-modifier-row">
                      <td colSpan={3} className="sq-receipt-modifiers">
                        + {item.modifiers.join(", ")}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          <div className="sq-receipt-divider" />

          <div className="sq-receipt-totals">
            <div className="sq-receipt-row">
              <span>Tạm tính:</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="sq-receipt-row">
                <span>Giảm giá:</span>
                <span>-{formatMoney(order.discount)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="sq-receipt-row">
                <span>Thuế (VAT):</span>
                <span>{formatMoney(order.tax)}</span>
              </div>
            )}
            {order.deliveryFee > 0 && (
              <div className="sq-receipt-row">
                <span>Phí giao hàng:</span>
                <span>{formatMoney(order.deliveryFee)}</span>
              </div>
            )}
            <div className="sq-receipt-divider-dashed" />
            <div className="sq-receipt-row sq-receipt-grand-total">
              <span>TỔNG CỘNG:</span>
              <span>{formatMoney(order.total)}</span>
            </div>
            <div className="sq-receipt-row" style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
              <span>Thanh toán:</span>
              <span>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod} ({order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"})</span>
            </div>
          </div>

          <div className="sq-receipt-footer">
            <p>Cảm ơn quý khách và hẹn gặp lại!</p>
            <p className="sq-receipt-barcode">*{order.orderNumber}*</p>
          </div>
        </div>
      </div>
    </div>
  );
}
