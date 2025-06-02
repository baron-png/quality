const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { prisma } = require('../prismaClient');
const { sendOTP } = require('../utils/emailUtils');
const { generateAccessToken, generateRefreshToken, verifyToken, refreshAccessToken } = require('../utils/jwtUtils');
const { validateOTP } = require('../utils/otpUtils');

const registerUser = async (email, password, roleIds, tenantId, tenantName, departmentId, firstName, lastName) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const roles = await prisma.role.findMany({ where: { id: { in: roleIds }, tenantId } });
  if (roles.length !== roleIds.length) {
    throw new Error('One or more roleIds are invalid or do not belong to this tenant');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      tenantId,
      tenantName,
      ...(departmentId && { headedDepartment: { connect: { id: departmentId } } }),
    },
  });

  const userRoleData = roleIds.map((roleId) => ({ userId: user.id, roleId }));
  await prisma.userRole.createMany({ data: userRoleData, skipDuplicates: true });

  await sendOTP(email);

  return {
    user,
    roles: roles.map((r) => ({ id: r.id, name: r.name })),
  };
};

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { userRoles: { include: { role: { select: { id: true, name: true } } } } },
  });
  if (!user) throw new Error('User not found');
  if (!user.verified) {
    await sendOTP(email);
    throw new Error('Email not verified. A new OTP has been sent to your email.');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new Error('Invalid credentials');

  const roleNames = user.userRoles.map((userRole) => userRole.role.name);
  const accessToken = generateAccessToken(
    { userId: user.id, roleNames, tenantId: user.tenantId },
    process.env.ACCESS_TOKEN_SECRET
  );

  // Generate a unique refresh token
  const refreshToken = await generateRefreshToken(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      roles: user.userRoles.map((userRole) => ({ id: userRole.role.id, name: userRole.role.name })),
      tenantId: user.tenantId,
      departmentId: user.departmentId,
      firstName: user.firstName,
      tenantName: user.tenantName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
};
const refreshAccessTokenService = async (refreshToken) => {
  return refreshAccessToken(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    process.env.ACCESS_TOKEN_SECRET
  );
};

const verifyOTPService = async (email, otp) => {
  const isValid = await validateOTP(email, otp); // Use otpUtils for validation
  if (!isValid) {
    throw new Error('Invalid or expired OTP');
  }
  await prisma.user.update({ where: { email }, data: { verified: true } });
};

const forgotPasswordService = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const token = crypto.randomBytes(20).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

  await prisma.resetPasswordTokens.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  return token;
};

const resetPasswordService = async (token, password) => {
  const resetToken = await prisma.resetPasswordTokens.findUnique({
    where: { token },
  });
  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new Error('Invalid or expired token');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  });

  // Delete the reset password token after use
  await prisma.resetPasswordTokens.delete({ where: { token } });
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessTokenService,
  verifyOTPService,
  forgotPasswordService,
  resetPasswordService,
};