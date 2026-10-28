import React, { useState, useRef } from "react";
import "./ItemImportModal.css";

// Basic RFC 4180 compliant CSV parser
function parseCSV(text) {
  const lines = [];
  let currentRow = [];
  let currentVal = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentVal.trim());
      if (currentRow.some((field) => field.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((field) => field.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

export default function ItemImportModal({ isOpen, onClose, onImportItems }) {
  const [dragActive, setDragActive] = useState(false);
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setError("Vui lòng tải lên tệp định dạng .csv");
      return;
    }

    setError("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = parseCSV(text);
        if (rows.length < 2) {
          setError("Tệp CSV rỗng hoặc chỉ có tiêu đề.");
          return;
        }

        const headers = rows[0].map((h) => h.toLowerCase());
        const getIdx = (keys) => headers.findIndex((h) => keys.some((k) => h.includes(k)));

        const nameIdx = getIdx(["name", "tên", "title", "món"]);
        const catIdx = getIdx(["cat", "danh mục", "nhóm"]);
        const priceIdx = getIdx(["price", "giá", "cost"]);
        const descIdx = getIdx(["desc", "mô tả", "chi tiết"]);
        const skuIdx = getIdx(["sku", "mã"]);
        const calIdx = getIdx(["cal", "calo"]);
        const allergenIdx = getIdx(["aller", "dị ứng"]);

        if (nameIdx === -1) {
          setError("Không tìm thấy cột Tên món (Name) trong tệp CSV.");
          return;
        }

        const items = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const name = row[nameIdx] || "";
          if (!name) continue;

          let rawPrice = priceIdx !== -1 ? (row[priceIdx] || "") : "";
          rawPrice = rawPrice.replace(/[^\d.]/g, "");
          const formattedPrice = rawPrice ? `$${rawPrice}` : "—";

          items.push({
            id: `item-${Date.now()}-${i}`,
            name,
            category: catIdx !== -1 && row[catIdx] ? row[catIdx] : "Uncategorized",
            price: formattedPrice,
            description: descIdx !== -1 && row[descIdx] ? row[descIdx] : "",
            sku: skuIdx !== -1 && row[skuIdx] ? row[skuIdx] : "",
            calories: calIdx !== -1 && row[calIdx] ? row[calIdx] : "",
            allergens: allergenIdx !== -1 && row[allergenIdx] ? row[allergenIdx] : "",
            status: "Available",
          });
        }

        if (items.length === 0) {
          setError("Không đọc được dữ liệu món nào hợp lệ từ tệp.");
          return;
        }

        setParsedRows(items);
      } catch (err) {
        console.error("CSV parse error:", err);
        setError("Lỗi đọc tệp CSV: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const sampleHeaders = "Name,Category,Price,SKU,Calories,Allergens,Description\n";
    const sampleRow1 = '"Cà phê sữa đá","Cà phê",2.5,"CF-001","180","Sữa bò","Cà phê pha phin truyền thống kết hợp sữa đặc"\n';
    const sampleRow2 = '"Trà đào cam sả","Trà & Nước trái cây",3.0,"TR-002","120","","Trà đen ủ lạnh vị đào thơm ngọt mát"\n';
    const csvContent = "\uFEFF" + sampleHeaders + sampleRow1 + sampleRow2;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mau_danh_muc_mon_square.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    try {
      await onImportItems(parsedRows);
      onClose();
    } catch (err) {
      setError("Nhập dữ liệu thất bại: " + (err?.message || err));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="sq-import-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sq-import-card" onClick={(e) => e.stopPropagation()}>
        <div className="sq-import-header">
          <div className="sq-import-title-group">
            <h2>Nhập danh mục món (CSV Import)</h2>
            <p>Tải lên danh sách món ăn, đồ uống từ bảng tính Excel hoặc file CSV</p>
          </div>
          <button type="button" className="sq-import-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="sq-import-body">
          <div className="sq-import-template-row">
            <span>Chưa có mẫu sẵn? Tải file CSV mẫu chuẩn Square:</span>
            <button type="button" className="sq-btn-link-template" onClick={handleDownloadSample}>
              Tải mẫu CSV chuẩn
            </button>
          </div>

          <div
            className={`sq-import-dropzone ${dragActive ? "drag-active" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="sq-import-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="sq-import-drop-text">
              {fileName ? fileName : "Kéo thả file .CSV vào đây hoặc nhấn để chọn"}
            </p>
            <span className="sq-import-drop-sub">Hỗ trợ file UTF-8 CSV xuất từ Excel, Google Sheets</span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {error && (
            <div style={{ color: "#ef4444", fontSize: "13px", padding: "10px 14px", background: "#fef2f2", borderRadius: "8px" }}>
              {error}
            </div>
          )}

          {parsedRows.length > 0 && (
            <div className="sq-import-preview-box">
              <div className="sq-import-preview-header">
                <span>Xem trước danh sách ({parsedRows.length} món tìm thấy)</span>
                <span style={{ color: "#059669" }}>✓ Hợp lệ</span>
              </div>
              <div className="sq-import-table-wrap">
                <table className="sq-import-table">
                  <thead>
                    <tr>
                      <th>Tên món</th>
                      <th>Danh mục</th>
                      <th>Giá</th>
                      <th>SKU</th>
                      <th>Calo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        <td><strong>{row.name}</strong></td>
                        <td>{row.category}</td>
                        <td>{row.price}</td>
                        <td>{row.sku || "—"}</td>
                        <td>{row.calories ? `${row.calories} kcal` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 5 && (
                <div style={{ padding: "8px 14px", fontSize: "12px", color: "#64748b", background: "#f8fafc" }}>
                  + và thêm {parsedRows.length - 5} món khác...
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sq-import-footer">
          <button type="button" className="sq-btn-import-cancel" onClick={onClose} disabled={isProcessing}>
            Hủy
          </button>
          <button
            type="button"
            className="sq-btn-import-submit"
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0 || isProcessing}
          >
            {isProcessing ? "Đang nhập..." : `Xác nhận nhập ${parsedRows.length} món`}
          </button>
        </div>
      </div>
    </div>
  );
}
