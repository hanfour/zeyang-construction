const { query, findOne } = require('../config/database');
const logger = require('../utils/logger');
const crypto = require('crypto');

class SettingsService {
  static ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || 'your-secret-encryption-key-32-chars';
  static ALGORITHM = 'aes-256-cbc';

  // Encrypt sensitive settings like passwords
  static encrypt(text) {
    if (!text) return text;
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.ALGORITHM, Buffer.from(this.ENCRYPTION_KEY.slice(0, 32)), iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('Failed to encrypt setting value:', error);
      return text; // Return original if encryption fails
    }
  }

  // Decrypt sensitive settings
  static decrypt(text) {
    if (!text) return text;
    try {
      const textParts = text.split(':');
      if (textParts.length !== 2) {
        // Old format or plain text, return as is
        return text;
      }
      const iv = Buffer.from(textParts[0], 'hex');
      const encryptedText = textParts[1];
      const decipher = crypto.createDecipheriv(this.ALGORITHM, Buffer.from(this.ENCRYPTION_KEY.slice(0, 32)), iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      logger.warn('Failed to decrypt setting value:', error);
      return text; // Return original if decryption fails
    }
  }

  // Get all settings or settings by category
  static async getSettings(category = null) {
    try {
      let sql = 'SELECT * FROM settings';
      const params = [];

      if (category) {
        sql += ' WHERE category = ?';
        params.push(category);
      }

      sql += ' ORDER BY category, `key`';

      const settings = await query(sql, params);

      // Process settings by type and decrypt sensitive ones
      const processedSettings = {};

      for (const setting of settings) {
        let value = setting.value;

        // Convert value based on type
        switch (setting.type) {
        case 'number':
          value = value ? parseFloat(value) : 0;
          break;
        case 'boolean':
          value = value === 'true' || value === true;
          break;
        case 'json':
          try {
            value = value ? JSON.parse(value) : null;
          } catch (e) {
            logger.warn(`Invalid JSON in setting ${setting.key}:`, e);
            value = null;
          }
          break;
        case 'string':
        default:
          // Decrypt password fields
          if (setting.key.includes('password') && value) {
            value = this.decrypt(value);
          }
          break;
        }

        processedSettings[setting.key] = {
          value,
          type: setting.type,
          category: setting.category,
          description: setting.description,
          updated_at: setting.updated_at
        };
      }

      return processedSettings;
    } catch (error) {
      logger.error('Error fetching settings:', error);
      throw new Error('Failed to fetch settings');
    }
  }

  // Get single setting
  static async getSetting(key) {
    try {
      const setting = await findOne('SELECT * FROM settings WHERE `key` = ?', [key]);

      if (!setting) {
        return null;
      }

      let value = setting.value;

      // Convert value based on type
      switch (setting.type) {
      case 'number':
        value = value ? parseFloat(value) : 0;
        break;
      case 'boolean':
        value = value === 'true' || value === true;
        break;
      case 'json':
        try {
          value = value ? JSON.parse(value) : null;
        } catch (e) {
          logger.warn(`Invalid JSON in setting ${key}:`, e);
          value = null;
        }
        break;
      case 'string':
      default:
        // Decrypt password fields
        if (key.includes('password') && value) {
          value = this.decrypt(value);
        }
        break;
      }

      return {
        key: setting.key,
        value,
        type: setting.type,
        category: setting.category,
        description: setting.description,
        updated_at: setting.updated_at
      };
    } catch (error) {
      logger.error(`Error fetching setting ${key}:`, error);
      throw new Error('Failed to fetch setting');
    }
  }

  // Update settings
  static async updateSettings(settings, userId) {
    try {
      const results = [];

      for (const [key, settingData] of Object.entries(settings)) {
        const { value, type = 'string' } = settingData;

        // Prepare value for storage
        let storageValue = value;

        switch (type) {
        case 'number':
          storageValue = value !== null && value !== undefined ? value.toString() : '0';
          break;
        case 'boolean':
          storageValue = value ? 'true' : 'false';
          break;
        case 'json':
          storageValue = value ? JSON.stringify(value) : null;
          break;
        case 'string':
        default:
          // Encrypt password fields
          if (key.includes('password') && value) {
            storageValue = this.encrypt(value);
          } else {
            storageValue = value || '';
          }
          break;
        }

        // Update or insert setting
        const result = await query(
          `INSERT INTO settings (\`key\`, value, type, category, updated_by) 
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           value = VALUES(value), 
           type = VALUES(type),
           category = VALUES(category),
           updated_by = VALUES(updated_by),
           updated_at = CURRENT_TIMESTAMP`,
          [key, storageValue, type, settingData.category || 'general', userId]
        );

        results.push({
          key,
          success: true,
          affected: result.affectedRows
        });

        logger.info('Setting updated', { key, userId });
      }

      return results;
    } catch (error) {
      logger.error('Error updating settings:', error);
      throw new Error('Failed to update settings');
    }
  }

  // Test SMTP connection
  static async testSmtpConnection() {
    try {
      const smtpSettings = await this.getSettings('email');

      // Check if SMTP is enabled and properly configured
      if (!smtpSettings.smtp_enabled?.value) {
        // If SMTP is not enabled, use development/testing configuration
        if (process.env.NODE_ENV === 'development') {
          logger.info('SMTP not enabled, testing with mock success in development');
          return {
            success: true,
            message: 'SMTP test completed (development mode - no actual email server configured)'
          };
        } else {
          throw new Error('SMTP is not enabled');
        }
      }

      const requiredFields = ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'smtp_from_email'];
      const missingFields = [];

      for (const field of requiredFields) {
        if (!smtpSettings[field]?.value) {
          missingFields.push(field);
        }
      }

      if (missingFields.length > 0) {
        throw new Error(`Missing required SMTP settings: ${missingFields.join(', ')}`);
      }

      // Test connection using the email service
      const { testSmtpConnection } = require('../utils/emailService');
      const testResult = await testSmtpConnection({
        host: smtpSettings.smtp_host.value,
        port: smtpSettings.smtp_port.value,
        secure: smtpSettings.smtp_secure?.value || false,
        auth: {
          user: smtpSettings.smtp_username.value,
          pass: smtpSettings.smtp_password.value
        },
        from: smtpSettings.smtp_from_email.value,
        fromName: smtpSettings.smtp_from_name?.value || 'ZeYang'
      });

      logger.info('SMTP connection test completed', { success: testResult.success });

      return testResult;
    } catch (error) {
      logger.error('SMTP connection test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete settings by category
  static async deleteSettingsByCategory(category, userId) {
    try {
      const result = await query(
        'DELETE FROM settings WHERE category = ?',
        [category]
      );

      logger.info('Settings deleted by category', { category, userId, affected: result.affectedRows });

      return {
        success: true,
        affected: result.affectedRows
      };
    } catch (error) {
      logger.error('Error deleting settings by category:', error);
      throw new Error('Failed to delete settings');
    }
  }

  // Get SMTP configuration for email service
  static async getSmtpConfig() {
    try {
      const emailSettings = await this.getSettings('email');

      if (!emailSettings.smtp_enabled?.value) {
        return null; // SMTP disabled
      }

      return {
        enabled: emailSettings.smtp_enabled.value,
        host: emailSettings.smtp_host?.value,
        port: emailSettings.smtp_port?.value || 587,
        secure: emailSettings.smtp_secure?.value || false,
        username: emailSettings.smtp_username?.value,
        password: emailSettings.smtp_password?.value,
        from: emailSettings.smtp_from_email?.value,
        fromName: emailSettings.smtp_from_name?.value || 'ZeYang',
        adminEmails: emailSettings.admin_notification_emails?.value?.split(',').map(email => email.trim()).filter(Boolean) || [],
        sendAdminNotifications: emailSettings.send_admin_notifications?.value !== false,
        sendUserConfirmations: emailSettings.send_user_confirmations?.value !== false
      };
    } catch (error) {
      logger.error('Error getting SMTP config:', error);
      return null;
    }
  }
}

module.exports = SettingsService;
