const { prisma } = require('../prismaClient');

const createOrUpdateRole = async (id, name, description, tenantId) => {
  const role = await prisma.role.upsert({
    where: { id },
    update: { name, description, tenantId },
    create: { id, name, description, tenantId },
  });
  return role;
};

const getRoleById = async (id) => {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new Error('Role not found');
  return role;
};

const getAllRoles = async () => {
  return prisma.role.findMany({
    select: { id: true, name: true, description: true, tenantId: true },
  });
};

module.exports = { createOrUpdateRole, getRoleById, getAllRoles };