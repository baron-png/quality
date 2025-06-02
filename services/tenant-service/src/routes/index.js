const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authMiddleware } = require('../middleware/auth');
const tenantController = require('../controllers/tenant.controller');

// Public routes
router.get('/tenants', async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany();
    res.status(200).json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error.message);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// Get roles for a tenant
router.get('/tenants/:id/roles', async (req, res) => {
  const { id } = req.params;
  try {
    const roles = await prisma.role.findMany({
      where: { tenantId: id },
    });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error.message);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get users for a tenant
router.get('/tenants/:id/users', async (req, res) => {
  const { id } = req.params;
  try {
    const users = await prisma.user.findMany({
      where: { tenantId: id },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Validate tenant by ID
router.get('/tenants/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return res.status(404).json({ exists: false });
    }
    res.json({ exists: true });
  } catch (error) {
    console.error('Error validating tenant:', error.message);
    res.status(500).json({ error: 'Failed to validate tenant' });
  }
});

// Protected routes (placeholders for your existing controller methods)
router.post('/superadmin/tenants', authMiddleware, tenantController.createTenant );
router.post('/superadmin/tenants/:tenantId/users', authMiddleware,  tenantController.createUser );
router.get('/superadmin/tenants', authMiddleware, tenantController.getAllTenants );
router.delete('/superadmin/tenants/:tenantId', authMiddleware, tenantController.deleteTenant);
router.post('/tenants/:tenantId/complete-profile', authMiddleware, tenantController.completeProfile);
router.get('/tenants/:tenantId/details', authMiddleware, tenantController.getTenantDetails);
router.post('/tenants/:tenantId/departments', authMiddleware, tenantController.createDepartment);
router.post('/tenants/:tenantId/roles', authMiddleware, tenantController.createRole);
router.get('/tenants/:tenantId/users/role/:roleId', authMiddleware, tenantController.getUsers);
router.post('/tenants/:tenantId/users', authMiddleware, tenantController.createUser);
router.get('/tenants/:tenantId/users/:userId', authMiddleware, tenantController.getUserWithDepartment);

module.exports = router;