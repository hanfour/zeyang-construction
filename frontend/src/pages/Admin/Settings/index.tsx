import React from 'react';
import { Link } from 'react-router-dom';
import {
  EnvelopeIcon,
  KeyIcon,
  CogIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const settingsItems = [
  {
    name: '密碼設定',
    description: '修改您的登入密碼',
    href: '/admin/settings/password',
    icon: KeyIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    name: '郵件設定',
    description: '設定 SMTP 伺服器以發送聯絡表單通知和回覆',
    href: '/admin/settings/email',
    icon: EnvelopeIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
];

const AdminSettings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">系統設定</h1>
        <p className="mt-2 text-gray-600">管理您的帳戶和系統配置</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {settingsItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div>
              <span className={`inline-flex p-3 ${item.bgColor} rounded-lg`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                {item.name}
                <span className="absolute inset-0" aria-hidden="true" />
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {item.description}
              </p>
            </div>
            <div className="absolute top-6 right-6">
              <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* System Information */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <CogIcon className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">系統資訊</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">系統版本</dt>
            <dd className="mt-1 text-sm text-gray-900">ZeYang v1.0.0</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">最後更新</dt>
            <dd className="mt-1 text-sm text-gray-900">2024-08-16</dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;