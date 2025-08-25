#!/bin/bash

# FTP 部署腳本 - 前端更新
echo "========================================="
echo "開始部署前端至 FTP 伺服器..."
echo "========================================="

# FTP 設定
FTP_HOST="60.249.109.44"
FTP_USER="zeyanggroup0822@zeyanggroup.com.tw"
FTP_PASS="]GZev9iy8M9M"
FTP_DIR="/public_html/zeyanggroup"

# 本地目錄
LOCAL_DIR="/Users/hanfourhuang/Projects/BuildSight/frontend/build"

# 使用 lftp 上傳
echo "連線至 FTP 伺服器..."
lftp -c "
set ssl:verify-certificate no
set ftp:ssl-allow no
open ftp://$FTP_USER:$FTP_PASS@$FTP_HOST
cd $FTP_DIR
lcd $LOCAL_DIR
echo '清除舊檔案...'
rm -rf assets
rm -f index.html
echo '上傳新檔案...'
mirror -R --verbose --no-perms --no-umask --parallel=4
echo '部署完成！'
bye
"

echo "========================================="
echo "前端部署完成！"
echo "請訪問 https://zeyanggroup.com.tw 檢查更新"
echo "========================================="