# API 測試運行指南

## 🔄 快速開始

### 1. 安裝依賴
```bash
cd backend
npm install
```

### 2. 設置測試環境

#### 選項 A: 使用真實 MySQL 資料庫
```bash
# 1. 確保 MySQL 服務正在運行
# 2. 創建測試資料庫
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ZeYang_test;"

# 3. 複製並配置測試環境變數
cp .env.test.example .env.test

# 4. 編輯 .env.test 設置資料庫連接
```

#### 選項 B: 使用 Mock 模式（無需資料庫）
測試已配置 Mock 模式，可在沒有資料庫的情況下運行。

### 3. 運行測試

```bash
# 運行所有測試
npm test

# 運行特定測試套件
npm run test:health   # 健康檢查測試
npm run test:auth     # 認證測試
npm run test:projects # 專案測試
npm run test:contacts # 聯絡測試
npm run test:tags     # 標籤測試

# 測試覆蓋率
npm run test:coverage
```

## 📁 測試檔案結構

```
tests/
├── api/                    # API 測試
│   ├── auth.test.js       # 認證 API
│   ├── projects.test.js   # 專案管理 API
│   ├── contacts.test.js   # 聯絡表單 API
│   ├── tags.test.js       # 標籤管理 API
│   ├── system.test.js     # 系統 API
│   └── health.test.js     # 健康檢查
├── helpers/               # 測試輔助工具
├── mocks/                 # Mock 模擬
└── fixtures/              # 測試資料
```

## 🔧 常見問題解決

### 1. 資料庫連接錯誤
```
Error: connect ECONNREFUSED ::1:3306
```

**解決方案**:
- 確認 MySQL 服務已啟動
- 檢查 .env.test 中的資料庫配置
- 或使用 Mock 模式運行測試

### 2. 端口衝突
```
Error: listen EADDRINUSE: address already in use :::5001
```

**解決方案**:
- 停止佔用 5001 端口的服務 (後端 API 預設端口)
- 或修改 .env.test 中的 PORT 設置

### 3. 測試超時
```
Timeout - Async callback was not invoked within the 30000ms timeout
```

**解決方案**:
- 增加 jest.config.js 中的 testTimeout
- 檢查是否有未關閉的非同步操作

## 🧑‍💻 開發建議

### 撰寫新測試

1. **基本結構**:
```javascript
describe('API Name', () => {
  beforeAll(async () => {
    // 設置
  });

  afterAll(async () => {
    // 清理
  });

  test('should do something', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('expected');
  });
});
```

2. **測試原則**:
   - 每個測試應獨立運作
   - 測試名稱要清楚描述測試內容
   - 涵蓋成功和失敗場景
   - 使用標準測試資料

## 📊 測試統計

### 已完成測試
- ✅ 114 個測試案例
- ✅ 50+ 個 API 端點覆蓋
- ✅ 包含成功、失敗、權限驗證

### 測試類型
- 單元測試
- 整合測試
- API 端點測試
- 錯誤處理測試
- 權限驗證測試

## 🔗 相關資源

- [Jest 文檔](https://jestjs.io/)
- [Supertest 文檔](https://github.com/visionmedia/supertest)
- [API 文檔](/swagger)
- [測試指南](./README.md)