import React, { useState } from "react";
import { DEFAULT_OPTIONS } from "@/firebase/catalogSettingsService";
import "./Subviews.css";

export default function ItemOptionsView() {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formValues, setFormValues] = useState([{ name: "", priceDelta: 0 }]);
  const [formError, setFormError] = useState("");

  const handleOpenCreate = () => {
    setEditingOption(null);
    setFormName("");
    setFormValues([
      { name: "Size Nhỏ (S)", priceDelta: 0 },
      { name: "Size Vừa (M)", priceDelta: 0.5 },
      { name: "Size Lớn (L)", priceDelta: 1.0 },
    ]);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (opt) => {
    setEditingOption(opt);
    setFormName(opt.name || "");
    const values = opt.values?.map((v) =>
      typeof v === "string" ? { name: v, priceDelta: 0 } : { ...v }
    ) || [{ name: "", priceDelta: 0 }];
    setFormValues(values);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDelete = (optId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bộ tùy chọn này?")) {
      setOptions((prev) => prev.filter((o) => o.id !== optId));
    }
  };

  const handleAddValueRow = () => {
    setFormValues([...formValues, { name: "", priceDelta: 0 }]);
  };

  const handleRemoveValueRow = (idx) => {
    setFormValues(formValues.filter((_, i) => i !== idx));
  };

  const handleValueChange = (idx, field, val) => {
    const updated = [...formValues];
    updated[idx][field] = field === "priceDelta" ? parseFloat(val) || 0 : val;
    setFormValues(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Vui lòng nhập tên bộ tùy chọn.");
      return;
    }
    const cleanValues = formValues.filter((v) => v.name.trim() !== "");
    if (cleanValues.length === 0) {
      setFormError("Vui lòng thêm ít nhất một giá trị tùy chọn.");
      return;
    }

    const payload = {
      id: editingOption ? editingOption.id : `opt-${Date.now()}`,
      name: formName.trim(),
      values: cleanValues,
      appliedItemsCount: editingOption ? editingOption.appliedItemsCount || 0 : 0,
    };

    if (editingOption) {
      setOptions((prev) => prev.map((o) => (o.id === editingOption.id ? payload : o)));
    } else {
      setOptions((prev) => [payload, ...prev]);
    }
    setIsModalOpen(false);
  };

  const filteredOptions = options.filter((o) =>
    o.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sq-subview-container">
      <div className="sq-subview-header">
        <div className="sq-subview-title-group">
          <h1>Tùy chọn món (Item Options)</h1>
          <p>Tạo các nhóm biến thể như Kích cỡ, Lượng đá, Lượng đường để áp dụng nhanh vào các món ăn, đồ uống.</p>
        </div>
        <div className="sq-subview-actions">
          <button type="button" className="sq-btn-primary" onClick={handleOpenCreate}>
            + Tạo bộ tùy chọn
          </button>
        </div>
      </div>

      <div className="sq-subview-card">
        <div className="sq-subview-toolbar">
          <div className="sq-subview-search">
            <span className="sq-subview-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm tùy chọn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            Tổng cộng: <strong>{filteredOptions.length}</strong> bộ tùy chọn
          </span>
        </div>

        {filteredOptions.length === 0 ? (
          <div className="sq-subview-empty">
            <div className="sq-empty-icon-wrap">⚙️</div>
            <h3>Chưa có bộ tùy chọn nào</h3>
            <p>Bấm nút bên dưới để tạo các nhóm tùy chọn như Size, Độ ngọt, Lượng đá cho menu của bạn.</p>
            <button type="button" className="sq-btn-primary" onClick={handleOpenCreate}>
              + Tạo bộ tùy chọn mới
            </button>
          </div>
        ) : (
          <div className="sq-table-responsive">
            <table className="sq-data-table">
              <thead>
                <tr>
                  <th>Tên tùy chọn</th>
                  <th>Các giá trị lựa chọn</th>
                  <th>Số món áp dụng</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOptions.map((opt) => (
                  <tr key={opt.id}>
                    <td>
                      <strong style={{ color: "#0f172a" }}>{opt.name}</strong>
                    </td>
                    <td>
                      {opt.values?.map((v, i) => {
                        const valName = typeof v === "string" ? v : v.name;
                        const delta = typeof v === "object" && v.priceDelta > 0 ? ` (+${v.priceDelta})` : "";
                        return (
                          <span key={i} className="sq-badge-tag">
                            {valName}{delta}
                          </span>
                        );
                      })}
                    </td>
                    <td>
                      <span className="sq-subview-badge sq-badge-active">
                        {opt.appliedItemsCount || 0} món
                      </span>
                    </td>
                    <td>
                      <div className="sq-row-actions">
                        <button
                          type="button"
                          className="sq-btn-icon-action"
                          onClick={() => handleOpenEdit(opt)}
                          title="Chỉnh sửa"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          type="button"
                          className="sq-btn-icon-action danger"
                          onClick={() => handleDelete(opt.id)}
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

      {isModalOpen && (
        <div className="sq-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="sq-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="sq-modal-header">
              <h2>{editingOption ? "Chỉnh sửa bộ tùy chọn" : "Tạo bộ tùy chọn mới"}</h2>
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
                  <label className="sq-form-label">Tên bộ tùy chọn *</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    placeholder="Ví dụ: Kích cỡ (Size), Lượng đá, Lượng đường..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="sq-form-field">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label className="sq-form-label">Danh sách các lựa chọn con *</label>
                    <button
                      type="button"
                      className="sq-btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                      onClick={handleAddValueRow}
                    >
                      + Thêm dòng
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
                    {formValues.map((val, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <input
                          type="text"
                          className="sq-form-input"
                          style={{ flex: 2 }}
                          placeholder={`Lựa chọn #${idx + 1} (vd: Size L)`}
                          value={val.name}
                          onChange={(e) => handleValueChange(idx, "name", e.target.value)}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1 }}>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>+$</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            className="sq-form-input"
                            placeholder="Giá thêm"
                            value={val.priceDelta || 0}
                            onChange={(e) => handleValueChange(idx, "priceDelta", e.target.value)}
                          />
                        </div>
                        {formValues.length > 1 && (
                          <button
                            type="button"
                            className="sq-btn-icon-action danger"
                            onClick={() => handleRemoveValueRow(idx)}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
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
                  {editingOption ? "Lưu thay đổi" : "Tạo tùy chọn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
