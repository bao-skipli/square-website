# Bunny.net Local Deployment & Custom Domain Agent (Backend)

Backend Companion Service viết bằng **Node.js (ESM)** cho hệ thống Square Clone. Dịch vụ đảm nhiệm các tác vụ cấp hệ điều hành (build Vite, giải nén ZIP landing page), tương tác trực tiếp với **Bunny.net Management/Storage APIs**, giám sát DNS mạng và đồng bộ dữ liệu hai chiều với **Firebase Realtime Database**.

---

## 📑 Mục lục
1. [Kiến trúc Bảo mật (Security Architecture)](#1-kiến-trúc-bảo-mật-security-architecture)
2. [Cấu trúc Mô-đun (Code Architecture)](#2-cấu-trúc-mô-đun-code-architecture)
3. [Cơ chế Giao tiếp Kép (Dual-Channel Architecture)](#3-cơ-chế-giao-tiếp-kép-dual-channel-architecture)
4. [Hướng dẫn Cài đặt & Cấu hình](#4-hướng-dẫn-cài-đặt--cấu-hình)
5. [Chế độ Mô phỏng (Simulated Mode)](#5-chế-độ-mô-phỏng-simulated-mode)
6. [Tài liệu API Nội bộ (HTTP Loopback 127.0.0.1:4567)](#6-tài-liệu-api-nội-bộ-http-loopback-1270014567)
7. [Chuẩn Ghi Log & Xử lý Lỗi (Error Handling)](#7-chuẩn-ghi-log--xử-lý-lỗi-error-handling)
8. [Kiểm thử Tự động (Automated Testing)](#8-kiểm-thử-tự-động-automated-testing)

---

## 1. Kiến trúc Bảo mật (Security Architecture)

1. **Bảo vệ Secret Keys (Zero Leaks to Frontend):**  
   Toàn bộ khóa quản trị `BUNNY_ACCOUNT_API_KEY` và `BUNNY_STORAGE_ZONE_PASSWORD` chỉ lưu cục bộ tại `agent/.env`. Trình duyệt web và bundle Vite tuyệt đối không tiếp xúc với các khóa này.
2. **Phân tách Rạch ròi 2 Loại Quyền Hạn:**
   * **Bunny Account API Key** (`BUNNY_ACCOUNT_API_KEY`): Dành riêng cho Management API (gắn/gỡ hostname, kích hoạt chứng chỉ SSL Let's Encrypt, xóa cache CDN).
   * **Bunny Storage Zone Password** (`BUNNY_STORAGE_ZONE_PASSWORD`): Dành riêng cho Storage API (upload file tĩnh qua HTTP PUT, liệt kê và dọn dẹp file cũ).
3. **Thực thi Lệnh Cục bộ An toàn (Safe Process Execution):**  
   Agent chỉ thực thi lệnh build cố định (`npm run build`) trong thư mục dự án thông qua `node:child_process`, tuyệt đối không nhận tham số dòng lệnh tùy ý từ bên ngoài để ngăn chặn Remote Command Injection.

---

## 2. Cấu trúc Mô-đun (Code Architecture)

Mã nguồn backend được tổ chức theo kiến trúc phân tầng (Layered Architecture) rõ ràng, độc lập và dễ bảo trì:

```text
agent/
├── index.js                      # Entry point (~60 dòng): Bootstrap server, nạp listeners, bắt SIGINT/SIGTERM
├── config.js                     # Nạp .env, xuất cấu hình và cờ nhận diện Simulated Mode
│
├── clients/                      # Tầng tích hợp API bên ngoài & tiện ích mạng
│   ├── mimeTypes.js              # Bảng tra cứu Content-Type chuẩn theo đuôi file
│   ├── bunnyManagement.js        # Gắn/Xóa Hostname, kích hoạt SSL Let's Encrypt, Purge Cache
│   ├── bunnyStorage.js           # Upload file tĩnh HTTP PUT, liệt kê file, Smart Sync xóa file rác
│   └── dnsVerifier.js            # Phân giải DNS cấp mạng (A, CNAME, NS) và ping kiểm tra live website
│
├── services/                     # Business Logic cốt lõi
│   ├── firebaseClient.js         # Khởi tạo Firebase App, Auth và kết nối Realtime Database
│   ├── jobStore.js               # Quản lý in-memory deployments map và stream logs tiến độ
│   ├── domainService.js          # Logic hợp nhất cho custom domain (attach, verify, remove)
│   └── deploymentService.js      # Pipeline build Vite React, giải nén ZIP landing page và upload CDN
│
├── server/                       # Tầng Local HTTP API (127.0.0.1:4567)
│   ├── server.js                 # Native http.createServer và xử lý CORS preflight
│   ├── routes.js                 # Định tuyến (/status, /domain/*, /deploy/*)
│   └── utils.js                  # Helper gửi JSON chuẩn và đọc parse body request
│
├── listeners/                    # Lắng nghe sự kiện chạy nền
│   ├── heartbeat.js              # Gửi nhịp tim online định kỳ (12 giây) lên Firebase RTDB
│   └── dbJobListener.js          # Lắng nghe hàng đợi realtime domainJobs và deploymentJobs
│
└── bunnyClient.js                # Facade re-export (tương thích ngược 100% với các test cũ)
```

---

## 3. Cơ chế Giao tiếp Kép (Dual-Channel Architecture)

Backend Agent hỗ trợ đồng thời hai kênh nhận lệnh từ Dashboard:

```text
       ┌────────────────────────────────────────────────────────┐
       │               Frontend Merchant Dashboard              │
       └──────────────┬──────────────────────────┬──────────────┘
                      │                          │
 [Kênh 1: HTTP Loopback]                         │ [Kênh 2: Firebase RTDB Queue]
 (http://127.0.0.1:4567)                         │ (domainJobs / deploymentJobs)
                      ▼                          ▼
       ┌────────────────────────────────────────────────────────┐
       │                 Backend Companion Agent                │
       └────────────────────────────────────────────────────────┘
```

* **Kênh 1 — HTTP Loopback (`http://127.0.0.1:4567`):**  
  Phục vụ môi trường phát triển cục bộ (Local Dev). Frontend gọi trực tiếp các endpoint REST để có phản hồi tức thì trong mili-giây.
* **Kênh 2 — Firebase Realtime Database Queue:**  
  Frontend đẩy yêu cầu vào node `/domainJobs` hoặc `/deploymentJobs`. Agent lắng nghe sự kiện `onValue`, tự động bốc job về thực thi, cập nhật tiến độ phần trăm (`progress`) và streaming log ngược lại Firebase cho Dashboard hiển thị.

---

## 4. Hướng dẫn Cài đặt & Cấu hình

### Bước 1: Tạo file cấu hình môi trường
Tạo file `agent/.env` từ file mẫu:
```bash
cp agent/.env.example agent/.env
```

### Bước 2: Điền thông tin kết nối Bunny.net
Mở file `agent/.env` và cập nhật các thông số tài khoản:
```env
# 1. Bunny Account API Key (Lấy tại: Account Settings -> API Key)
BUNNY_ACCOUNT_API_KEY=your_bunny_account_api_key

# 2. Pull Zone Information (Lấy tại: CDN -> Chọn Pull Zone của bạn)
BUNNY_PULL_ZONE_ID=123456
BUNNY_CDN_HOSTNAME=yourstore.b-cdn.net

# 3. Storage Zone Information (Dùng cho Build & Deploy Storefront)
BUNNY_STORAGE_ZONE_NAME=your_storage_zone
BUNNY_STORAGE_ZONE_PASSWORD=your_storage_zone_password
BUNNY_STORAGE_HOSTNAME=storage.bunnycdn.com
```

### Bước 3: Khởi chạy Agent
Mở cửa sổ terminal tại thư mục gốc của dự án:
```bash
npm run agent
```

Khi khởi động thành công, màn hình terminal sẽ hiển thị:
```text
🚀 Bunny Deployment Agent started on http://127.0.0.1:4567
⚡ Heartbeat emitter active
📡 Listening for DB deployment & domain jobs...
```

---

## 5. Chế độ Mô phỏng (Simulated Mode)

Nếu bạn chưa điền API Key hoặc chưa có tài khoản Bunny.net:
* Agent sẽ **tự động chuyển sang Simulated Mode**.
* Hệ thống sẽ mô phỏng tiến trình deploy từ 0% $\rightarrow$ 100%, ghi log từng giai đoạn và trả về trạng thái hợp lệ.
* Cho phép kiểm thử toàn bộ trải nghiệm người dùng trên Dashboard (thêm domain, xem bảng DNS, test deploy) mà không cần cấu hình tài khoản thực tế.

---

## 6. Tài liệu API Nội bộ (HTTP Loopback 127.0.0.1:4567)

Backend Agent cung cấp các endpoint HTTP REST để frontend tương tác hoặc kiểm thử trực tiếp bằng `curl`:

### 1. Kiểm tra trạng thái Agent (`GET /status`)
```bash
curl -X GET http://127.0.0.1:4567/status
```
**Phản hồi mẫu:**
```json
{
  "status": "online",
  "simulated": false,
  "bunnyPullZoneId": 123456,
  "bunnyStorageZone": "your_storage_zone",
  "cdnHostname": "yourstore.b-cdn.net",
  "heartbeatIntervalSeconds": 12
}
```

---

### 2. Gắn Tên miền Riêng (`POST /domain/attach`)
```bash
curl -X POST http://127.0.0.1:4567/domain/attach \
  -H "Content-Type: application/json" \
  -d '{"domain": "yourdomain.com"}'
```
**Phản hồi mẫu:**
```json
{
  "success": true,
  "domain": "yourdomain.com",
  "status": "pending_verification",
  "dns": {
    "cnamePointsToCdn": false,
    "nameserversPointToBunny": true,
    "siteReachable": false
  }
}
```

---

### 3. Xác minh DNS & Kích hoạt SSL (`POST /domain/verify`)
```bash
curl -X POST http://127.0.0.1:4567/domain/verify \
  -H "Content-Type: application/json" \
  -d '{"domain": "yourdomain.com"}'
```
**Phản hồi mẫu:**
```json
{
  "success": true,
  "verified": true,
  "sslActive": true,
  "siteReachable": true,
  "dns": {
    "cnamePointsToCdn": true,
    "nameserversPointToBunny": true,
    "siteReachable": true
  }
}
```

---

### 4. Gỡ bỏ Tên miền (`POST /domain/remove`)
```bash
curl -X POST http://127.0.0.1:4567/domain/remove \
  -H "Content-Type: application/json" \
  -d '{"domain": "yourdomain.com"}'
```
**Phản hồi mẫu:**
```json
{
  "success": true,
  "domain": "yourdomain.com",
  "action": "removed"
}
```

---

### 5. Khởi chạy Triển khai (`POST /deploy`)
Hỗ trợ cả 2 chế độ:
* `sourceType: "react"`: Build toàn bộ ứng dụng Vite React sang thư mục `dist/` và upload lên Bunny Storage.
* `sourceType: "landing"`: Nhận tệp ZIP hoặc HTML độc lập, giải nén và làm phẳng thư mục (auto-flattening), sau đó upload lên Storage.

---

### 6. Xem Tiến độ Deploy (`GET /deploy/:id`)
```bash
curl -X GET http://127.0.0.1:4567/deploy/dep_1792718000
```
**Phản hồi mẫu:**
```json
{
  "id": "dep_1792718000",
  "status": "success",
  "progress": 100,
  "logs": [
    "Compiling React app (npm run build)...",
    "Uploading 14 static assets to Bunny Storage...",
    "Purging Pull Zone CDN cache...",
    "Deployment completed successfully!"
  ]
}
```

---

## 7. Chuẩn Ghi Log & Xử lý Lỗi (Error Handling)

Hệ thống tuân thủ nguyên tắc **Không nuốt lỗi âm thầm (No Silent Swallowing)**:
* Toàn bộ các khối `try/catch` đều được trang bị `console.warn(...)` hoặc `console.error(...)` có ngữ cảnh cụ thể (tên hàm, tham số lỗi, lý do lỗi mạng hoặc timeout).
* Khi tiến trình deploy gặp sự cố (ví dụ lỗi cú pháp mã nguồn React hoặc file ZIP không có `index.html`), Agent tự động cập nhật trạng thái `failed`, ghi log chi tiết vào deployment store và đẩy cảnh báo đến Firebase để giao diện người dùng hiển thị thông báo lỗi rõ ràng.

---

## 8. Kiểm thử Tự động (Automated Testing)

Toàn bộ các mô-đun của Agent (DNS Verifier, MIME detection, Smart Sync Cleaner, Zip Unpacker, Domain Encoder) được kiểm thử tự động bằng Node.js Test Runner native:

```bash
npm test
```

Tất cả các trường hợp kiểm thử (Unit Tests & Integration Tests) phải đảm bảo vượt qua 100% trước khi triển khai thực tế.
