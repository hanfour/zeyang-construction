<div align="center">
  <img src="frontend/public/images/logo-full-brand.svg" alt="澤暘建設" width="300" height="100" />
  
  # 澤暘建設官網
  ### 誠信築基 · 匠心營造

  <p align="center">
    現代化房地產企業官網，融合品牌展示與專案管理功能
  </p>
</div>

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-yellow)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

## 🏢 關於澤暘建設

澤暘建設秉持「誠信築基、匠心營造」之核心精神，深耕台灣土地多年，以深厚的在地情感，精雕細琢每一建築細節，追求完美居住體驗。澤暘建設相信，好的住宅不僅是建築本身，更是生活價值的延伸與呈現。

### 🌟 核心理念

- **🏠 HOME OF DREAMS** - 築夢之家，為每個家庭打造理想居住空間
- **⚒️ PREMIUM STANDARD BUILDING** - 精工鍛造，機能尺度量化家的幸福  
- **🌱 LIVING IN SUSTAINABLE HARMONY** - 自然森活，與環境共生的永續居住
- **🏛️ CLASSIC ARCHITECTURE** - 經典建築，傳承時代的建築美學

## ✨ 網站特色

### 🎨 前端功能
- **📱 響應式設計**: 完美支援桌面、平板與手機裝置
- **🎬 動態視覺效果**: 使用 GSAP 與 Framer Motion 打造流暢的滾動動畫與視差效果
- **🖼️ 沉浸式體驗**: 影片背景、圖片輪播與互動式元件
- **🏠 專案展示**: 動態專案列表、詳細資訊展示與圖片管理
- **💬 聯絡系統**: 智能聯絡表單與即時訊息處理
- **🎯 SEO 優化**: React Helmet 管理 meta 標籤與 SEO
- **🔍 智能搜尋**: 全文搜尋與多維度篩選功能

### 🛠️ 後端管理
- **👥 用戶認證**: JWT 基礎的安全登入系統
- **📊 專案管理**: 完整的房地產專案 CRUD 操作與圖片管理
- **🖼️ 圖片處理**: 多尺寸圖片自動處理與優化 (Sharp)
- **🏷️ 標籤系統**: 彈性的專案分類與標籤管理
- **📈 數據統計**: 詳細的訪問統計與分析報表
- **⚙️ 系統設定**: 郵件服務與系統參數配置
- **📧 郵件服務**: Nodemailer 整合的聯絡表單郵件通知

### 🔒 安全防護
- **🛡️ 資料驗證**: 完整的輸入驗證與清洗機制
- **🚦 速率限制**: API 請求頻率控制防止濫用
- **🔐 密碼加密**: bcrypt 加密保護用戶密碼
- **🌐 CORS 配置**: 精確的跨域資源共享設定
- **🛡️ 安全標頭**: Helmet 中介軟體保護

## 🛠️ 技術架構

### 前端技術
- **React 18** - 現代化前端框架與 Hooks
- **TypeScript** - 類型安全的開發體驗
- **Vite** - 極速的開發與建置工具
- **Tailwind CSS** - 實用優先的 CSS 框架
- **GSAP** - 專業級動畫與視覺效果
- **Framer Motion** - 聲明式動畫庫
- **React Router Dom** - 單頁應用路由管理
- **React Hook Form** - 高效能表單處理
- **React Query** - 數據獲取與狀態管理
- **Zustand** - 輕量級狀態管理
- **Axios** - HTTP 請求處理
- **Swiper** - 觸控友好的輪播組件
- **React Helmet Async** - SEO 與 meta 標籤管理

### 後端技術
- **Node.js 18+** - 伺服器端 JavaScript 運行環境
- **Express.js** - 快速、極簡的 Web 框架
- **MySQL 8.0+** - 穩定可靠的關聯式資料庫
- **JWT** - 安全的身份驗證機制
- **Sharp** - 高效能圖片處理庫
- **Winston** - 專業日誌管理系統
- **Helmet** - 安全標頭中介軟體
- **Multer** - 檔案上傳處理
- **Nodemailer** - 郵件服務集成
- **Express Validator** - 請求驗證中介軟體
- **Express Rate Limit** - API 速率限制

