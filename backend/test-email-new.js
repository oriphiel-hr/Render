// Test Email with New SMTP Configuration
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('====================================');
console.log('Email Test - New SMTP Configuration');
console.log('====================================');
console.log('');

// SMTP Configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // 465 uses SSL
  auth: {
    user: process.env.SMTP_USER || 'uslugar@oriphiel.hr',
    pass: process.env.SMTP_PASS || 'c|1TYK4YqbF'
  }
};

console.log('SMTP Configuration:');
console.log('  Host:', SMTP_CONFIG.host);
console.log('  Port:', SMTP_CONFIG.port);
console.log('  User:', SMTP_CONFIG.auth.user);
console.log('  Pass:', '********');
console.log('');

// Create transporter
const transporter = nodemailer.createTransport(SMTP_CONFIG);

// Test email recipient (can be changed)
const testRecipient = process.argv[2] || SMTP_CONFIG.auth.user;

console.log('Testing SMTP connection...');
console.log('');

try {
  // Verify connection
  await transporter.verify();
  console.log('✓ SUCCESS: SMTP connection verified!');
  console.log('');
  
  // Send test email
  console.log(`Sending test email to: ${testRecipient}`);
  console.log('');
  
  const info = await transporter.sendMail({
    from: `"Uslugar Test" <${SMTP_CONFIG.auth.user}>`,
    to: testRecipient,
    subject: 'Test Email - Nova SMTP Konfiguracija',
    text: `
Ovo je test email s novom SMTP konfiguracijom.

Konfiguracija:
- Host: ${SMTP_CONFIG.host}
- Port: ${SMTP_CONFIG.port}
- User: ${SMTP_CONFIG.auth.user}

Ako primite ovaj email, znači da nova konfiguracija radi ispravno!
    `,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #4CAF50; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="color: white; margin: 0;">USLUGAR</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px;">
          <h2 style="color: #333; margin-top: 0;">Test Email - Nova SMTP Konfiguracija</h2>
          <p>Ovo je test email s novom SMTP konfiguracijom.</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <p style="margin: 5px 0;"><strong>Host:</strong> ${SMTP_CONFIG.host}</p>
            <p style="margin: 5px 0;"><strong>Port:</strong> ${SMTP_CONFIG.port}</p>
            <p style="margin: 5px 0;"><strong>User:</strong> ${SMTP_CONFIG.auth.user}</p>
          </div>
          
          <p style="color: #4CAF50; font-weight: bold;">
            ✓ Ako primite ovaj email, znači da nova konfiguracija radi ispravno!
          </p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Test email poslan: ${new Date().toLocaleString('hr-HR')}
          </p>
        </div>
      </body>
      </html>
    `
  });
  
  console.log('✓ SUCCESS: Test email sent!');
  console.log('');
  console.log('Email Details:');
  console.log('  Message ID:', info.messageId);
  console.log('  Response:', info.response);
  console.log('  To:', testRecipient);
  console.log('  From:', SMTP_CONFIG.auth.user);
  console.log('');
  console.log('Check inbox:', testRecipient);
  console.log('');
  console.log('====================================');
  console.log('Test completed successfully!');
  console.log('====================================');
  
  process.exit(0);
  
} catch (error) {
  console.error('');
  console.error('✗ ERROR: Email test failed');
  console.error('');
  console.error('Error details:');
  console.error('  Message:', error.message);
  if (error.response) {
    console.error('  Response:', error.response);
  }
  if (error.responseCode) {
    console.error('  Response Code:', error.responseCode);
  }
  console.error('');
  console.error('Full error:', error);
  process.exit(1);
}

