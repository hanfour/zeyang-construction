<div align="center">
  <img src="frontend/public/images/logo-full-brand.svg" alt="EstateHub Logo" width="300" height="100" />
  
  # EstateHub
  ### 🏢 現代化房地產專案管理系統
  
  <p align="center">
    一個功能完整、現代化的房地產專案展示與管理平台
  </p>
</div>

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## 🏢 專案簡介

EstateHub 是一個現代化的房地產專案管理系統，提供完整的專案展示、管理和客戶關係管理解決方案。系統由 React + Node.js + MySQL 開發，具備現代化的用戶界面和強大的後台管理功能。

### ✨ 核心特色

- 🏠 **專案管理**: 完整的房地產專案管理系統
- 🖼️ **圖片管理**: 多尺寸圖片上傳與自動處理
- 🏷️ **標籤系統**: 彈性的內容分類與管理
- 💬 **聯絡管理**: 完整的客戶詢問與回復系統
- 🔒 **認證系統**: JWT 基礎的安全認證
- 📊 **統計報表**: 詳細的數據分析與報表
- 📱 **響應式設計**: 完美支持手機、平板與桌面
- 🌐 **API 文檔**: 完整的 Swagger API 文檔

## 🛠️ 技術架構

### 前端
- **React 18** - 用戶界面框架
- **TypeScript** - 類型安全的 JavaScript
- **Vite** - 快速的構建工具
- **Tailwind CSS** - 實用優先的 CSS 框架
- **React Router** - 客戶端路由
- **Axios** - HTTP 請求庫

### 後端
- **Node.js** - 伺服器端 JavaScript 程序環境
- **Express.js** - Web 應用框架
- **MySQL** - 關聯式資料庫
- **JWT** - JSON Web Token 認證
- **Sharp** - 圖片處理庫
- **Winston** - 日誌管理

### 開發工具
- **Jest** - 單元測試框架
- **Swagger** - API 文檔生成
- **ESLint** - 代碼分析工具
- **Prettier** - 代碼格式化
- **Nodemon** - 開發環境自動重啟

## 💻 系統需求

### 基本需求
- **Node.js** ≥ 18.0.0
- **MySQL** ≥ 8.0
- **npm** ≥ 8.0 或 **yarn** ≥ 1.22
- **磁碟空間** ≥ 2GB
- **記憶體** ≥ 4GB

### 推薦環境
- **作業系統**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **編輯器**: VS Code 搭配 ES6/TypeScript 套件
- **瀏覽器**: Chrome 90+, Firefox 88+, Safari 14+

### Docker 環境（可選）
- **Docker** ≥ 20.10
- **Docker Compose** ≥ 2.0

## 🚀 快速開始

### 1️⃣ 安裝依賴

```bash
# 安裝依賴（將自動安裝前後端依賴）
npm run install:all

# 或手動安裝
# 安裝後端依賴
cd backend && npm install

# 安裝前端依賴
cd ../frontend && npm install
```

### 2️⃣ 環境配置

#### 後端配置
```bash
cd backend
cp .env.example .env
```

編輯 `backend/.env` 文件：
```bash
# 資料庫配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=estatehub

# JWT 安全配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REFRESH_SECRET=your-refresh-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
REFRESH_EXPIRES_IN=7d

# 服務配置
PORT=5000
NODE_ENV=development

# 功能開關
ENABLE_SWAGGER=true
ENABLE_RATE_LIMITING=true

# CORS 配置
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### 前端配置
```bash
cd frontend
cp .env.example .env
```

編輯 `frontend/.env` 文件：
```bash
# API 配置
VITE_API_BASE_URL=http://localhost:5000
VITE_API_PREFIX=/api

# 應用配置
VITE_APP_NAME=EstateHub
VITE_APP_VERSION=2.0.0
```

### 3️⃣ 資料庫初始化

#### 手動初始化
```bash
# 1. 確保 MySQL 服務已啟動
# macOS: brew services start mysql
# Ubuntu: sudo service mysql start
# Windows: net start mysql80

# 2. 創建資料庫和表結構
mysql -u root -p < database/init.sql

