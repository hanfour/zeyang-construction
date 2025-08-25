# 🔧 澤暘建設網站 - 環境變數 (ENV) 完整設定指南

## 📌 重要說明
網站分為**前端**和**後端**兩個部分，各自需要設定不同的環境變數。

---

## 1️⃣ 前端 ENV 設定（最重要！）

### 📍 檔案位置
- **開發環境**：`frontend/.env`
- **FTP 上傳**：不需要上傳 .env 檔案（已經打包在 build 裡）

### ⚠️ 重要：前端 ENV 已經被打包進去了！

**如果要修改前端 ENV，需要：**
1. 修改 `frontend/.env` 檔案
2. 重新執行 `npm run build`
3. 重新上傳 build 資料夾

### 📝 前端 ENV 設定內容

```env
# ===== 必須設定（非常重要！） =====
VITE_API_URL=https://zeyanggroup.com.tw/api
# 說明：後端 API 的網址
# 注意：結尾不要加斜線 /
# 錯誤示例：https://zeyanggroup.com.tw/api/ ❌
# 正確示例：https://zeyanggroup.com.tw/api ✅

# ===== 網站基本資訊 =====
VITE_APP_NAME=澤暘建設
VITE_APP_DESCRIPTION=誠信築基・匠心營造

# ===== 選擇性設定 =====
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
# 如果不需要地圖功能，可以保持原樣
```

---

## 2️⃣ 後端 ENV 設定（必須在伺服器上設定）

### 📍 檔案位置
- **伺服器上**：`backend/.env`
- **虛擬主機**：通常在控制面板的「環境變數」或「Node.js 設定」

### 📝 後端 ENV 設定內容（必要項目）

```env
# ===== 基礎設定 =====
NODE_ENV=production
PORT=5001

# ===== 資料庫連線（非常重要！） =====
DB_HOST=localhost
DB_PORT=3306
DB_NAME=您的資料庫名稱        # 例如：zeyang
DB_USER=您的資料庫使用者       # 廠商提供
DB_PASSWORD=您的資料庫密碼     # 廠商提供

# ===== JWT 認證（必須設定！） =====
JWT_SECRET=zeyang-jwt-secret-key-2024-please-change-this
JWT_EXPIRES_IN=24h
REFRESH_SECRET=zeyang-refresh-secret-key-2024-please-change
REFRESH_EXPIRES_IN=7d

# ===== CORS 設定（重要！） =====
CLIENT_URL=https://zeyanggroup.com.tw
ALLOWED_ORIGINS=https://zeyanggroup.com.tw,https://www.zeyanggroup.com.tw

# ===== 檔案上傳 =====
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=268435456
```

### 📝 後端 ENV 設定內容（選擇性項目）

```env
# ===== 郵件服務（如需聯絡表單發信） =====
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@zeyanggroup.com.tw
SMTP_PASS=您的郵件密碼
ADMIN_EMAIL=admin@zeyanggroup.com.tw

# ===== 系統設定 =====
LOG_LEVEL=info
ENABLE_SWAGGER=false
```

---

## 3️⃣ 設定步驟說明

### 🔴 前端設定（已經完成，但如果需要修改）

1. **本地修改**（在您的電腦上）：
   ```bash
   cd frontend
   # 編輯 .env 檔案
   # 修改 VITE_API_URL=https://zeyanggroup.com.tw/api
   ```

2. **重新建置**：
   ```bash
   npm run build
   ```

3. **重新上傳**：
   - 將新的 build 資料夾內容上傳到 FTP

### 🔵 後端設定（廠商需要在伺服器上設定）

#### 方法 A：透過虛擬主機控制面板

1. 登入虛擬主機控制面板
2. 找到「Node.js 應用程式」或「環境變數」
3. 新增以下變數：
   ```
   NODE_ENV = production
   PORT = 5001
   DB_HOST = localhost
   DB_NAME = [資料庫名稱]
   DB_USER = [資料庫使用者]
   DB_PASSWORD = [資料庫密碼]
   JWT_SECRET = [安全密鑰]
   CLIENT_URL = https://zeyanggroup.com.tw
   ALLOWED_ORIGINS = https://zeyanggroup.com.tw
   ```

#### 方法 B：直接編輯 .env 檔案

1. 透過 FTP 或 SSH 連線到伺服器
2. 進入 `backend` 資料夾
3. 建立或編輯 `.env` 檔案
4. 貼入上述設定內容
5. 重啟 Node.js 應用程式

---

## 4️⃣ 驗證設定是否正確

### ✅ 檢查前端設定
1. 開啟瀏覽器開發者工具（F12）
2. 進入 Network 標籤
3. 重新整理頁面
4. 查看 API 請求是否指向正確網址
   - 應該看到：`https://zeyanggroup.com.tw/api/...`
   - 不應該看到：`http://localhost:5001/api/...`

### ✅ 檢查後端設定
1. 訪問：`https://zeyanggroup.com.tw/api/health`
2. 應該看到：`It works! NodeJS 18.20.8`
3. 如果看到錯誤，表示後端 ENV 設定有問題

### ✅ 檢查資料庫連線
1. 嘗試登入管理後台
2. 如果無法登入，可能是：
   - 資料庫連線設定錯誤
   - JWT_SECRET 未設定
   - 資料庫未建立管理員帳號

---

## 5️⃣ 給廠商的簡化版設定清單

### 請廠商確認/設定以下項目：

#### 1. 後端環境變數（在伺服器上）
```
NODE_ENV = production
PORT = 5001
DB_HOST = localhost
DB_NAME = [請填入資料庫名稱]
DB_USER = [請填入資料庫使用者]
DB_PASSWORD = [請填入資料庫密碼]
JWT_SECRET = zeyang-secret-key-2024
CLIENT_URL = https://zeyanggroup.com.tw
ALLOWED_ORIGINS = https://zeyanggroup.com.tw
```

#### 2. 檢查清單
- [ ] 資料庫已建立並匯入 schema.sql
- [ ] 後端 Node.js 應用程式已啟動
- [ ] 環境變數已設定（特別是資料庫連線）
- [ ] 訪問 /api/health 有回應

---

## ❌ 常見錯誤

### 錯誤 1：API 請求失敗
**原因**：前端 VITE_API_URL 設定錯誤
**解決**：檢查前端是否已重新建置

### 錯誤 2：CORS 錯誤
**原因**：後端 ALLOWED_ORIGINS 未設定
**解決**：確認後端 ENV 有設定 ALLOWED_ORIGINS

### 錯誤 3：無法連線資料庫
**原因**：DB_HOST、DB_USER、DB_PASSWORD 設定錯誤
**解決**：確認資料庫連線資訊正確

### 錯誤 4：無法登入後台
**原因**：JWT_SECRET 未設定或資料庫無管理員
**解決**：設定 JWT_SECRET 並匯入初始管理員.sql

---

## 📞 需要提供給開發人員的資訊

如果需要協助，請提供：
1. 資料庫連線資訊（主機、名稱、使用者）
2. 錯誤訊息截圖
3. /api/health 的回應內容
4. 瀏覽器 Console 錯誤訊息

---

**最後更新**：2025-08-22
**版本**：1.0.0