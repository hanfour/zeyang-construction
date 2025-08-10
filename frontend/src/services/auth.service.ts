import api from './api';
import { User, LoginFormData, ApiResponse } from '@/types';

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  async login(data: LoginFormData): Promise<ApiResponse<LoginResponse>> {
    return api.post<LoginResponse>('/auth/login', data);
  }

  async logout(): Promise<ApiResponse> {
    return api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return api.get<{ user: User }>('/auth/me');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    return api.post('/auth/refresh', { refreshToken });
  }
}

export default new AuthService();