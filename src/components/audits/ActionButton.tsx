import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  submitForApprovalAuditProgram,
  approveAuditProgram,
  rejectAuditProgram,
  archiveAuditProgram,
  fetchAuditPrograms,
} from "@/api/auditService";
import { AuditProgram, ActionStatus, User } from "@/types/audit";

interface ActionButtonsProps {
  program: AuditProgram;
  user: User;
  token: string;
  actionStatus: ActionStatus;
  setActionStatus: React.Dispatch<React.SetStateAction<ActionStatus>>;
  setAuditPrograms: React.Dispatch<React.SetStateAction<AuditProgram[]>>;
}

export default function ActionButtons({
  program,
  user,
  token,
  actionStatus,
  setActionStatus,
  setAuditPrograms,
}: ActionButtonsProps) {
  const router = useRouter();

  const handleEditProgram = () => {
    router.push(`/audit/audit-program/edit/${program.id}`);
  };

  const handleSubmitForApproval = async () => {
    setActionStatus((prev) => ({
      ...prev,
      [program.id]: { loading: true, error: null, action: "submit" },
    }));
    try {
      await submitForApprovalAuditProgram(program.id, token);
      const refreshed = await fetchAuditPrograms(token, user.primaryRole);
      setAuditPrograms(refreshed);
      setActionStatus((prev) => ({
        ...prev,
        [program.id]: { loading: false, success: "Program Submitted for Approval" },
      }));
      setTimeout(() => setActionStatus((prev) => ({ ...prev, [program.id]: {} })), 3000);
    } catch (error: any) {
      setActionStatus((prev) => ({
        ...prev,
        [program.id]: { loading: false, error: error.message || "Failed to submit. Try again." },
      }));
    }
  };

  const handleApproveProgram = async () => {
    setActionStatus((prev) => ({
      ...prev,
      [program.id]: { loading: true, error: null, action: "approve" },
    }));
    try {
      await approveAuditProgram(program.id, token);
      const refreshed = await fetchAuditPrograms(token, user.primaryRole);
      setAuditPrograms(refreshed);
      setActionStatus((prev) => ({
        ...prev,
        [program.id]: { loading: false, success: "Program Approved and Published" },
      }));
      setTimeout(() => setActionStatus((prev) => ({ ...prev, [program.id]: {} })), 3000);
    } catch (error: any) {
      setActionStatus((prev) => ({
        ...prev,
        [program.id]: { loading: false, error: error.message || "Failed to approve. Try again." },
      }));
    }
  };

  const handleRejectProgram = async () => {
    setActionStatus((prev) => ({
      ...prev,
      [program.id]: { loading: true, error: null, action: "reject" },
    }));
    try {
      await rejectAuditProgram(program.id, token);
      const refreshed = await fetchAuditPrograms(token, user.primaryRole);
      setAuditPrograms(refreshed);
      setActionStatus((prev) => ({
        ...prev,
        [program.id]: { loading: false, success: "Program Rejected" },
      }));
      setTimeout(() => setActionStatus((prev) => ({ ...prev, [program.id]: {} })), 3000);
    } catch (error: any) {
      setActionStatus((prev) => ({
        ...prev,
        [program.id]: { loading: false, error: error.message || "Failed to reject. Try again." },
      }));
    }
  };

  const handleArchiveProgram = async () => {
    setActionStatus((prev) => ({
      ...prev,
      [program.id]: { loading: true, error: null, action: "archive" },
    }));
    try {
      await archiveAuditProgram(program.id, token);
      const refreshed = await fetchAuditPrograms(token, user.primaryRole);
      setAuditPrograms(refreshed);
      setActionStatus((prev) => ({
        ...prev,
        [program.id]: { loading: false, success: "Program Archived" },
      }));
      setTimeout(() => setActionStatus((prev) => ({ ...prev, [program.id]: {} })), 3000);
    } catch (error: any) {
      setActionStatus((prev) => ({
        ...prev,
        [program.id]: { loading: false, error: error.message || "Failed to archive. Try again." },
      }));
    }
  };

  return (
    <div className="mt-4 flex justify-end space-x-2">
      {program.status === "Draft" && (
        <>
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleEditProgram}
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
                onClick={handleApproveProgram}
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
                onClick={handleRejectProgram}
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
              onClick={handleSubmitForApproval}
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
            onClick={handleArchiveProgram}
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
            onClick={handleApproveProgram}
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
            onClick={handleRejectProgram}
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
  );
}