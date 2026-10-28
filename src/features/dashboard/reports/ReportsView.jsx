import React, { useState } from "react";
import "../items/subviews/Subviews.css";
import "./ReportsView.css";

const now = Date.now();
const ONE_DAY = 3600000 * 24;

const MOCK_REPORT_ORDERS = [
  {
    id: "ord-rep-1",
    orderNumber: "#1001",
    subtotal: 90000,
    tax: 7200,
    total: 97200,
    paymentMethod: "vietqr",
    status: "completed",
    createdAt: now - 3600000 * 2,
    items: [
      { name: "Cà phê sữa đá", qty: 2, price: 35000 },
      { name: "Bánh Croissant bơ tỏi", qty: 1, price: 20000 },
    ],
  },
  {
    id: "ord-rep-2",
    orderNumber: "#1002",
    subtotal: 135000,
    tax: 10800,
    total: 145800,
    paymentMethod: "card",
    status: "completed",
    createdAt: now - 3600000 * 4,
    items: [
      { name: "Trà đào cam sả", qty: 2, price: 45000 },
      { name: "Bạc xỉu 3 tầng", qty: 1, price: 45000 },
    ],
  },
  {
    id: "ord-rep-3",
    orderNumber: "#1003",
    subtotal: 70000,
    tax: 5600,
    total: 75600,
    paymentMethod: "cash",
    status: "completed",
    createdAt: now - 3600000 * 6,
    items: [{ name: "Cà phê sữa đá", qty: 2, price: 35000 }],
  },
  {
    id: "ord-rep-4",
    orderNumber: "#0998",
    subtotal: 180000,
    tax: 14400,
    total: 194400,
    paymentMethod: "vietqr",
    status: "completed",
    createdAt: now - ONE_DAY * 1 - 3600000 * 3,
    items: [
      { name: "Trà sữa Ô Long nướng", qty: 3, price: 45000 },
      { name: "Cà phê đen đá", qty: 1, price: 45000 },
    ],
  },
  {
    id: "ord-rep-5",
    orderNumber: "#0999",
    subtotal: 110000,
    tax: 8800,
    total: 118800,
    paymentMethod: "cash",
    status: "completed",
    createdAt: now - ONE_DAY * 1 - 3600000 * 7,
    items: [
      { name: "Bạc xỉu 3 tầng", qty: 2, price: 45000 },
      { name: "Bánh Tiramisu", qty: 1, price: 20000 },
    ],
  },
  {
    id: "ord-rep-6",
    orderNumber: "#0991",
    subtotal: 220000,
    tax: 17600,
    total: 237600,
    paymentMethod: "vietqr",
    status: "completed",
    createdAt: now - ONE_DAY * 2 - 3600000 * 5,
    items: [
      { name: "Cà phê sữa đá", qty: 4, price: 35000 },
      { name: "Trà đào cam sả", qty: 2, price: 40000 },
    ],
  },
  {
    id: "ord-rep-7",
    orderNumber: "#0982",
    subtotal: 165000,
    tax: 13200,
    total: 178200,
    paymentMethod: "card",
    status: "completed",
    createdAt: now - ONE_DAY * 3 - 3600000 * 4,
    items: [
      { name: "Trà đào cam sả", qty: 3, price: 45000 },
      { name: "Bánh Tiramisu", qty: 1, price: 30000 },
    ],
  },
  {
    id: "ord-rep-8",
    orderNumber: "#0975",
    subtotal: 290000,
    tax: 23200,
    total: 313200,
    paymentMethod: "vietqr",
    status: "completed",
    createdAt: now - ONE_DAY * 4 - 3600000 * 6,
    items: [
      { name: "Cà phê sữa đá", qty: 4, price: 35000 },
      { name: "Trà sữa Ô Long nướng", qty: 3, price: 50000 },
    ],
  },
  {
    id: "ord-rep-9",
    orderNumber: "#0968",
    subtotal: 140000,
    tax: 11200,
    total: 151200,
    paymentMethod: "cash",
    status: "completed",
    createdAt: now - ONE_DAY * 5 - 3600000 * 2,
    items: [
      { name: "Bạc xỉu 3 tầng", qty: 2, price: 45000 },
      { name: "Cà phê đen đá", qty: 2, price: 25000 },
    ],
  },
  {
    id: "ord-rep-10",
    orderNumber: "#0955",
    subtotal: 210000,
    tax: 16800,
    total: 226800,
    paymentMethod: "vietqr",
    status: "completed",
    createdAt: now - ONE_DAY * 6 - 3600000 * 5,
    items: [
      { name: "Trà đào cam sả", qty: 3, price: 45000 },
      { name: "Cà phê sữa đá", qty: 2, price: 35000 },
      { name: "Bánh Croissant bơ tỏi", qty: 1, price: 20000 },
    ],
  },
];

