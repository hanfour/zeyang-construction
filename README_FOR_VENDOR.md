# ZeYang 澤暘建設網站 - 廠商部署指南

## 📦 打包檔案說明

此打包檔案包含 ZeYang 澤暘建設網站的完整專案，包括：
- 前端網站 (React + TypeScript)
- 後端 API (Node.js + Express)
- 資料庫結構 (MySQL)
- 完整部署腳本

## 🚀 快速部署 (5 分鐘內完成)

### 1. 系統需求
- **Node.js 18+** (必須)
- **MySQL 8.0+** (必須)
- **Linux/macOS/Windows** (推薦 Ubuntu 20.04+)

### 2. 部署步驟

#### 步驟 1: 解壓縮檔案
```bash
tar -xzf zeyang-construction-deployment-20250817_104718.tar.gz
cd zeyang-construction-deployment-20250817_104718
```

#### 步驟 2: 設定執行權限
```bash
chmod +x deployment/scripts/*.sh
```

#### 步驟 3: 安裝依賴套件
```bash
./deployment/scripts/install.sh
```

#### 步驟 4: 設定資料庫
```bash
./deployment/scripts/setup-database.sh
```
系統會詢問：
- MySQL 主機 (預設: localhost)
- MySQL 使用者名稱
- MySQL 密碼
- 資料庫名稱 (預設: zeyang)

#### 步驟 5: 啟動服務
```bash
./deployment/scripts/start.sh
```

### 3. 訪問網站
- **前端網站**: http://localhost:5173
- **管理後台**: http://localhost:5173/admin
- **後端 API**: http://localhost:5001/api

### 4. 預設管理員帳號
- **帳號**: admin
- **密碼**: admin123

## 📁 檔案結構

```
zeyang-construction-deployment-YYYYMMDD_HHMMSS/
├── backend/                 # 後端 API 服務
├── frontend/               # 前端網站
├── deployment/
│   ├── scripts/           # 部署腳本
│   │   ├── install.sh     # 安裝腳本
│   │   ├── setup-database.sh  # 資料庫設定
│   │   ├── start.sh       # 啟動服務
│   │   └── stop.sh        # 停止服務
│   ├── database/          # 資料庫檔案
│   │   ├── schema.sql     # 資料庫結構
│   │   └── migrations/    # 資料庫遷移
│   ├── config/            # 配置範例
│   └── docs/              # 文件
└── DEPLOYMENT_GUIDE.md     # 詳細部署指南
```

## ⚡ 服務管理

### 啟動服務
```bash
./deployment/scripts/start.sh
```

### 停止服務
```bash
./deployment/scripts/stop.sh
```

### 重新啟動
```bash
./deployment/scripts/stop.sh
./deployment/scripts/start.sh
```

## 🌐 生產環境部署選項

### 選項 1: 自建伺服器 (使用 Nginx + PM2)

#### 使用 Nginx (推薦)
```bash
# 安裝 Nginx
sudo apt install nginx

# 使用提供的配置範例
cp deployment/config/nginx.conf.example /etc/nginx/sites-available/zeyang
sudo ln -s /etc/nginx/sites-available/zeyang /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 使用 PM2 (推薦)
```bash
# 安裝 PM2
npm install -g pm2

# 啟動應用
cd backend
pm2 start server.js --name "zeyang-backend"
pm2 save
pm2 startup
```

### 選項 2: 虛擬主機部署 (Shared Hosting)

如果您使用虛擬主機服務，請參考以下配置：

#### Node.js 應用程式設定資訊
- **Node.js 版本**: 18.19.0 (推薦) / 18.0.0 (最低要求)
- **應用程式模式**: `Production` (NODE_ENV=production)
- **應用程式根目錄**: `/public_html/zeyanggroup` (根據您的實際路徑調整)
- **應用程式 URL**: `https://yourdomain.com` (您的網域名稱)
- **啟動檔案**: `backend/server.js`

#### 必要環境變數 (Environment Variables)
在虛擬主機控制面板中設定以下環境變數：

```env
# 應用程式基礎設定
NODE_ENV=production
PORT=5001

# 前端 URL (CORS 設定)
CLIENT_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com

# 資料庫連線設定
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=your_db_name

# JWT 認證設定 (請更改為安全的密鑰)
JWT_SECRET=your-super-secure-jwt-secret-key-for-production
JWT_EXPIRES_IN=24h
REFRESH_SECRET=your-super-secure-refresh-token-secret-key
REFRESH_EXPIRES_IN=7d

# 檔案上傳設定
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=268435456

# 郵件服務設定 (聯絡表單功能)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_email_password
```

#### 虛擬主機部署步驟

1. **建構前端應用程式**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **上傳檔案到虛擬主機**
   ```
   /public_html/yourdomain/
   ├── backend/
   │   ├── server.js              # 啟動檔案
   │   ├── package.json
   │   ├── routes/, models/, etc.
   │   └── uploads/               # 確保可寫入
   ├── frontend/
   │   └── dist/                  # 前端建構檔案
   └── .env                       # 環境變數檔案
   ```

