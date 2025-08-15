# ZeYang - 澤暘品牌管理系統

## 專案基本資訊

- **專案名稱**: ZeYang
- **專案類型**: 全端網站應用程式（澤暘品牌與管理系統）
- **開發語言**: JavaScript (Node.js + React)
- **資料庫**: MySQL 8.0+
- **目標用戶**: 澤暘品牌
- **核心功能**: 專案展示、後台管理、圖片處理、聯絡表單

## 系統架構

### 技術堆疊
```yaml
後端:
  - 框架: Express.js 4.18+
  - 語言: Node.js 18+
  - 資料庫: MySQL 8.0
  - ORM: 原生 MySQL2
  - 認證: JWT + bcrypt
  - 檔案處理: Multer + Sharp
  - API文件: Swagger
  - 驗證: express-validator
  - 安全: Helmet + CORS
  - 日誌: Winston + Morgan

前端:
  - 框架: React 18+
  - 路由: React Router v6
  - 狀態管理: Context API / Redux Toolkit
  - UI框架: Tailwind CSS / Material-UI
  - HTTP客戶端: Axios
  - 表單: React Hook Form
  - 圖片載入: React Lazy Load

開發工具:
  - 版本控制: Git
  - 套件管理: npm
  - 程式碼風格: ESLint + Prettier
  - 測試: Jest + React Testing Library
```

## 目錄結構

```
estate-hub/
├── backend/
│   ├── config/
│   │   ├── database.js         # MySQL 連接池配置
│   │   ├── swagger.js          # Swagger 配置
│   │   └── constants.js        # 系統常數
│   ├── middleware/
│   │   ├── auth.js            # JWT/API Key 認證
│   │   ├── validation.js      # 請求驗證規則
│   │   ├── rateLimiter.js     # API 速率限制
│   │   ├── errorHandler.js    # 全域錯誤處理
│   │   └── upload.js          # 檔案上傳設定
│   ├── utils/
│   │   ├── imageHandler.js    # 圖片處理（壓縮/縮圖）
│   │   ├── slugGenerator.js   # URL slug 產生器
│   │   ├── emailService.js    # 郵件發送服務
│   │   └── backup.js          # 備份工具
│   ├── models/
│   │   ├── Project.js         # 專案資料模型
│   │   ├── User.js            # 用戶資料模型
│   │   └── Contact.js         # 聯絡表單模型
│   ├── routes/
│   │   ├── auth.js            # 認證路由
│   │   ├── projects.js        # 專案管理路由
│   │   ├── contacts.js        # 聯絡表單路由
│   │   ├── upload.js          # 檔案上傳路由
│   │   └── admin.js           # 管理功能路由
│   ├── services/
│   │   ├── projectService.js  # 專案業務邏輯
│   │   ├── authService.js     # 認證業務邏輯
│   │   └── statsService.js    # 統計分析服務
│   ├── swagger/
│   │   └── *.yml              # API 文件定義
│   ├── uploads/               # 上傳檔案目錄
│   ├── logs/                  # 系統日誌
│   ├── tests/                 # 單元測試
│   ├── server.js              # 應用程式入口
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   ├── src/
│   │   ├── components/        # 共用元件
│   │   │   ├── Layout/
│   │   │   ├── Common/
│   │   │   └── Forms/
│   │   ├── pages/            # 頁面元件
│   │   │   ├── Home/
│   │   │   ├── Projects/
│   │   │   ├── ProjectDetail/
│   │   │   ├── Contact/
│   │   │   └── Admin/
│   │   ├── hooks/            # 自訂 Hooks
│   │   ├── services/         # API 服務
│   │   ├── utils/            # 工具函數
│   │   ├── styles/           # 全域樣式
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
│
├── database/
│   ├── migrations/            # 資料庫遷移
│   ├── seeds/                # 測試資料
│   └── init.sql              # 初始化腳本
│
├── docs/                      # 專案文件
├── scripts/                   # 維護腳本
└── docker-compose.yml         # Docker 配置
```

## 資料庫設計

### 核心資料表

