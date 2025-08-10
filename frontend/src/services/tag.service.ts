import api from './api';
import { Tag, ApiResponse } from '@/types';

class TagService {
  async getTags(filters?: { search?: string }): Promise<ApiResponse<{ items: Tag[] }>> {
    const params = new URLSearchParams();
    if (filters?.search) {
      params.append('search', filters.search);
    }
    const queryString = params.toString();
    return api.get<{ items: Tag[] }>(`/tags${queryString ? `?${queryString}` : ''}`);
  }

  async getTag(id: number): Promise<ApiResponse<{ tag: Tag }>> {
    return api.get<{ tag: Tag }>(`/tags/${id}`);
  }

  async createTag(data: { name: string; description?: string }): Promise<ApiResponse<{ tag: Tag }>> {
    return api.post<{ tag: Tag }>('/tags', data);
  }

  async updateTag(id: number, data: { name?: string; description?: string }): Promise<ApiResponse<{ tag: Tag }>> {
    return api.put<{ tag: Tag }>(`/tags/${id}`, data);
  }

  async deleteTag(id: number): Promise<ApiResponse> {
    return api.delete(`/tags/${id}`);
  }

  async bulkDelete(ids: number[]): Promise<ApiResponse> {
    return api.post('/tags/bulk/delete', { ids });
  }

  async mergeTags(sourceId: number, targetId: number): Promise<ApiResponse> {
    return api.post(`/tags/${sourceId}/merge`, { targetId });
  }
}

export default new TagService();