# API 測試指南

## 測試環境設置

### 1. 安裝依賴
```bash
npm install
```

### 2. 設置測試資料庫

#### 選項 A: 使用真實的 MySQL 資料庫
1. 確保 MySQL 服務正在運行
2. 複製 `.env.test.example` 到 `.env.test` 並配置資料庫連接
3. 運行資料庫設置腳本：
   ```bash
   node tests/setup-test-db.js
   ```

#### 選項 B: 使用模擬資料庫（無需 MySQL）
測試已配置為在無法連接資料庫時使用模擬資料庫。

## 運行測試

### 運行所有測試
```bash
npm test
```

### 運行特定測試套件
```bash
# 認證 API 測試
npm run test:auth

# 專案 API 測試
npm run test:projects

# 聯絡表單 API 測試
npm run test:contacts

# 標籤 API 測試
npm run test:tags

# 系統 API 測試
npm run test:system
```

### 監聽模式（開發時使用）
```bash
npm run test:watch
```

### 測試覆蓋率報告
```bash
npm run test:coverage
```

## 測試結構

```
tests/
├── api/                    # API 測試
│   ├── auth.test.js       # 認證相關測試
│   ├── projects.test.js   # 專案管理測試
│   ├── contacts.test.js   # 聯絡表單測試
│   ├── tags.test.js       # 標籤管理測試
│   └── system.test.js     # 系統相關測試
├── helpers/               # 測試輔助工具
│   ├── auth.helper.js     # 認證輔助函數
│   ├── db.helper.js       # 資料庫輔助函數
│   ├── test-data.js       # 測試資料
│   └── test-server.js     # 測試伺服器配置
├── fixtures/              # 測試檔案（如圖片）
├── jest.config.js         # Jest 配置
└── setup.js               # 測試環境設置
```

## 測試覆蓋的 API

### 認證 API (/api/auth)
- ✅ POST /api/auth/register - 用戶註冊
- ✅ POST /api/auth/login - 用戶登入
- ✅ POST /api/auth/refresh - 刷新 token
- ✅ GET /api/auth/me - 獲取當前用戶
- ✅ PUT /api/auth/change-password - 修改密碼
- ✅ POST /api/auth/logout - 登出

### 專案 API (/api/projects)
- ✅ GET /api/projects - 獲取專案列表
- ✅ GET /api/projects/featured - 獲取精選專案
- ✅ GET /api/projects/search - 搜尋專案
- ✅ GET /api/projects/:identifier - 獲取單一專案
- ✅ POST /api/projects - 創建專案
- ✅ PUT /api/projects/:identifier - 更新專案
- ✅ PATCH /api/projects/:identifier/status - 更新狀態
- ✅ POST /api/projects/:identifier/feature - 切換精選
- ✅ DELETE /api/projects/:identifier - 刪除專案
- ✅ POST /api/projects/:identifier/images - 上傳圖片
- ✅ GET /api/projects/:identifier/images - 獲取圖片

### 聯絡表單 API (/api/contacts)
- ✅ POST /api/contacts - 提交聯絡表單
- ✅ GET /api/contacts - 獲取聯絡列表
- ✅ GET /api/contacts/statistics - 獲取統計
- ✅ GET /api/contacts/:id - 獲取單一聯絡
- ✅ PUT /api/contacts/:id/read - 標記已讀
- ✅ PUT /api/contacts/bulk-read - 批量標記已讀
- ✅ PUT /api/contacts/:id/reply - 回覆聯絡
- ✅ DELETE /api/contacts/:id - 刪除聯絡
- ✅ POST /api/contacts/bulk-delete - 批量刪除

### 標籤 API (/api/tags)
- ✅ GET /api/tags - 獲取所有標籤
- ✅ GET /api/tags/popular - 獲取熱門標籤
- ✅ GET /api/tags/search - 搜尋標籤
- ✅ GET /api/tags/:identifier - 獲取單一標籤
- ✅ POST /api/tags - 創建標籤
- ✅ PUT /api/tags/:identifier - 更新標籤
- ✅ DELETE /api/tags/:identifier - 刪除標籤
- ✅ POST /api/tags/merge - 合併標籤
- ✅ POST /api/tags/update-counts - 更新計數

### 系統 API
- ✅ GET /health - 健康檢查
- ✅ GET /api/system/health - 詳細健康狀態
- ✅ GET /api/system/info - 系統資訊
- ✅ CORS 處理
- ✅ 錯誤處理
- ✅ 404 處理

## 撰寫新測試

### 基本測試結構
```javascript
describe('API Name', () => {
  let authToken;

  beforeAll(async () => {
    // 設置測試環境
    await clearDatabase();
    await seedTestUsers();
    authToken = generateTestToken({ role: 'admin' });
  });

  afterAll(async () => {
    // 清理測試資料
    await clearDatabase();
  });

  describe('GET /api/endpoint', () => {
    it('should return expected data', async () => {
      const response = await request(app)
        .get('/api/endpoint')
        .set(authHeader(authToken))
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
});
```

## 注意事項

1. **資料隔離**: 每個測試套件應該清理自己的測試資料
2. **認證測試**: 使用 `generateTestToken` 生成測試用 token
3. **並行測試**: 測試設計為可並行運行，避免相互干擾
4. **錯誤場景**: 確保測試涵蓋成功和失敗的場景
5. **測試資料**: 使用 `test-data.js` 中的標準測試資料

## 疑難排解

### 端口衝突
如果遇到端口衝突錯誤，確保：
1. 沒有其他服務使用 5001 端口 (後端 API 端口)
2. 測試環境變數正確設置為 `NODE_ENV=test`

### 資料庫連接錯誤
如果無法連接資料庫：
1. 檢查 MySQL 服務是否運行
2. 確認 `.env.test` 中的資料庫配置正確
3. 或使用模擬資料庫運行測試

### 測試超時
如果測試超時，可以：
1. 增加 Jest 配置中的 `testTimeout`
2. 檢查是否有未關閉的連接或計時器