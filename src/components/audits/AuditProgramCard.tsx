import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditProgram, ActionStatus, User } from "@/types/audit";
import AuditProgramTable from "./AuditProgramTable";
import ActionButtons from "./ActionButton";

interface AuditProgramCardProps {
  program: AuditProgram;
  user: User;

  actionStatus: ActionStatus;
  setActionStatus: React.Dispatch<React.SetStateAction<ActionStatus>>;
  setAuditPrograms: React.Dispatch<React.SetStateAction<AuditProgram[]>>;
}

export default function AuditProgramCard({
  program,
  user,

  actionStatus,
  setActionStatus,
  setAuditPrograms,
}: AuditProgramCardProps) {
  return (
    <Card className="shadow-lg">
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

        <AuditProgramTable audits={program.audits} />

        <ActionButtons
          program={program}
          user={user}
     
          actionStatus={actionStatus}
          setActionStatus={setActionStatus}
          setAuditPrograms={setAuditPrograms}
        />
      </CardContent>
    </Card>
  );
}