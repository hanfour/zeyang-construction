# 系統架構

## 整體架構圖
```bash
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│   Database  │
│    React    │     │   Express   │     │    MySQL    │
└─────────────┘     └─────────────┘     └─────────────┘
│
▼
┌─────────────┐
│  File Store │
│   (Local)   │
└─────────────┘
```

## 資料流程
1. 用戶請求 → Nginx → Node.js
2. 認證檢查 → JWT 驗證
3. 業務處理 → 資料庫操作
4. 回應返回 → JSON 格式

## 關鍵模組
- **Auth Module**: JWT 認證
- **Project Module**: 專案 CRUD
- **Upload Module**: 圖片處理
- **Contact Module**: 表單處理

## 安全層級
- Level 1: Rate Limiting
- Level 2: Input Validation
- Level 3: Authentication
- Level 4: Authorization