// @ts-ignore
import nodemailer from 'nodemailer';

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

// Enhanced logging for email configuration verification
console.log('Email configuration loaded:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 4)}...` : undefined,
  password: process.env.EMAIL_PASSWORD ? '********' : undefined,
  secure: process.env.EMAIL_SECURE === 'true',
  from: process.env.EMAIL_FROM
});

// Create transporter with detailed debugging options
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '2525'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true, // Enable debug output
  logger: true, // Log information about the email submission
  // Timeout options for slow connections
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

// Verify connection configuration with typed error and success
transporter.verify(function (error: Error | null, success: boolean) {
  if (error) {
    console.error('SMTP connection verification failed:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT
    });
  } else {
    console.log('✅ SMTP server connection verified successfully');
    console.log('Connection details:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      tls: transporter.options.secure
    });
  }
});

// For development/testing - if not configured, log emails instead of sending
const isEmailConfigured = 
  process.env.EMAIL_HOST && 
  process.env.EMAIL_USER && 
  process.env.EMAIL_PASSWORD;

export const sendEmail = async (payload: EmailPayload) => {
  // Enhanced configuration check with more detailed logging
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT) {
    console.error('Email server configuration missing. Check your environment variables.', {
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_USER: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 4)}...` : undefined,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET',
      EMAIL_FROM: process.env.EMAIL_FROM
    });
    return {
      success: false,
      error: 'Email server configuration missing (HOST or PORT)'
    };
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('Email authentication configuration missing. Check your environment variables.', {
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET'
    });
    
    // In development, we'll allow this to proceed and just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log('💌 DEVELOPMENT MODE - Email would have been sent with the following content:');
      console.log('To:', payload.to);
      console.log('Subject:', payload.subject);
      console.log('Text Content:', payload.text);
      console.log('HTML Content Preview:', payload.html.substring(0, 300) + '...');
      
      return {
        success: true,
        messageId: 'dev-mode-' + Date.now(),
        response: 'Development mode - email logged but not sent'
      };
    }
    
    return {
      success: false,
      error: 'Email authentication configuration missing (USER or PASSWORD)'
    };
  }

  if (!process.env.EMAIL_FROM) {
    console.warn('Email FROM address missing. Using a default value.');
  }

  // Development mode - optional flag to just log emails without sending
  if (process.env.EMAIL_DEV_MODE === 'true') {
    console.log('💌 EMAIL DEV MODE - Email would have been sent with the following content:');
    console.log('To:', payload.to);
    console.log('Subject:', payload.subject);
    console.log('Text Content:', payload.text);
    console.log('HTML Content Preview:', payload.html.substring(0, 300) + '...');
    
    return {
      success: true,
      messageId: 'dev-mode-' + Date.now(),
      response: 'Development mode - email logged but not sent'
    };
  }

  // Log email attempt with detailed configuration
  console.log('Attempting to send email with configuration:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER?.substring(0, 4) + '...',
      pass: '********',
    },
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    to: payload.to,
    subject: payload.subject,
    textLength: payload.text?.length || 0,
    htmlLength: payload.html?.length || 0
  });

  try {
    // Send the email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });

    console.log('✅ Email sent successfully!', {
      messageId: result.messageId,
      response: result.response,
      envelope: result.envelope
    });
    
    // For Mailtrap, provide the preview URL with proper formatting
    if (process.env.EMAIL_HOST?.includes('mailtrap')) {
      // Extract the message ID without angle brackets for Mailtrap URL
      const cleanMessageId = result.messageId.replace(/[<>]/g, '');
      console.log('📧 Mailtrap preview available at:');
      console.log(`https://mailtrap.io/inboxes/inbox/messages/${cleanMessageId}`);
    }

    return { 
      success: true, 
      messageId: result.messageId,
      response: result.response
    };
  } catch (error: any) {
    console.error('❌ Failed to send email:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
      fullError: JSON.stringify(error, null, 2)
    });
    
    // Check for specific error types and give more helpful messages
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - Check if the email server is running and accessible');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out - Check network connectivity and firewall settings');
    } else if (error.code === 'EAUTH') {
      console.error('Authentication failed - Check your username and password');
    }
    
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        response: error.response,
        responseCode: error.responseCode,
        command: error.command,
        stack: error.stack
      }
    };
  }
};

