const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter with dynamic config
const createTransporter = async (customConfig = null) => {
  let config;
  
  if (customConfig) {
    // Use provided config (for testing SMTP settings)
    config = {
      host: customConfig.host,
      port: customConfig.port || 587,
      secure: customConfig.secure || false,
      auth: {
        user: customConfig.auth?.user || customConfig.username,
        pass: customConfig.auth?.pass || customConfig.password
      }
    };
  } else {
    // Try to get SMTP config from database settings
    try {
      const SettingsService = require('../services/settingsService');
      const smtpConfig = await SettingsService.getSmtpConfig();
      
      if (smtpConfig && smtpConfig.enabled) {
        config = {
          host: smtpConfig.host,
          port: smtpConfig.port || 587,
          secure: smtpConfig.secure || false,
          auth: {
            user: smtpConfig.username,
            pass: smtpConfig.password
          }
        };
      } else {
        // Fallback to environment variables
        config = {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        };
      }
    } catch (error) {
      logger.warn('Failed to load SMTP settings from database, using environment variables:', error);
      // Fallback to environment variables
      config = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      };
    }
  }
  
  // In development, use ethereal email for testing if no SMTP configured
  if (process.env.NODE_ENV === 'development' && !config.host) {
    logger.info('Using Ethereal Email for development');
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }
  
  return nodemailer.createTransporter(config);
};

// Test SMTP connection
const testSmtpConnection = async (config) => {
  try {
    const transporter = await createTransporter(config);
    await transporter.verify();
    
    // Send a test email if requested
    if (config.testEmail) {
      const testMessage = {
        from: `${config.fromName || 'ZeYang'} <${config.from}>`,
        to: config.testEmail,
        subject: 'SMTP Configuration Test - ZeYang',
        html: `
          <h2>SMTP Test Successful</h2>
          <p>Your SMTP configuration is working correctly!</p>
          <p>This test email was sent from ZeYang at ${new Date().toLocaleString()}.</p>
          <p>Configuration details:</p>
          <ul>
            <li>Host: ${config.host}</li>
            <li>Port: ${config.port}</li>
            <li>Secure: ${config.secure ? 'Yes' : 'No'}</li>
            <li>Username: ${config.auth?.user || config.username}</li>
          </ul>
        `
      };
      
      const info = await transporter.sendMail(testMessage);
      
      return {
        success: true,
        message: 'SMTP connection verified and test email sent',
        messageId: info.messageId
      };
    }
    
    return {
      success: true,
      message: 'SMTP connection verified successfully'
    };
  } catch (error) {
    logger.error('SMTP connection test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Email template wrapper
const wrapEmailTemplate = (content, title = 'ZeYang') => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #2c3e50;
    }
    .content {
      margin: 20px 0;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    p {
      margin: 10px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #3498db;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    hr {
      border: none;
      border-top: 1px solid #f0f0f0;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ZeYang</div>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ZeYang. All rights reserved.</p>
      <p>This email was sent from ZeYang system. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Send email function
const sendEmail = async (options) => {
  try {
    // Skip email sending in test environment
    if (process.env.NODE_ENV === 'test') {
      logger.info('Skipping email send in test environment', { to: options.to, subject: options.subject });
      return { messageId: 'test-message-id', success: true };
    }
    
    const transporter = await createTransporter();
    
    // Get SMTP config for from address
    let from = options.from;
    if (!from) {
      try {
        const SettingsService = require('../services/settingsService');
        const smtpConfig = await SettingsService.getSmtpConfig();
        if (smtpConfig && smtpConfig.from) {
          from = `${smtpConfig.fromName || 'ZeYang'} <${smtpConfig.from}>`;
        }
      } catch (error) {
        // Fallback to environment or default
        from = `ZeYang <${process.env.SMTP_USER || 'noreply@ZeYang.com'}>`;
      }
    }
    
    // Prepare email options
    const mailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html ? wrapEmailTemplate(options.html, options.subject) : undefined,
      attachments: options.attachments
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject
    });
    
    // In development, log the preview URL
    if (process.env.NODE_ENV === 'development' && info.messageId) {
      logger.info('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

// Send bulk emails
const sendBulkEmails = async (recipients, template, variables = {}) => {
  const results = {
    sent: [],
    failed: []
  };
  
  for (const recipient of recipients) {
    try {
      // Replace template variables
      let subject = template.subject;
      let content = template.content;
      
      // Replace common variables
      const allVariables = {
        ...variables,
        name: recipient.name || 'User',
        email: recipient.email
      };
      
      for (const [key, value] of Object.entries(allVariables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        content = content.replace(regex, value);
      }
      
      await sendEmail({
        to: recipient.email,
        subject,
        html: content
      });
      
      results.sent.push(recipient.email);
    } catch (error) {
      logger.error(`Failed to send email to ${recipient.email}:`, error);
      results.failed.push({
        email: recipient.email,
        error: error.message
      });
    }
  }
  
  return results;
};

// Email templates
const emailTemplates = {
  welcomeUser: {
    subject: 'Welcome to ZeYang',
    content: `
      <h2>Welcome to ZeYang!</h2>
      <p>Dear {{name}},</p>
      <p>Thank you for joining ZeYang. We're excited to have you as part of our community.</p>
      <p>You can now access all our premium features and explore the best real estate projects.</p>
      <a href="{{loginUrl}}" class="button">Login to Your Account</a>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br>The ZeYang Team</p>
    `
  },
  
  passwordReset: {
    subject: 'Password Reset Request',
    content: `
      <h2>Password Reset Request</h2>
      <p>Dear {{name}},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <a href="{{resetUrl}}" class="button">Reset Password</a>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The ZeYang Team</p>
    `
  },
  
  projectInquiry: {
    subject: 'Thank you for your interest in {{projectName}}',
    content: `
      <h2>Thank you for your inquiry</h2>
      <p>Dear {{name}},</p>
      <p>Thank you for your interest in <strong>{{projectName}}</strong>.</p>
      <p>Our team will review your inquiry and get back to you within 24 hours.</p>
      <p>In the meantime, feel free to browse our other projects or contact us directly if you have any urgent questions.</p>
      <p>Best regards,<br>The ZeYang Team</p>
    `
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  testSmtpConnection,
  emailTemplates,
  wrapEmailTemplate
};