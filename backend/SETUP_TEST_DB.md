# 設置真實資料庫測試環境

## 方法一：使用本地 MySQL

### 1. 安裝 MySQL（如果尚未安裝）
```bash
# macOS
brew install mysql
brew services start mysql

# 或使用 MySQL 官方安裝包
# 下載：https://dev.mysql.com/downloads/mysql/
```

### 2. 創建測試資料庫
```bash
# 登入 MySQL
mysql -u root -p

# 創建資料庫
CREATE DATABASE ZeYang_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 創建測試用戶（可選）
CREATE USER 'test_user'@'localhost' IDENTIFIED BY 'test_password';
GRANT ALL PRIVILEGES ON ZeYang_test.* TO 'test_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 運行資料庫遷移
```bash
# 確保 .env.test 檔案設置正確
cat > .env.test << EOL
NODE_ENV=test
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的密碼
DB_NAME=ZeYang_test
DB_PORT=3306
JWT_SECRET=test-jwt-secret
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
REFRESH_SECRET=test-refresh-secret
EOL

# 運行遷移
cd backend
mysql -u root -p ZeYang_test < database/schema.sql
```

### 4. 運行測試
```bash
npm test
```

## 方法二：使用 Docker（推薦）

### 1. 創建 docker-compose.yml
```yaml
version: '3.8'
services:
  mysql-test:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: ZeYang_test
    ports:
      - "3307:3306"
    volumes:
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10
```

### 2. 啟動 Docker 容器
```bash
# 啟動 MySQL 容器
docker-compose up -d mysql-test

# 等待資料庫就緒
docker-compose exec mysql-test mysqladmin ping -h localhost --wait=30

# 運行測試
DB_PORT=3307 npm test
```

### 3. 測試完成後清理
```bash
docker-compose down -v
```

## 方法三：使用 GitHub Actions CI/CD

### 創建 .github/workflows/test.yml
```yaml
name: Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: ZeYang_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd backend
        npm ci
        
    - name: Setup database
      run: |
        cd backend
        mysql -h 127.0.0.1 -u root -proot ZeYang_test < database/schema.sql
        
    - name: Run tests
      env:
        DB_HOST: 127.0.0.1
        DB_USER: root
        DB_PASSWORD: root
        DB_NAME: ZeYang_test
        NODE_ENV: test
      run: |
        cd backend
        npm test
```

## 快速測試腳本

創建 `run-real-tests.sh`:
```bash
#!/bin/bash

# 檢查 MySQL 是否運行
if ! mysqladmin ping -h localhost --silent; then
    echo "MySQL 未運行，請先啟動 MySQL"
    exit 1
fi

# 創建測試資料庫
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ZeYang_test;"

# 導入 schema
mysql -u root -p ZeYang_test < database/schema.sql

# 運行測試
npm test

# 顯示結果
echo "測試完成！"
```

使用方式：
```bash
chmod +x run-real-tests.sh
./run-real-tests.sh
```