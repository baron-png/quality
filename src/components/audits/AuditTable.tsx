"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Table, TableHead, TableRow, TableCell, TableBody, TextField, Button, Autocomplete } from "@mui/material";
import AuditRow from "./AuditRow";
import { saveAuditDates } from "@/api/auditService";

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

interface AuditTableProps {
  audits: Audit[];
  programStatus: string;
  onInputChange: (index: number, field: string, value: string) => void;
  onOpenAuditDetails: (index: number, auditHeader: string) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
}

const auditHeaders = [
  "1ST INTERNAL AUDIT",
  "1ST SURVEILLANCE AUDIT",
  "2ND INTERNAL AUDIT",
  "2ND SURVEILLANCE AUDIT",
  "3RD INTERNAL AUDIT",
  "RE-CERTIFICATION AUDIT",
];

// Mock users for Autocomplete (replace with API call)
const mockUsers = [
  { id: "user1", label: "John Doe" },
  { id: "user2", label: "Jane Smith" },
  { id: "user3", label: "Alice Johnson" },
];

const AuditTable: React.FC<AuditTableProps> = ({ audits, programStatus, onInputChange, onOpenAuditDetails, setError, setSuccess }) => {
  const { token } = useAuth();
  const [teamLeaderIds, setTeamLeaderIds] = useState<string[]>(audits.map(a => a.teamLeaderId));
  const [teamMemberIds, setTeamMemberIds] = useState<string[][]>(audits.map(a => a.teamMemberIds));

  const handleSaveDates = async (index: number) => {
    const audit = audits[index];
    if (!audit.id) {
      setError("Please create the audit details first");
      return;
    }

    try {
      const payload = {
        auditDates: audit.auditDateFrom && audit.auditDateTo ? {
          startDate: audit.auditDateFrom,
          endDate: audit.auditDateTo,
        } : undefined,
        teamLeaderAppointment: teamLeaderIds[index] && audit.teamLeaderDate ? {
          teamLeaderId: teamLeaderIds[index],
          appointmentDate: audit.teamLeaderDate,
        } : undefined,
        teamMemberAppointments: teamMemberIds[index]?.length && audit.teamMembersDate ? teamMemberIds[index].map(id => ({
          teamMemberId: id,
          appointmentDate: audit.teamMembersDate,
        })) : undefined,
        followUpDates: audit.followUpDateFrom && audit.followUpDateTo ? {
          startDate: audit.followUpDateFrom,
          endDate: audit.followUpDateTo,
        } : undefined,
        managementReviewDates: audit.managementReviewDateFrom && audit.managementReviewDateTo ? {
          startDate: audit.managementReviewDateFrom,
          endDate: audit.managementReviewDateTo,
        } : undefined,
      };

      await saveAuditDates(audit.id, payload, token);
      setSuccess("Dates saved successfully");
    } catch (err: any) {
      setError(err.message || "Failed to save dates");
    }
  };

  return (
    <Table stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell style={{ backgroundColor: "#E3F2FD", fontWeight: "bold", color: "#1A73E8", borderBottom: "none" }}>
            AUDIT NUMBER
          </TableCell>
          {auditHeaders.map((header, index) => (
            <TableCell
              key={index}
              style={{ backgroundColor: "#E3F2FD", fontWeight: "bold", color: "#1A73E8", textAlign: "center", minWidth: 150, borderBottom: "none" }}
            >
              {header}
            </TableCell>
          ))}
          <TableCell style={{ backgroundColor: "#FFF3E0", fontWeight: "bold", color: "#E65100", borderBottom: "none" }}>
            ACTION
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <AuditRow
          label="OBJECTIVE(S), SCOPE, CRITERIA AND METHODS"
          data={audits}
          renderCell={(audit, index) => (
            <TableCell align="center">
              <Button
                variant="contained"
                size="small"
                style={{
                  backgroundColor: audit.scope?.length > 0 || audit.specificAuditObjective?.length > 0 ? "#1976D2" : "#c48210",
                  color: "white",
                  textTransform: "none",
                  borderRadius: "8px",
                }}
                onClick={() => onOpenAuditDetails(index, auditHeaders[index])}
                disabled={programStatus !== "Draft"}
              >
                {audit.scope?.length > 0 || audit.specificAuditObjective?.length > 0 ? "Edit" : "Open"}
              </Button>
            </TableCell>
          )}
        />
        <AuditRow
          label="AUDIT DATE(S)"
          data={audits}
          renderCell={(audit, index) => (
            <TableCell align="center">
              <TextField
                type="date"
                value={audit.auditDateFrom || ""}
                onChange={(e) => onInputChange(index, "auditDateFrom", e.target.value)}
                InputProps={{ sx: { borderRadius: "8px" } }}
                size="small"
                variant="outlined"
                disabled={programStatus !== "Draft"}
              />
              <TextField
                type="date"
                value={audit.auditDateTo || ""}
                onChange={(e) => onInputChange(index, "auditDateTo", e.target.value)}
                InputProps={{ sx: { borderRadius: "8px" } }}
                size="small"
                variant="outlined"
                style={{ marginTop: "8px" }}
                disabled={programStatus !== "Draft"}
              />
            </TableCell>
          )}
        />
        <AuditRow
          label="APPOINTMENT OF TEAM LEADER(S)"
          data={audits}
          renderCell={(audit, index) => (
            <TableCell align="center">
              <Autocomplete
                options={mockUsers}
                getOptionLabel={(option) => option.label}
                value={mockUsers.find(u => u.id === teamLeaderIds[index]) || null}
                onChange={(e, value) => {
                  const newIds = [...teamLeaderIds];
                  newIds[index] = value?.id || "";
                  setTeamLeaderIds(newIds);
                }}
                renderInput={(params) => (
                  <TextField {...params} size="small" variant="outlined" placeholder="Select Team Leader" />
                )}
                disabled={programStatus !== "Draft"}
                sx={{ mb: 1 }}
              />
              <TextField
                type="date"
                value={audit.teamLeaderDate || ""}
                onChange={(e) => onInputChange(index, "teamLeaderDate", e.target.value)}
                InputProps={{ sx: { borderRadius: "8px" } }}
                size="small"
                variant="outlined"
                disabled={programStatus !== "Draft"}
              />
            </TableCell>
          )}
        />
        <AuditRow
          label="APPOINTMENT OF TEAM MEMBERS"
          data={audits}
          renderCell={(audit, index) => (
            <TableCell align="center">
              <Autocomplete
                multiple
                options={mockUsers}
                getOptionLabel={(option) => option.label}
                value={mockUsers.filter(u => teamMemberIds[index]?.includes(u.id)) || []}
                onChange={(e, value) => {
                  const newIds = [...teamMemberIds];
                  newIds[index] = value.map(v => v.id);
                  setTeamMemberIds(newIds);
                }}
                renderInput={(params) => (
                  <TextField {...params} size="small" variant="outlined" placeholder="Select Team Members" />
                )}
                disabled={programStatus !== "Draft"}
                sx={{ mb: 1 }}
              />
              <TextField
                type="date"
                value={audit.teamMembersDate || ""}
                onChange={(e) => onInputChange(index, "teamMembersDate", e.target.value)}
                InputProps={{ sx: { borderRadius: "8px" } }}
                size="small"
                variant="outlined"
                disabled={programStatus !== "Draft"}
              />
            </TableCell>
          )}
        />
        <AuditRow
          label="FOLLOW UP DATE(S)"
          data={audits}
          renderCell={(audit, index) => (
            <TableCell align="center">
              <TextField
                type="date"
                value={audit.followUpDateFrom || ""}
                onChange={(e) => onInputChange(index, "followUpDateFrom", e.target.value)}
                InputProps={{ sx: { borderRadius: "8px" } }}
                size="small"
                variant="outlined"
                disabled={programStatus !== "Draft"}
              />
              <TextField
                type="date"
                value={audit.followUpDateTo || ""}
                onChange={(e) => onInputChange(index, "followUpDateTo", e.target.value)}
                InputProps={{ sx: { borderRadius: "8px" } }}
                size="small"
                variant="outlined"
                style={{ marginTop: "8px" }}
                disabled={programStatus !== "Draft"}
              />
            </TableCell>
          )}
        />
        <AuditRow
          label="MANAGEMENT REVIEW DATE(S)"
          data={audits}
          renderCell={(audit, index) => (
            <TableCell align="center">
              <TextField
                type="date"
                value={audit.managementReviewDateFrom || ""}
                onChange={(e) => onInputChange(index, "managementReviewDateFrom", e.target.value)}
                InputProps={{ sx: { borderRadius: "8px" } }}
                size="small"
                variant="outlined"
                disabled={programStatus !== "Draft"}
              />
              <TextField
                type="date"
                value={audit.managementReviewDateTo || ""}
                onChange={(e) => onInputChange(index, "managementReviewDateTo", e.target.value)}
                InputProps={{ sx: { borderRadius: "8px" } }}
                size="small"
                variant="outlined"
                style={{ marginTop: "8px" }}
                disabled={programStatus !== "Draft"}
              />
            </TableCell>
          )}
        />
        <AuditRow
          label="SAVE DATES"
          data={audits}
          renderCell={(audit, index) => (
            <TableCell align="center">
              <Button
                variant="contained"
                size="small"
                style={{ backgroundColor: "#34A853", color: "white", textTransform: "none", borderRadius: "8px" }}
                onClick={() => handleSaveDates(index)}
                disabled={programStatus !== "Draft" || !audit.id}
              >
                Save Dates
              </Button>
            </TableCell>
          )}
        />
      </TableBody>
    </Table>
  );
};

export default AuditTable;