// Templates for different notification types
export function getServiceStatusChangeTemplate({
  organizationName,
  serviceName,
  oldStatus,
  newStatus,
  timestamp,
  unsubscribeUrl
}: {
  organizationName: string;
  serviceName: string;
  oldStatus: string;
  newStatus: string;
  timestamp: string;
  unsubscribeUrl: string;
}) {
  const subject = `[${organizationName}] Service Status Change - ${serviceName}`;
  
  const text = `
Status Change Notification

Service: ${serviceName}
Previous Status: ${oldStatus}
New Status: ${newStatus}
Time: ${timestamp}

Visit our status page for more information.

Unsubscribe: ${unsubscribeUrl}
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
    .status-change { margin: 20px 0; padding: 15px; border-radius: 5px; background-color: #f0f0f0; }
    .status { display: inline-block; padding: 5px 10px; border-radius: 15px; font-size: 14px; }
    .operational { background-color: #d4edda; color: #155724; }
    .degraded { background-color: #fff3cd; color: #856404; }
    .partial-outage { background-color: #ffe5d0; color: #fd7e14; }
    .major-outage { background-color: #f8d7da; color: #721c24; }
    .footer { margin-top: 30px; font-size: 12px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${organizationName} Status Update</h2>
    </div>
    
    <div class="status-change">
      <h3>Service Status Change</h3>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Previous Status:</strong> 
        <span class="status ${oldStatus.toLowerCase().replace('_', '-')}">${oldStatus.replace('_', ' ')}</span>
      </p>
      <p><strong>New Status:</strong> 
        <span class="status ${newStatus.toLowerCase().replace('_', '-')}">${newStatus.replace('_', ' ')}</span>
      </p>
      <p><strong>Time:</strong> ${timestamp}</p>
    </div>
    
    <p>Visit our <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/status/${organizationName.toLowerCase().replace(/\s+/g, '-')}">status page</a> for more information and updates.</p>
    
    <div class="footer">
      <p>You're receiving this email because you subscribed to status updates for ${organizationName}.</p>
      <p><a href="${unsubscribeUrl}">Unsubscribe</a> from these notifications.</p>
    </div>
  </div>
</body>
</html>
`;

  return { subject, text, html };
}

export function getIncidentCreatedTemplate({
  organizationName,
  incidentTitle,
  serviceName,
  severity,
  description,
  timestamp,
  unsubscribeUrl
}: {
  organizationName: string;
  incidentTitle: string;
  serviceName: string;
  severity: string;
  description: string;
  timestamp: string;
  unsubscribeUrl: string;
}) {
  const subject = `[${organizationName}] New Incident - ${incidentTitle}`;
  
  const text = `
New Incident Notification

Incident: ${incidentTitle}
Service: ${serviceName}
Severity: ${severity}
Time: ${timestamp}

Description:
${description}

Visit our status page for more information.

Unsubscribe: ${unsubscribeUrl}
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
    .incident { margin: 20px 0; padding: 15px; border-radius: 5px; background-color: #f0f0f0; }
    .severity { display: inline-block; padding: 5px 10px; border-radius: 15px; font-size: 14px; }
    .low { background-color: #d1ecf1; color: #0c5460; }
    .medium { background-color: #fff3cd; color: #856404; }
    .high { background-color: #ffe5d0; color: #fd7e14; }
    .critical { background-color: #f8d7da; color: #721c24; }
    .footer { margin-top: 30px; font-size: 12px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${organizationName} Status Update</h2>
    </div>
    
    <div class="incident">
      <h3>New Incident Reported</h3>
      <p><strong>Incident:</strong> ${incidentTitle}</p>
      <p><strong>Service:</strong> ${serviceName}</p>
      <p><strong>Severity:</strong> 
        <span class="severity ${severity.toLowerCase()}">${severity}</span>
      </p>
      <p><strong>Time:</strong> ${timestamp}</p>
      <p><strong>Description:</strong></p>
      <p>${description}</p>
    </div>
    
    <p>Visit our <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/status/${organizationName.toLowerCase().replace(/\s+/g, '-')}">status page</a> for more information and updates.</p>
    
    <div class="footer">
      <p>You're receiving this email because you subscribed to status updates for ${organizationName}.</p>
      <p><a href="${unsubscribeUrl}">Unsubscribe</a> from these notifications.</p>
    </div>
  </div>
</body>
</html>
`;

  return { subject, text, html };
}