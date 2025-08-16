import React, { useEffect, useState } from 'react';
import {
  TagIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArrowsRightLeftIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import tagService from '@/services/tag.service';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Tag } from '@/types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const AdminTags: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeSource, setMergeSource] = useState<Tag | null>(null);
  const [mergeTarget, setMergeTarget] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    const filtered = tags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTags(filtered);
  }, [tags, searchTerm]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await tagService.getTags();
      if (response.success && response.data && response.data.items) {
        const sortedTags = response.data.items.sort((a, b) => b.usage_count - a.usage_count);
        setTags(sortedTags);
        setFilteredTags(sortedTags);
      } else {
        setTags([]);
        setFilteredTags([]);
      }
    } catch (error) {
      toast.error('無法載入標籤列表');
      console.error('Tags fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTag) {
        const response = await tagService.updateTag(editingTag.id, formData);
        if (response.success) {
          toast.success('標籤已更新');
          setIsModalOpen(false);
          fetchTags();
        }
      } else {
        const response = await tagService.createTag(formData);
        if (response.success) {
          toast.success('標籤已建立');
          setIsModalOpen(false);
          fetchTags();
        }
      }
    } catch (error) {
      toast.error(editingTag ? '更新標籤失敗' : '建立標籤失敗');
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
      return;
    }

    try {
      await tagService.deleteTag(id);
      toast.success('標籤已刪除');
      fetchTags();
    } catch (error) {
      toast.error('刪除標籤失敗');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTags.length === 0) return;

    try {
      await tagService.bulkDelete(selectedTags);
      toast.success(`已刪除 ${selectedTags.length} 個標籤`);
      setSelectedTags([]);
      fetchTags();
    } catch (error) {
      toast.error('批量刪除失敗');
    }
  };

  const handleMerge = async () => {
    if (!mergeSource || !mergeTarget || mergeSource.id === mergeTarget.id) {
      toast.error('請選擇兩個不同的標籤');
      return;
    }

    try {
      await tagService.mergeTags(mergeSource.id, mergeTarget.id);
      toast.success(`已將「${mergeSource.name}」合併到「${mergeTarget.name}」`);
      setMergeModalOpen(false);
      setMergeSource(null);
      setMergeTarget(null);
      fetchTags();
    } catch (error) {
      toast.error('合併標籤失敗');
    }
  };

  const openCreateModal = () => {
    setEditingTag(null);
    setFormData({
      name: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedTags.length === filteredTags.length) {
      setSelectedTags([]);
    } else {
      setSelectedTags(filteredTags.map(t => t.id));
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
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">標籤管理</h1>
          <p className="mt-2 text-gray-600">管理專案標籤和分類</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setMergeModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />
            合併標籤
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            新增標籤
          </button>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 !pr-12 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
              placeholder="搜尋標籤名稱或描述..."
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-primary-more" />
            </div>
          </div>

          {selectedTags.length > 0 && (
            <div className="flex items-center justify-between bg-primary-50 px-4 py-2 rounded-md">
              <span className="text-sm text-primary-700">
                已選擇 {selectedTags.length} 個標籤
              </span>
              <button
                onClick={handleBulkDelete}
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                刪除選中項目
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tags Grid */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedTags.length === filteredTags.length && filteredTags.length > 0}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">
              共 {filteredTags.length} 個標籤
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTags([...selectedTags, tag.id]);
                    } else {
                      setSelectedTags(selectedTags.filter(id => id !== tag.id));
                    }
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-4">
                  <div className="flex items-center">
                    <HashtagIcon className="h-5 w-5 text-gray-400 mr-1" />
                    <p className="text-sm font-medium text-gray-900">
                      {tag.name}
                    </p>
                    <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {tag.usage_count} 次使用
                    </span>
                    {tag.project_count !== undefined && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                        {tag.project_count} 個專案
                      </span>
                    )}
                  </div>
                  {tag.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {tag.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    建立於 {new Date(tag.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(tag)}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                  title="編輯"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  className={clsx(
                    'p-2 rounded-md transition-colors',
                    deleteConfirmId === tag.id
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                  )}
                  title={deleteConfirmId === tag.id ? '確認刪除' : '刪除'}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTags.length === 0 && (
          <div className="text-center py-12">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">
              {searchTerm ? '沒有找到符合條件的標籤' : '尚未建立任何標籤'}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                {editingTag ? '編輯標籤' : '新增標籤'}
              </Dialog.Title>
              
              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                    標籤名稱 *
                  </label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none"
                      placeholder="例如：豪宅、學區房"
                    />
                  </div>
                </div>

                <div>
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
                      placeholder="標籤的詳細說明（選填）"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-500 text-white px-16 py-4 text-content-mobile lg:text-content-desktop font-medium tracking-wider hover:bg-opacity-90 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-more text-white px-16 py-4 text-content-mobile lg:text-content-desktop font-medium tracking-wider hover:bg-opacity-90 transition-colors"
                  >
                    {editingTag ? '更新' : '建立'}
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Merge Modal */}
      <Dialog open={mergeModalOpen} onClose={() => setMergeModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                合併標籤
              </Dialog.Title>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                    來源標籤（將被刪除）
                  </label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                    <select
                      value={mergeSource?.id || ''}
                      onChange={(e) => {
                        const tag = tags.find(t => t.id === Number(e.target.value));
                        setMergeSource(tag || null);
                      }}
                      className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none appearance-none"
                    >
                      <option value="">選擇來源標籤</option>
                      {tags.map((tag) => (
                        <option key={tag.id} value={tag.id} disabled={tag.id === mergeTarget?.id}>
                          {tag.name} ({tag.usage_count} 次使用)
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-primary-more" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowsRightLeftIcon className="h-6 w-6 text-gray-400" />
                </div>

                <div>
                  <label className="block text-content-mobile lg:text-content-desktop font-medium text-gray-700 mb-1 tracking-wider">
                    目標標籤（保留）
                  </label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary-more"></div>
                    <select
                      value={mergeTarget?.id || ''}
                      onChange={(e) => {
                        const tag = tags.find(t => t.id === Number(e.target.value));
                        setMergeTarget(tag || null);
                      }}
                      className="w-full h-12 !pr-4 !pl-6 bg-gray-100 border-0 text-content-mobile lg:text-content-desktop focus:ring-0 focus:outline-none appearance-none"
                    >
                      <option value="">選擇目標標籤</option>
                      {tags.map((tag) => (
                        <option key={tag.id} value={tag.id} disabled={tag.id === mergeSource?.id}>
                          {tag.name} ({tag.usage_count} 次使用)
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-5 h-5 text-primary-more" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {mergeSource && mergeTarget && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-sm text-yellow-800">
                      確認要將「{mergeSource.name}」合併到「{mergeTarget.name}」嗎？
                      此操作將把所有使用「{mergeSource.name}」的專案改為使用「{mergeTarget.name}」，
                      並刪除「{mergeSource.name}」標籤。
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setMergeModalOpen(false);
                      setMergeSource(null);
                      setMergeTarget(null);
                    }}
                    className="bg-gray-500 text-white px-16 py-4 text-content-mobile lg:text-content-desktop font-medium tracking-wider hover:bg-opacity-90 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleMerge}
                    disabled={!mergeSource || !mergeTarget || mergeSource.id === mergeTarget.id}
                    className="bg-primary-more text-white px-16 py-4 text-content-mobile lg:text-content-desktop font-medium tracking-wider hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    確認合併
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminTags;