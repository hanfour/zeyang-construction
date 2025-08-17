#!/bin/bash

# 澤暘建設專案部署打包腳本
# Author: Claude Code
# Date: $(date "+%Y-%m-%d")

set -e

# 配置變數
PROJECT_NAME="zeyang-construction"
TIMESTAMP=$(date "+%Y%m%d_%H%M%S")
PACKAGE_NAME="${PROJECT_NAME}-deployment-${TIMESTAMP}"
TEMP_DIR="/tmp/${PACKAGE_NAME}"
CURRENT_DIR=$(pwd)

echo "🚀 開始建立澤暘建設專案部署包..."
echo "📦 包名: ${PACKAGE_NAME}"

# 建立臨時目錄
mkdir -p "${TEMP_DIR}"

# 複製專案文件（排除不需要的檔案）
echo "📁 複製專案檔案..."
rsync -av \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='coverage' \
  --exclude='.nyc_output' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.development' \
  --exclude='.env.production' \
  --exclude='backend/uploads' \
  --exclude='frontend/dist' \
  --exclude='frontend/build' \
  --exclude='*.tar.gz' \
  --exclude='package-deployment.sh' \
  --exclude='package-project.sh' \
  . "${TEMP_DIR}/"

# 建立部署文檔
echo "📝 建立部署文檔..."
cat > "${TEMP_DIR}/DEPLOYMENT.md" << 'EOF'
# 澤暘建設專案部署指南

## 系統需求

### 服務器環境
- Node.js 18.0+ 
- npm 8.0+
- MySQL 8.0+
- Linux/Ubuntu 20.04+ (推薦)

### 硬體需求
- RAM: 最少 2GB，推薦 4GB+
- 磁碟空間: 最少 10GB 可用空間
- CPU: 雙核心以上

## 快速部署步驟

### 1. 解壓專案檔案
```bash
tar -xzf zeyang-construction-deployment-*.tar.gz
cd zeyang-construction-deployment-*
```

### 2. 安裝依賴套件
```bash
# 安裝後端依賴
cd backend
npm install --production

# 安裝前端依賴
cd ../frontend  
npm install
```

### 3. 建立環境配置檔案
```bash
# 後端環境配置
cp backend/.env.example backend/.env
# 編輯 backend/.env 填入正確的資料庫和服務配置

# 前端環境配置（如需要）
cp frontend/.env.example frontend/.env
```

### 4. 資料庫設置
```bash
# 登入 MySQL 並建立資料庫
mysql -u root -p
CREATE DATABASE zeyang_construction;
CREATE USER 'zeyang_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON zeyang_construction.* TO 'zeyang_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 執行資料庫遷移
cd backend
npm run db:migrate
```

### 5. 建置前端
```bash
cd frontend
npm run build
```

### 6. 啟動服務
```bash
# 啟動後端 API 服務器
cd backend
npm start

# 使用 PM2 管理進程（推薦）
npm install -g pm2
pm2 start server.js --name "zeyang-backend"
pm2 startup
pm2 save
```

