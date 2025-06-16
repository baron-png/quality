"use client";

import { useState, useEffect, memo, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  Autocomplete,
  Tooltip,
  CircularProgress,
  Box,
  TableContainer,
  IconButton,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AuditRow from "./AuditRow";
import { saveAuditDates } from "@/api/auditService";
import { Audit } from "@/types/audit";
import { formatDateForDisplay, formatDateForInput, isInvalidDate, getHelperText, isDateValidAndDue } from "@/utils/auditUtils";
import { fetchUsers } from "@/api/userService";

interface User {
  id: string;
  label: string;
}

interface AuditTableProps {
  audits: Audit[];
  programStatus: string;
  onInputChange: (index: number, field: string, value: string | string[]) => void;
  onOpenAuditDetails: (index: number, auditHeader: string) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  refreshAudits: () => Promise<void>;
  onTeamLeaderIdsChange: (ids: string[]) => void;
  onTeamMemberIdsChange: (ids: string[][]) => void;
}

// Memoized cell components for better performance
const AuditCell = memo(({ 
  audit, 
  index, 
  onOpenAuditDetails, 
  auditHeader,
  programStatus 
}: { 
  audit: Audit; 
  index: number; 
  onOpenAuditDetails: (index: number, auditHeader: string) => void; 
  auditHeader: string;
  programStatus: string;
}) => {
  const hasData = audit.scope?.length > 0 || 
                 audit.specificAuditObjective?.length > 0 || 
                 audit.methods?.length > 0 || 
                 audit.criteria?.length > 0;

  return (
    <TableCell align="center" sx={{ minWidth: 200 }}>
      <Button
        variant={hasData ? "outlined" : "contained"}
        onClick={() => onOpenAuditDetails(index, auditHeader)}
        sx={{
          minWidth: 100,
          textTransform: "none",
          ...(hasData ? {
            color: "#1A73E8",
            borderColor: "#1A73E8",
            "&:hover": {
              borderColor: "#1557B0",
              backgroundColor: "rgba(26, 115, 232, 0.04)"
            }
          } : {
            backgroundColor: "#1A73E8",
            color: "white",
            "&:hover": {
              backgroundColor: "#1557B0"
            }
          })
        }}
      >
        {hasData ? "Edit" : "Open"}
      </Button>
    </TableCell>
  );
});

AuditCell.displayName = 'AuditCell';

const DatePickerCell = memo(({ 
  audit, 
  index, 
  onInputChange, 
  programStatus,
  fieldFrom,
  fieldTo,
  label
}: { 
  audit: Audit; 
  index: number; 
  onInputChange: (index: number, field: string, value: string) => void;
  programStatus: string;
  fieldFrom: keyof Audit;
  fieldTo: keyof Audit;
  label: string;
}) => (
  <TableCell align="center" sx={{ minWidth: 200 }}>
    <TextField
      type="date"
      label={`${label} From`}
      value={formatDateForInput(audit[fieldFrom] as string)}
      onChange={(e) => onInputChange(index, fieldFrom as string, e.target.value)}
      InputProps={{ sx: { borderRadius: "8px" } }}
      size="small"
      variant="outlined"
      disabled={programStatus !== "Draft"}
      fullWidth
      sx={{ mb: 1 }}
      error={isInvalidDate(audit[fieldFrom] as string)}
      helperText={getHelperText(audit[fieldFrom] as string)}
    />
    <TextField
      type="date"
      label={`${label} To`}
      value={formatDateForInput(audit[fieldTo] as string)}
      onChange={(e) => onInputChange(index, fieldTo as string, e.target.value)}
      InputProps={{ sx: { borderRadius: "8px" } }}
      size="small"
      variant="outlined"
      disabled={programStatus !== "Draft"}
      fullWidth
      error={isInvalidDate(audit[fieldTo] as string)}
      helperText={getHelperText(audit[fieldTo] as string)}
    />
  </TableCell>
));

DatePickerCell.displayName = 'DatePickerCell';

const TeamLeaderCell = memo(({ 
  audit, 
  index, 
  onInputChange, 
  onTeamLeaderIdsChange,
  audits,
  programStatus,
  users,
  loadingUsers
}: { 
  audit: Audit; 
  index: number; 
  onInputChange: (index: number, field: string, value: string) => void;
  onTeamLeaderIdsChange: (ids: string[]) => void;
  audits: Audit[];
  programStatus: string;
  users: User[];
  loadingUsers: boolean;
}) => (
  <TableCell align="center" sx={{ minWidth: 200 }}>
    <Tooltip
      title={
        !audit.teamLeaderDate
          ? "Set appointment date first"
          : !isDateValidAndDue(audit.teamLeaderDate)
          ? "Appointment date is not due yet"
          : ""
      }
    >
      <Box>
        <Autocomplete
          options={users}
          getOptionLabel={(option) => option.label}
          value={users.find((u) => u.id === audit.teamLeaderId) || null}
          onChange={(e, value) => {
            const newIds = audits.map((a, i) => (i === index ? value?.id || "" : a.teamLeaderId));
            onTeamLeaderIdsChange(newIds);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              variant="outlined"
              placeholder="Select Team Leader"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingUsers && <CircularProgress size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          disabled={
            programStatus !== "Draft" ||
            !audit.teamLeaderDate ||
            !isDateValidAndDue(audit.teamLeaderDate)
          }
          sx={{ mb: 1 }}
        />
      </Box>
    </Tooltip>
    <TextField
      type="date"
      label="Appointment Date"
      value={formatDateForInput(audit.teamLeaderDate)}
      onChange={(e) => onInputChange(index, "teamLeaderDate", e.target.value)}
      InputProps={{ sx: { borderRadius: "8px" } }}
      size="small"
      variant="outlined"
      disabled={programStatus !== "Draft"}
      fullWidth
      error={isInvalidDate(audit.teamLeaderDate)}
      helperText={getHelperText(audit.teamLeaderDate)}
    />
  </TableCell>
));

TeamLeaderCell.displayName = 'TeamLeaderCell';

const TeamMembersCell = memo(({ 
  audit, 
  index, 
  onInputChange, 
  onTeamMemberIdsChange,
  audits,
  programStatus,
  users,
  loadingUsers
}: { 
  audit: Audit; 
  index: number; 
  onInputChange: (index: number, field: string, value: string) => void;
  onTeamMemberIdsChange: (ids: string[][]) => void;
  audits: Audit[];
  programStatus: string;
  users: User[];
  loadingUsers: boolean;
}) => (
  <TableCell align="center" sx={{ minWidth: 200 }}>
    <Tooltip
      title={
        !audit.teamMembersDate
          ? "Set appointment date first"
          : !isDateValidAndDue(audit.teamMembersDate)
          ? "Appointment date is not due yet"
          : ""
      }
    >
      <Box>
        <Autocomplete
          multiple
          options={users}
          getOptionLabel={(option) => option.label}
          value={users.filter((u) => audit.teamMemberIds.includes(u.id)) || []}
          onChange={(e, value) => {
            const newIds = audits.map((a, i) => (i === index ? value.map((v) => v.id) : a.teamMemberIds));
            onTeamMemberIdsChange(newIds);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              variant="outlined"
              placeholder="Select Team Members"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingUsers && <CircularProgress size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          disabled={
            programStatus !== "Draft" ||
            !audit.teamMembersDate ||
            !isDateValidAndDue(audit.teamMembersDate)
          }
          sx={{ mb: 1 }}
        />
      </Box>
    </Tooltip>
    <TextField
      type="date"
      label="Appointment Date"
      value={formatDateForInput(audit.teamMembersDate)}
      onChange={(e) => onInputChange(index, "teamMembersDate", e.target.value)}
      InputProps={{ sx: { borderRadius: "8px" } }}
      size="small"
      variant="outlined"
      disabled={programStatus !== "Draft"}
      fullWidth
      error={isInvalidDate(audit.teamMembersDate)}
      helperText={getHelperText(audit.teamMembersDate)}
    />
  </TableCell>
));

TeamMembersCell.displayName = 'TeamMembersCell';

const SaveDatesCell = memo(({ 
  audit, 
  index, 
  programStatus, 
  onSaveDates,
  savingIndex 
}: { 
  audit: Audit; 
  index: number; 
  programStatus: string;
  onSaveDates: (index: number) => void;
  savingIndex: number | null;
}) => (
  <TableCell align="center" sx={{ minWidth: 200 }}>
    <Button
      variant="contained"
      size="small"
      sx={{
        bgcolor: "#34A853",
        color: "white",
        textTransform: "none",
        borderRadius: "8px",
        px: 3,
        py: 1,
        "&:hover": { bgcolor: "#2E8B47" },
        "&:disabled": { bgcolor: "#B0BEC5" },
      }}
      onClick={() => onSaveDates(index)}
      disabled={programStatus !== "Draft" || !audit.id || savingIndex === index}
      startIcon={savingIndex === index ? <CircularProgress size={20} color="inherit" /> : null}
    >
      {savingIndex === index ? "Saving..." : "Save Dates"}
    </Button>
  </TableCell>
));

SaveDatesCell.displayName = 'SaveDatesCell';

const auditHeaders = [
  "1ST INTERNAL AUDIT",
  "1ST SURVEILLANCE AUDIT",
  "2ND INTERNAL AUDIT",
  "2ND SURVEILLANCE AUDIT",
  "3RD INTERNAL AUDIT",
  "RE-CERTIFICATION AUDIT",
];

const AuditTable: React.FC<AuditTableProps> = ({
  audits,
  programStatus,
  onInputChange,
  onOpenAuditDetails,
  setError,
  setSuccess,
  refreshAudits,
  onTeamLeaderIdsChange,
  onTeamMemberIdsChange,
}) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  // Add effect to log audits changes for debugging
  useEffect(() => {
    console.log('AuditTable received new audits:', audits);
  }, [audits]);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUsers(data.map((user: any) => ({ id: user.id, label: user.name })));
      } catch (err) {
        setError("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [token, setError]);

  const handleSaveDates = useCallback(async (index: number) => {
    const audit = audits[index];
    if (!audit.id) {
      setError("Please create the audit details first");
      return;
    }

    setSavingIndex(index);
    try {
      const payload = {
        auditDates: audit.auditDateFrom && audit.auditDateTo ? {
          startDate: audit.auditDateFrom,
          endDate: audit.auditDateTo,
        } : undefined,
        teamLeaderAppointment: audit.teamLeaderDate ? {
          appointmentDate: audit.teamLeaderDate,
        } : undefined,
        teamMemberAppointments: audit.teamMembersDate ? [{
          appointmentDate: audit.teamMembersDate,
        }] : undefined,
        followUpDates: audit.followUpDateFrom && audit.followUpDateTo ? {
          startDate: audit.followUpDateFrom,
          endDate: audit.followUpDateTo,
        } : undefined,
        managementReviewDates: audit.managementReviewDateFrom && audit.managementReviewDateTo ? {
          startDate: audit.managementReviewDateFrom,
          endDate: audit.managementReviewDateTo,
        } : undefined,
      };

      await saveAuditDates(audit.id, payload, token); // Pass token
      setSuccess("Dates saved successfully");
      await refreshAudits();
    } catch (err: any) {
      setError(err.message || "Failed to save dates");
    } finally {
      setSavingIndex(null);
    }
  }, [audits, token, refreshAudits, setError, setSuccess]);

  const renderAuditCell = useCallback((audit: Audit, index: number) => (
    <AuditCell
      key={audit.id || index}
      audit={audit}
      index={index}
      onOpenAuditDetails={onOpenAuditDetails}
      auditHeader={auditHeaders[index]}
      programStatus={programStatus}
    />
  ), [onOpenAuditDetails, programStatus]);

  const renderDateCell = useCallback((audit: Audit, index: number) => (
    <DatePickerCell
      key={audit.id || index}
      audit={audit}
      index={index}
      onInputChange={onInputChange}
      programStatus={programStatus}
      fieldFrom="auditDateFrom"
      fieldTo="auditDateTo"
      label="Audit Date"
    />
  ), [onInputChange, programStatus]);

  const renderTeamLeaderCell = useCallback((audit: Audit, index: number) => (
    <TeamLeaderCell
      key={audit.id || index}
      audit={audit}
      index={index}
      onInputChange={onInputChange}
      onTeamLeaderIdsChange={onTeamLeaderIdsChange}
      audits={audits}
      programStatus={programStatus}
      users={users}
      loadingUsers={loadingUsers}
    />
  ), [onInputChange, onTeamLeaderIdsChange, audits, programStatus, users, loadingUsers]);

  const renderTeamMembersCell = useCallback((audit: Audit, index: number) => (
    <TeamMembersCell
      key={audit.id || index}
      audit={audit}
      index={index}
      onInputChange={onInputChange}
      onTeamMemberIdsChange={onTeamMemberIdsChange}
      audits={audits}
      programStatus={programStatus}
      users={users}
      loadingUsers={loadingUsers}
    />
  ), [onInputChange, onTeamMemberIdsChange, audits, programStatus, users, loadingUsers]);

  const renderFollowUpCell = useCallback((audit: Audit, index: number) => (
    <DatePickerCell
      key={audit.id || index}
      audit={audit}
      index={index}
      onInputChange={onInputChange}
      programStatus={programStatus}
      fieldFrom="followUpDateFrom"
      fieldTo="followUpDateTo"
      label="Follow-up Date"
    />
  ), [onInputChange, programStatus]);

  const renderManagementReviewCell = useCallback((audit: Audit, index: number) => (
    <DatePickerCell
      key={audit.id || index}
      audit={audit}
      index={index}
      onInputChange={onInputChange}
      programStatus={programStatus}
      fieldFrom="managementReviewDateFrom"
      fieldTo="managementReviewDateTo"
      label="Management Review Date"
    />
  ), [onInputChange, programStatus]);

  const renderSaveDatesCell = useCallback((audit: Audit, index: number) => (
    <SaveDatesCell
      key={audit.id || index}
      audit={audit}
      index={index}
      programStatus={programStatus}
      onSaveDates={handleSaveDates}
      savingIndex={savingIndex}
    />
  ), [programStatus, handleSaveDates, savingIndex]);

  return (
    <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
      <Table sx={{ minWidth: 650 }} aria-label="audit program table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ 
              bgcolor: "#F5F7FA", 
              fontWeight: 600, 
              color: "#1A73E8",
              minWidth: 200 
            }}>
              Audit
            </TableCell>
            {auditHeaders.map((header) => (
              <TableCell 
                key={header} 
                align="center" 
                sx={{ 
                  bgcolor: "#F5F7FA", 
                  fontWeight: 600, 
                  color: "#1A73E8",
                  minWidth: 200 
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <AuditRow
            label="Audit Details"
            data={audits}
            renderCell={renderAuditCell}
          />
          <AuditRow
            label="Audit Dates"
            data={audits}
            renderCell={renderDateCell}
          />
          <AuditRow
            label="Team Leader Appointment"
            data={audits}
            renderCell={renderTeamLeaderCell}
          />
          <AuditRow
            label="Team Members Appointment"
            data={audits}
            renderCell={renderTeamMembersCell}
          />
          <AuditRow
            label="Follow-up Dates"
            data={audits}
            renderCell={renderFollowUpCell}
          />
          <AuditRow
            label="Management Review Dates"
            data={audits}
            renderCell={renderManagementReviewCell}
          />
          <AuditRow
            label="Save Dates"
            data={audits}
            renderCell={renderSaveDatesCell}
          />
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AuditTable;
