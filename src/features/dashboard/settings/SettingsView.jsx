import React, { useState } from "react";
import { playNewOrderSound } from "@/util/soundNotification";
import "../items/subviews/Subviews.css";

const DEFAULT_SETTINGS = {
  storeName: "Skipli Roastery & Coffee",
  hotline: "0901234567",
  address: "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
  openHours: "07:00 - 22:30",
  vatRate: 8,
  pricesIncludeTax: true,
  receiptHeader: "SKIPLI COFFEE - CÀ PHÊ PHA PHIN & ĐẶC SẢN",
  receiptFooter: "Cảm ơn quý khách! Hẹn gặp lại quý khách lần sau.",
  wifiName: "Skipli_Coffee_Free",
  wifiPass: "skipli8888",
  printWifiOnReceipt: true,
  soundAlertsEnabled: true,
};

export default function SettingsView() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);

  const handleFieldChange = (field, val) => {
    setSettings((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleTestSound = () => {
    playNewOrderSound();
  };

  return (
    <div className="sq-subview-container">
      <div className="sq-subview-header">
        <div className="sq-subview-title-group">
          <h1>Cài đặt cửa hàng & POS (Settings)</h1>
          <p>Thiết lập thông tin thương hiệu, thuế VAT, mẫu in hóa đơn nhiệt 80mm và âm thanh chuông báo đơn mới.</p>
        </div>
        {isSaved && (
          <div style={{ background: "#ecfdf5", color: "#059669", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "13px" }}>
            ✓ Đã lưu cài đặt thành công!
          </div>
        )}
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Section 1: Store Profile */}
          <div className="sq-subview-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#0f172a" }}>
              1. Hồ sơ cửa hàng & Liên hệ
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="sq-form-field">
                <label className="sq-form-label">Tên thương hiệu / Tên quán *</label>
                <input
                  type="text"
                  className="sq-form-input"
                  value={settings.storeName}
                  onChange={(e) => handleFieldChange("storeName", e.target.value)}
                  required
                />
              </div>

              <div className="sq-form-field">
                <label className="sq-form-label">Số điện thoại hotline *</label>
                <input
                  type="text"
                  className="sq-form-input"
                  value={settings.hotline}
                  onChange={(e) => handleFieldChange("hotline", e.target.value)}
                  required
                />
              </div>

              <div className="sq-form-field">
                <label className="sq-form-label">Địa chỉ cơ sở</label>
                <input
                  type="text"
                  className="sq-form-input"
                  value={settings.address}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                />
              </div>

              <div className="sq-form-field">
                <label className="sq-form-label">Khung giờ mở cửa</label>
                <input
                  type="text"
                  className="sq-form-input"
                  value={settings.openHours}
                  onChange={(e) => handleFieldChange("openHours", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Taxes & VAT */}
          <div className="sq-subview-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#0f172a" }}>
              2. Thuế VAT & Phí dịch vụ
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "center" }}>
              <div className="sq-form-field">
                <label className="sq-form-label">Mức thuế VAT mặc định (%)</label>
                <select
                  className="sq-form-select"
                  value={settings.vatRate}
                  onChange={(e) => handleFieldChange("vatRate", parseFloat(e.target.value) || 0)}
                >
                  <option value={0}>0% (Không áp dụng VAT)</option>
                  <option value={8}>8% (Mức ưu đãi ngành F&B)</option>
                  <option value={10}>10% (Mức tiêu chuẩn)</option>
                </select>
              </div>

              <div className="sq-toggle-wrapper" style={{ marginTop: "14px" }}>
                <div className="sq-toggle-label-wrap">
                  <span className="sq-toggle-title">Giá niêm yết đã bao gồm thuế</span>
                  <span className="sq-toggle-desc">Giá trên menu là giá cuối cùng khách phải trả</span>
                </div>
                <label className="sq-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.pricesIncludeTax)}
                    onChange={(e) => handleFieldChange("pricesIncludeTax", e.target.checked)}
                  />
                  <span className="sq-slider" />
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Receipt 80mm Customization */}
          <div className="sq-subview-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#0f172a" }}>
              3. Mẫu in hóa đơn nhiệt 80mm POS
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="sq-form-field">
                <label className="sq-form-label">Tiêu đề đầu hóa đơn (Header)</label>
                <input
                  type="text"
                  className="sq-form-input"
                  value={settings.receiptHeader}
                  onChange={(e) => handleFieldChange("receiptHeader", e.target.value)}
                />
              </div>

              <div className="sq-form-field">
                <label className="sq-form-label">Lời cảm ơn chân hóa đơn (Footer)</label>
                <input
                  type="text"
                  className="sq-form-input"
                  value={settings.receiptFooter}
                  onChange={(e) => handleFieldChange("receiptFooter", e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="sq-form-field">
                  <label className="sq-form-label">Tên mạng Wifi quán</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    value={settings.wifiName}
                    onChange={(e) => handleFieldChange("wifiName", e.target.value)}
                  />
                </div>
                <div className="sq-form-field">
                  <label className="sq-form-label">Mật khẩu Wifi</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    value={settings.wifiPass}
                    onChange={(e) => handleFieldChange("wifiPass", e.target.value)}
                  />
                </div>
              </div>

              <div className="sq-toggle-wrapper">
                <div className="sq-toggle-label-wrap">
                  <span className="sq-toggle-title">In thông tin Wifi dưới chân hóa đơn</span>
                  <span className="sq-toggle-desc">Giúp khách hàng tiện kết nối internet khi ngồi tại quán</span>
                </div>
                <label className="sq-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.printWifiOnReceipt)}
                    onChange={(e) => handleFieldChange("printWifiOnReceipt", e.target.checked)}
                  />
                  <span className="sq-slider" />
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Sound Alerts */}
          <div className="sq-subview-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#0f172a" }}>
              4. Âm thanh chuông báo đơn mới (Web Audio)
            </h3>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: "14px", color: "#0f172a" }}>Chuông báo Web Audio API</strong>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                  Phát chuông ngân 2-tone (D5 ➔ A5) khi có khách đặt đơn hàng từ Storefront về Dashboard.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                  type="button"
                  className="sq-btn-secondary"
                  onClick={handleTestSound}
                >
                  🔔 Nghe thử chuông
                </button>
                <label className="sq-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.soundAlertsEnabled)}
                    onChange={(e) => handleFieldChange("soundAlertsEnabled", e.target.checked)}
                  />
                  <span className="sq-slider" />
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="sq-btn-primary" style={{ padding: "12px 28px", fontSize: "15px" }}>
              Lưu tất cả cài đặt
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
