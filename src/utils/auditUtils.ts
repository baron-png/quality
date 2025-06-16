import { Audit, AuditValidationResult, SaveAuditDatesPayload, AuditProgram } from '@/types/audit';

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
  console.log('[Audit Utils] Transforming audit from backend:', rawAudit);

  // Get the latest entries from arrays if they exist
  const latestAuditDates = rawAudit.auditDates?.[rawAudit.auditDates.length - 1] || {};
  const latestTeamLeader = rawAudit.teamLeaderAppointment?.[rawAudit.teamLeaderAppointment.length - 1] || {};
  const latestTeamMembers = rawAudit.teamMemberAppointments?.[rawAudit.teamMemberAppointments.length - 1] || {};
  const latestFollowUp = rawAudit.followUpDates?.[rawAudit.followUpDates.length - 1] || {};
  const latestManagementReview = rawAudit.managementReviewDates?.[rawAudit.managementReviewDates.length - 1] || {};

  const transformed = {
    id: rawAudit.id || '',
    auditNumber: rawAudit.auditNumber || '',
    scope: Array.isArray(rawAudit.scope) ? rawAudit.scope : [],
    specificAuditObjective: Array.isArray(rawAudit.specificAuditObjective) 
      ? rawAudit.specificAuditObjective 
      : [],
    methods: Array.isArray(rawAudit.methods) ? rawAudit.methods : [],
    criteria: Array.isArray(rawAudit.criteria) ? rawAudit.criteria : [],
    
    // Dates from arrays - use the latest entry
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

  console.log('[Audit Utils] Transformed audit:', transformed);
  return transformed;
}

/**
 * Sorts audits based on their audit number to match the expected order
 */
export function sortAuditsByNumber(audits: Audit[]): Audit[] {
  console.log('[Audit Utils] Sorting audits:', audits.map(a => ({ 
    auditNumber: a.auditNumber, 
    id: a.id 
  })));

  const sorted = [...audits].sort((a, b) => {
    const indexA = AUDIT_ORDER.indexOf(a.auditNumber);
    const indexB = AUDIT_ORDER.indexOf(b.auditNumber);
    
    // If audit numbers are not in our predefined order, maintain their relative order
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;  // Put unknown audit numbers at the end
    if (indexB === -1) return -1; // Put unknown audit numbers at the end
    
    return indexA - indexB;
  });

  console.log('[Audit Utils] Sorted audits:', sorted.map(a => ({ 
    auditNumber: a.auditNumber, 
    id: a.id 
  })));

  return sorted;
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

  const errorMessages: string[] = [];
  if (!errors.hasId) errorMessages.push('Missing audit ID');
  if (!errors.hasScopeOrObjective) errorMessages.push('Missing scope or objective');
  if (!errors.hasAuditDates) errorMessages.push('Missing audit dates');
  if (!errors.hasMethods) errorMessages.push('Missing methods');
  if (!errors.hasCriteria) errorMessages.push('Missing criteria');

  return {
    isValid: Object.values(errors).every(Boolean),
    errors,
    errorMessages
  };
}

/**
 * Validates an entire audit program for submission
 */
export function validateProgramForSubmission(program: AuditProgram): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!program.audits || program.audits.length === 0) {
    errors.push('Program must have at least one audit');
    return { isValid: false, errors };
  }

  // Helper to check if an audit is empty
  const isAuditEmpty = (audit: Audit) => {
    return !(
      audit.scope.length > 0 ||
      audit.specificAuditObjective.length > 0 ||
      audit.methods.length > 0 ||
      audit.criteria.length > 0 ||
      audit.auditDateFrom ||
      audit.auditDateTo ||
      audit.teamLeaderDate ||
      audit.teamLeaderId ||
      (audit.teamMemberIds && audit.teamMemberIds.length > 0) ||
      audit.teamMembersDate ||
      audit.followUpDateFrom ||
      audit.followUpDateTo ||
      audit.managementReviewDateFrom ||
      audit.managementReviewDateTo
    );
  };

  let validAuditCount = 0;
  program.audits.forEach((audit: Audit, index: number) => {
    if (isAuditEmpty(audit)) return; // Ignore empty audits
    const validation = validateAudit(audit);
    if (validation.isValid) {
      validAuditCount++;
    } else if (validation.errorMessages) {
      const auditNumber = audit.auditNumber || `Audit ${index + 1}`;
      validation.errorMessages.forEach(message => {
        errors.push(`${auditNumber}: ${message}`);
      });
    }
  });

  if (validAuditCount === 0) {
    errors.push('At least one audit must be fully completed to commit the program.');
  }

  return {
    isValid: validAuditCount > 0 && errors.length === 0,
    errors
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