```sql
-- 1. 用戶表 (users)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,        -- bcrypt 加密
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- 2. 專案主表 (projects)
CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    slug VARCHAR(200) UNIQUE NOT NULL,     -- SEO 友善網址
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(200),
    category ENUM('住宅', '商業', '辦公室', '公共建築', '其他') NOT NULL,
    status ENUM('planning', 'pre_sale', 'on_sale', 'sold_out', 'completed') DEFAULT 'planning',
    location VARCHAR(200) NOT NULL,
    year INT,
    area VARCHAR(100),                     -- 面積
    price_range VARCHAR(100),              -- 價格區間
    display_order INT DEFAULT 0,           -- 顯示順序
    view_count INT DEFAULT 0,              -- 瀏覽次數
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,     -- 精選專案
    meta_title VARCHAR(200),               -- SEO 標題
    meta_description TEXT,                 -- SEO 描述
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    INDEX idx_slug (slug),
    INDEX idx_category_status (category, status),
    INDEX idx_display_order (display_order)
);

-- 3. 專案詳細內容 (project_details)
CREATE TABLE project_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_uuid VARCHAR(36) NOT NULL,
    description TEXT,                      -- 簡短描述
    detail_content TEXT,                   -- 詳細內容 (HTML)
    features JSON,                         -- 特色設施
    specifications JSON,                   -- 規格配備
    floor_plans JSON,                      -- 樓層規劃
    nearby_facilities JSON,                -- 周邊設施
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_uuid) REFERENCES projects(uuid) ON DELETE CASCADE,
    UNIQUE KEY unique_project (project_uuid)
);

-- 4. 專案圖片 (project_images)
CREATE TABLE project_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_uuid VARCHAR(36) NOT NULL,
    image_type ENUM('main', 'gallery', 'floor_plan', 'location', 'vr') DEFAULT 'gallery',
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,                         -- 檔案大小 (bytes)
    mime_type VARCHAR(50),
    dimensions JSON,                       -- {width, height}
    thumbnails JSON,                       -- {small, medium, large}
    alt_text VARCHAR(255),                 -- 替代文字
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_uuid) REFERENCES projects(uuid) ON DELETE CASCADE,
    INDEX idx_project_type (project_uuid, image_type),
    INDEX idx_display_order (display_order)
);

-- 5. 標籤表 (tags)
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
);

-- 6. 專案標籤關聯 (project_tags)
CREATE TABLE project_tags (
    project_uuid VARCHAR(36) NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (project_uuid, tag_id),
    FOREIGN KEY (project_uuid) REFERENCES projects(uuid) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 7. 聯絡表單 (contacts)
CREATE TABLE contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(100),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    source VARCHAR(50),                    -- 來源頁面
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_by INT,
    read_at TIMESTAMP NULL,
    is_replied BOOLEAN DEFAULT FALSE,
    replied_by INT,
    replied_at TIMESTAMP NULL,
    notes TEXT,                           -- 內部備註
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (read_by) REFERENCES users(id),
    FOREIGN KEY (replied_by) REFERENCES users(id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read)
);

-- 8. API 金鑰 (api_keys)
CREATE TABLE api_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_value VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSON,                      -- 權限設定
    rate_limit INT DEFAULT 1000,          -- 每小時請求限制
    allowed_ips JSON,                     -- IP 白名單
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    last_used_at TIMESTAMP NULL,
    usage_count INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_key_value (key_value),
    INDEX idx_expires_at (expires_at)
);

-- 9. 系統日誌 (system_logs)
CREATE TABLE system_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    level ENUM('error', 'warn', 'info', 'debug') DEFAULT 'info',
    category VARCHAR(50),                  -- 日誌分類
    message TEXT,
    context JSON,                          -- 相關資料
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level_category (level, category),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
);

-- 10. 專案統計 (project_statistics)
CREATE TABLE project_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    project_uuid VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    view_count INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    contact_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_uuid) REFERENCES projects(uuid) ON DELETE CASCADE,
    UNIQUE KEY unique_project_date (project_uuid, date),
    INDEX idx_date (date)
);
```

## API 規格

### 基礎設定
- **Base URL**: `https://api.ZeYang.com/v1`
- **認證方式**: Bearer Token (JWT) / API Key
- **回應格式**: JSON
- **字元編碼**: UTF-8

### API 端點清單

