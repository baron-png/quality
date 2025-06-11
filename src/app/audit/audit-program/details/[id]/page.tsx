"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import AuditProgramDetails from "@/components/audits/AuditProgramDetails";
import { getAuditProgramById } from "@/api/auditService";

export default function AuditProgramDetailsPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token || !id) return;
    const fetchProgram = async () => {
      setLoading(true);
      try {
        const programData = await getAuditProgramById(id as string, token);
        // Ensure audits array exists, default to 7 empty audits if not
        const audits = programData.audits || Array(7).fill({}).map(() => ({
          scope: [], specificAuditObjectives: [], methods: [], auditDateFrom: "", auditDateTo: "", teamLeaderDate: "", teamMembersDate: "", followUpDateFrom: "", followUpDateTo: "", managementReviewDateFrom: "", managementReviewDateTo: ""
        }));
        setProgram({ ...programData, audits });
      } catch (error: any) {
        console.error("Failed to fetch audit program:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProgram();
  }, [token, id]);

  if (loading) return <div>Loading...</div>;
  if (!program) return <div>Program not found</div>;

  return <AuditProgramDetails program={program} onBack={() => window.history.back()} />;
}

export const dynamic = "force-dynamic";