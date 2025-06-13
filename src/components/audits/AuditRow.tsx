import { memo } from "react";
import React from "react";
import { TableRow, TableCell } from "@mui/material";
import { Audit } from "@/types/audit";

interface AuditRowProps<T> {
  label: string;
  data: T[];
  renderCell: (item: T, index: number) => React.ReactElement;
}

const AuditRow = memo(<T extends Audit>({ 
  label, 
  data, 
  renderCell 
}: AuditRowProps<T>) => {
  return (
    <TableRow>
      <TableCell 
        sx={{ 
          bgcolor: "#F5F7FA", 
          fontWeight: 600, 
          color: "#1A73E8",
          minWidth: 200 
        }}
      >
        {label}
      </TableCell>
      {data.map((item, index) => (
        <TableCell 
          key={item.id || index}
          sx={{ 
            borderBottom: "1px solid #E0E0E0",
            minWidth: 200 
          }}
        >
          {renderCell(item, index)}
        </TableCell>
      ))}
    </TableRow>
  );
});

AuditRow.displayName = 'AuditRow';

export default AuditRow;