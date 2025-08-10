# EstateHub - 房地產專案管理系統

## 專案簡介

EstateHub 是一個全端房地產展示與管理系統，提供專業的房地產專案展示平台和完整的後台管理功能。

## 系統需求

- Node.js 18+
- MySQL 8.0+
- npm 8+

## 快速開始

### 1. 安裝依賴

```bash
# 安裝後端依賴
cd backend
npm install

# 安裝前端依賴
cd ../frontend
npm install
```

### 2. 設置環境變數

```bash
# 後端環境變數
cd backend
cp .env.example .env
# 編輯 .env 文件，設置資料庫連接等配置

# 前端環境變數
cd ../frontend
cp .env.example .env
# 編輯 .env 文件，設置 API 端點等配置
```

### 3. 初始化資料庫

```bash
# 確保 MySQL 服務已啟動
cd backend
mysql -u root -p < ../database/init.sql
```

### 4. 啟動專案

#### 方法一：分別啟動前後端

```bash
# 終端機 1 - 啟動後端
cd backend
npm run dev

# 終端機 2 - 啟動前端
cd frontend
npm run dev
```

#### 方法二：使用並行啟動腳本

```bash
# 在專案根目錄
npm install
npm run dev
```

- 後端服務將在 http://localhost:5001 啟動
- 前端應用將在 http://localhost:5173 啟動
- API 文檔（Swagger）在 http://localhost:5001/api-docs

### 5. 預設帳號

```
管理員帳號：admin
密碼：admin123456
```

## 專案結構

```
BuildSight/
├── backend/               # 後端服務
│   ├── config/           # 配置文件
│   ├── controllers/      # 控制器
│   ├── middleware/       # 中間件
│   ├── models/           # 資料模型
│   ├── routes/           # API 路由
│   ├── services/         # 服務層
│   ├── utils/            # 工具函數
│   └── server.js         # 入口文件
├── frontend/             # 前端應用
│   ├── src/
│   │   ├── components/   # React 組件
│   │   ├── contexts/     # Context Providers
│   │   ├── pages/        # 頁面組件
│   │   ├── services/     # API 服務
│   │   ├── styles/       # 樣式文件
│   │   └── utils/        # 工具函數
│   └── index.html        # HTML 入口
├── database/             # 資料庫腳本
└── .claude/              # Claude AI 開發文檔
```

## 主要功能

- 用戶認證系統（JWT）
- 專案管理
- 圖片上傳與處理
- 聯絡表單
- 後台管理
- API 速率限制
- 安全防護

## 開發指南

### 啟動開發環境

```bash
# 後端開發模式
cd backend
npm run dev
```

### 資料庫遷移

```bash
cd backend
npm run db:migrate
```

### 運行測試

```bash
cd backend
npm test
```

## API 端點

- `POST /api/auth/login` - 用戶登入
- `GET /api/auth/me` - 獲取當前用戶資訊
- `GET /api/projects` - 獲取專案列表
- `POST /api/contacts` - 提交聯絡表單
- `GET /api/system/health` - 系統健康檢查

## 安全注意事項

1. 修改 `.env` 中的所有密鑰和密碼
2. 在生產環境中使用 HTTPS
3. 定期更新依賴包
4. 設置適當的 CORS 配置

## License

ISC