import React, { useState, useEffect } from 'react';
import { 
  EnvelopeIcon,
  ServerIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import settingsService, { EmailSettings, SettingsCollection } from '@/services/settings.service';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const AdminEmailSettings: React.FC = () => {
  const [settings, setSettings] = useState<Partial<EmailSettings>>({
    smtp_enabled: false,
    smtp_host: '',
    smtp_port: 587,
    smtp_secure: true,
    smtp_username: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: 'ZeYang',
    admin_notification_emails: '',
    send_admin_notifications: true,
    send_user_confirmations: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getEmailSettings();
      
      if (response.success && response.data) {
        const settingsData: Partial<EmailSettings> = {};
        
        // Convert settings collection to typed settings object
        Object.entries(response.data).forEach(([key, setting]) => {
          if (key in settings) {
            settingsData[key as keyof EmailSettings] = setting.value;
          }
        });
        
        setSettings(prevSettings => ({
          ...prevSettings,
          ...settingsData
        }));
      }
    } catch (error) {
      toast.error('無法載入郵件設定');
      console.error('Settings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await settingsService.updateEmailSettings(settings);
      toast.success('郵件設定已更新');
    } catch (error) {
      toast.error('更新設定失敗');
      console.error('Settings update error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      
      // Save current settings first
      await settingsService.updateEmailSettings(settings);
      
      const response = await settingsService.testSmtpConnection();
      
      if (response.success) {
        setTestResult({
          success: true,
          message: response.data?.message || 'SMTP 連線測試成功'
        });
        toast.success('SMTP 連線測試成功');
      } else {
        setTestResult({
          success: false,
          message: response.error || 'SMTP 連線測試失敗'
        });
        toast.error('SMTP 連線測試失敗');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'SMTP 連線測試失敗';
      setTestResult({
        success: false,
        message: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (field: keyof EmailSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear test result when settings change
    if (testResult) {
      setTestResult(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">郵件設定</h1>
        <p className="mt-2 text-gray-600">設定 SMTP 伺服器以發送聯絡表單通知和回覆</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Enable/Disable SMTP */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <EnvelopeIcon className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">SMTP 郵件發送</h2>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smtp_enabled"
                checked={settings.smtp_enabled || false}
                onChange={(e) => handleInputChange('smtp_enabled', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="smtp_enabled" className="ml-2 text-sm font-medium text-gray-700">
                啟用 SMTP 郵件發送
              </label>
            </div>
          </div>
          
          {!settings.smtp_enabled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    SMTP 功能已停用。聯絡表單仍會儲存到資料庫，但不會發送郵件通知。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {settings.smtp_enabled && (
          <>
            {/* Setup Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium text-blue-900 mb-4">📧 常用郵件服務設定指引</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Gmail Settings */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">🔵 Gmail</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>主機：</strong> smtp.gmail.com</p>
                    <p><strong>連接埠：</strong> 587 (TLS) 或 465 (SSL)</p>
                    <p><strong>安全連線：</strong> ✅ 啟用</p>
                    <p><strong>使用者名稱：</strong> 完整Gmail地址</p>
                    <p><strong>密碼：</strong> 應用程式密碼</p>
                  </div>
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800">
                      <strong>設定步驟：</strong><br/>
                      1. Gmail設定 → 帳戶與匯入<br/>
                      2. 啟用兩步驟驗證<br/>
                      3. 產生應用程式密碼<br/>
                      4. 選擇「郵件」類型
                    </p>
                  </div>
                </div>

                {/* Outlook Settings */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">🟦 Outlook</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>主機：</strong> smtp-mail.outlook.com</p>
                    <p><strong>連接埠：</strong> 587</p>
                    <p><strong>安全連線：</strong> ✅ 啟用 (STARTTLS)</p>
                    <p><strong>使用者名稱：</strong> 完整Outlook地址</p>
                    <p><strong>密碼：</strong> 應用程式密碼</p>
                  </div>
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800">
                      <strong>設定步驟：</strong><br/>
                      1. account.microsoft.com<br/>
                      2. 安全性 → 進階安全性<br/>
                      3. 應用程式密碼<br/>
                      4. 建立新的應用程式密碼
                    </p>
                  </div>
                </div>

                {/* Yahoo Settings */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">🟣 Yahoo</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>主機：</strong> smtp.mail.yahoo.com</p>
                    <p><strong>連接埠：</strong> 587 或 465</p>
                    <p><strong>安全連線：</strong> ✅ 啟用</p>
                    <p><strong>使用者名稱：</strong> 完整Yahoo地址</p>
                    <p><strong>密碼：</strong> 應用程式密碼</p>
                  </div>
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800">
                      <strong>設定步驟：</strong><br/>
                      1. Yahoo帳戶安全性<br/>
                      2. 產生應用程式密碼<br/>
                      3. 選擇「其他應用程式」<br/>
                      4. 輸入自訂名稱產生
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Other providers */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">🔧 其他常用服務商設定</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>QQ郵箱：</strong> smtp.qq.com:587 (需開啟SMTP)</p>
                    <p><strong>163郵箱：</strong> smtp.163.com:465/994 (需授權碼)</p>
                    <p><strong>126郵箱：</strong> smtp.126.com:465/994 (需授權碼)</p>
                  </div>
                  <div>
                    <p><strong>企業郵箱：</strong> 聯絡IT部門取得SMTP設定</p>
                    <p><strong>自架伺服器：</strong> 使用您的郵件伺服器設定</p>
                    <p><strong>第三方服務：</strong> SendGrid, Mailgun等</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex">
                  <ExclamationCircleIcon className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-amber-800">重要提醒</h4>
                    <div className="mt-1 text-sm text-amber-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>絕對不要使用您的一般登入密碼</li>
                        <li>必須先啟用兩步驟驗證才能產生應用程式密碼</li>
                        <li>應用程式密碼通常是 16 位字元，包含英文和數字</li>
                        <li>建議先測試連線確保設定正確</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SMTP Server Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ServerIcon className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">SMTP 伺服器設定</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="smtp_host" className="block text-sm font-medium text-gray-700">
                    SMTP 主機 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="smtp_host"
                    value={settings.smtp_host || ''}
                    onChange={(e) => handleInputChange('smtp_host', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="例如: smtp.gmail.com"
                    required
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('smtp_host', 'smtp.gmail.com');
                        handleInputChange('smtp_port', 587);
                        handleInputChange('smtp_secure', true);
                      }}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Gmail
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('smtp_host', 'smtp-mail.outlook.com');
                        handleInputChange('smtp_port', 587);
                        handleInputChange('smtp_secure', true);
                      }}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Outlook
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange('smtp_host', 'smtp.mail.yahoo.com');
                        handleInputChange('smtp_port', 587);
                        handleInputChange('smtp_secure', true);
                      }}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Yahoo
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="smtp_port" className="block text-sm font-medium text-gray-700">
                    連接埠 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="smtp_port"
                    value={settings.smtp_port || 587}
                    onChange={(e) => handleInputChange('smtp_port', parseInt(e.target.value))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    min="1"
                    max="65535"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    常用埠號: 587 (TLS), 465 (SSL), 25 (不安全)
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="smtp_secure"
                      checked={settings.smtp_secure || false}
                      onChange={(e) => handleInputChange('smtp_secure', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="smtp_secure" className="ml-2 text-sm font-medium text-gray-700">
                      使用安全連線 (TLS/SSL)
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="smtp_username" className="block text-sm font-medium text-gray-700">
                    使用者名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="smtp_username"
                    value={settings.smtp_username || ''}
                    onChange={(e) => handleInputChange('smtp_username', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="郵件帳號"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="smtp_password" className="block text-sm font-medium text-gray-700">
                    密碼 <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="smtp_password"
                      value={settings.smtp_password || ''}
                      onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                      className="block w-full pr-10 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="應用程式密碼（不是登入密碼）"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-amber-600">
                    <strong>重要：</strong>Gmail 和 Outlook 需要使用「應用程式密碼」，不是您的一般登入密碼
                  </p>
                </div>
              </div>
            </div>

            {/* Email Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">寄件人設定</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="smtp_from_email" className="block text-sm font-medium text-gray-700">
                    寄件人信箱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="smtp_from_email"
                    value={settings.smtp_from_email || ''}
                    onChange={(e) => handleInputChange('smtp_from_email', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="noreply@yourdomain.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="smtp_from_name" className="block text-sm font-medium text-gray-700">
                    寄件人名稱
                  </label>
                  <input
                    type="text"
                    id="smtp_from_name"
                    value={settings.smtp_from_name || ''}
                    onChange={(e) => handleInputChange('smtp_from_name', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="ZeYang"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">通知設定</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="admin_notification_emails" className="block text-sm font-medium text-gray-700">
                    管理員通知信箱
                  </label>
                  <input
                    type="text"
                    id="admin_notification_emails"
                    value={settings.admin_notification_emails || ''}
                    onChange={(e) => handleInputChange('admin_notification_emails', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="admin@yourdomain.com, manager@yourdomain.com"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    多個信箱請用逗號分隔，留空將不發送管理員通知
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="send_admin_notifications"
                      checked={settings.send_admin_notifications || false}
                      onChange={(e) => handleInputChange('send_admin_notifications', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="send_admin_notifications" className="ml-2 text-sm font-medium text-gray-700">
                      發送新聯絡表單通知給管理員
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="send_user_confirmations"
                      checked={settings.send_user_confirmations || false}
                      onChange={(e) => handleInputChange('send_user_confirmations', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="send_user_confirmations" className="ml-2 text-sm font-medium text-gray-700">
                      發送確認郵件給用戶
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Connection */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">連線測試</h2>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  測試 SMTP 設定是否正確，將會先儲存設定然後進行連線測試
                </p>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing || !settings.smtp_host || !settings.smtp_username || !settings.smtp_password}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testing ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      測試中...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      測試連線
                    </>
                  )}
                </button>
              </div>

              {testResult && (
                <div className={clsx(
                  'mt-4 p-4 rounded-md',
                  testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                )}>
                  <div className="flex">
                    {testResult.success ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    ) : (
                      <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                    )}
                    <div className="ml-3">
                      <p className={clsx(
                        'text-sm',
                        testResult.success ? 'text-green-700' : 'text-red-700'
                      )}>
                        {testResult.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                儲存中...
              </>
            ) : (
              '儲存設定'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEmailSettings;