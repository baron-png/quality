
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { getPrismaClient, reconnectPrisma } from '../services/prisma';
import { randomUUID } from 'crypto';
import { emitNotification, emitNotificationRead } from '../services/websocket';

interface AuthPayload {
  userId: string;
  tenantId: string;
}

interface CreateNotificationBody {
  title: string;
  message: string;
  type: string; // Must match NotificationType enum
  priority?: string; // Must match NotificationPriority enum
  userIds?: string[]; // Target specific users
  roleIds?: string[]; // Target users with specific roles (e.g., Admin)
  departmentIds?: string[]; // Target users in specific departments
  documentId?: string;
  changeRequestId?: string;
  auditId?: string;
  link?: string;
  expiresAt?: string; // ISO date string
}

// Extract user from JWT
function getAuthUser(req: Request): AuthPayload {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }
  return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as AuthPayload;
}
export async function syncTenant(req: Request, res: Response) {
  const prisma = getPrismaClient();
  const { id, name, domain, email, type, createdBy } = req.body;
  if (!id || !name || !email || !type || !createdBy) {
    return res.status(400).json({ error: 'id, name, email, type, and createdBy are required' });
  }
  try {
    const tenant = await prisma.tenant.upsert({
      where: { id },
      update: { name, domain, email, type, createdBy }, // <-- include createdBy here too
      create: { id, name, domain, email, type, createdBy },
    });
    res.status(200).json({ message: 'Tenant synced', tenant });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync tenant' });
  }
}

// Sync user from tenant-service
export async function syncUser(req: Request, res: Response) {
  const prisma = getPrismaClient();
  const { id, email, tenantId, roleIds } = req.body;
  if (!id || !email || !tenantId) {
    return res.status(400).json({ error: 'id, email, and tenantId are required' });
  }
  try {
    // Upsert user
    const user = await prisma.user.upsert({
      where: { id },
      update: { email, tenantId },
      create: { id, email, tenantId },
    });

    // Sync user roles if provided
    if (Array.isArray(roleIds)) {
      // Remove old roles
      await prisma.userRole.deleteMany({ where: { userId: id } });
      // Add new roles
      await Promise.all(
        roleIds.map((roleId: string) =>
          prisma.userRole.create({ data: { userId: id, roleId } })
        )
      );
    }

    res.status(200).json({ message: 'User synced', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync user' });
  }
}

// Create a notification
export async function createNotification(req: Request, res: Response) {
  const prisma = getPrismaClient();
  try {
    const { userId, tenantId } = getAuthUser(req);
    const {
      title,
      message,
      type,
      priority,
      userIds,
      roleIds,
      departmentIds,
      documentId,
      changeRequestId,
      auditId,
      link,
      expiresAt,
    } = req.body as CreateNotificationBody;

    // Validate required fields
    if (!title || !message || !type) {
      return res.status(400).json({ error: 'Title, message, and type are required' });
    }

    // Validate enum values
    const validTypes = ['SYSTEM', 'DOCUMENT_PUBLISHED', 'DOCUMENT_UPDATED', 'CHANGE_REQUEST_SUBMITTED', 'CHANGE_REQUEST_STATUS_CHANGED', 'DEPARTMENT_CREATED', 'AUDIT_EVENT', 'USER_INVITED'];
    const validPriorities = ['HIGH', 'MEDIUM', 'LOW', null];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        id: randomUUID(), // Generate unique UUID for notification
        title,
        message,
        type,
        priority,
        tenantId,
        documentId,
        changeRequestId,
        auditId,
        link,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        recipients: {
          create: [
            ...(userIds?.map((userId) => ({ userId })) || []),
            ...(roleIds?.map((roleId) => ({ roleId })) || []),
            ...(departmentIds?.map((departmentId) => ({ departmentId })) || []),
          ],
        },
      },
      include: {
        recipients: true,
      },
    });

    // Resolve recipient user IDs
    const recipientUserIds = new Set<string>();
    if (userIds) {
      userIds.forEach((id) => recipientUserIds.add(id));
    }
    if (roleIds) {
      const usersInRoles = await prisma.userRole.findMany({
        where: { roleId: { in: roleIds }, user: { tenantId } },
        select: { userId: true },
      });
      usersInRoles.forEach(({ userId }: { userId: string }) => recipientUserIds.add(userId));
    }
    if (departmentIds) {
      const usersInDepartments = await prisma.user.findMany({
        where: { departmentId: { in: departmentIds }, tenantId },
        select: { id: true },
      });
      usersInDepartments.forEach(({ id }: { id: string }) => recipientUserIds.add(id));
    }

    // Emit notification via WebSocket service
    const notificationPayload = {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      link: notification.link,
      createdAt: notification.createdAt.toISOString(),
      isRead: notification.isRead,
    };
    emitNotification(tenantId, Array.from(recipientUserIds), notificationPayload);

    logger.info(`Notification created by user ${userId} for tenant ${tenantId}`, { notificationId: notification.id });
    res.status(201).json({ message: 'Notification created successfully', notification });
  } catch (error) {
    logger.error('Error creating notification:', { error });
    if (error instanceof Error && error.message.includes('database')) {
      try {
        await reconnectPrisma();
        return res.status(503).json({ error: 'Database connection lost, retrying...' });
      } catch (reconnectError) {
        logger.error('Reconnection failed:', { error: reconnectError });
      }
    }
    res.status(500).json({ error: 'Failed to create notification' });
  }
}