# 3. 載入範例資料（可選）
mysql -u root -p estatehub < database/seeds/sample-data.sql
```

#### 使用腳本初始化
```bash
# 自動初始化資料庫和種子資料
./database/run-migration.sh
```

#### Docker 初始化（可選）
```bash
# 使用 Docker Compose 啟動 MySQL
docker-compose up -d mysql

# 等待資料庫啟動完成
docker-compose exec mysql mysql -u root -p estatehub < database/init.sql
```

### 4️⃣ 啟動服務

#### 💻 開發模式（建議）
```bash
# 一鍵啟動前後端服務
npm run dev
```

#### 🔧 手動啟動
```bash
# 終端機 1 - 啟動後端 API 服務
cd backend
npm run dev

# 終端機 2 - 啟動前端開發伺服器
cd frontend
npm run dev
```

#### 🚀 生產模式
```bash
# 構建前端
cd frontend
npm run build

# 啟動生產服務
cd ../backend
npm run start
```

#### 🐳 Docker 啟動（可選）
```bash
# 啟動所有服務
docker-compose up -d

# 查看服務狀態
docker-compose ps
```

### 🌐 訪問網址

啟動成功後，您可以訪問：

- **前端應用**: http://localhost:5173
- **後端 API**: http://localhost:5001  
- **API 文檔**: http://localhost:5001/api-docs
- **系統狀態**: http://localhost:5001/health

### 5️⃣ 預設帳號

| 角色 | 用戶名 | 密碼 | 說明 |
|------|--------|------|------|
| 管理員 | `admin` | `Admin123!` | 具有所有權限 |
| 編輯者 | `editor` | `Editor123!` | 可編輯專案內容 |
| 觀看者 | `viewer` | `Viewer123!` | 只能查看內容 |

> ⚠️ **安全提醒**: 生產環境中務必變更預設密碼！

## 📁 專案結構

```
zeyang/
├── backend/                      # 💻 後端服務
│   ├── config/                   # ⚙️ 系統配置
│   │   ├── constants.js           # 常數定義
│   │   └── database.js            # 資料庫連接配置
│   ├── middleware/               # 🔗 中介軟體
│   │   ├── auth.js                # JWT 認證
│   │   ├── errorHandler.js        # 錯誤處理
│   │   ├── rateLimiter.js         # 速率限制
│   │   ├── upload.js              # 檔案上傳
│   │   └── validation.js          # 資料驗證
│   ├── models/                   # 📊 資料模型
│   │   ├── Project.js             # 專案模型
│   │   └── SimpleProject.js       # 簡化專案模型
│   ├── routes/                   # 🛣️ API 路由
│   │   ├── auth.js                # 認證相關 API
│   │   ├── projects.js            # 專案管理 API
│   │   ├── contacts.js            # 聯絡表單 API
│   │   ├── tags.js                # 標籤管理 API
│   │   ├── projectImages.js       # 圖片管理 API
│   │   ├── statistics.js          # 統計報表 API
│   │   ├── admin.js               # 管理員 API
│   │   ├── system.js              # 系統管理 API
│   │   └── upload.js              # 檔案上傳 API
│   ├── services/                 # 💼 業務邏輯層
│   │   ├── projectService.js      # 專案業務邏輯
│   │   ├── contactService.js      # 聯絡業務邏輯
│   │   ├── tagService.js          # 標籤業務邏輯
│   │   └── projectImageService.js # 圖片業務邏輯
│   ├── utils/                    # 🛠️ 工具函數
│   │   ├── logger.js              # 日誌管理
│   │   ├── emailService.js        # 郵件服務
│   │   ├── imageHandler.js        # 圖片處理
│   │   └── slugGenerator.js       # URL 簡碼生成
│   ├── tests/                    # 🧪 測試檔案
│   │   └── api/                   # API 測試
│   ├── swagger/                  # 📄 API 文檔
│   │   └── api-docs.yml           # Swagger 配置
│   ├── uploads/                  # 🖼️ 上傳檔案目錄
│   └── server.js                 # 🚀 主程式入口
│
├── frontend/                     # 🎨 前端應用
│   ├── src/
│   │   ├── components/           # 🧩 React 組件
│   │   │   ├── Admin/             # 管理員組件
│   │   │   ├── Common/            # 共用組件
│   │   │   ├── Layout/            # 版面配置組件
│   │   │   └── Project/           # 專案相關組件
│   │   ├── contexts/             # 🌐 Context Providers
│   │   │   └── AuthContext.tsx    # 認證狀態管理
│   │   ├── pages/                # 📄 頁面組件
│   │   │   ├── Home/              # 首頁
│   │   │   ├── Projects/          # 專案列表
│   │   │   ├── Admin/             # 管理後台
│   │   │   ├── Login/             # 登入頁面
│   │   │   └── Contact/           # 聯絡我們
│   │   ├── services/             # 🔗 API 服務
│   │   │   ├── api.ts             # 基本 API 配置
│   │   │   ├── auth.service.ts    # 認證服務
│   │   │   ├── project.service.ts # 專案服務
│   │   │   ├── contact.service.ts # 聯絡服務
│   │   │   └── tag.service.ts     # 標籤服務
│   │   ├── types/                # 📝 TypeScript 類型
│   │   │   └── index.ts           # 類型定義
│   │   ├── utils/                # 🛠️ 工具函數
│   │   └── styles/               # 🎨 樣式文件
│   │       └── index.css          # 全域樣式
│   ├── public/                   # 🖼️ 靜態資源
│   │   └── images/               # 圖片資源
│   └── index.html                # 🏠 HTML 入口
│
├── database/                     # 💾 資料庫相關
│   ├── init.sql                  # 初始化 SQL 腳本
│   ├── migrations/               # 資料庫遷移
│   ├── seeds/                    # 種子資料
│   └── run-migration.sh          # 遷移執行腳本
│
├── docs/                         # 📆 文檔目錄
├── .env.example                  # 環境變數範例
├── docker-compose.yml            # Docker 編排檔
├── package.json                  # 專案依賴管理
└── README.md                     # 專案說明文件
```

## 🎆 主要功能

### 🏠 專案管理
- **完整的專案生命週期管理**: 從規劃、進行中、完成到暫停
- **多維度篩選**: 按類型、狀態、位置、價格、面積等篩選
- **智慧搜尋**: 全文搜尋支持，支持中英文
- **精選專案**: 管理員可設定精選專案並自定義顯示順序
- **詳細資訊**: 支持專案的各種資訊字段

### 🖼️ 圖片管理
- **多檔案上傳**: 支持批量上傳圖片
- **自動處理**: 自動產生多種尺寸的縮圖
- **格式優化**: 自動轉換為 WebP 格式提升效能
- **圖片管理**: 設定主圖、插入說明、調整順序
- **應用最佳化**: 應用優先策略和延遲載入

### 🏷️ 標籤系統
- **彈性分類**: 支持多種標籤分類（風格、特色、位置等）
- **熱門排行**: 按使用次數自動排序熱門標籤
- **智慧搜尋**: 支持標籤名稱的模糊搜尋
- **關聯推薦**: 根據標籤關聯性推薦相關專案

### 💬 聯絡管理
- **完整表單**: 支持完整的聯絡資訊收集
- **狀態追蹤**: 標記已讀、已回復、重要等狀態
- **批量操作**: 支持批量標記、批量刪除
- **統計分析**: 提供詳細的聯絡統計報表
- **自動回復**: 支持設定自動回復範本

### 🔒 安全認證
- **JWT 認證**: 使用現代化的 JSON Web Token
- **角色權限**: 精細的角色與權限控制
- **令牌刷新**: 支持 Access Token 和 Refresh Token
- **密碼安全**: 密碼加密、複雜度檢查
- **安全標頭**: 包含完整的安全標頭配置

### 📈 統計分析
- **實時監控**: 系統健康狀態監控
- **數據統計**: 專案瀏覽、聯絡詢問統計
- **效能監控**: API 響應時間、資料庫效能監控
- **用戶行為**: 用戶操作記錄與分析

### 🛡️ 安全防護
- **速率限制**: 防止 API 濫用和 DDoS 攻擊
- **輸入驗證**: 完整的輸入數據清洗與驗證
- **CORS 配置**: 精確的跨域資源共享配置
- **SQL 注入防護**: 使用參數化查詢防止 SQL 注入
- **XSS 防護**: HTML 輸入清洗和輸出編碼

### 📊 管理後台
- **直覺式界面**: 現代化的管理後台界面
- **權限管理**: 精細的用戶角色與權限管理
- **操作日誌**: 完整的管理操作記錄
- **批量操作**: 支持多種批量操作功能
- **數據導入/導出**: Excel/CSV 格式數據交換

## 📚 開發指南

### 開發環境設置

```bash
# 安裝預提交鉤子（代碼品質檢查）
npm run install:hooks

