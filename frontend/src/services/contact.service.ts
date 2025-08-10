import api from './api';
import { Contact, ContactFilters, PaginatedResponse, ApiResponse } from '@/types';

class ContactService {
  async getContacts(filters?: ContactFilters): Promise<ApiResponse<PaginatedResponse<Contact>>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    return api.get<PaginatedResponse<Contact>>(`/contacts?${params.toString()}`);
  }

  async getContact(id: number): Promise<ApiResponse<{ contact: Contact }>> {
    return api.get<{ contact: Contact }>(`/contacts/${id}`);
  }

  async markAsRead(id: number): Promise<ApiResponse> {
    return api.patch(`/contacts/${id}/read`);
  }

  async markAsReplied(id: number): Promise<ApiResponse> {
    return api.patch(`/contacts/${id}/replied`);
  }

  async updateNotes(id: number, notes: string): Promise<ApiResponse> {
    return api.patch(`/contacts/${id}/notes`, { notes });
  }

  async deleteContact(id: number): Promise<ApiResponse> {
    return api.delete(`/contacts/${id}`);
  }

  async bulkMarkAsRead(ids: number[]): Promise<ApiResponse> {
    return api.post('/contacts/bulk/read', { ids });
  }

  async bulkDelete(ids: number[]): Promise<ApiResponse> {
    return api.post('/contacts/bulk/delete', { ids });
  }

  async exportContacts(filters?: ContactFilters): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get(`/contacts/export?${params.toString()}`, {
      responseType: 'blob',
    });

    return response.data as unknown as Blob;
  }
}

export default new ContactService();