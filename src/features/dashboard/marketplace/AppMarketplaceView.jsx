import React, { useState } from "react";
import "../items/subviews/Subviews.css";
import "./AppMarketplaceView.css";

const MARKETPLACE_APPS = [
  {
    id: "app-kds",
    title: "Square KDS (Màn hình Bếp điện tử)",
    developer: "Square Official",
    category: "kitchen",
    badge: "Phổ biến",
    description:
      "Biến máy tính bảng thành màn hình trạm bếp và quầy bar. Tự động hiển thị đơn theo thời gian thực, rung chuông báo khi có món mới.",
    price: "Miễn phí",
    iconColor: "#059669",
    iconLetter: "K",
    defaultInstalled: true,
  },
  {
    id: "app-loyalty-pro",
    title: "Chương trình Hội viên Loyalty Pro",
    developer: "Skipli Ecosystem",
    category: "marketing",
    badge: "Được khuyên dùng",
    description:
      "Tích lũy điểm thưởng đa tầng (Thẻ Bạc, Vàng, Kim Cương), tự động tặng voucher giảm giá ngày sinh nhật qua SMS/Zalo.",
    price: "99.000đ/tháng",
    iconColor: "#7c3aed",
    iconLetter: "L",
    defaultInstalled: true,
  },
  {
    id: "app-zns-marketing",
    title: "Zalo ZNS & SMS CSKH Tự Động",
    developer: "Zalo Cloud Connect",
    category: "marketing",
    badge: "Hot",
    description:
      "Gửi thông báo mã đơn hàng, xác nhận nhận hàng và ưu đãi qua Zalo ZNS được Bộ Thông tin & Truyền thông phê duyệt.",
    price: "150.000đ/tháng",
    iconColor: "#0284c7",
    iconLetter: "Z",
    defaultInstalled: false,
  },
  {
    id: "app-einvoice",
    title: "Hóa đơn điện tử M-Invoice & Viettel",
    developer: "Viettel Cyber",
    category: "finance",
    badge: "Chuẩn VAT",
    description:
      "Phát hành hóa đơn điện tử có mã của cơ quan Thuế theo Nghị định 123 ngay khi bấm thanh toán đơn hàng trên POS.",
    price: "Miễn phí tích hợp",
    iconColor: "#ea580c",
    iconLetter: "E",
    defaultInstalled: false,
  },
  {
    id: "app-label-print",
    title: "In tem nhãn dán ly (Label Barcode)",
    developer: "Square Official",
    category: "pos",
    badge: "Cà phê & Trà sữa",
    description:
      "In tem nhãn sticker nhiệt 50x30mm dán trực tiếp lên ly cốc: Tên khách hàng, % đường, % đá, ghi chú đặc biệt.",
    price: "Miễn phí",
    iconColor: "#4f46e5",
    iconLetter: "P",
    defaultInstalled: true,
  },
  {
    id: "app-accounting-misa",
    title: "Đồng bộ Kế toán MISA & KiotViet",
    developer: "MISA JSC",
    category: "finance",
    badge: "Tự động hóa",
    description:
      "Tự động hạch toán sổ quỹ tiền mặt, doanh thu chuyển khoản ngân hàng và kiểm kê định mức xuất kho nguyên vật liệu cuối ngày.",
    price: "199.000đ/tháng",
    iconColor: "#0d9488",
    iconLetter: "M",
    defaultInstalled: false,
  },
];

const CATEGORIES = [
  { key: "all", label: "Tất cả ứng dụng" },
  { key: "pos", label: "Bán hàng & POS" },
  { key: "kitchen", label: "Vận hành Bếp / Bar" },
  { key: "marketing", label: "Tiếp thị & Khách hàng" },
  { key: "finance", label: "Kế toán & Hóa đơn" },
];

export default function AppMarketplaceView() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [installedApps, setInstalledApps] = useState({
    "app-kds": true,
    "app-loyalty-pro": true,
    "app-label-print": true,
  });
  const [toastMessage, setToastMessage] = useState("");

  const toggleInstall = (app) => {
    const isCurrentlyInstalled = Boolean(installedApps[app.id]);
    const nextState = {
      ...installedApps,
      [app.id]: !isCurrentlyInstalled,
    };
    setInstalledApps(nextState);

    setToastMessage(
      !isCurrentlyInstalled
        ? `Đã kích hoạt tiện ích "${app.title}"!`
        : `Đã tạm dừng tiện ích "${app.title}".`
    );
    setTimeout(() => setToastMessage(""), 3000);
  };

  const filteredApps = MARKETPLACE_APPS.filter((app) => {
    const matchCat =
      activeCategory === "all" || app.category === activeCategory;
    const matchQuery =
      !searchQuery.trim() ||
      app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="sq-subview-container sq-marketplace-view">
      <div className="sq-subview-header">
        <div className="sq-subview-title-group">
          <h1>Tiện ích mở rộng & Ứng dụng (App Marketplace)</h1>
          <p>
            Mở rộng năng lực vận hành quầy thu ngân với các ứng dụng bổ sung: Màn hình Bếp KDS, SMS/Zalo Marketing, Hóa đơn VAT và In tem dán ly.
          </p>
        </div>
        {toastMessage && (
          <div className="sq-toast-msg">
            ✓ {toastMessage}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="sq-marketplace-toolbar">
        <div className="sq-marketplace-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`sq-tab-chip ${activeCategory === cat.key ? "is-active" : ""}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="sq-marketplace-search-wrap">
          <input
            type="text"
            className="sq-form-input sq-marketplace-search"
            placeholder="Tìm kiếm ứng dụng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Apps Grid */}
      <div className="sq-marketplace-grid">
        {filteredApps.map((app) => {
          const isInstalled = Boolean(installedApps[app.id]);

          return (
            <div key={app.id} className="sq-subview-card sq-app-card">
              <div className="sq-app-card-top">
                <div
                  className="sq-app-icon"
                  style={{ backgroundColor: app.iconColor }}
                >
                  {app.iconLetter}
                </div>
                <div className="sq-app-badge-group">
                  <span className="sq-badge-tag">{app.badge}</span>
                  <span className="sq-app-price">{app.price}</span>
                </div>
              </div>

              <div className="sq-app-body">
                <h3 className="sq-app-title">{app.title}</h3>
                <span className="sq-app-dev">{app.developer}</span>
                <p className="sq-app-desc">{app.description}</p>
              </div>

              <div className="sq-app-footer">
                <div className="sq-app-status">
                  <span
                    className={`sq-status-dot ${isInstalled ? "is-installed" : ""}`}
                  />
                  <span className="sq-status-text">
                    {isInstalled ? "Đang hoạt động" : "Chưa cài đặt"}
                  </span>
                </div>

                <button
                  type="button"
                  className={`sq-btn-app-toggle ${isInstalled ? "is-installed" : ""}`}
                  onClick={() => toggleInstall(app)}
                >
                  {isInstalled ? "Tắt tiện ích" : "Cài đặt ngay"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
