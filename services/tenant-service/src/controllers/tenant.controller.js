const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();


const prisma = new PrismaClient();

// Middleware to authenticate and extract userId from JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = {
      userId: decoded.userId,
      roleNames: decoded.roleNames, // Now an array of role names
      tenantId: decoded.tenantId,
    };
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware to restrict access to Super Admin
const restrictToSuperAdmin = (req, res, next) => {
  if (!req.user?.roleNames?.includes('SUPER_ADMIN')) {
    return res.status(403).json({ error: 'Super Admin access required' });
  }
  next();
};

// Updated required roles reflecting the new enum
const REQUIRED_ROLES = [
  'TRAINEE',
  'TRAINER',
  'HOD',
  'ADMIN',
  'REGISTRAR',
  'STAFF',
  'SUPER_ADMIN',
  'MANAGEMENT_REP',
  'AUDITOR',
];
const createTenant = async (req, res) => {
  const {
    name,
    domain,
    logoUrl,
    address,
    city,
    state,
    country,
    phone,
    email,
    type,
    accreditationNumber,
    establishedYear,
    timezone,
    currency,
    status,
    adminUser,
  } = req.body;

  const allowedTypes = ['UNIVERSITY', 'COLLEGE', 'SCHOOL', 'INSTITUTE', 'OTHER'];
  if (!allowedTypes.includes(type?.toUpperCase())) {
    return res.status(400).json({ error: `Invalid type. Allowed values are: ${allowedTypes.join(', ')}` });
  }

  if (!name || !domain || !email || !type || !adminUser) {
    return res.status(400).json({ error: 'Name, domain, email, type, and adminUser are required' });
  }

  const { email: adminEmail, firstName, lastName, password } = adminUser;
  if (!adminEmail || !firstName || !lastName || !password) {
    return res.status(400).json({ error: 'Admin user details (email, firstName, lastName, password) are required' });
  }

  let tenant;
  try {
    console.log('Starting tenant creation process...');

    // Step 1: Create the tenant in the database
    tenant = await prisma.tenant.create({
      data: {
        name,
        domain,
        logoUrl,
        address,
        city,
        state,
        country,
        phone,
        email,
        type: type.toUpperCase(),
        accreditationNumber,
        establishedYear: parseInt(establishedYear, 10),
        timezone,
        currency,
        status: status || 'PENDING',
        createdBy: req.user.userId, // Super Admin ID
      },
    });
    console.log('Tenant created successfully:', tenant);

    // Step 2: Synchronize the tenant with the auth-service
    try {
      const tenantSyncResponse = await axios.post(
        `${process.env.AUTH_SERVICE_URL || 'http://localhost:5000/api'}/tenants`,
        {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
          email: tenant.email,
          type: tenant.type,
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('Tenant synchronized with auth-service:', tenantSyncResponse.data);
    } catch (syncError) {
      console.error('Failed to synchronize tenant with auth-service:', syncError.response?.data || syncError.message);
      throw new Error('Failed to synchronize tenant with auth-service');
    }

    // Step 3: Create the ADMIN role for the tenant
    const adminRole = await prisma.role.create({
      data: {
        name: 'ADMIN',
        description: 'Administrator role for the tenant',
        tenantId: tenant.id,
      },
    });
    console.log('Admin role created successfully:', adminRole);

    // Step 4: Synchronize the role with the auth-service
    try {
      const roleSyncResponse = await axios.post(
        `${process.env.AUTH_SERVICE_URL || 'http://localhost:5000/api'}/roles`,
        {
          id: adminRole.id,
          name: 'ADMIN',
          description: 'Administrator role for the tenant',
          tenantId: tenant.id,
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('Role synchronized with auth-service:', roleSyncResponse.data);
    } catch (roleSyncError) {
      console.error('Failed to synchronize role with auth-service:', roleSyncError.response?.data || roleSyncError.message);
      throw new Error('Failed to synchronize role with auth-service');
    }

    // Step 5: Hash the admin user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    let adminId;
    try {
      // Step 6: Register the admin user in the auth-service
      const authResponse = await axios.post(
        `${process.env.AUTH_SERVICE_URL || 'http://localhost:5000/api'}/register`,
        {
          email: adminEmail,
          password,
          roleIds: [adminRole.id],
          tenantId: tenant.id,
          tenantName: name,
          firstName,
          lastName,
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('Admin user registered in auth-service:', authResponse.data);
      adminId = authResponse.data.user.id;
    } catch (authError) {
      console.error('Error registering admin user in auth-service:', {
        message: authError.message,
        response: authError.response?.data || 'No response data',
        status: authError.response?.status || 'No status code',
      });
      throw new Error('Failed to register admin user in auth-service');
    }

    // Step 7: Create the admin user in the tenant-service database
    const admin = await prisma.user.create({
      data: {
        id: adminId,
        email: adminEmail,
        firstName,
        lastName,
        password: hashedPassword,
        tenantId: tenant.id,
        verified: true,
        createdBy: req.user.userId,
      },
    });
    console.log('Admin user created successfully in tenant-service database:', admin);

    // Step 8: Assign the ADMIN role in tenant-service via UserRole
    await prisma.userRole.create({
      data: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    });
    console.log('ADMIN role assigned to user in tenant-service');

    // Step 9: Notify the document-service about the new tenant
    try {
      const documentResponse = await axios.post(
        `${process.env.DOCUMENT_SERVICE_URL || 'https://www.dualdimension.org/document/api'}/tenants`, // Fixed syntax
        {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
          email: tenant.email,
          type: tenant.type,
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('Tenant synchronized with document-service:', documentResponse.data);
    } catch (syncError) {
      console.error('Failed to synchronize tenant with document-service:', syncError.response?.data || syncError.message);
      return res.status(500).json({ error: 'Failed to synchronize tenant with document-service' });
    }

    // Step 10: Notify the notification-service about the new tenant
    
    try {
      const notificationResponse = await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL || 'http://172.31.14.8:5006/api'}/tenants`,
        {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
          email: tenant.email,
          type: tenant.type,
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('Tenant synchronized with notification-service:', notificationResponse.data);
    } catch (syncError) {
      console.error('Failed to synchronize tenant with notification-service:', syncError.response?.data || syncError.message);
      return res.status(500).json({ error: 'Failed to synchronize tenant with notification-service' });
    }
    

    // Step 11: Notify the notification-service about the admin user
    
    try {
      const notificationResponse = await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL || 'http://172.31.14.8:5006/api'}/users`,
        {
          id: admin.id,
          email: admin.email,
          tenantId: admin.tenantId,
          roleIds: [adminRole.id],
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('Admin user synchronized with notification-service:', notificationResponse.data);
    } catch (syncError) {
      console.error('Failed to synchronize admin user with notification-service:', syncError.response?.data || syncError.message);
      return res.status(500).json({ error: 'Failed to synchronize admin user with notification-service' });
    }
    

    res.status(201).json({ tenant, admin });
  } catch (error) {
    console.error('Error during tenant creation:', error);
    if (tenant) {
      await prisma.tenant.delete({ where: { id: tenant.id } }).catch(() => {});
    }
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};
const createDepartment = async (req, res) => {
  const { tenantId } = req.params;
  const { name, code, head } = req.body;

  console.log('Starting department creation process...');
  console.log('Request body:', req.body);

  // Validation for required fields
  if (!name || !code || !head || !head.email || !head.firstName || !head.lastName || !head.password) {
    return res.status(400).json({ error: 'Department name, code, and head details (email, firstName, lastName, password) are required.' });
  }

  let department;
  let headRole;
  let headUser;
  try {
    // Step 1: Validate tenant
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found.' });
    }
    console.log('Tenant found:', tenant);

    // Step 2: Check for existing department
    const existingDepartment = await prisma.department.findFirst({
      where: { tenantId, OR: [{ name }, { code }] },
    });
    if (existingDepartment) {
      return res.status(400).json({ error: 'Department name or code already exists for this tenant.' });
    }

    // Step 3: Find or create the HEAD role for the tenant
    headRole = await prisma.role.findFirst({
      where: {
        name: 'HEAD',
        tenantId: tenant.id,
      },
    });

    if (!headRole) {
      headRole = await prisma.role.create({
        data: {
          name: 'HEAD',
          description: 'Head of Department role',
          tenantId: tenant.id,
        },
      });
      console.log('HEAD role created successfully:', headRole);
    } else {
      console.log('Existing HEAD role found:', headRole);
    }

    // Step 4: Synchronize the HEAD role with the auth-service
    try {
      const roleUrl = `${process.env.AUTH_SERVICE_URL || 'https://www.dualdimension.org/auth/api'}/roles`;
      console.log('Auth-service role sync URL:', roleUrl);
      const roleSyncResponse = await axios.post(
        roleUrl,
        {
          id: headRole.id,
          name: 'HEAD',
          description: 'Head of Department role',
          tenantId: tenant.id,
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('HEAD role synchronized with auth-service:', roleSyncResponse.data);
    } catch (roleSyncError) {
      console.error('Failed to synchronize HEAD role with auth-service:', roleSyncError.response?.data || roleSyncError.message);
      throw new Error('Failed to synchronize HEAD role with auth-service');
    }

    // Step 5: Register the HoD user in the auth-service
    let headId;
    try {
      const authUrl = `${process.env.AUTH_SERVICE_URL || 'https://www.dualdimension.org/auth/api'}/register`;
      console.log('Auth-service user registration URL:', authUrl);
      const authResponse = await axios.post(
        authUrl,
        {
          email: head.email,
          password: head.password,
          roleIds: [headRole.id],
          tenantId: tenant.id,
          tenantName: tenant.name,
          firstName: head.firstName,
          lastName: head.lastName,
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('HoD user registered in auth-service:', authResponse.data);
      headId = authResponse.data.user.id;
    } catch (authError) {
      console.error('Error registering HoD user in auth-service:', {
        message: authError.message,
        response: authError.response?.data || 'No response data',
        status: authError.response?.status || 'No status code',
      });
      throw new Error('Failed to register HoD user in auth-service');
    }

    // Step 6: Create the HoD user in the tenant-service database
    const hashedPassword = await bcrypt.hash(head.password, 10);
    headUser = await prisma.user.create({
      data: {
        id: headId,
        email: head.email,
        firstName: head.firstName,
        lastName: head.lastName,
        password: hashedPassword,
        tenantId: tenant.id,
        verified: true,
        createdBy: req.user.userId,
      },
    });
    console.log('HoD user created successfully in tenant-service database:', headUser);

    // Step 7: Synchronize the HoD user with the document-service
    try {
      const documentUserUrl = `${process.env.DOCUMENT_SERVICE_URL || 'https://www.dualdimension.org/document/api'}/users`;
      console.log('Document-service user sync URL:', documentUserUrl);
      const documentUserResponse = await axios.post(
        documentUserUrl,
        {
          id: headUser.id,
          email: headUser.email,
          firstName: headUser.firstName,
          lastName: headUser.lastName,
          tenantId: headUser.tenantId,
          createdBy: headUser.createdBy,
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('HoD user synchronized with document-service:', documentUserResponse.data);
    } catch (syncError) {
      console.error('Failed to synchronize HoD user with document-service:', syncError.response?.data || syncError.message);
      throw new Error('Failed to synchronize HoD user with document-service');
    }

    // Step 8: Assign the HEAD role in tenant-service via UserRole
    await prisma.userRole.create({
      data: {
        userId: headUser.id,
        roleId: headRole.id,
      },
    });
    console.log('HEAD role assigned to HoD in tenant-service');

    // Step 9: Create the department in the tenant-service database with headId
    department = await prisma.department.create({
      data: {
        name,
        code,
        tenantId,
        headId: headUser.id,
        createdBy: req.user.userId,
      },
    });
    console.log('Department created successfully:', department);

    // Step 10: Synchronize the department with the auth-service
    try {
      const authUrl = `${process.env.AUTH_SERVICE_URL || 'https://www.dualdimension.org/auth/api'}/departments`;
      console.log('Auth-service department sync URL:', authUrl);
      const authResponse = await axios.post(
        authUrl,
        {
          id: department.id,
          name: department.name,
          code: department.code,
          tenantId: department.tenantId,
          createdBy: department.createdBy,
          headId: department.headId,
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('Department synchronized with auth-service:', authResponse.data);
    } catch (syncError) {
      console.error('Failed to synchronize department with auth-service:', syncError.response?.data || syncError.message);
      throw new Error('Failed to synchronize department with auth-service');
    }

    // Step 11: Synchronize the department with the document-service
    try {
      const documentUrl = `${process.env.DOCUMENT_SERVICE_URL || 'https://www.dualdimension.org/document/api'}/departments`;
      console.log('Document-service sync URL:', documentUrl);
      const documentPayload = {
        id: department.id,
        name: department.name,
        code: department.code,
        tenantId: department.tenantId,
        createdBy: department.createdBy,
        headId: department.headId,
      };
      console.log('Document-service sync payload:', documentPayload);
      const documentResponse = await axios.post(
        documentUrl,
        documentPayload,
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('Department synchronized with document-service:', documentResponse.data);
    } catch (syncError) {
      console.error('Failed to synchronize department with document-service:', syncError.response?.data || syncError.message);
      throw new Error('Failed to synchronize department with document-service');
    }

    // Step 12: Synchronize the HoD user with the notification-service
    try {
      const notificationUserUrl = `${process.env.NOTIFICATION_SERVICE_URL || 'http://172.31.14.8:5006/api'}/users`;
      console.log('Notification-service user sync URL:', notificationUserUrl);
      const notificationUserResponse = await axios.post(
        notificationUserUrl,
        {
          id: headUser.id,
          email: headUser.email,
          firstName: headUser.firstName,
          lastName: headUser.lastName,
          tenantId: headUser.tenantId,
          roleIds: [headRole.id],
          createdBy: headUser.createdBy,
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('HoD user synchronized with notification-service:', notificationUserResponse.data);
    } catch (syncError) {
      console.error('Failed to synchronize HoD user with notification-service:', syncError.response?.data || syncError.message);
      throw new Error('Failed to synchronize HoD user with notification-service');
    }

    // Step 13: Synchronize the department with the notification-service
    try {
      const notificationUrl = `${process.env.NOTIFICATION_SERVICE_URL || 'http://172.31.14.8:5006/api'}/departments`;
      console.log('Notification-service sync URL:', notificationUrl);
      const notificationPayload = {
        id: department.id,
        name: department.name,
        code: department.code,
        tenantId: department.tenantId,
        createdBy: department.createdBy,
        headId: department.headId,
      };
      console.log('Notification-service sync payload:', notificationPayload);
      const notificationResponse = await axios.post(
        notificationUrl,
        notificationPayload,
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('Department synchronized with notification-service:', notificationResponse.data);
    } catch (syncError) {
      console.error('Failed to synchronize department with notification-service:', syncError.response?.data || syncError.message);
      throw new Error('Failed to synchronize department with notification-service');
    }

    // Step 14: Respond to the client
    res.status(201).json({ message: 'Department created successfully.', department, head: headUser });
  } catch (error) {
    console.error('Error during department creation:', error);
    // Rollback if any step fails
    if (department) {
      await prisma.department.delete({ where: { id: department.id } }).catch((rollbackError) => {
        console.error('Rollback failed:', rollbackError);
      });
    }
    if (headUser) {
      await prisma.user.delete({ where: { id: headUser.id } }).catch((rollbackError) => {
        console.error('Rollback failed:', rollbackError);
      });
    }
    if (headRole && !headRole.id) { // Only delete if newly created
      await prisma.role.delete({ where: { id: headRole.id } }).catch((rollbackError) => {
        console.error('Rollback failed:', rollbackError);
      });
    }
    res.status(500).json({ error: 'Internal server error.' });
  }
};
const createRole = async (req, res) => {
  const { tenantId } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Role name is required.' });
  }

  try {
    // Step 1: Validate tenant
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found.' });
    }

    // Step 2: Check if a role with the same name already exists for the tenant
    const existingRole = await prisma.role.findFirst({
      where: { name, tenantId },
    });
    if (existingRole) {
      return res.status(400).json({ error: 'Role with the same name already exists for this tenant.' });
    }

    // Step 3: Create the role in the tenant-service database
    const role = await prisma.role.create({
      data: { name, description, tenantId },
    });
    console.log('Role created successfully in tenant-service:', role);

    // Step 4: Synchronize the role with the auth-service
    try {
      const authResponse = await axios.post(
        `${process.env.AUTH_SERVICE_URL || 'https://www.dualdimension.org/api'}/roles`,
        {
          id: role.id,
          name: role.name,
          description: role.description,
          tenantId: role.tenantId,
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('Role synchronized with auth-service:', authResponse.data);
    } catch (syncError) {
      console.error('Failed to synchronize role with auth-service:', syncError.response?.data || syncError.message);
      // Rollback the role creation in the tenant-service
      await prisma.role.delete({ where: { id: role.id } });
      return res.status(500).json({ error: 'Failed to synchronize role with auth-service' });
    }

    // Step 5: Synchronize the role with the notification-service
    /*
    try {
      const notificationResponse = await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5006'}/api/roles`,
        {
          id: role.id,
          name: role.name,
          description: role.description,
          tenantId: role.tenantId,
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('Role synchronized with notification-service:', notificationResponse.data);
    } catch (syncError) {
      console.error('Failed to synchronize role with notification-service:', syncError.response?.data || syncError.message);
      // Rollback the role creation in the tenant-service
      await prisma.role.delete({ where: { id: role.id } });
      return res.status(500).json({ error: 'Failed to synchronize role with notification-service' });
    }
    */

    // Step 6: Notify the document-service about the new role
    try {
      const documentResponse = await axios.post(
        `${process.env.DOCUMENT_SERVICE_URL || 'https://www.dualdimension.org/api'}/roles`,
        {
          id: role.id,
          name: role.name,
          description: role.description,
          tenantId: role.tenantId,
        },
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('Role synchronized with document-service:', documentResponse.data);
    } catch (syncError) {
      console.error('Failed to synchronize role with document-service:', syncError.response?.data || syncError.message);
      return res.status(500).json({ error: 'Failed to synchronize role with document-service' });
    }

    res.status(201).json({ message: 'Role created successfully.', role });
  } catch (error) {
    console.error('Error during role creation:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const createUser = async (req, res) => {
  const { tenantId } = req.user;
  const { email, roleIds, firstName, lastName, password, departmentId } = req.body;

  console.log('Creating user. Request body:', req.body);

  if (!email || !roleIds || !Array.isArray(roleIds) || roleIds.length === 0 || !firstName || !lastName || !password) {
    console.log('Validation failed. Missing or invalid fields:', { email, roleIds, firstName, lastName, password });
    return res.status(400).json({ error: 'Email, roleIds (array), firstName, lastName, and password are required' });
  }

  let user;
  try {
    // Step 1: Validate tenant
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    // Step 2: Validate roleIds and sync roles to document-service
    const roles = await prisma.role.findMany({
      where: { id: { in: roleIds }, tenantId },
    });
    if (roles.length !== roleIds.length) {
      console.log('Invalid roleIds:', roleIds, 'Found roles:', roles);
      return res.status(400).json({ error: 'One or more roleIds are invalid or do not belong to this tenant' });
    }

    // Sync roles to document-service
    for (const role of roles) {
      try {
        const documentRoleResponse = await axios.post(
          `${process.env.DOCUMENT_SERVICE_URL || 'https://www.dualdimension.org/document/api'}/roles`,
          {
            id: role.id,
            name: role.name,
            tenantId: role.tenantId,
          },
          { headers: { Authorization: req.headers.authorization } }
        );
        console.log(`Role ${role.name} synchronized with document-service:`, documentRoleResponse.data);
      } catch (syncError) {
        console.error(`Failed to synchronize role ${role.name} with document-service:`, syncError.response?.data || syncError.message);
        throw new Error(`Failed to synchronize role ${role.name} with document-service`);
      }
    }

    // Step 3: Register the user in the auth-service
    let userId;
    try {
      const registerPayload = {
        email,
        password,
        roleIds,
        tenantId,
        tenantName: tenant.name,
        firstName,
        lastName,
        departmentId,
      };
      console.log('Payload to auth-service for user registration:', registerPayload);
      const authResponse = await axios.post(
        `${process.env.AUTH_SERVICE_URL || 'https://www.dualdimension.org/api'}/register`,
        registerPayload,
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('User registered in auth-service:', authResponse.data);
      userId = authResponse.data.user.id;
    } catch (registerError) {
      console.error('Error registering user in auth-service:', {
        message: registerError.message,
        response: registerError.response?.data || 'No response data',
        status: registerError.response?.status || 'No status code',
      });
      throw new Error('Failed to register user in auth-service');
    }

    // Step 4: Create the user in the tenant-service database
    user = await prisma.user.create({
      data: {
        id: userId,
        email,
        firstName,
        lastName,
        password: await bcrypt.hash(password, 10),
        tenantId,
        departmentId: departmentId || null,
        verified: false,
        createdBy: req.user.userId,
      },
    });
    console.log('User created in tenant-service:', user);

    // Step 5: Assign roles in the tenant-service database
    const userRoleData = roleIds.map((roleId) => ({ userId, roleId }));
    await prisma.userRole.createMany({
      data: userRoleData,
      skipDuplicates: true,
    });
    console.log('Roles assigned to user in tenant-service:', userRoleData);

    // Step 6: Synchronize user with document-service
    try {
      const syncPayload = {
        id: userId,
        email,
        firstName,
        lastName,
        tenantId,
        createdBy: req.user.userId,
        roleIds,
        departmentId: departmentId || null,
      };
      console.log('Payload to document-service for user sync:', syncPayload);
      const documentResponse = await axios.post(
        `${process.env.DOCUMENT_SERVICE_URL || 'https://www.dualdimension.org/document/api'}/users`,
        syncPayload,
        { headers: { Authorization: req.headers.authorization } }
      );
      console.log('User synchronized with document-service:', documentResponse.data);
    } catch (syncError) {
      console.error('Failed to synchronize user with document-service:', {
        message: syncError.message,
        response: syncError.response?.data || 'No response data',
        status: syncError.response?.status || 'No status code',
      });
      throw new Error('Failed to synchronize user with document-service');
    }

    // Step 7: Fetch updated user with roles
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              select: { id: true, name: true },
            },
          },
        },
        department: true,
        tenant: true,
      },
    });

    // Step 8: Respond to the client
    res.status(201).json({
      message: 'User created successfully',
      user: {
        ...updatedUser,
        roles: updatedUser.userRoles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    // Rollback if user was created
    if (user) {
      await prisma.user.delete({ where: { id: user.id } }).catch((rollbackError) => {
        console.error('Rollback failed:', rollbackError);
      });
    }
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};
const getAllTenants = async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: { users: true, departments: { include: { head: true } } },
    });
    res.status(200).json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
};

const deleteTenant = async (req, res) => {
  const { tenantId } = req.params;

  try {
    const tenant = await prisma.tenant.delete({
      where: { id: tenantId },
    });
    res.status(200).json({ message: 'Tenant deleted successfully', tenant });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
};

const getUsers = async (req, res) => {
  const { tenantId, roleId } = req.params;

  try {
    // Validate tenantId
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Build the query
    const query = {
      where: { tenantId },
      include: {
        role: true, // Include role details
      },
    };

    // Add roleId filter if provided
    if (roleId) {
      query.where.roleId = roleId;
    }

    // Fetch users from the database
    const users = await prisma.user.findMany(query);
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found for the specified criteria' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getTenantById = async (req, res) => {
  const { tenantId } = req.params;

  try {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    res.status(200).json(tenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      where: { tenantId: req.user.tenantId },
      select: {
        id: true,
        name: true,
        description: true,
        tenantId: true,
      },
    });

    if (roles.length === 0) {
      return res.status(404).json({ message: 'No roles found for the tenant' });
    }

    res.status(200).json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error.message);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

const getTenantDetails = async (req, res) => {
  const { tenantId } = req.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        departments: {
          include: {
            head: true,
          },
        },
        roles: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found." });
    }

    res.status(200).json(tenant);
  } catch (error) {
    console.error("Error fetching tenant details:", error);
    res.status(500).json({ error: "Failed to fetch tenant details." });
  }
};

const completeProfile = async (req, res) => {
  const { tenantId } = req.user;
  const { departments, roles } = req.body;

  if (!departments || !roles) {
    return res.status(400).json({ error: "Departments and roles are required" });
  }

  try {
    const createdRoles = await Promise.all(
      roles.map(async (role) => {
        if (!role.name) throw new Error("Role name is required");
        return prisma.role.create({
          data: {
            name: role.name,
            description: role.description,
            tenantId,
          },
        });
      })
    );

    const createdDepartments = await Promise.all(
      departments.map(async (department) => {
        if (!department.name || !department.code || !department.head) {
          throw new Error("Department name, code, and head details are required");
        }

        const hashedPassword = await bcrypt.hash(department.head.password, 10);

        const headUser = await prisma.user.create({
          data: {
            email: department.head.email,
            firstName: department.head.firstName,
            lastName: department.head.lastName,
            password: hashedPassword,
            tenantId,
            verified: true,
          },
        });

        return prisma.department.create({
          data: {
            name: department.name,
            code: department.code,
            tenantId,
            headId: headUser.id,
            createdBy: req.user.userId,
          },
        });
      })
    );

    res.status(201).json({ message: "Profile completed successfully", roles: createdRoles, departments: createdDepartments });
  } catch (error) {
    console.error("Error completing profile:", error);
    res.status(500).json({ error: `Failed to complete profile: ${error.message}` });
  }
};

const getUserWithDepartment = async (req, res) => {
  const { tenantId, userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: true,
      },
    });

    if (!user || user.tenantId !== tenantId) {
      return res.status(404).json({ message: 'User not found or does not belong to this tenant' });
    }

    res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      department: user.department,
    });
  } catch (error) {
    console.error('Error fetching user with department:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};

module.exports = {
  createTenant: [authenticateToken, restrictToSuperAdmin, createTenant],
  getAllTenants,
  getTenantById,
  getUserWithDepartment,
  deleteTenant: [authenticateToken, restrictToSuperAdmin, deleteTenant],
  createUser: [authenticateToken, createUser],
  getRoles,
  getUsers,
  createRole,
  getTenantDetails,
  completeProfile: [authenticateToken, completeProfile],
  createDepartment,
};

// Cleanup on shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('Prisma disconnected');
  process.exit(0);
});