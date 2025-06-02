require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const axios = require('axios');
const { sendOTP } = require('../utils/emailUtils');
const {
  registerUser,
  loginUser,
  refreshAccessTokenService,
  verifyOTPService,
  forgotPasswordService,
  resetPasswordService,
} = require('../services/authService');
const { getUserById, assignRolesToUser } = require('../services/userService');

const prisma = new PrismaClient();

// Logger utility for structured logging
const logger = {
  info: (msg, meta = {}) => console.log(JSON.stringify({ level: 'info', msg, ...meta })),
  error: (msg, meta = {}) => console.error(JSON.stringify({ level: 'error', msg, ...meta })),
};

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
});

exports.register = async (req, res) => {
  const { email, password, roleIds, tenantId, tenantName, firstName, lastName, departmentId } = req.body;

  if (!email || !password || !roleIds || !tenantId || !tenantName || !firstName || !lastName) {
    logger.error('Missing required fields for registration', { email });
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.error('User already exists', { email });
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const roles = await prisma.role.findMany({
      where: { id: { in: roleIds }, tenantId },
    });
    if (roles.length !== roleIds.length) {
      logger.error('Invalid roleIds or tenant mismatch', { roleIds, tenantId });
      return res.status(400).json({ message: 'One or more roleIds are invalid or do not belong to the specified tenant' });
    }

    if (departmentId) {
      const departmentExists = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!departmentExists) {
        logger.error('Invalid departmentId', { departmentId });
        return res.status(400).json({ message: 'Invalid departmentId. Department does not exist.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        tenantId,
        tenantName,
        firstName,
        lastName,
        departments: departmentId ? { connect: { id: departmentId } } : undefined,
      },
    });

    await prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId: user.id, roleId })),
    });

    const notifyDocumentService = async (attempt = 1) => {
      try {
        await axios.post(`${process.env.DOCUMENT_SERVICE_URL || 'http://document-service:5002'}/api/sync`, {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId,
          roleIds,
          departmentId,
        });
        logger.info('User synchronization request sent to document-service', { userId: user.id });
      } catch (syncError) {
        logger.error(`Failed to notify document-service (Attempt ${attempt})`, { error: syncError.message, userId: user.id });
        if (attempt < 3) {
          logger.info('Retrying to notify document-service', { userId: user.id, attempt: attempt + 1 });
          await notifyDocumentService(attempt + 1);
        } else {
          logger.error('Failed to notify document-service after 3 attempts', { userId: user.id });
        }
      }
    };

    await notifyDocumentService();
    logger.info('User registered successfully', { userId: user.id, email, tenantId });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    logger.error('Error during registration', { error: error.message, email });
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.createRole = async (req, res) => {
  const { id, name, description, tenantId } = req.body;
  try {
    if (!id || !name || !tenantId) {
      logger.error('Missing required fields for role creation', { id, name, tenantId });
      return res.status(400).json({ message: 'Role ID, name, and tenant ID are required' });
    }
    const role = await prisma.role.upsert({
      where: { id },
      update: { name, description, tenantId },
      create: { id, name, description, tenantId },
    });
    logger.info('Role created or updated successfully', { roleId: role.id, name, tenantId });
    res.status(201).json({ message: 'Role created or updated successfully', role });
  } catch (error) {
    logger.error('Error creating role', { error: error.message, id, tenantId });
    res.status(500).json({ message: 'Server error during role creation' });
  }
};

exports.getRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      logger.error('Role not found', { roleId: id });
      return res.status(404).json({ message: 'Role not found' });
    }
    logger.info('Role fetched successfully', { roleId: id });
    res.status(200).json(role);
  } catch (error) {
    logger.error('Error fetching role by ID', { error: error.message, roleId: id });
    res.status(500).json({ message: 'Server error while fetching role' });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      select: { id: true, name: true, description: true, tenantId: true },
    });
    logger.info('Roles fetched successfully', { roleCount: roles.length });
    res.json(roles);
  } catch (error) {
    logger.error('Error fetching roles', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching roles' });
  }
};

exports.assignRoles = async (req, res) => {
  const { email, roleIds } = req.body;
  try {
    const roles = await assignRolesToUser(email, roleIds);
    logger.info('Roles assigned successfully', { email, roleIds });
    res.status(200).json({ message: 'Roles assigned successfully', roles });
  } catch (error) {
    logger.error('Error assigning roles', { error: error.message, email, roleIds });
    res.status(400).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    await verifyOTPService(email, otp);
    logger.info('Account verified successfully', { email });
    res.json({ message: 'Account verified successfully' });
  } catch (error) {
    logger.error('Error during OTP verification', { error: error.message, email });
    res.status(400).json({ message: error.message });
  }
};

