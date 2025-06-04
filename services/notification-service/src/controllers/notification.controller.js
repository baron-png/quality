const { prisma } = require('../config/db');
const { getIO } = require('../services/websocket');
const logger = require('../utils/logger');

const syncDocument = async (payload) => {
  const { id, title, tenantId, filePath, category, version, revision, description, createdBy, createdAt } = payload;
  try {
    const document = await prisma.document.upsert({
      where: { id },
      update: { title, tenantId, filePath, category, version, revision, description, createdBy, createdAt: new Date(createdAt) },
      create: {
        id,
        title,
        tenantId,
        filePath,
        category,
        version,
        revision,
        description,
        createdBy,
        createdAt: new Date(createdAt),
      },
    });

    const io = getIO();
    const notificationPayload = {
      id,
      title,
      tenantId,
      message: `A new policy document "${title}" has been published.`,
    };
    io.to(`tenant:${tenantId}`).emit('documentPublished', notificationPayload);
    logger.info('documentPublished event emitted:', notificationPayload);

    // Store notification in database
    await prisma.notification.create({
      data: {
        title: `New Document: ${title}`,
        message: notificationPayload.message,
        type: 'DOCUMENT_PUBLISHED',
        priority: 'MEDIUM',
        tenantId,
        documentId: id,
      },
    });

    logger.info(`Document synchronized and notification stored: ${id}`);
    return document;
  } catch (error) {
    logger.error('Error synchronizing document:', error);
    throw error;
  }
};

const syncChangeRequest = async (payload) => {
  const { id, documentId, proposerId, departmentId, tenantId, section, justification, status, createdAt } = payload;
  try {
    const changeRequest = await prisma.changeRequest.upsert({
      where: { id },
      update: { documentId, proposerId, departmentId, tenantId, section, justification, status, createdAt: new Date(createdAt) },
      create: {
        id,
        documentId,
        proposerId,
        departmentId,
        tenantId,
        section,
        justification,
        status,
        createdAt: new Date(createdAt),
      },
    });

    const io = getIO();
    const notificationPayload = {
      id,
      documentId,
      tenantId,
      message: `A new change request (ID: ${id}) for document ${documentId} was submitted.`,
    };
    io.to(`tenant:${tenantId}`).emit('changeRequestSubmitted', notificationPayload);
    logger.info('changeRequestSubmitted event emitted:', notificationPayload);

    // Store notification in database
    await prisma.notification.create({
      data: {
        title: `New Change Request: ${id}`,
        message: notificationPayload.message,
        type: 'CHANGE_REQUEST',
        priority: 'HIGH',
        tenantId,
        changeRequestId: id,
        userId: proposerId,
      },
    });

    logger.info(`Change request synchronized and notification stored: ${id}`);
    return changeRequest;
  } catch (error) {
    logger.error('Error synchronizing change request:', error);
    throw error;
  }
};

const syncDepartment = async (req, res) => {
  const { id, name, code, tenantId, createdBy, headId } = req.body;

  try {
    // Validate payload
    if (!id || !name || !tenantId || !createdBy) {
      return res.status(400).json({ error: 'ID, name, tenantId, and createdBy are required' });
    }

    const department = await prisma.department.upsert({
      where: { id },
      update: { name, code, tenantId, headId, createdBy },
      create: {
        id,
        name,
        code,
        tenantId,
        createdBy,
        headId,
      },
    });

    const io = getIO();
    const notificationPayload = {
      id,
      name,
      tenantId,
      message: `A new department "${name}" has been created.`,
    };
    io.to(`tenant:${tenantId}`).emit('departmentCreated', notificationPayload);
    logger.info('departmentCreated event emitted:', notificationPayload);

    // Store notification in database
    await prisma.notification.create({
      data: {
        title: `New Department: ${name}`,
        message: notificationPayload.message,
        type: 'DEPARTMENT_CREATED',
        priority: 'MEDIUM',
        tenantId,
        userId: headId || null,
      },
    });

    logger.info(`Department synchronized and notification stored: ${id}`);
    res.status(200).json({ message: 'Department synchronized successfully', department });
  } catch (error) {
    logger.error('Error synchronizing department:', error);
    res.status(500).json({ error: 'Failed to synchronize department' });
  }
};

