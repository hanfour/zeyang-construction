# EstateHub API 完整測試指南

> 版本：2.0.0  
> 更新日期：2025-08-14

## 概述

EstateHub API 是一個房地產專案管理系統的 RESTful API，提供完整的專案管理、用戶認證、標籤管理和聯絡表單功能。

## 環境設置

### 1. 安裝依賴
```bash
cd backend
npm install
```

### 2. 環境變數配置
```bash
cp .env.example .env
```

編輯 `.env` 文件，設置以下必要變數：
```bash
# 資料庫配置
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=estatehub

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key
REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=24h
REFRESH_EXPIRES_IN=7d

# 其他配置
PORT=5000
NODE_ENV=development
ENABLE_SWAGGER=true
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. 資料庫初始化
```bash
# 創建資料庫和表結構
mysql -u root -p < database/init.sql

# 載入範例資料（可選）
mysql -u root -p estatehub < database/seeds/sample-data.sql
```

### 4. 啟動服務
```bash
# 開發模式
npm run dev

# 或者
node server.js
```

### 5. API 文檔
啟動後可訪問：http://localhost:5001/api-docs

## API 端點測試

### 基本資訊
- **Base URL**: `http://localhost:5001/api`
- **認證方式**: Bearer Token (JWT)
- **內容類型**: `application/json`
- **API 文檔**: `http://localhost:5001/api-docs`

### 1. 認證相關 API

#### 1.1 用戶登入
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

**回應範例：**
```json
{
  "success": true,
  "message": "登入成功",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 1.2 用戶註冊
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "SecurePass123!"
  }'
```

#### 1.3 刷新令牌
```bash
curl -X POST http://localhost:5001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

#### 1.4 獲取當前用戶資訊
```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 1.5 變更密碼
```bash
curl -X PUT http://localhost:5001/api/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword",
    "newPassword": "NewSecurePass123!"
  }'
```

#### 1.6 用戶登出
```bash
curl -X POST http://localhost:5001/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. 專案管理 API

#### 2.1 獲取專案列表（公開）
```bash
# 基本查詢
curl -X GET http://localhost:5001/api/projects

# 帶篩選條件
curl -X GET "http://localhost:5001/api/projects?type=residential&status=in_progress&page=1&limit=10&isFeatured=true"

# 排序
curl -X GET "http://localhost:5001/api/projects?orderBy=viewCount&orderDir=DESC&limit=5"

# 搜尋關鍵字
curl -X GET "http://localhost:5001/api/projects?search=台北&type=residential"
```

**查詢參數：**
- `page`: 頁碼 (預設: 1)
- `limit`: 每頁筆數 (預設: 20, 最大: 100)
- `type`: 專案類型 (`residential`, `commercial`, `mixed`, `other`)
- `status`: 專案狀態 (`planning`, `in_progress`, `completed`, `on_hold`)
- `isFeatured`: 是否精選專案 (`true`, `false`)
- `search`: 搜尋關鍵字
- `orderBy`: 排序欄位 (`displayOrder`, `created_at`, `viewCount`, `name`)
- `orderDir`: 排序方向 (`ASC`, `DESC`)

#### 2.2 獲取精選專案
```bash
curl -X GET "http://localhost:5001/api/projects/featured?limit=6"
```

#### 2.3 搜尋專案
```bash
curl -X GET "http://localhost:5001/api/projects/search?q=豪宅&page=1&limit=10"
```

#### 2.4 獲取單一專案
```bash
# 使用專案識別碼
curl -X GET http://localhost:5001/api/projects/taipei-luxury-residence

# 使用 UUID
curl -X GET http://localhost:5001/api/projects/550e8400-e29b-41d4-a716-446655440000
```

#### 2.5 獲取相關專案
```bash
curl -X GET "http://localhost:5001/api/projects/taipei-luxury-residence/related?limit=4"
```

#### 2.6 創建新專案（需要認證）
```bash
curl -X POST http://localhost:5001/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "台北新豪宅專案",
    "category": "住宅",
    "location": "台北市大安區",
    "description": "位於大安區的頂級住宅專案",
    "status": "planning",
    "year": 2025,
    "features": ["近捷運", "學區房", "豪華裝潢"],
    "tags": ["豪宅", "交通便利", "學區"]
  }'
```

**必填欄位：**
- `title`: 專案標題
- `category`: 專案分類（住宅、商業、辦公室、公共建築、其他）
- `location`: 專案位置

#### 2.7 更新專案
```bash
curl -X PUT http://localhost:5001/api/projects/taipei-luxury-residence \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "台北頂級豪宅（已更新）",
    "status": "in_progress",
    "is_featured": true,
    "year": 2025
  }'
