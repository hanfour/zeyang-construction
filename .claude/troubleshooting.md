# 問題排查指南

## 常見問題

### 1. 無法連接資料庫
```bash
# 檢查 MySQL 狀態
sudo systemctl status mysql

# 檢查連線設定
mysql -u root -p -e "SHOW DATABASES;"
```

# 解決方案
- 確認 .env 中的資料庫設定
- 檢查 MySQL 是否啟動
- 確認防火牆設定
### 2. 圖片上傳失敗
```bash
# 檢查目錄權限
ls -la uploads/

# 修正權限
sudo chown -R www-data:www-data uploads/
sudo chmod -R 755 uploads/

# 檢查磁碟空間
df -h
```
### 3. JWT Token 錯誤
```javascript
// 檢查 Token 格式
console.log(req.headers.authorization);
```
// 常見原因
- Token 過期
- Secret 不一致
- Header 格式錯誤
4. API 回應緩慢
```bash
# 檢查 PM2 狀態
pm2 status

# 查看錯誤日誌
pm2 logs --err

# 監控資源使用
htop
```
#### Debug 技巧

- 開啟詳細日誌
- 使用 Postman 測試 API
- 檢查瀏覽器 Console
- 查看網路請求