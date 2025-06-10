import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Audit } from "@/types/audit";

interface AuditProgramTableProps {
  audits?: Audit[];
}

export default function AuditProgramTable({ audits }: AuditProgramTableProps) {
  if (!audits || audits.length === 0) {
    return <p className="text-center text-muted-foreground mt-4">No audits available</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table className="w-full border border-gray-200">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="w-40 font-semibold border-r py-2 px-4 sticky left-0 bg-gray-100">
              Audit Component
            </TableHead>
            {audits.map((_, index) => (
              <TableHead key={index} className="font-semibold border-r py-2 px-4">
                Audit {index + 1}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="hover:bg-gray-50">
            <TableCell className="w-40 font-medium border-r py-2 px-4 sticky left-0 bg-white">Audit No</TableCell>
            {audits.map((audit) => (
              <TableCell key={audit.id} className="border-r py-2 px-4 break-words">
                {audit.id.split("A-")[1]}-{audit.auditProgramId.split("AP-")[1]}
              </TableCell>
            ))}
          </TableRow>
          <TableRow className="hover:bg-gray-50 bg-gray-50">
            <TableCell className="w-40 font-medium border-r py-2 px-4 sticky left-0 bg-gray-50">Scope</TableCell>
            {audits.map((audit) => (
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
            {audits.map((audit) => (
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
            {audits.map((audit) => (
              <TableCell key={audit.id} className="border-r py-2 px-4 break-words">
                {Array.isArray(audit.methods) && audit.methods.length > 0 ? audit.methods.join(", ") : "Not specified"}
              </TableCell>
            ))}
          </TableRow>
          <TableRow className="hover:bg-gray-50">
            <TableCell className="w-40 font-medium border-r py-2 px-4 sticky left-0 bg-white">Criteria</TableCell>
            {audits.map((audit) => (
              <TableCell key={audit.id} className="border-r py-2 px-4 break-words">
                {Array.isArray(audit.criteria) && audit.criteria.length > 0 ? audit.criteria.join(", ") : "Not specified"}
              </TableCell>
            ))}
          </TableRow>
          <TableRow className="hover:bg-gray-50 bg-gray-50">
            <TableCell className="w-40 font-medium border-r py-2 px-4 sticky left-0 bg-gray-50">Teams</TableCell>
            {audits.map((audit) => (
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
  );
}