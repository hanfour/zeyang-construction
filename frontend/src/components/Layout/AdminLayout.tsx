import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  // TagIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import clsx from 'clsx';

const navigation = [
  { name: '儀表板', href: '/admin/dashboard', icon: HomeIcon },
  { name: '專案管理', href: '/admin/projects', icon: BuildingOfficeIcon },
  { name: '聯絡表單', href: '/admin/contacts', icon: EnvelopeIcon },
  // { name: '標籤管理', href: '/admin/tags', icon: TagIcon },
  { name: '系統設定', href: '/admin/settings', icon: CogIcon },
];

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Dialog as="div" className="relative z-40 md:hidden" open={sidebarOpen} onClose={setSidebarOpen}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        
        <div className="fixed inset-0 z-40 flex">
          <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            
            <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <span className="text-2xl font-bold text-white">ZeYang</span>
              </div>
              <nav className="mt-8 space-y-1 px-2">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      clsx(
                        'group flex items-center px-2 py-2 text-base font-medium rounded-md',
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      )
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-4 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
            
            <div className="flex flex-shrink-0 bg-gray-700 p-4">
              <div className="flex items-center">
                <div>
                  <p className="text-base font-medium text-white">{user?.username}</p>
                  <p className="text-sm font-medium text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </Dialog.Panel>
          
          <div className="w-14 flex-shrink-0" />
        </div>
      </Dialog>

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <span className="text-2xl font-bold text-white">管理後台</span>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    clsx(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    )
                  }
                >
                  <item.icon className="mr-3 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="flex flex-shrink-0 bg-gray-700 p-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs font-medium text-gray-400">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto flex-shrink-0 rounded p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <div className="sticky top-0 z-10 bg-white shadow md:hidden">
          <div className="flex h-16 items-center px-4">
            <button
              type="button"
              className="-ml-2 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;