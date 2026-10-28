import React, { useState } from "react";
import { DEFAULT_CHANNELS } from "@/firebase/catalogSettingsService";
import "./Subviews.css";

export default function ChannelsView({ storeName = "Skipli" }) {
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleToggleChannel = (channelId) => {
    const updated = channels.map((ch) => {
      if (ch.id === channelId) {
        const nextStatus = ch.status === "active" ? "inactive" : "active";
        return { ...ch, status: nextStatus };
      }
      return ch;
    });
    setChannels(updated);
  };

  const storeUrl = typeof window !== "undefined"
    ? `${window.location.origin}/online`
    : "https://jobsnow.id.vn";

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(storeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="sq-subview-container">
      <div className="sq-subview-header">
        <div className="sq-subview-title-group">
          <h1>Kênh bán hàng (Sales Channels)</h1>
          <p>Quản lý và kích hoạt các kênh tiếp cận khách hàng: Bán tại quầy (POS), Đặt món trực tuyến và Gọi món qua mã QR tại bàn.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
        {channels.map((ch) => {
          const isActive = ch.status === "active";
          return (
            <div
              key={ch.id}
              className="sq-subview-card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "24px",
                borderTop: isActive ? "4px solid #006aff" : "4px solid #cbd5e1",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
                      {ch.name}
                    </h3>
                    <span
                      className={`sq-subview-badge ${isActive ? "sq-badge-active" : "sq-badge-inactive"}`}
                      style={{ fontSize: "11px" }}
                    >
                      {isActive ? "● Đang hoạt động" : "○ Đang tạm dừng"}
                    </span>
                  </div>

                  <label className="sq-switch">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => handleToggleChannel(ch.id)}
                    />
                    <span className="sq-slider" />
                  </label>
                </div>

                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                  {ch.description}
                </p>
              </div>

              <div style={{ paddingTop: "16px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {ch.type === "storefront" && (
                  <>
                    <a
                      href="/online"
                      target="_blank"
                      rel="noreferrer"
                      className="sq-btn-primary"
                      style={{ textDecoration: "none", fontSize: "12px", padding: "6px 12px" }}
                    >
                      Xem website ↗
                    </a>
                    <button
                      type="button"
                      className="sq-btn-secondary"
                      style={{ fontSize: "12px", padding: "6px 12px" }}
                      onClick={handleCopyLink}
                    >
                      {copiedLink ? "✓ Đã chép link" : "Sao chép link"}
                    </button>
                  </>
                )}

                {ch.type === "qr_table" && (
                  <button
                    type="button"
                    className="sq-btn-primary"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                    onClick={() => setIsQrModalOpen(true)}
                  >
                    Xem & In mã QR để bàn 🖨️
                  </button>
                )}

                {ch.type === "pos" && (
                  <span style={{ fontSize: "12px", color: "#059669", fontWeight: 600 }}>
                    ✓ Đã kết nối với máy in bill & quầy thu ngân
                  </span>
                )}

                {ch.type === "delivery" && (
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Liên hệ hỗ trợ để tích hợp API ứng dụng thứ 3
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isQrModalOpen && (
        <div className="sq-modal-backdrop" onClick={() => setIsQrModalOpen(false)}>
          <div className="sq-modal-panel" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div className="sq-modal-header">
              <h2>Mã QR Đặt món tại bàn</h2>
              <button
                type="button"
                className="sq-modal-close"
                onClick={() => setIsQrModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="sq-modal-body" style={{ alignItems: "center", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                In mã QR này đặt tại các bàn ăn. Khách hàng dùng camera điện thoại quét để mở ngay Menu và đặt món.
              </p>

              <div
                style={{
                  background: "#ffffff",
                  padding: "16px",
                  borderRadius: "16px",
                  border: "2px solid #e2e8f0",
                  display: "inline-block",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(storeUrl)}`}
                  alt="QR Code Gọi Món Tại Bàn"
                  style={{ width: "200px", height: "200px", display: "block" }}
                />
                <div style={{ marginTop: "10px", fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>
                  {storeName.toUpperCase()}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Quét để xem menu & đặt món</div>
              </div>
            </div>

            <div className="sq-modal-footer">
              <button
                type="button"
                className="sq-btn-secondary"
                onClick={() => setIsQrModalOpen(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="sq-btn-primary"
                onClick={() => window.print()}
              >
                In mã QR 🖨️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
