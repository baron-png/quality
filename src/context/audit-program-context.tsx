"use client";

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { useAuth } from './auth-context';
import { 
  getAuditProgramById, 
  saveAuditDates, 
  submitAuditProgram,
  updateAudit 
} from '@/api/auditService';
import { 
  AuditProgram, 
  Audit, 
  SaveAuditDatesPayload,
  AuditValidationResult 
} from '@/types/audit';
import { auditProgramReducer, initialState } from '@/reducers/auditProgramReducer';
import { 
  transformAuditFromBackend, 
  validateAudit, 
  createSaveDatesPayload,
  hasAuditData,
  sortAuditsByNumber,
  validateProgramForSubmission
} from '@/utils/auditUtils';
import { useRouter } from 'next/navigation';

export interface AuditProgramContextType {
  program: AuditProgram | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  fetchProgram: (id: string) => Promise<void>;
  updateAudit: (index: number, data: Partial<Audit>) => void;
  handleSaveAuditDates: (auditId: string, dates: Partial<Audit>) => Promise<void>;
  handleCommit: (id: string) => Promise<void>;
  handleApprove: (id: string) => Promise<void>;
  handleReject: (id: string) => Promise<void>;
  canCommit: boolean;
  clearMessages: () => void;
}

const AuditProgramContext = createContext<AuditProgramContextType | undefined>(undefined);

export const AuditProgramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(auditProgramReducer, initialState);
  const { token } = useAuth();
  const router = useRouter();

  const fetchProgram = useCallback(async (programId: string) => {
    if (!token) {
      dispatch({ type: 'SET_ERROR', payload: 'No access token available' });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('[Audit Program] Fetching program:', programId);
      const rawProgram = await getAuditProgramById(programId, token);
      console.log('[Audit Program] Raw program data:', rawProgram);

      // Transform the audits before setting in state
      const transformedAudits = rawProgram.audits.map(transformAuditFromBackend);
      console.log('[Audit Program] Transformed audits:', transformedAudits);

      // Sort the audits
      const sortedAudits = sortAuditsByNumber(transformedAudits);
      console.log('[Audit Program] Sorted audits:', sortedAudits);

      const transformedProgram = {
        ...rawProgram,
        audits: sortedAudits
      };

      dispatch({ type: 'SET_PROGRAM', payload: transformedProgram });
    } catch (error: any) {
      console.error('[Audit Program] Error fetching program:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch program' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token]);

  const updateAudit = useCallback((index: number, data: Partial<Audit>) => {
    dispatch({ type: 'UPDATE_AUDIT', payload: { index, data } });
  }, []);

  const handleSaveAuditDates = useCallback(async (auditId: string, dates: Partial<Audit>) => {
    if (!token || !state.program) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Find the audit in our state
      const auditIndex = state.program.audits.findIndex(a => a.id === auditId);
      if (auditIndex === -1) throw new Error('Audit not found');

      // Create the payload for the API
      const audit = { ...state.program.audits[auditIndex], ...dates };
      const payload = createSaveDatesPayload(audit);

      console.log('[Audit Program] Saving dates for audit:', {
        auditId,
        payload,
        currentAudit: audit
      });

      // Save to backend
      await saveAuditDates(auditId, payload, token);
      
      // Update local state immediately to prevent UI flicker
      updateAudit(auditIndex, dates);
      
      // Then refresh the program to ensure we have the latest data
      console.log('[Audit Program] Refreshing program after saving dates');
      await fetchProgram(state.program.id);
      
      dispatch({ type: 'SET_SUCCESS', payload: 'Audit dates saved successfully' });
    } catch (error: any) {
      console.error('[Audit Program] Failed to save audit dates:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Failed to save audit dates' 
      });
      // Refresh program on error to ensure UI is in sync
      if (state.program) {
        await fetchProgram(state.program.id);
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token, state.program, updateAudit, fetchProgram]);

  const handleCommit = useCallback(async (programId: string) => {
    if (!token || !state.program) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Authentication required' 
      });
      return;
    }

    const validation = validateProgramForSubmission(state.program);
    if (!validation.isValid) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: validation.errors.join('\n')
      });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await submitAuditProgram(programId, token);
      dispatch({ type: 'SET_SUCCESS', payload: 'Program committed successfully' });
      // Use router.push for client-side navigation
      router.push('/dashboard');
    } catch (error: any) {
      if (error.message === "Authentication token is required") {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Your session has expired. Please log in again.' 
        });
        // Redirect to sign-in if token is missing
        router.push('/sign-in');
      } else {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error.message || 'Failed to commit program' 
        });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token, state.program, router]);

  const handleApprove = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUDIT_SERVICE_URL}/api/audit-programs/${id}/approve`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve audit program');
      }

      const updatedProgram = await response.json();
      dispatch({ type: 'SET_PROGRAM', payload: updatedProgram });
      dispatch({ type: 'SET_SUCCESS', payload: 'Audit program approved successfully' });
      router.push('/dashboard');
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to approve audit program' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleReject = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUDIT_SERVICE_URL}/api/audit-programs/${id}/reject`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject audit program');
      }

      const updatedProgram = await response.json();
      dispatch({ type: 'SET_PROGRAM', payload: updatedProgram });
      dispatch({ type: 'SET_SUCCESS', payload: 'Audit program rejected successfully' });
      router.push('/dashboard');
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Failed to reject audit program' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  // Computed values
  const canCommit = useMemo(() => {
    if (!state.program) return false;
    const validation = validateProgramForSubmission(state.program);
    return validation.isValid;
  }, [state.program]);

  const value: AuditProgramContextType = {
    program: state.program,
    loading: state.loading,
    error: state.error,
    success: state.success,
    fetchProgram,
    updateAudit,
    handleSaveAuditDates,
    handleCommit,
    handleApprove,
    handleReject,
    canCommit,
    clearMessages,
  };

  return (
    <AuditProgramContext.Provider
      value={value}
    >
      {children}
    </AuditProgramContext.Provider>
  );
};

export function useAuditProgram() {
  const context = useContext(AuditProgramContext);
  if (context === undefined) {
    throw new Error('useAuditProgram must be used within an AuditProgramProvider');
  }
  return context;
} 