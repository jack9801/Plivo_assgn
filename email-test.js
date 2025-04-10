// Direct nodemailer test script
const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Email Environment Variables:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE);
console.log('EMAIL_USER:', process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 4)}...` : undefined);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

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

// Verify connection
console.log('Verifying connection...');
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP connection verification failed:', error);
  } else {
    console.log('SMTP server connection verified successfully');
    
    // Send a test email
    console.log('Sending test email...');
    transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to: 'mailtrap-test@example.com',
      subject: 'Direct Nodemailer Test Email',
      text: 'If you are seeing this, the email test was successful!',
      html: '<h1>Email Test</h1><p>If you are seeing this, the email test was successful!</p>',
    })
    .then(info => {
      console.log('Email sent successfully!', {
        messageId: info.messageId,
        response: info.response,
      });
      if (process.env.EMAIL_HOST?.includes('mailtrap')) {
        const cleanMessageId = info.messageId.replace(/[<>]/g, '');
        console.log('Mailtrap preview available at:');
        console.log(`https://mailtrap.io/inboxes/inbox/messages/${cleanMessageId}`);
      }
    })
    .catch(err => {
      console.error('Failed to send email:', err);
    });
  }
}); 