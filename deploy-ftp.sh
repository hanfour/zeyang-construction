#!/bin/bash

# FTP 部署腳本
# 用於將建置好的前端檔案部署到 FTP 伺服器

echo "🚀 開始部署前端到 FTP 伺服器..."

# FTP 設定
# 嘗試使用主網域或 IP
FTP_HOST="zeyanggroup.com.tw"
FTP_USER="zeyanggroup0822@zeyanggroup.com.tw"
FTP_PASS="]GZev9iy8M9M"

# 建置目錄
BUILD_DIR="frontend/build"

# 檢查建置目錄是否存在
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ 錯誤：建置目錄不存在！"
    echo "   請先執行: cd frontend && npm run build"
    exit 1
fi

echo "📦 建置目錄檢查完成"

# 使用 lftp 進行 FTP 上傳
echo "📤 開始上傳檔案到 FTP..."

# 安裝 lftp (如果沒有安裝)
if ! command -v lftp &> /dev/null; then
    echo "📦 安裝 lftp..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install lftp
    else
        sudo apt-get install -y lftp
    fi
fi

# 清理遠端舊檔案並上傳新檔案
lftp -c "
set ftp:ssl-allow no
open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST
rm -rf *
mirror -R $BUILD_DIR / --verbose --parallel=4
mirror -R frontend/public/images /images --verbose --parallel=4
bye
"

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "🌐 網站應該可以在您的網域訪問了"
else
    echo "❌ 部署失敗，請檢查 FTP 憑證和網路連線"
    exit 1
fi

echo ""
echo "📝 部署資訊："
echo "   FTP 主機: $FTP_HOST"
echo "   使用者: $FTP_USER"
echo "   上傳目錄: /"
echo ""
echo "⚠️  重要提醒："
echo "   1. 確保後端 API 已正確設定並運行"
echo "   2. 檢查前端的 API 端點設定是否正確"
echo "   3. 如果使用 HTTPS，確保 SSL 憑證已設定"