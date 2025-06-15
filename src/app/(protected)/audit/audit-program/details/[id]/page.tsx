"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import AuditProgramDetails from "@/components/audits/AuditProgramDetails";
import { useAuditProgram } from "@/context/audit-program-context";
import { useAuth } from "@/context/auth-context";

export default function AuditProgramDetailsPage() {
  const { id } = useParams();
  const { fetchProgram, program, loading, error } = useAuditProgram();
  const { user, loading: authLoading } = useAuth();
const token = user?.accessToken;

useEffect(() => {
  if (authLoading) return; // Wait for auth to finish loading
  if (id && token) {
    fetchProgram(id as string);
  }
}, [id, token, fetchProgram, authLoading]);

    if (authLoading || loading) {
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