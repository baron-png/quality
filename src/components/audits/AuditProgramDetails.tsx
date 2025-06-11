"use client";
import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import AuditTable from "./AuditTable";

interface Audit {
  scope: string[];
  specificAuditObjectives: string[];
  methods: string[];
  auditDateFrom: string;
  auditDateTo: string;
  teamLeaderDate: string;
  teamMembersDate: string;
  followUpDateFrom: string;
  followUpDateTo: string;
  managementReviewDateFrom: string;
  managementReviewDateTo: string;
}

interface AuditProgram {
  id: string;
  name: string;
  auditProgramObjective: string;
  status: string;
  startDate: string;
  endDate: string;
  tenantId?: string;
  tenantName?: string;
  createdBy?: string;
  audits: Audit[];
}

interface AuditProgramDetailsProps {
  program: AuditProgram;
  onBack: () => void;
}

const AuditProgramDetails: React.FC<AuditProgramDetailsProps> = ({ program, onBack }) => {
  const [audits, setAudits] = useState<Audit[]>(
    program.audits.length ? program.audits : Array(7).fill({
      scope: [],
      specificAuditObjectives: [],
      methods: [],
      auditDateFrom: "",
      auditDateTo: "",
      teamLeaderDate: "",
      teamMembersDate: "",
      followUpDateFrom: "",
      followUpDateTo: "",
      managementReviewDateFrom: "",
      managementReviewDateTo: "",
    })
  );

  const router = useRouter();

  const handleInputChange = (index: number, field: string, value: string) => {
    const newAudits = [...audits];
    newAudits[index] = { ...newAudits[index], [field]: value };
    setAudits(newAudits);
  };

  const handleOpenAuditDetails = (index: number, auditHeader: string) => {
    router.push(`/audit/audit-program/details/${program.id}/audit/${index}?auditHeader=${encodeURIComponent(auditHeader)}`);
  };

  return (
    <div className="p-6 min-h-screen w-full" style={{ backgroundColor: '#F5F7FA' }}>
      <Typography variant="h5" style={{ color: '#1A73E8', fontWeight: 500, marginBottom: '12px' }}>
        AUDIT PROGRAMME: {program.name}
      </Typography>
      <Typography variant="subtitle1" style={{ color: '#5F6368', marginBottom: '12px' }}>
        OBJECTIVE(S)
      </Typography>
      {program.auditProgramObjective ? (
        <div style={{ color: '#5F6368', marginBottom: '20px', paddingLeft: '20px' }} dangerouslySetInnerHTML={{ __html: program.auditProgramObjective }} />
      ) : (
        <div style={{ color: '#5F6368', marginBottom: '20px', paddingLeft: '20px' }}>test objectives</div>
      )}

      <Box sx={{ overflowX: 'auto', bgcolor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', p: 3 }}>
        <AuditTable audits={audits} onInputChange={handleInputChange} onOpenAuditDetails={handleOpenAuditDetails} />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pb: 2 }}>
          <Button
            variant="contained"
            style={{ backgroundColor: '#34A853', color: 'white', textTransform: 'none', borderRadius: '8px', padding: '8px 16px' }}
          >
            Commit this programme
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default AuditProgramDetails;