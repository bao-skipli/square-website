import React, { useState } from "react";
import CustomerDetailDrawer from "./CustomerDetailDrawer";
import "../items/subviews/Subviews.css";
import "./CustomersView.css";

const INITIAL_CUSTOMERS = [
  {
    id: "cust-0912345678",
    name: "Nguyễn Văn An",
    phone: "0912345678",
    email: "an.nguyen@gmail.com",
    address: "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
    group: "VIP",
    orderCount: 12,
    totalSpent: 1850000,
    loyaltyPoints: 185,
    lastOrderDate: Date.now() - 3600000 * 24 * 1,
    notes: "Uống cà phê không đường, ít đá.",
  },
  {
    id: "cust-0987654321",
    name: "Trần Thị Mai",
    phone: "0987654321",
    email: "mai.tran@yahoo.com",
    address: "456 Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
    group: "Regular",
    orderCount: 6,
    totalSpent: 720000,
    loyaltyPoints: 72,
    lastOrderDate: Date.now() - 3600000 * 24 * 3,
    notes: "Thích trà đào cam sả nhiều trân châu.",
  },
  {
    id: "cust-0903112233",
    name: "Lê Hoàng Long",
    phone: "0903112233",
    email: "long.le@outlook.com",
    address: "789 Điện Biên Phủ, Bình Thạnh, TP.HCM",
    group: "New",
    orderCount: 2,
    totalSpent: 165000,
    loyaltyPoints: 16,
    lastOrderDate: Date.now() - 3600000 * 5,
    notes: "Khách gọi giao tận nơi văn phòng.",
  },
  {
    id: "cust-0938445566",
    name: "Phạm Thùy Linh",
    phone: "0938445566",
    email: "thuylinh.pham@gmail.com",
    address: "12 Đặng Dung, Tân Định, Quận 1, TP.HCM",
    group: "VIP",
    orderCount: 18,
    totalSpent: 2650000,
    loyaltyPoints: 265,
    lastOrderDate: Date.now() - 3600000 * 12,
    notes: "Khách VIP, thường đặt combo tiệc trà sáng thứ 2.",
  },
  {
    id: "cust-0977889900",
    name: "Đặng Minh Quân",
    phone: "0977889900",
    email: "quan.dang@techcorp.vn",
    address: "Tòa nhà Bitexco, Bến Nghé, Quận 1, TP.HCM",
    group: "Regular",
    orderCount: 5,
    totalSpent: 590000,
    loyaltyPoints: 59,
    lastOrderDate: Date.now() - 3600000 * 24 * 4,
    notes: "Thanh toán bằng VietQR công ty.",
  },
];

const CUSTOMER_GROUPS = ["All", "VIP", "Regular", "New"];

