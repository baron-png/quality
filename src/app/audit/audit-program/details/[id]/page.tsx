"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import AuditProgramDetails from "@/components/audits/AuditProgramDetails";
import { getAuditProgramById } from "@/api/auditService";

export default function AuditProgramDetailsPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!token || !id) {
      setLoading(false);
      return;
    }

    const fetchProgram = async () => {
      setLoading(true);
      try {
        const programData = await getAuditProgramById(id as string, token);
        const auditHeaders = [
          "1ST INTERNAL AUDIT",
          "1ST SURVEILLANCE AUDIT",
          "2ND INTERNAL AUDIT",
          "2ND SURVEILLANCE AUDIT",
          "3RD INTERNAL AUDIT",
          "RE-CERTIFICATION AUDIT",
        ];
        const audits = auditHeaders.map((header) => {
          const existingAudit = programData.audits?.find(
            (audit: any) => audit.auditNumber === header
          );
          return {
            id: existingAudit?.id || null,
            auditNumber: header,
            scope: existingAudit?.scope || [],
            specificAuditObjective: existingAudit?.specificAuditObjective || [],
            methods: existingAudit?.methods || [],
            criteria: existingAudit?.criteria || [],
            auditDateFrom: existingAudit?.auditDates?.[0]?.startDate || "",
            auditDateTo: existingAudit?.auditDates?.[0]?.endDate || "",
            teamLeaderDate: existingAudit?.teamLeaderAppointment?.[0]?.appointmentDate || "",
            teamMembersDate: existingAudit?.teamMemberAppointments?.[0]?.appointmentDate || "",
            followUpDateFrom: existingAudit?.followUpDates?.[0]?.startDate || "",
            followUpDateTo: existingAudit?.followUpDates?.[0]?.endDate || "",
            managementReviewDateFrom: existingAudit?.managementReviewDates?.[0]?.startDate || "",
            managementReviewDateTo: existingAudit?.managementReviewDates?.[0]?.endDate || "",
            teamLeaderId: existingAudit?.teamLeaderAppointment?.[0]?.teamLeaderId || "",
            teamMemberIds: existingAudit?.teamMemberAppointments?.map((appt: any) => appt.teamMemberId) || [],
          };
        });
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