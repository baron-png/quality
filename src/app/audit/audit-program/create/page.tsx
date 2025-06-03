"use client";

import AuditProgramForm from "./AuditProgramForm";
import { useAuth } from "@/context/auth-context";
import { createAuditProgram } from "@/api/auditService";

export default function AuditProgramCreatePage() {
  const { token } = useAuth();

  const handleSubmit = async (data: any) => {
    await createAuditProgram(data, token);
  };

  return <AuditProgramForm onSubmit={handleSubmit} mode="create" />;
}