function exportCustomersToCSV(customers = []) {
  if (customers.length === 0) {
    alert("Chưa có khách hàng nào để xuất file.");
    return;
  }
  const headers = ["Tên khách hàng", "Số điện thoại", "Email", "Địa chỉ", "Nhóm", "Tổng đơn", "Tổng chi tiêu (VNĐ)", "Điểm thưởng", "Ghi chú"];
  const rows = customers.map((c) =>
    [
      `"${c.name || ""}"`,
      `"${c.phone || ""}"`,
      `"${c.email || ""}"`,
      `"${c.address || ""}"`,
      `"${c.group || "Regular"}"`,
      c.orderCount || 0,
      c.totalSpent || 0,
      c.loyaltyPoints || 0,
      `"${c.notes || ""}"`,
    ].join(",")
  );
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `square_customers_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CustomersView() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formGroup, setFormGroup] = useState("Regular");
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState("");

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormAddress("");
    setFormGroup("Regular");
    setFormNotes("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCustomer(c);
    setFormName(c.name || "");
    setFormPhone(c.phone || "");
    setFormEmail(c.email || "");
    setFormAddress(c.address || "");
    setFormGroup(c.group || "Regular");
    setFormNotes(c.notes || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDelete = (c) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${c.name}"?`)) {
      setCustomers((prev) => prev.filter((item) => item.id !== c.id && item.phone !== c.phone));
      if (selectedCustomer?.id === c.id) {
        setIsDrawerOpen(false);
      }
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Vui lòng nhập họ và tên khách hàng.");
      return;
    }
    if (!formPhone.trim()) {
      setFormError("Vui lòng nhập số điện thoại khách hàng.");
      return;
    }

    const payload = {
      id: editingCustomer ? editingCustomer.id : `cust-${Date.now()}`,
      name: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      address: formAddress.trim(),
      group: formGroup,
      notes: formNotes.trim(),
      totalSpent: editingCustomer ? editingCustomer.totalSpent || 0 : 0,
      orderCount: editingCustomer ? editingCustomer.orderCount || 0 : 0,
      loyaltyPoints: editingCustomer ? editingCustomer.loyaltyPoints || 0 : 0,
    };

    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomer.id || c.phone === editingCustomer.phone ? payload : c))
      );
      if (selectedCustomer?.id === editingCustomer.id) {
        setSelectedCustomer(payload);
      }
    } else {
      setCustomers((prev) => [payload, ...prev]);
    }
    setIsModalOpen(false);
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery);
    const matchesGroup = selectedGroup === "All" || c.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const totalSpentAll = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
  const vipCount = customers.filter((c) => c.group === "VIP").length;

  return (
    <div className="sq-customers-container">
      <div className="sq-subview-header">
        <div className="sq-subview-title-group">
          <h1>Danh bạ & Khách hàng (Customers CRM)</h1>
          <p>Quản lý hồ sơ khách hàng, số lần mua, tổng chi tiêu và chương trình tích điểm thưởng tự động.</p>
        </div>
        <div className="sq-subview-actions">
          <button
            type="button"
            className="sq-btn-secondary"
            onClick={() => exportCustomersToCSV(customers)}
          >
            Xuất file CSV 📥
          </button>
          <button type="button" className="sq-btn-primary" onClick={handleOpenCreate}>
            + Thêm khách hàng
          </button>
        </div>
      </div>

      {/* Stats summary cards */}
      <div className="sq-customer-stats-grid">
        <div className="sq-metric-card">
          <span className="sq-metric-label">Tổng khách hàng</span>
          <strong className="sq-metric-val">{customers.length}</strong>
        </div>
        <div className="sq-metric-card">
          <span className="sq-metric-label">Khách hàng VIP</span>
          <strong className="sq-metric-val" style={{ color: "#d97706" }}>
            ⭐ {vipCount}
          </strong>
        </div>
        <div className="sq-metric-card">
          <span className="sq-metric-label">Doanh số từ khách hàng</span>
          <strong className="sq-metric-val" style={{ color: "#059669" }}>
            {Number(totalSpentAll).toLocaleString("vi-VN")} đ
          </strong>
        </div>
      </div>

      <div className="sq-subview-card">
        <div className="sq-subview-toolbar">
          <div className="sq-subview-search">
            <span className="sq-subview-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo Tên hoặc Số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {CUSTOMER_GROUPS.map((grp) => (
              <button
                key={grp}
                type="button"
                className={selectedGroup === grp ? "sq-btn-primary" : "sq-btn-secondary"}
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => setSelectedGroup(grp)}
              >
                {grp === "All" ? "Tất cả nhóm" : grp}
              </button>
            ))}
          </div>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="sq-subview-empty">
            <div className="sq-empty-icon-wrap">👥</div>
            <h3>Không tìm thấy khách hàng nào</h3>
            <p>Hệ thống tự động lưu khách hàng khi có đơn đặt online hoặc bạn có thể thêm thủ công.</p>
            <button type="button" className="sq-btn-primary" onClick={handleOpenCreate}>
              + Thêm khách hàng mới
            </button>
          </div>
        ) : (
          <div className="sq-table-responsive">
            <table className="sq-data-table">
              <thead>
                <tr>
                  <th>Tên khách hàng</th>
                  <th>Số điện thoại</th>
                  <th>Phân nhóm</th>
                  <th>Số đơn đã mua</th>
                  <th>Tổng chi tiêu</th>
                  <th>Điểm thưởng</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr
                    key={c.id || c.phone}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setIsDrawerOpen(true);
                    }}
                  >
                    <td>
                      <strong style={{ color: "#0f172a" }}>{c.name}</strong>
                      {c.email && (
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{c.email}</div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{c.phone || "—"}</span>
                    </td>
                    <td>
                      <span
                        className="sq-badge-tag"
                        style={
                          c.group === "VIP"
                            ? { background: "#fef3c7", color: "#b45309", fontWeight: 700 }
                            : {}
                        }
                      >
                        {c.group || "Regular"}
                      </span>
                    </td>
                    <td>{c.orderCount || 0} đơn</td>
                    <td>
                      <strong style={{ color: "#059669" }}>
                        {Number(c.totalSpent || 0).toLocaleString("vi-VN")} đ
                      </strong>
                    </td>
                    <td>
                      <span style={{ color: "#006aff", fontWeight: 600 }}>
                        ⭐ {c.loyaltyPoints || 0}
                      </span>
                    </td>
                    <td>
                      <div className="sq-row-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="sq-btn-icon-action"
                          onClick={() => handleOpenEdit(c)}
                          title="Chỉnh sửa"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          type="button"
                          className="sq-btn-icon-action danger"
                          onClick={() => handleDelete(c)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer details drawer */}
      <CustomerDetailDrawer
        customer={selectedCustomer}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={(c) => handleOpenEdit(c)}
      />

      {/* Add / Edit customer modal */}
      {isModalOpen && (
        <div className="sq-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="sq-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="sq-modal-header">
              <h2>{editingCustomer ? "Chỉnh sửa thông tin khách hàng" : "Thêm khách hàng mới"}</h2>
              <button
                type="button"
                className="sq-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="sq-modal-body">
                {formError && (
                  <div style={{ color: "#dc2626", fontSize: "13px", padding: "8px 12px", background: "#fef2f2", borderRadius: "6px" }}>
                    {formError}
                  </div>
                )}

                <div className="sq-form-field">
                  <label className="sq-form-label">Họ và tên khách hàng *</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="sq-form-field">
                    <label className="sq-form-label">Số điện thoại *</label>
                    <input
                      type="tel"
                      className="sq-form-input"
                      placeholder="Ví dụ: 0912345678"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="sq-form-field">
                    <label className="sq-form-label">Nhóm khách hàng</label>
                    <select
                      className="sq-form-select"
                      value={formGroup}
                      onChange={(e) => setFormGroup(e.target.value)}
                    >
                      <option value="Regular">Khách thường (Regular)</option>
                      <option value="VIP">Khách VIP</option>
                      <option value="New">Khách hàng mới (New)</option>
                    </select>
                  </div>
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Email (Tùy chọn)</label>
                  <input
                    type="email"
                    className="sq-form-input"
                    placeholder="email@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Địa chỉ nhận hàng (Tùy chọn)</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                  />
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Ghi chú sở thích / dị ứng</label>
                  <textarea
                    className="sq-form-textarea"
                    rows={3}
                    placeholder="Ví dụ: Uống cà phê ít đường, dị ứng sữa bò..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="sq-modal-footer">
                <button
                  type="button"
                  className="sq-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="sq-btn-primary">
                  {editingCustomer ? "Lưu thay đổi" : "Thêm khách hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
