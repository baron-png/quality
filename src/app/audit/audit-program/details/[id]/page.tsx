"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import AuditProgramDetails from "@/components/audits/AuditProgramDetails";
import { useAuditProgram } from "@/context/audit-program-context";

export default function AuditProgramDetailsPage() {
  const { id } = useParams();
  const { program, loading, error, fetchProgram } = useAuditProgram();

  useEffect(() => {
    if (id) {
      fetchProgram(id as string);
    }
  }, [id, fetchProgram]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, color: 'error.main' }}>
        Error: {error}
      </Box>
    );
  }

  if (!program) {
    return (
      <Box sx={{ p: 4, color: 'text.secondary' }}>
        Program not found
      </Box>
    );
  }

  return <AuditProgramDetails program={program} />;
}

export const dynamic = "force-dynamic";