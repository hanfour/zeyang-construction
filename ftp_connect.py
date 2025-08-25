import ftplib
import sys

# FTP 設定
host = "ftp.cmi.mercedes-benz-select.com.tw"
port = 21
user = "zeyanggroup0822@zeyanggroup.com.tw"
password = "]GZev9iy8M9M"

print(f"嘗試連線到 {host}:{port}")
print(f"使用者: {user}")
print("-" * 50)

try:
    # 建立 FTP 連線
    ftp = ftplib.FTP()
    ftp.set_debuglevel(2)  # 開啟除錯模式
    
    # 設定被動模式
    ftp.set_pasv(True)
    
    # 連線到伺服器
    print(f"正在連線到 {host}...")
    ftp.connect(host, port, timeout=30)
    
    # 登入
    print(f"正在登入...")
    ftp.login(user, password)
    
    # 取得當前目錄
    pwd = ftp.pwd()
    print(f"成功連線！當前目錄: {pwd}")
    
    # 列出檔案
    print("\n目錄內容:")
    ftp.dir()
    
    # 關閉連線
    ftp.quit()
    print("\n連線成功關閉")
    
except ftplib.error_perm as e:
    print(f"權限錯誤: {e}")
except ftplib.error_temp as e:
    print(f"暫時錯誤: {e}")
except Exception as e:
    print(f"連線失敗: {e}")
    print(f"錯誤類型: {type(e).__name__}")

