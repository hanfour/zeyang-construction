#!/bin/bash

# ZeYang 專案打包腳本
# 版本: 1.0.0
# 作者: Claude Code Assistant

set -e

# 設定變數
PROJECT_NAME="zeyang-construction"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PACKAGE_NAME="${PROJECT_NAME}-deployment-${TIMESTAMP}"
TEMP_DIR="/tmp/${PACKAGE_NAME}"
OUTPUT_DIR="$(pwd)"

echo "=========================================="
echo "ZeYang 專案打包工具"
echo "=========================================="
echo "開始時間: $(date)"
echo "專案名稱: $PROJECT_NAME"
echo "打包檔案: ${PACKAGE_NAME}.tar.gz"
echo "=========================================="

# 建立臨時目錄
echo "📁 建立打包目錄..."
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# 複製專案檔案
echo "📋 複製專案檔案..."

# 複製主目錄
echo "  - 複製根目錄檔案..."
rsync -av --exclude='node_modules' \
         --exclude='*.log' \
         --exclude='.git' \
         --exclude='coverage' \
         --exclude='test-results*' \
         --exclude='*.tar.gz' \
         --exclude='.DS_Store' \
         --exclude='uploads/projects' \
         --exclude='uploads/temp' \
         ./ "$TEMP_DIR/"