const createNotification = async (req, res) => {
  const { userId, tenantId } = req.user;
  const { title, message, type, priority, targetUserId, documentId, changeRequestId, link } = req.body;

  try {
    const notification = await prisma.notification.create({
  data: {
    title,
    message,
    type,
    priority,
    userId: targetUserId || null,
    tenantId,
    documentId: documentId || null,
    changeRequestId: changeRequestId || null,
    link: link || null,
  },
});

    const io = getIO();
    io.to(`tenant:${tenantId}`).emit('notificationCreated', notification);
    logger.info(`Notification created by user ${userId} for tenant ${tenantId}`, { notification });
    res.status(201).json({ message: 'Notification created successfully', notification });
  } catch (error) {
    logger.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};



const getUserNotifications = async (req, res) => {
  const { userId, tenantId } = req.user;
  const { page = 1, limit = 10, unreadOnly = false } = req.query;

  try {
    const skip = (page - 1) * limit;
    const where = {
      tenantId,
      OR: [{ userId }, { userId: null }],
      tenantId,
    };
    if (unreadOnly) where.read = false;

    const [
      notifications,
      total,
    ] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: Number(skip),
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
    ]);

    logger.info(`Fetched notifications for user ${userId}`, { count: notifications.length, page, limit });
    res.status(200).json({
      notifications,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    logger.error(`Error fetching notifications for user ${userId}:`, error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  const { userId, tenantId } = req.user;

  try {
    const updatedCount = await prisma.notification.updateMany({
      where: { tenantId, userId, read: false },
      data: { read: true },
    });

    logger.info(`Marked ${updatedCount.count} notifications as read for user ${userId}`);
    res.status(200).json({ message: `${updatedCount.count} notifications marked as read` });
  } catch (error) {
    logger.error(`Error marking all notifications as read for user ${userId}:`, error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

const syncTenant = async (req, res) => {
  const { id, name, domain, email, type, createdBy } = req.body;

  try {
    const tenant = await prisma.tenant.upsert({
      where: { id },
      update: { name, domain, email, type },
      create: {
        id,
        name,
        domain,
        email,
        type,
        createdBy: createdBy || 'system',
      },
    });

    logger.info(`Tenant synchronized: ${id}`);
    res.status(200).json({ message: 'Tenant synchronized successfully', tenant });
  } catch (error) {
    logger.error('Error synchronizing tenant:', error);
    res.status(500).json({ error: 'Failed to synchronize tenant' });
  }
};

const syncUser = async (req, res) => {
  const { id, email, tenantId, roleIds, departmentId, password } = req.body;

  try {
    const user = await prisma.user.upsert({
      where: { id },
      update: {
        email,
        tenantId,
        departmentId: departmentId || null,
      },
      create: {
        id,
        email,
        tenantId,
        departmentId: departmentId || null,
        password: password || 'default_password',
      },
    });

    logger.info(`User synchronized: ${id}`);
    res.status(200).json({ message: 'User synchronized successfully', user });
  } catch (error) {
    logger.error('Error synchronizing user:', error);
    res.status(500).json({ error: 'Failed to synchronize user' });
  }
};

const syncRole = async (req, res) => {
  const { id, name, description, tenantId } = req.body;

  try {
    const role = await prisma.role.upsert({
      where: { id },
      update: { name, description, tenantId },
      create: { id, name, description, tenantId },
    });

    logger.info(`Role synchronized: ${id}`);
    res.status(200).json({ message: 'Role synchronized successfully', role });
  } catch (error) {
    logger.error('Error synchronizing role:', error);
    res.status(500).json({ error: 'Failed to synchronize role' });
  }
};

module.exports = {
  getUserNotifications,
  syncChangeRequest,
  markAllNotificationsAsRead,
  createNotification,
  syncTenant,
  syncUser,
  syncRole,
  syncDepartment,
  syncDocument,
};
