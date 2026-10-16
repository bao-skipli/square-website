const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadImage(file, options = {}) {
  if (!file) {
    throw new Error("Vui lòng chọn ảnh");
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Chỉ hỗ trợ file ảnh định dạng JPEG, PNG, WebP, GIF hoặc AVIF");
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_SIZE) {
    throw new Error("Ảnh không được vượt quá 5 MB");
  }

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Thiếu cấu hình Cloudinary (VITE_CLOUDINARY_CLOUD_NAME hoặc VITE_CLOUDINARY_UPLOAD_PRESET trong .env)"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  if (options.folder) {
    formData.append("folder", options.folder);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const rawMsg = data.error?.message || "";
    if (rawMsg.includes("Upload preset must be whitelisted for unsigned uploads")) {
      throw new Error(
        `Preset "${UPLOAD_PRESET}" trên Cloudinary đang ở chế độ Signed. Vui lòng vào Cloudinary Console -> Settings -> Upload Presets -> chuyển Singing Mode sang Unsigned.`
      );
    }
    throw new Error(rawMsg || "Upload ảnh thất bại. Vui lòng thử lại.");
  }

  return {
    url: data.secure_url,
    publicId: data.public_id,
    format: data.format,
    bytes: data.bytes,
  };
}
