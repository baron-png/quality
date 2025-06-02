const express = require("express");
const {
  authenticateToken,
  restrictToAdmin,
  restrictToManagementRep,
} = require("../middleware/auth");
const auditController = require("../controllers/audit.controller"); // Ensure this path is correct

const router = express.Router();

// Audit Program Routes
router.post(
  "/audit-programs",
  authenticateToken,
  restrictToManagementRep,
  auditController.createAuditProgram
);
router.get(
  "/audit-programs",
  authenticateToken,
  auditController.getAllAuditPrograms
);
router.get(
  "/audit-programs/:id",
  authenticateToken,
  auditController.getAuditProgramById
);
router.put(
  "/audit-programs/:id/submit",
  authenticateToken,
  restrictToManagementRep,
  auditController.submitAuditProgram
);
router.put(
  "/audit-programs/:id/approve",
  authenticateToken,
  restrictToAdmin,
  auditController.approveAuditProgram
);
router.put(
  "/audit-programs/:id/reject",
  authenticateToken,
  restrictToAdmin,
  auditController.rejectAuditProgram
);

module.exports = router;
