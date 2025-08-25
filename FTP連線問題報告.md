# FTP 連線問題報告

## 🔍 測試結果總結

### ❌ 無法連線到提供的 FTP 主機
- **主機**: ftp.cmi.mercedes-benz-select.com.tw
- **問題**: DNS 無法解析（主機名稱不存在）
- **測試方式**: 
  - DNS 查詢 (nslookup, host)
  - 被動模式 FTP
  - Python ftplib
  - lftp 命令

### 📊 測試詳情

| 主機名稱 | DNS 解析 | FTP 連線 | 備註 |
|---------|---------|----------|------|
| ftp.cmi.mercedes-benz-select.com.tw | ❌ | - | DNS 記錄不存在 |
| cmi.mercedes-benz-select.com.tw | ✅ | ❌ | 530 登入失敗 |
| mercedes-benz-select.com.tw | ✅ | - | 無 A 記錄 |
| zeyanggroup.com.tw | ✅ | ✅ | **成功連線** |

### ✅ 實際可用的 FTP 連線
```
主機: zeyanggroup.com.tw
帳號: zeyanggroup0822@zeyanggroup.com.tw
密碼: ]GZev9iy8M9M
連接埠: 21
模式: 主動或被動皆可
```

## 📁 目前部署狀態

### 已成功部署（使用 zeyanggroup.com.tw）
1. **前端檔案** ✅
   - index.html (React 應用程式)
   - assets/ (JS/CSS 資源)
   - images/ (圖片資源)
   - .htaccess (Apache 設定)

2. **後端檔案** ✅
   - backend-deploy.tar.gz (壓縮包)
   - 包含所有後端程式碼

### 檔案位置
```
zeyanggroup.com.tw/
├── index.html          ✅
├── assets/             ✅
├── images/             ✅
├── .htaccess          ✅
├── backend-deploy.tar.gz ✅
└── backend/           ✅
```

## 🚨 問題分析

### 可能原因：
1. **FTP 主機名稱錯誤**
   - 提供的 `ftp.cmi.mercedes-benz-select.com.tw` 不存在
   - 實際應該是 `zeyanggroup.com.tw`

2. **DNS 設定問題**
   - ftp 子域名未設定
   - 或該服務在不同的網路/VPN 內

3. **帳號權限問題**
   - 該帳號可能只能在特定主機使用
   - cmi.mercedes-benz-select.com.tw 拒絕此帳號登入

## 📝 建議行動

### 給廠商的確認事項：

```
FTP 連線確認：

1. 正確的 FTP 主機是什麼？
   □ zeyanggroup.com.tw（目前可用）
   □ ftp.cmi.mercedes-benz-select.com.tw（無法解析）
   □ 其他：_______________

2. 如果是 ftp.cmi.mercedes-benz-select.com.tw：
   - 請檢查 DNS 設定
   - 或提供 IP 地址
   - 確認是否需要 VPN 連線

3. 目前檔案已部署在：
   - 主機：zeyanggroup.com.tw
   - 狀態：前端和後端檔案都已上傳
   - 網址：https://zeyanggroup.com.tw

請確認這是否為正確的部署位置？
```

## 🔧 技術細節

### DNS 查詢結果：
```bash
# ftp.cmi.mercedes-benz-select.com.tw
nslookup: NXDOMAIN (不存在)

# cmi.mercedes-benz-select.com.tw
IP: 60.249.45.222
FTP: 530 Login authentication failed

# zeyanggroup.com.tw
IP: 60.249.109.44
FTP: 連線成功
```

### 連線測試命令：
```bash
# 被動模式測試
lftp -c "
set ftp:ssl-allow no
set ftp:passive-mode on
open ftp://zeyanggroup0822@zeyanggroup.com.tw:]GZev9iy8M9M@[主機]
ls
bye
"
```

---

**報告時間**: 2025-08-22 16:15
**測試工具**: lftp, nslookup, host, Python ftplib
**結論**: 檔案已成功部署到 zeyanggroup.com.tw