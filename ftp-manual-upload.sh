#!/bin/bash

# FTP 手動上傳腳本 - 使用被動模式
# 可嘗試不同的 FTP 主機配置

echo "========================================="
echo "FTP 連線測試腳本"
echo "========================================="

# FTP 憑證
FTP_USER="zeyanggroup0822@zeyanggroup.com.tw"
FTP_PASS="]GZev9iy8M9M"

# 測試不同的主機配置
echo ""
echo "測試配置 1: zeyanggroup.com.tw (已確認可用)"
echo "-----------------------------------------"
lftp -c "
set ftp:ssl-allow no
set ftp:passive-mode on
open ftp://$FTP_USER:$FTP_PASS@zeyanggroup.com.tw
pwd
ls -la | head -5
bye
"

echo ""
echo "測試配置 2: cmi.mercedes-benz-select.com.tw (被動模式)"
echo "-----------------------------------------"
lftp -c "
set ftp:ssl-allow no
set ftp:passive-mode on
set ftp:use-feat no
set ftp:ssl-protect-data no
open ftp://$FTP_USER:$FTP_PASS@cmi.mercedes-benz-select.com.tw
pwd
ls -la | head -5
bye
" 2>&1

echo ""
echo "測試配置 3: 60.249.45.222 (直接 IP)"
echo "-----------------------------------------"
lftp -c "
set ftp:ssl-allow no
set ftp:passive-mode on
open ftp://$FTP_USER:$FTP_PASS@60.249.45.222
pwd
ls -la | head -5
bye
" 2>&1

echo ""
echo "========================================="
echo "建議："
echo "1. 使用 zeyanggroup.com.tw 作為 FTP 主機"
echo "2. 或聯繫廠商確認正確的 FTP 主機地址"
echo "========================================="