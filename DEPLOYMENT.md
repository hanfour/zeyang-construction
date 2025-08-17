# 澤暘建設網站部署指南

## 系統概述
澤暘建設網站是一個全端網站系統，包含前端展示頁面和後端管理系統。

### 技術棧
- **前端**: React + TypeScript + Vite + Tailwind CSS
- **後端**: Node.js + Express + MySQL
- **認證**: JWT Token 認證
- **檔案上傳**: Multer + 圖片處理

## 部署前檢查

### 系統需求
- Node.js 18+
- MySQL 8.0+
- PM2 (生產環境程序管理)
- Nginx (反向代理)

### 測試狀態
截至 2025-08-17，測試結果如下：

**前端測試**:
- ✅ 基本功能測試通過
- ⚠️ CustomCarousel 組件有部分測試失敗（不影響核心功能）

**後端測試**:
- ⚠️ 認證系統測試失敗（需要檢查 JWT 配置）
- ⚠️ 系統設定測試失敗（需要檢查資料庫連接）

**已知問題**:
- 測試環境的資料庫連接配置需要調整
- JWT Secret 在生產環境需要重新設定

## 環境配置

### 1. 後端環境變數
複製並編輯 `.env` 檔案：

```bash
cp backend/.env.example backend/.env
```

重要配置項目：
```env
# 基礎設定
NODE_ENV=production
PORT=5001
CLIENT_URL=https://yourdomain.com

# 資料庫
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=zeyang_production

# 安全設定 - 必須更改！
JWT_SECRET=your-production-jwt-secret-key
JWT_EXPIRES_IN=24h
REFRESH_SECRET=your-production-refresh-token-secret
REFRESH_EXPIRES_IN=7d

# 檔案上傳
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=268435456

# 郵件服務
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your_email_password
```

### 2. 前端環境變數
編輯 `frontend/.env.production`：
```env
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_UPLOAD_BASE_URL=https://yourdomain.com
```

## 資料庫設定

### 1. 建立資料庫
```sql
CREATE DATABASE zeyang_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'zeyang_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON zeyang_production.* TO 'zeyang_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 匯入資料庫結構
```bash
cd backend
mysql -u zeyang_user -p zeyang_production < database/schema.sql
mysql -u zeyang_user -p zeyang_production < database/seed.sql
```

## 部署步驟

### 1. 安裝依賴
```bash
# 後端
cd backend
npm install --production

# 前端
cd ../frontend
npm install
```

### 2. 建構前端
```bash
cd frontend
npm run build
```

### 3. 設定 PM2
```bash
# 安裝 PM2
npm install -g pm2

# 啟動後端服務
cd backend
pm2 start ecosystem.config.js --env production

# 設定開機自啟
pm2 startup
pm2 save
```

### 4. Nginx 配置
編輯 `/etc/nginx/sites-available/zeyang`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # 前端靜態檔案
    location / {
        root /path/to/zeyang/frontend/dist;
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
    
    # 檔案上傳代理
    location /uploads {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

啟用網站：
```bash
sudo ln -s /etc/nginx/sites-available/zeyang /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 安全注意事項

1. **更改預設密碼**: 確保更改所有預設密碼和密鑰
2. **檔案權限**: 設定適當的檔案權限
3. **防火牆**: 僅開放必要的端口（80, 443, 22）
4. **SSL 憑證**: 配置有效的 SSL 憑證
5. **定期備份**: 設定資料庫和檔案的定期備份

## 管理員帳號

系統預設管理員帳號（請登入後立即更改密碼）：
- 帳號: admin@zeyang.com
- 密碼: admin123456

## 監控與維護

### PM2 常用指令
```bash
pm2 status          # 查看程序狀態
pm2 logs            # 查看日誌
pm2 restart all     # 重啟所有程序
pm2 reload all      # 零停機重載
pm2 stop all        # 停止所有程序
pm2 delete all      # 刪除所有程序
```

### 日誌位置
- PM2 日誌: `~/.pm2/logs/`
- Nginx 日誌: `/var/log/nginx/`
- 應用程式日誌: `backend/logs/`

## 故障排除

### 常見問題
1. **資料庫連接失敗**: 檢查 MySQL 服務狀態和連接配置
2. **檔案上傳失敗**: 檢查 uploads 目錄權限
3. **前端頁面空白**: 檢查 API 連接配置
4. **認證失敗**: 檢查 JWT 密鑰配置

### 聯絡支援
如需技術支援，請聯絡開發團隊。

---
最後更新: 2025-08-17