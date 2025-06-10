import { useState } from "react";
import { Button, Typography, Table, TableBody, TableCell, TableHead, TableRow, Box, TextField } from "@mui/material";

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
  const [audits, setAudits] = useState<Audit[]>(program.audits || [
    { scope: [], specificAuditObjectives: [], methods: [], auditDateFrom: "", auditDateTo: "", teamLeaderDate: "", teamMembersDate: "", followUpDateFrom: "", followUpDateTo: "", managementReviewDateFrom: "", managementReviewDateTo: "" },
    { scope: [], specificAuditObjectives: [], methods: [], auditDateFrom: "", auditDateTo: "", teamLeaderDate: "", teamMembersDate: "", followUpDateFrom: "", followUpDateTo: "", managementReviewDateFrom: "", managementReviewDateTo: "" },
    { scope: [], specificAuditObjectives: [], methods: [], auditDateFrom: "", auditDateTo: "", teamLeaderDate: "", teamMembersDate: "", followUpDateFrom: "", followUpDateTo: "", managementReviewDateFrom: "", managementReviewDateTo: "" },
    { scope: [], specificAuditObjectives: [], methods: [], auditDateFrom: "", auditDateTo: "", teamLeaderDate: "", teamMembersDate: "", followUpDateFrom: "", followUpDateTo: "", managementReviewDateFrom: "", managementReviewDateTo: "" },
    { scope: [], specificAuditObjectives: [], methods: [], auditDateFrom: "", auditDateTo: "", teamLeaderDate: "", teamMembersDate: "", followUpDateFrom: "", followUpDateTo: "", managementReviewDateFrom: "", managementReviewDateTo: "" },
    { scope: [], specificAuditObjectives: [], methods: [], auditDateFrom: "", auditDateTo: "", teamLeaderDate: "", teamMembersDate: "", followUpDateFrom: "", followUpDateTo: "", managementReviewDateFrom: "", managementReviewDateTo: "" },
    { scope: [], specificAuditObjectives: [], methods: [], auditDateFrom: "", auditDateTo: "", teamLeaderDate: "", teamMembersDate: "", followUpDateFrom: "", followUpDateTo: "", managementReviewDateFrom: "", managementReviewDateTo: "" },
  ]);

  const handleInputChange = (index: number, field: string, value: string | string[]) => {
    const newAudits = [...audits];
    newAudits[index] = { ...newAudits[index], [field]: value };
    setAudits(newAudits);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Typography variant="h4" component="h1" className="mb-6 font-bold text-gray-800">
        {program.name}
      </Typography>
      <Typography variant="h6" className="mb-4">
        Objectives: {program.auditProgramObjective}
      </Typography>

      <Box sx={{ bgcolor: "white", boxShadow: 3, p: 4, borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
        <Typography variant="h6" className="mb-4">Audit Component</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Audit Number</TableCell>
              <TableCell>1st Internal Audit</TableCell>
              <TableCell>1st Surveillance Audit</TableCell>
              <TableCell>2nd Internal Audit</TableCell>
              <TableCell>2nd Surveillance Audit</TableCell>
              <TableCell>3rd Internal Audit</TableCell>
              <TableCell>Re-certification Audit</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell rowSpan={5}>→</TableCell>
              {audits.map((audit, index) => (
                <TableCell key={index}>
                  <Button variant="contained" color="primary" onClick={() => {/* Handle Open */}}>
                    Open
                  </Button>
                </TableCell>
              ))}
              <TableCell rowSpan={5}></TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={8}>Objective(s), Scope, Criteria and Methods</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Audit Date(s)</TableCell>
              {audits.map((audit, index) => (
                <TableCell key={index}>
                  <TextField
                    type="date"
                    value={audit.auditDateFrom}
                    onChange={(e) => handleInputChange(index, "auditDateFrom", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                  /> - <TextField
                    type="date"
                    value={audit.auditDateTo}
                    onChange={(e) => handleInputChange(index, "auditDateTo", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Appointment of Team Leader(s)</TableCell>
              {audits.map((audit, index) => (
                <TableCell key={index}>
                  <TextField
                    type="date"
                    value={audit.teamLeaderDate}
                    onChange={(e) => handleInputChange(index, "teamLeaderDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Appointment of Team Members</TableCell>
              {audits.map((audit, index) => (
                <TableCell key={index}>
                  <TextField
                    type="date"
                    value={audit.teamMembersDate}
                    onChange={(e) => handleInputChange(index, "teamMembersDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Follow Up Date(s)</TableCell>
              {audits.map((audit, index) => (
                <TableCell key={index}>
                  <TextField
                    type="date"
                    value={audit.followUpDateFrom}
                    onChange={(e) => handleInputChange(index, "followUpDateFrom", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                  /> - <TextField
                    type="date"
                    value={audit.followUpDateTo}
                    onChange={(e) => handleInputChange(index, "followUpDateTo", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell>Management Review Date(s)</TableCell>
              {audits.map((audit, index) => (
                <TableCell key={index}>
                  <TextField
                    type="date"
                    value={audit.managementReviewDateFrom}
                    onChange={(e) => handleInputChange(index, "managementReviewDateFrom", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                  /> - <TextField
                    type="date"
                    value={audit.managementReviewDateTo}
                    onChange={(e) => handleInputChange(index, "managementReviewDateTo", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
        <Box className="flex justify-end mt-6">
          <Button variant="contained" color="primary">
            Commit this programme
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default AuditProgramDetails;