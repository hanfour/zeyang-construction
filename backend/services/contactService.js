const { query, findOne, transaction, paginate } = require('../config/database');
const { sendEmail } = require('../utils/emailService');
const logger = require('../utils/logger');

class ContactService {
  // Create new contact form submission
  static async createContact(data, ipAddress = null, userAgent = null) {
    try {
      const {
        name,
        email,
        phone,
        company,
        subject,
        message,
        source
      } = data;
      
      // Save to database
      const result = await query(
        `INSERT INTO contacts 
         (name, email, phone, company, subject, message, source)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          name, 
          email, 
          phone || null, 
          company || null, 
          subject || null, 
          message, 
          source || 'website'
        ]
      );
      
      // Send notification email to admin (async, don't wait)
      this.sendAdminNotification(data).catch(err => {
        logger.error('Failed to send admin notification:', err);
      });
      
      // Send confirmation email to user (async, don't wait)
      this.sendUserConfirmation(data).catch(err => {
        logger.error('Failed to send user confirmation:', err);
      });
      
      logger.info('Contact form submitted', { 
        contactId: result.insertId,
        email,
        source 
      });
      
      return {
        id: result.insertId,
        success: true
      };
    } catch (error) {
      logger.error('Error creating contact:', error);
      throw new Error('Failed to submit contact form');
    }
  }
  
  // Get all contacts with filters
  static async getContacts(filters = {}, options = {}) {
    try {
      const {
        is_read,
        is_replied,
        source,
        search,
        dateFrom,
        dateTo
      } = filters;
      
      const {
        page = 1,
        limit = 20,
        orderBy = 'created_at',
        orderDir = 'DESC'
      } = options;
      
      let sql = `
        SELECT 
          c.*,
          u1.username as readByName,
          u2.username as repliedByName
        FROM contacts c
        LEFT JOIN users u1 ON c.read_by = u1.id
        LEFT JOIN users u2 ON c.replied_by = u2.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (is_read !== undefined) {
        sql += ' AND c.is_read = ?';
        params.push(is_read);
      }
      
      if (is_replied !== undefined) {
        sql += ' AND c.is_replied = ?';
        params.push(is_replied);
      }
      
      if (source) {
        sql += ' AND c.source = ?';
        params.push(source);
      }
      
      if (search) {
        sql += ' AND (c.name LIKE ? OR c.email LIKE ? OR c.subject LIKE ? OR c.message LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }
      
      if (dateFrom) {
        sql += ' AND DATE(c.created_at) >= ?';
        params.push(dateFrom);
      }
      
      if (dateTo) {
        sql += ' AND DATE(c.created_at) <= ?';
        params.push(dateTo);
      }
      
      // Add ordering
      const validColumns = ['created_at', 'name', 'email', 'is_read', 'is_replied'];
      const validDirs = ['ASC', 'DESC'];
      
      if (validColumns.includes(orderBy) && validDirs.includes(orderDir.toUpperCase())) {
        sql += ` ORDER BY c.${orderBy} ${orderDir.toUpperCase()}`;
      } else {
        sql += ' ORDER BY c.created_at DESC';
      }
      
      // Use the paginate utility function
      return await paginate(sql, params, page, limit);
    } catch (error) {
      logger.error('Error fetching contacts:', error);
      throw new Error('Failed to fetch contacts');
    }
  }
  
  // Get single contact
  static async getContact(id) {
    try {
      const contact = await findOne(
        `SELECT 
          c.*,
          u1.username as readByName,
          u2.username as repliedByName
         FROM contacts c
         LEFT JOIN users u1 ON c.read_by = u1.id
         LEFT JOIN users u2 ON c.replied_by = u2.id
         WHERE c.id = ?`,
        [id]
      );
      
      return contact;
    } catch (error) {
      logger.error('Error fetching contact:', error);
      throw new Error('Failed to fetch contact');
    }
  }
  
  // Mark contact as read
  static async markAsRead(id, userId) {
    try {
      const result = await query(
        'UPDATE contacts SET is_read = true WHERE id = ? AND is_read = false',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Contact not found or already read');
      }
      
      return { success: true };
    } catch (error) {
      logger.error('Error marking contact as read:', error);
      throw error;
    }
  }
  
  // Mark multiple contacts as read
  static async bulkMarkAsRead(ids, userId) {
    try {
      const placeholders = ids.map(() => '?').join(',');
      const result = await query(
        `UPDATE contacts SET is_read = true WHERE id IN (${placeholders}) AND is_read = false`,
        ids
      );
      
      return {
        success: true,
        updated: result.affectedRows
      };
    } catch (error) {
      logger.error('Error bulk marking contacts as read:', error);
      throw new Error('Failed to mark contacts as read');
    }
  }
  
  // Reply to contact
  static async replyToContact(id, replyData, userId) {
    try {
      return await transaction(async (connection) => {
        // Get contact details
        const contact = await this.getContact(id);
        if (!contact) {
          throw new Error('Contact not found');
        }
        
        // Update contact status
        await connection.execute(
          'UPDATE contacts SET is_replied = true, replied_by = ?, replied_at = NOW(), notes = ? WHERE id = ?',
          [userId, replyData.notes || null, id]
        );
        
        // Send reply email
        await this.sendReplyEmail(contact, replyData.message);
        
        logger.info('Contact replied', { contactId: id, userId });
        
        return { success: true };
      });
    } catch (error) {
      logger.error('Error replying to contact:', error);
      throw error;
    }
  }
  
  // Update contact notes
  static async updateNotes(id, notes) {
    try {
      const result = await query(
        'UPDATE contacts SET notes = ? WHERE id = ?',
        [notes, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Contact not found');
      }
      
      logger.info('Contact notes updated', { contactId: id });
      
      return { success: true };
    } catch (error) {
      logger.error('Error updating contact notes:', error);
      throw error;
    }
  }

  // Delete contact
  static async deleteContact(id) {
    try {
      const result = await query('DELETE FROM contacts WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Contact not found');
      }
      
      return { success: true };
    } catch (error) {
      logger.error('Error deleting contact:', error);
      throw error;
    }
  }
  
  // Bulk delete contacts
  static async bulkDeleteContacts(ids) {
    try {
      const placeholders = ids.map(() => '?').join(',');
      const result = await query(`DELETE FROM contacts WHERE id IN (${placeholders})`, ids);
      
      return {
        success: true,
        deleted: result.affectedRows
      };
    } catch (error) {
      logger.error('Error bulk deleting contacts:', error);
      throw new Error('Failed to delete contacts');
    }
  }
  
  // Get contact statistics
  static async getContactStats(days = 30) {
    try {
      const stats = await query(
        `SELECT 
          COUNT(*) as total,
          SUM(is_read) as read_count,
          SUM(is_replied) as replied_count,
          COUNT(DISTINCT source) as sources,
          DATE(created_at) as date,
          COUNT(*) as daily_count
         FROM contacts
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        [days]
      );
      
      const summary = await findOne(
        `SELECT 
          COUNT(*) as total,
          SUM(is_read) as read_count,
          SUM(is_replied) as replied_count,
          SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) as unread_count
         FROM contacts
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [days]
      );
      
      return {
        period: days,
        summary: {
          total: summary.total || 0,
          read: summary.read_count || 0,
          replied: summary.replied_count || 0,
          unread: summary.unread_count || 0,
          readRate: summary.total > 0 ? (summary.read_count / summary.total * 100).toFixed(1) : 0,
          replyRate: summary.total > 0 ? (summary.replied_count / summary.total * 100).toFixed(1) : 0
        },
        daily: stats
      };
    } catch (error) {
      logger.error('Error fetching contact statistics:', error);
      throw new Error('Failed to fetch contact statistics');
    }
  }
  
  // Send admin notification email
  static async sendAdminNotification(contactData) {
    try {
      // Get SMTP config to check if notifications should be sent
      const SettingsService = require('./settingsService');
      const smtpConfig = await SettingsService.getSmtpConfig();
      
      if (!smtpConfig || !smtpConfig.enabled || !smtpConfig.sendAdminNotifications) {
        logger.info('Admin notifications disabled, skipping email');
        return;
      }
      
      const adminEmails = smtpConfig.adminEmails?.length > 0 
        ? smtpConfig.adminEmails 
        : (process.env.ADMIN_EMAILS?.split(',') || ['admin@ZeYang.com']);
    
      const emailContent = `
        <h2>新的聯絡表單提交</h2>
        <p><strong>姓名：</strong> ${contactData.name}</p>
        <p><strong>Email：</strong> ${contactData.email}</p>
        <p><strong>電話：</strong> ${contactData.phone || '未提供'}</p>
        <p><strong>公司：</strong> ${contactData.company || '未提供'}</p>
        <p><strong>主旨：</strong> ${contactData.subject || '未提供'}</p>
        <p><strong>訊息：</strong></p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
          ${contactData.message.replace(/\n/g, '<br>')}
        </div>
        <p><strong>來源：</strong> ${contactData.source || '網站'}</p>
        <p><strong>提交時間：</strong> ${new Date().toLocaleString('zh-TW')}</p>
        <hr>
        <p>請登入後台查看詳細資訊並回覆。</p>
      `;
      
      for (const adminEmail of adminEmails) {
        if (adminEmail.trim()) {
          await sendEmail({
            to: adminEmail.trim(),
            subject: `[ZeYang] 新聯絡表單 - ${contactData.name}`,
            html: emailContent
          });
        }
      }
    } catch (error) {
      logger.error('Failed to send admin notification:', error);
      // Don't throw error to prevent contact form submission failure
    }
  }
  
  // Send user confirmation email
  static async sendUserConfirmation(contactData) {
    try {
      // Get SMTP config to check if confirmations should be sent
      const SettingsService = require('./settingsService');
      const smtpConfig = await SettingsService.getSmtpConfig();
      
      if (!smtpConfig || !smtpConfig.enabled || !smtpConfig.sendUserConfirmations) {
        logger.info('User confirmations disabled, skipping email');
        return;
      }
      
      const emailContent = `
        <h2>感謝您的來信</h2>
        <p>親愛的 ${contactData.name}，</p>
        <p>我們已收到您的訊息，將會盡快回覆您。</p>
        <p>以下是您提交的內容：</p>
        <hr>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0;">
          <p><strong>主旨：</strong> ${contactData.subject || '(未指定)'}</p>
          <p><strong>訊息：</strong></p>
          <p>${contactData.message.replace(/\n/g, '<br>')}</p>
        </div>
        <hr>
        <p>如有緊急事項，請直接致電我們的客服專線。</p>
        <p>祝您有美好的一天！</p>
        <p><strong>ZeYang 團隊</strong></p>
      `;
      
      await sendEmail({
        to: contactData.email,
        subject: '感謝您的來信 - ZeYang',
        html: emailContent
      });
    } catch (error) {
      logger.error('Failed to send user confirmation:', error);
      // Don't throw error to prevent contact form submission failure
    }
  }
  
  // Send reply email to contact
  static async sendReplyEmail(contact, replyMessage) {
    try {
      // Get SMTP config to check if replies should be sent
      const SettingsService = require('./settingsService');
      const smtpConfig = await SettingsService.getSmtpConfig();
      
      if (!smtpConfig || !smtpConfig.enabled) {
        logger.info('SMTP disabled, skipping reply email');
        return;
      }
      
      const emailContent = `
        <h2>回覆：${contact.subject || '您的詢問'}</h2>
        <p>親愛的 ${contact.name}，</p>
        <p>感謝您聯絡我們。以下是我們針對您詢問的回覆：</p>
        <hr>
        <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
          ${replyMessage.replace(/\n/g, '<br>')}
        </div>
        <hr>
        <p><strong>您的原始訊息：</strong></p>
        <div style="background-color: #f1f3f4; padding: 15px; border-left: 3px solid #6c757d; margin: 15px 0; font-style: italic;">
          ${contact.message.replace(/\n/g, '<br>')}
        </div>
        <p>如有其他問題，歡迎隨時與我們聯絡。</p>
        <p>祝您有美好的一天！</p>
        <p><strong>ZeYang 團隊</strong></p>
      `;
      
      await sendEmail({
        to: contact.email,
        subject: `Re: ${contact.subject || 'Your inquiry'} - ZeYang`,
        html: emailContent
      });
      
      logger.info('Reply email sent successfully', { contactId: contact.id, email: contact.email });
    } catch (error) {
      logger.error('Failed to send reply email:', error);
      throw error; // Throw error to indicate reply failure
    }
  }
}

module.exports = ContactService;