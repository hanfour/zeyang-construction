import settingsService from '../settings.service';
import { api } from '../api';

// Mock the api module
jest.mock('../api');
const mockApi = api as jest.Mocked<typeof api>;

describe('settingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSettings', () => {
    it('should fetch all settings successfully', async () => {
      const mockSettings = [
        {
          key: 'site_name',
          value: 'ZeYang',
          type: 'string',
          category: 'general',
          description: 'Website name'
        },
        {
          key: 'items_per_page',
          value: '20',
          type: 'number',
          category: 'general',
          description: 'Items per page'
        }
      ];

      mockApi.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockSettings
        }
      });

      const result = await settingsService.getAllSettings();

      expect(mockApi.get).toHaveBeenCalledWith('/api/settings');
      expect(result).toEqual({
        success: true,
        data: mockSettings
      });
    });

    it('should handle API error', async () => {
      const mockError = new Error('Network error');
      mockApi.get.mockRejectedValueOnce(mockError);

      await expect(settingsService.getAllSettings()).rejects.toThrow('Network error');
      expect(mockApi.get).toHaveBeenCalledWith('/api/settings');
    });
  });

  describe('getSettingsByCategory', () => {
    it('should fetch settings by category successfully', async () => {
      const category = 'email';
      const mockEmailSettings = [
        {
          key: 'smtp_enabled',
          value: 'true',
          type: 'boolean',
          category: 'email',
          description: 'Enable SMTP'
        },
        {
          key: 'smtp_host',
          value: 'smtp.gmail.com',
          type: 'string',
          category: 'email',
          description: 'SMTP host'
        }
      ];

      mockApi.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockEmailSettings
        }
      });

      const result = await settingsService.getSettingsByCategory(category);

      expect(mockApi.get).toHaveBeenCalledWith(`/api/settings/category/${category}`);
      expect(result).toEqual({
        success: true,
        data: mockEmailSettings
      });
    });

    it('should handle empty category', async () => {
      mockApi.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: []
        }
      });

      const result = await settingsService.getSettingsByCategory('nonexistent');

      expect(mockApi.get).toHaveBeenCalledWith('/api/settings/category/nonexistent');
      expect(result.data).toEqual([]);
    });
  });

  describe('getSetting', () => {
    it('should fetch single setting successfully', async () => {
      const key = 'site_name';
      const mockSetting = {
        key: 'site_name',
        value: 'ZeYang',
        type: 'string',
        category: 'general',
        description: 'Website name'
      };

      mockApi.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockSetting
        }
      });

      const result = await settingsService.getSetting(key);

      expect(mockApi.get).toHaveBeenCalledWith(`/api/settings/${key}`);
      expect(result).toEqual({
        success: true,
        data: mockSetting
      });
    });

    it('should handle non-existent setting', async () => {
      const key = 'nonexistent_key';
      mockApi.get.mockRejectedValueOnce({
        response: {
          status: 404,
          data: {
            success: false,
            message: 'Setting not found'
          }
        }
      });

      await expect(settingsService.getSetting(key)).rejects.toMatchObject({
        response: {
          status: 404
        }
      });
    });
  });

  describe('updateSetting', () => {
    it('should update setting successfully', async () => {
      const key = 'site_name';
      const value = 'Updated ZeYang';

      mockApi.put.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Setting updated successfully'
        }
      });

      const result = await settingsService.updateSetting(key, value);

      expect(mockApi.put).toHaveBeenCalledWith(`/api/settings/${key}`, { value });
      expect(result).toEqual({
        success: true,
        message: 'Setting updated successfully'
      });
    });

    it('should handle validation errors', async () => {
      const key = 'items_per_page';
      const invalidValue = 'not-a-number';

      mockApi.put.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            success: false,
            message: 'Invalid value type',
            errors: ['Value must be a number']
          }
        }
      });

      await expect(settingsService.updateSetting(key, invalidValue))
        .rejects.toMatchObject({
          response: {
            status: 400
          }
        });
    });

    it('should handle empty value', async () => {
      const key = 'site_name';
      const value = '';

      mockApi.put.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            success: false,
            message: 'Value cannot be empty'
          }
        }
      });

      await expect(settingsService.updateSetting(key, value))
        .rejects.toMatchObject({
          response: {
            status: 400
          }
        });
    });
  });

  describe('getSmtpConfig', () => {
    it('should fetch SMTP configuration successfully', async () => {
      const mockSmtpConfig = {
        enabled: true,
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        fromEmail: 'noreply@ZeYang.com',
        fromName: 'ZeYang',
        adminEmails: ['admin@ZeYang.com'],
        sendAdminNotifications: true,
        sendUserConfirmations: true
      };

      mockApi.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockSmtpConfig
        }
      });

      const result = await settingsService.getSmtpConfig();

      expect(mockApi.get).toHaveBeenCalledWith('/api/settings/smtp/config');
      expect(result).toEqual({
        success: true,
        data: mockSmtpConfig
      });
    });

    it('should handle disabled SMTP', async () => {
      const mockDisabledConfig = {
        enabled: false,
        host: '',
        port: 587,
        secure: false,
        fromEmail: '',
        fromName: 'ZeYang',
        adminEmails: [],
        sendAdminNotifications: false,
        sendUserConfirmations: false
      };

      mockApi.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockDisabledConfig
        }
      });

      const result = await settingsService.getSmtpConfig();

      expect(result.data.enabled).toBe(false);
    });
  });

  describe('testSmtpConfig', () => {
    it('should test SMTP configuration successfully', async () => {
      const testConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        username: 'test@gmail.com',
        password: 'testpassword',
        fromEmail: 'test@gmail.com',
        toEmail: 'admin@ZeYang.com'
      };

      mockApi.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'SMTP connection test successful'
        }
      });

      const result = await settingsService.testSmtpConfig(testConfig);

      expect(mockApi.post).toHaveBeenCalledWith('/api/settings/smtp/test', testConfig);
      expect(result).toEqual({
        success: true,
        message: 'SMTP connection test successful'
      });
    });

    it('should handle SMTP test failure', async () => {
      const testConfig = {
        host: 'invalid-host.com',
        port: 587,
        secure: false,
        username: 'test@gmail.com',
        password: 'wrongpassword',
        fromEmail: 'test@gmail.com',
        toEmail: 'admin@ZeYang.com'
      };

      mockApi.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            success: false,
            message: 'SMTP connection failed: Authentication failed'
          }
        }
      });

      await expect(settingsService.testSmtpConfig(testConfig))
        .rejects.toMatchObject({
          response: {
            status: 400
          }
        });
    });

    it('should validate SMTP config before testing', async () => {
      const invalidConfig = {
        host: '',
        port: 'invalid',
        secure: false,
        username: '',
        password: '',
        fromEmail: 'invalid-email',
        toEmail: ''
      } as any;

      mockApi.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            success: false,
            message: 'Invalid SMTP configuration',
            errors: [
              'Host is required',
              'Port must be a number',
              'Username is required',
              'Password is required',
              'From email must be valid',
              'To email must be valid'
            ]
          }
        }
      });

      await expect(settingsService.testSmtpConfig(invalidConfig))
        .rejects.toMatchObject({
          response: {
            status: 400
          }
        });
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockApi.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(settingsService.getAllSettings()).rejects.toThrow('Network Error');
    });

    it('should handle server errors', async () => {
      mockApi.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: {
            success: false,
            message: 'Internal server error'
          }
        }
      });

      await expect(settingsService.getAllSettings()).rejects.toMatchObject({
        response: {
          status: 500
        }
      });
    });

    it('should handle unauthorized errors', async () => {
      mockApi.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Unauthorized'
          }
        }
      });

      await expect(settingsService.getAllSettings()).rejects.toMatchObject({
        response: {
          status: 401
        }
      });
    });

    it('should handle forbidden errors', async () => {
      mockApi.put.mockRejectedValueOnce({
        response: {
          status: 403,
          data: {
            success: false,
            message: 'Forbidden'
          }
        }
      });

      await expect(settingsService.updateSetting('site_name', 'New Name'))
        .rejects.toMatchObject({
          response: {
            status: 403
          }
        });
    });
  });

  describe('type safety', () => {
    it('should handle string values correctly', async () => {
      const key = 'site_name';
      const value = 'ZeYang Website';

      mockApi.put.mockResolvedValueOnce({
        data: { success: true, message: 'Updated' }
      });

      await settingsService.updateSetting(key, value);

      expect(mockApi.put).toHaveBeenCalledWith(`/api/settings/${key}`, { value });
    });

    it('should handle boolean values correctly', async () => {
      const key = 'enable_registration';
      const value = 'true';

      mockApi.put.mockResolvedValueOnce({
        data: { success: true, message: 'Updated' }
      });

      await settingsService.updateSetting(key, value);

      expect(mockApi.put).toHaveBeenCalledWith(`/api/settings/${key}`, { value });
    });

    it('should handle number values correctly', async () => {
      const key = 'items_per_page';
      const value = '25';

      mockApi.put.mockResolvedValueOnce({
        data: { success: true, message: 'Updated' }
      });

      await settingsService.updateSetting(key, value);

      expect(mockApi.put).toHaveBeenCalledWith(`/api/settings/${key}`, { value });
    });
  });

  describe('caching behavior', () => {
    it('should make fresh API calls each time', async () => {
      const mockSettings = [
        { key: 'site_name', value: 'ZeYang', type: 'string', category: 'general' }
      ];

      mockApi.get
        .mockResolvedValueOnce({ data: { success: true, data: mockSettings } })
        .mockResolvedValueOnce({ data: { success: true, data: mockSettings } });

      await settingsService.getAllSettings();
      await settingsService.getAllSettings();

      expect(mockApi.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple simultaneous requests', async () => {
      const mockSetting = {
        key: 'site_name',
        value: 'ZeYang',
        type: 'string',
        category: 'general'
      };

      mockApi.get.mockResolvedValue({
        data: { success: true, data: mockSetting }
      });

      const requests = [
        settingsService.getSetting('site_name'),
        settingsService.getSetting('items_per_page'),
        settingsService.getSetting('enable_registration')
      ];

      const results = await Promise.all(requests);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      expect(mockApi.get).toHaveBeenCalledTimes(3);
    });
  });
});