#### 認證管理
```yaml
POST   /auth/login              # 用戶登入
POST   /auth/logout             # 用戶登出
POST   /auth/refresh            # 更新 Token
PUT    /auth/change-password    # 修改密碼
POST   /auth/forgot-password    # 忘記密碼
POST   /auth/reset-password     # 重設密碼
```

#### 專案管理
```yaml
GET    /projects                # 專案列表
GET    /projects/:slug          # 專案詳情
POST   /projects                # 新增專案 [需認證]
PUT    /projects/:uuid          # 更新專案 [需認證]
DELETE /projects/:uuid          # 刪除專案 [需認證]
PATCH  /projects/:uuid/status   # 更新狀態 [需認證]
POST   /projects/:uuid/publish  # 發布專案 [需認證]
POST   /projects/:uuid/feature  # 設為精選 [需認證]

# 圖片管理
POST   /projects/:uuid/images          # 上傳圖片 [需認證]
PUT    /projects/:uuid/images/:id      # 更新圖片 [需認證]
DELETE /projects/:uuid/images/:id      # 刪除圖片 [需認證]
PUT    /projects/:uuid/images/reorder  # 圖片排序 [需認證]
```

#### 標籤管理
```yaml
GET    /tags                    # 標籤列表
GET    /tags/:slug             # 標籤詳情
POST   /tags                   # 新增標籤 [需認證]
PUT    /tags/:id               # 更新標籤 [需認證]
DELETE /tags/:id               # 刪除標籤 [需認證]
```

#### 聯絡表單
```yaml
POST   /contacts                # 提交表單
GET    /contacts                # 表單列表 [需認證]
GET    /contacts/:id           # 表單詳情 [需認證]
PUT    /contacts/:id/read      # 標記已讀 [需認證]
PUT    /contacts/:id/reply     # 回覆訊息 [需認證]
DELETE /contacts/:id           # 刪除訊息 [需認證]
```

#### 統計分析
```yaml
GET    /statistics/overview     # 總覽統計 [需認證]
GET    /statistics/projects     # 專案統計 [需認證]
GET    /statistics/traffic      # 流量統計 [需認證]
GET    /statistics/contacts     # 聯絡統計 [需認證]
```

#### 系統管理
```yaml
GET    /system/health          # 健康檢查
GET    /system/info            # 系統資訊 [需認證]
GET    /system/logs            # 系統日誌 [需認證]
POST   /system/backup          # 資料備份 [需認證]
POST   /system/cache/clear     # 清除快取 [需認證]
```

### API 回應格式

