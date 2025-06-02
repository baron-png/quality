const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Generate an access token.
 * @param {Object} payload - The payload to include in the token.
 * @param {string} secret - The secret key to sign the token.
 * @param {string} [expiresIn='15m'] - The expiration time for the token.
 * @returns {string} - The signed JWT access token.
 */
const generateAccessToken = (payload, secret, expiresIn = '15m') => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Generate a refresh token and store it in the database.
 * @param {Object} payload - The payload to include in the token.
 * @param {string} secret - The secret key to sign the token.
 * @param {string} [expiresIn='7d'] - The expiration time for the token.
 * @returns {string} - The signed JWT refresh token.
 */
const generateRefreshToken = async (payload, secret, expiresIn = '7d') => {
  let token;
  let attempts = 0;

  while (attempts < 3) {
    token = jwt.sign(payload, secret, { expiresIn });

    try {
      // Attempt to store the refresh token in the database
      await prisma.refreshToken.create({
        data: {
          token, // Ensure this is a string
          userId: payload.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // expires in 7 days
        },
      });
      return token; // Return the string token if successful
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('token')) {
        // Unique constraint violation on the `token` field
        console.warn('Duplicate token generated, retrying...');
        attempts++;
      } else {
        throw error; // Re-throw other errors
      }
    }
  }

  throw new Error('Failed to generate a unique refresh token after 3 attempts');
};

/**
 * Verify a token.
 * @param {string} token - The token to verify.
 * @param {string} secret - The secret key to verify the token.
 * @returns {Object} - The decoded token payload.
 * @throws {Error} - If the token is invalid or expired.
 */
const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

/**
 * Refresh an access token using a refresh token.
 * @param {string} refreshToken - The refresh token.
 * @param {string} secret - The secret key to verify the refresh token.
 * @param {string} accessTokenSecret - The secret key to sign the new access token.
 * @returns {string} - The new access token.
 * @throws {Error} - If the refresh token is invalid or expired.
 */
const refreshAccessToken = async (refreshToken, secret, accessTokenSecret) => {
  const decoded = jwt.verify(refreshToken, secret);

  // Retrieve the refresh token from the database
  const storedRefreshToken = await prisma.refreshToken.findFirst({
    where: { userId: decoded.userId, token: refreshToken, expiresAt: { gt: new Date() } },
  });

  if (!storedRefreshToken) {
    throw new Error('Invalid or expired refresh token');
  }

  // Generate a new access token
  return generateAccessToken(
    { userId: decoded.userId, roleNames: decoded.roleNames, tenantId: decoded.tenantId },
    accessTokenSecret
  );
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken, refreshAccessToken };
