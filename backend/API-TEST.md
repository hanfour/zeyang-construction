# EstateHub API 測試指南

## 環境設置

1. 安裝依賴：
```bash
cd backend
npm install
```

2. 設置環境變數：
```bash
cp .env.example .env
# 編輯 .env 設置資料庫連接
```

3. 初始化資料庫：
```bash
mysql -u root -p < ../database/init.sql
# 載入範例資料（可選）
mysql -u root -p < ../database/seeds/sample-data.sql
```

4. 啟動服務：
```bash
npm run dev
```

## API 端點測試

### 1. 認證相關

#### 登入（獲取 JWT Token）
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

#### 獲取當前用戶資訊
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. 專案管理

#### 獲取專案列表（公開）
```bash
# 基本查詢
curl -X GET http://localhost:5000/api/projects

# 帶篩選條件
curl -X GET "http://localhost:5000/api/projects?category=住宅&status=on_sale&page=1&limit=10"

# 搜尋
curl -X GET "http://localhost:5000/api/projects/search?q=豪華&limit=5"
```

#### 獲取精選專案
```bash
curl -X GET http://localhost:5000/api/projects/featured?limit=3
```

#### 獲取單一專案
```bash
# 使用 slug
curl -X GET http://localhost:5000/api/projects/taipei-luxury-residence

# 使用 UUID
curl -X GET http://localhost:5000/api/projects/YOUR_PROJECT_UUID
```

#### 創建新專案（需要認證）
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新專案名稱",
    "category": "住宅",
    "location": "台北市大安區",
    "description": "專案描述",
    "status": "planning",
    "year": 2025,
    "area": "30-50坪",
    "price_range": "2000萬-4000萬",
    "features": {
      "房型": ["2房", "3房"],
      "特色": ["近捷運", "學區房"]
    },
    "tags": ["豪華", "交通便利"]
  }'
```

#### 更新專案
```bash
curl -X PUT http://localhost:5000/api/projects/PROJECT_IDENTIFIER \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "更新的標題",
    "status": "pre_sale",
    "is_featured": true
  }'
```

#### 更新專案狀態
```bash
curl -X PATCH http://localhost:5000/api/projects/PROJECT_IDENTIFIER/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "on_sale"
  }'
```

#### 切換精選狀態
```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_IDENTIFIER/feature \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 刪除專案
```bash
# 軟刪除
curl -X DELETE http://localhost:5000/api/projects/PROJECT_IDENTIFIER \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 硬刪除（永久刪除）
curl -X DELETE "http://localhost:5000/api/projects/PROJECT_IDENTIFIER?hard=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. 專案圖片管理

#### 獲取專案圖片
```bash
curl -X GET http://localhost:5000/api/projects/PROJECT_IDENTIFIER/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 上傳圖片
```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_IDENTIFIER/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@/path/to/image1.jpg" \
  -F "files=@/path/to/image2.jpg" \
  -F "image_type=gallery" \
  -F "alt_text=專案圖片"
```

#### 設置主圖
```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_IDENTIFIER/images/IMAGE_ID/set-main \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 更新圖片資訊
```bash
curl -X PUT http://localhost:5000/api/projects/PROJECT_IDENTIFIER/images/IMAGE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alt_text": "更新的替代文字",
    "display_order": 1
  }'
```

#### 刪除圖片
```bash
curl -X DELETE http://localhost:5000/api/projects/PROJECT_IDENTIFIER/images/IMAGE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 批量刪除圖片
```bash
curl -X POST http://localhost:5000/api/projects/PROJECT_IDENTIFIER/images/bulk-delete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageIds": [1, 2, 3]
  }'
```

#### 重新排序圖片
```bash
curl -X PUT http://localhost:5000/api/projects/PROJECT_IDENTIFIER/images/reorder \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orders": [
      {"id": 1, "display_order": 0},
      {"id": 2, "display_order": 1},
      {"id": 3, "display_order": 2}
    ]
  }'
```

### 4. 系統相關

#### 健康檢查
```bash
curl -X GET http://localhost:5000/health
curl -X GET http://localhost:5000/api/system/health
```

#### 系統資訊（需要管理員權限）
```bash
curl -X GET http://localhost:5000/api/system/info \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 使用 Postman 測試

1. 導入環境變數：
   - `base_url`: `http://localhost:5000`
   - `token`: 登入後獲得的 JWT token

2. 在請求的 Headers 中設置：
   - `Content-Type`: `application/json`
   - `Authorization`: `Bearer {{token}}`

3. 使用 Postman 的環境變數功能自動管理 token

## 錯誤回應格式

所有錯誤回應都遵循統一格式：

```json
{
  "success": false,
  "message": "錯誤訊息",
  "error": {
    "code": "ERROR_CODE",
    "details": "詳細錯誤說明（僅開發環境）"
  },
  "errors": [
    {
      "field": "fieldName",
      "message": "欄位錯誤訊息"
    }
  ]
}
```

## 常見錯誤代碼

- `UNAUTHORIZED`: 未授權
- `INVALID_TOKEN`: 無效的 token
- `TOKEN_EXPIRED`: Token 已過期
- `VALIDATION_ERROR`: 驗證錯誤
- `NOT_FOUND`: 資源未找到
- `RATE_LIMIT_EXCEEDED`: 超過請求限制

## 注意事項

1. 所有需要認證的端點都需要在 Header 中提供有效的 JWT token
2. 檔案上傳大小限制為 25MB
3. API 有速率限制：一般端點 100次/15分鐘，登入端點 5次/15分鐘
4. 開發環境會顯示詳細錯誤訊息，生產環境只顯示一般錯誤訊息