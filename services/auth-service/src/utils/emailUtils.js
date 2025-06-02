const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.secureserver.net',
  port: 465, // or 587 for TLS
  secure: true, // use SSL/TLS
  auth: {
    user: process.env.EMAIL, // your email address
    pass: process.env.EMAIL_PASSWORD, // your email password
  },
});

const sendOTP = async (email) => {
  const otp = await generateOTP(email);
  try {
    await transporter.sendMail({
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${otp}. It expires in 5 minutes.`,
    });
    console.log(`📩 OTP email sent to ${email}`);
  } catch (err) {
    console.error('❌ Failed to send OTP email:', err);
    throw new Error('Failed to send OTP email.');
  }
};

const generateOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  const expiresAt = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

  // Store the OTP and its expiration time in the database (or in-memory store)
  await storeOTP(email, otp, expiresAt);

  return otp;
}


const storeOTP = async (email, otp, expiresAt) => {
  // Store the OTP and its expiration time in the database (or in-memory store)
  // This is a placeholder function. You should implement this according to your database logic.
  console.log(`Storing OTP for ${email}: ${otp}, expires at ${new Date(expiresAt)}`);
}



const verifyOTP = async (email, otp) => {
  // Retrieve the stored OTP and its expiration time from the database (or in-memory store)
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

  // OTP is valid, proceed with your logic (e.g., mark as verified, etc.)
  console.log(`✅ OTP verified for ${email}`);
}

const getStoredOTP = async (email) => {
  // Retrieve the stored OTP and its expiration time from the database (or in-memory store)
  // This is a placeholder function. You should implement this according to your database logic.
  console.log(`Retrieving OTP for ${email}`);
  return null; // Replace with actual retrieval logic
}


module.exports = {
  sendOTP,
  verifyOTP,
};