#!/bin/bash

# BuildSight 測試運行腳本

echo "🚀 BuildSight 測試運行器"
echo ""

# 檢查 MySQL 是否運行
if ! mysqladmin ping -h 127.0.0.1 --silent 2>/dev/null; then
    echo "⚠️  MySQL 似乎未運行，嘗試啟動..."
    mysql.server start
    sleep 2
fi

# 詢問密碼
echo -n "請輸入 MySQL root 密碼: "
read -s password
echo ""

# 設置環境變數並運行測試
export DB_HOST=127.0.0.1
export DB_USER=root
export DB_PASSWORD=$password
export DB_NAME=estatehub_test
export NODE_ENV=test

# 創建資料庫（如果不存在）
echo "🔧 準備測試資料庫..."
mysql -h 127.0.0.1 -u root -p$password -e "CREATE DATABASE IF NOT EXISTS estatehub_test;" 2>/dev/null

# 導入 schema
if [ -f "database/schema.sql" ]; then
    mysql -h 127.0.0.1 -u root -p$password estatehub_test < database/schema.sql 2>/dev/null
    echo "✅ Schema 導入完成"
fi

# 運行測試
echo ""
echo "🧪 運行測試..."
echo ""
npm test

# 顯示結果
echo ""
echo "✨ 測試完成！"