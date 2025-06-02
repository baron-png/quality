require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const app = express();
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});
const port = process.env.PORT || 5004;

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to authenticate and extract userId from JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = {
      userId: decoded.userId,
      role: decoded.role, // Use role instead of roleNames for consistency
      tenantId: decoded.tenantId,
      email: decoded.email,
    };
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware for role-based access
const restrictToAdmin = (req, res, next) => {
  if (req.user?.role?.toUpperCase() !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const restrictToManagementRep = (req, res, next) => {
  if (req.user?.role?.toUpperCase() !== 'MR') {
    return res.status(403).json({ error: 'Management Representative access required' });
  }
  next();
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "audit-service" });
});

// POST: Log audit events (for tenant-service createUser)
app.post('/api/audit', authenticateToken, async (req, res) => {
  const { action, userId, email, tenantId, roleIds, departmentId, actorId, timestamp } = req.body;
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        id: `AL-${Date.now()}`,
        action,
        userId,
        email: email || null,
        tenantId,
        roleIds: roleIds || [],
        departmentId: departmentId || null,
        actorId,
        timestamp: new Date(timestamp),
      },
    });
    res.status(201).json({ message: 'Audit log created', auditLog });
  } catch (error) {
    console.error('Error creating audit log:', error.message);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// POST: Create audit program
app.post("/api/audit-programs", authenticateToken, restrictToManagementRep, async (req, res) => {
  const { name, auditProgramObjective, startDate, endDate, audits, tenantId, tenantName } = req.body;
  const { userId } = req.user;

  try {
    if (!Array.isArray(audits)) {
      return res.status(400).json({ error: "Audits must be an array" });
    }

    const sanitizedAudits = audits.map((audit) => ({
      id: audit.id,
      scope: audit.scope,
      specificAuditObjective: audit.specificAuditObjectives,
      methods: audit.methods,
      criteria: audit.criteria,
    }));

    const auditProgram = await prisma.auditProgram.create({
      data: {
        id: `AP-${Date.now()}`,
        name,
        auditProgramObjective: auditProgramObjective || null,
        status: "Draft",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        tenantId,
        tenantName,
        createdBy: userId,
        audits: { create: sanitizedAudits },
      },
      include: { audits: true },
    });

    res.status(201).json(auditProgram);
  } catch (error) {
    console.error("Error creating audit program:", error.message);
    res.status(500).json({ error: "Failed to create audit program" });
  }
});

// GET: Fetch all audit programs
app.get("/api/audit-programs", authenticateToken, async (req, res) => {
  const { tenantId } = req.user;

  try {
    const programs = await prisma.auditProgram.findMany({
      where: { tenantId },
      include: { audits: true },
    });
    res.json(programs);
  } catch (error) {
    console.error("Error fetching audit programs:", error);
    res.status(500).json({ error: "Failed to fetch audit programs" });
  }
});

// GET: Fetch audit programs for admin
app.get("/api/audit-programs/admin", authenticateToken, restrictToAdmin, async (req, res) => {
  const { tenantId } = req.user;

  try {
    const programs = await prisma.auditProgram.findMany({
      where: {
        tenantId,
        status: { in: ["Pending Approval", "Scheduled", "Active", "Completed"] },
      },
      include: { audits: true },
    });
    res.json(programs);
  } catch (error) {
    console.error("Error fetching admin audit programs:", error);
    res.status(500).json({ error: "Failed to fetch audit programs for admin" });
  }
});

// POST: Accept audit invitation
app.post("/api/audits/:id/accept", authenticateToken, async (req, res) => {
  const { id: auditProgramId } = req.params;
  const { userId, tenantId, role } = req.user;

  try {
    if (role !== "AUDITOR") {
      return res.status(403).json({ error: "Access restricted to auditors" });
    }

    const authServiceUrl = `${process.env.AUTH_SERVICE_URL}/api/users/${userId}`;
    const { data: user } = await axios.get(authServiceUrl);

    if (!user || user.role !== "AUDITOR" || user.tenantId !== tenantId) {
      return res.status(400).json({ error: "Invalid auditor or unauthorized" });
    }

    const auditProgram = await prisma.auditProgram.findFirst({
      where: { id: auditProgramId, tenantId },
      include: { audits: true },
    });

    if (!auditProgram) {
      return res.status(404).json({ error: "Audit program not found or unauthorized" });
    }

    const audit = auditProgram.audits[0];
    if (!audit) {
      return res.status(404).json({ error: "No audits found under this program" });
    }

    const auditId = audit.id;
    const acceptedAudit = await prisma.acceptedAudit.create({
      data: {
        auditId,
        auditorId: userId,
        acceptedAt: new Date(),
      },
    });

    res.status(201).json({
      message: "Invitation accepted successfully",
      acceptedAudit,
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: "Auditor not found in auth-service" });
    }
    console.error("Error accepting audit invitation:", error.message);
    res.status(500).json({ error: "Failed to accept audit invitation" });
  }
});

// GET: Fetch audit program by ID
app.get("/api/audit-programs/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { tenantId, role } = req.user;

  try {
    const program = await prisma.auditProgram.findUnique({
      where: { id },
      include: { audits: true },
    });
    if (!program) {
      return res.status(404).json({ error: "Audit program not found" });
    }
    if (role !== "MR" && program.tenantId !== tenantId) {
      return res.status(403).json({ error: "Access denied to this audit program" });
    }
    res.json(program);
  } catch (error) {
    console.error("Error fetching audit program by ID:", error);
    res.status(500).json({ error: "Failed to fetch audit program" });
  }
});

