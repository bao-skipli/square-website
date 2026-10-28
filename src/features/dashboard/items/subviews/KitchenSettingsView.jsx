import React, { useState } from "react";
import { DEFAULT_KITCHEN_SETTINGS } from "@/firebase/catalogSettingsService";
import "./Subviews.css";

export default function KitchenSettingsView({ categories = [] }) {
  const [settings, setSettings] = useState(DEFAULT_KITCHEN_SETTINGS);
  const [isSavedAlert, setIsSavedAlert] = useState(false);
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState(null);

  // Form states for adding/editing a station
  const [stationName, setStationName] = useState("");
  const [stationPrinter, setStationPrinter] = useState("");
  const [stationCategories, setStationCategories] = useState([]);
  const [stationError, setStationError] = useState("");

  const availableCategories = categories.length > 0
    ? categories.map((c) => c.name)
    : ["Cà phê", "Trà & Nước hoa quả", "Đá xay & Sinh tố", "Bánh & Tráng miệng", "Món ăn"];

  const handleUpdateField = (field, value) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    showSavedNotification();
  };

  const showSavedNotification = () => {
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2500);
  };

  const handleOpenAddStation = () => {
    setEditingStation(null);
    setStationName("");
    setStationPrinter("Máy in nhiệt 80mm");
    setStationCategories([availableCategories[0]]);
    setStationError("");
    setIsStationModalOpen(true);
  };

  const handleOpenEditStation = (st) => {
    setEditingStation(st);
    setStationName(st.name || "");
    setStationPrinter(st.printerName || "");
    setStationCategories(st.categories || []);
    setStationError("");
    setIsStationModalOpen(true);
  };

  const handleDeleteStation = (stationId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa trạm chế biến này?")) {
      const updatedStations = settings.stations.filter((s) => s.id !== stationId);
      const updated = { ...settings, stations: updatedStations };
      setSettings(updated);
      showSavedNotification();
    }
  };

  const handleToggleStationCategory = (catName) => {
    if (stationCategories.includes(catName)) {
      setStationCategories(stationCategories.filter((c) => c !== catName));
    } else {
      setStationCategories([...stationCategories, catName]);
    }
  };

  const handleSaveStation = (e) => {
    e.preventDefault();
    if (!stationName.trim()) {
      setStationError("Vui lòng nhập tên trạm chế biến.");
      return;
    }

    const newStation = {
      id: editingStation ? editingStation.id : `st-${Date.now()}`,
      name: stationName.trim(),
      printerName: stationPrinter.trim() || "Máy in POS mặc định",
      categories: stationCategories,
    };

    let updatedStations;
    if (editingStation) {
      updatedStations = settings.stations.map((s) => (s.id === editingStation.id ? newStation : s));
    } else {
      updatedStations = [...(settings.stations || []), newStation];
    }

    const updated = { ...settings, stations: updatedStations };
    setSettings(updated);
    setIsStationModalOpen(false);
    showSavedNotification();
  };

  return (
    <div className="sq-subview-container">
      <div className="sq-subview-header">
        <div className="sq-subview-title-group">
          <h1>Cài đặt Bếp & Pha chế (Kitchen Settings)</h1>
          <p>Cấu hình thời gian chuẩn bị món, tự động in phiếu chế biến và phân luồng món ăn về từng trạm Bếp/Bar.</p>
        </div>
        {isSavedAlert && (
          <div style={{ background: "#ecfdf5", color: "#059669", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "13px" }}>
            ✓ Đã lưu cài đặt tự động!
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Core preferences card */}
        <div className="sq-subview-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px 0", color: "#0f172a" }}>
            Thời gian chế biến & In ấn tự động
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="sq-form-field" style={{ maxWidth: "340px" }}>
              <label className="sq-form-label">Thời gian chuẩn bị món mặc định (Prep Time)</label>
              <select
                className="sq-form-select"
                value={settings.prepTimeMinutes || 15}
                onChange={(e) => handleUpdateField("prepTimeMinutes", parseInt(e.target.value, 10))}
              >
                <option value={5}>5 phút (Phục vụ siêu tốc)</option>
                <option value={10}>10 phút</option>
                <option value={15}>15 phút (Khuyến nghị cho quán cà phê)</option>
                <option value={20}>20 phút</option>
                <option value={25}>25 phút</option>
                <option value={30}>30 phút (Món ăn chế biến lâu)</option>
              </select>
            </div>

            <div className="sq-toggle-wrapper">
              <div className="sq-toggle-label-wrap">
                <span className="sq-toggle-title">Tự động in phiếu chế biến khi có đơn mới</span>
                <span className="sq-toggle-desc">Tự động gửi phiếu in lệnh làm món sang máy in của Bếp / Bar ngay khi khách đặt đơn</span>
              </div>
              <label className="sq-switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.autoPrintKitchenTicket)}
                  onChange={(e) => handleUpdateField("autoPrintKitchenTicket", e.target.checked)}
                />
                <span className="sq-slider" />
              </label>
            </div>

            <div className="sq-toggle-wrapper">
              <div className="sq-toggle-label-wrap">
                <span className="sq-toggle-title">Chuông âm thanh thông báo Bếp</span>
                <span className="sq-toggle-desc">Phát âm thanh chuông ngân báo động tại trạm chế biến khi có đơn đặt online</span>
              </div>
              <label className="sq-switch">
                <input
                  type="checkbox"
                  checked={Boolean(settings.soundAlertEnabled)}
                  onChange={(e) => handleUpdateField("soundAlertEnabled", e.target.checked)}
                />
                <span className="sq-slider" />
              </label>
            </div>
          </div>
        </div>

        {/* Stations routing card */}
        <div className="sq-subview-card">
          <div className="sq-subview-toolbar">
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#0f172a" }}>
              Phân luồng các trạm chế biến (Kitchen Routing Stations)
            </h2>
            <button type="button" className="sq-btn-primary" onClick={handleOpenAddStation}>
              + Thêm trạm chế biến
            </button>
          </div>

          <div className="sq-table-responsive">
            <table className="sq-data-table">
              <thead>
                <tr>
                  <th>Tên trạm</th>
                  <th>Máy in chỉ định</th>
                  <th>Danh mục món gửi về trạm này</th>
                  <th style={{ textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {settings.stations?.map((st) => (
                  <tr key={st.id}>
                    <td>
                      <strong style={{ color: "#0f172a" }}>{st.name}</strong>
                    </td>
                    <td>
                      <span className="sq-badge-tag" style={{ background: "#f1f5f9", color: "#334155" }}>
                        🖨️ {st.printerName || "Máy in mặc định"}
                      </span>
                    </td>
                    <td>
                      {st.categories?.length > 0 ? (
                        st.categories.map((c, i) => (
                          <span key={i} className="sq-badge-tag">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>Chưa gán danh mục</span>
                      )}
                    </td>
                    <td>
                      <div className="sq-row-actions">
                        <button
                          type="button"
                          className="sq-btn-icon-action"
                          onClick={() => handleOpenEditStation(st)}
                          title="Chỉnh sửa"
                        >
                          ✏️ Sửa
                        </button>
                        {settings.stations.length > 1 && (
                          <button
                            type="button"
                            className="sq-btn-icon-action danger"
                            onClick={() => handleDeleteStation(st.id)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isStationModalOpen && (
        <div className="sq-modal-backdrop" onClick={() => setIsStationModalOpen(false)}>
          <div className="sq-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="sq-modal-header">
              <h2>{editingStation ? "Chỉnh sửa trạm chế biến" : "Thêm trạm chế biến mới"}</h2>
              <button
                type="button"
                className="sq-modal-close"
                onClick={() => setIsStationModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStation}>
              <div className="sq-modal-body">
                {stationError && (
                  <div style={{ color: "#dc2626", fontSize: "13px", padding: "8px 12px", background: "#fef2f2", borderRadius: "6px" }}>
                    {stationError}
                  </div>
                )}

                <div className="sq-form-field">
                  <label className="sq-form-label">Tên trạm chế biến *</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    placeholder="Ví dụ: Quầy Bar, Bếp Nóng, Trạm Bánh ngọt..."
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    required
                  />
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Tên máy in vé chỉ định</label>
                  <input
                    type="text"
                    className="sq-form-input"
                    placeholder="Ví dụ: Máy in Bar 80mm, Epson Kitchen..."
                    value={stationPrinter}
                    onChange={(e) => setStationPrinter(e.target.value)}
                  />
                </div>

                <div className="sq-form-field">
                  <label className="sq-form-label">Chọn danh mục món chế biến tại trạm này</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                    {availableCategories.map((cat) => {
                      const isSelected = stationCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          className={isSelected ? "sq-btn-primary" : "sq-btn-secondary"}
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                          onClick={() => handleToggleStationCategory(cat)}
                        >
                          {isSelected ? `✓ ${cat}` : cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="sq-modal-footer">
                <button
                  type="button"
                  className="sq-btn-secondary"
                  onClick={() => setIsStationModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="sq-btn-primary">
                  {editingStation ? "Lưu thay đổi" : "Thêm trạm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
