const express = require("express");
const {
  authenticateToken,
  restrictToAdmin,
  restrictToManagementRep,
  restrictToAdminOrMR,
} = require("../middleware/auth");
const auditController = require("../controllers/audit.controller");

const router = express.Router();

// Audit Program Routes
router.post(
  "/audit-programs",
  authenticateToken,
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
  "/audit-programs/:id",
  authenticateToken,
  restrictToAdminOrMR,
  auditController.updateAuditProgram
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

router.put(
  "/audit-programs/:id/archive",
  authenticateToken,
  restrictToManagementRep,
  auditController.archiveAuditProgram
);

module.exports = router;