import React, { useState } from "react";
import { DEFAULT_UNITS } from "@/firebase/catalogSettingsService";
import "./Subviews.css";

const UNIT_TYPES = [
  { key: "quantity", label: "Đếm số lượng (Cái, Ly, Phần...)" },
  { key: "weight", label: "Khối lượng / Cân nặng (Kg, Gram...)" },
  { key: "volume", label: "Thể tích / Dung tích (Lít, ml...)" },
  { key: "length", label: "Chiều dài / Kích thước (Mét, cm...)" },
];

export default function UnitsView() {
  const [units, setUnits] = useState(DEFAULT_UNITS || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formAbbr, setFormAbbr] = useState("");
  const [formType, setFormType] = useState("quantity");
  const [formPrecision, setFormPrecision] = useState(0);
  const [formError, setFormError] = useState("");

  const handleOpenCreate = () => {
    setEditingUnit(null);
    setFormName("");
    setFormAbbr("");
    setFormType("quantity");
    setFormPrecision(0);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (unit) => {
    setEditingUnit(unit);
    setFormName(unit.name || "");
    setFormAbbr(unit.abbreviation || "");
    setFormType(unit.type || "quantity");
    setFormPrecision(unit.precision || 0);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleDelete = (unitId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn vị tính này?")) {
      setUnits((prev) => prev.filter((u) => u.id !== unitId));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Vui lòng nhập tên đơn vị tính.");
      return;
    }
    if (!formAbbr.trim()) {
      setFormError("Vui lòng nhập ký hiệu viết tắt.");
      return;
    }

    const payload = {
      id: editingUnit ? editingUnit.id : `unit-${Date.now()}`,
      name: formName.trim(),
      abbreviation: formAbbr.trim().toLowerCase(),
      type: formType,
      precision: parseInt(formPrecision, 10) || 0,
      isDefault: editingUnit ? Boolean(editingUnit.isDefault) : false,
    };

    setUnits((prev) => {
      const idx = prev.findIndex((u) => u.id === payload.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = payload;
        return copy;
      }
      return [payload, ...prev];
    });
    setIsModalOpen(false);
  };

  const filteredUnits = units.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.abbreviation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sq-subview-container">
      <div className="sq-subview-header">
        <div className="sq-subview-title-group">
          <h1>Đơn vị đo lường (Units of Measurement)</h1>
          <p>Quản lý các đơn vị tính giá và kiểm kho như Ly, Cốc, Phần, Kg, Lít, Chai... áp dụng cho toàn bộ thư viện món.</p>
        </div>
        <div className="sq-subview-actions">
          <button type="button" className="sq-btn-primary" onClick={handleOpenCreate}>
            + Thêm đơn vị tính
          </button>
        </div>
      </div>

      <div className="sq-subview-card">
        <div className="sq-subview-toolbar">
          <div className="sq-subview-search">
            <span className="sq-subview-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm đơn vị tính..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            Tổng cộng: <strong>{filteredUnits.length}</strong> đơn vị
          </span>
        </div>

        <div className="sq-table-responsive">
          <table className="sq-data-table">
            <thead>
              <tr>
                <th>Tên đơn vị</th>
                <th>Ký hiệu viết tắt</th>
                <th>Phân loại</th>
                <th>Số chữ số thập phân</th>
                <th>Loại đơn vị</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map((unit) => {
                const typeObj = UNIT_TYPES.find((t) => t.key === unit.type);
                return (
                  <tr key={unit.id}>
                    <td>
                      <strong style={{ color: "#0f172a" }}>{unit.name}</strong>
                    </td>
                    <td>
                      <span className="sq-badge-tag" style={{ fontSize: "12px", fontWeight: 700 }}>
                        {unit.abbreviation}
                      </span>
                    </td>
                    <td>{typeObj ? typeObj.label.split("(")[0].trim() : unit.type}</td>
                    <td>{unit.precision || 0}</td>
                    <td>
                      {unit.isDefault ? (
                        <span className="sq-subview-badge sq-badge-active">Hệ thống</span>
                      ) : (
                        <span className="sq-subview-badge sq-badge-inactive">Tùy chỉnh</span>
                      )}
                    </td>
                    <td>
                      <div className="sq-row-actions">
                        <button
                          type="button"
                          className="sq-btn-icon-action"
                          onClick={() => handleOpenEdit(unit)}
                          title="Chỉnh sửa"
                        >
                          ✏️ Sửa
                        </button>
                        {!unit.isDefault && (
                          <button
                            type="button"
                            className="sq-btn-icon-action danger"
                            onClick={() => handleDelete(unit.id)}
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
              <h2>{editingUnit ? "Chỉnh sửa đơn vị tính" : "Thêm đơn vị tính mới"}</h2>
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
                  <label className="sq-form-label">Tên đơn vị *</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    placeholder="Ví dụ: Ly, Bát, Tô, Khay, Lon..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Ký hiệu viết tắt *</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    placeholder="Ví dụ: ly, bat, to, khay..."
                    value={formAbbr}
                    onChange={(e) => setFormAbbr(e.target.value)}
                    required
                  />
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Loại đơn vị đo lường</label>
                  <select
                    className="sq-form-select"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                  >
                    {UNIT_TYPES.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Độ chính xác (Số chữ số thập phân)</label>
                  <select
                    className="sq-form-select"
                    value={formPrecision}
                    onChange={(e) => setFormPrecision(e.target.value)}
                  >
                    <option value={0}>0 (Chỉ số nguyên: 1, 2, 3...)</option>
                    <option value={1}>1 chữ số (0.1, 0.5...)</option>
                    <option value={2}>2 chữ số (0.01, 0.25...)</option>
                    <option value={3}>3 chữ số (0.001, 0.125...)</option>
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
                  {editingUnit ? "Lưu thay đổi" : "Thêm đơn vị"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
