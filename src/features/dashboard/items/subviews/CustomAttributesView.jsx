import React, { useState } from "react";
import { DEFAULT_ATTRIBUTES } from "@/firebase/catalogSettingsService";
import "./Subviews.css";

const DATA_TYPES = [
  { key: "text", label: "Văn bản tự do (Text)" },
  { key: "number", label: "Con số (Number)" },
  { key: "select", label: "Lựa chọn từ danh sách (Dropdown)" },
  { key: "boolean", label: "Đúng / Sai (Bật/Tắt)" },
  { key: "date", label: "Ngày tháng (Date)" },
];

export default function CustomAttributesView() {
  const [attributes, setAttributes] = useState(DEFAULT_ATTRIBUTES || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("text");
  const [formDefaultVal, setFormDefaultVal] = useState("");
  const [formShowStorefront, setFormShowStorefront] = useState(true);
  const [formError, setFormError] = useState("");

  const handleOpenCreate = () => {
    setEditingAttr(null);
    setFormName("");
    setFormType("text");
    setFormDefaultVal("");
    setFormShowStorefront(true);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (attr) => {
    setEditingAttr(attr);
    setFormName(attr.name || "");
    setFormType(attr.type || "text");
    setFormDefaultVal(attr.defaultValue || "");
    setFormShowStorefront(Boolean(attr.showOnStorefront));
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDelete = (attrId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thuộc tính này?")) {
      setAttributes((prev) => prev.filter((a) => a.id !== attrId));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Vui lòng nhập tên thuộc tính.");
      return;
    }

    const payload = {
      id: editingAttr ? editingAttr.id : `attr-${Date.now()}`,
      name: formName.trim(),
      type: formType,
      defaultValue: formDefaultVal.trim(),
      showOnStorefront: formShowStorefront,
    };

    setAttributes((prev) => {
      const idx = prev.findIndex((a) => a.id === payload.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = payload;
        return copy;
      }
      return [payload, ...prev];
    });
    setIsModalOpen(false);
  };

  const filteredAttrs = attributes.filter((a) =>
    a.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sq-subview-container">
      <div className="sq-subview-header">
        <div className="sq-subview-title-group">
          <h1>Thuộc tính tùy chỉnh (Custom Attributes)</h1>
          <p>Thêm các trường thông tin bổ sung cho sản phẩm như Xuất xứ, Thương hiệu, Nhà cung cấp, Hạn bảo quản.</p>
        </div>
        <div className="sq-subview-actions">
          <button type="button" className="sq-btn-primary" onClick={handleOpenCreate}>
            + Tạo thuộc tính mới
          </button>
        </div>
      </div>

      <div className="sq-subview-card">
        <div className="sq-subview-toolbar">
          <div className="sq-subview-search">
            <span className="sq-subview-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm thuộc tính..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            Tổng cộng: <strong>{filteredAttrs.length}</strong> thuộc tính
          </span>
        </div>

        {filteredAttrs.length === 0 ? (
          <div className="sq-subview-empty">
            <div className="sq-empty-icon-wrap">🏷️</div>
            <h3>Chưa có thuộc tính tùy chỉnh nào</h3>
            <p>Tạo các thuộc tính đặc thù để ghi nhận thông tin chi tiết của hàng hóa trong kho và hiển thị cho khách xem.</p>
            <button type="button" className="sq-btn-primary" onClick={handleOpenCreate}>
              + Tạo thuộc tính đầu tiên
            </button>
          </div>
        ) : (
          <div className="sq-table-responsive">
            <table className="sq-data-table">
              <thead>
                <tr>
                  <th>Tên thuộc tính</th>
                  <th>Kiểu dữ liệu</th>
                  <th>Giá trị mặc định</th>
                  <th>Hiển thị Storefront</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttrs.map((attr) => {
                  const typeObj = DATA_TYPES.find((t) => t.key === attr.type);
                  return (
                    <tr key={attr.id}>
                      <td>
                        <strong style={{ color: "#0f172a" }}>{attr.name}</strong>
                      </td>
                      <td>
                        <span className="sq-badge-tag">{typeObj ? typeObj.label.split("(")[0].trim() : attr.type}</span>
                      </td>
                      <td>{attr.defaultValue || "—"}</td>
                      <td>
                        {attr.showOnStorefront ? (
                          <span className="sq-subview-badge sq-badge-active">✓ Công khai khách xem</span>
                        ) : (
                          <span className="sq-subview-badge sq-badge-inactive">🔒 Chỉ nội bộ quán</span>
                        )}
                      </td>
                      <td>
                        <div className="sq-row-actions">
                          <button
                            type="button"
                            className="sq-btn-icon-action"
                            onClick={() => handleOpenEdit(attr)}
                            title="Chỉnh sửa"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            type="button"
                            className="sq-btn-icon-action danger"
                            onClick={() => handleDelete(attr.id)}
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
              <h2>{editingAttr ? "Chỉnh sửa thuộc tính" : "Tạo thuộc tính mới"}</h2>
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
                  <label className="sq-form-label">Tên thuộc tính *</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    placeholder="Ví dụ: Xuất xứ hạt cà phê, Độ cồn (ABV), Hạn dùng..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Kiểu dữ liệu</label>
                  <select
                    className="sq-form-select"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                  >
                    {DATA_TYPES.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Giá trị mặc định (Tùy chọn)</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    placeholder="Ví dụ: Việt Nam"
                    value={formDefaultVal}
                    onChange={(e) => setFormDefaultVal(e.target.value)}
                  />
                </div>

                <div className="sq-toggle-wrapper">
                  <div className="sq-toggle-label-wrap">
                    <span className="sq-toggle-title">Hiển thị trên website đặt món</span>
                    <span className="sq-toggle-desc">Cho phép khách xem thông tin này khi bấm vào chi tiết món ăn</span>
                  </div>
                  <label className="sq-switch">
                    <input
                      type="checkbox"
                      checked={formShowStorefront}
                      onChange={(e) => setFormShowStorefront(e.target.checked)}
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
                  {editingAttr ? "Lưu thay đổi" : "Tạo thuộc tính"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
