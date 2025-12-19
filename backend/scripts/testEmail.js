require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

(async () => {
  try {
    const to = process.argv[2] || process.env.EMAIL_USER;
    const res = await sendEmail(to, 'Test Email from VMS', 'This is a test email sent from the VMS testEmail.js script.');
    console.log('Email sent successfully', res.messageId);
    process.exit(0);
  } catch (err) {
    console.error('Email send failed in test script:', err);
    process.exit(1);
  }
})();
