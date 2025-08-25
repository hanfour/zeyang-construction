# FTP 上傳步驟圖解說明

## 使用 FileZilla 上傳網站檔案

### 📥 步驟 1：下載並安裝 FileZilla
- 下載網址：https://filezilla-project.org/
- 選擇您的作業系統版本（Windows/Mac）
- 安裝完成後開啟 FileZilla

### 🔌 步驟 2：連線到 FTP 伺服器

在 FileZilla 上方輸入連線資訊：

```
┌─────────────────────────────────────────────────┐
│ 主機(H): zeyanggroup.com.tw                    │
│ 使用者名稱(U): zeyanggroup0822@zeyanggroup... │
│ 密碼(W): ••••••••••                            │
│ 連接埠(P): 21                                   │
│                                                 │
│ [快速連線]                                      │
└─────────────────────────────────────────────────┘
```

### 📁 步驟 3：理解 FileZilla 介面

```
┌────────────────┬────────────────┐
│   本地站台     │   遠端站台     │
│  (您的電腦)    │  (FTP伺服器)   │
├────────────────┼────────────────┤
│                │                │
│ 📁 frontend/   │ 📁 /           │
│   📁 build/    │   📄 index.html│
│     📄 index...│   📁 css/      │
│     📁 assets/ │   📁 js/       │
│     📁 ...     │   📁 ...       │
│                │                │
└────────────────┴────────────────┘
     ↑                  ↑
   您的檔案         網站伺服器
```

### 🗑️ 步驟 4：清理舊檔案

在右側（遠端站台）執行：

1. **選擇要刪除的舊檔案**：
   - `index.html`（如果是舊版）
   - `css/` 資料夾
   - `js/` 資料夾
   
2. **右鍵 → 刪除**

⚠️ **注意**：不要刪除 `.htaccess` 和 `.ftpquota`

### 📤 步驟 5：上傳新檔案

#### A. 上傳主要檔案：

1. 在左側找到 `frontend/build/` 資料夾
2. 開啟 `build` 資料夾
3. 選擇所有檔案（Ctrl+A 或 Cmd+A）
4. 拖曳到右側根目錄

```
左側                          右側
frontend/build/       →       /
  ├─ index.html      →       ├─ index.html
  ├─ assets/         →       ├─ assets/
  ├─ robots.txt      →       ├─ robots.txt
  └─ sitemap.xml     →       └─ sitemap.xml
```

#### B. 上傳圖片資料夾：

1. 在左側找到 `frontend/public/images/` 資料夾
2. 將整個 `images` 資料夾拖曳到右側

```
左側                          右側
frontend/public/      →       /
  └─ images/         →       └─ images/
      ├─ about/      →           ├─ about/
      ├─ project/    →           ├─ project/
      └─ ...         →           └─ ...
```

### ✅ 步驟 6：確認上傳結果

上傳完成後，右側應該顯示：

```
遠端站台: /
├─ 📄 .htaccess        (保留的)
├─ 📄 index.html       (新上傳)
├─ 📁 assets/          (新上傳)
│   ├─ index-xxx.js
│   └─ index-xxx.css
├─ 📁 images/          (新上傳)
│   ├─ about/
│   ├─ project/
│   └─ ...
├─ 📄 robots.txt       (新上傳)
└─ 📄 sitemap.xml      (新上傳)
```

### 📝 步驟 7：建立/更新 .htaccess

如果沒有 `.htaccess` 檔案：

1. 在右側空白處右鍵
2. 選擇「建立新檔案」
3. 命名為 `.htaccess`
4. 右鍵編輯，貼入提供的內容

### 🔄 步驟 8：重新整理測試

1. 開啟瀏覽器
2. 訪問您的網站
3. 強制重新整理：
   - Windows: `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

---

## ⚠️ 常見錯誤與解決

### 錯誤 1：傳輸失敗
```
錯誤: 無法傳輸檔案
```
**解決**：檢查網路連線，重新連線 FTP

### 錯誤 2：權限不足
```
錯誤: 550 Permission denied
```
**解決**：確認 FTP 帳號有寫入權限

### 錯誤 3：空間不足
```
錯誤: 552 Disk full
```
**解決**：清理不需要的檔案或聯繫主機商

---

## 💡 小提示

1. **批次上傳**：可以一次選擇多個檔案拖曳
2. **查看進度**：FileZilla 下方會顯示傳輸進度
3. **斷線續傳**：如果中斷，FileZilla 會自動續傳
4. **保存連線**：可以儲存站台資訊方便下次使用

---

## 📌 重要提醒

- 上傳 `build` 資料夾的**內容**，不是資料夾本身
- 保留 `.htaccess` 檔案
- 確保所有 `assets` 檔案都上傳完成
- 上傳後記得清除瀏覽器快取