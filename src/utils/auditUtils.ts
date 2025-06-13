import { Audit, AuditValidationResult, SaveAuditDatesPayload } from '@/types/audit';

const AUDIT_ORDER = [
  "1ST INTERNAL AUDIT",
  "1ST SURVEILLANCE AUDIT",
  "2ND INTERNAL AUDIT",
  "2ND SURVEILLANCE AUDIT",
  "3RD INTERNAL AUDIT",
  "RE-CERTIFICATION AUDIT",
];

/**
 * Transforms raw backend audit data into our frontend Audit model
 */
export function transformAuditFromBackend(rawAudit: any): Audit {
  // Get the latest entries from arrays if they exist
  const latestAuditDates = rawAudit.auditDates?.[0] || {};
  const latestTeamLeader = rawAudit.teamLeaderAppointment?.[0] || {};
  const latestTeamMembers = rawAudit.teamMemberAppointments?.[0] || {};
  const latestFollowUp = rawAudit.followUpDates?.[0] || {};
  const latestManagementReview = rawAudit.managementReviewDates?.[0] || {};

  return {
    id: rawAudit.id || '',
    auditNumber: rawAudit.auditNumber || '',
    scope: Array.isArray(rawAudit.scope) ? rawAudit.scope : [],
    specificAuditObjective: Array.isArray(rawAudit.specificAuditObjective) 
      ? rawAudit.specificAuditObjective 
      : [],
    methods: Array.isArray(rawAudit.methods) ? rawAudit.methods : [],
    criteria: Array.isArray(rawAudit.criteria) ? rawAudit.criteria : [],
    
    // Dates from arrays
    auditDateFrom: latestAuditDates.startDate || '',
    auditDateTo: latestAuditDates.endDate || '',
    teamLeaderDate: latestTeamLeader.appointmentDate || '',
    teamLeaderId: latestTeamLeader.teamLeaderId || '',
    teamMemberIds: latestTeamMembers.teamMemberIds || [],
    teamMembersDate: latestTeamMembers.appointmentDate || '',
    followUpDateFrom: latestFollowUp.startDate || '',
    followUpDateTo: latestFollowUp.endDate || '',
    managementReviewDateFrom: latestManagementReview.startDate || '',
    managementReviewDateTo: latestManagementReview.endDate || '',
  };
}

/**
 * Sorts audits based on their audit number to match the expected order
 */
export function sortAuditsByNumber(audits: Audit[]): Audit[] {
  return [...audits].sort((a, b) => {
    const indexA = AUDIT_ORDER.indexOf(a.auditNumber);
    const indexB = AUDIT_ORDER.indexOf(b.auditNumber);
    return indexA - indexB;
  });
}

/**
 * Validates an audit against our business rules
 */
export function validateAudit(audit: Audit): AuditValidationResult {
  const errors = {
    hasId: !!audit.id,
    hasScopeOrObjective: audit.scope.length > 0 || audit.specificAuditObjective.length > 0,
    hasAuditDates: !!(audit.auditDateFrom && audit.auditDateTo),
    hasMethods: audit.methods.length > 0,
    hasCriteria: audit.criteria.length > 0
  };

  return {
    isValid: Object.values(errors).every(Boolean),
    errors,
  };
}

/**
 * Creates a payload for saving audit dates
 */
export function createSaveDatesPayload(audit: Audit): SaveAuditDatesPayload {
  return {
    auditDates: audit.auditDateFrom && audit.auditDateTo ? {
      startDate: audit.auditDateFrom,
      endDate: audit.auditDateTo,
    } : undefined,
    
    teamLeaderAppointment: audit.teamLeaderId && audit.teamLeaderDate ? {
      appointmentDate: audit.teamLeaderDate,
      teamLeaderId: audit.teamLeaderId,
    } : undefined,
    
    teamMemberAppointments: audit.teamMemberIds?.length && audit.teamMembersDate ? [{
      appointmentDate: audit.teamMembersDate,
      teamMemberIds: audit.teamMemberIds,
    }] : undefined,
    
    followUpDates: audit.followUpDateFrom && audit.followUpDateTo ? {
      startDate: audit.followUpDateFrom,
      endDate: audit.followUpDateTo,
    } : undefined,
    
    managementReviewDates: audit.managementReviewDateFrom && audit.managementReviewDateTo ? {
      startDate: audit.managementReviewDateFrom,
      endDate: audit.managementReviewDateTo,
    } : undefined,
  };
}

/**
 * Formats a date for display in the UI
 */
export function formatDateForDisplay(date: string): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}

/**
 * Formats a date for input fields
 */
export function formatDateForInput(date: string): string {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Checks if an audit has any data
 */
export function hasAuditData(audit: Audit): boolean {
  return (
    audit.scope.length > 0 ||
    audit.specificAuditObjective.length > 0 ||
    audit.methods.length > 0 ||
    audit.criteria.length > 0 ||
    !!audit.auditDateFrom ||
    !!audit.teamLeaderDate ||
    !!audit.teamMembersDate
  );
}

export const isInvalidDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime());
  } catch (e) {
    return true;
  }
};

export const getHelperText = (dateString: string | null | undefined): string | undefined => {
  return isInvalidDate(dateString) ? "Invalid date" : undefined;
};

export const isDateValidAndDue = (date: string): boolean => {
  if (!date) return false;
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  return !isNaN(inputDate.getTime()) && inputDate.getTime() === today.getTime();
}; 