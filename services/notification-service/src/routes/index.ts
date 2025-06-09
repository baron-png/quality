
import express from 'express';
import { createNotification, getUserNotifications, markNotificationsAsRead, syncTenant, syncUser } from '../controllers/notification.controller';

const router = express.Router();

router.post('/notifications', createNotification);
router.post('/sync/tenant', syncTenant);
router.post('/sync/user', syncUser);
router.get('/notifications', getUserNotifications);
router.post('/notifications/read', markNotificationsAsRead);

export default router;
