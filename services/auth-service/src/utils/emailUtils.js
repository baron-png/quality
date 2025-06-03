
const nodemailer = require('nodemailer');
const logger = require('./logger'); // Assuming you have a logger from notification-service

// Load environment variables
require('dotenv').config();

// Validate environment variables
if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
  throw new Error('EMAIL or EMAIL_PASSWORD environment variable is missing');
}

// Office 365 SMTP configuration (preferred for GoDaddy Professional Email)
const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL, // e.g., yourname@dualdimension.org
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true,
  logger: true,
});

// Fallback to legacy GoDaddy SMTP if Office 365 fails
// const transporter = nodemailer.createTransport({
//   host: 'smtpout.secureserver.net',
//   port: 465, // SSL
//   secure: true, // Use SSL
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASSWORD,
//   },
//   debug: true,
//   logger: true,
// });

const sendOTP = async (email) => {
  const otp = await generateOTP(email);
  try {
    const info = await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL}>`, // Sender name and email
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${otp}. It expires in 5 minutes.`,
      html: `<p>Your verification code is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`,
    });
    logger.info(`📩 OTP email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error('❌ Failed to send OTP email:', {
      error: err.message,
      stack: err.stack,
    });
    throw new Error('Failed to send OTP email.');
  }
};

const generateOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
  await storeOTP(email, otp, expiresAt);
  return otp;
};

const storeOTP = async (email, otp, expiresAt) => {
  // Placeholder: Implement database storage (e.g., Prisma)
  logger.info(`Storing OTP for ${email}: ${otp}, expires at ${new Date(expiresAt)}`);
  // Example with Prisma (uncomment if using):
  // await prisma.otp.create({
  //   data: { email, otp, expiresAt: new Date(expiresAt) },
  // });
};

const verifyOTP = async (email, otp) => {
  const storedData = await getStoredOTP(email);
  if (!storedData) {
    throw new Error('No OTP found for this email.');
  }
  const { storedOtp, expiresAt } = storedData;
  if (Date.now() > expiresAt) {
    throw new Error('OTP has expired.');
  }
  if (otp !== storedOtp) {
    throw new Error('Invalid OTP.');
  }
  logger.info(`✅ OTP verified for ${email}`);
};

const getStoredOTP = async (email) => {
  // Placeholder: Implement database retrieval
  logger.info(`Retrieving OTP for ${email}`);
  return null; // Replace with actual logic
  // Example with Prisma:
  // return prisma.otp.findFirst({ where: { email } });
};

module.exports = { sendOTP, verifyOTP };
