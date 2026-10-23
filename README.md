# Square Web Clone — Fullstack Architecture & Engineering Documentation

Hệ thống quản lý bán hàng đa kênh (**POS / Merchant Dashboard**), cửa hàng trực tuyến (**Online Storefront**) và giải pháp tự động hoá triển khai lên **Bunny.net CDN / Storage** kèm hỗ trợ **Custom Domain (Bunny DNS & CNAME)**.

---

## 📑 Mục lục
1. [Tổng quan Kiến trúc Hệ thống](#1-tổng-quan-kiến-trúc-hệ-thống)
2. [Kiến trúc Frontend (FE Architecture)](#2-kiến-trúc-frontend-fe-architecture)
3. [Kiến trúc Backend (BE Architecture — Node.js Agent)](#3-kiến-trúc-backend-be-architecture--nodejs-agent)
4. [Hai Kênh Giao tiếp Song song giữa FE và BE](#4-hai-kênh-giao-tiếp-song-song-giữa-fe-và-be)
5. [Hướng dẫn Cài đặt & Khởi chạy (Getting Started)](#5-hướng-dẫn-cài-đặt--khởi-chạy-getting-started)
6. [Hướng dẫn Cấu hình Custom Domain (Tên miền riêng)](#6-hướng-dẫn-cấu-hình-custom-domain-tên-miền-riêng)
   - [Nguyên lý Cấu hình: Domain Gốc (@) vs Subdomain](#nguyên-lý-cấu-hình-domain-gốc--vs-subdomain)
   - [Ví dụ Thực tế Từng Bước (Case Study: Kết nối tên miền `yourdomain.com`)](#ví-dụ-thực-tế-từng-bước-case-study-kết-nối-tên-miền-yourdomaincom)
   - [Xử lý Sự cố Thường gặp (Xung đột DNS & Cache Trình duyệt)](#xử-lý-sự-cố-thường-gặp-xung-đột-dns--cache-trình-duyệt)
7. [Tài liệu API của Backend Agent (HTTP Loopback)](#7-tài-liệu-api-của-backend-agent-http-loopback)
8. [Kiểm thử Tự động (Testing)](#8-kiểm-thử-tự-động-testing)
9. [Bảng Lệnh Scripts (NPM Reference)](#9-bảng-lệnh-scripts-npm-reference)

---

## 1. Tổng quan Kiến trúc Hệ thống

Ứng dụng được thiết kế theo mô hình **Hybrid Client-Agent Architecture** nhằm kết hợp sức mạnh giao diện thời gian thực của Single Page App (SPA) với năng lực tương tác hệ điều hành và bảo mật hạ tầng của Companion Agent:

* **Frontend (React 19 + Vite):** Chạy trên trình duyệt người dùng, đảm nhiệm giao diện Quản trị Merchant Dashboard và Cửa hàng Người mua (Buyer Storefront).
* **Cloud Database (Firebase):** Xác thực người dùng (Auth) và lưu trữ dữ liệu thời gian thực (Realtime Database).
* **Backend Companion Agent (Node.js ESM):** Dịch vụ backend chạy nền (`agent/`), tương tác với hệ điều hành (build Vite, giải nén ZIP landing page) và bảo vệ tuyệt đối các Secret API Key của Bunny.net.
* **Edge Network (Bunny.net):** Mạng phân phối nội dung toàn cầu (CDN Pull Zone), lưu trữ tệp tĩnh (Storage Zone) và hệ thống phân giải tên miền (Bunny DNS với tính năng PZ Flattening độc quyền).

### Sơ đồ Luồng Hoạt động Tổng thể

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        TRÌNH DUYỆT (BROWSER)                           │
│  ┌─────────────────────────┐             ┌──────────────────────────┐  │
│  │   Merchant Dashboard    │             │     Buyer Storefront     │  │
│  │ (Items, Store Setup...) │             │      (/store/:slug)      │  │
│  └───────────┬─────────────┘             └────────────┬─────────────┘  │
└──────────────┼────────────────────────────────────────┼────────────────┘
               │                                        │
        ┌──────┴──────────────────┐                     │
   HTTP │ (127.0.0.1:4567)        │ Realtime Listeners  │
        ▼                         ▼                     ▼
┌──────────────────┐       ┌─────────────────────────────────────────────┐
│  BACKEND AGENT   │       │               FIREBASE CLOUD                │
│ (Node.js Daemon) │◀─────▶│  • Authentication                           │
│     agent/       │ Sync  │  • Realtime Database (Items, Jobs, Config)  │
└────────┬─────────┘       └─────────────────────────────────────────────┘
         │
         │ Bunny REST APIs & Storage HTTP PUT
         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BUNNY.NET EDGE & CDN                            │
│  • Storage Zone: Lưu trữ bundle dist/ hoặc Landing Page ZIP/HTML       │
│  • Pull Zone: CDN Cache toàn cầu, SSL Let's Encrypt tự động            │
│  • Bunny DNS: Nameservers & Bản ghi Pull Zone (PZ) cho Domain gốc (@)  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Kiến trúc Frontend (FE Architecture)

### Công nghệ sử dụng
* **React 19** & **Vite**: Khởi động tức thì, Hot Module Replacement (HMR).
* **React Router 7**: Điều hướng trang, phân chia quyền truy cập bảo vệ tuyến đường (Protected Routes).
* **Styling**: Hệ thống Design Tokens CSS thuần kết hợp Tailwind CSS v4.
* **Lucide React Icons**: Bộ biểu tượng vector hiện đại.

### Các Phân hệ Chức năng Chính

1. **Authentication & Onboarding (`src/components/SignIn`, `SignUp`, `Onboarding`):**
   * Đăng ký, đăng nhập tài khoản Merchant qua Firebase Auth.
   * Xác thực Email, thiết lập thông tin doanh nghiệp ban đầu.

2. **Merchant Dashboard (`src/features/dashboard/`):**
   * **Item Library (`items/`):** Quản lý danh mục món, giá bán, hình ảnh, phân trang và bộ lọc nâng cao.
   * **Categories (`categories/`):** Cây danh mục cha/con, sắp xếp thứ tự hiển thị.
   * **Modifiers (`modifiers/`):** Nhóm tùy chọn (Topping, Size, Đường, Đá...), hỗ trợ ghi đè giá theo từng món (*Nested Modifier Overrides*).

3. **Online Storefront Hub (`src/features/dashboard/online/`):**
   * **Store Branding:** Tên cửa hàng, upload logo (Cloudinary), chọn màu sắc chủ đề (*Theme Colors*).
   * **Store Slug:** Thiết lập link mặc định `square.site/slug`.
   * **Custom Domain Hub:** Tích hợp tên miền riêng qua giao diện 2-Tab trực quan (Bunny DNS cho domain gốc `@` hoặc CNAME cho subdomain `www`).
   * **Deploy Hub:** Điều khiển tiến trình build và deploy lên CDN với log streaming trực tiếp từ backend.

4. **Buyer Storefront (`src/storefront/`):**
   * Giao diện người mua đặt hàng tại `/store/:slug`.
   * Menu dạng lưới, giỏ hàng (*Cart Drawer*), chọn biến thể món & modifier, tính tổng tiền tự động theo thời gian thực.

### Cấu trúc Thư mục Frontend (`src/`)

```text
src/
├── app/                          # Cấu hình routes và providers trung tâm
├── components/                   # UI primitives tái sử dụng (Button, Input, Modal, Layouts...)
├── constants/                    # Hằng số tĩnh, menu navigation, bảng mã MCC
├── features/                     # Các module nghiệp vụ theo Domain
│   ├── auth/                     # Showcase, carousel đăng nhập
│   ├── dashboard/                # Toàn bộ tính năng quản trị Merchant
│   │   ├── common/               # Component dùng chung (UnsavedChangesModal...)
│   │   ├── home/                 # Màn hình Dashboard Home & Metrics
│   │   ├── items/                # Quản lý Items & Modifiers
│   │   ├── categories/           # Quản lý Categories
│   │   └── online/               # Thiết lập Online Store, Custom Domain & Deploy
│   └── onboarding/               # Flow thiết lập doanh nghiệp ban đầu
├── firebase/                     # Firebase Client SDK & Services
├── services/                     # Business Services (onlineStoreService, cloudinary...)
├── storefront/                   # Giao diện đặt món cho khách hàng
└── styles/                       # CSS Tokens, Base, Reset, Global styles
```

---

## 3. Kiến trúc Backend (BE Architecture — Node.js Agent)

Backend Agent là một **Local Companion Service** được viết bằng **Node.js (ESM)** nằm trong thư mục [`agent/`](file:///Users/nguyentrongbao/Documents/Code/Learning/square-clone-2/agent).

### Tại sao cần Backend Agent này?
1. **Bảo mật tuyệt đối (Zero Credential Leaks):** Các khóa quản trị `BUNNY_ACCOUNT_API_KEY` và `BUNNY_STORAGE_ZONE_PASSWORD` chỉ lưu trong file `agent/.env`. Trình duyệt của người dùng **không bao giờ** tiếp xúc với các khóa này.
2. **Quyền hạn cấp Hệ điều hành (OS / File System):** Trình duyệt không thể chạy lệnh build Vite hay giải nén file `.zip`. Backend Agent sử dụng `node:child_process` để chạy `npm run build` và thư viện `adm-zip` để giải nén landing page.
3. **Phân giải DNS cấp mạng:** Sử dụng `node:dns/promises` để truy vấn bản ghi CNAME, A-record, NS-record và ping kiểm tra trang web trực tiếp.
4. **Không nuốt lỗi ngầm (No Silent Swallowing):** Mọi thao tác lỗi mạng, parse JSON hay kết nối Firebase đều có log cảnh báo chi tiết giúp gỡ lỗi tức thì.

### Cấu trúc Mô-đun của Backend (`agent/`)

```text
agent/
├── index.js                      # Entry point (~60 dòng): Bootstrap, mở HTTP server, bắt SIGINT/SIGTERM
├── config.js                     # Đọc .env, xuất biến môi trường, nhận diện Simulated Mode
│
├── clients/                      # Tầng tích hợp API bên ngoài & tiện ích mạng
│   ├── mimeTypes.js              # Bảng tra cứu Content-Type chuẩn theo đuôi file
│   ├── bunnyManagement.js        # Gắn/Xóa Hostname, cấp phát Let's Encrypt SSL, Purge Cache
│   ├── bunnyStorage.js           # Upload file tĩnh HTTP PUT, liệt kê file, Smart Sync xóa file rác
│   └── dnsVerifier.js            # Kiểm tra CNAME, Nameservers và kiểm tra live website
│
├── services/                     # Business Logic cốt lõi
│   ├── firebaseClient.js         # Khởi tạo Firebase App, Auth và kết nối RTDB
│   ├── jobStore.js               # Quản lý in-memory Deployments Map & ghi streaming logs
│   ├── domainService.js          # Xử lý tập trung logic domain (attach, verify, remove)
│   └── deploymentService.js      # Pipeline build Vite, unpack ZIP landing page, upload & verify
│
├── server/                       # Tầng Local HTTP API (Loopback 127.0.0.1:4567)
│   ├── server.js                 # Native http.createServer và xử lý CORS preflight
│   ├── routes.js                 # Định tuyến (/status, /domain/*, /deploy/*)
│   └── utils.js                  # sendJson và parseJsonBody helpers
│
├── listeners/                    # Lắng nghe sự kiện từ Firebase
│   ├── heartbeat.js              # Gửi định kỳ nhịp tim online/simulated lên RTDB
│   └── dbJobListener.js          # Lắng nghe hàng đợi domainJobs & deploymentJobs
│
└── bunnyClient.js                # Facade re-export (tương thích ngược 100% với các test cũ)
```

---

## 4. Hai Kênh Giao tiếp Song song giữa FE và BE

Hệ thống hỗ trợ cơ chế giao tiếp kép linh hoạt:

```text
                   ┌───────────────────────────────────┐
                   │        Frontend Dashboard         │
                   └─────────┬───────────────┬─────────┘
                             │               │
        [Kênh 1: Local HTTP] │               │ [Kênh 2: Firebase RTDB Queue]
        (127.0.0.1:4567)     │               │ (domainJobs / deploymentJobs)
                             ▼               ▼
                   ┌───────────────────────────────────┐
                   │       Backend Node.js Agent       │
                   └───────────────────────────────────┘
```

* **Kênh 1 — HTTP Loopback (`http://127.0.0.1:4567`):** Frontend gửi request trực tiếp khi chạy local. Phản hồi tức thì trong vài mili-giây.
* **Kênh 2 — Firebase Realtime Database Queue:** Frontend đẩy job vào node `deploymentJobs` hoặc `domainJobs`. Backend Agent lắng nghe qua `onValue`, tự động bốc job về xử lý và đẩy log tiến độ ngược lại Firebase để UI hiển thị theo thời gian thực (hỗ trợ kể cả khi Agent chạy ở một máy chủ nội bộ khác).

---

## 5. Hướng dẫn Cài đặt & Khởi chạy (Getting Started)

### Yêu cầu hệ thống
* **Node.js**: Phiên bản `>= 20.12.0` (hỗ trợ `process.loadEnvFile` và ESM native).
* **NPM**: `>= 10.0.0`.

### Bước 1: Cài đặt Dependencies
```bash
npm install
```

### Bước 2: Cấu hình Biến môi trường

#### 1. Cấu hình Frontend (`.env` tại thư mục gốc)
Tạo file `.env` từ file mẫu:
```bash
cp .env.example .env
```
Điền thông tin dự án Firebase của bạn:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### 2. Cấu hình Backend Agent (`agent/.env`)
Tạo file `agent/.env` từ file mẫu:
```bash
cp agent/.env.example agent/.env
```
Điền thông tin xác thực Bunny.net của bạn:
```env
# 1. Bunny Management API Key (Lấy tại: Account Settings -> API Key)
BUNNY_ACCOUNT_API_KEY=your_bunny_account_api_key

# 2. Pull Zone Information (Lấy tại: CDN -> Chọn Pull Zone của bạn)
BUNNY_PULL_ZONE_ID=123456
BUNNY_CDN_HOSTNAME=yourstore.b-cdn.net

# 3. Storage Zone Information (Dùng cho Build & Deploy tài nguyên tĩnh)
BUNNY_STORAGE_ZONE_NAME=your_storage_zone
BUNNY_STORAGE_ZONE_PASSWORD=your_storage_zone_password
BUNNY_STORAGE_HOSTNAME=storage.bunnycdn.com
```

> 💡 **Chế độ Mô phỏng (Simulated Mode):**  
> Nếu bạn chưa có tài khoản Bunny.net hoặc chưa điền API Key, Agent sẽ tự động chạy ở **Chế độ Mô phỏng (Simulated Mode)**. Bạn vẫn có thể thử nghiệm toàn bộ luồng giao diện trên Dashboard (thêm domain, xem bảng DNS, test thanh tiến trình deploy 0-100%) mà không gặp lỗi.

### Bước 3: Khởi chạy Ứng dụng

Mở 2 cửa sổ terminal riêng biệt:

**Terminal 1 — Khởi động Backend Agent:**
```bash
npm run agent
```
*Agent sẽ lắng nghe tại `http://127.0.0.1:4567` và gửi nhịp tim định kỳ 12 giây đến Firebase.*

**Terminal 2 — Khởi động Frontend Dev Server:**
```bash
npm run dev
```
*Truy cập ứng dụng tại `http://localhost:5173`.*

---

## 6. Hướng dẫn Cấu hình Custom Domain (Tên miền riêng)

### Nguyên lý Cấu hình: Domain Gốc (@) vs Subdomain

* **Domain Gốc (Apex Domain, ví dụ `mybrand.com`):** Tiêu chuẩn mạng quốc tế (RFC 1035) **không cho phép** đặt bản ghi `CNAME` tại domain gốc `@`. Bunny.net giải quyết triệt để vấn đề này thông qua hệ thống **Bunny DNS** với tính năng độc quyền: **Bản ghi Pull Zone (PZ Record / CNAME Flattening)**.
* **Subdomain (ví dụ `www.mybrand.com` hoặc `shop.mybrand.com`):** Sử dụng bản ghi chuẩn `CNAME` trỏ về địa chỉ CDN (`yourstore.b-cdn.net`).

---

### Ví dụ Thực tế Từng Bước (Case Study: Kết nối tên miền `yourdomain.com`)

Dưới đây là kịch bản thực tế từng bước khi cấu hình một tên miền riêng (ví dụ **`yourdomain.com`**) vào Bunny Pull Zone (ví dụ **`myzone`**, URL CDN: `myzone.b-cdn.net`):

```text
               ┌────────────────────────────────────────────────────────┐
               │         1. NHÀ ĐĂNG KÝ TÊN MIỀN (REGISTRAR)            │
               │   Đổi Nameservers sang: kiki.bunny.net & coco.bunny.net│
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                 2. BUNNY.NET DNS ZONE                  │
               │   • Record @   : Type PZ    -> Chọn Pull Zone myzone   │
               │   • Record www : Type CNAME -> myzone.b-cdn.net        │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │             3. BUNNY.NET PULL ZONE HOSTNAMES           │
               │   • Thêm yourdomain.com     -> Bật SSL (Let's Encrypt) │
               │   • Thêm www.yourdomain.com -> Bật SSL (Let's Encrypt) │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │         4. DASHBOARD ONLINE STORE SETUP (UI)           │
               │  Nhập "yourdomain.com" -> Connect -> Verify DNS & SSL  │
               └────────────────────────────────────────────────────────┘
```

#### Bước 1: Cấu hình tại Nhà đăng ký tên miền (Domain Registrar)
*(Áp dụng cho các nhà cung cấp như Cloudflare, GoDaddy, Namecheap, iNet, Tenten, PA Việt Nam...)*
1. Đăng nhập trang quản lý tên miền (ví dụ `yourdomain.com`).
2. Tìm đến mục **Nameservers / Quản lý Máy chủ DNS** và chọn chế độ **Custom Nameservers**.
3. Điền 2 địa chỉ Nameserver của Bunny:
   * **Nameserver 1:** `kiki.bunny.net`
   * **Nameserver 2:** `coco.bunny.net`
4. **Lưu ý:** Xoá sạch toàn bộ các bản ghi `A` hoặc `CNAME` cũ đang trỏ về máy chủ hosting trước đó để tránh xung đột.

#### Bước 2: Tạo DNS Zone và thêm Bản ghi trên Bunny.net (Bunny DNS)
1. Đăng nhập [dash.bunny.net](https://dash.bunny.net/) -> Vào menu **DNS** -> Bấm **Add Domain**.
2. Nhập `yourdomain.com` và bấm Add.
3. Thêm 2 bản ghi sau vào bảng DNS:

| Tên / Host | Loại (Record Type) | Giá trị (Value) | Giải thích |
| :--- | :--- | :--- | :--- |
| `@` *(để trống)* | **PZ (Pull Zone)** | Chọn Pull Zone **`myzone`** | Tính năng CNAME Flattening độc quyền của Bunny DNS cho domain gốc |
| `www` | **CNAME** | **`myzone.b-cdn.net`** | Trỏ subdomain www về thẳng mạng CDN của Bunny |

#### Bước 3: Thêm Hostnames và Bật SSL trên Bunny Pull Zone
1. Vào menu **CDN** trên Bunny.net -> Chọn Pull Zone của bạn (ví dụ `myzone`).
2. Ở menu điều hướng bên trái, chọn mục **Hostnames**.
3. Thêm 2 hostname:
   * Bấm **Add Custom Hostname** -> Nhập `yourdomain.com` -> Bấm Add.
   * Tại dòng `yourdomain.com`, bấm nút **Enable SSL** (Bunny sẽ tự động phát hành chứng chỉ Let's Encrypt miễn phí).
   * Bấm **Add Custom Hostname** lần 2 -> Nhập `www.yourdomain.com` -> Bấm Add.
   * Tại dòng `www.yourdomain.com`, bấm nút **Enable SSL**.

#### Bước 4: Thao tác trên Giao diện Online Store Setup (Dashboard)
1. Mở Merchant Dashboard tại `http://localhost:5173` -> Vào **Dashboard** -> **Online** -> cuộn xuống mục **Custom Domain**.
2. Nhập `yourdomain.com` vào ô nhập liệu -> Bấm nút **Connect Domain**.
3. Backend Agent sẽ gọi Bunny Management API để kiểm tra hostname và lưu thông tin vào Firebase.
4. Bấm **Verify DNS & SSL**. Khi hệ thống xác minh thành công, bạn sẽ thấy trạng thái:
   * Trạng thái kết nối: **Connected & Secured ✅**
   * Chứng chỉ SSL: **Active (Let's Encrypt) 🔒**

---

### Xử lý Sự cố Thường gặp (Xung đột DNS & Cache Trình duyệt)

> ⚠️ **Sự cố Phổ biến:**  
> Sau khi cấu hình hoàn tất, bạn truy cập link CDN mặc định (ví dụ `https://myzone.b-cdn.net`) thì thấy trang web mới hoạt động bình thường, nhưng khi gõ tên miền chính (ví dụ `https://yourdomain.com`) trên trình duyệt thì vẫn hiển thị trang web cũ, bị chuyển hướng sai (Redirect Loop) hoặc báo lỗi 404.

#### 1. Nguyên nhân kỹ thuật
* **Bộ nhớ đệm chuyển hướng của trình duyệt (Browser Disk Cache):** Nếu trước đây tên miền từng trỏ về một nền tảng hosting khác có thiết lập mã chuyển hướng vĩnh viễn (`HTTP 301` hoặc `HTTP 308`), trình duyệt sẽ lưu cứng quy tắc này vào Disk Cache. Khi người dùng truy cập lại, trình duyệt tự động chuyển hướng theo cấu hình cũ thay vì gửi truy vấn mới tới mạng CDN.
* **Thời gian trễ phân giải DNS (DNS Propagation):** Các bản ghi DNS máy chủ trung gian hoặc ISP cần thời gian để cập nhật và làm sạch dữ liệu đệm cũ.

#### 2. Các bước khắc phục
1. **Gỡ bỏ tên miền ở dịch vụ hosting cũ:** Đảm bảo bạn đã truy cập bảng quản trị của nhà cung cấp hosting cũ (nếu có) để ngắt kết nối tên miền, tránh việc máy chủ cũ tiếp tục phát sinh phản hồi lỗi hoặc chuyển hướng.
2. **Kiểm tra đủ 2 bản ghi trên Bunny DNS:** Luôn đảm bảo đã tạo cả bản ghi PZ cho domain gốc (`@`) và bản ghi CNAME cho subdomain (`www`).
3. **Xoá bộ nhớ đệm trình duyệt:**
   * Mở cửa sổ **Ẩn danh (Incognito Window)** để kiểm tra trang web sạch cache.
   * Hoặc nhấn tổ hợp phím **`Cmd + Shift + R`** (trên macOS) / **`Ctrl + Shift + R`** (trên Windows) để tải lại toàn bộ tài nguyên.
4. **Kiểm tra chuẩn xác qua Terminal (Bỏ qua toàn bộ cache):**
   Chạy lệnh sau trên terminal để kiểm tra phản hồi thực tế từ Edge Server:
   ```bash
   curl -I https://yourdomain.com
   ```
   Nếu kết quả trả về `HTTP/2 200` và header `server: BunnyCDN` là hệ thống đã hoạt động chính xác.

---

## 7. Tài liệu API của Backend Agent (HTTP Loopback)

Backend Agent cung cấp các REST endpoint nội bộ tại `http://127.0.0.1:4567`:

| Phương thức | Endpoint | Mô tả | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/status` | Lấy trạng thái Agent, nhịp tim, chế độ mô phỏng và cấu hình CDN. | *Không* | `{ status, simulated, bunnyPullZoneId, ... }` |
| `POST` | `/domain/attach` | Gắn hostname vào Bunny Pull Zone và kiểm tra sơ bộ DNS. | `{ domain: "yourdomain.com" }` | `{ success: true, domain, status, dns }` |
| `POST` | `/domain/verify` | Kiểm tra phân giải DNS và kích hoạt chứng chỉ SSL Let's Encrypt. | `{ domain: "yourdomain.com" }` | `{ success: true, verified, sslActive, dns }` |
| `POST` | `/domain/remove` | Xóa hostname khỏi Bunny Pull Zone và dọn dẹp database. | `{ domain: "yourdomain.com" }` | `{ success: true, domain }` |
| `POST` | `/deploy` | Khởi chạy tiến trình build Vite hoặc giải nén Landing Page ZIP/HTML. | FormData (`sourceType: "react" \| "landing"`, `file`) | `{ success: true, deploymentId, status }` |
| `GET` | `/deploy/:id` | Lấy chi tiết tiến độ (`progress` 0-100%), trạng thái và logs trực tiếp. | *Không* | `{ id, status, progress, logs: [...] }` |

---

## 8. Kiểm thử Tự động (Testing)

Dự án tích hợp bộ kiểm thử tự động sử dụng **Node.js Test Runner Native** (không cần cài thêm Jest hay Mocha nặng nề):

```bash
npm test
```

### Nội dung Kiểm thử (Toàn bộ 44/44 Test Cases Đều Đạt):
* **Custom Domain & DNS Verification:** Kiểm tra chuẩn hóa định dạng RFC 1035, làm sạch hostname, mã hóa key RTDB, kiểm tra phân giải CNAME và fallback `www` cho domain gốc.
* **MIME Types & Storage Upload:** Xác định chính xác Content-Type cho toàn bộ tài nguyên web tĩnh (HTML, CSS, JS, WebP, SVG, WOFF2).
* **Landing Page Extraction & Auto-Flattening:** Giải nén flat zip, tự động xử lý và làm phẳng zip chứa thư mục bọc ngoài, xác thực sự tồn tại của `index.html`.
* **Smart Sync Clean:** Thuật toán so khớp file thông minh giúp dọn sạch file tĩnh mồ côi trên Bunny Storage mà không ảnh hưởng đến các file đang dùng.
* **Dashboard Routing & State Management:** Khớp đường dẫn URL, chuẩn hóa cấu trúc Modifier Sets và Item Form State.

---

## 9. Bảng Lệnh Scripts (NPM Reference)

```bash
npm run dev        # Khởi động Frontend Vite development server (http://localhost:5173)
npm run agent      # Khởi động Backend Node.js Bunny Agent (http://127.0.0.1:4567)
npm test           # Chạy toàn bộ 44 unit & integration test cases
npm run build      # Biên dịch mã nguồn React sang thư mục production dist/
npm run preview    # Xem thử bản build production local
npm run lint       # Kiểm tra quy chuẩn mã nguồn bằng ESLint
```