```

#### 2.8 更新專案狀態
```bash
curl -X PATCH http://localhost:5001/api/projects/taipei-luxury-residence/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

**可用狀態：**
- `planning`: 規劃中
- `in_progress`: 進行中  
- `completed`: 已完成
- `on_hold`: 暫停

#### 2.9 切換精選狀態
```bash
curl -X POST http://localhost:5001/api/projects/taipei-luxury-residence/feature \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 2.10 批量更新顯示順序
```bash
curl -X PUT http://localhost:5001/api/projects/reorder \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orders": [
      {"identifier": "project-1", "displayOrder": 1},
      {"identifier": "project-2", "displayOrder": 2},
      {"identifier": "project-3", "displayOrder": 3}
    ]
  }'
```

#### 2.11 刪除專案
```bash
# 軟刪除（預設）
curl -X DELETE http://localhost:5001/api/projects/taipei-luxury-residence \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 硬刪除（永久刪除）
curl -X DELETE "http://localhost:5001/api/projects/taipei-luxury-residence?hard=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. 標籤管理 API

#### 3.1 獲取標籤列表（公開）
```bash
# 基本查詢
curl -X GET http://localhost:5001/api/tags

# 按使用次數排序
curl -X GET "http://localhost:5001/api/tags?orderBy=usageCount&orderDir=DESC&limit=20"

# 按分類篩選
curl -X GET "http://localhost:5001/api/tags?category=style&limit=10"
```

**查詢參數：**
- `orderBy`: 排序欄位 (`usageCount`, `name`)
- `orderDir`: 排序方向 (`ASC`, `DESC`)
- `limit`: 限制筆數
- `category`: 標籤分類 (`style`, `feature`, `location`, `type`, `other`)

#### 3.2 獲取熱門標籤
```bash
curl -X GET "http://localhost:5001/api/tags/popular?limit=10"
```

#### 3.3 搜尋標籤
```bash
curl -X GET "http://localhost:5001/api/tags/search?q=豪宅"
```

#### 3.4 獲取單一標籤
```bash
curl -X GET http://localhost:5001/api/tags/luxury-residence
```

#### 3.5 創建新標籤（需要認證）
```bash
curl -X POST http://localhost:5001/api/tags \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "智慧建築",
    "description": "具備智慧化設備的建築"
  }'
```

#### 3.6 更新標籤（需要管理員權限）
```bash
curl -X PUT http://localhost:5001/api/tags/smart-building \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "智慧科技建築",
    "description": "整合最新智慧科技的現代建築"
  }'
```

#### 3.7 刪除標籤（需要管理員權限）
```bash
curl -X DELETE http://localhost:5001/api/tags/old-tag \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. 聯絡表單 API

#### 4.1 提交聯絡表單（公開）
```bash
curl -X POST http://localhost:5001/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "張三",
    "email": "zhang.san@example.com",
    "phone": "0912-345-678",
    "company": "某某建設公司",
    "subject": "專案詢問",
    "message": "我對貴公司的台北豪宅專案很有興趣，希望能進一步了解相關資訊。",
    "source": "官網"
  }'
```

**必填欄位：**
- `name`: 姓名
- `email`: 電子郵件
- `message`: 訊息內容（至少 10 字元）

#### 4.2 獲取聯絡訊息列表（需要認證）
```bash
# 基本查詢
curl -X GET http://localhost:5001/api/contacts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 篩選未讀訊息
curl -X GET "http://localhost:5001/api/contacts?isRead=false&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 按日期範圍篩選
curl -X GET "http://localhost:5001/api/contacts?dateFrom=2025-01-01&dateTo=2025-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 搜尋聯絡訊息
curl -X GET "http://localhost:5001/api/contacts?search=張三" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4.3 獲取單一聯絡訊息
```bash
curl -X GET http://localhost:5001/api/contacts/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4.4 標記為已讀
```bash
curl -X PUT http://localhost:5001/api/contacts/123/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4.5 批量標記為已讀
```bash
curl -X PUT http://localhost:5001/api/contacts/bulk-read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [123, 124, 125]
  }'
```

#### 4.6 回復聯絡訊息
```bash
curl -X PUT http://localhost:5001/api/contacts/123/reply \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "感謝您的詢問，我們的業務人員會盡快與您聯絡。",
    "notes": "已轉交給業務部門處理"
  }'
```

#### 4.7 刪除聯絡訊息（需要管理員權限）
```bash
curl -X DELETE http://localhost:5001/api/contacts/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4.8 批量刪除聯絡訊息
```bash
curl -X POST http://localhost:5001/api/contacts/bulk-delete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [123, 124, 125]
  }'
