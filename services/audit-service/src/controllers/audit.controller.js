// controllers/audit.controller.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createAuditProgram = async (req, res) => {
  const { name, auditProgramObjective, startDate, endDate, tenantName } = req.body;
  const { userId, tenantId } = req.user;

  try {
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
      },
    });
    res.status(201).json(auditProgram);
  } catch (error) {
    console.error("Error creating audit program:", error.message);
    res.status(500).json({ error: "Failed to create audit program" });
  }
};

const getAllAuditPrograms = async (req, res) => {
  const { tenantId, roleName, userId } = req.user;

  try {
    const programs = await prisma.auditProgram.findMany({
      where: {
        tenantId,
        ...(roleName === "MR" ? { createdBy: userId } : {}), // MR only sees their own programs
      },
      include: { audits: true },
    });
    res.json(programs);
  } catch (error) {
    console.error("Error fetching audit programs:", error);
    res.status(500).json({ error: "Failed to fetch audit programs" });
  }
};

const getAuditProgramById = async (req, res) => {
  const { id } = req.params;
  const { tenantId, roleName } = req.user;

  try {
    const program = await prisma.auditProgram.findUnique({
      where: { id },
      include: { audits: true },
    });
    if (!program) {
      return res.status(404).json({ error: "Audit program not found" });
    }
    if (roleName !== "MR" && program.tenantId !== tenantId) {
      return res.status(403).json({ error: "Access denied to this audit program" });
    }
    res.json(program);
  } catch (error) {
    console.error("Error fetching audit program by ID:", error);
    res.status(500).json({ error: "Failed to fetch audit program" });
  }
};

const updateAuditProgram = async (req, res) => {
  const { id } = req.params;
  const { name, auditProgramObjective, startDate, endDate } = req.body;
  const { tenantId, userId, roleName } = req.user;

  try {
    const program = await prisma.auditProgram.findUnique({ where: { id } });
    if (!program || program.tenantId !== tenantId || (roleName === "MR" && program.createdBy !== userId)) {
      return res.status(403).json({ error: "Unauthorized to update this program" });
    }

    const auditProgram = await prisma.auditProgram.update({
      where: { id },
      data: {
        name,
        auditProgramObjective: auditProgramObjective || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: { audits: true },
    });
    res.json(auditProgram);
  } catch (error) {
    console.error("Error updating audit program:", error);
    res.status(500).json({ error: "Failed to update audit program" });
  }
};

const submitAuditProgram = async (req, res) => {
  const { id } = req.params;
  const { tenantId, userId, roleName } = req.user;

  try {
    const program = await prisma.auditProgram.findUnique({ where: { id } });
    if (!program || program.tenantId !== tenantId || (roleName === "MR" && program.createdBy !== userId)) {
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
};

const approveAuditProgram = async (req, res) => {
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
};

const rejectAuditProgram = async (req, res) => {
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
};

const archiveAuditProgram = async (req, res) => {
  const { id } = req.params;
  const { tenantId, userId, roleName } = req.user;

  try {
    const program = await prisma.auditProgram.findUnique({ where: { id } });
    if (!program || program.tenantId !== tenantId || (roleName === "MR" && program.createdBy !== userId)) {
      return res.status(403).json({ error: "Unauthorized to archive this program" });
    }

    const auditProgram = await prisma.auditProgram.update({
      where: { id },
      data: { status: "Archived" },
      include: { audits: true },
    });
    res.json(auditProgram);
  } catch (error) {
    console.error("Error archiving audit program:", error);
    res.status(500).json({ error: "Failed to archive audit program" });
  }
};

module.exports = {
  createAuditProgram,
  getAllAuditPrograms,
  getAuditProgramById,
  updateAuditProgram,
  submitAuditProgram,
  approveAuditProgram,
  rejectAuditProgram,
  archiveAuditProgram,
};