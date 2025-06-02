const { prisma } = require('../prismaClient');

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { userRoles: { include: { role: { select: { id: true, name: true } } } } },
  });
  if (!user) throw new Error('User not found');

  const roles = user.userRoles.map((userRole) => ({ id: userRole.role.id, name: userRole.role.name }));
  return { ...user, roles };
};

const assignRolesToUser = async (email, roleIds) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');

  const roles = await prisma.role.findMany({ where: { id: { in: roleIds }, tenantId: user.tenantId } });
  if (roles.length !== roleIds.length) {
    throw new Error('One or more roleIds are invalid or do not belong to this tenant');
  }

  const userRoleData = roleIds.map((roleId) => ({ userId: user.id, roleId }));
  await prisma.userRole.createMany({ data: userRoleData, skipDuplicates: true });

  return roles;
};

const deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  await prisma.user.delete({ where: { id: userId } });
};

module.exports = { getUserById, assignRolesToUser, deleteUser };