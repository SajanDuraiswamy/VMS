const nodemailer = require("nodemailer");

async function sendEmail(to, subject, text, attachments = []) {
<<<<<<< HEAD
=======
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Missing EMAIL_USER or EMAIL_PASS in environment variables");
  }

>>>>>>> d205e47 (Remove node_modules and add to gitignore)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

<<<<<<< HEAD
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    attachments
  });
=======
  try {
    // verify transporter (helps detect auth failures early)
    await transporter.verify();
  } catch (verifyErr) {
    console.error("Email transporter verification failed:", verifyErr.message);
    // If configured, fallback to an ethereal test account for development
    if (process.env.EMAIL_FALLBACK === "true") {
      console.warn("EMAIL_FALLBACK=true: Switching to ethereal test SMTP account for debug");
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    } else {
      throw verifyErr;
    }
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      attachments,
    });
    // If using ethereal, log the preview URL
    if (process.env.EMAIL_FALLBACK === "true") {
      const preview = nodemailer.getTestMessageUrl(info);
      console.log(`Ethereal preview URL: ${preview}`);
    }
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("Failed to send email:", err.message);
    throw err;
  }
>>>>>>> d205e47 (Remove node_modules and add to gitignore)
}

module.exports = sendEmail;
