"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchAuditPrograms,
  updateAuditProgram,
  submitForApprovalAuditProgram,
  approveAuditProgram,
  rejectAuditProgram,
  archiveAuditProgram,
} from "@/api/auditService";

interface Audit {
  id: string;
  auditProgramId: string;
  scope?: string[];
  specificAuditObjective?: string[];
  methods?: string[];
  criteria?: string[];
  team?: {
    leader?: string;
    members?: string[];
  };
}

interface AuditProgram {
  id: string;
  name: string;
  auditProgramObjective?: string;
  startDate: string;
  endDate: string;
  status: string;
  audits?: Audit[];
}

interface ActionStatus {
  [id: string]: {
    loading?: boolean;
    error?: string | null;
    success?: string;
    action?: "approve" | "reject" | "submit" | "archive";
  };
}

export default function AuditProgramsPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [auditPrograms, setAuditPrograms] = useState<AuditProgram[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionStatus, setActionStatus] = useState<ActionStatus>({});
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "draft";
  const [tab, setTab] = useState<string>(initialTab);

   useEffect(() => {
    if (!user || !token) return;
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const programs = await fetchAuditPrograms(token, user.primaryRole);
        setAuditPrograms(programs);
      } catch (error: any) {
        setAuditPrograms([]); // Optionally clear the list
        // Optionally set an error state to show a message to the user
        console.error("Failed to fetch audit programs:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [token, user]);

  const handleCreateProgram = () => {
    router.push("/audit/audit-program/create");
  };

  const handleEditProgram = (id: string) => {
    router.push(`/audit/audit-program/edit/${id}`);
  };

  const handleSubmitForApproval = async (id: string) => {
    setActionStatus((prev) => ({
      ...prev,
      [id]: { loading: true, error: null, action: "submit" },
    }));
    try {
      await submitForApprovalAuditProgram(id, token);
      const refreshed = await fetchAuditPrograms(token, user.primaryRole);
      setAuditPrograms(refreshed);
      setActionStatus((prev) => ({
        ...prev,
        [id]: { loading: false, success: "Program Submitted for Approval" },
      }));
      setTimeout(() => setActionStatus((prev) => ({ ...prev, [id]: {} })), 3000);
    } catch (error: any) {
      setActionStatus((prev) => ({
        ...prev,
        [id]: { loading: false, error: error.message || "Failed to submit. Try again." },
      }));
    }
  };

  const handleArchiveProgram = async (id: string) => {
    setActionStatus((prev) => ({
      ...prev,
      [id]: { loading: true, error: null, action: "archive" },
    }));
    try {
      await archiveAuditProgram(id, token);
      const refreshed = await fetchAuditPrograms(token, user.primaryRole);
      setAuditPrograms(refreshed);
      setActionStatus((prev) => ({
        ...prev,
        [id]: { loading: false, success: "Program Archived" },
      }));
      setTimeout(() => setActionStatus((prev) => ({ ...prev, [id]: {} })), 3000);
    } catch (error: any) {
      setActionStatus((prev) => ({
        ...prev,
        [id]: { loading: false, error: error.message || "Failed to archive. Try again." },
      }));
    }
  };

  const handleApproveProgram = async (id: string) => {
    setActionStatus((prev) => ({
      ...prev,
      [id]: { loading: true, error: null, action: "approve" },
    }));
    try {
      await approveAuditProgram(id, token);
      const refreshed = await fetchAuditPrograms(token, user.primaryRole);
      setAuditPrograms(refreshed);
      setActionStatus((prev) => ({
        ...prev,
        [id]: { loading: false, success: "Program Approved and Published" },
      }));
      setTimeout(() => setActionStatus((prev) => ({ ...prev, [id]: {} })), 3000);
    } catch (error: any) {
      setActionStatus((prev) => ({
        ...prev,
        [id]: { loading: false, error: error.message || "Failed to approve. Try again." },
      }));
    }
  };

  const handleRejectProgram = async (id: string) => {
    setActionStatus((prev) => ({
      ...prev,
      [id]: { loading: true, error: null, action: "reject" },
    }));
    try {
      await rejectAuditProgram(id, token);
      const refreshed = await fetchAuditPrograms(token, user.primaryRole);
      setAuditPrograms(refreshed);
      setActionStatus((prev) => ({
        ...prev,
        [id]: { loading: false, success: "Program Rejected" },
      }));
      setTimeout(() => setActionStatus((prev) => ({ ...prev, [id]: {} })), 3000);
    } catch (error: any) {
      setActionStatus((prev) => ({
        ...prev,
        [id]: { loading: false, error: error.message || "Failed to reject. Try again." },
      }));
    }
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

  if (loading) {
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
            <Card key={program.id} className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{program.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-gray-100 rounded-lg shadow-inner">
                  <h3 className="text-lg font-semibold">Audit Program: {program.name}</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Audit Program Objective:</strong> {program.auditProgramObjective || "Not specified"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Duration:</strong> {new Date(program.startDate).toLocaleDateString()} -{" "}
                    {new Date(program.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {program.status}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <Table className="w-full border border-gray-200">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="w-40 font-semibold border-r py-2 px-4 sticky left-0 bg-gray-100">
                          Audit Component
                        </TableHead>
                        {program.audits?.map((_, index) => (
                          <TableHead key={index} className="font-semibold border-r py-2 px-4">
                            Audit {index + 1}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell className="w-40 font-medium border-r py-2 px-4 sticky left-0 bg-white">Audit No</TableCell>
                        {program.audits?.map((audit) => (
                          <TableCell key={audit.id} className="border-r py-2 px-4 break-words">
                            {audit.id.split("A-")[1]}-{audit.auditProgramId.split("AP-")[1]}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 bg-gray-50">
                        <TableCell className="w-40 font-medium border-r py-2 px-4 sticky left-0 bg-gray-50">Scope</TableCell>
                        {program.audits?.map((audit) => (
                          <TableCell key={audit.id} className="border-r py-2 px-4 break-words">
                            {Array.isArray(audit.scope) && audit.scope.length > 0 ? (
                              <ul className="list-disc list-inside">
                                {audit.scope.map((item, i) => (
                                  <li key={i} className="text-sm">{item}</li>
                                ))}
                              </ul>
                            ) : (
                              "Not specified"
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell className="w-40 font-medium border-r py-2 px-4 sticky left-0 bg-white">Objectives</TableCell>
                        {program.audits?.map((audit) => (
                          <TableCell key={audit.id} className="border-r py-2 px-4 break-words">
                            {Array.isArray(audit.specificAuditObjective) && audit.specificAuditObjective.length > 0 ? (
                              <ul className="list-disc list-inside">
                                {audit.specificAuditObjective.map((obj, i) => (
                                  <li key={i} className="text-sm">{obj}</li>
                                ))}
                              </ul>
                            ) : (
                              "Not specified"
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 bg-gray-50">
                        <TableCell className="w-40 font-medium border-r py-2 px-4 sticky left-0 bg-gray-50">Methods</TableCell>
                        {program.audits?.map((audit) => (
                          <TableCell key={audit.id} className="border-r py-2 px-4 break-words">
                            {Array.isArray(audit.methods) && audit.methods.length > 0
                              ? audit.methods.join(", ")
                              : "Not specified"}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="hover:bg-gray-50">
                        <TableCell className="w-40 font-medium border-r py-2 px-4 sticky left-0 bg-white">Criteria</TableCell>
                        {program.audits?.map((audit) => (
                          <TableCell key={audit.id} className="border-r py-2 px-4 break-words">
                            {Array.isArray(audit.criteria) && audit.criteria.length > 0
                              ? audit.criteria.join(", ")
                              : "Not specified"}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow className="hover:bg-gray-50 bg-gray-50">
                        <TableCell className="w-40 font-medium border-r py-2 px-4 sticky left-0 bg-gray-50">Teams</TableCell>
                        {program.audits?.map((audit) => (
                          <TableCell key={audit.id} className="border-r py-2 px-4 break-words">
                            {audit.team
                              ? `${audit.team.leader || "Leader TBD"} (${audit.team.members?.join(", ") || "No members"})`
                              : "Not Assigned"}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                {(!program.audits || program.audits.length === 0) && (
                  <p className="text-center text-muted-foreground mt-4">No audits available</p>
                )}
                <div className="mt-4 flex justify-end space-x-2">
                  {program.status === "Draft" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleEditProgram(program.id)}
                        disabled={actionStatus[program.id]?.loading}
                        title="Edit Audit Program"
                      >
                        Edit
                      </Button>
                      {user.primaryRole?.toUpperCase() === "ADMIN" ? (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveProgram(program.id)}
                            disabled={actionStatus[program.id]?.loading}
                            title="Approve Audit Program"
                          >
                            {actionStatus[program.id]?.loading && actionStatus[program.id]?.action === "approve"
                              ? "Approving..."
                              : "Approve"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleRejectProgram(program.id)}
                            disabled={actionStatus[program.id]?.loading}
                            title="Reject Audit Program"
                          >
                            {actionStatus[program.id]?.loading && actionStatus[program.id]?.action === "reject"
                              ? "Rejecting..."
                              : "Reject"}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700"
                          onClick={() => handleSubmitForApproval(program.id)}
                          disabled={actionStatus[program.id]?.loading}
                          title="Submit Audit Program for Approval"
                        >
                          {actionStatus[program.id]?.loading && actionStatus[program.id]?.action === "submit"
                            ? "Submitting..."
                            : "Submit for Approval"}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300"
                        onClick={() => handleArchiveProgram(program.id)}
                        disabled={actionStatus[program.id]?.loading}
                        title="Archive Audit Program"
                      >
                        {actionStatus[program.id]?.loading && actionStatus[program.id]?.action === "archive"
                          ? "Archiving..."
                          : "Archive"}
                      </Button>
                    </>
                  )}
                  {program.status === "Pending Approval" && user.primaryRole?.toUpperCase() === "ADMIN" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveProgram(program.id)}
                        disabled={actionStatus[program.id]?.loading}
                        title="Approve Audit Program"
                      >
                        {actionStatus[program.id]?.loading && actionStatus[program.id]?.action === "approve"
                          ? "Approving..."
                          : "Approve"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleRejectProgram(program.id)}
                        disabled={actionStatus[program.id]?.loading}
                        title="Reject Audit Program"
                      >
                        {actionStatus[program.id]?.loading && actionStatus[program.id]?.action === "reject"
                          ? "Rejecting..."
                          : "Reject"}
                      </Button>
                    </>
                  )}
                  {actionStatus[program.id]?.success && (
                    <span className="text-green-500 text-sm">{actionStatus[program.id].success}</span>
                  )}
                  {actionStatus[program.id]?.error && (
                    <span className="text-red-500 text-sm">{actionStatus[program.id].error}</span>
                  )}
                </div>
              </CardContent>
            </Card>
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