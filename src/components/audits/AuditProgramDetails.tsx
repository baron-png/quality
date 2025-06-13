"use client";

import { useCallback, useState, memo } from "react";
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

const auditHeaders = [
  "1ST INTERNAL AUDIT",
  "1ST SURVEILLANCE AUDIT",
  "2ND INTERNAL AUDIT",
  "2ND SURVEILLANCE AUDIT",
  "3RD INTERNAL AUDIT",
  "RE-CERTIFICATION AUDIT",
];

const AuditProgramDetails: React.FC<AuditProgramDetailsProps> = ({ program }) => {
  const router = useRouter();
  const { token } = useAuth();
  const { 
    error, 
    success, 
    clearMessages, 
    updateAudit, 
    handleSaveAuditDates, 
    fetchProgram,
    canCommit,
    handleCommit: commitProgram
  } = useAuditProgram();
  
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const handleInputChange = useCallback((index: number, field: string, value: string | string[]) => {
    updateAudit(index, { [field]: value });
  }, [updateAudit]);

  const handleOpenAuditDetails = useCallback((index: number, auditHeader: string) => {
    router.push(
      `/audit/audit-program/details/${program.id}/audit/${index}?auditHeader=${encodeURIComponent(auditHeader)}`
    );
  }, [program.id, router]);

  const handleCommit = useCallback(() => {
    setOpenDialog(true);
  }, []);

  const confirmCommit = useCallback(async () => {
    setOpenDialog(false);
    if (!canCommit) return;
    
    try {
      await commitProgram(program.id);
      router.push("/audit/audit-programs");
    } catch (err: any) {
      console.error("Failed to commit program:", err);
    }
  }, [canCommit, program.id, commitProgram, router]);

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
        AUDIT PROGRAMME: {program.name}
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

      {program.auditProgramObjective ? (
        <Box 
          sx={{ 
            color: "#5F6368", 
            mb: 3, 
            pl: 2 
          }} 
          dangerouslySetInnerHTML={{ 
            __html: program.auditProgramObjective 
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
          audits={program.audits}
          programStatus={program.status}
          onInputChange={handleInputChange}
          onOpenAuditDetails={handleOpenAuditDetails}
          setError={clearMessages}
          setSuccess={clearMessages}
          refreshAudits={() => fetchProgram(program.id)}
          onTeamLeaderIdsChange={handleTeamLeaderIds}
          onTeamMemberIdsChange={handleTeamMemberIds}
        />

        <Box sx={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          mt: 3, 
          pb: 2 
        }}>
          <CommitButton
            status={program.status}
            canCommit={canCommit}
            onClick={handleCommit}
          />
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
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={confirmCommit}
      />
    </Box>
  );
};

export default memo(AuditProgramDetails);