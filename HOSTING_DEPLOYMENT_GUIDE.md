# 虛擬主機部署問題解決指南

## 問題診斷
廠商看到 'index.html' 畫面表示前端沒有正確建置或部署。以下是完整的解決方案：

## 🚨 重要：前端需要先建置（Build）

### 步驟 1：建置前端應用程式
```bash
cd frontend
npm install
npm run build
```

這會在 `frontend/build` 目錄產生靜態檔案（注意：根據 vite.config.ts 設定，輸出目錄是 `build` 而非 `dist`）

### 步驟 2：正確的檔案結構
部署到虛擬主機時，檔案結構應該是：
```
/public_html/yourdomain/
├── index.html (從 frontend/build/index.html 複製)
├── assets/    (從 frontend/build/assets/ 複製)
├── images/    (從 frontend/public/images/ 複製)
├── backend/   (後端 API 服務)
│   ├── server.js
│   ├── package.json
│   ├── node_modules/
│   └── 其他後端檔案...
└── .htaccess  (設定 API 代理)
```

### 步驟 3：虛擬主機的 .htaccess 設定
在網站根目錄建立 `.htaccess` 檔案：
```apache
RewriteEngine On

# API 請求代理到 Node.js 應用程式
RewriteRule ^api/(.*)$ http://localhost:5001/api/$1 [P,L]

# 檔案上傳代理
RewriteRule ^uploads/(.*)$ http://localhost:5001/uploads/$1 [P,L]

# 前端路由處理 (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api
RewriteCond %{REQUEST_URI} !^/uploads
RewriteRule . /index.html [L]
```

### 步驟 4：後端環境變數設定
在虛擬主機控制面板或 `backend/.env` 檔案中設定：
```env
NODE_ENV=production
PORT=5001
CLIENT_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com

# 資料庫設定
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# JWT 設定
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRES_IN=24h
```

### 步驟 5：啟動後端服務
在虛擬主機控制面板設定 Node.js 應用程式：
- **應用程式根目錄**: `/public_html/yourdomain/backend`
- **啟動檔案**: `server.js`
- **Node.js 版本**: 18.0.0 或更高

或使用 SSH 手動啟動：
```bash
cd backend
npm install --production
node server.js
```

## 🔍 驗證部署

### 1. 檢查前端是否正確顯示
訪問 `https://yourdomain.com` 應該看到網站首頁，而不是純文字的 index.html

### 2. 檢查 API 是否運作
訪問 `https://yourdomain.com/api/health` 應該返回 JSON 格式的健康檢查回應

### 3. 檢查網路請求
在瀏覽器開發者工具的 Network 標籤中，確認 API 請求是否正確代理到後端

## 📝 完整部署檢查清單

- [ ] 前端已執行 `npm run build` 建置
- [ ] `frontend/build` 內容已複製到網站根目錄
- [ ] `frontend/public/images` 已複製到網站根目錄
- [ ] `.htaccess` 檔案已正確設定
- [ ] 後端 Node.js 應用程式已啟動
- [ ] 環境變數已正確設定
- [ ] 資料庫已建立並匯入結構
- [ ] CORS 設定正確（ALLOWED_ORIGINS）
- [ ] 網站可正常訪問，顯示 React 應用程式
- [ ] API 請求正常回應

## 🛠️ 故障排除

### 問題：仍然看到 index.html 的原始碼
**原因**：前端沒有建置或檔案路徑錯誤
**解決**：
1. 確認執行了 `npm run build`
2. 確認 `build` 目錄內容已複製到正確位置
3. 檢查瀏覽器控制台是否有 404 錯誤

### 問題：API 請求失敗
**原因**：後端服務未啟動或代理設定錯誤
**解決**：
1. 確認 Node.js 應用程式正在運行
2. 檢查 `.htaccess` 代理規則
3. 確認 CORS 設定正確

### 問題：頁面刷新後出現 404
**原因**：React Router 的路由處理問題
**解決**：確認 `.htaccess` 包含正確的重寫規則

## 📞 緊急修復步驟

如果廠商需要快速修復，請按以下步驟操作：

1. **SSH 登入虛擬主機**
2. **進入專案目錄**
   ```bash
   cd /public_html/yourdomain
   ```
3. **建置前端**
   ```bash
   cd frontend
   npm install
   npm run build
   ```
4. **複製建置檔案到網站根目錄**
   ```bash
   cp -r build/* ../
   cp -r public/images ../
   ```
5. **啟動後端服務**
   ```bash
   cd ../backend
   npm install --production
   node server.js &
   ```

## 🔐 安全提醒

- 更改所有預設密碼
- 設定正確的檔案權限（.env 檔案應為 600）
- 使用 HTTPS（SSL 憑證）
- 定期備份資料庫和上傳檔案

---
**最後更新**: 2025-08-22
**適用版本**: ZeYang Construction v1.0.0