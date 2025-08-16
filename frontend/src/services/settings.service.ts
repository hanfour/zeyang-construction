import api from './api';
import { ApiResponse } from '@/types';

export interface Setting {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
  updated_at: string;
}

export interface SettingsCollection {
  [key: string]: Setting;
}

export interface EmailSettings {
  smtp_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_username: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
  admin_notification_emails: string;
  send_admin_notifications: boolean;
  send_user_confirmations: boolean;
}

export interface SmtpTestResult {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}

class SettingsService {
  async getSettings(category?: string): Promise<ApiResponse<SettingsCollection>> {
    const params = category ? `?category=${category}` : '';
    return api.get<SettingsCollection>(`/settings${params}`);
  }

  async getSetting(key: string): Promise<ApiResponse<Setting>> {
    return api.get<Setting>(`/settings/${key}`);
  }

  async updateSettings(settings: Record<string, { value: any; type?: string; category?: string }>): Promise<ApiResponse> {
    return api.put('/settings', { settings });
  }

  async getEmailSettings(): Promise<ApiResponse<SettingsCollection>> {
    return api.get<SettingsCollection>('/settings/category/email');
  }

  async updateEmailSettings(settings: Partial<EmailSettings>): Promise<ApiResponse> {
    return api.put('/settings/category/email', settings);
  }

  async testSmtpConnection(): Promise<ApiResponse<SmtpTestResult>> {
    return api.post<SmtpTestResult>('/settings/smtp/test');
  }

  async deleteEmailSettings(): Promise<ApiResponse> {
    return api.delete('/settings/category/email');
  }
}

export default new SettingsService();