# 清理後端檔案
echo "  - 清理後端檔案..."
cd "$TEMP_DIR/backend"
rm -rf node_modules coverage logs/*.log test-results* *.tar.gz database.db
rm -rf tests/test-results* tests/test-report* final-test-report*

# 清理前端檔案
echo "  - 清理前端檔案..."
cd "$TEMP_DIR/frontend"
rm -rf node_modules build dist coverage

# 建立部署目錄結構
echo "📦 建立部署目錄結構..."
cd "$TEMP_DIR"
mkdir -p deployment/{scripts,database,docs,config}

# 移動部署相關檔案
echo "  - 整理部署檔案..."
mv backend/database/schema.sql deployment/database/
mv backend/migrations deployment/database/
if [ -f backend/database/seeds ]; then
    mv backend/database/seeds deployment/database/
fi

# 建立啟動腳本
echo "🚀 建立啟動腳本..."
cat > deployment/scripts/install.sh << 'EOF'
#!/bin/bash
# ZeYang 專案安裝腳本

set -e

echo "=========================================="
echo "ZeYang 專案安裝程序"
echo "=========================================="

# 檢查 Node.js
echo "檢查 Node.js 版本..."
if ! command -v node &> /dev/null; then
    echo "❌ 錯誤: 需要安裝 Node.js (版本 >= 18)"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 錯誤: Node.js 版本需要 >= 18，目前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 檢查 MySQL
echo "檢查 MySQL 連線..."
if ! command -v mysql &> /dev/null; then
    echo "❌ 警告: MySQL 客戶端未安裝"
fi

# 安裝後端依賴
echo "📦 安裝後端依賴..."
cd backend
npm install --production
cd ..

# 安裝前端依賴並建構
echo "📦 安裝前端依賴並建構..."
cd frontend
npm install
npm run build
cd ..

echo "✅ 安裝完成！"
echo "下一步: 請執行 ./setup-database.sh 設定資料庫"
EOF

cat > deployment/scripts/setup-database.sh << 'EOF'
#!/bin/bash
# ZeYang 資料庫設定腳本

set -e

echo "=========================================="
echo "ZeYang 資料庫設定程序"
echo "=========================================="

# 讀取資料庫設定
read -p "MySQL 主機 (預設: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "MySQL 連接埠 (預設: 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "資料庫名稱 (預設: zeyang): " DB_NAME
DB_NAME=${DB_NAME:-zeyang}

read -p "MySQL 使用者名稱: " DB_USER
read -s -p "MySQL 密碼: " DB_PASSWORD
echo

# 測試連線
echo "測試資料庫連線..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &> /dev/null || {
    echo "❌ 資料庫連線失敗，請檢查設定"
    exit 1
}

echo "✅ 資料庫連線成功"

# 建立資料庫
echo "建立資料庫..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 匯入資料庫結構
echo "匯入資料庫結構..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < deployment/database/schema.sql

# 執行遷移
echo "執行資料庫遷移..."
for migration in deployment/database/migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "  - 執行: $(basename "$migration")"
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$migration" || echo "    已跳過 (可能已執行過)"
    fi
done

# 建立環境變數檔案
echo "建立後端環境設定..."
cat > backend/.env << EOL
# 資料庫設定
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT 設定
JWT_SECRET=$(openssl rand -base64 32)

# 伺服器設定
PORT=5001
NODE_ENV=production

# 上傳設定
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# 郵件設定 (請根據需要修改)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@zeyang.com
EOL

echo "建立前端環境設定..."
cat > frontend/.env << EOL
# API 設定
VITE_API_URL=http://localhost:5001/api

# 網站設定
VITE_SITE_NAME=澤暘建設
VITE_SITE_URL=http://localhost:5173
EOL

echo "✅ 資料庫設定完成！"
echo "環境設定檔案已建立:"
echo "  - backend/.env"
echo "  - frontend/.env"
echo ""
echo "下一步: 請執行 ./start.sh 啟動服務"
EOF

cat > deployment/scripts/start.sh << 'EOF'
#!/bin/bash
# ZeYang 服務啟動腳本

set -e

echo "=========================================="
echo "ZeYang 服務啟動程序"
echo "=========================================="

# 檢查環境設定
if [ ! -f backend/.env ]; then
    echo "❌ 錯誤: 找不到 backend/.env，請先執行 ./setup-database.sh"
    exit 1
fi

# 建立必要目錄
echo "建立必要目錄..."
mkdir -p backend/uploads/{projects,avatars,temp}
mkdir -p backend/logs

# 啟動後端服務
echo "🚀 啟動後端服務..."
cd backend
npm start &
BACKEND_PID=$!
echo "後端服務 PID: $BACKEND_PID"
cd ..

# 等待後端啟動
echo "等待後端服務啟動..."
sleep 5

# 檢查後端狀態
if curl -f http://localhost:5001/api/health &> /dev/null; then
    echo "✅ 後端服務已啟動"
else
    echo "❌ 後端服務啟動失敗"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# 啟動前端服務 (使用靜態檔案伺服器)
echo "🚀 啟動前端服務..."
cd frontend
if command -v serve &> /dev/null; then
    serve -s build -l 5173 &
    FRONTEND_PID=$!
    echo "前端服務 PID: $FRONTEND_PID"
elif command -v python3 &> /dev/null; then
    cd build && python3 -m http.server 5173 &
    FRONTEND_PID=$!
    echo "前端服務 PID: $FRONTEND_PID"
else
    echo "⚠️  警告: 未找到靜態檔案伺服器 (serve 或 python3)"
    echo "請手動啟動前端服務或安裝 serve: npm install -g serve"
fi
cd ..

echo ""
echo "✅ 服務啟動完成！"
echo "後端 API: http://localhost:5001"
echo "前端網站: http://localhost:5173"
echo "管理後台: http://localhost:5173/admin"
echo ""
echo "預設管理員帳號:"
echo "帳號: admin"
echo "密碼: admin123"
echo ""
echo "按 Ctrl+C 停止服務"

# 等待中斷信號
trap 'echo "正在停止服務..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0' INT
wait
EOF

cat > deployment/scripts/stop.sh << 'EOF'
#!/bin/bash
# ZeYang 服務停止腳本

echo "停止 ZeYang 服務..."

# 停止 Node.js 後端
pkill -f "node.*server.js" || echo "後端服務未運行"

# 停止前端服務
pkill -f "serve.*build" || echo "前端 serve 服務未運行"
pkill -f "python.*http.server.*5173" || echo "前端 Python 服務未運行"

echo "✅ 服務已停止"
EOF

# 設定執行權限
chmod +x deployment/scripts/*.sh

echo "📝 建立配置範例..."
cat > deployment/config/nginx.conf.example << 'EOF'
# ZeYang Nginx 配置範例
server {
    listen 80;
    server_name your-domain.com;

    # 前端靜態檔案
    location / {
        root /path/to/zeyang/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # 後端 API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 上傳檔案
    location /uploads {
        alias /path/to/zeyang/backend/uploads;
    }
}

# 如果不使用 Nginx，前端靜態服務會在 5173 端口
# proxy_pass http://localhost:5173; (僅供參考)
EOF

cat > deployment/config/pm2.json.example << 'EOF'
{
  "apps": [
    {
      "name": "zeyang-backend",
      "script": "server.js",
      "cwd": "/path/to/zeyang/backend",
      "env": {
        "NODE_ENV": "production"
      },
      "instances": 1,
      "exec_mode": "cluster",
      "watch": false,
      "log_file": "/path/to/zeyang/logs/app.log",
      "error_file": "/path/to/zeyang/logs/error.log",
      "out_file": "/path/to/zeyang/logs/out.log"
    }
  ]
}
EOF

echo "✅ 部署腳本建立完成"

# 建立最終的 tar.gz 檔案
echo "📦 建立最終打包檔案..."
cd "$TEMP_DIR/.."
tar -czf "${OUTPUT_DIR}/${PACKAGE_NAME}.tar.gz" "$PACKAGE_NAME"

# 清理臨時檔案
echo "🧹 清理臨時檔案..."
rm -rf "$TEMP_DIR"

echo ""
echo "=========================================="
echo "✅ 打包完成！"
echo "=========================================="
echo "檔案位置: ${OUTPUT_DIR}/${PACKAGE_NAME}.tar.gz"
echo "檔案大小: $(ls -lh "${OUTPUT_DIR}/${PACKAGE_NAME}.tar.gz" | awk '{print $5}')"
echo ""
echo "解壓縮命令:"
echo "tar -xzf ${PACKAGE_NAME}.tar.gz"
echo ""
echo "部署步驟:"
echo "1. 解壓縮檔案"
echo "2. cd ${PACKAGE_NAME}"
echo "3. chmod +x deployment/scripts/*.sh"
echo "4. ./deployment/scripts/install.sh"
echo "5. ./deployment/scripts/setup-database.sh"
echo "6. ./deployment/scripts/start.sh"
echo "=========================================="