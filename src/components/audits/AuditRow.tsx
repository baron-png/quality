import React from "react";
import { TableRow, TableCell } from "@mui/material";

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

interface AuditRowProps<T> {
  label: string;
  data: T[];
  renderCell: (item: T, index: number) => JSX.Element;
}

const AuditRow = <T,>({ label, data, renderCell }: AuditRowProps<T>) => {
  return (
    <TableRow>
      <TableCell>{label}</TableCell>
      {data.map((item, index) => (
        // Add a key prop here
        <React.Fragment key={index}>
          {renderCell(item, index)}
        </React.Fragment>
      ))}
      <TableCell />
    </TableRow>
  );
};

export default AuditRow;