import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  TagIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import projectService from '@/services/project.service';
import contactService from '@/services/contact.service';
import tagService from '@/services/tag.service';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Project, Contact } from '@/types';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalProjects: number;
  featuredProjects: number;
  totalContacts: number;
  unreadContacts: number;
  totalTags: number;
  totalViews: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    featuredProjects: 0,
    totalContacts: 0,
    unreadContacts: 0,
    totalTags: 0,
    totalViews: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [projectsRes, contactsRes, tagsRes] = await Promise.all([
        projectService.getProjects({ limit: 5, orderBy: 'created_at', orderDir: 'DESC' }),
        contactService.getContacts({ limit: 5, orderBy: 'created_at', orderDir: 'DESC' }),
        tagService.getTags(),
      ]);

      if (projectsRes.success && projectsRes.data) {
        setRecentProjects(projectsRes.data.items);
        
        // Fetch total stats
        const allProjectsRes = await projectService.getProjects({ limit: 1 });
        const featuredRes = await projectService.getProjects({ is_featured: true, limit: 1 });
        
        if (allProjectsRes.success && allProjectsRes.data) {
          setStats(prev => ({
            ...prev,
            totalProjects: allProjectsRes.data!.pagination.total,
            totalViews: projectsRes.data.items.reduce((sum, p) => sum + p.view_count, 0),
          }));
        }
        
        if (featuredRes.success && featuredRes.data) {
          setStats(prev => ({
            ...prev,
            featuredProjects: featuredRes.data!.pagination.total,
          }));
        }
      }

      if (contactsRes.success && contactsRes.data) {
        setRecentContacts(contactsRes.data.items);
        
        // Fetch unread count
        const unreadRes = await contactService.getContacts({ is_read: false, limit: 1 });
        
        if (unreadRes.success && unreadRes.data) {
          setStats(prev => ({
            ...prev,
            totalContacts: contactsRes.data!.pagination.total,
            unreadContacts: unreadRes.data!.pagination.total,
          }));
        }
      }

      if (tagsRes.success && tagsRes.data && tagsRes.data.items) {
        setStats(prev => ({
          ...prev,
          totalTags: tagsRes.data!.items.length,
        }));
      }
    } catch (error) {
      toast.error('無法載入儀表板資料');
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '總專案數',
      value: stats.totalProjects,
      icon: BuildingOfficeIcon,
      href: '/admin/projects',
      color: 'bg-blue-500',
    },
    {
      title: '精選專案',
      value: stats.featuredProjects,
      icon: ChartBarIcon,
      href: '/admin/projects?is_featured=true',
      color: 'bg-yellow-500',
    },
    {
      title: '聯絡表單',
      value: stats.totalContacts,
      icon: EnvelopeIcon,
      href: '/admin/contacts',
      color: 'bg-green-500',
      badge: stats.unreadContacts > 0 ? `${stats.unreadContacts} 未讀` : undefined,
    },
    {
      title: '標籤數量',
      value: stats.totalTags,
      icon: TagIcon,
      href: '/admin/tags',
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">儀表板</h1>
        <p className="mt-2 text-gray-600">歡迎回來！以下是您的網站概況。</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.href}
            className="relative bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className={`${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                {stat.badge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                    {stat.badge}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">最新專案</h2>
              <Link
                to="/admin/projects"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                查看全部
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {project.category} • {project.location}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {project.view_count} 瀏覽
                        {project.is_featured && (
                          <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            精選
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/admin/projects?id=${project.id}`}
                      className="ml-4 text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                      編輯
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                尚無專案資料
              </div>
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">最新聯絡表單</h2>
              <Link
                to="/admin/contacts"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                查看全部
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentContacts.length > 0 ? (
              recentContacts.map((contact) => (
                <div key={contact.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">
                          {contact.name}
                        </h3>
                        {!contact.is_read && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            未讀
                          </span>
                        )}
                        {contact.is_replied && (
                          <CheckCircleIcon className="ml-2 h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {contact.email} {contact.phone && `• ${contact.phone}`}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {contact.subject || contact.message}
                      </p>
                    </div>
                    <Link
                      to={`/admin/contacts?id=${contact.id}`}
                      className="ml-4 text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                      查看
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                尚無聯絡表單
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">快速統計</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.totalViews}</p>
            <p className="text-sm text-gray-500">總瀏覽次數</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center">
              <UsersIcon className="h-8 w-8 text-blue-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.unreadContacts}</p>
            <p className="text-sm text-gray-500">待處理聯絡</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center">
              <BuildingOfficeIcon className="h-8 w-8 text-purple-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.featuredProjects}</p>
            <p className="text-sm text-gray-500">精選專案</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;