// POST: Create audit under audit program
app.post("/api/audit-programs/:id/audits", authenticateToken, restrictToManagementRep, async (req, res) => {
  const { id } = req.params;
  const { scope, specificAuditObjective, methods, criteria } = req.body;
  const { tenantId } = req.user;

  try {
    const program = await prisma.auditProgram.findUnique({ where: { id } });
    if (!program || program.tenantId !== tenantId) {
      return res.status(403).json({ error: "Invalid or unauthorized audit program" });
    }

    const audit = await prisma.audit.create({
      data: {
        id: `A-${Date.now()}`,
        auditProgramId: id,
        scope,
        specificAuditObjective,
        methods,
        criteria,
      },
    });
    res.status(201).json(audit);
  } catch (error) {
    console.error("Error creating audit:", error);
    res.status(500).json({ error: "Failed to create audit" });
  }
});

// PUT: Submit audit program for approval
app.put("/api/audit-programs/:id/submit", authenticateToken, restrictToManagementRep, async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.user;

  try {
    const program = await prisma.auditProgram.findUnique({ where: { id } });
    if (!program || program.tenantId !== tenantId) {
      return res.status(403).json({ error: "Unauthorized to submit this program" });
    }

    const auditProgram = await prisma.auditProgram.update({
      where: { id },
      data: { status: "Pending Approval" },
      include: { audits: true },
    });
    res.json(auditProgram);
  } catch (error) {
    console.error("Error submitting audit program:", error);
    res.status(500).json({ error: "Failed to submit audit program" });
  }
});

// PUT: Approve audit program (Admin only)
app.put("/api/audit-programs/:id/approve", authenticateToken, restrictToAdmin, async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.user;

  try {
    const program = await prisma.auditProgram.findUnique({ where: { id } });
    if (!program || program.tenantId !== tenantId) {
      return res.status(403).json({ error: "Unauthorized to approve this program" });
    }

    const auditProgram = await prisma.auditProgram.update({
      where: { id },
      data: { status: "Active" },
      include: { audits: true },
    });
    res.json(auditProgram);
  } catch (error) {
    console.error("Error approving audit program:", error);
    res.status(500).json({ error: "Failed to approve audit program" });
  }
});

// GET: Fetch audit programs for auditor
app.get("/api/audit-programs/auditor", authenticateToken, async (req, res) => {
  const { email, tenantId, role } = req.user;

  try {
    if (role !== "AUDITOR") {
      return res.status(403).json({ error: "Access restricted to auditors" });
    }

    const programs = await prisma.auditProgram.findMany({
      where: {
        tenantId,
        audits: {
          some: {
            OR: [
              { team: { path: ["leader"], equals: email } },
              { team: { path: ["members"], array_contains: email } },
            ],
          },
        },
      },
      include: { audits: true },
    });

    res.json(programs);
  } catch (error) {
    console.error("Error fetching audit programs for auditor:", error);
    res.status(500).json({ error: "Failed to fetch audit programs for auditor" });
  }
});

// PUT: Reject audit program (Admin only)
app.put("/api/audit-programs/:id/reject", authenticateToken, restrictToAdmin, async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.user;

  try {
    const program = await prisma.auditProgram.findUnique({ where: { id } });
    if (!program || program.tenantId !== tenantId) {
      return res.status(403).json({ error: "Unauthorized to reject this program" });
    }

    const auditProgram = await prisma.auditProgram.update({
      where: { id },
      data: { status: "Draft" },
      include: { audits: true },
    });
    res.json(auditProgram);
  } catch (error) {
    console.error("Error rejecting audit program:", error);
    res.status(500).json({ error: "Failed to reject audit program" });
  }
});

// PUT: Update audit team post-approval
app.put("/api/audits/:id", authenticateToken, restrictToManagementRep, async (req, res) => {
  const { id } = req.params;
  const { team } = req.body;
  const { tenantId } = req.user;

  try {
    const audit = await prisma.audit.findUnique({
      where: { id },
      include: { auditProgram: true },
    });
    if (!audit || audit.auditProgram.tenantId !== tenantId) {
      return res.status(403).json({ error: "Unauthorized to update this audit" });
    }

    const updatedAudit = await prisma.audit.update({
      where: { id },
      data: { team },
    });
    res.json(updatedAudit);
  } catch (error) {
    console.error("Error updating audit team:", error);
    res.status(500).json({ error: "Failed to update audit team" });
  }
});

// GET: Fetch auditors for a tenant
app.get("/api/auditors", authenticateToken, restrictToManagementRep, async (req, res) => {
  const { tenantId } = req.user;

  try {
    const auditors = await prisma.user.findMany({
      where: { tenantId, role: "AUDITOR" },
      select: { id: true, email: true, createdAt: true },
    });
    res.json(auditors);
  } catch (error) {
    console.error("Error fetching auditors:", error);
    res.status(500).json({ error: "Failed to fetch auditors" });
  }
});

app.listen(port, () => {
  console.log(`Audit service running on port ${port}`);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down audit service...");
  await prisma.$disconnect();
  process.exit(0);
});