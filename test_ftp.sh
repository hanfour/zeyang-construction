#!/bin/bash

echo "FTP 連線測試報告"
echo "=================="
echo ""

# FTP 憑證
FTP_USER="zeyanggroup0822@zeyanggroup.com.tw"
FTP_PASS="]GZev9iy8M9M"
FTP_PORT="21"

# 測試主機列表
declare -a hosts=(
    "ftp.cmi.mercedes-benz-select.com.tw"
    "cmi.mercedes-benz-select.com.tw"
    "mercedes-benz-select.com.tw"
    "ftp.mercedes-benz-select.com.tw"
    "ftp.zeyanggroup.com.tw"
    "zeyanggroup.com.tw"
)

echo "測試 DNS 解析："
echo "----------------"
for host in "${hosts[@]}"; do
    echo -n "檢查 $host ... "
    if host "$host" &>/dev/null; then
        echo "✓ 可解析"
        # 嘗試 FTP 連線
        echo "  嘗試 FTP 連線 (被動模式)..."
        timeout 5 lftp -c "
        set ftp:ssl-allow no
        set ftp:passive-mode on
        set net:timeout 5
        set net:max-retries 1
        open ftp://$FTP_USER:$FTP_PASS@$host:$FTP_PORT
        pwd
        bye
        " 2>&1 | head -3
        echo ""
    else
        echo "✗ 無法解析"
    fi
done

echo ""
echo "結論："
echo "------"
echo "1. ftp.cmi.mercedes-benz-select.com.tw 無法解析（DNS 記錄不存在）"
echo "2. 可能的正確主機："
echo "   - zeyanggroup.com.tw (已確認可連線)"
echo "   - 請向廠商確認正確的 FTP 主機地址"