// Fetch user notifications
export async function getUserNotifications(req: Request, res: Response) {
  const prisma = getPrismaClient();
  try {
    const { userId, tenantId } = getAuthUser(req);
    const { page = '1', limit = '10', unreadOnly = 'false' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    const unread = unreadOnly === 'true';

    // Fetch user’s department ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true },
    });

    // Fetch user’s role IDs
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      select: { roleId: true },
    });
    const roleIds = userRoles.map((ur: { roleId: string }) => ur.roleId);

    // Fetch notifications for user
    const notifications = await prisma.notification.findMany({
      where: {
        tenantId,
        OR: [
          { recipients: { some: { userId } } },
          { recipients: { some: { roleId: { in: roleIds } } } },
          ...(user?.departmentId ? [{ recipients: { some: { departmentId: user.departmentId } } }] : []),
        ],
        isRead: unread ? false : undefined,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        priority: true,
        link: true,
        createdAt: true,
        isRead: true,
      },
    });

    const total = await prisma.notification.count({
      where: {
        tenantId,
        OR: [
          { recipients: { some: { userId } } },
          { recipients: { some: { roleId: { in: roleIds } } } },
          ...(user?.departmentId ? [{ recipients: { some: { departmentId: user.departmentId } } }] : []),
        ],
        isRead: unread ? false : undefined,
        deletedAt: null,
      },
    });

    logger.info(`Fetched notifications for user ${userId} in tenant ${tenantId}`, { count: notifications.length, page: pageNum, limit: limitNum });
    res.status(200).json({
      notifications: notifications.map((n: {
        id: string;
        title: string;
        message: string;
        type: string;
        priority: string | null;
        link: string | null;
        createdAt: Date;
        isRead: boolean;
      }) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      })),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    logger.error('Error fetching notifications:', { error });
    if (error instanceof Error && error.message.includes('database')) {
      try {
        await reconnectPrisma();
        return res.status(503).json({ error: 'Database connection lost, retrying...' });
      } catch (reconnectError) {
        logger.error('Reconnection failed:', { error: reconnectError });
      }
    }
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

// Mark notifications as read
export async function markNotificationsAsRead(req: Request, res: Response) {
  const prisma = getPrismaClient();
  try {
    const { userId, tenantId } = getAuthUser(req);
    const { notificationIds }: { notificationIds?: string[] } = req.body;

    const where = {
      tenantId,
      recipients: { some: { userId } },
      isRead: false,
      deletedAt: null,
      ...(notificationIds && { id: { in: notificationIds } }),
    };

    const updated = await prisma.notification.updateMany({
      where,
      data: { isRead: true },
    });

    // Emit notification read event
    if (notificationIds) {
      notificationIds.forEach((id) => emitNotificationRead(userId, id));
    }

    logger.info(`Marked ${updated.count} notifications as read for user ${userId} in tenant ${tenantId}`);
    res.status(200).json({ message: `${updated.count} notifications marked as read` });
  } catch (error) {
    logger.error('Error marking notifications as read:', { error });
    if (error instanceof Error && error.message.includes('database')) {
      try {
        await reconnectPrisma();
        return res.status(503).json({ error: 'Database connection lost, retrying...' });
      } catch (reconnectError) {
        logger.error('Reconnection failed:', { error: reconnectError });
      }
    }
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
}
