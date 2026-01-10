// Test SMTP Connection
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('====================================');
console.log('SMTP Connection Test');
console.log('====================================');
console.log('');

console.log('Configuration:');
console.log(`  Host: ${process.env.SMTP_HOST}`);
console.log(`  Port: ${process.env.SMTP_PORT}`);
console.log(`  User: ${process.env.SMTP_USER}`);
console.log(`  Pass: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}`);
console.log('');

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('ERROR: SMTP credentials not set in .env');
  process.exit(1);
}

const port = parseInt(process.env.SMTP_PORT);
const isSSL = port === 465;

console.log(`Creating transporter (${isSSL ? 'SSL' : 'TLS'})...`);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: port,
  secure: isSSL,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  debug: true, // Enable debug output
  logger: true // Enable logging
});

console.log('');
console.log('Testing connection...');
console.log('');

try {
  await transporter.verify();
  console.log('');
  console.log('✓ SUCCESS: SMTP connection verified!');
  console.log('');
  
  // Try sending test email
  console.log('Sending test email...');
  const testEmail = process.env.SMTP_USER; // Send to self
  
  const info = await transporter.sendMail({
    from: `"Uslugar Test" <${process.env.SMTP_USER}>`,
    to: testEmail,
    subject: 'SMTP Test Email',
    text: 'This is a test email from Uslugar backend.',
    html: '<b>This is a test email from Uslugar backend.</b>'
  });
  
  console.log('');
  console.log('✓ SUCCESS: Test email sent!');
  console.log(`Message ID: ${info.messageId}`);
  console.log(`Response: ${info.response}`);
  console.log('');
  console.log('Check inbox:', testEmail);
  
} catch (error) {
  console.error('');
  console.error('✗ ERROR: SMTP test failed');
  console.error('');
  console.error('Error details:');
  console.error(error);
  process.exit(1);
}

