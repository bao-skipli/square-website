import React from "react";
import "./CustomersView.css";

export default function CustomerDetailDrawer({ customer, isOpen, onClose, onEdit }) {
  if (!isOpen || !customer) return null;

  return (
    <div className="sq-customer-drawer-overlay" onClick={onClose}>
      <div className="sq-customer-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="sq-customer-drawer-header">
          <div>
            <span className="sq-badge-tag" style={{ marginBottom: "6px" }}>
              Hồ sơ khách hàng
            </span>
            <h2>{customer.name}</h2>
            <div style={{ color: "#64748b", fontSize: "13px", marginTop: "2px" }}>
              {customer.phone || "Chưa có SĐT"} • {customer.group || "Regular"}
            </div>
          </div>
          <button type="button" className="sq-btn-icon-action" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sq-customer-drawer-body">
          {/* Spend stats cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="sq-metric-card">
              <span className="sq-metric-label">Tổng chi tiêu</span>
              <strong className="sq-metric-val">
                {Number(customer.totalSpent || 0).toLocaleString("vi-VN")} đ
              </strong>
            </div>
            <div className="sq-metric-card">
              <span className="sq-metric-label">Số đơn đã đặt</span>
              <strong className="sq-metric-val">{customer.orderCount || 0} đơn</strong>
            </div>
          </div>

          <div className="sq-metric-card" style={{ background: "#f0f7ff", borderColor: "#bfdbfe" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span className="sq-metric-label" style={{ color: "#1d4ed8" }}>
                  Điểm thưởng tích lũy (Loyalty Points)
                </span>
                <strong className="sq-metric-val" style={{ color: "#006aff" }}>
                  ⭐ {customer.loyaltyPoints || 0} điểm
                </strong>
              </div>
              <span style={{ fontSize: "12px", color: "#2563eb" }}>
                = {(customer.loyaltyPoints * 1000).toLocaleString("vi-VN")} đ giảm giá
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="sq-drawer-section">
            <h4 className="sq-drawer-section-title">Thông tin liên hệ</h4>
            <div className="sq-drawer-info-row">
              <span>Số điện thoại:</span>
              <strong>{customer.phone || "—"}</strong>
            </div>
            <div className="sq-drawer-info-row">
              <span>Email:</span>
              <strong>{customer.email || "—"}</strong>
            </div>
            <div className="sq-drawer-info-row">
              <span>Địa chỉ nhận hàng:</span>
              <strong>{customer.address || "—"}</strong>
            </div>
            <div className="sq-drawer-info-row">
              <span>Phân nhóm:</span>
              <span className="sq-badge-tag">{customer.group || "Regular"}</span>
            </div>
          </div>

          {/* Preferences & Notes */}
          <div className="sq-drawer-section">
            <h4 className="sq-drawer-section-title">Ghi chú & Sở thích</h4>
            <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#334155", fontStyle: customer.notes ? "normal" : "italic" }}>
              {customer.notes || "Chưa có ghi chú đặc biệt nào."}
            </div>
          </div>
        </div>

        <div className="sq-customer-drawer-footer">
          <button
            type="button"
            className="sq-btn-secondary"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            type="button"
            className="sq-btn-primary"
            onClick={() => {
              onClose();
              onEdit(customer);
            }}
          >
            Chỉnh sửa thông tin
          </button>
        </div>
      </div>
    </div>
  );
}
