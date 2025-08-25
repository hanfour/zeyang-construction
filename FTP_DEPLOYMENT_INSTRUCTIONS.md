# FTP 部署指南 - ZeYang 澤暘建設網站

## 📋 FTP 連線資訊
- **主機**: ftp.cmi.mercedes-benz-select.com.tw
- **帳號**: zeyanggroup0822@zeyanggroup.com.tw
- **密碼**: ]GZev9iy8M9M
- **連接埠**: 21

## 🚀 快速部署步驟

### 方法一：使用自動部署腳本（推薦）

1. **建置前端**
```bash
cd frontend
npm install
npm run build
```

2. **執行部署腳本**
```bash
cd ..
./deploy-ftp.sh
```

### 方法二：手動 FTP 上傳

#### 使用 FTP 客戶端軟體（如 FileZilla、Cyberduck）

1. **安裝 FTP 客戶端**
   - macOS: [Cyberduck](https://cyberduck.io/) 或 [FileZilla](https://filezilla-project.org/)
   - Windows: [FileZilla](https://filezilla-project.org/) 或 [WinSCP](https://winscp.net/)

2. **連線設定**
   - 協議：FTP
   - 主機：ftp.cmi.mercedes-benz-select.com.tw
   - 使用者名稱：zeyanggroup0822@zeyanggroup.com.tw
   - 密碼：]GZev9iy8M9M
   - 連接埠：21

3. **上傳檔案**
   - 本地目錄：`frontend/build/*` 的所有內容
   - 遠端目錄：`/` (網站根目錄)
   - 上傳模式：二進位（Binary）

#### 使用命令列 (lftp)

```bash
# 安裝 lftp
brew install lftp  # macOS
# 或
sudo apt-get install lftp  # Linux

# 上傳檔案
lftp -c "
set ftp:ssl-allow no
open ftp://zeyanggroup0822@zeyanggroup.com.tw:]GZev9iy8M9M@ftp.cmi.mercedes-benz-select.com.tw
mirror -R frontend/build / --verbose
bye
"
```

## 📁 需要上傳的檔案結構

從 `frontend/build/` 上傳到 FTP 根目錄：
```
/
├── index.html
├── assets/
│   ├── index-*.js
│   ├── index-*.css
│   └── 其他資源檔案
└── (其他建置檔案)
```

同時需要從 `frontend/public/` 複製：
```
/
├── images/
│   ├── about/
│   ├── contact/
│   ├── development/
│   ├── icons/
│   ├── index/
│   ├── project/
│   └── team/
├── robots.txt
└── sitemap.xml
```

## ⚠️ 重要注意事項

### 1. 前端建置
- 必須先執行 `npm run build` 產生靜態檔案
- 建置檔案在 `frontend/build` 目錄
- 確保所有依賴套件已安裝（`npm install`）

### 2. API 端點設定
前端需要正確的 API 端點設定。檢查 `frontend/.env` 檔案：
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### 3. 後端服務
- 後端 API 需要另外部署（不是透過 FTP）
- 確保後端服務已啟動並可訪問
- 設定正確的 CORS 允許前端網域

### 4. 圖片和靜態資源
確保上傳 `public/images` 目錄的所有圖片

## 🔍 部署驗證

1. **訪問網站**
   - 開啟瀏覽器訪問您的網域
   - 應該看到 React 應用程式，而非 index.html 原始碼

2. **檢查控制台**
   - 開啟瀏覽器開發者工具（F12）
   - 檢查 Console 是否有錯誤
   - 檢查 Network 標籤，確認資源載入正常

3. **測試功能**
   - 瀏覽不同頁面
   - 測試表單提交
   - 確認圖片顯示正常

## 🛠️ 故障排除

### 問題 1：看到空白頁面
**解決方案**：
- 檢查 `index.html` 是否在根目錄
- 確認 `assets` 資料夾已上傳
- 檢查瀏覽器控制台錯誤訊息

### 問題 2：404 錯誤
**解決方案**：
- 確認所有檔案已上傳到正確位置
- 檢查檔案路徑大小寫（Linux 伺服器區分大小寫）

### 問題 3：API 請求失敗
**解決方案**：
- 確認後端服務已啟動
- 檢查 API URL 設定是否正確
- 確認 CORS 設定允許前端網域

### 問題 4：圖片無法顯示
**解決方案**：
- 確認 `images` 資料夾已上傳
- 檢查圖片路徑是否正確
- 確認圖片檔案名稱大小寫正確

## 📝 更新網站內容

當需要更新網站時：
1. 修改前端程式碼
2. 重新建置：`cd frontend && npm run build`
3. 使用 FTP 上傳新的建置檔案
4. 清除瀏覽器快取後測試

## 🔐 安全建議

1. **定期更改 FTP 密碼**
2. **使用 SFTP/FTPS**（如果伺服器支援）
3. **限制 FTP 訪問 IP**（如果可能）
4. **定期備份網站檔案**

---
**最後更新**: 2025-08-22
**版本**: 1.0.0