# 啟動開發環境（自動重載）
npm run dev

# 分別啟動前後端
npm run dev:backend   # 啟動後端 API
npm run dev:frontend  # 啟動前端應用
```

### 資料庫管理

```bash
# 執行資料庫遷移
./database/run-migration.sh

# 執行特定遷移
mysql -u root -p estatehub < database/migrations/your-migration.sql

# 重設資料庫（警告：會清空所有資料）
npm run db:reset
```

### 測試執行

```bash
# 後端單元測試
cd backend
npm test

# 後端測試涵蓋率
npm run test:coverage

# 前端測試
cd frontend  
npm test

# E2E 測試（需要先啟動服務）
npm run test:e2e

# API 測試（使用實際資料庫）
npm run test:api
```

### 代碼品質檢查

```bash
# ESLint 檢查
npm run lint

# ESLint 自動修復
npm run lint:fix

# Prettier 格式化
npm run format

# TypeScript 類型檢查
npm run type-check
```

### 產品部署

```bash
# 構建生產版本
npm run build

# 始生產服務（需要先構建）
npm start

# Docker 構建
docker build -t estatehub .
docker run -p 5000:5000 estatehub

# Docker Compose 部署
docker-compose up -d
```

## 🔗 API 端點摘要

### 🔐 認證相關
- `POST /api/auth/login` - 用戶登入
- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/refresh` - 刷新令牌
- `GET /api/auth/me` - 獲取當前用戶資訊
- `PUT /api/auth/change-password` - 變更密碼
- `POST /api/auth/logout` - 用戶登出

