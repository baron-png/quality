export interface Audit {
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

export interface AuditProgram {
  id: string;
  name: string;
  auditProgramObjective?: string;
  startDate: string;
  endDate: string;
  status: string;
  audits?: Audit[];
}

export interface ActionStatus {
  [id: string]: {
    loading?: boolean;
    error?: string | null;
    success?: string;
    action?: "approve" | "reject" | "submit" | "archive";
  };
}

export interface User {
  primaryRole: string;
}