```

#### 4.9 獲取聯絡統計資料
```bash
curl -X GET "http://localhost:5001/api/contacts/statistics?days=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. 專案圖片管理 API

> 注意：圖片管理功能需要額外的上傳中介軟體和檔案處理服務

#### 5.1 獲取專案圖片
```bash
curl -X GET http://localhost:5001/api/projects/taipei-luxury-residence/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5.2 上傳專案圖片
```bash
curl -X POST http://localhost:5001/api/projects/taipei-luxury-residence/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@/path/to/exterior.jpg" \
  -F "files=@/path/to/interior.jpg" \
  -F "image_type=gallery" \
  -F "alt_text=專案外觀圖"
```

#### 5.3 設置主圖
```bash
curl -X POST http://localhost:5001/api/projects/taipei-luxury-residence/images/123/set-main \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5.4 更新圖片資訊
```bash
curl -X PUT http://localhost:5001/api/projects/taipei-luxury-residence/images/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alt_text": "建築外觀夜景",
    "caption": "專案主建築夜間燈光效果",
    "display_order": 1
  }'
```

#### 5.5 刪除圖片
```bash
curl -X DELETE http://localhost:5001/api/projects/taipei-luxury-residence/images/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5.6 批量刪除圖片
```bash
curl -X POST http://localhost:5001/api/projects/taipei-luxury-residence/images/bulk-delete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageIds": [123, 124, 125]
  }'
```

#### 5.7 重新排序圖片
```bash
curl -X PUT http://localhost:5001/api/projects/taipei-luxury-residence/images/reorder \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orders": [
      {"id": 123, "display_order": 0},
      {"id": 124, "display_order": 1},
      {"id": 125, "display_order": 2}
    ]
  }'
```

### 6. 系統管理 API

#### 6.1 健康檢查（公開）
```bash
# 基本健康檢查
curl -X GET http://localhost:5001/health

# 詳細健康檢查（包含資料庫狀態）
curl -X GET http://localhost:5001/api/system/health
```

**回應範例：**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-08-14T10:30:00.000Z",
    "environment": "development",
    "database": "connected",
    "uptime": 3600
  }
}
```

#### 6.2 系統資訊（需要管理員權限）
```bash
curl -X GET http://localhost:5001/api/system/info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**回應範例：**
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "nodeVersion": "v18.19.0",
    "uptime": 3600,
    "memory": {
      "rss": 52428800,
      "heapTotal": 41943040,
      "heapUsed": 28876544,
      "external": 1089024
    },
    "cpu": {
      "user": 1000000,
      "system": 500000
    }
  }
}
```

## 測試工具與技巧

### 使用 Postman 測試

#### 1. 環境變數設定
創建 Postman 環境，設置以下變數：
```json
{
  "base_url": "http://localhost:5001",
  "api_url": "http://localhost:5001/api",
  "token": "",
  "refresh_token": ""
}
```

#### 2. 認證設定
在請求的 Headers 中設置：
```
Content-Type: application/json
Authorization: Bearer {{token}}
```

#### 3. 自動化 Token 管理
在登入請求的 "Tests" 標籤中添加：
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.accessToken);
    pm.environment.set("refresh_token", response.data.refreshToken);
}
```

### 使用 HTTPie 測試

```bash
# 安裝 HTTPie
pip install httpie

# 登入並儲存 token
http POST :5000/api/auth/login username=admin password=Admin123!

# 使用 token 存取需要認證的端點
http GET :5000/api/auth/me "Authorization:Bearer YOUR_TOKEN"
```

### 使用 JavaScript/Node.js 測試

```javascript
const axios = require('axios');

// 設置基本配置
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 登入並獲取 token
async function login() {
  try {
    const response = await api.post('/auth/login', {
      username: 'admin',
      password: 'Admin123!'
    });
    
    const { accessToken } = response.data.data;
    api.defaults.headers.Authorization = `Bearer ${accessToken}`;
    
    return accessToken;
  } catch (error) {
    console.error('Login failed:', error.response.data);
  }
}

// 獲取專案列表
async function getProjects() {
  try {
    const response = await api.get('/projects?limit=5');
    console.log('Projects:', response.data);
  } catch (error) {
    console.error('Get projects failed:', error.response.data);
  }
}

// 執行測試
async function runTest() {
  await login();
  await getProjects();
}

