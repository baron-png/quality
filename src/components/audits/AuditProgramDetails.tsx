"use client";

import { useState } from "react";
import { Box, Button, Typography, Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import AuditTable from "./AuditTable";
import { submitAuditProgram } from "@/api/auditService";

interface Audit {
  id: string | null;
  auditNumber: string;
  scope: string[];
  specificAuditObjective: string[];
  methods: string[];
  criteria: string[];
  auditDateFrom: string;
  auditDateTo: string;
  teamLeaderDate: string;
  teamMembersDate: string;
  followUpDateFrom: string;
  followUpDateTo: string;
  managementReviewDateFrom: string;
  managementReviewDateTo: string;
  teamLeaderId: string;
  teamMemberIds: string[];
}

interface AuditProgram {
  id: string;
  name: string;
  auditProgramObjective: string;
  status: string;
  startDate: string;
  endDate: string;
  tenantId?: string;
  createdBy?: string;
  audits: Audit[];
}

interface AuditProgramDetailsProps {
  program: AuditProgram;
  onBack: () => void;
}

const AuditProgramDetails: React.FC<AuditProgramDetailsProps> = ({ program, onBack }) => {
  const [audits, setAudits] = useState<Audit[]>(program.audits);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { token } = useAuth();

  const isCommitEnabled = () => {
    return audits.every(
      (audit) =>
        audit.id &&
        (audit.scope?.length > 0 || audit.specificAuditObjective?.length > 0) &&
        audit.auditDateFrom &&
        audit.auditDateTo &&
        audit.teamLeaderId &&
        audit.teamLeaderDate
    );
  };

  const handleInputChange = (index: number, field: string, value: string | string[]) => {
    const newAudits = [...audits];
    newAudits[index] = { ...newAudits[index], [field]: value };
    setAudits(newAudits);
  };

  const handleOpenAuditDetails = (index: number, auditHeader: string) => {
    router.push(`/audit/audit-program/details/${program.id}/audit/${index}?auditHeader=${encodeURIComponent(auditHeader)}`);
  };

  const handleCommit = async () => {
    if (!isCommitEnabled()) {
      setError("Please complete all required audit details (objectives/scope, dates, and team leader) before committing.");
      return;
    }
    try {
      await submitAuditProgram(program.id, token);
      setSuccess("Program committed successfully");
      setTimeout(() => router.push("/audit/audit-programs"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to commit program");
    }
  };

  return (
    <div className="p-6 min-h-screen w-full" style={{ backgroundColor: "#F5F7FA" }}>
      <Typography variant="h5" style={{ color: "#1A73E8", fontWeight: 500, marginBottom: "12px" }}>
        AUDIT PROGRAMME: {program.name}
      </Typography>
      <Typography variant="subtitle1" style={{ color: "#5F6368", marginBottom: "12px" }}>
        OBJECTIVE(S)
      </Typography>
      {program.auditProgramObjective ? (
        <div style={{ color: "#5F6368", marginBottom: "20px", paddingLeft: "20px" }} dangerouslySetInnerHTML={{ __html: program.auditProgramObjective }} />
      ) : (
        <div style={{ color: "#5F6368", marginBottom: "20px", paddingLeft: "20px" }}>No objectives defined</div>
      )}

      <Box sx={{ overflowX: "auto", bgcolor: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", p: 3 }}>
        <AuditTable
          audits={audits}
          programStatus={program.status}
          onInputChange={handleInputChange}
          onOpenAuditDetails={handleOpenAuditDetails}
          setError={setError}
          setSuccess={setSuccess}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, pb: 2 }}>
          <Button
            variant="contained"
            disabled={program.status !== "Draft" || !isCommitEnabled()}
            style={{
              backgroundColor: program.status === "Draft" && isCommitEnabled() ? "#34A853" : "#B0BEC5",
              color: "white",
              textTransform: "none",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
            onClick={handleCommit}
          >
            Commit this programme
          </Button>
        </Box>
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
    </div>
  );
};

export default AuditProgramDetails;