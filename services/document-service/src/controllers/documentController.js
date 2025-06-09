const { prisma } = require("../config/db");
const { s3, S3_BUCKET } = require("../config/aws");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { io } = require('socket.io-client');

const socket = io('ws://localhost:5006', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => console.log('Connected to notification-service WebSocket'));
socket.on('connect_error', (error) => console.error('WebSocket connection error:', error));
socket.on('document.synchronized', (data) => console.log('Document sync response:', data));
socket.on('changeRequest.synchronized', (data) => console.log('Change request sync response:', data));
socket.on('error', (data) => console.error('WebSocket error:', data));

const uploadDocument = async (req, res) => {
  try {
    const { file } = req;
    const { title, category, version, revision, description } = req.body;
    const userId = req.user.userId;
    const tenantId = req.user.tenantId;

    if (!file || !title || !category || !version || !revision || !description) {
      return res.status(400).json({ error: 'All fields and file are required' });
    }

    const fileName = `documents/${tenantId}/${Date.now()}-${file.originalname}`;
    const params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: 'application/pdf',
    };

    await s3.send(new PutObjectCommand(params));
    console.log('File uploaded to S3:', fileName);

    const document = await prisma.document.create({
      data: {
        title,
        category,
        version,
        revision,
        description,
        filePath: fileName,
        createdBy: userId,
        tenantId,
      },
    });

    if (socket.connected) {
      const event = {
        id: document.id,
        title: document.title,
        tenantId: document.tenantId,
        filePath: document.filePath,
        category: document.category,
        version: document.version,
        revision: document.revision,
        description: document.description,
        createdBy: document.createdBy,
        createdAt: document.createdAt,
      };
      socket.emit('document.created', event);
      console.log('Document event emitted via WebSocket:', event);
    } else {
      console.error('WebSocket not connected');
    }

    res.status(201).json({ message: 'Document uploaded successfully', document });
  } catch (error) {
    console.error('Error uploading document:', error.message, error.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const submitChangeRequest = async (req, res) => {
  try {
    const { documentId, section, proposedChange, justification } = req.body;
    const proposerId = req.user.userId;
    const tenantId = req.user.tenantId;

    if (!documentId || !section || !proposedChange || !justification) {
      console.error("Missing required fields:", { documentId, section, proposedChange, justification });
      return res.status(400).json({ error: "All fields are required" });
    }

    const document = await prisma.document.findFirst({
      where: { id: documentId, tenantId },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found or not accessible" });
    }

    const proposer = await prisma.user.findUnique({
      where: { id: proposerId },
      select: { departmentId: true },
    });

    if (!proposer) {
      return res.status(404).json({ error: `Proposer with ID ${proposerId} not found` });
    }

    if (!proposer.departmentId) {
      return res.status(400).json({ error: "Proposer does not have a department assigned" });
    }

    const changeRequest = await prisma.changeRequest.create({
      data: {
        documentId,
        proposerId,
        departmentId: proposer.departmentId,
        tenantId,
        section,
        justification: `Proposed Change: ${proposedChange}\n\nJustification: ${justification}`,
        status: "Pending",
      },
    });

    if (socket.connected) {
      const event = {
        id: changeRequest.id,
        documentId: changeRequest.documentId,
        proposerId: changeRequest.proposerId,
        departmentId: changeRequest.departmentId,
        tenantId: changeRequest.tenantId,
        section: changeRequest.section,
        justification: changeRequest.justification,
        status: changeRequest.status,
        createdAt: changeRequest.createdAt,
      };
      socket.emit('changeRequest.created', event);
      console.log('Change request event emitted via WebSocket:', event);
    } else {
      console.error('WebSocket not connected');
    }

    console.log("Change request submitted:", changeRequest);
    res.status(201).json({ message: "Change request submitted successfully", changeRequest });
  } catch (error) {
    console.error("Error submitting change request:", error.message, error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Retain other functions unchanged
const getDocuments = async (req, res) => {
  try {
    if (!req.user?.tenantId) {
      return res.status(401).json({ error: "Unauthorized: Missing user information" });
    }

    const { category, title, page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;

    const where = { tenantId: req.user.tenantId };
    if (category) where.category = category;
    if (title) where.title = { contains: title, mode: "insensitive" };

    const skip = (page - 1) * limit;
    try {
      const documents = await prisma.document.findMany({
        where,
        skip: Number(skip),
        take: Number(limit),
        orderBy: { [sortBy]: order },
        include: { changeRequests: { select: { id: true, status: true } } },
      });
      res.status(200).json(documents);
    } catch (prismaError) {
      if (
        prismaError.code === 'P1001' ||
        prismaError.message?.includes('Timed out fetching a new connection')
      ) {
        console.error("Prisma connection pool timeout:", prismaError.message);
        return res.status(503).json({
          error: "Service temporarily unavailable. Too many requests or database is busy. Please try again later.",
          details: prismaError.message,
        });
      }
      // Other Prisma errors
      console.error("Prisma error in getDocuments:", prismaError.message);
      return res.status(500).json({ error: "Database error", details: prismaError.message });
    }
  } catch (error) {
    console.error("Error fetching documents:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const viewDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify document exists and user has access
    const document = await prisma.document.findFirst({
      where: {
        id: id,
        tenantId: req.user.tenantId,
      },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found or not accessible" });
    }

    // Fetch the PDF from S3
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: document.filePath,
    });

    const { Body, ContentType } = await s3.send(command);

    // Set headers to prevent caching and ensure inline display
    res.set({
      "Content-Type": ContentType || "application/pdf",
      "Content-Disposition": "inline; filename=document.pdf",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "Pragma": "no-cache",
      "Expires": "0",
    });

    // Stream the PDF to the client
    Body.pipe(res);

    // Handle stream errors
    Body.on("error", (error) => {
      console.error("S3 stream error:", error.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to stream document" });
      }
    });
  } catch (error) {
    console.error("Error in viewDocument:", error.message, error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const syncTenant = async (req, res) => {
  const { id, name, domain, email, type } = req.body;

  if (!id || !name || !domain || !email || !type) {
    return res.status(400).json({ error: 'id, name, domain, email, and type are required' });
  }

  try {
    const tenant = await prisma.tenant.upsert({
      where: { id },
      update: { name, domain, email, type },
      create: { id, name, domain, email, type },
    });

    console.log(`Tenant ${id} synchronized successfully in document-service`);
    res.status(200).json({ message: 'Tenant synchronized successfully', tenant });
  } catch (error) {
    console.error('Error synchronizing tenant in document-service:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const syncDepartment = async (req, res) => {
  const { id, name, code, tenantId, createdBy, headId } = req.body;

  if (!id || !name || !tenantId || !createdBy) {
    return res.status(400).json({ error: 'id, name, tenantId, and createdBy are required' });
  }

  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id) || !uuidRegex.test(tenantId) || !uuidRegex.test(createdBy) || (headId && !uuidRegex.test(headId))) {
      return res.status(400).json({ error: 'Invalid UUID format for id, tenantId, createdBy, or headId' });
    }

    const department = await prisma.department.upsert({
      where: { id },
      update: {
        name,
        code: code || null,
        createdBy,
        headId: headId || null,
      },
      create: {
        id,
        name,
        code: code || null,
        tenantId,
        createdBy,
        headId: headId || null,
      },
    });

    console.log(`Department ${id} synchronized successfully in document-service`);
    res.status(200).json({ message: 'Department synchronized successfully', department });
  } catch (error) {
    console.error('Error synchronizing department in document-service:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.findUnique({
      where: { id },
      include: { users: true },
    });
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.status(200).json(department);
  } catch (error) {
    console.error('Error retrieving department:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: { users: true },
    });
    res.status(200).json(departments);
  } catch (error) {
    console.error('Error retrieving departments:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const syncRole = async (req, res) => {
  const { id, name, tenantId } = req.body;

  if (!id || !name || !tenantId) {
    return res.status(400).json({ error: 'id, name, and tenantId are required' });
  }

  try {
    const role = await prisma.role.upsert({
      where: { id },
      update: { name, tenantId },
      create: { id, name, tenantId },
    });

    console.log(`Role ${id} synchronized successfully in document-service`);
    res.status(200).json({ message: 'Role synchronized successfully', role });
  } catch (error) {
    console.error('Error synchronizing role in document-service:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const syncUser = async (req, res) => {
  const { id, email, firstName, lastName, tenantId, createdBy, roleIds, departmentId } = req.body;

  if (!id || !email || !tenantId || !createdBy) {
    return res.status(400).json({ error: 'id, email, tenantId, and createdBy are required' });
  }

  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id) || !uuidRegex.test(tenantId) || !uuidRegex.test(createdBy) || (departmentId && !uuidRegex.test(departmentId))) {
      return res.status(400).json({ error: 'Invalid UUID format for id, tenantId, createdBy, or departmentId' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      await prisma.user.update({
        where: { email },
        data: {
          id,
          firstName: firstName || null,
          lastName: lastName || null,
          tenantId,
          departmentId: departmentId || null,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          id,
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          tenantId,
          departmentId: departmentId || null,
        },
      });
    }

    if (roleIds && Array.isArray(roleIds) && roleIds.length > 0) {
      await prisma.userRole.deleteMany({ where: { userId: id } });
      const userRoleData = roleIds.map((roleId) => ({ userId: id, roleId }));
      await prisma.userRole.createMany({ data: userRoleData, skipDuplicates: true });
    }

    console.log(`User ${id} synchronized successfully in document-service`);
    res.status(200).json({ message: 'User synchronized successfully' });
  } catch (error) {
    console.error('Error synchronizing user in document-service:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getDocuments, uploadDocument, viewDocument, submitChangeRequest, syncTenant, syncDepartment, syncRole, syncUser, getDepartment, getDepartments };