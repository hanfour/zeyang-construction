import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  PhotoIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Dialog } from '@headlessui/react';
import projectService from '@/services/project.service';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import DynamicFieldManager from '@/components/Admin/DynamicFieldManager';
import ProjectImageManager from '@/components/Admin/ProjectImageManager';
import ProjectImageUploader, { LocalImage } from '@/components/Admin/ProjectImageUploader';
import TagSelector from '@/components/Common/TagSelector';
import { Project, ProjectFormData, ProjectFilters, CustomField, ProjectImage } from '@/types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const AdminProjects: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDisplayPage, setSelectedDisplayPage] = useState<string>('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [formImages, setFormImages] = useState<ProjectImage[]>([]);
  const [newImages, setNewImages] = useState<LocalImage[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    subtitle: '',
    category: undefined,
    status: 'planning',
    display_page: undefined,
    location: '',
    base_address: '',
    year: new Date().getFullYear(),
    area: '',
    floor_plan_info: '',
    unit_count: undefined,
    display_order: 0,
    is_featured: false,
    facebook_page: '',
    booking_phone: '',
    info_website: '',
    description: '',
    detail_content: '',
    custom_fields: [],
    tags: [],
  });

  // const categories = ['住宅', '商辦', '公共工程', '其他'];
  const statuses = [
    { value: 'planning', label: '規劃中' },
    { value: 'pre_sale', label: '預售' },
    { value: 'on_sale', label: '銷售中' },
    { value: 'sold_out', label: '已售罄' },
    { value: 'completed', label: '已完工' },
  ];

  useEffect(() => {
    const filters: ProjectFilters = {
      page: Number(searchParams.get('page')) || 1,
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') as Project['category'] || undefined,
      status: searchParams.get('status') as Project['status'] || undefined,
      display_page: searchParams.get('display_page') as Project['display_page'] || undefined,
      is_featured: searchParams.get('is_featured') === 'true' ? true : undefined,
    };

    setCurrentPage(filters.page || 1);
    setSearchTerm(filters.search || '');
    setSelectedCategory(filters.category || '');
    setSelectedStatus(filters.status || '');
    setSelectedDisplayPage(filters.display_page || '');
    setShowFeaturedOnly(filters.is_featured || false);

    fetchProjects(filters);
  }, [searchParams]);

  const fetchProjects = async (filters: ProjectFilters) => {
    try {
      setLoading(true);
      const response = await projectService.getProjects({
        ...filters,
        limit: 10,
        orderBy: 'created_at',
        orderDir: 'DESC',
      });

      if (response.success && response.data) {
        setProjects(response.data.items);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      toast.error('無法載入專案列表');
      console.error('Projects fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<ProjectFilters>) => {
    const params = new URLSearchParams();
    
    const filters = {
      page: currentPage,
      search: searchTerm,
      category: selectedCategory,
      status: selectedStatus,
      display_page: selectedDisplayPage,
      is_featured: showFeaturedOnly,
      ...newFilters,
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm, page: 1 });
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let projectUuid: string;
      
      if (editingProject) {
        const response = await projectService.updateProject(editingProject.uuid, formData);
        if (response.success) {
          projectUuid = editingProject.uuid;
          toast.success('專案已更新');
        } else {
          throw new Error('更新失敗');
        }
      } else {
        const response = await projectService.createProject(formData);
        if (response.success && response.data) {
          projectUuid = response.data.uuid;
          toast.success('專案已建立');
        } else {
          throw new Error('建立失敗');
        }
      }
      
      // 上傳新圖片
      if (newImages.length > 0 && projectUuid) {
        const files = newImages.map(img => img.file);
        const mainImageIndex = newImages.findIndex(img => img.isMain);
        
        const uploadResponse = await projectService.uploadImages(
          projectUuid,
          files,
          'gallery'
        );
        
        if (uploadResponse.success && uploadResponse.data?.uploaded && mainImageIndex >= 0) {
          // 設定主圖
          const uploadedImages = uploadResponse.data.uploaded;
          if (uploadedImages[mainImageIndex]) {
            await projectService.setMainImage(projectUuid, uploadedImages[mainImageIndex].id);
          }
        }
      }
      
      setIsModalOpen(false);
      setNewImages([]);
      fetchProjects({ page: editingProject ? currentPage : 1 });
    } catch (error) {
      toast.error(editingProject ? '更新專案失敗' : '建立專案失敗');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormImages(project.images || []);
    setFormData({
      title: project.title,
      subtitle: project.subtitle || '',
      category: project.category,
      status: project.status,
      display_page: project.display_page,
      location: project.location,
      base_address: project.base_address || '',
      year: project.year || new Date().getFullYear(),
      area: project.area || '',
      floor_plan_info: project.floor_plan_info || '',
      unit_count: project.unit_count || undefined,
      display_order: project.display_order,
      is_featured: project.is_featured,
      facebook_page: project.facebook_page || '',
      booking_phone: project.booking_phone || '',
      info_website: project.info_website || '',
      description: project.description || '',
      detail_content: project.detail_content || '',
      meta_title: project.meta_title || '',
      meta_description: project.meta_description || '',
      custom_fields: project.custom_fields || [],
      tags: project.tags?.map(tag => typeof tag === 'string' ? tag : tag.name) || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }

    try {
      const project = projects.find(p => p.id === id);
      if (project) {
        await projectService.deleteProject(project.uuid);
        toast.success('專案已刪除');
        fetchProjects({ page: currentPage });
      }
    } catch (error) {
      toast.error('刪除專案失敗');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    try {
      await projectService.toggleProjectFeatured(project.uuid);
      toast.success(project.is_featured ? '已取消精選' : '已設為精選');
      fetchProjects({ page: currentPage });
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormImages([]);
    setNewImages([]);
    setFormData({
      title: '',
      subtitle: '',
      category: undefined,
      status: 'planning',
      display_page: undefined,
      location: '',
      base_address: '',
      year: new Date().getFullYear(),
      area: '',
      floor_plan_info: '',
      unit_count: undefined,
      display_order: 0,
      is_featured: false,
      facebook_page: '',
      booking_phone: '',
      info_website: '',
      description: '',
      detail_content: '',
      custom_fields: [],
      tags: [],
    });
    setIsModalOpen(true);
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">專案管理</h1>
          <p className="mt-2 text-gray-600">管理所有建案專案資訊</p>
        </div>
        <button
          onClick={openCreateModal}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          新增專案
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="search" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                搜尋專案
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 !pr-12 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                  placeholder="輸入專案名稱..."
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-primary-more" />
                </div>
              </div>
            </div>

            {/* Category filter hidden - removed from filters */}

            {/* Status filter hidden - removed from filters */}

            <div>
              <label htmlFor="display_page" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                上架頁面
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                <select
                  id="display_page"
                  value={selectedDisplayPage}
                  onChange={(e) => {
                    setSelectedDisplayPage(e.target.value);
                    updateFilters({ display_page: e.target.value as Project['display_page'], page: 1 });
                  }}
                  className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none appearance-none"
                >
                  <option value="">全部頁面</option>
                  <option value="開發專區">開發專區</option>
                  <option value="澤暘作品">澤暘作品</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <svg className="w-5 h-5 text-primary-more" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={(e) => {
                    setShowFeaturedOnly(e.target.checked);
                    updateFilters({ is_featured: e.target.checked, page: 1 });
                  }}
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">僅顯示精選</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary-more text-white px-16 py-4 text-content-mobile lg:text-content-desktop font-medium tracking-wider hover:bg-opacity-90 transition-colors"
            >
              搜尋
            </button>
          </div>
        </form>
      </div>

      {/* Projects Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {projects.map((project) => (
            <li key={project.id}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {project.image_count ? (
                      <PhotoIcon className="h-12 w-12 text-gray-400 mr-4" />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded mr-4" />
                    )}
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {project.title}
                        </p>
                        {project.is_featured && (
                          <StarIconSolid className="ml-2 h-5 w-5 text-yellow-400" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="truncate">{project.location}</span>
                        <span className="!hidden mx-2">•</span>
                        <span className="!hidden inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {statuses.find(s => s.value === project.status)?.label || project.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {project.view_count} 瀏覽
                        <span className="mx-2">•</span>
                        <span>建立於 {new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleFeatured(project)}
                      className={clsx(
                        'p-2 rounded-md transition-colors',
                        project.is_featured
                          ? 'text-yellow-600 hover:bg-yellow-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      )}
                      title={project.is_featured ? '取消精選' : '設為精選'}
                    >
                      <StarIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={async () => {
                        setSelectedProject(project);
                        setImageModalOpen(true);
                        setLoadingImages(true);
                        
                        // 重新獲取專案完整資訊，包括最新的圖片列表
                        try {
                          const response = await projectService.getProject(project.uuid);
                          if (response.success && response.data?.project.images) {
                            setProjectImages(response.data.project.images);
                          } else {
                            setProjectImages([]);
                          }
                        } catch (error) {
                          console.error('Failed to fetch project images:', error);
                          toast.error('載入圖片失敗，顯示快取圖片');
                          setProjectImages(project.images || []);
                        } finally {
                          setLoadingImages(false);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                      title="管理圖片"
                    >
                      <PhotoIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(project)}
                      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                      title="編輯"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className={clsx(
                        'p-2 rounded-md transition-colors',
                        deleteConfirmId === project.id
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                      )}
                      title={deleteConfirmId === project.id ? '確認刪除' : '刪除'}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {projects.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">沒有找到符合條件的專案</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => updateFilters({ page: currentPage - 1 })}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一頁
            </button>
            <button
              onClick={() => updateFilters({ page: currentPage + 1 })}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一頁
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => updateFilters({ page })}
                  className={clsx(
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === currentPage
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  )}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onClose={() => {
        // 清理預覽 URL
        newImages.forEach(img => URL.revokeObjectURL(img.preview));
        setNewImages([]);
        setIsModalOpen(false);
      }} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl" style={{ maxHeight: '75dvh' }}>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(75dvh - 2rem)' }}>
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                {editingProject ? '編輯專案' : '新增專案'}
              </Dialog.Title>
              
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="title" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      專案名稱 *
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="text"
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="subtitle" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      副標題
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="text"
                        id="subtitle"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Category field hidden - removed from form */}

                  {/* Status field hidden - removed from form */}

                  <div>
                    <label htmlFor="display_page" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      上架頁面
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <select
                        id="display_page"
                        value={formData.display_page || ''}
                        onChange={(e) => setFormData({ ...formData, display_page: e.target.value as Project['display_page'] })}
                        className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none appearance-none"
                      >
                        <option value="">選擇上架頁面</option>
                        <option value="開發專區">開發專區</option>
                        <option value="澤暘作品">澤暘作品</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg className="w-5 h-5 text-primary-more" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      地區位置 *
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="text"
                        id="location"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="base_address" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      基地地址
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="text"
                        id="base_address"
                        value={formData.base_address}
                        onChange={(e) => setFormData({ ...formData, base_address: e.target.value })}
                        className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="year" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      年份
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="number"
                        id="year"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="area" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      面積
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="text"
                        id="area"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="floor_plan_info" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      樓層規劃
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="text"
                        id="floor_plan_info"
                        value={formData.floor_plan_info}
                        onChange={(e) => setFormData({ ...formData, floor_plan_info: e.target.value })}
                        className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                        placeholder="例：地上15層/地下3層"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="unit_count" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      戶數
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="number"
                        id="unit_count"
                        value={formData.unit_count || ''}
                        onChange={(e) => setFormData({ ...formData, unit_count: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="facebook_page" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      Facebook粉絲團
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="url"
                        id="facebook_page"
                        value={formData.facebook_page}
                        onChange={(e) => setFormData({ ...formData, facebook_page: e.target.value })}
                        className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="booking_phone" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      預約專線
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="tel"
                        id="booking_phone"
                        value={formData.booking_phone}
                        onChange={(e) => setFormData({ ...formData, booking_phone: e.target.value })}
                        className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                        placeholder="02-1234-5678"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="info_website" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      介紹網站
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <input
                        type="url"
                        id="info_website"
                        value={formData.info_website}
                        onChange={(e) => setFormData({ ...formData, info_website: e.target.value })}
                        className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      描述
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <textarea
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 !hidden">
                    <label htmlFor="tags" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                      標籤
                    </label>
                    <div className="relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                      <div className="pl-6">
                        <TagSelector
                          value={formData.tags}
                          onChange={(tags) => setFormData({ ...formData, tags })}
                          placeholder="輸入標籤名稱或選擇現有標籤"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      可以新增多個標籤，按 Enter 確認輸入
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <DynamicFieldManager
                      fields={formData.custom_fields || []}
                      onChange={(fields) => setFormData({ ...formData, custom_fields: fields })}
                      label="自訂欄位"
                    />
                  </div>

                  {/* 圖片管理區域 */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      專案圖片
                    </label>
                    {editingProject ? (
                      // 編輯模式：顯示現有圖片和新圖片上傳
                      <div className="space-y-4">
                        {formImages.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-600 mb-2">現有圖片</h4>
                            <ProjectImageManager
                              projectUuid={editingProject.uuid}
                              images={formImages}
                              onImagesChange={setFormImages}
                              maxFiles={20}
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">新增圖片</h4>
                          <ProjectImageUploader
                            value={newImages}
                            onChange={setNewImages}
                            maxFiles={20 - formImages.length}
                          />
                        </div>
                      </div>
                    ) : (
                      // 新增模式：只顯示圖片上傳
                      <ProjectImageUploader
                        value={newImages}
                        onChange={setNewImages}
                        maxFiles={20}
                      />
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">設為精選專案</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      // 清理預覽 URL
                      newImages.forEach(img => URL.revokeObjectURL(img.preview));
                      setNewImages([]);
                      setIsModalOpen(false);
                    }}
                    className="bg-gray-500 text-white px-16 py-4 text-content-mobile lg:text-content-desktop font-medium tracking-wider hover:bg-opacity-90 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-more text-white px-16 py-4 text-content-mobile lg:text-content-desktop font-medium tracking-wider hover:bg-opacity-90 transition-colors"
                  >
                    {editingProject ? '更新' : '建立'}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Image Management Modal */}
      <Dialog open={imageModalOpen} onClose={() => {
        setImageModalOpen(false);
        setLoadingImages(false);
        setSelectedProject(null);
        setProjectImages([]);
      }} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-xl" style={{ maxHeight: '75dvh' }}>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(75dvh - 2rem)' }}>
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                {selectedProject?.title} - 圖片管理
              </Dialog.Title>
              
              {loadingImages ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="medium" />
                  <span className="ml-2 text-gray-600">載入圖片中...</span>
                </div>
              ) : (
                <ProjectImageManager
                  projectUuid={selectedProject?.uuid}
                  images={projectImages}
                  onImagesChange={(images) => {
                    setProjectImages(images);
                    // Update the project in the list
                    if (selectedProject) {
                      const updatedProjects = projects.map(p => 
                        p.id === selectedProject.id 
                          ? { ...p, images, image_count: images.length }
                          : p
                      );
                      setProjects(updatedProjects);
                    }
                  }}
                  maxFiles={20}
                />
              )}
              
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setImageModalOpen(false);
                    setLoadingImages(false);
                    setSelectedProject(null);
                    setProjectImages([]);
                  }}
                  className="bg-gray-500 text-white px-16 py-4 text-content-mobile lg:text-content-desktop font-medium tracking-wider hover:bg-opacity-90 transition-colors"
                >
                  關閉
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminProjects;