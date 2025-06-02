require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedSuperAdmins() {
  console.log('Seeding auth-service database with Super Admins...');

  const defaultTenant = {
    id: 'default-tenant', // Ensuring the default tenant is created with a specific ID
    name: 'Default Tenant',
  };

  // Step 1: Create default tenant if not exists
  try {
    const tenant = await prisma.tenant.upsert({
      where: { id: defaultTenant.id },
      update: {}, // No update needed if tenant already exists
      create: defaultTenant,
    });
    console.log(`✅ Tenant ensured with ID: ${tenant.id}`);
  } catch (e) {
    console.error('❌ Error ensuring tenant:', e);
    throw e;
  }

  // Step 2: Seed roles for the default tenant
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Top-level admin with full system access', tenantId: defaultTenant.id },
    { name: 'ADMIN', description: 'Admin role for tenant management', tenantId: defaultTenant.id },
  ];

  const createdRoles = {};
  for (const role of roles) {
    const roleId = `${role.tenantId}-${role.name.toLowerCase()}`;
    try {
      const createdRole = await prisma.role.upsert({
        where: { id: roleId },
        update: {}, // No update needed for existing role
        create: {
          id: roleId,
          name: role.name,
          description: role.description,
          tenantId: role.tenantId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      createdRoles[role.name] = createdRole;
      console.log(`✅ Role ${role.name} seeded with ID: ${createdRole.id}`);
    } catch (e) {
      console.error(`❌ Error seeding role ${role.name}:`, e);
      throw e;
    }
  }

  // Step 3: Seed Super Admins
  const superAdmins = [
    {
      id: 'superadmin-global',
      email: 'superadmin@global.com',
      password: 'superadmin123',
      verified: true,
      tenantId: defaultTenant.id,
      tenantName: defaultTenant.name,
      firstName: 'Super',
      lastName: 'Admin',
    },
  ];

  for (const superAdmin of superAdmins) {
    try {
      const hashedPassword = await bcrypt.hash(superAdmin.password, 10);
      const createdSuperAdmin = await prisma.user.upsert({
        where: { email: superAdmin.email },
        update: {
          password: hashedPassword,
          verified: true,
          firstName: superAdmin.firstName,
          lastName: superAdmin.lastName,
        },
        create: {
          id: superAdmin.id,
          email: superAdmin.email,
          password: hashedPassword,
          verified: superAdmin.verified,
          tenantId: superAdmin.tenantId,
          tenantName: superAdmin.tenantName,
          firstName: superAdmin.firstName,
          lastName: superAdmin.lastName,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: createdSuperAdmin.id,
            roleId: createdRoles['SUPER_ADMIN'].id,
          },
        },
        update: {}, // No update needed if user-role already exists
        create: {
          userId: createdSuperAdmin.id,
          roleId: createdRoles['SUPER_ADMIN'].id,
          createdAt: new Date(),
        },
      });

      console.log(`✅ Super Admin seeded: ${createdSuperAdmin.email} with role SUPER_ADMIN (ID: ${createdSuperAdmin.id})`);
    } catch (e) {
      console.error('❌ Error seeding Super Admin:', e);
      throw e;
    }
  }
}

// Run seeding
seedSuperAdmins()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Prisma disconnected');
  });
