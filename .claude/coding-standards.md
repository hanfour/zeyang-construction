# 程式碼規範

## 命名規則
- 檔案名: kebab-case (project-service.js)
- 變數名: camelCase (projectTitle)
- 常數名: UPPER_SNAKE_CASE (MAX_FILE_SIZE)
- 類別名: PascalCase (ProjectController)

## 檔案結構
```javascript
// 1. 引入模組
const express = require('express');

// 2. 常數定義
const MAX_UPLOAD_SIZE = 10485760;

// 3. 主要邏輯
async function createProject(data) {
  // 驗證
  if (!data.title) throw new Error('標題必填');
  
  // 處理
  const project = await db.create(data);
  
  // 返回
  return project;
}
// 4. 匯出
module.exports = { createProject };
```

## 註解規範
```javascript
/**
 * 創建新專案
 * @param {Object} data - 專案資料
 * @param {string} data.title - 專案標題
 * @returns {Promise<Object>} 創建的專案
 */
```
## Git Commit 格式

- feat: 新功能
- fix: 修復
- docs: 文件
- refactor: 重構
- test: 測試