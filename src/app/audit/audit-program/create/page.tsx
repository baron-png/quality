"use client";
import { useRouter } from "next/navigation";
import AuditProgramForm from "../../../../components/audits/AuditProgramForm";
import { useAuth } from "@/context/auth-context";
import { createAuditProgram } from "@/api/auditService";

export default function AuditProgramCreatePage() {
  const { token } = useAuth();
  const router = useRouter();

   const handleSubmit = async (data: any): Promise<string> => {
    const program = await createAuditProgram(data, token);
    // program should be the created program object, or at least contain the id
    router.push(`/audit/audit-program/details/${program.id}`); // Use the id, not the whole object!
    return program.id;
  };

  return <AuditProgramForm onSubmit={handleSubmit} mode="create" />;
}