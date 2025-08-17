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

## 🌐 生產環境建議

### 使用 Nginx (推薦)
```bash
# 安裝 Nginx
sudo apt install nginx

# 使用提供的配置範例
cp deployment/config/nginx.conf.example /etc/nginx/sites-available/zeyang
sudo ln -s /etc/nginx/sites-available/zeyang /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 使用 PM2 (推薦)
```bash
# 安裝 PM2
npm install -g pm2

# 啟動應用
cd backend
pm2 start server.js --name "zeyang-backend"
pm2 save
pm2 startup
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

### 日誌檢查
```bash
# 後端日誌
tail -f backend/logs/error.log

# PM2 日誌
pm2 logs zeyang-backend
```

## 📞 技術支援

如遇到問題，請參考：
1. **詳細部署指南**: `DEPLOYMENT_GUIDE.md`
2. **API 文件**: http://localhost:5001/api-docs
3. **錯誤日誌**: `backend/logs/error.log`

## 📋 檢查清單

部署完成後，請確認：
- [ ] 前端網站正常顯示 (http://localhost:5173)
- [ ] 管理後台可登入 (http://localhost:5173/admin)
- [ ] API 健康檢查正常 (http://localhost:5001/api/health)
- [ ] 資料庫連線正常
- [ ] 檔案上傳功能正常
- [ ] 聯絡表單功能正常

---

**檔案版本**: 2025-08-17  
**技術支援**: 如有問題請聯絡開發團隊