### 🏠 專案管理
- `GET /api/projects` - 獲取專案列表（支持篩選、搜尋、分頁）
- `GET /api/projects/featured` - 獲取精選專案
- `GET /api/projects/search` - 搜尋專案
- `GET /api/projects/{identifier}` - 獲取單一專案詳情
- `POST /api/projects` - 建立新專案 🔒
- `PUT /api/projects/{identifier}` - 更新專案 🔒
- `DELETE /api/projects/{identifier}` - 刪除專案 🔒
- `PATCH /api/projects/{identifier}/status` - 更新專案狀態 🔒
- `POST /api/projects/{identifier}/feature` - 切換精選狀態 🔒

### 🏷️ 標籤管理
- `GET /api/tags` - 獲取標籤列表
- `GET /api/tags/popular` - 獲取熱門標籤
- `GET /api/tags/search` - 搜尋標籤
- `GET /api/tags/{identifier}` - 獲取單一標籤
- `POST /api/tags` - 建立新標籤 🔒
- `PUT /api/tags/{identifier}` - 更新標籤 🔒
- `DELETE /api/tags/{identifier}` - 刪除標籤 🔒

### 💬 聯絡管理
- `POST /api/contacts` - 提交聯絡表單
- `GET /api/contacts` - 獲取聯絡訊息列表 🔒
- `GET /api/contacts/{id}` - 獲取單一聯絡訊息 🔒
- `PUT /api/contacts/{id}/read` - 標記為已讀 🔒
- `PUT /api/contacts/{id}/reply` - 回復聯絡訊息 🔒
- `DELETE /api/contacts/{id}` - 刪除聯絡訊息 🔒
- `GET /api/contacts/statistics` - 獲取聯絡統計 🔒