#### 成功回應
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 回應資料
  },
  "meta": {
    "timestamp": "2024-01-20T10:00:00Z",
    "version": "1.0.0"
  }
}
```

#### 錯誤回應
```json
{
  "success": false,
  "message": "錯誤訊息",
  "error": {
    "code": "ERROR_CODE",
    "details": "詳細錯誤說明"
  },
  "errors": [
    {
      "field": "email",
      "message": "Email 格式不正確"
    }
  ]
}
```

#### 分頁回應
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 安全規範

### 認證機制
1. **JWT Token**
   - 有效期限: 24 小時
   - Refresh Token: 7 天
   - 包含資訊: userId, username, role

2. **API Key**
   - 用於第三方整合
   - 可設定權限範圍
   - 支援 IP 白名單

### 輸入驗證
- 所有輸入進行嚴格驗證
- 防止 SQL Injection
- XSS 防護
- CSRF 保護

### 速率限制
```yaml
一般 API:      100 次/15分鐘
登入 API:      5 次/15分鐘
上傳 API:      50 次/小時
API Key:       1000 次/小時
```

### 檔案上傳限制
- 最大檔案: 25MB
- 允許類型: jpg, jpeg, png, gif, webp
- 自動病毒掃描
- 圖片內容驗證

## 圖片處理規格

### 自動處理
1. **壓縮優化**
   - JPEG: 85% 品質
   - PNG: 無損壓縮
   - WebP: 自動轉換

2. **縮圖生成**
   ```yaml
   thumbnail:  150x150  (正方形裁切)
   small:      300x300  (等比縮放)
   medium:     600x600  (等比縮放)
   large:      1200x1200 (等比縮放)
   original:   最大 1920x1920
   ```

3. **儲存結構**
   ```
   uploads/
   └── projects/
       └── {project-uuid}/
           ├── {timestamp}-{hash}-original.jpg
           ├── {timestamp}-{hash}-large.jpg
           ├── {timestamp}-{hash}-medium.jpg
           ├── {timestamp}-{hash}-small.jpg
           └── {timestamp}-{hash}-thumb.jpg
   ```

## 開發規範

### 程式碼風格
- ESLint 設定: Airbnb
- 縮排: 2 空格
- 行尾: LF
- 編碼: UTF-8

### Git 流程
```bash
main          # 正式版本
├── develop   # 開發版本
├── feature/* # 功能開發
├── hotfix/*  # 緊急修復
└── release/* # 發布準備
```

### Commit 規範
```
feat:     新功能
fix:      修復錯誤
docs:     文件更新
style:    程式碼格式
refactor: 重構
test:     測試相關
chore:    維護工作
```

### 環境變數
```env
# 基礎設定
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# 資料庫
DB_HOST=localhost
DB_PORT=3306
DB_USER=ZeYang
DB_PASSWORD=secure_password
DB_NAME=ZeYang_db

# 安全設定
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
REFRESH_SECRET=your-refresh-token-secret
REFRESH_EXPIRES_IN=7d

# 檔案上傳
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp

# 郵件服務
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@ZeYang.com
SMTP_PASS=email_password

# 第三方服務
GOOGLE_MAPS_API_KEY=your-google-maps-key
SENTRY_DSN=your-sentry-dsn
REDIS_URL=redis://localhost:6379

# 系統設定
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
LOG_LEVEL=info
ENABLE_SWAGGER=true
```

## 測試規範

### 單元測試
```javascript
// 測試檔案命名: *.test.js
describe('ProjectService', () => {
  test('should create new project', async () => {
    // 測試內容
  });
});
```

### API 測試
```javascript
// 使用 Supertest
describe('POST /api/projects', () => {
  it('should return 201 when creating project', async () => {
    // 測試內容
  });
});
```

### 測試覆蓋率
- 目標: 80% 以上
- 關鍵業務邏輯: 95% 以上

## 部署流程

### 開發環境
```bash
# 1. 安裝依賴
npm install

# 2. 初始化資料庫
mysql -u root -p < database/init.sql

# 3. 設定環境變數
cp .env.example .env

# 4. 啟動服務
npm run dev
```

### 生產環境
```bash
# 1. 建置前端
cd frontend && npm run build

# 2. PM2 啟動
pm2 start ecosystem.config.js

# 3. Nginx 設定
sudo nginx -t && sudo nginx -s reload
```

### Docker 部署
```bash
# 建置映像
docker-compose build

# 啟動服務
docker-compose up -d

# 查看日誌
docker-compose logs -f
```

## 維護指南

### 日常維護
1. **資料庫備份** (每日)
   ```bash
   npm run backup:db
   ```

2. **圖片清理** (每週)
   ```bash
   npm run cleanup:images
   ```

3. **日誌歸檔** (每月)
   ```bash
   npm run archive:logs
   ```

### 效能優化
1. 資料庫索引優化
2. 圖片 CDN 配置
3. Redis 快取策略
4. API 回應壓縮

### 監控告警
- CPU 使用率 > 80%
- 記憶體使用 > 85%
- 磁碟空間 < 20%
- API 錯誤率 > 5%
- 回應時間 > 1秒

## 常見問題

### Q1: 如何重設管理員密碼？
```bash
npm run admin:reset-password
```

### Q2: 如何匯入大量專案資料？
```bash
npm run import:projects data.csv
```

### Q3: 如何清理未使用的圖片？
```bash
npm run cleanup:unused-images
```

### Q4: 如何產生 API 文件？
```bash
npm run docs:generate
```

## 版本歷史

### v1.0.0 (2024-01-20)
- 初始版本發布
- 基礎 CRUD 功能
- 圖片上傳處理
- JWT 認證系統

## 聯絡資訊

- 專案負責人: Hanfour
- 技術支援: dev@ZeYang.com
- 文件更新: 2024-01-20

---

**注意**: 本文件為 ZeYang 系統的完整技術規格書，請妥善保管並定期更新。