### 開發工具
- **Jest** - 現代化測試框架 (30+ 測試用例)
- **Supertest** - HTTP 斷言測試
- **ESLint** - 代碼品質檢查
- **Prettier** - 代碼格式化工具
- **Nodemon** - 開發環境自動重啟
- **Swagger** - API 文檔自動生成

## 💻 系統需求

### 基本環境
- **Node.js** ≥ 18.0.0
- **MySQL** ≥ 8.0
- **npm** ≥ 8.0 或 **yarn** ≥ 1.22

### 推薦配置
- **記憶體**: 4GB RAM 以上
- **硬碟空間**: 5GB 可用空間
- **作業系統**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

## 🚀 快速開始

### 1️⃣ 專案安裝

```bash
# 克隆專案
git clone <repository-url>
cd zeyang

# 安裝後端依賴
cd backend && npm install

# 安裝前端依賴
cd ../frontend && npm install
```

### 2️⃣ 環境配置

#### 後端環境變數
```bash
cd backend
cp .env.example .env
```

編輯 `backend/.env`：
```env
# 資料庫配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=zeyang

# JWT 安全金鑰
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# 服務配置
PORT=5001
NODE_ENV=development

# 上傳設定
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# 郵件服務配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@zeyang.com

# 安全設定
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

#### 前端環境變數
```bash
cd frontend
cp .env.example .env
```

編輯 `frontend/.env`：
```env
# API 服務配置
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
```

### 3️⃣ 資料庫初始化

```bash
# 1. 啟動 MySQL 服務
# macOS: brew services start mysql
# Ubuntu: sudo service mysql start  
# Windows: net start mysql80

# 2. 建立資料庫
mysql -u root -p -e "CREATE DATABASE zeyang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. 執行初始化腳本
mysql -u root -p zeyang < backend/database/schema.sql

