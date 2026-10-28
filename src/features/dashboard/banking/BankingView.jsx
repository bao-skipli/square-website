import React, { useState } from "react";
import "../items/subviews/Subviews.css";

const VIETNAM_BANKS = [
  { bin: "970436", shortName: "Vietcombank", name: "Ngân hàng TMCP Ngoại Thương Việt Nam" },
  { bin: "970422", shortName: "MB Bank", name: "Ngân hàng TMCP Quân Đội" },
  { bin: "970407", shortName: "Techcombank", name: "Ngân hàng TMCP Kỹ Thương Việt Nam" },
  { bin: "970432", shortName: "VPBank", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng" },
  { bin: "970416", shortName: "ACB", name: "Ngân hàng TMCP Á Châu" },
  { bin: "970418", shortName: "BIDV", name: "Ngân hàng TMCP Đầu Tư và Phát Triển Việt Nam" },
  { bin: "970405", shortName: "Agribank", name: "Ngân hàng Nông Nghiệp & Phát Triển Nông Thôn" },
  { bin: "970423", shortName: "TPBank", name: "Ngân hàng TMCP Tiên Phong" },
];

const DEFAULT_BANKING = {
  bankBin: "970436",
  bankShortName: "Vietcombank",
  accountNumber: "0123456789",
  accountName: "NGUYEN TRONG BAO",
  isVietQrActive: true,
  dailySettlementEnabled: true,
};

export default function BankingView() {
  const [banking, setBanking] = useState(DEFAULT_BANKING);
  const [isSaved, setIsSaved] = useState(false);

  const handleFieldChange = (field, val) => {
    setBanking((prev) => ({ ...prev, [field]: val }));
  };

  const handleBankSelect = (e) => {
    const selectedBin = e.target.value;
    const bankObj = VIETNAM_BANKS.find((b) => b.bin === selectedBin);
    setBanking((prev) => ({
      ...prev,
      bankBin: selectedBin,
      bankShortName: bankObj ? bankObj.shortName : "Bank",
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const qrImageUrl = `https://img.vietqr.io/image/${banking.bankBin || "970436"}-${banking.accountNumber || "0000"}-compact.png?accountName=${encodeURIComponent(banking.accountName || "CHU TAI KHOAN")}`;

  return (
    <div className="sq-subview-container">
      <div className="sq-subview-header">
        <div className="sq-subview-title-group">
          <h1>Tài khoản ngân hàng & VietQR (Banking & Payouts)</h1>
          <p>Cài đặt tài khoản ngân hàng nhận tiền chuyển khoản tự động, tạo mã VietQR chuẩn NAPAS 247 để bàn và lúc khách thanh toán online.</p>
        </div>
        {isSaved && (
          <div style={{ background: "#ecfdf5", color: "#059669", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "13px" }}>
            ✓ Đã lưu cài đặt ngân hàng!
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Form Settings */}
        <div className="sq-subview-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#0f172a" }}>
            Thông tin tài khoản thụ hưởng
          </h3>

          <form onSubmit={handleSave}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="sq-form-field">
                <label className="sq-form-label">Chọn ngân hàng *</label>
                <select
                  className="sq-form-select"
                  value={banking.bankBin || "970436"}
                  onChange={handleBankSelect}
                >
                  {VIETNAM_BANKS.map((b) => (
                    <option key={b.bin} value={b.bin}>
                      {b.shortName} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sq-form-field">
                <label className="sq-form-label">Số tài khoản ngân hàng *</label>
                <input
                  type="text"
                  className="sq-form-input"
                  placeholder="Nhập số tài khoản..."
                  value={banking.accountNumber}
                  onChange={(e) => handleFieldChange("accountNumber", e.target.value.replace(/\s/g, ""))}
                  required
                />
              </div>

              <div className="sq-form-field">
                <label className="sq-form-label">Tên chủ tài khoản (Viết hoa không dấu) *</label>
                <input
                  type="text"
                  className="sq-form-input"
                  placeholder="Ví dụ: NGUYEN VAN A"
                  value={banking.accountName}
                  onChange={(e) => handleFieldChange("accountName", e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="sq-toggle-wrapper">
                <div className="sq-toggle-label-wrap">
                  <span className="sq-toggle-title">Bật thanh toán VietQR trên Storefront</span>
                  <span className="sq-toggle-desc">Tự động sinh mã VietQR kèm số tiền khi khách chọn phương thức chuyển khoản lúc đặt món</span>
                </div>
                <label className="sq-switch">
                  <input
                    type="checkbox"
                    checked={Boolean(banking.isVietQrActive)}
                    onChange={(e) => handleFieldChange("isVietQrActive", e.target.checked)}
                  />
                  <span className="sq-slider" />
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                <button type="submit" className="sq-btn-primary">
                  Lưu cấu hình ngân hàng
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* QR Preview Card */}
        <div className="sq-subview-card" style={{ padding: "24px", textAlign: "center" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a" }}>
            Mã VietQR NAPAS 247 để bàn
          </h3>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 16px 0" }}>
            Khách hàng có thể dùng bất kỳ ứng dụng Mobile Banking nào để quét chuyển khoản trực tiếp.
          </p>

          <div
            style={{
              background: "#ffffff",
              padding: "16px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              display: "inline-block",
            }}
          >
            <img
              src={qrImageUrl}
              alt="VietQR Chuyển khoản"
              style={{ width: "220px", height: "auto", display: "block", margin: "0 auto" }}
            />
            <div style={{ marginTop: "12px", fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>
              {banking.accountName || "CHỦ TÀI KHOẢN"}
            </div>
            <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600 }}>
              {banking.bankShortName} • {banking.accountNumber}
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              type="button"
              className="sq-btn-secondary"
              onClick={() => window.print()}
            >
              In mã VietQR để quầy thu ngân 🖨️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
