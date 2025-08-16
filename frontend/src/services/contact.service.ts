import api from './api';
import axios from 'axios';
import { Contact, ContactFilters, PaginatedResponse, ApiResponse, ContactFormData } from '@/types';

class ContactService {
  async getContacts(filters?: ContactFilters): Promise<ApiResponse<PaginatedResponse<Contact>>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Convert frontend parameter names to backend expected names
          const backendKey = key === 'is_read' ? 'isRead' : 
                            key === 'is_replied' ? 'isReplied' : key;
          params.append(backendKey, String(value));
        }
      });
    }
    
    return api.get<PaginatedResponse<Contact>>(`/contacts?${params.toString()}`);
  }

  async createContact(data: ContactFormData): Promise<ApiResponse<{ contact: Contact }>> {
    return api.post<{ contact: Contact }>('/contacts', data);
  }

  async getContact(id: number): Promise<ApiResponse<{ contact: Contact }>> {
    return api.get<{ contact: Contact }>(`/contacts/${id}`);
  }

  async markAsRead(id: number): Promise<ApiResponse> {
    return api.put(`/contacts/${id}/read`);
  }

  async markAsReplied(id: number): Promise<ApiResponse> {
    return api.put(`/contacts/${id}/mark-replied`);
  }

  async replyToContact(id: number, data: { message: string; notes?: string }): Promise<ApiResponse> {
    return api.put(`/contacts/${id}/reply`, data);
  }

  async updateNotes(id: number, notes: string): Promise<ApiResponse> {
    return api.put(`/contacts/${id}/notes`, { notes });
  }

  async deleteContact(id: number): Promise<ApiResponse> {
    return api.delete(`/contacts/${id}`);
  }

  async bulkMarkAsRead(ids: number[]): Promise<ApiResponse> {
    return api.put('/contacts/bulk-read', { ids });
  }

  async bulkDelete(ids: number[]): Promise<ApiResponse> {
    return api.post('/contacts/bulk-delete', { ids });
  }

  async exportContacts(filters?: ContactFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Convert frontend parameter names to backend expected names
          const backendKey = key === 'is_read' ? 'isRead' : 
                            key === 'is_replied' ? 'isReplied' : key;
          params.append(backendKey, String(value));
        }
      });
    }

    // Use axios directly for blob response to avoid JSON parsing issues
    const response = await axios.get(`${api.baseURL || 'http://localhost:5001/api'}/contacts/export?${params.toString()}`, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    return response.data;
  }
}

export default new ContactService();