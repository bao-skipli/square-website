import React from "react";
import "../items/subviews/Subviews.css";

const RELEASES = [
  {
    version: "v2.5",
    date: "Hôm nay",
    title: "Triển khai đầy đủ toàn bộ hệ sinh thái Dashboard Square POS",
    badge: "Mới nhất",
    features: [
      "Quản lý Đơn hàng (Orders) Realtime: Kanban Board, Bảng danh sách, Chuông báo Web Audio ngân 2-tone, In phiếu nhiệt 80mm POS.",
      "Tùy chọn món (Item Options): Tạo nhóm Size, Lượng đá, Độ ngọt áp dụng nhanh.",
      "Đơn vị đo lường (Units): Quản lý Ly, Cốc, Phần, Kg, Lít cho toàn bộ thư viện.",
      "Thực đơn theo ca (Menus): Tự động đổi menu Sáng, Trưa, Tối, Happy Hour theo giờ thực tế.",
      "Cài đặt Bếp (Kitchen Settings): Phân luồng trạm Bar, Bếp nóng, máy in vé bếp.",
      "Khách hàng CRM: Danh bạ, chi tiêu trọn đời, chương trình tích điểm thưởng Loyalty.",
      "Báo cáo & Doanh thu: Biểu đồ SVG theo ngày, Top 10 món bán chạy, cơ cấu thanh toán.",
      "Ngân hàng & VietQR: Tạo mã QR NAPAS 247 để bàn và quét trả tiền khi checkout.",
    ],
  },
  {
    version: "v2.3",
    date: "Gần đây",
    title: "Cổng thanh toán & Đặt hàng Storefront hoàn chỉnh",
    badge: "Đã ổn định",
    features: [
      "Kết nối giỏ hàng Storefront với Modal đặt hàng trực tuyến.",
      "Tùy chọn nhận hàng Mang về (Pickup) hoặc Giao tận nơi (Delivery).",
      "Thanh toán Tiền mặt COD hoặc quét mã VietQR tự động.",
    ],
  },
  {
    version: "v2.0",
    date: "Trước đó",
    title: "Tích hợp tên miền riêng & CDN Bunny.net tự động",
    badge: "Hạ tầng",
    features: [
      "Quét sâu bản ghi DNS từ Mắt Bão / Nhà cung cấp tên miền.",
      "Tự động lọc bản ghi xung đột và đưa bản ghi an toàn sang Bunny.net DNS.",
      "Đẩy code lên Bunny Storage và cấu hình Pull Zone CDN trong 1 click.",
    ],
  },
];

export default function WhatsNewView() {
  return (
    <div className="sq-subview-container">
      <div className="sq-subview-header">
        <div className="sq-subview-title-group">
          <h1>Có gì mới? (What's New & Updates)</h1>
          <p>Nhật ký cập nhật các tính năng mới nhất trên hệ thống Square POS & Cửa hàng trực tuyến.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {RELEASES.map((rel, idx) => (
          <div key={idx} className="sq-subview-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#006aff" }}>{rel.version}</span>
                <span className="sq-badge-tag">{rel.date}</span>
                <span className="sq-subview-badge sq-badge-active" style={{ fontSize: "11px" }}>
                  {rel.badge}
                </span>
              </div>
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 12px 0", color: "#0f172a" }}>
              {rel.title}
            </h3>

            <ul style={{ margin: 0, paddingLeft: "20px", color: "#334155", fontSize: "13px", lineHeight: "1.8" }}>
              {rel.features.map((feat, fIdx) => (
                <li key={fIdx}>{feat}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
