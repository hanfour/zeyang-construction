# 部署指南

## 環境需求
- Node.js 18+
- MySQL 8.0+
- PM2
- Nginx

## 部署步驟

### 1. 伺服器設定
```bash
# 更新系統
sudo apt update && sudo apt upgrade

# 安裝 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# 安裝 MySQL
sudo apt install mysql-server

# 安裝 PM2
sudo npm install -g pm2
```
2. 專案部署
```bash
# Clone 專案
git clone [repository-url]
cd estate-hub

# 安裝依賴
npm install --production

# 設定環境變數
cp .env.example .env
nano .env

# 初始化資料庫
mysql -u root -p < database/init.sql

# 啟動應用
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
3. Nginx 設定
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/estate-hub/uploads;
        expires 30d;
    }
}
```

### 監控設定

- PM2 監控: pm2 monit
- 日誌查看: pm2 logs
- 重啟服務: pm2 restart all