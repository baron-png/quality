"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AuditProgramCard from "@/components/audits/AuditProgramCard";

import { fetchAuditPrograms } from "@/api/auditService";
import { AuditProgram, ActionStatus } from "@/types/audit";

export default function AuditProgramsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const token = user?.accessToken; // Assuming user object contains the token
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "draft";
  const [tab, setTab] = useState<string>(initialTab);
  const [auditPrograms, setAuditPrograms] = useState<AuditProgram[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionStatus, setActionStatus] = useState<ActionStatus>({});
  
    useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }
    const fetchPrograms = async () => {
      try {
        const programs = await fetchAuditPrograms(token);
        setAuditPrograms(programs);
      } catch (error: any) {
        setAuditPrograms([]);
        console.error("Failed to fetch audit programs:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [user, token]);

  const handleCreateProgram = () => {
    router.push("/audit/audit-program/create");
  };

  const filteredPrograms = auditPrograms.filter((program) => {
    const status = program.status || "";
    return tab === "active"
      ? status === "Active"
      : tab === "completed"
      ? status === "Completed"
      : tab === "scheduled"
      ? status === "Scheduled"
      : tab === "draft"
      ? status === "Draft"
      : status === "Pending Approval";
  });

    if (authLoading || loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Audit Programs</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !["ADMIN", "MR"].includes(user.primaryRole?.toUpperCase())) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Audit Programs</h1>
        <p className="text-red-500">Access denied. Admin or MR privileges required.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Audit Programs</h1>

      <Tabs value={tab} onValueChange={setTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="active">Active Programs</TabsTrigger>
          <TabsTrigger value="completed">Completed Programs</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Programs</TabsTrigger>
          <TabsTrigger value="draft">Draft Programs</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex justify-end mb-6">
        <Button
          variant="default"
          size="sm"
          className="bg-cyan-600 hover:bg-cyan-700"
          onClick={handleCreateProgram}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Program
        </Button>
      </div>

      <div className="space-y-8">
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((program) => (
            <AuditProgramCard
              key={program.id}
              program={program}
              user={user}
              actionStatus={actionStatus}
              setActionStatus={setActionStatus}
              setAuditPrograms={setAuditPrograms}
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground">
            No audit programs found for this category.
          </p>
        )}
      </div>

      <footer className="mt-8 text-sm text-muted-foreground">
        <p>Administered by: {user.primaryRole}</p>
      </footer>
    </div>
  );
}

export const dynamic = "force-dynamic";