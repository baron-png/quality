"use client";

import AuditProgramForm from "../../../../components/audits/AuditProgramForm";
import { useAuth } from "@/context/auth-context";
import { createAuditProgram } from "@/api/auditService";

export default function AuditProgramCreatePage() {
  const { token } = useAuth();

  const handleSubmit = async (data: any): Promise<string> => {
    const programId = await createAuditProgram(data, token);
    return programId;
  };

  return <AuditProgramForm onSubmit={handleSubmit} mode="create" />;
}