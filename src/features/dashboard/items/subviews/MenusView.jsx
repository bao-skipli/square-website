import React, { useState } from "react";
import { DEFAULT_MENUS } from "@/firebase/catalogSettingsService";
import "./Subviews.css";

const DAYS_OF_WEEK = [
  { id: 1, label: "Thứ 2" },
  { id: 2, label: "Thứ 3" },
  { id: 3, label: "Thứ 4" },
  { id: 4, label: "Thứ 5" },
  { id: 5, label: "Thứ 6" },
  { id: 6, label: "Thứ 7" },
  { id: 7, label: "Chủ nhật" },
];

function isMenuCurrentlyActive(menu) {
  if (!menu || !menu.isActive) return false;
  const now = new Date();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay();
  if (menu.daysOfWeek && !menu.daysOfWeek.includes(currentDay)) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const parseMin = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const startMin = parseMin(menu.timeStart);
  const endMin = parseMin(menu.timeEnd);

  if (startMin <= endMin) {
    return currentMinutes >= startMin && currentMinutes <= endMin;
  } else {
    // Overnight menu (e.g. 22:00 to 04:00)
    return currentMinutes >= startMin || currentMinutes <= endMin;
  }
}

export default function MenusView({ categories = [] }) {
  const [menus, setMenus] = useState(DEFAULT_MENUS || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formTimeStart, setFormTimeStart] = useState("07:00");
  const [formTimeEnd, setFormTimeEnd] = useState("11:00");
  const [formDays, setFormDays] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [formCategories, setFormCategories] = useState([]);
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState("");

  const availableCategories = categories.length > 0
    ? categories.map((c) => c.name)
    : ["Cà phê", "Trà & Nước hoa quả", "Đá xay & Sinh tố", "Bánh & Tráng miệng", "Món ăn"];

  const handleOpenCreate = () => {
    setEditingMenu(null);
    setFormName("");
    setFormTimeStart("07:00");
    setFormTimeEnd("11:00");
    setFormDays([1, 2, 3, 4, 5, 6, 7]);
    setFormCategories([availableCategories[0]]);
    setFormDescription("");
    setFormIsActive(true);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (menu) => {
    setEditingMenu(menu);
    setFormName(menu.name || "");
    setFormTimeStart(menu.timeStart || "00:00");
    setFormTimeEnd(menu.timeEnd || "23:59");
    setFormDays(menu.daysOfWeek || [1, 2, 3, 4, 5, 6, 7]);
    setFormCategories(menu.categories || []);
    setFormDescription(menu.description || "");
    setFormIsActive(menu.isActive !== false);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDelete = (menuId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thực đơn này?")) {
      setMenus((prev) => prev.filter((m) => m.id !== menuId));
    }
  };

  const handleToggleDay = (dayId) => {
    if (formDays.includes(dayId)) {
      if (formDays.length === 1) return; // Keep at least 1 day
      setFormDays(formDays.filter((d) => d !== dayId));
    } else {
      setFormDays([...formDays, dayId].sort());
    }
  };

  const handleToggleCategory = (catName) => {
    if (formCategories.includes(catName)) {
      setFormCategories(formCategories.filter((c) => c !== catName));
    } else {
      setFormCategories([...formCategories, catName]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Vui lòng nhập tên thực đơn.");
      return;
    }

    const payload = {
      id: editingMenu ? editingMenu.id : `menu-${Date.now()}`,
      name: formName.trim(),
      timeStart: formTimeStart,
      timeEnd: formTimeEnd,
      daysOfWeek: formDays,
      categories: formCategories,
      description: formDescription.trim(),
      isActive: formIsActive,
    };

    setMenus((prev) => {
      const idx = prev.findIndex((m) => m.id === payload.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = payload;
        return copy;
      }
      return [payload, ...prev];
    });
    setIsModalOpen(false);
  };

  const filteredMenus = menus.filter((m) =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sq-subview-container">
      <div className="sq-subview-header">
        <div className="sq-subview-title-group">
          <h1>Quản lý Thực đơn theo ca (Menus)</h1>
          <p>Tạo các thực đơn tự động kích hoạt theo khung giờ (Sáng, Trưa, Tối, Happy Hour) áp dụng cho Storefront và máy POS.</p>
        </div>
        <div className="sq-subview-actions">
          <button type="button" className="sq-btn-primary" onClick={handleOpenCreate}>
            + Tạo thực đơn mới
          </button>
        </div>
      </div>

      <div className="sq-subview-card">
        <div className="sq-subview-toolbar">
          <div className="sq-subview-search">
            <span className="sq-subview-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm thực đơn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            Tổng cộng: <strong>{filteredMenus.length}</strong> thực đơn
          </span>
        </div>

        {filteredMenus.length === 0 ? (
          <div className="sq-subview-empty">
            <div className="sq-empty-icon-wrap">📋</div>
            <h3>Chưa có thực đơn nào</h3>
            <p>Tạo thực đơn đầu tiên để phân ca bán hàng linh hoạt cho cửa hàng của bạn.</p>
            <button type="button" className="sq-btn-primary" onClick={handleOpenCreate}>
              + Tạo thực đơn
            </button>
          </div>
        ) : (
          <div className="sq-table-responsive">
            <table className="sq-data-table">
              <thead>
                <tr>
                  <th>Tên thực đơn</th>
                  <th>Khung giờ phục vụ</th>
                  <th>Ngày trong tuần</th>
                  <th>Danh mục áp dụng</th>
                  <th>Trạng thái hiện tại</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenus.map((menu) => {
                  const isActiveNow = isMenuCurrentlyActive(menu);
                  return (
                    <tr key={menu.id}>
                      <td>
                        <strong style={{ color: "#0f172a" }}>{menu.name}</strong>
                        {menu.description && (
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                            {menu.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>
                          {menu.timeStart} – {menu.timeEnd}
                        </span>
                      </td>
                      <td>
                        {menu.daysOfWeek?.length === 7 ? (
                          <span className="sq-badge-tag">Tất cả các ngày</span>
                        ) : (
                          menu.daysOfWeek?.map((d) => (
                            <span key={d} className="sq-badge-tag">
                              T{d === 7 ? "CN" : d + 1}
                            </span>
                          ))
                        )}
                      </td>
                      <td>
                        {menu.categories?.map((cat, i) => (
                          <span key={i} className="sq-badge-tag">
                            {cat}
                          </span>
                        ))}
                      </td>
                      <td>
                        {isActiveNow ? (
                          <span className="sq-subview-badge sq-badge-active">
                            ● Đang phục vụ
                          </span>
                        ) : menu.isActive ? (
                          <span className="sq-subview-badge sq-badge-inactive">
                            Chờ đến giờ
                          </span>
                        ) : (
                          <span className="sq-subview-badge sq-badge-inactive">
                            Đã tắt
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="sq-row-actions">
                          <button
                            type="button"
                            className="sq-btn-icon-action"
                            onClick={() => handleOpenEdit(menu)}
                            title="Chỉnh sửa"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            type="button"
                            className="sq-btn-icon-action danger"
                            onClick={() => handleDelete(menu.id)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="sq-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="sq-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="sq-modal-header">
              <h2>{editingMenu ? "Chỉnh sửa thực đơn" : "Tạo thực đơn mới"}</h2>
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
                  <label className="sq-form-label">Tên thực đơn *</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    placeholder="Ví dụ: Thực đơn Sáng, Menu Cơm trưa, Trà chiều..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="sq-form-field">
                    <label className="sq-form-label">Giờ bắt đầu</label>
                    <input
                      type="time"
                      className="sq-form-input"
                      value={formTimeStart}
                      onChange={(e) => setFormTimeStart(e.target.value)}
                      required
                    />
                  </div>
                  <div className="sq-form-field">
                    <label className="sq-form-label">Giờ kết thúc</label>
                    <input
                      type="time"
                      className="sq-form-input"
                      value={formTimeEnd}
                      onChange={(e) => setFormTimeEnd(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Các ngày áp dụng trong tuần</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                    {DAYS_OF_WEEK.map((d) => {
                      const isSelected = formDays.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          type="button"
                          className={isSelected ? "sq-btn-primary" : "sq-btn-secondary"}
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => handleToggleDay(d.id)}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Danh mục món thuộc thực đơn này</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                    {availableCategories.map((cat) => {
                      const isSelected = formCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          className={isSelected ? "sq-btn-primary" : "sq-btn-secondary"}
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => handleToggleCategory(cat)}
                        >
                          {isSelected ? `✓ ${cat}` : cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Mô tả thực đơn (Tùy chọn)</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    placeholder="Mô tả ngắn gọn hiển thị cho khách xem..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                <div className="sq-toggle-wrapper">
                  <div className="sq-toggle-label-wrap">
                    <span className="sq-toggle-title">Kích hoạt thực đơn</span>
                    <span className="sq-toggle-desc">Tự động hiển thị và phục vụ thực đơn này trong khung giờ quy định</span>
                  </div>
                  <label className="sq-switch">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                    />
                    <span className="sq-slider" />
                  </label>
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
                  {editingMenu ? "Lưu thay đổi" : "Tạo thực đơn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
