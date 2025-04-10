// Script to force send an email notification for a test incident
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
require('dotenv').config();

const prisma = new PrismaClient();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '2525'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true,
  logger: true,
});

async function sendTestIncidentEmail() {
  try {
    // Get the first organization and service
    const organization = await prisma.organization.findFirst();
    if (!organization) {
      console.error('No organizations found');
      return;
    }
    
    const service = await prisma.service.findFirst({
      where: { organizationId: organization.id }
    });
    if (!service) {
      console.error('No services found for organization:', organization.name);
      return;
    }
    
    console.log(`Found organization: ${organization.name}`);
    console.log(`Found service: ${service.name}`);
    
    // Create or get test subscriber
    const testEmail = 'mailtrap-test@example.com';
    const token = require('crypto').randomBytes(32).toString('hex');
    
    const subscription = await prisma.subscription.upsert({
      where: {
        email_organizationId: {
          email: testEmail,
          organizationId: organization.id
        }
      },
      update: {
        token,
        confirmed: true
      },
      create: {
        email: testEmail,
        organizationId: organization.id,
        token,
        confirmed: true
      }
    });
    
    console.log(`Using subscription: ${subscription.email} (${subscription.id})`);
    
    // Prepare email data
    const timestamp = new Date().toLocaleString();
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/subscriptions?token=${subscription.token}&unsubscribe=true`;
    const statusPageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/status/${organization.slug}`;
    
    // Email content
    const subject = `[${organization.name}] Test Incident Notification`;
    const text = `
Test Incident Notification

Organization: ${organization.name}
Service: ${service.name}
Severity: HIGH
Time: ${timestamp}

Description:
This is a test incident notification to verify email delivery.

Visit our status page for more information: ${statusPageUrl}

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
    .high { background-color: #ffe5d0; color: #fd7e14; }
    .footer { margin-top: 30px; font-size: 12px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${organization.name} Status Update</h2>
    </div>
    
    <div class="incident">
      <h3>Test Incident Notification</h3>
      <p><strong>Organization:</strong> ${organization.name}</p>
      <p><strong>Service:</strong> ${service.name}</p>
      <p><strong>Severity:</strong> 
        <span class="severity high">HIGH</span>
      </p>
      <p><strong>Time:</strong> ${timestamp}</p>
      <p><strong>Description:</strong></p>
      <p>This is a test incident notification to verify email delivery.</p>
    </div>
    
    <p>Visit our <a href="${statusPageUrl}">status page</a> for more information and updates.</p>
    
    <div class="footer">
      <p>You're receiving this email because you subscribed to status updates for ${organization.name}.</p>
      <p><a href="${unsubscribeUrl}">Unsubscribe</a> from these notifications.</p>
    </div>
  </div>
</body>
</html>
    `;
    
    // Send email
    console.log('Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Status Page <notifications@example.com>',
      to: subscription.email,
      subject,
      text,
      html,
    });
    
    console.log('✅ Email sent successfully!', {
      messageId: result.messageId,
      response: result.response,
    });
    
    if (process.env.EMAIL_HOST?.includes('mailtrap')) {
      const cleanMessageId = result.messageId.replace(/[<>]/g, '');
      console.log('📧 Mailtrap preview available at:');
      console.log(`https://mailtrap.io/inboxes/inbox/messages/${cleanMessageId}`);
    }
    
  } catch (error) {
    console.error('Error sending test email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

sendTestIncidentEmail(); 