import React, { useState } from "react";
import "../items/subviews/Subviews.css";

const DEFAULT_STAFF = [
  {
    id: "staff-admin",
    name: "Quản trị viên (Chủ quán)",
    phone: "0901234567",
    email: "owner@skipli.com",
    role: "admin",
    passcode: "1234",
    status: "Active",
    location: "Skipli Main",
  },
  {
    id: "staff-cashier1",
    name: "Nguyễn Thị Thu Ngân",
    phone: "0988776655",
    email: "thungan@skipli.com",
    role: "cashier",
    passcode: "2233",
    status: "Active",
    location: "Skipli Main",
  },
  {
    id: "staff-kitchen1",
    name: "Trần Văn Bếp",
    phone: "0911223344",
    email: "bep@skipli.com",
    role: "kitchen",
    passcode: "5566",
    status: "Active",
    location: "Skipli Main",
  },
  {
    id: "staff-manager",
    name: "Lê Cẩm Tú",
    phone: "0944556677",
    email: "camtu.le@skipli.com",
    role: "manager",
    passcode: "8899",
    status: "Active",
    location: "Skipli Main",
  },
];

const ROLES = [
  { key: "admin", label: "Chủ quán / Quản trị viên (Toàn quyền)" },
  { key: "manager", label: "Quản lý cửa hàng (Xem báo cáo, chỉnh sửa giá món)" },
  { key: "cashier", label: "Thu ngân (Bán hàng, tạo đơn, nhận thanh toán)" },
  { key: "kitchen", label: "Nhân viên Bếp / Bar (Xem đơn làm món)" },
];

export default function StaffView() {
  const [staffList, setStaffList] = useState(DEFAULT_STAFF);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("cashier");
  const [formPasscode, setFormPasscode] = useState("1234");
  const [formStatus, setFormStatus] = useState("Active");
  const [formError, setFormError] = useState("");

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFormName("");
    setFormPhone("");
    setFormEmail("");
    setFormRole("cashier");
    setFormPasscode(String(Math.floor(1000 + Math.random() * 9000)));
    setFormStatus("Active");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingStaff(s);
    setFormName(s.name || "");
    setFormPhone(s.phone || "");
    setFormEmail(s.email || "");
    setFormRole(s.role || "cashier");
    setFormPasscode(s.passcode || "1234");
    setFormStatus(s.status || "Active");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDelete = (staffId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?")) {
      setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Vui lòng nhập tên nhân viên.");
      return;
    }
    if (!formPasscode.trim() || formPasscode.length !== 4) {
      setFormError("Mã PIN đăng nhập POS phải đúng 4 chữ số.");
      return;
    }

    const payload = {
      id: editingStaff ? editingStaff.id : `staff-${Date.now()}`,
      name: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim(),
      role: formRole,
      passcode: formPasscode.trim(),
      status: formStatus,
      location: "Skipli Main",
    };

    if (editingStaff) {
      setStaffList((prev) =>
        prev.map((s) => (s.id === editingStaff.id ? payload : s))
      );
    } else {
      setStaffList((prev) => [payload, ...prev]);
    }
    setIsModalOpen(false);
  };

  const filteredStaff = staffList.filter((s) =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone?.includes(searchQuery)
  );

  return (
    <div className="sq-subview-container">
      <div className="sq-subview-header">
        <div className="sq-subview-title-group">
          <h1>Nhân viên & Phân quyền (Staff & Team)</h1>
          <p>Quản lý danh sách nhân sự, phân quyền chức vụ (Admin, Quản lý, Thu ngân, Bếp) và mã PIN đăng nhập nhanh tại máy POS.</p>
        </div>
        <div className="sq-subview-actions">
          <button type="button" className="sq-btn-primary" onClick={handleOpenCreate}>
            + Thêm nhân viên
          </button>
        </div>
      </div>

      <div className="sq-subview-card">
        <div className="sq-subview-toolbar">
          <div className="sq-subview-search">
            <span className="sq-subview-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            Tổng cộng: <strong>{filteredStaff.length}</strong> nhân sự
          </span>
        </div>

        <div className="sq-table-responsive">
          <table className="sq-data-table">
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Số điện thoại</th>
                <th>Chức vụ & Quyền hạn</th>
                <th>Mã PIN POS</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((st) => {
                const roleObj = ROLES.find((r) => r.key === st.role);
                return (
                  <tr key={st.id}>
                    <td>
                      <strong style={{ color: "#0f172a" }}>{st.name}</strong>
                      {st.email && (
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{st.email}</div>
                      )}
                    </td>
                    <td>{st.phone || "—"}</td>
                    <td>
                      <span
                        className="sq-badge-tag"
                        style={
                          st.role === "admin"
                            ? { background: "#eff6ff", color: "#1d4ed8", fontWeight: 700 }
                            : {}
                        }
                      >
                        {roleObj ? roleObj.label.split("(")[0].trim() : st.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, letterSpacing: "2px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px" }}>
                        {st.passcode || "••••"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`sq-subview-badge ${st.status === "Active" ? "sq-badge-active" : "sq-badge-inactive"}`}
                      >
                        {st.status === "Active" ? "● Đang làm việc" : "Đã nghỉ"}
                      </span>
                    </td>
                    <td>
                      <div className="sq-row-actions">
                        <button
                          type="button"
                          className="sq-btn-icon-action"
                          onClick={() => handleOpenEdit(st)}
                          title="Chỉnh sửa"
                        >
                          ✏️ Sửa
                        </button>
                        {st.role !== "admin" && (
                          <button
                            type="button"
                            className="sq-btn-icon-action danger"
                            onClick={() => handleDelete(st.id)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="sq-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="sq-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="sq-modal-header">
              <h2>{editingStaff ? "Chỉnh sửa thông tin nhân viên" : "Thêm nhân viên mới"}</h2>
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
                  <label className="sq-form-label">Họ và tên nhân viên *</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    placeholder="Ví dụ: Trần Văn Nam"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="sq-form-field">
                    <label className="sq-form-label">Số điện thoại</label>
                    <input
                      type="tel"
                      className="sq-form-input"
                      placeholder="0912345678"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                    />
                  </div>
                  <div className="sq-form-field">
                    <label className="sq-form-label">Mã PIN POS (4 số) *</label>
                    <input
                      type="text"
                      maxLength={4}
                      className="sq-form-input"
                      placeholder="1234"
                      value={formPasscode}
                      onChange={(e) => setFormPasscode(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Chức vụ & Quyền hạn</label>
                  <select
                    className="sq-form-select"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Trạng thái làm việc</label>
                  <select
                    className="sq-form-select"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                  >
                    <option value="Active">Đang làm việc (Active)</option>
                    <option value="Inactive">Tạm nghỉ / Đã nghỉ việc</option>
                  </select>
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
                  {editingStaff ? "Lưu thay đổi" : "Thêm nhân viên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
