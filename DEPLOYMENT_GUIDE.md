# ZeYang 澤暘建設網站 - 完整部署指南

## 📋 目錄
- [專案概述](#專案概述)
- [系統需求](#系統需求)
- [快速部署](#快速部署)
- [詳細部署步驟](#詳細部署步驟)
- [環境配置](#環境配置)
- [資料庫設定](#資料庫設定)
- [生產環境部署](#生產環境部署)
- [故障排除](#故障排除)
- [維護指南](#維護指南)

## 🏗️ 專案概述

ZeYang 澤暘建設網站是一個現代化的房地產展示平台，包含：

### 前端技術棧
- **框架**: React 18 + TypeScript
- **建構工具**: Vite
- **UI 庫**: Tailwind CSS + Headless UI
- **狀態管理**: Zustand + React Query
- **動畫**: Framer Motion + GSAP
- **路由**: React Router DOM

### 後端技術棧
- **運行環境**: Node.js 18+
- **框架**: Express.js
- **資料庫**: MySQL 8.0+
- **認證**: JWT + bcryptjs
- **檔案上傳**: Multer + Sharp
- **郵件服務**: Nodemailer
- **API 文件**: Swagger

### 功能特色
- 🏠 專案展示與管理
- 👥 團隊介紹
- 📧 聯絡表單
- 🔐 管理後台
- 🏷️ 標籤系統
- 📊 統計分析
- 📱 響應式設計
- 🚀 SEO 優化

## 💻 系統需求

### 基本需求
- **作業系統**: Linux (Ubuntu 20.04+) / macOS / Windows
- **Node.js**: 18.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **MySQL**: 8.0 或更高版本
- **記憶體**: 最少 2GB RAM
- **硬碟空間**: 最少 5GB

### 推薦配置
- **CPU**: 2 核心或更多
- **記憶體**: 4GB RAM 或更多
- **硬碟**: SSD 儲存
- **網路**: 穩定的網際網路連線

## 🚀 快速部署

### 1. 下載專案檔案
```bash
# 解壓縮部署檔案
tar -xzf zeyang-construction-deployment-YYYYMMDD_HHMMSS.tar.gz
cd zeyang-construction-deployment-YYYYMMDD_HHMMSS
```

### 2. 設定執行權限
```bash
chmod +x deployment/scripts/*.sh
```

### 3. 安裝依賴
```bash
./deployment/scripts/install.sh
```

### 4. 設定資料庫
```bash
./deployment/scripts/setup-database.sh
```

### 5. 啟動服務
```bash
./deployment/scripts/start.sh
```

### 6. 訪問網站
- **前端網站**: http://localhost:5173
- **管理後台**: http://localhost:5173/admin
- **後端 API**: http://localhost:5001/api

**預設管理員帳號**:
- 帳號: `admin`
- 密碼: `admin123`

## 📖 詳細部署步驟

### 步驟 1: 環境準備

#### 安裝 Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# macOS (使用 Homebrew)
brew install node

# 驗證安裝
node --version  # 應該 >= 18.0.0
npm --version   # 應該 >= 8.0.0
```

#### 安裝 MySQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server mysql-client

# CentOS/RHEL
sudo yum install mysql-server mysql

# macOS (使用 Homebrew)
brew install mysql

# 啟動 MySQL 服務
sudo systemctl start mysql
sudo systemctl enable mysql

# 設定 MySQL 安全性
sudo mysql_secure_installation
```

### 步驟 2: 資料庫配置

#### 建立資料庫和使用者
```sql
-- 登入 MySQL
mysql -u root -p

-- 建立資料庫
CREATE DATABASE zeyang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 建立使用者 (可選，也可使用 root)
CREATE USER 'zeyang_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON zeyang.* TO 'zeyang_user'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

#### 匯入資料庫結構
```bash
mysql -u zeyang_user -p zeyang < deployment/database/schema.sql
```

### 步驟 3: 應用程式配置

#### 後端環境配置
建立 `backend/.env` 檔案：
```env
# 資料庫設定
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zeyang
DB_USER=zeyang_user
DB_PASSWORD=your_strong_password

# JWT 設定
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# 伺服器設定
PORT=5001
NODE_ENV=production

# 上傳設定
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# 郵件設定
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@zeyang.com

# 安全設定
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

#### 前端環境配置
建立 `frontend/.env` 檔案：
```env
# API 設定
VITE_API_URL=http://localhost:5001/api

# 網站設定
VITE_SITE_NAME=澤暘建設
VITE_SITE_URL=http://localhost:5173
VITE_COMPANY_NAME=澤暘建設股份有限公司
VITE_COMPANY_ADDRESS=台北市信義區信義路五段7號
VITE_COMPANY_PHONE=02-2345-6789
VITE_COMPANY_EMAIL=info@zeyang.com

# Google Analytics (可選)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# reCAPTCHA (可選)
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### 步驟 4: 建構和啟動

#### 安裝依賴
```bash
# 後端依賴
cd backend
npm install --production

# 前端依賴和建構
cd ../frontend
npm install
npm run build
```

#### 啟動服務
```bash
# 後端服務
cd backend
npm start

# 或使用 PM2 (推薦生產環境)
npm install -g pm2
pm2 start server.js --name "zeyang-backend"
```

#### 服務前端 (靜態檔案)
```bash
# 選項 1: 使用 serve
npm install -g serve
serve -s frontend/build -l 5173

# 選項 2: 使用 Nginx (推薦生產環境)
# 參考下方 Nginx 配置
```

## 🌐 生產環境部署

### Nginx 配置
建立 `/etc/nginx/sites-available/zeyang` 檔案：
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 憑證
    ssl_certificate /path/to/your/cert.crt;
    ssl_certificate_key /path/to/your/private.key;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 安全標頭
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # 前端靜態檔案
    location / {
        root /path/to/zeyang/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # 快取設定
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 後端 API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支援
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # 上傳檔案
    location /uploads {
        alias /path/to/zeyang/backend/uploads;
        
        # 安全設定
        location ~* \.(php|php5|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }

    # 檔案大小限制
    client_max_body_size 10M;
}
```

啟用站點：
```bash
sudo ln -s /etc/nginx/sites-available/zeyang /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### PM2 配置
建立 `pm2.json` 檔案：
```json
{
  "apps": [
    {
      "name": "zeyang-backend",
      "script": "server.js",
      "cwd": "/path/to/zeyang/backend",
      "env": {
        "NODE_ENV": "production"
      },
      "instances": "max",
      "exec_mode": "cluster",
      "watch": false,
      "max_memory_restart": "1G",
      "log_file": "/var/log/zeyang/app.log",
      "error_file": "/var/log/zeyang/error.log",
      "out_file": "/var/log/zeyang/out.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
      "merge_logs": true,
      "autorestart": true,
      "restart_delay": 1000
    }
  ]
}
```

啟動 PM2：
```bash
pm2 start pm2.json
pm2 save
pm2 startup
```

### 系統服務配置
建立 systemd 服務檔案 `/etc/systemd/system/zeyang.service`：
```ini
[Unit]
Description=ZeYang Construction Website
After=network.target mysql.service

[Service]
Type=forking
User=www-data
WorkingDirectory=/path/to/zeyang/backend
ExecStart=/usr/bin/pm2 start pm2.json --no-daemon
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 stop all
Restart=always

[Install]
WantedBy=multi-user.target
```

啟用服務：
```bash
sudo systemctl enable zeyang
sudo systemctl start zeyang
```

## 🛠️ 故障排除

### 常見問題

#### 1. 後端服務無法啟動
```bash
# 檢查日誌
tail -f backend/logs/error.log

# 常見原因和解決方案
- 檢查 .env 檔案配置
- 確認資料庫連線
- 檢查連接埠是否被佔用: lsof -i :5001
- 確認 Node.js 版本: node --version
```

#### 2. 資料庫連線失敗
```bash
# 測試 MySQL 連線
mysql -h localhost -u zeyang_user -p zeyang

# 檢查 MySQL 服務狀態
sudo systemctl status mysql

# 重啟 MySQL 服務
sudo systemctl restart mysql
```

#### 3. 前端無法載入
```bash
# 檢查建構檔案
ls -la frontend/build/

# 重新建構
cd frontend
npm run build

# 檢查 Nginx 配置
sudo nginx -t
```

#### 4. 檔案上傳失敗
```bash
# 檢查上傳目錄權限
ls -la backend/uploads/
chmod 755 backend/uploads/
chown -R www-data:www-data backend/uploads/

# 檢查磁碟空間
df -h
```

### 偵錯模式
```bash
# 啟用偵錯模式
NODE_ENV=development npm start

# 查看詳細日誌
DEBUG=* npm start
```

## 🔧 維護指南

### 日常維護

#### 1. 備份資料庫
```bash
# 建立每日備份腳本
#!/bin/bash
BACKUP_DIR="/backup/zeyang"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

mysqldump -u zeyang_user -p zeyang > "$BACKUP_DIR/zeyang_$DATE.sql"
gzip "$BACKUP_DIR/zeyang_$DATE.sql"

# 保留 30 天備份
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
```

#### 2. 日誌管理
```bash
# 設定日誌輪轉 /etc/logrotate.d/zeyang
/var/log/zeyang/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### 3. 監控設定
```bash
# 安裝監控工具
npm install -g pm2-logrotate
pm2 install pm2-server-monit

# 設定警報
pm2 set pm2-server-monit:password your_password
```

### 更新程序

#### 1. 應用程式更新
```bash
# 備份現有版本
cp -r /path/to/zeyang /backup/zeyang_$(date +%Y%m%d)

# 停止服務
pm2 stop all

# 更新程式碼
# (部署新版本檔案)

# 更新依賴
cd backend && npm install --production
cd ../frontend && npm install && npm run build

# 執行資料庫遷移 (如有需要)
mysql -u zeyang_user -p zeyang < migrations/new_migration.sql

# 重啟服務
pm2 start all
```

#### 2. 系統更新
```bash
# 更新系統套件
sudo apt update && sudo apt upgrade

# 更新 Node.js (如需要)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 效能優化

#### 1. 資料庫優化
```sql
-- 檢查慢查詢
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- 分析表格
ANALYZE TABLE projects, project_images, contacts;

-- 檢查索引使用
EXPLAIN SELECT * FROM projects WHERE type = 'residential';
```

#### 2. 應用程式優化
```bash
# 啟用 Node.js 叢集模式
pm2 start server.js -i max

# 啟用 Nginx gzip 壓縮
# 在 nginx.conf 中新增:
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
```

## 📞 技術支援

### 聯絡資訊
- **技術文件**: 本指南
- **API 文件**: http://localhost:5001/api-docs
- **專案儲存庫**: [如果有的話]

### 緊急聯絡
在發生嚴重問題時，請按照以下步驟：

1. 檢查系統狀態：`systemctl status zeyang mysql nginx`
2. 查看錯誤日誌：`tail -f /var/log/zeyang/error.log`
3. 嘗試重啟服務：`pm2 restart all`
4. 如果問題持續，聯絡技術支援團隊

---

**版本**: 1.0.0  
**最後更新**: 2025-08-17  
**維護者**: Claude Code Assistant