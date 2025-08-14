import api from './api';
import { Project, ProjectFormData, ProjectFilters, PaginatedResponse, ApiResponse } from '@/types';

class ProjectService {
  async getProjects(filters?: ProjectFilters): Promise<ApiResponse<PaginatedResponse<Project>>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    return api.get<PaginatedResponse<Project>>(`/projects?${params.toString()}`);
  }

  async getProject(identifier: string): Promise<ApiResponse<{ project: Project }>> {
    return api.get<{ project: Project }>(`/projects/${identifier}`);
  }

  async getProjectBySlug(slug: string): Promise<ApiResponse<{ project: Project }>> {
    return api.get<{ project: Project }>(`/projects/slug/${slug}`);
  }

  async getFeaturedProjects(limit: number = 6): Promise<ApiResponse<{ items: Project[] }>> {
    return api.get<{ items: Project[] }>(`/projects/featured?limit=${limit}`);
  }

  async searchProjects(query: string, page: number = 1, limit: number = 20): Promise<ApiResponse<PaginatedResponse<Project>>> {
    return api.get<PaginatedResponse<Project>>(`/projects/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  async getRelatedProjects(slug: string, limit: number = 4): Promise<ApiResponse<{ items: Project[] }>> {
    return api.get<{ items: Project[] }>(`/projects/${slug}/related?limit=${limit}`);
  }

  async createProject(data: ProjectFormData): Promise<ApiResponse<{ project: Project }>> {
    return api.post<{ project: Project }>('/projects', data);
  }

  async updateProject(identifier: string, data: Partial<ProjectFormData>): Promise<ApiResponse<{ project: Project }>> {
    return api.put<{ project: Project }>(`/projects/${identifier}`, data);
  }

  async updateProjectStatus(identifier: string, status: Project['status']): Promise<ApiResponse> {
    return api.patch(`/projects/${identifier}/status`, { status });
  }

  async toggleProjectFeatured(identifier: string): Promise<ApiResponse<{ is_featured: boolean }>> {
    return api.post<{ is_featured: boolean }>(`/projects/${identifier}/feature`);
  }

  async deleteProject(identifier: string, hardDelete: boolean = false): Promise<ApiResponse> {
    return api.delete(`/projects/${identifier}${hardDelete ? '?hard=true' : ''}`);
  }

  async reorderProjects(orders: Array<{ uuid: string; display_order: number }>): Promise<ApiResponse> {
    return api.put('/projects/reorder', { orders });
  }

  // Image management
  async uploadImages(
    projectIdentifier: string,
    files: File[],
    imageType: string = 'gallery',
    altText?: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    formData.append('image_type', imageType);
    if (altText) {
      formData.append('alt_text', altText);
    }
    
    return api.upload(`/projects/${projectIdentifier}/images`, formData, onProgress);
  }

  async updateImage(projectIdentifier: string, imageId: number, data: any): Promise<ApiResponse> {
    return api.put(`/projects/${projectIdentifier}/images/${imageId}`, data);
  }

  async deleteImage(projectIdentifier: string, imageId: number): Promise<ApiResponse> {
    return api.delete(`/projects/${projectIdentifier}/images/${imageId}`);
  }

  async setMainImage(projectIdentifier: string, imageId: number): Promise<ApiResponse> {
    return api.post(`/projects/${projectIdentifier}/images/${imageId}/set-main`);
  }

  async reorderImages(projectIdentifier: string, orders: Array<{ id: number; display_order: number }>): Promise<ApiResponse> {
    return api.put(`/projects/${projectIdentifier}/images/reorder`, { orders });
  }
}

export default new ProjectService();