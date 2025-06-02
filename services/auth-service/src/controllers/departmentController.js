const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.syncDepartment = async (req, res) => {
  const { id, name, code, tenantId, createdBy } = req.body;

  if (!id || !name || !code || !tenantId || !createdBy) {
    return res.status(400).json({ error: 'id, name, code, tenantId, and createdBy are required' });
  }

  try {
    const department = await prisma.department.upsert({
      where: { id },
      update: { name, code, tenantId },
      create: { id, name, code, tenantId, createdBy },
    });

    console.log(`Department ${id} synchronized successfully in auth-service`);
    res.status(200).json({ message: 'Department synchronized successfully', department });
  } catch (error) {
    console.error('Error synchronizing department in auth-service:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