runTest();
```

## API 回應格式

### 成功回應格式
```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 實際資料內容
  }
}
```

### 錯誤回應格式

#### 一般錯誤
```json
{
  "success": false,
  "message": "錯誤訊息",
  "error": {
    "code": "ERROR_CODE",
    "details": "詳細錯誤說明（僅開發環境）"
  }
}
```

#### 驗證錯誤
```json
{
  "success": false,
  "message": "驗證失敗",
  "error": {
    "code": "VALIDATION_ERROR"
  },
  "errors": [
    {
      "field": "email",
      "message": "電子郵件格式不正確"
    },
    {
      "field": "password",
      "message": "密碼長度至少 8 個字元"
    }
  ]
}
```

#### 分頁回應格式
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "pages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## 常見錯誤代碼與處理

### 認證相關錯誤
- `UNAUTHORIZED` (401): 未授權，需要提供有效的認證 token
- `INVALID_TOKEN` (401): 無效的 token，請重新登入
- `TOKEN_EXPIRED` (401): Token 已過期，請使用 refresh token 更新
- `INVALID_CREDENTIALS` (401): 用戶名或密碼錯誤
- `FORBIDDEN` (403): 權限不足，無法執行此操作

### 資料相關錯誤
- `VALIDATION_ERROR` (422): 資料驗證失敗
- `NOT_FOUND` (404): 指定的資源不存在
- `ALREADY_EXISTS` (409): 資源已存在（如重複的用戶名）
- `INVALID_OPERATION` (400): 無效的操作

### 系統相關錯誤
- `RATE_LIMIT_EXCEEDED` (429): 超過請求限制
- `INTERNAL_ERROR` (500): 內部服務器錯誤
- `DATABASE_ERROR` (500): 資料庫連接或查詢錯誤
- `FILE_UPLOAD_ERROR` (400): 檔案上傳失敗

### 錯誤處理建議

1. **401 錯誤處理流程：**
   ```javascript
   if (error.response.status === 401) {
     // 嘗試使用 refresh token
     const newToken = await refreshAccessToken();
     if (newToken) {
       // 重新發送原請求
       return retryRequest(originalRequest);
     } else {
       // 重定向到登入頁面
       redirectToLogin();
     }
   }
   ```

2. **422 驗證錯誤處理：**
   ```javascript
   if (error.response.status === 422) {
     const { errors } = error.response.data;
     errors.forEach(err => {
       displayFieldError(err.field, err.message);
     });
   }
   ```

## 重要注意事項

### 安全性
1. **認證令牌**：所有需要認證的端點都需要在 Header 中提供有效的 JWT token
2. **HTTPS**：生產環境必須使用 HTTPS 連接
3. **敏感資訊**：不要在前端儲存敏感資訊，如完整的用戶密碼
4. **CORS**：確保正確配置跨域資源共享設定

### 速率限制
- **一般 API 端點**：100 次請求 / 15 分鐘
- **認證端點**：5 次請求 / 15 分鐘  
- **聯絡表單**：10 次請求 / 小時
- **圖片上傳**：20 次請求 / 小時

### 檔案限制
- **單個檔案大小**：最大 256MB
- **支援格式**：JPEG, PNG, WebP
- **圖片處理**：系統會自動產生不同尺寸的縮圖

### 資料庫限制
- **專案標題**：最大 200 字元
- **用戶名**：3-50 字元，只能包含字母、數字、底線
- **電子郵件**：必須符合標準電子郵件格式
- **密碼**：至少 8 字元，必須包含大小寫字母和數字

### 環境差異
- **開發環境**：顯示詳細錯誤訊息和堆疊追蹤
- **生產環境**：只顯示一般錯誤訊息，保護內部實作細節
- **測試環境**：禁用某些安全中介軟體以方便測試

### 效能優化建議
1. **分頁查詢**：使用適當的分頁參數，避免一次載入過多資料
2. **快取**：善用 HTTP 快取標頭
3. **索引查詢**：使用專案識別碼而非數字 ID 進行查詢
4. **批量操作**：盡可能使用批量 API 減少請求次數

### 開發建議
1. **API 版本**：建議在請求標頭中指定 API 版本
2. **錯誤處理**：實作完整的錯誤處理邏輯
3. **日誌記錄**：記錄重要的 API 操作以便除錯
4. **監控**：設定適當的 API 監控和告警

---

## 更新日誌

### v2.0.0 (2025-08-14)
- 重新設計 API 架構
- 新增標籤管理功能
- 改進認證機制
- 優化錯誤處理
- 完善 Swagger 文檔

### v1.0.0 (2025-07-24)
- 初始版本發布
- 基本專案管理功能
- 用戶認證系統
- 聯絡表單功能