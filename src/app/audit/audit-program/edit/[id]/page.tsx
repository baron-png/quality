"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import AuditProgramForm from "@/components/audits/AuditProgramForm";
import { getAuditProgramById, updateAuditProgram } from "@/api/auditService";
import { useRouter } from "next/navigation";

interface ProgramData {
  name: string;
  auditProgramObjective: string;
  status: string;
  startDate: string;
  endDate: string;
  tenantId: string;
  tenantName: string;
  createdBy: string;
}

export default function EditAuditProgramPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [initialData, setInitialData] = useState<ProgramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();



  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const data = await getAuditProgramById(id as string, token);
        setInitialData({
          name: data.name,
          auditProgramObjective: data.auditProgramObjective || "",
          status: data.status,
          startDate: data.startDate.split("T")[0], // Format for input type="date"
          endDate: data.endDate.split("T")[0],
          tenantId: data.tenantId,
          tenantName: data.tenantName,
          createdBy: data.createdBy,
        });
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to load audit program");
        setLoading(false);
      }
    };
    if (token && id) fetchProgram();
    }, [id, token]);
    const handleSubmit = async (data: ProgramData) => {
    try {
        await updateAuditProgram(id as string, data, token);
        setSuccess("Audit program updated successfully!");
        // Optionally, redirect after a short delay
        setTimeout(() => {
        router.push("/audit/audit-program?tab=draft");
        }, 1500);
    } catch (err: any) {
        setError(err.message || "Failed to update audit program");
    }
    };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!initialData) return <p>No program data found</p>;

  return <AuditProgramForm initialData={initialData} onSubmit={handleSubmit} mode="edit" />;
}