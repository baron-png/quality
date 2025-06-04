const express = require('express');
const jwt = require('jsonwebtoken');
const {
  getUserNotifications,

  markAllNotificationsAsRead,
  createNotification,

  syncTenant,
  syncUser,
  syncRole,
  syncDepartment,
  syncDocument,
  syncChangeRequest,
} = require('../controllers/notification.controller'); // Import new controller functions

const router = express.Router();

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

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

// Notification routes
router.get('/notifications', authenticateToken, getUserNotifications);

router.put('/notifications/read-all', authenticateToken, markAllNotificationsAsRead);
router.post('/notifications', authenticateToken, createNotification);


// Synchronization routes
router.post('/tenants', syncTenant); // Sync tenant data
router.post('/users', syncUser); // Sync user data
router.post('/roles', syncRole); // Sync role data
router.post('/departments', syncDepartment); // Sync department data
router.post('/documents', syncDocument); // Sync document data
// Synchronization routes
router.post('/change-requests', syncChangeRequest); // Sync change request data

module.exports = router;