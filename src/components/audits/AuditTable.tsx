"use client";
import { Table, TableHead, TableRow, TableCell, TableBody, TextField, Button } from "@mui/material";
import AuditRow from "./AuditRow";

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

interface AuditTableProps {
  audits: Audit[];
  onInputChange: (index: number, field: string, value: string) => void;
  onOpenAuditDetails: (index: number, auditHeader: string) => void;
}

const auditHeaders = [
  "1ST INTERNAL AUDIT",
  "1ST SURVEILLANCE AUDIT",
  "2ND INTERNAL AUDIT",
  "2ND SURVEILLANCE AUDIT",
  "3RD INTERNAL AUDIT",
  "RE-CERTIFICATION AUDIT",
];

const AuditTable: React.FC<AuditTableProps> = ({ audits, onInputChange, onOpenAuditDetails }) => {
  return (
    <Table stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell style={{ backgroundColor: '#E3F2FD', fontWeight: 'bold', color: '#1A73E8', borderBottom: 'none' }}>AUDIT NUMBER</TableCell>
          {auditHeaders.map((header, index) => (
            <TableCell
              key={index}
              style={{ backgroundColor: '#E3F2FD', fontWeight: 'bold', color: '#1A73E8', textAlign: 'center', minWidth: 150, borderBottom: 'none' }}
            >
              {header}
            </TableCell>
          ))}
          <TableCell style={{ backgroundColor: '#FFF3E0', fontWeight: 'bold', color: '#E65100', borderBottom: 'none' }}>ACTION</TableCell>
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
                style={{ backgroundColor: '#c48210', color: 'white', textTransform: 'none', borderRadius: '8px' }}
                onClick={() => onOpenAuditDetails(index, auditHeaders[index])}
              >
                Open
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
                value={audit.auditDateFrom || ''}
                onChange={(e) => onInputChange(index, "auditDateFrom", e.target.value)}
                InputProps={{ sx: { borderRadius: '8px' } }}
                size="small"
                variant="outlined"
              />
              <TextField
                type="date"
                value={audit.auditDateTo || ''}
                onChange={(e) => onInputChange(index, "auditDateTo", e.target.value)}
                InputProps={{ sx: { borderRadius: '8px' } }}
                size="small"
                variant="outlined"
                style={{ marginTop: '8px' }}
              />
            </TableCell>
          )}
        />
        <AuditRow
          label="APPOINTMENT OF TEAM LEADER(S)"
          data={audits}
          renderCell={(audit, index) => (
            <TableCell align="center">
              <TextField
                type="date"
                value={audit.teamLeaderDate || ''}
                onChange={(e) => onInputChange(index, "teamLeaderDate", e.target.value)}
                InputProps={{ sx: { borderRadius: '8px' } }}
                size="small"
                variant="outlined"
              />
            </TableCell>
          )}
        />
        <AuditRow
          label="APPOINTMENT OF TEAM MEMBERS"
          data={audits}
          renderCell={(audit, index) => (
            <TableCell align="center">
              <TextField
                type="date"
                value={audit.teamMembersDate || ''}
                onChange={(e) => onInputChange(index, "teamMembersDate", e.target.value)}
                InputProps={{ sx: { borderRadius: '8px' } }}
                size="small"
                variant="outlined"
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
                value={audit.followUpDateFrom || ''}
                onChange={(e) => onInputChange(index, "followUpDateFrom", e.target.value)}
                InputProps={{ sx: { borderRadius: '8px' } }}
                size="small"
                variant="outlined"
              />
              <TextField
                type="date"
                value={audit.followUpDateTo || ''}
                onChange={(e) => onInputChange(index, "followUpDateTo", e.target.value)}
                InputProps={{ sx: { borderRadius: '8px' } }}
                size="small"
                variant="outlined"
                style={{ marginTop: '8px' }}
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
                value={audit.managementReviewDateFrom || ''}
                onChange={(e) => onInputChange(index, "managementReviewDateFrom", e.target.value)}
                InputProps={{ sx: { borderRadius: '8px' } }}
                size="small"
                variant="outlined"
              />
              <TextField
                type="date"
                value={audit.managementReviewDateTo || ''}
                onChange={(e) => onInputChange(index, "managementReviewDateTo", e.target.value)}
                InputProps={{ sx: { borderRadius: '8px' } }}
                size="small"
                variant="outlined"
                style={{ marginTop: '8px' }}
              />
            </TableCell>
          )}
        />
      </TableBody>
    </Table>
  );
};

export default AuditTable;