# 4. 執行資料庫遷移 (如有需要)
cd backend
for migration in database/migrations/*.sql; do
    echo "執行遷移: $migration"
    mysql -u root -p zeyang < "$migration"
done
```

### 4️⃣ 啟動服務

#### 開發模式（推薦）
```bash
# 後端 API 服務
cd backend
npm run dev

# 前端開發服務 (另開終端)
cd frontend
npm run dev
```

#### 生產模式
```bash
# 建置前端
cd frontend
npm run build

# 啟動後端生產服務
cd ../backend
npm start
```

### 🌐 訪問服務

啟動成功後可訪問：

- **🎨 前端網站**: http://localhost:5173
- **🔗 後端 API**: http://localhost:5001/api
- **📚 API 文檔**: http://localhost:5001/api-docs
- **💚 健康檢查**: http://localhost:5001/api/health
- **🔧 管理後台**: http://localhost:5173/admin

### 🔑 預設帳號

| 角色 | 帳號 | 密碼 | 說明 |
|------|------|------|------|
| 管理員 | `admin` | `admin123` | 完整系統權限 |

> ⚠️ **重要**: 生產環境請務必變更預設密碼！

## 📁 專案結構

```
zeyang/
├── 📁 backend/                   # 後端 API 服務
│   ├── 📁 config/                # 系統配置
│   │   ├── constants.js          # 常數定義
│   │   └── database.js           # 資料庫配置
│   ├── 📁 middleware/            # 中介軟體
│   │   ├── auth.js               # JWT 認證
│   │   ├── rateLimiter.js        # 速率限制
│   │   ├── upload.js             # 檔案上傳
│   │   └── validation.js         # 資料驗證
│   ├── 📁 models/                # 資料模型
│   │   └── Project.js            # 專案模型
│   ├── 📁 routes/                # API 路由
│   │   ├── auth.js               # 認證路由
│   │   ├── projects.js           # 專案路由
│   │   ├── contacts.js           # 聯絡路由
│   │   ├── tags.js               # 標籤路由
│   │   ├── statistics.js         # 統計路由
│   │   ├── settings.js           # 設定路由
│   │   └── upload.js             # 上傳路由
│   ├── 📁 services/              # 業務邏輯
│   │   ├── projectService.js     # 專案服務
│   │   ├── contactService.js     # 聯絡服務
│   │   ├── tagService.js         # 標籤服務
│   │   └── settingsService.js    # 設定服務
│   ├── 📁 utils/                 # 工具函數
│   │   ├── logger.js             # 日誌工具
│   │   ├── emailService.js       # 郵件服務
│   │   └── imageHandler.js       # 圖片處理
│   ├── 📁 tests/                 # 測試檔案 (30+ 測試)
│   │   ├── 📁 api/               # API 測試
│   │   └── 📁 helpers/           # 測試輔助
│   ├── 📁 uploads/               # 上傳檔案
│   │   ├── 📁 projects/          # 專案圖片
│   │   └── 📁 avatars/           # 頭像圖片
│   ├── 📁 database/              # 資料庫相關
│   │   ├── schema.sql            # 資料庫結構
│   │   └── 📁 migrations/        # 資料庫遷移
│   └── 📄 server.js              # 主程式入口
│
├── 📁 frontend/                  # 前端 React 應用
│   ├── 📁 src/
│   │   ├── 📁 components/        # React 組件
│   │   │   ├── 📁 Admin/         # 管理後台組件
│   │   │   │   ├── DynamicFieldManager.tsx
│   │   │   │   ├── ProjectImageManager.tsx
│   │   │   │   └── ProjectImageUploader.tsx
│   │   │   ├── 📁 Common/        # 共用組件
│   │   │   │   ├── ErrorMessage.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── Logo.tsx
│   │   │   │   ├── PrivateRoute.tsx
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   └── TagSelector.tsx
│   │   │   ├── 📁 Layout/        # 版面配置
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── NavigationMenu.tsx
│   │   │   ├── 📁 Carousel/      # 輪播組件
│   │   │   │   └── CustomCarousel.tsx
│   │   │   └── 📁 Team/          # 團隊組件
│   │   │       └── TeamMember.tsx
│   │   ├── 📁 pages/             # 頁面組件
│   │   │   ├── 📁 Home/          # 首頁與子組件
│   │   │   │   ├── index.tsx
│   │   │   │   └── 📁 components/
│   │   │   │       ├── Hero.tsx
│   │   │   │       ├── ClassicSection.tsx
│   │   │   │       ├── DreamSection.tsx
│   │   │   │       ├── SustainSection.tsx
│   │   │   │       ├── CraftSection.tsx
│   │   │   │       ├── FeaturedProjects.tsx
│   │   │   │       └── AnimatedSections.tsx
│   │   │   ├── 📁 About/         # 關於我們
│   │   │   ├── 📁 Projects/      # 專案展示
│   │   │   ├── 📁 Contact/       # 聯絡我們
│   │   │   ├── 📁 Team/          # 團隊介紹
│   │   │   ├── 📁 Development/   # 開發案例
│   │   │   ├── 📁 Login/         # 登入頁面
│   │   │   └── 📁 Admin/         # 管理後台
│   │   │       ├── 📁 Dashboard/ # 控制台
│   │   │       ├── 📁 Projects/  # 專案管理
│   │   │       ├── 📁 Contacts/  # 聯絡管理
│   │   │       ├── 📁 Tags/      # 標籤管理
│   │   │       └── 📁 Settings/  # 系統設定
│   │   ├── 📁 services/          # API 服務
│   │   │   ├── api.ts            # API 基礎配置
│   │   │   ├── auth.service.ts   # 認證服務
│   │   │   ├── project.service.ts # 專案服務
│   │   │   ├── contact.service.ts # 聯絡服務
│   │   │   ├── tag.service.ts    # 標籤服務
│   │   │   └── settings.service.ts # 設定服務
│   │   ├── 📁 contexts/          # React Context
│   │   │   └── AuthContext.tsx   # 認證上下文
│   │   ├── 📁 types/             # TypeScript 類型
│   │   │   └── index.ts          # 類型定義
│   │   └── 📁 utils/             # 工具函數
│   │       ├── format.ts         # 格式化工具
│   │       └── image.ts          # 圖片處理工具
│   ├── 📁 public/                # 靜態資源
│   │   └── 📁 images/            # 圖片資源
│   │       ├── 📁 about/         # 關於頁面圖片
│   │       ├── 📁 contact/       # 聯絡頁面圖片
│   │       ├── 📁 index/         # 首頁圖片
│   │       ├── 📁 project/       # 專案圖片
│   │       └── 📁 team/          # 團隊圖片
│   └── 📁 build/                 # 建置輸出目錄
│
├── 📁 database/                  # 資料庫相關 (根目錄)
│   ├── 📄 init.sql               # 初始化腳本
│   ├── 📁 migrations/            # 資料庫遷移
│   └── 📁 seeds/                 # 種子資料
│
├── 📄 package-project.sh         # 專案打包腳本
├── 📄 DEPLOYMENT_GUIDE.md        # 詳細部署指南
├── 📄 README_FOR_VENDOR.md       # 廠商快速指南
└── 📄 README.md                  # 專案說明文件
```

## 🎯 主要頁面與功能

### 🏠 首頁功能
- **Hero 區塊**: 動態影片背景展示品牌形象
- **築夢理念**: 滾動觸發的視差動畫展示核心理念
- **熱銷專案**: 動態載入的精選專案輪播
- **品牌特色**: 四大核心價值動畫展示
- **聯絡資訊**: 快速聯絡與諮詢功能

### 📖 關於我們
- **品牌故事**: 澤暘建設的發展歷程與理念
- **經營團隊**: 專業團隊介紹與核心成員
- **建築理念**: 四大核心建築理念詳細說明
- **動畫效果**: 豐富的 GSAP 滾動動畫

### 🏗️ 專案展示
- **專案列表**: 響應式網格展示所有專案
- **智能篩選**: 多維度篩選（狀態、類型、位置、價格）
- **搜尋功能**: 全文搜尋支援中英文
- **專案詳情**: 詳細的專案資訊與圖片展示

### 👥 團隊夥伴
- **合作夥伴**: 展示重要合作夥伴與供應商
- **專業認證**: 相關建築與房地產認證展示
- **企業形象**: 品牌價值與企業文化展示

### 💬 聯絡我們
- **智能表單**: React Hook Form 驅動的聯絡表單
- **即時驗證**: 前端表單驗證與錯誤處理
- **郵件通知**: 自動發送確認郵件與管理員通知
- **多元聯絡**: 電話、郵件、地址等多種聯絡方式

### 🔧 管理後台
- **專案管理**: 完整的專案 CRUD 操作
- **圖片管理**: 批量上傳、多尺寸處理與排序功能
- **聯絡管理**: 客戶詢問處理與回覆功能
- **標籤管理**: 動態標籤創建與分類管理
- **數據統計**: 網站訪問與業務數據分析
- **系統設定**: 郵件配置與系統參數管理

## 🧪 測試與品質保證

### 測試覆蓋率
- **後端 API 測試**: 30+ 完整的 REST API 測試套件
- **前端組件測試**: React 組件單元測試
- **整合測試**: 端對端功能測試
- **安全測試**: API 安全性與權限測試

### 執行測試
```bash
# 後端測試
cd backend
npm test                    # 完整測試套件
npm run test:coverage      # 測試覆蓋率報告
npm run test:auth          # 認證測試
npm run test:projects      # 專案功能測試
npm run test:contacts      # 聯絡功能測試

# 前端測試
cd frontend
npm test                   # React 組件測試
npm run test:coverage      # 前端測試覆蓋率

# 代碼品質檢查
npm run lint               # ESLint 檢查
npm run lint:fix          # 自動修正問題
npm run format            # Prettier 格式化
```

## 🔒 安全性

### 已實施的安全措施
- **JWT 認證**: 安全的 Token 基礎認證
- **密碼加密**: bcrypt 雜湊加密
- **速率限制**: API 請求頻率控制
- **輸入驗證**: 嚴格的資料驗證與清洗
- **CORS 控制**: 精確的跨域資源控制
- **安全標頭**: Helmet 中介軟體安全配置
- **文件上傳**: 檔案類型與大小限制

### 生產環境檢查清單
- [ ] 更改所有預設密碼
- [ ] 設定 `NODE_ENV=production`
- [ ] 啟用 HTTPS 憑證
- [ ] 配置正確的 CORS 域名
- [ ] 設定強密碼 JWT 密鑰
- [ ] 關閉開發用 API 文檔
- [ ] 設定資料庫連線加密
- [ ] 配置系統監控與告警

## 📈 效能優化

### 前端優化
- **圖片懶載入**: Intersection Observer API
- **代碼分割**: React.lazy 動態載入
- **資源壓縮**: Vite 自動壓縮與優化
- **圖片優化**: 多格式支援 (WebP, PNG, JPG)
- **快取策略**: 靜態資源瀏覽器快取

### 後端優化  
- **資料庫索引**: 關鍵欄位索引優化
- **圖片處理**: Sharp 高效能圖片處理與多尺寸生成
- **連線池**: MySQL 連線池管理
- **壓縮中介軟體**: Gzip 壓縮回應資料
- **記憶體管理**: 適當的記憶體使用與垃圾回收

## 🌐 部署指南

### 快速部署 (推薦)
使用提供的自動化部署腳本：

```bash
# 1. 解壓縮部署檔案
tar -xzf zeyang-construction-deployment-YYYYMMDD_HHMMSS.tar.gz
cd zeyang-construction-deployment-YYYYMMDD_HHMMSS

# 2. 執行自動化部署
chmod +x deployment/scripts/*.sh
./deployment/scripts/install.sh        # 安裝依賴
./deployment/scripts/setup-database.sh # 設定資料庫
./deployment/scripts/start.sh          # 啟動服務
```

### 生產環境部署
```bash
# 使用 PM2 管理
npm install -g pm2
cd backend
pm2 start server.js --name "zeyang-backend"
pm2 startup
pm2 save

# 使用 Nginx 代理
sudo nginx -t
sudo systemctl reload nginx
```

### Docker 部署 (未來支援)
```bash
# 建置 Docker 映像
docker build -t zeyang .

# 使用 Docker Compose
docker-compose up -d
```

## 📚 相關文檔

- **[部署指南](DEPLOYMENT.md)** - 完整的生產環境部署說明
- **[Swagger API 文檔](http://localhost:5001/api-docs)** - 互動式 API 文檔
- **[資料庫架構](backend/database/schema.sql)** - 資料庫結構說明

## 🤝 貢獻指南

歡迎參與專案開發！請遵循以下步驟：

1. Fork 專案倉庫
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 遵循代碼風格規範
4. 撰寫適當的測試
5. 提交變更 (`git commit -m 'Add amazing feature'`)
6. 推送到分支 (`git push origin feature/amazing-feature`)
7. 開啟 Pull Request

### 代碼規範
- 使用 ESLint 與 Prettier 保持代碼一致性
- 撰寫有意義的提交訊息
- 為新功能撰寫測試
- 更新相關文檔

## 📞 技術支援

- **GitHub Issues**: 回報問題與功能建議
- **技術文檔**: 查閱完整的技術文檔
- **聯絡我們**: 商業合作與技術諮詢

### 常見問題
1. **Q**: 如何修改預設密碼？
   **A**: 登入管理後台後，前往「系統設定 > 密碼管理」修改。

2. **Q**: 如何配置郵件服務？
   **A**: 在 `backend/.env` 中設定 SMTP 相關參數。

3. **Q**: 支援哪些圖片格式？
   **A**: 支援 JPG, PNG, WebP 格式，自動生成多種尺寸。

## 📄 版權聲明

本專案採用 [MIT License](LICENSE) 授權條款。

---

<div align="center">
  <p><strong>澤暘建設</strong> - 誠信築基 · 匠心營造</p>
  <p>💻 現代化房地產企業數位解決方案</p>
  <p>🇹🇼 Made with ❤️ in Taiwan</p>
  
  <br>
  
  <p>
    <a href="#top">⬆️ 回到頂部</a> | 
    <a href="DEPLOYMENT.md">📖 部署指南</a> | 
    <a href="http://localhost:5001/api-docs">📚 API 文檔</a>
  </p>
</div>