### 🖼️ 圖片管理
- `GET /api/projects/{identifier}/images` - 獲取專案圖片 🔒
- `POST /api/projects/{identifier}/images` - 上傳專案圖片 🔒
- `PUT /api/projects/{identifier}/images/{id}` - 更新圖片資訊 🔒
- `DELETE /api/projects/{identifier}/images/{id}` - 刪除圖片 🔒
- `POST /api/projects/{identifier}/images/{id}/set-main` - 設定主圖 🔒

### 📈 系統管理
- `GET /health` - 基本健康檢查
- `GET /api/system/health` - 詳細健康檢查
- `GET /api/system/info` - 系統資訊 🔒

> 🔒 表示需要認證的端點  
> 完整 API 文檔請參考: [API 測試指南](backend/API-GUIDE.md) 或 [Swagger 文檔](http://localhost:5001/api-docs)

## 🔒 安全注意事項

### 🔑 必要安全配置
1. **更改預設密鑰**: 修改 `.env` 中的所有 JWT 密鑰和資料庫密碼
2. **HTTPS 加密**: 生產環境中務必使用 HTTPS 協議
3. **防火牆配置**: 只開放必要的連接埠（443, 80, 3306）
4. **資料庫安全**: 設置強密碼，限制遠端存取
5. **環境變數**: 使用環境變數管理敏感資訊

### 🛡️ 進階安全措施
- **速率限制**: 已內建 API 速率限制機制
- **輸入清洗**: 所有輸入都經過驗證和清洗
- **SQL 注入防護**: 使用參數化查詢
- **XSS 防護**: 前端輸出編碼和 CSP 設定
- **CSRF 防護**: CSRF 令牌驗證

### 🔄 維護建議
- **定期更新**: 定期更新依賴包和系統軟體
- **備份策略**: 定期備份資料庫和上傳檔案
- **監控告警**: 設置系統監控和異常告警
- **日誌稽核**: 定期檢查安全日誌
- **權限稽核**: 定期檢查用戶權限設定

### ⚠️ 生產環境檢查清單
- [ ] 更改所有預設密碼和密鑰
- [ ] 設定 NODE_ENV=production
- [ ] 啟用 HTTPS 和 SSL 證書
- [ ] 設定正確的 CORS 域名
- [ ] 關閉 Swagger 文檔（ENABLE_SWAGGER=false）
- [ ] 設定資料庫連接加密
- [ ] 配置防火牆規則
- [ ] 設置監控和告警
- [ ] 執行安全測試和審核

## 📝 貢獻指南

歡迎參與 EstateHub 專案的開發！請閱讀以下指南：

### 提交 Issues
如果您發現了 Bug 或有新功能建議，請在 GitHub Issues 中提交。

### Pull Requests
1. Fork 本專案
2. 創建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的變更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

### 代碼風格
請遵循專案中的 ESLint 和 Prettier 配置。

## 📞 支持與聯絡

- **技術支持**: [GitHub Issues](https://github.com/your-repo/estatehub/issues)
- **功能建議**: [GitHub Discussions](https://github.com/your-repo/estatehub/discussions)
- **安全問題**: security@estatehub.com
- **商業合作**: business@estatehub.com

## 📜 相關文檔

- [API 測試指南](backend/API-GUIDE.md) - 完整的 API 測試文檔
- [Swagger API 文檔](http://localhost:5001/api-docs) - 互動式 API 文檔
- [資料庫架構文檔](database/README.md) - 資料庫設計說明
- [部署指南](docs/DEPLOYMENT.md) - 生產環境部署指南
- [系統架構文檔](docs/ARCHITECTURE.md) - 技術架構說明

## 🏆 致謝

感謝以下開源專案的貢獻：

- [React](https://reactjs.org/) - 前端框架
- [Express.js](https://expressjs.com/) - 後端框架  
- [MySQL](https://www.mysql.com/) - 資料庫系統
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Sharp](https://sharp.pixelplumbing.com/) - 圖片處理

## 📄 許可證

本專案採用 [MIT License](LICENSE) 許可證。

---

<div align="center">
  <p>🏢 <strong>EstateHub</strong> - 當代房地產專案管理解決方案</p>
  <p>由 ❤️ 和 ☕ 在台灣製作</p>
</div>