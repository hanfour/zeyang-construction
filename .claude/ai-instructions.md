## 如何與 Claude 協作

### 1. 提供上下文
開始對話時說明：
- "請參考 .claude 目錄的文件"
- "基於 ZeYang 專案架構"
- "遵循 coding-standards.md"

### 2. 具體的請求格式
任務：實作專案列表 API
參考：api-spec.md 的專案端點
要求：

支援分頁
可按類別篩選
包含錯誤處理


### 3. 程式碼生成提示
- "生成符合專案規範的程式碼"
- "使用專案既有的工具函數"
- "遵循錯誤處理模式"

### 4. Debug 協助
提供：
- 錯誤訊息
- 相關程式碼片段
- 預期行為
- 已嘗試的解決方案

## 最佳實踐
1. 一次專注一個功能
2. 提供清楚的需求描述
3. 要求包含測試案例
4. 請求程式碼審查

## 範例對話
"基於 database-schema.md，幫我實作專案搜尋功能，需要支援標題和地點的模糊搜尋，請包含分頁功能。"

## 🎯 使用方式

1. **創建 .claude 目錄**
```bash
mkdir .claude
```

複製所有文件到目錄
將上述 10 個文件放入 .claude 目錄
加入版本控制

```bash
git add .claude/
git commit -m "feat: add Claude collaboration docs"
```