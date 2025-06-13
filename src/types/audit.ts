// Audit Types
export interface AuditDates {
  startDate: string;
  endDate: string;
}

export interface TeamAppointment {
  appointmentDate: string;
  teamLeaderId?: string;
  teamMemberIds?: string[];
}

export interface Audit {
  id: string;
  auditNumber: string;
  scope: string[];
  specificAuditObjective: string[];
  methods: string[];
  criteria: string[];
  auditDateFrom: string;
  auditDateTo: string;
  teamLeaderId: string;
  teamLeaderDate: string;
  teamMemberIds: string[];
  teamMembersDate: string;
  followUpDateFrom: string;
  followUpDateTo: string;
  managementReviewDateFrom: string;
  managementReviewDateTo: string;
}

export interface AuditProgram {
  id: string;
  name: string;
  auditProgramObjective: string;
  status: string;
  startDate: string;
  endDate: string;
  tenantId?: string;
  tenantName?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  audits: Audit[];
}

// API Types
export interface SaveAuditDatesPayload {
  auditDates?: AuditDates;
  teamLeaderAppointment?: TeamAppointment;
  teamMemberAppointments?: TeamAppointment[];
  followUpDates?: AuditDates;
  managementReviewDates?: AuditDates;
}

export interface CreateAuditPayload {
  auditNumber: string;
  scope: string[];
  specificAuditObjectives: string[];
  methods: string[];
  criteria: string[];
}

// Validation Types
export interface AuditValidationResult {
  isValid: boolean;
  errors: {
    hasId: boolean;
    hasScopeOrObjective: boolean;
    hasAuditDates: boolean;
   
  };
}

// Context Types
export interface AuditProgramState {
  program: AuditProgram | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

export type AuditProgramAction =
  | { type: 'SET_PROGRAM'; payload: AuditProgram }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'UPDATE_AUDIT'; payload: { index: number; data: Partial<Audit> } }
  | { type: 'CLEAR_MESSAGES' };

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