import React, { useState } from "react";
import { uploadImage } from "../services/cloudinary";

export default function ImageUploader({
  value = "",
  onUploadSuccess = null,
  onRemove = null,
  title = "Upload Image via Cloudinary",
  description = "Tải ảnh trực tiếp lên Cloudinary CDN (JPEG, PNG, WebP tối đa 5MB).",
}) {
  const [file, setFile] = useState(null);
  const [previewLocalUrl, setPreviewLocalUrl] = useState(null);
  const [url, setUrl] = useState(value);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setError("");
    setCopied(false);

    if (selected) {
      const localUrl = URL.createObjectURL(selected);
      setPreviewLocalUrl(localUrl);
    } else {
      setPreviewLocalUrl(null);
    }
  };

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const result = await uploadImage(file);
      setUrl(result.url);
      if (onUploadSuccess) {
        onUploadSuccess(result.url, result);
      }
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      setError(err.message || "Upload thất bại");
    } finally {
      setLoading(false);
    }
  }

  const handleClear = () => {
    setFile(null);
    setPreviewLocalUrl(null);
    setUrl("");
    setError("");
    setCopied(false);
    if (onRemove) {
      onRemove();
    }
  };

  const handleCopyUrl = () => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const displayImage = url || previewLocalUrl;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <h3 style={styles.title}>{title}</h3>
            <p style={styles.desc}>{description}</p>
          </div>
        </div>

        {/* Upload Dropzone / Input */}
        {!displayImage ? (
          <label style={styles.dropzone}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <div style={styles.dropzoneIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p style={styles.dropzoneText}>
              <span style={styles.dropzoneHighlight}>Nhấn để chọn ảnh</span> hoặc kéo thả vào đây
            </p>
            <span style={styles.dropzoneHint}>Hỗ trợ JPEG, PNG, WebP (Tối đa 5 MB)</span>
          </label>
        ) : (
          <div style={styles.previewBox}>
            <div style={styles.imageWrapper}>
              <img src={displayImage} alt="Preview" style={styles.previewImg} />
            </div>

            <div style={styles.previewInfo}>
              {file && (
                <div style={styles.fileMeta}>
                  <span style={styles.fileName}>{file.name}</span>
                  <span style={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}

              {url && (
                <div style={styles.successBanner}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Upload thành công lên Cloudinary!</span>
                </div>
              )}

              {url && (
                <div style={styles.urlRow}>
                  <input
                    type="text"
                    readOnly
                    value={url}
                    style={styles.urlInput}
                  />
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    style={styles.btnCopy}
                  >
                    {copied ? "Đã copy!" : "Copy URL"}
                  </button>
                </div>
              )}

              <div style={styles.actionRow}>
                {file && !url && (
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={loading}
                    style={{
                      ...styles.btnPrimary,
                      ...(loading ? styles.btnDisabled : {}),
                    }}
                  >
                    {loading ? (
                      <span style={styles.loadingRow}>
                        <span style={styles.spinner} />
                        Đang upload...
                      </span>
                    ) : (
                      "Bắt đầu upload ảnh"
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleClear}
                  style={styles.btnSecondary}
                >
                  Xóa / Chọn ảnh khác
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div style={styles.errorBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div style={styles.errorText}>
              <strong>Lỗi tải ảnh:</strong> {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "24px 16px",
    display: "flex",
    justifyContent: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "540px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  iconCircle: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "17px",
    fontWeight: "700",
    color: "#111827",
  },
  desc: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: "1.4",
  },
  dropzone: {
    border: "2px dashed #d1d5db",
    borderRadius: "12px",
    padding: "36px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backgroundColor: "#fafafa",
    transition: "border-color 0.15s, background-color 0.15s",
  },
  dropzoneIcon: {
    marginBottom: "12px",
  },
  dropzoneText: {
    margin: "0 0 6px 0",
    fontSize: "14px",
    color: "#374151",
  },
  dropzoneHighlight: {
    color: "#2563eb",
    fontWeight: "600",
  },
  dropzoneHint: {
    fontSize: "12px",
    color: "#9ca3af",
  },
  previewBox: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    borderRadius: "12px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    padding: "16px",
  },
  imageWrapper: {
    width: "100%",
    maxHeight: "260px",
    borderRadius: "8px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
  },
  previewImg: {
    maxWidth: "100%",
    maxHeight: "260px",
    objectFit: "contain",
  },
  previewInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  fileMeta: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },
  fileName: {
    maxWidth: "70%",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  fileSize: {
    color: "#6b7280",
  },
  successBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#065f46",
  },
  urlRow: {
    display: "flex",
    gap: "8px",
  },
  urlInput: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "12px",
    backgroundColor: "#ffffff",
    color: "#111827",
  },
  btnCopy: {
    padding: "8px 14px",
    backgroundColor: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  actionRow: {
    display: "flex",
    gap: "10px",
    marginTop: "4px",
  },
  btnPrimary: {
    flex: 1,
    padding: "10px 18px",
    backgroundColor: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.15s",
  },
  btnDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  btnSecondary: {
    padding: "10px 16px",
    backgroundColor: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  loadingRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  spinner: {
    width: "14px",
    height: "14px",
    border: "2px solid #ffffff",
    borderTopColor: "transparent",
    borderRadius: "50%",
    display: "inline-block",
    animation: "sq-spin 0.6s linear infinite",
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "12px 14px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#991b1b",
    lineHeight: "1.4",
  },
  errorText: {
    flex: 1,
  },
};