const DATE_PRESETS = [
  { key: "today", label: "Hôm nay" },
  { key: "7days", label: "7 ngày qua" },
  { key: "30days", label: "30 ngày qua" },
  { key: "all", label: "Toàn thời gian" },
];

export default function ReportsView() {
  const [orders] = useState(MOCK_REPORT_ORDERS);
  const [activeDateRange, setActiveDateRange] = useState("7days");

  // Filter orders by date range
  const now = Date.now();
  const filteredOrders = orders.filter((o) => {
    if (activeDateRange === "today") {
      const startOfDay = new Date().setHours(0, 0, 0, 0);
      return o.createdAt >= startOfDay;
    }
    if (activeDateRange === "7days") {
      return o.createdAt >= now - 3600000 * 24 * 7;
    }
    if (activeDateRange === "30days") {
      return o.createdAt >= now - 3600000 * 24 * 30;
    }
    return true;
  });

  const validOrders = filteredOrders.filter((o) => o.status !== "cancelled");

  // Summary Metrics
  const grossSales = validOrders.reduce((acc, o) => acc + (o.subtotal || 0), 0);
  const netSales = validOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalTax = validOrders.reduce((acc, o) => acc + (o.tax || 0), 0);
  const totalOrders = validOrders.length;
  const aov = totalOrders > 0 ? Math.round(netSales / totalOrders) : 0;

  // Chart aggregation: Last 7 days bars
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const last7DaysData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dayStart = new Date(d).setHours(0, 0, 0, 0);
    const dayEnd = new Date(d).setHours(23, 59, 59, 999);

    const dayOrders = orders.filter(
      (o) => o.status !== "cancelled" && o.createdAt >= dayStart && o.createdAt <= dayEnd
    );
    const daySales = dayOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    return {
      label: `${dayNames[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`,
      sales: daySales,
      count: dayOrders.length,
    };
  });

  const maxDailySales = Math.max(...last7DaysData.map((d) => d.sales), 100000);

  // Top selling items aggregation
  const itemMap = {};
  validOrders.forEach((o) => {
    o.items?.forEach((item) => {
      const name = item.name || "Món";
      if (!itemMap[name]) {
        itemMap[name] = { name, quantity: 0, revenue: 0 };
      }
      itemMap[name].quantity += item.quantity || 1;
      itemMap[name].revenue += (item.priceCents || item.price || 0) * (item.quantity || 1);
    });
  });

  const topItems = Object.values(itemMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const maxItemQty = topItems.length > 0 ? topItems[0].quantity : 1;

  // Payment Methods distribution
  const paymentCounts = { cod: 0, vietqr: 0, card: 0 };
  validOrders.forEach((o) => {
    const pm = (o.paymentMethod || "cod").toLowerCase();
    if (paymentCounts[pm] !== undefined) {
      paymentCounts[pm] += o.total || 0;
    } else {
      paymentCounts.cod += o.total || 0;
    }
  });

  const handleExportReport = () => {
    const csvContent =
      "\uFEFF" +
      [
        "Chỉ số,Giá trị",
        `Doanh thu thuần,${netSales} VNĐ`,
        `Doanh thu gộp,${grossSales} VNĐ`,
        `Tổng số đơn hàng,${totalOrders}`,
        `Giá trị đơn trung bình,${aov} VNĐ`,
        `Thuế đã thu,${totalTax} VNĐ`,
        "",
        "Top món bán chạy,Số lượng,Doanh thu",
        ...topItems.map((item) => `"${item.name}",${item.quantity},${item.revenue}`),
      ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `square_sales_report_${activeDateRange}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sq-reports-container">
      <div className="sq-reports-filter-bar">
        <div className="sq-subview-title-group">
          <h1>Báo cáo & Phân tích Doanh thu (Reports)</h1>
          <p>Theo dõi tổng quan tài chính, xu hướng bán hàng theo ngày và top món được khách yêu thích nhất.</p>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {DATE_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={activeDateRange === p.key ? "sq-btn-primary" : "sq-btn-secondary"}
              style={{ padding: "6px 14px", fontSize: "12px" }}
              onClick={() => setActiveDateRange(p.key)}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            className="sq-btn-secondary"
            style={{ padding: "6px 14px", fontSize: "12px" }}
            onClick={handleExportReport}
          >
            Xuất file CSV 📊
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="sq-reports-summary-grid">
        <div className="sq-metric-card">
          <span className="sq-metric-label">Doanh thu thuần (Net Sales)</span>
          <strong className="sq-metric-val" style={{ color: "#006aff" }}>
            {netSales.toLocaleString("vi-VN")} đ
          </strong>
        </div>
        <div className="sq-metric-card">
          <span className="sq-metric-label">Tổng số đơn hoàn thành</span>
          <strong className="sq-metric-val">{totalOrders} đơn</strong>
        </div>
        <div className="sq-metric-card">
          <span className="sq-metric-label">Giá trị trung bình/đơn (AOV)</span>
          <strong className="sq-metric-val" style={{ color: "#059669" }}>
            {aov.toLocaleString("vi-VN")} đ
          </strong>
        </div>
        <div className="sq-metric-card">
          <span className="sq-metric-label">Thuế VAT & Phí dịch vụ</span>
          <strong className="sq-metric-val" style={{ color: "#64748b" }}>
            {totalTax.toLocaleString("vi-VN")} đ
          </strong>
        </div>
      </div>

      {/* Interactive Daily Sales Bar Chart */}
      <div className="sq-reports-chart-card">
        <div className="sq-chart-header">
          <h3>Xu hướng doanh thu theo ngày (7 ngày gần nhất)</h3>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            Đỉnh doanh thu ngày: {maxDailySales.toLocaleString("vi-VN")} đ
          </span>
        </div>

        <div className="sq-svg-chart-container">
          {last7DaysData.map((d, i) => {
            const heightPercent = Math.max(Math.round((d.sales / maxDailySales) * 100), 4);
            return (
              <div key={i} className="sq-chart-bar-group">
                <div className="sq-chart-bar" style={{ height: `${heightPercent}%` }}>
                  <div className="sq-chart-bar-tooltip">
                    {d.sales.toLocaleString("vi-VN")} đ ({d.count} đơn)
                  </div>
                </div>
                <span className="sq-chart-label">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Split: Top Selling Items & Payment Methods */}
      <div className="sq-reports-split-grid">
        {/* Top 5 Items */}
        <div className="sq-subview-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#0f172a" }}>
            Top món bán chạy nhất
          </h3>

          {topItems.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b", fontSize: "13px" }}>
              Chưa có dữ liệu món bán trong khoảng thời gian này.
            </div>
          ) : (
            <div>
              {topItems.map((item, idx) => (
                <div key={idx} className="sq-rank-row">
                  <div className="sq-rank-item-info">
                    <span className={`sq-rank-badge ${idx === 0 ? "top-1" : ""}`}>
                      {idx + 1}
                    </span>
                    <div>
                      <strong style={{ fontSize: "13px", color: "#0f172a" }}>{item.name}</strong>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Đã bán: <strong>{item.quantity}</strong> phần
                      </div>
                    </div>
                  </div>

                  <div className="sq-rank-progress-wrap">
                    <div
                      className="sq-rank-progress-bar"
                      style={{ width: `${Math.round((item.quantity / maxItemQty) * 100)}%` }}
                    />
                  </div>

                  <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                    {item.revenue.toLocaleString("vi-VN")} đ
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="sq-subview-card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#0f172a" }}>
            Cơ cấu hình thức thanh toán
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: "14px", color: "#0f172a" }}>Chuyển khoản VietQR</strong>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Thanh toán mã QR trực tuyến</div>
              </div>
              <strong style={{ fontSize: "14px", color: "#006aff" }}>
                {paymentCounts.vietqr.toLocaleString("vi-VN")} đ
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: "14px", color: "#0f172a" }}>Tiền mặt / COD</strong>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Thanh toán khi nhận hàng</div>
              </div>
              <strong style={{ fontSize: "14px", color: "#059669" }}>
                {paymentCounts.cod.toLocaleString("vi-VN")} đ
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong style={{ fontSize: "14px", color: "#0f172a" }}>Thẻ ngân hàng / POS</strong>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Quẹt thẻ tại quầy</div>
              </div>
              <strong style={{ fontSize: "14px", color: "#64748b" }}>
                {paymentCounts.card.toLocaleString("vi-VN")} đ
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
