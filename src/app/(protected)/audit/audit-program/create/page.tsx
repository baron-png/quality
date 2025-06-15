"use client";
import { useRouter } from "next/navigation";
import AuditProgramForm from "../../../../../components/audits/AuditProgramForm";
import { useAuth } from "@/context/auth-context";
import { createAuditProgram } from "@/api/auditService";

export default function AuditProgramCreatePage() {
 const { user } = useAuth();
const token = user?.accessToken;
  const router = useRouter();

  
const handleSubmit = async (data: any): Promise<string> => {
  const program = await createAuditProgram(data, token);
  router.push(`/audit/audit-program/details/${program.id}`);
  return program.id;
};

  return <AuditProgramForm onSubmit={handleSubmit} mode="create" />;
}