### 7. 配置 Nginx（推薦）
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端靜態檔案
    location / {
        root /path/to/zeyang-construction/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 環境變數配置

### 後端 (.env)
```env
# 服務器配置
PORT=5001
NODE_ENV=production

# 資料庫配置
DB_HOST=localhost
DB_USER=zeyang_user
DB_PASSWORD=your_password
DB_NAME=zeyang_construction

# JWT 配置
JWT_SECRET=your_very_secure_jwt_secret
JWT_EXPIRES_IN=24h

# 檔案上傳配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 郵件配置（如需要）
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_email_password
```

## 安全性配置

1. **防火牆設置**
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

2. **SSL 證書配置**
```bash
# 使用 Let's Encrypt
snap install --classic certbot
certbot --nginx -d your-domain.com
```

3. **資料庫安全**
```bash
mysql_secure_installation
```

## 維護與監控

### 日志管理
```bash
# 查看後端日志
pm2 logs zeyang-backend

# 查看 Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 備份策略
```bash
# 資料庫備份
mysqldump -u zeyang_user -p zeyang_construction > backup_$(date +%Y%m%d).sql

# 檔案備份
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
```

### 更新部署
```bash
# 停止服務
pm2 stop zeyang-backend

# 更新代碼
git pull origin main

# 重新安裝依賴（如有需要）
cd backend && npm install --production
cd ../frontend && npm install && npm run build

# 重新啟動服務
pm2 restart zeyang-backend
```

## 故障排除

### 常見問題

1. **資料庫連接失敗**
   - 檢查 MySQL 服務是否運行
   - 驗證資料庫憑證和權限
   - 確認防火牆設置

2. **檔案上傳問題**
   - 檢查 uploads 目錄權限
   - 確認磁碟空間充足
   - 驗證 MAX_FILE_SIZE 設置

3. **前端路由問題**
   - 確認 Nginx 配置中的 try_files
   - 檢查前端建置是否成功

### 聯絡支援
如遇到部署問題，請提供：
- 服務器環境資訊
- 錯誤日志
- 配置檔案（去除敏感資訊）

---
部署包建立時間: $(date)
版本: Latest
EOF

# 建立啟動腳本
echo "🔧 建立啟動腳本..."
cat > "${TEMP_DIR}/start.sh" << 'EOF'
#!/bin/bash

# 澤暘建設專案啟動腳本

set -e

echo "🚀 啟動澤暘建設專案..."

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝，請先安裝 Node.js 18+"
    exit 1
fi

# 檢查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安裝，請先安裝 npm"
    exit 1
fi

# 檢查環境配置
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env 檔案不存在，請先配置環境變數"
    echo "參考 backend/.env.example 建立配置檔案"
    exit 1
fi

# 安裝後端依賴
echo "📦 安裝後端依賴..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install --production
fi

# 檢查資料庫連接
echo "🔍 檢查資料庫連接..."
node -e "
const mysql = require('mysql2');
require('dotenv').config();
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
connection.connect((err) => {
  if (err) {
    console.error('❌ 資料庫連接失敗:', err.message);
    process.exit(1);
  }
  console.log('✅ 資料庫連接成功');
  connection.end();
});
"

# 啟動後端服務器
echo "🔥 啟動後端服務器..."
npm start &
BACKEND_PID=$!

cd ..

# 檢查是否有前端建置檔案
if [ -d "frontend/dist" ]; then
    echo "✅ 前端已建置，使用現有檔案"
else
    echo "🔨 建置前端..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run build
    cd ..
fi

echo "✅ 澤暘建設專案啟動完成！"
echo "🌐 後端 API: http://localhost:5001"
echo "📁 前端檔案位於: frontend/dist"
echo ""
echo "💡 建議使用 Nginx 或其他 Web 服務器來服務前端檔案"
echo "📖 詳細部署說明請參考 DEPLOYMENT.md"

# 等待後端進程
wait $BACKEND_PID
EOF

chmod +x "${TEMP_DIR}/start.sh"

# 建立停止腳本
cat > "${TEMP_DIR}/stop.sh" << 'EOF'
#!/bin/bash

echo "🛑 停止澤暘建設專案..."

# 停止 PM2 進程
if command -v pm2 &> /dev/null; then
    pm2 stop zeyang-backend 2>/dev/null || true
    echo "✅ PM2 進程已停止"
fi

# 停止 Node.js 進程
pkill -f "node.*server.js" 2>/dev/null || true
echo "✅ Node.js 進程已停止"

echo "✅ 澤暘建設專案已停止"
EOF

chmod +x "${TEMP_DIR}/stop.sh"

# 建立環境配置範例
echo "⚙️  建立環境配置範例..."
cat > "${TEMP_DIR}/backend/.env.example" << 'EOF'
# 服務器配置
PORT=5001
NODE_ENV=production

# 資料庫配置
DB_HOST=localhost
DB_USER=zeyang_user
DB_PASSWORD=your_secure_password
DB_NAME=zeyang_construction

# JWT 配置
JWT_SECRET=your_very_secure_jwt_secret_here
JWT_EXPIRES_IN=24h

# 檔案上傳配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 郵件配置（選填）
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_email_password
SMTP_FROM=noreply@your-domain.com

# CORS 配置
CORS_ORIGIN=http://localhost:5173,https://your-domain.com

# 安全配置
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
EOF

cat > "${TEMP_DIR}/frontend/.env.example" << 'EOF'
# API 基礎 URL（生產環境）
VITE_API_BASE_URL=https://your-domain.com/api

# 其他前端配置
VITE_APP_NAME=澤暘建設
VITE_APP_VERSION=1.0.0
EOF

# 建立版本資訊
echo "📋 建立版本資訊..."
cat > "${TEMP_DIR}/VERSION.txt" << EOF
澤暘建設專案 - 部署包
==============================

建立時間: $(date)
Git 提交: $(git rev-parse HEAD)
Git 分支: $(git branch --show-current)

包含組件:
- 後端 API 服務器 (Node.js + Express)
- 前端應用程式 (React + TypeScript + Vite)
- 資料庫腳本 (MySQL)
- 部署文檔和腳本

主要功能:
- 專案展示系統
- 聯絡表單
- 管理後台
- 圖片上傳與管理
- AOS 動畫系統
- 響應式設計

技術規格:
- Node.js 18+
- MySQL 8.0+
- React 18
- TypeScript
- Tailwind CSS
- AOS 動畫庫
EOF

# 建立壓縮檔
echo "🗜️  建立壓縮檔..."
cd "$(dirname "${TEMP_DIR}")"
tar -czf "${CURRENT_DIR}/${PACKAGE_NAME}.tar.gz" "$(basename "${TEMP_DIR}")"

# 清理臨時目錄
rm -rf "${TEMP_DIR}"

echo "✅ 部署包建立完成！"
echo "📦 檔案位置: ${CURRENT_DIR}/${PACKAGE_NAME}.tar.gz"
echo "📊 檔案大小: $(du -sh "${CURRENT_DIR}/${PACKAGE_NAME}.tar.gz" | cut -f1)"
echo ""
echo "🚀 部署說明:"
echo "1. 將壓縮檔上傳到目標服務器"
echo "2. 解壓: tar -xzf ${PACKAGE_NAME}.tar.gz"
echo "3. 參考 DEPLOYMENT.md 進行配置"
echo "4. 執行 ./start.sh 啟動服務"
echo ""
echo "📖 詳細部署指南請參考壓縮檔內的 DEPLOYMENT.md"