import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  EnvelopeIcon,
  EnvelopeOpenIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import contactService from '@/services/contact.service';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { Contact, ContactFilters } from '@/types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const AdminContacts: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'replied'>('all');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [deleteConfirmIds, setDeleteConfirmIds] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [replyingContact, setReplyingContact] = useState<Contact | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyNotes, setReplyNotes] = useState('');

  useEffect(() => {
    const filters: ContactFilters = {
      page: Number(searchParams.get('page')) || 1,
      search: searchParams.get('search') || undefined,
      is_read: searchParams.get('status') === 'unread' ? false : undefined,
      is_replied: searchParams.get('status') === 'replied' ? true : undefined,
    };

    setCurrentPage(filters.page || 1);
    setSearchTerm(filters.search || '');
    
    if (searchParams.get('status') === 'unread') {
      setFilterStatus('unread');
    } else if (searchParams.get('status') === 'replied') {
      setFilterStatus('replied');
    } else {
      setFilterStatus('all');
    }

    fetchContacts(filters);
  }, [searchParams]);

  const fetchContacts = async (filters: ContactFilters) => {
    try {
      setLoading(true);
      const response = await contactService.getContacts({
        ...filters,
        limit: 20,
        orderBy: 'created_at',
        orderDir: 'DESC',
      });

      if (response.success && response.data) {
        setContacts(response.data.items);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      toast.error('無法載入聯絡表單');
      console.error('Contacts fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<ContactFilters> & { status?: string }) => {
    const params = new URLSearchParams();
    
    const filters = {
      page: currentPage,
      search: searchTerm,
      status: filterStatus === 'all' ? undefined : filterStatus,
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

  const handleStatusFilter = (status: 'all' | 'unread' | 'replied') => {
    setFilterStatus(status);
    updateFilters({ status, page: 1 });
  };

  const handleView = async (contact: Contact) => {
    setViewingContact(contact);
    setNotes(contact.notes || '');
    
    if (!contact.is_read) {
      try {
        await contactService.markAsRead(contact.id);
        setContacts(contacts.map(c => 
          c.id === contact.id ? { ...c, is_read: true } : c
        ));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleUpdateNotes = async () => {
    if (!viewingContact) return;

    try {
      await contactService.updateNotes(viewingContact.id, notes);
      toast.success('備註已更新');
      setContacts(contacts.map(c => 
        c.id === viewingContact.id ? { ...c, notes } : c
      ));
      setViewingContact({ ...viewingContact, notes });
    } catch (error) {
      toast.error('更新備註失敗');
    }
  };

  const handleReply = (contact: Contact) => {
    setReplyingContact(contact);
    setReplyMessage('');
    setReplyNotes('');
  };

  const handleSendReply = async () => {
    if (!replyingContact || !replyMessage.trim()) {
      toast.error('請輸入回覆內容');
      return;
    }

    try {
      await contactService.replyToContact(replyingContact.id, {
        message: replyMessage,
        notes: replyNotes
      });
      
      toast.success('回覆已發送');
      
      // Update the contact in the list
      setContacts(contacts.map(c => 
        c.id === replyingContact.id 
          ? { ...c, is_replied: true, replied_at: new Date().toISOString(), notes: replyNotes || c.notes }
          : c
      ));
      
      // Update viewing contact if it's the same one
      if (viewingContact?.id === replyingContact.id) {
        setViewingContact({ 
          ...viewingContact, 
          is_replied: true, 
          replied_at: new Date().toISOString(),
          notes: replyNotes || viewingContact.notes
        });
      }
      
      setReplyingContact(null);
      setReplyMessage('');
      setReplyNotes('');
    } catch (error) {
      toast.error('發送回覆失敗');
      console.error('Reply error:', error);
    }
  };

  const handleMarkAsReplied = async (id: number) => {
    try {
      await contactService.markAsReplied(id);
      toast.success('已標記為已回覆');
      setContacts(contacts.map(c => 
        c.id === id ? { ...c, is_replied: true } : c
      ));
      if (viewingContact?.id === id) {
        setViewingContact({ ...viewingContact, is_replied: true });
      }
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  const handleDelete = async (ids: number[]) => {
    if (!deleteConfirmIds.includes(ids[0])) {
      setDeleteConfirmIds(ids);
      setTimeout(() => setDeleteConfirmIds([]), 3000);
      return;
    }

    try {
      if (ids.length === 1) {
        await contactService.deleteContact(ids[0]);
      } else {
        await contactService.bulkDelete(ids);
      }
      
      toast.success(`已刪除 ${ids.length} 個聯絡表單`);
      setContacts(contacts.filter(c => !ids.includes(c.id)));
      setSelectedContacts([]);
      setDeleteConfirmIds([]);
      
      if (viewingContact && ids.includes(viewingContact.id)) {
        setViewingContact(null);
      }
    } catch (error) {
      toast.error('刪除失敗');
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedContacts.length === 0) return;

    try {
      await contactService.bulkMarkAsRead(selectedContacts);
      toast.success(`已將 ${selectedContacts.length} 個表單標記為已讀`);
      setContacts(contacts.map(c => 
        selectedContacts.includes(c.id) ? { ...c, is_read: true } : c
      ));
      setSelectedContacts([]);
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await contactService.exportContacts({
        is_read: filterStatus === 'unread' ? false : undefined,
        is_replied: filterStatus === 'replied' ? true : undefined,
        search: searchTerm || undefined,
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('匯出成功');
    } catch (error) {
      toast.error('匯出失敗');
    }
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  if (loading && contacts.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">聯絡表單管理</h1>
          <p className="mt-2 text-gray-600">查看和管理網站聯絡表單</p>
        </div>
        <button
          onClick={handleExport}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          匯出 CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="搜尋姓名、Email、電話..."
                />
                <div className="absolute inset-y-0 right-0 pe-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </form>

            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => handleStatusFilter('all')}
                  className={clsx(
                    'px-4 py-2 text-sm font-medium rounded-l-md border',
                    filterStatus === 'all'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                >
                  全部
                </button>
                <button
                  onClick={() => handleStatusFilter('unread')}
                  className={clsx(
                    'px-4 py-2 text-sm font-medium border-t border-b',
                    filterStatus === 'unread'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                >
                  未讀
                </button>
                <button
                  onClick={() => handleStatusFilter('replied')}
                  className={clsx(
                    'px-4 py-2 text-sm font-medium rounded-r-md border',
                    filterStatus === 'replied'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                >
                  已回覆
                </button>
              </div>
            </div>
          </div>

          {selectedContacts.length > 0 && (
            <div className="flex items-center justify-between bg-primary-50 px-4 py-2 rounded-md">
              <span className="text-sm text-primary-700">
                已選擇 {selectedContacts.length} 個項目
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkMarkAsRead}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  標記為已讀
                </button>
                <button
                  onClick={() => handleDelete(selectedContacts)}
                  className={clsx(
                    'text-sm font-medium',
                    deleteConfirmIds.length > 0 && deleteConfirmIds.every(id => selectedContacts.includes(id))
                      ? 'text-red-600 hover:text-red-500'
                      : 'text-primary-600 hover:text-primary-500'
                  )}
                >
                  {deleteConfirmIds.length > 0 && deleteConfirmIds.every(id => selectedContacts.includes(id))
                    ? '確認刪除'
                    : '刪除'
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedContacts.length === contacts.length && contacts.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                聯絡人
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                主旨 / 訊息
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                時間
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                className={clsx(
                  'hover:bg-gray-50 cursor-pointer',
                  !contact.is_read && 'bg-blue-50'
                )}
                onClick={() => handleView(contact)}
              >
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContacts([...selectedContacts, contact.id]);
                      } else {
                        setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                      }
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {!contact.is_read ? (
                        <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                      ) : (
                        <EnvelopeOpenIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          {contact.phone}
                        </div>
                      )}
                      {contact.company && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                          {contact.company}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {contact.subject && (
                      <div className="font-medium">{contact.subject}</div>
                    )}
                    <div className="text-gray-500 line-clamp-2">
                      {contact.message}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {!contact.is_read && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        未讀
                      </span>
                    )}
                    {contact.is_replied && (
                      <span className="inline-flex items-center">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <span className="ml-1 text-xs text-gray-500">已回覆</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(contact.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleDelete([contact.id])}
                    className={clsx(
                      'p-2 rounded-md transition-colors',
                      deleteConfirmIds.includes(contact.id)
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                    )}
                    title={deleteConfirmIds.includes(contact.id) ? '確認刪除' : '刪除'}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {contacts.length === 0 && !loading && (
          <div className="text-center py-12">
            <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">沒有找到符合條件的聯絡表單</p>
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

      {/* View Contact Modal */}
      <Dialog open={!!viewingContact} onClose={() => setViewingContact(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            {viewingContact && (
              <div className="p-6">
                <Dialog.Title className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-between">
                  聯絡表單詳情
                  <div className="flex items-center space-x-2">
                    {!viewingContact.is_replied && (
                      <>
                        <button
                          onClick={() => handleReply(viewingContact)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                          回覆
                        </button>
                        <button
                          onClick={() => handleMarkAsReplied(viewingContact.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          標記已回覆
                        </button>
                      </>
                    )}
                  </div>
                </Dialog.Title>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">聯絡人資訊</h3>
                    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">姓名</dt>
                        <dd className="text-sm text-gray-900">{viewingContact.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900">
                          <a href={`mailto:${viewingContact.email}`} className="text-primary-600 hover:text-primary-500">
                            {viewingContact.email}
                          </a>
                        </dd>
                      </div>
                      {viewingContact.phone && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">電話</dt>
                          <dd className="text-sm text-gray-900">
                            <a href={`tel:${viewingContact.phone}`} className="text-primary-600 hover:text-primary-500">
                              {viewingContact.phone}
                            </a>
                          </dd>
                        </div>
                      )}
                      {viewingContact.company && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">公司</dt>
                          <dd className="text-sm text-gray-900">{viewingContact.company}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">訊息內容</h3>
                    {viewingContact.subject && (
                      <p className="text-sm font-medium text-gray-700 mb-2">主旨: {viewingContact.subject}</p>
                    )}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewingContact.message}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">備註</h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="新增內部備註..."
                    />
                    {notes !== viewingContact.notes && (
                      <button
                        onClick={handleUpdateNotes}
                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        儲存備註
                      </button>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
                      <div>
                        <dt className="font-medium text-gray-500">提交時間</dt>
                        <dd className="text-gray-900">
                          {new Date(viewingContact.created_at).toLocaleString()}
                        </dd>
                      </div>
                      {viewingContact.read_at && (
                        <div>
                          <dt className="font-medium text-gray-500">已讀時間</dt>
                          <dd className="text-gray-900">
                            {new Date(viewingContact.read_at).toLocaleString()}
                            {viewingContact.read_by_name && ` by ${viewingContact.read_by_name}`}
                          </dd>
                        </div>
                      )}
                      {viewingContact.replied_at && (
                        <div>
                          <dt className="font-medium text-gray-500">回覆時間</dt>
                          <dd className="text-gray-900">
                            {new Date(viewingContact.replied_at).toLocaleString()}
                            {viewingContact.replied_by_name && ` by ${viewingContact.replied_by_name}`}
                          </dd>
                        </div>
                      )}
                      {viewingContact.source && (
                        <div>
                          <dt className="font-medium text-gray-500">來源</dt>
                          <dd className="text-gray-900">{viewingContact.source}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setViewingContact(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    關閉
                  </button>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Reply Modal */}
      <Dialog open={!!replyingContact} onClose={() => setReplyingContact(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            {replyingContact && (
              <div className="p-6">
                <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                  回覆聯絡表單 - {replyingContact.name}
                </Dialog.Title>
                
                <div className="space-y-4">
                  {/* Original Message */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">原始訊息</h3>
                    <div className="text-sm text-gray-700">
                      <p><strong>來自:</strong> {replyingContact.name} ({replyingContact.email})</p>
                      {replyingContact.subject && <p><strong>主旨:</strong> {replyingContact.subject}</p>}
                      <div className="mt-2 p-3 bg-white border border-gray-200 rounded">
                        <p className="whitespace-pre-wrap">{replyingContact.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reply Message */}
                  <div>
                    <label htmlFor="reply-message" className="block text-sm font-medium text-gray-700 mb-2">
                      回覆內容 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="reply-message"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={8}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="請輸入您的回覆..."
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="reply-notes" className="block text-sm font-medium text-gray-700 mb-2">
                      內部備註
                    </label>
                    <textarea
                      id="reply-notes"
                      value={replyNotes}
                      onChange={(e) => setReplyNotes(e.target.value)}
                      rows={3}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="新增內部備註（選填）..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setReplyingContact(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim()}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2 inline" />
                    發送回覆
                  </button>
                </div>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminContacts;