# 🎯 最終 cPanel Node.js 設定指南

## ⚠️ 重要：請先完成以下步驟

### 步驟 1：解壓縮後端檔案
```bash
# 透過 SSH 或 cPanel 終端機執行
cd public_html/zeyanggroup
tar -xzf backend-deploy.tar.gz
cd backend
npm install --production
```

### 步驟 2：cPanel Node.js 應用程式設定

在 cPanel Node.js 設定頁面，請按照以下設定：

#### 基本設定
| 欄位 | 設定值 | 說明 |
|------|--------|------|
| **Node.js version** | 18.20.8 | 保持不變 |
| **Application mode** | Production | 選擇 Production |
| **Application root** | public_html/zeyanggroup | 保持不變 |
| **Application URL** | api | ⚠️ **只填 api（不是完整網址）** |
| **Application startup file** | backend/server.js | ⚠️ **必須是 backend/server.js** |

### 步驟 3：環境變數設定

點擊 "ADD VARIABLE" 按鈕，逐一新增以下環境變數：

#### 必要環境變數
| Name | Value | 說明 |
|------|-------|------|
| NODE_ENV | production | 生產環境 |
| PORT | 5001 | 應用程式連接埠 |
| **DB_HOST** | localhost | 資料庫主機 |
| **DB_PORT** | 3306 | 資料庫連接埠 |
| **DB_NAME** | 請填入實際資料庫名稱 | ⚠️ 需要廠商提供 |
| **DB_USER** | 請填入實際資料庫使用者 | ⚠️ 需要廠商提供 |
| **DB_PASSWORD** | 請填入實際資料庫密碼 | ⚠️ 需要廠商提供 |
| JWT_SECRET | zeyang-jwt-secret-2024-change-this | 認證密鑰 |
| JWT_EXPIRES_IN | 24h | Token 有效期 |
| REFRESH_SECRET | zeyang-refresh-secret-2024 | 更新 Token 密鑰 |
| REFRESH_EXPIRES_IN | 7d | 更新 Token 有效期 |
| CLIENT_URL | https://zeyanggroup.com.tw | 前端網址 |
| ALLOWED_ORIGINS | https://zeyanggroup.com.tw | CORS 允許來源 |
| UPLOAD_PATH | ./uploads | 檔案上傳路徑 |
| MAX_FILE_SIZE | 268435456 | 最大檔案大小 (256MB) |
| LOG_LEVEL | info | 日誌等級 |
| ENABLE_SWAGGER | false | 關閉 API 文件 |

### 步驟 4：建立資料庫

1. 在 cPanel 建立 MySQL 資料庫
2. 建立資料庫使用者並設定密碼
3. 將使用者加入資料庫並給予所有權限
4. 匯入 `backend/database/schema.sql`

### 步驟 5：儲存並重啟

1. 點擊右上角 **"SAVE"** 按鈕儲存設定
2. 點擊 **"Run NPM Install"** 安裝依賴
3. 點擊 **"RESTART"** 按鈕重啟應用程式

---

## ✅ 驗證檢查清單

完成設定後，請確認以下項目：

### 1. API 健康檢查
訪問：https://zeyanggroup.com.tw/api/health
- ✅ 應該返回 JSON 格式回應
- ❌ 不應該顯示 "It works! NodeJS 18.20.8"

### 2. 前端頁面
訪問：https://zeyanggroup.com.tw/admin
- ✅ 應該顯示 React 管理介面
- ❌ 不應該顯示 "It works! NodeJS 18.20.8"

### 3. 刷新測試
在任何前端頁面（如 /admin）按 F5 刷新
- ✅ 應該保持在同一頁面
- ❌ 不應該顯示 "It works! NodeJS 18.20.8"

---

## 🔧 故障排除

### 問題 1：仍顯示 "It works!"
**檢查**：
- Application URL 是否設為 `api`（不是空白或完整網址）
- Application startup file 是否為 `backend/server.js`

### 問題 2：API 無法連線
**檢查**：
- 資料庫環境變數是否正確設定
- backend 資料夾是否存在且有 server.js
- 是否執行了 npm install

### 問題 3：資料庫連線失敗
**檢查**：
- DB_NAME、DB_USER、DB_PASSWORD 是否正確
- 資料庫是否已建立
- schema.sql 是否已匯入

---

## 📌 重要提醒

### ⚠️ 關鍵設定
1. **Application URL 必須是 `api`**
   - 不是 `zeyanggroup.com.tw`
   - 不是 `/`
   - 不是留空
   - 就是 `api` 三個字

2. **Application startup file 必須是 `backend/server.js`**
   - 不是 `server.js`
   - 必須包含 `backend/` 路徑

3. **必須先解壓縮 backend-deploy.tar.gz**
   - 否則找不到 backend/server.js

---

## 📝 給廠商的簡化步驟

```
1. SSH 進入伺服器
2. cd public_html/zeyanggroup
3. tar -xzf backend-deploy.tar.gz
4. cd backend && npm install --production
5. 回到 cPanel Node.js 設定
6. Application URL 改為: api
7. Application startup file 改為: backend/server.js
8. 新增所有環境變數（特別是資料庫相關）
9. Save 儲存
10. Restart 重啟
```

完成後網站應該可以正常運作，刷新也不會出現 "It works!" 了。

---
**最後更新**: 2025-08-22
**版本**: Final