exports.syncTenant = async (req, res) => {
  const { id, name, domain, email, type } = req.body;

  if (!id || !name || !domain || !email || !type) {
    logger.error('Missing required fields for tenant synchronization', { id, name });
    return res.status(400).json({ message: 'Tenant ID, name, domain, email, and type are required' });
  }

  try {
    const tenant = await prisma.tenant.upsert({
      where: { id },
      update: { name, domain, email, type },
      create: { id, name, domain, email, type },
    });
    logger.info('Tenant synchronized successfully', { tenantId: tenant.id, name });
    res.status(201).json({ message: 'Tenant synchronized successfully', tenant });
  } catch (error) {
    logger.error('Error synchronizing tenant', { error: error.message, id, name });
    res.status(500).json({ message: 'Server error during tenant synchronization' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { accessToken, refreshToken, user } = await loginUser(email, password);
    logger.info('User logged in successfully', { userId: user.id, email });
    res.json({ accessToken, refreshToken, user });
  } catch (error) {
    logger.error('Error during login', { error: error.message, email });
    res.status(400).json({ message: error.message });
  }
};

// Get current user function
exports.getCurrentUser = async (req, res) => {
  try {
    // Step 1: Fetch user with roles and department data
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        verified: true,
        tenantId: true,
        tenantName: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: {
              select: { id: true, name: true },
            },
          },
        },
        departments: { // Fetch all departments the user is associated with
          select: {
            id: true,
            name: true,
            code: true,
            tenantId: true,
            createdBy: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        headedDepartment: { // Fetch department where user is head, if any
          select: {
            id: true,
            name: true,
            code: true,
            tenantId: true,
            createdBy: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      logger.error('User not found', { userId: req.user.userId });
      return res.status(404).json({ error: 'User not found' });
    }
    logger.info('User fetched from database', {
      userId: user.id,
      tenantId: user.tenantId,
      departmentCount: user.departments.length,
      isDepartmentHead: !!user.headedDepartment,
    });

    // Step 2: Transform roles for response
    const roles = user.userRoles.map((userRole) => ({
      id: userRole.role.id,
      name: userRole.role.name,
    }));

    // Step 3: Prepare response
    const response = {
      id: user.id,
      email: user.email,
      verified: user.verified,
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles,
      departments: user.departments, // Array of departments (empty if none)
      headedDepartment: user.headedDepartment || null, // Department where user is head, or null
    };

    logger.info('User details prepared', {
      userId: user.id,
      departmentIds: user.departments.map((d) => d.id),
      headedDepartmentId: user.headedDepartment?.id || null,
    });
    return res.status(200).json(response);
  } catch (error) {
    logger.error('Failed to fetch user details', { error: error.message, userId: req.user.userId });
    return res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const accessToken = await refreshAccessTokenService(refreshToken);
    logger.info('Access token refreshed successfully', { refreshToken: refreshToken.substring(0, 10) + '...' });
    res.json({ accessToken });
  } catch (error) {
    logger.error('Error during token refresh', { error: error.message });
    res.status(401).json({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  logger.info('User logged out (stateless)');
  res.json({ message: 'Logged out successfully (stateless)' });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const token = await forgotPasswordService(email);
    const resetLink = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset Link',
      text: `Click the link to reset your password: ${resetLink}`,
    });
    logger.info('Password reset link sent', { email });
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    logger.error('Error during forgot password', { error: error.message, email });
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    await resetPasswordService(token, password);
    logger.info('Password reset successfully', { token: token.substring(0, 10) + '...' });
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error('Error during password reset', { error: error.message });
    res.status(400).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await getUserById(id);
    logger.info('User fetched by ID', { userId: id });
    res.json(user);
  } catch (error) {
    logger.error('Error fetching user by ID', { error: error.message, userId: id });
    res.status(404).json({ message: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.error('User not found for OTP resend', { email });
      return res.status(400).json({ message: 'User not found' });
    }
    if (user.verified) {
      logger.error('User already verified', { email });
      return res.status(400).json({ message: 'User already verified' });
    }
    await sendOTP(email);
    logger.info('OTP resent successfully', { email });
    return res.json({ message: 'OTP resent successfully' });
  } catch (error) {
    logger.error('Error during OTP resend', { error: error.message, email });
    return res.status(500).json({ message: 'Server error during OTP resend' });
  }
};

exports.deleteAccount = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      logger.error('User not found for deletion', { userId });
      return res.status(404).json({ message: 'User not found' });
    }
    await prisma.user.delete({ where: { id: userId } });
    logger.info('Account deleted successfully', { userId });
    return res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    logger.error('Error during account deletion', { error: error.message, userId });
    return res.status(500).json({ message: 'Server error during account deletion' });
  }
};

exports.getUsersByRoleAndTenant = async (req, res) => {
  const { roleId, tenantId } = req.query;
  try {
    if (!roleId || !tenantId) {
      logger.error('Missing roleId or tenantId', { roleId, tenantId });
      return res.status(400).json({ message: 'Role ID and tenantId are required' });
    }
    const users = await prisma.user.findMany({
      where: { tenantId, userRoles: { some: { roleId } } },
      include: { userRoles: { include: { role: { select: { id: true, name: true } } } } },
    });
    const formattedUsers = users.map((user) => ({
      ...user,
      roles: user.userRoles.map((userRole) => ({ id: userRole.role.id, name: userRole.role.name })),
    }));
    logger.info('Users fetched by role and tenant', { roleId, tenantId, userCount: users.length });
    return res.json(formattedUsers);
  } catch (error) {
    logger.error('Error fetching users by role and tenant', { error: error.message, roleId, tenantId });
    return res.status(500).json({ message: 'Server error while fetching users' });
  }
};