"use client";

import { useCallback, useState, memo, useEffect } from "react";
import { Box, Typography, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import AuditTable from "./AuditTable";
import { useAuditProgram } from "@/context/audit-program-context";
import { useAuth } from "@/context/auth-context";
import { Audit } from "@/types/audit";

// Memoized button component for better performance
const CommitButton = memo(({ 
  status, 
  canCommit, 
  onClick 
}: { 
  status: string; 
  canCommit: boolean; 
  onClick: () => void; 
}) => (
  <Button
    variant="contained"
    disabled={status !== "Draft" || !canCommit}
    onClick={onClick}
    sx={{
      bgcolor: status === "Draft" && canCommit ? "#34A853" : "#B0BEC5",
      color: "white",
      textTransform: "none",
      borderRadius: "8px",
      px: 3,
      py: 1,
      "&:hover": { 
        bgcolor: status === "Draft" && canCommit ? "#2E8B47" : "#B0BEC5" 
      },
    }}
  >
    Commit this programme
  </Button>
));

CommitButton.displayName = 'CommitButton';

// Memoized dialog component
const CommitDialog = memo(({ 
  open, 
  onClose, 
  onConfirm 
}: { 
  open: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirm Commit</DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to commit this audit program? This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button 
        onClick={onClose} 
        sx={{ 
          color: "#5F6368", 
          textTransform: "none" 
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        sx={{ 
          bgcolor: "#34A853", 
          color: "white", 
          textTransform: "none", 
          "&:hover": { bgcolor: "#2E8B47" } 
        }}
      >
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
));

CommitDialog.displayName = 'CommitDialog';

// Add new button components for admin actions
const AdminActionButtons = memo(({ 
  onApprove, 
  onReject,
  disabled
}: { 
  onApprove: () => void;
  onReject: () => void;
  disabled: boolean;
}) => (
  <Box sx={{ display: "flex", gap: 2 }}>
    <Button
      variant="contained"
      onClick={onApprove}
      disabled={disabled}
      sx={{
        bgcolor: "#34A853",
        color: "white",
        textTransform: "none",
        borderRadius: "8px",
        px: 3,
        py: 1,
        "&:hover": { bgcolor: "#2E8B47" },
        "&:disabled": { bgcolor: "#B0BEC5" }
      }}
    >
      Approve Program
    </Button>
    <Button
      variant="contained"
      onClick={onReject}
      disabled={disabled}
      sx={{
        bgcolor: "#EA4335",
        color: "white",
        textTransform: "none",
        borderRadius: "8px",
        px: 3,
        py: 1,
        "&:hover": { bgcolor: "#D33426" },
        "&:disabled": { bgcolor: "#B0BEC5" }
      }}
    >
      Reject Program
    </Button>
  </Box>
));

AdminActionButtons.displayName = 'AdminActionButtons';

// Add new dialog for admin actions
const AdminActionDialog = memo(({ 
  open, 
  onClose, 
  onConfirm,
  action
}: { 
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'approve' | 'reject';
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>
      {action === 'approve' ? 'Approve Program' : 'Reject Program'}
    </DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to {action} this audit program? This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button 
        onClick={onClose} 
        sx={{ 
          color: "#5F6368", 
          textTransform: "none" 
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        sx={{ 
          bgcolor: action === 'approve' ? "#34A853" : "#EA4335",
          color: "white", 
          textTransform: "none", 
          "&:hover": { 
            bgcolor: action === 'approve' ? "#2E8B47" : "#D33426"
          } 
        }}
      >
        {action === 'approve' ? 'Approve' : 'Reject'}
      </Button>
    </DialogActions>
  </Dialog>
));

AdminActionDialog.displayName = 'AdminActionDialog';

interface AuditProgramDetailsProps {
  program: {
    id: string;
    name: string;
    auditProgramObjective: string;
    status: string;
    startDate: string;
    endDate: string;
    tenantId?: string;
    createdBy?: string;
    audits: Audit[];
  };
}

interface Role {
  name: string;
}

const auditHeaders = [
  "1ST INTERNAL AUDIT",
  "1ST SURVEILLANCE AUDIT",
  "2ND INTERNAL AUDIT",
  "2ND SURVEILLANCE AUDIT",
  "3RD INTERNAL AUDIT",
  "RE-CERTIFICATION AUDIT",
];

const AuditProgramDetails: React.FC<AuditProgramDetailsProps> = ({ program: initialProgram }) => {
  const router = useRouter();
  const { token, user } = useAuth();
  const { 
    program,
    error, 
    success, 
    clearMessages, 
    updateAudit, 
    handleSaveAuditDates, 
    fetchProgram,
    canCommit,
    handleCommit: commitProgram,
    handleApprove: approveProgram,
    handleReject: rejectProgram
  } = useAuditProgram();
  
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [adminAction, setAdminAction] = useState<'approve' | 'reject' | null>(null);
  const isAdmin = user?.roles?.some((role: Role) => role.name === 'SYSTEM_ADMIN');

  // Only fetch on mount if we have an initial program and no program in context
  useEffect(() => {
    if (initialProgram?.id && !program) {
      fetchProgram(initialProgram.id);
    }
  }, []); // Empty dependency array means this only runs on mount

  // Use program from context, fallback to initialProgram if context program is null
  const currentProgram = program || initialProgram;
  if (!currentProgram) return null;

  // Only set readOnly to true if user is admin AND program is pending approval
  const isReadOnly = isAdmin && currentProgram.status === 'PENDING_APPROVAL';

  const handleInputChange = useCallback((index: number, field: string, value: string | string[]) => {
    updateAudit(index, { [field]: value });
  }, [updateAudit]);

const handleOpenAuditDetails = useCallback((index: number, auditHeader: string) => {
  const audit = currentProgram.audits[index];
  console.log("Opening audit details", { auditId: audit.id, auditNumber: auditHeader, programId: currentProgram.id }); // Debug log
  router.push(
    `/audit/audit-program/details/${currentProgram.id}/audit?auditId=${audit.id}&auditHeader=${encodeURIComponent(auditHeader)}`
  );
}, [currentProgram.id, currentProgram.audits, router]);

  const handleCommit = useCallback(() => {
    setOpenDialog(true);
  }, []);

  const confirmCommit = useCallback(async () => {
    setOpenDialog(false);
    if (!canCommit) return;
    
    try {
      await commitProgram(currentProgram.id);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Failed to commit program:", err);
    }
  }, [canCommit, currentProgram.id, commitProgram, router]);

  const handleSaveDates = useCallback(async (auditId: string, dates: Partial<Audit>) => {
    await handleSaveAuditDates(auditId, dates);
  }, [handleSaveAuditDates]);

  const handleTeamLeaderIds = useCallback((ids: string[]) => {
    ids.forEach((id, index) => {
      updateAudit(index, { teamLeaderId: id || "" });
    });
  }, [updateAudit]);

  const handleTeamMemberIds = useCallback((ids: string[][]) => {
    ids.forEach((idArray, index) => {
      updateAudit(index, { teamMemberIds: idArray || [] });
    });
  }, [updateAudit]);

  const handleApprove = useCallback(() => {
    setAdminAction('approve');
    setOpenDialog(true);
  }, []);

  const handleReject = useCallback(() => {
    setAdminAction('reject');
    setOpenDialog(true);
  }, []);

  const confirmAdminAction = useCallback(async () => {
    setOpenDialog(false);
    if (!adminAction) return;
    
    try {
      if (adminAction === 'approve') {
        await approveProgram(currentProgram.id);
      } else {
        await rejectProgram(currentProgram.id);
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.error(`Failed to ${adminAction} program:`, err);
    }
  }, [adminAction, currentProgram.id, approveProgram, rejectProgram, router]);

  return (
    <Box sx={{ p: 6, minHeight: "100vh", bgcolor: "#F5F7FA" }}>
      <Typography 
        variant="h5" 
        sx={{ 
          color: "#1A73E8", 
          fontWeight: 500, 
          mb: 2 
        }}
      >
        AUDIT PROGRAMME: {currentProgram.name}
      </Typography>

      <Typography 
        variant="subtitle1" 
        sx={{ 
          color: "#5F6368", 
          mb: 2 
        }}
      >
        OBJECTIVE(S)
      </Typography>

      {currentProgram.auditProgramObjective ? (
        <Box 
          sx={{ 
            color: "#5F6368", 
            mb: 3, 
            pl: 2 
          }} 
          dangerouslySetInnerHTML={{ 
            __html: currentProgram.auditProgramObjective 
          }} 
        />
      ) : (
        <Box sx={{ color: "#5F6368", mb: 3, pl: 2 }}>
          No objectives defined
        </Box>
      )}

      <Box sx={{ 
        overflowX: "auto", 
        bgcolor: "white", 
        borderRadius: "12px", 
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
        p: 3 
      }}>
        <AuditTable
          audits={currentProgram.audits}
          programStatus={currentProgram.status}
          onInputChange={handleInputChange}
          onOpenAuditDetails={handleOpenAuditDetails}
          setError={clearMessages}
          setSuccess={clearMessages}
          refreshAudits={() => fetchProgram(currentProgram.id)}
          onTeamLeaderIdsChange={handleTeamLeaderIds}
          onTeamMemberIdsChange={handleTeamMemberIds}
          readOnly={isReadOnly} // Only read-only for admin reviewing a pending program
        />

        <Box sx={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          mt: 3, 
          pb: 2 
        }}>
          {isAdmin ? (
            currentProgram.status === 'PENDING_APPROVAL' && (
              <AdminActionButtons
                onApprove={handleApprove}
                onReject={handleReject}
                disabled={!currentProgram.audits.length}
              />
            )
          ) : (
            <CommitButton
              status={currentProgram.status}
              canCommit={canCommit}
              onClick={handleCommit}
            />
          )}
        </Box>
      </Box>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={clearMessages}
      >
        <Alert severity="error" onClose={clearMessages}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={clearMessages}
      >
        <Alert severity="success" onClose={clearMessages}>
          {success}
        </Alert>
      </Snackbar>

      <CommitDialog
        open={openDialog && !isAdmin}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmCommit}
      />

      <AdminActionDialog
        open={openDialog && isAdmin}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmAdminAction}
        action={adminAction || 'approve'}
      />
    </Box>
  );
};

export default memo(AuditProgramDetails);