3. **設定資料庫**
   - 在主機控制面板建立 MySQL 資料庫
   - 匯入 `backend/database/schema.sql`

4. **安裝套件**
   ```bash
   cd backend
   npm install --production
   ```

5. **設定網站根目錄**
   - 將網站根目錄指向 `frontend/dist`
   - 設定 API 路由代理到 Node.js 應用程式

#### 虛擬主機 .htaccess 設定範例
在 `frontend/dist/.htaccess` 中：
```apache
RewriteEngine On

# API 請求代理到 Node.js 應用程式
RewriteRule ^api/(.*)$ http://localhost:5001/api/$1 [P,L]

# 檔案上傳代理
RewriteRule ^uploads/(.*)$ http://localhost:5001/uploads/$1 [P,L]

# 前端路由處理 (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 🔧 設定檔案

### 後端設定 (backend/.env)
```env
# 資料庫設定
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zeyang
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT 密鑰
JWT_SECRET=your_secret_key

# 伺服器設定
PORT=5001
NODE_ENV=production
```

### 前端設定 (frontend/.env)
```env
# API 位址
VITE_API_URL=http://localhost:5001/api

# 網站設定
VITE_SITE_NAME=澤暘建設
VITE_SITE_URL=http://localhost:5173
```

## 🛠️ 故障排除

### 常見問題

1. **Node.js 版本過低**
   ```bash
   # 檢查版本
   node --version
   # 需要 >= 18.0.0
   ```

2. **MySQL 連線失敗**
   ```bash
   # 測試連線
   mysql -h localhost -u root -p
   ```

3. **連接埠被佔用**
   ```bash
   # 檢查連接埠
   lsof -i :5173  # 前端
   lsof -i :5001  # 後端
   ```

4. **權限問題**
   ```bash
   # 設定上傳目錄權限
   chmod 755 backend/uploads/
   ```

### 虛擬主機常見問題

5. **網站無法訪問**
   - 檢查 Node.js 應用程式是否正在運行
   - 檢查環境變數設定是否正確
   - 檢查網域名稱 DNS 設定

6. **API 請求失敗**
   - 檢查 CORS 設定（ALLOWED_ORIGINS 環境變數）
   - 檢查資料庫連線狀態
   - 查看應用程式日誌了解錯誤詳情

7. **檔案上傳失敗**
   - 檢查 uploads 目錄權限（chmod 755）
   - 檢查檔案大小限制設定
   - 確認磁碟空間充足

8. **管理員無法登入**
   - 確認 JWT_SECRET 環境變數已設定
   - 檢查資料庫中是否有管理員帳號
   - 初始帳號：admin@yourdomain.com / admin123456

### 日誌檢查
```bash
# 後端日誌
tail -f backend/logs/error.log

# PM2 日誌
pm2 logs zeyang-backend

# 虛擬主機日誌
# 通常在主機控制面板的錯誤日誌區域查看
```

## 📞 技術支援

如遇到問題，請參考：
1. **詳細部署指南**: `DEPLOYMENT_GUIDE.md`
2. **API 文件**: http://localhost:5001/api-docs
3. **錯誤日誌**: `backend/logs/error.log`

## 📋 檢查清單

### 自建伺服器部署檢查清單
- [ ] 前端網站正常顯示 (http://localhost:5173)
- [ ] 管理後台可登入 (http://localhost:5173/admin)
- [ ] API 健康檢查正常 (http://localhost:5001/api/health)
- [ ] 資料庫連線正常
- [ ] 檔案上傳功能正常
- [ ] 聯絡表單功能正常

### 虛擬主機部署檢查清單
- [ ] Node.js 應用程式已設定並運行
- [ ] 環境變數全部設定完成
- [ ] 資料庫已建立並匯入結構
- [ ] 前端靜態檔案可正常訪問
- [ ] API 請求正常回應
- [ ] 管理後台登入功能正常
- [ ] 檔案上傳目錄權限正確
- [ ] HTTPS SSL 憑證已設定
- [ ] 網域名稱 DNS 設定正確
- [ ] 郵件服務設定正確（如需聯絡表單功能）

## 🔐 安全注意事項

### 必須更改的預設設定
1. **管理員密碼**：登入後立即更改預設管理員密碼
2. **JWT 密鑰**：使用強密碼替換預設的 JWT_SECRET
3. **資料庫密碼**：使用複雜密碼保護資料庫
4. **檔案權限**：確保敏感檔案權限設定正確

### 虛擬主機額外安全措施
```bash
# .env 檔案權限（僅擁有者可讀）
chmod 600 .env

# 應用程式檔案權限（只讀）
chmod 644 backend/*.js

# 上傳目錄權限（可讀寫）
chmod 755 backend/uploads
```

---

**檔案版本**: 2025-08-17  
**技術支援**: 如有問題請聯絡開發團隊