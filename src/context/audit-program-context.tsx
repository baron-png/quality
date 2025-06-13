"use client";

import React, { createContext, useContext, useReducer, useCallback } from 'react';
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
  sortAuditsByNumber 
} from '@/utils/auditUtils';

interface AuditProgramContextType {
  // State
  program: AuditProgram | null;
  loading: boolean;
  error: string | null;
  success: string | null;

  // Actions
  fetchProgram: (id: string) => Promise<void>;
  updateAudit: (index: number, data: Partial<Audit>) => void;
  handleSaveAuditDates: (auditId: string, dates: Partial<Audit>) => Promise<void>;
  handleCommit: (programId: string) => Promise<void>;
  clearMessages: () => void;

  // Computed
  canCommit: boolean;
  validateAudit: (audit: Audit) => AuditValidationResult;
  hasAuditData: (audit: Audit) => boolean;
}

const AuditProgramContext = createContext<AuditProgramContextType | undefined>(undefined);

export const AuditProgramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(auditProgramReducer, initialState);
  const { token } = useAuth();

    const fetchProgram = useCallback(async (programId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const rawProgram = await getAuditProgramById(programId);
      // Optionally transform the program here if needed
      // const program = transformAuditFromBackend(rawProgram);
      dispatch({ type: 'SET_PROGRAM', payload: rawProgram }); // or payload: program
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to fetch program' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

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

      // Update local state first
      updateAudit(auditIndex, dates);

      // Create the payload for the API
      const audit = { ...state.program.audits[auditIndex], ...dates };
      const payload = createSaveDatesPayload(audit);

      // Save to backend
      await saveAuditDates(auditId, payload);
      
      // Refresh the program to get the latest data
      await fetchProgram(state.program.id);
      
      dispatch({ type: 'SET_SUCCESS', payload: 'Audit dates saved successfully' });
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Failed to save audit dates' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token, state.program, updateAudit, fetchProgram]);

  const handleCommit = useCallback(async (programId: string) => {
    if (!token) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await submitAuditProgram(programId);
      dispatch({ type: 'SET_SUCCESS', payload: 'Program committed successfully' });
      await fetchProgram(programId);
    } catch (error: any) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Failed to commit program' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token, fetchProgram]);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  // Computed values
  const canCommit = state.program?.status === 'Draft' && 
    state.program?.audits.length > 0 && 
    state.program?.audits.some(audit => {
      const validation = validateAudit(audit);
      if (validation.isValid) {
        console.log(`Audit ${audit.auditNumber} is valid`);
      } else {
        console.log(`Audit ${audit.auditNumber} validation failed:`, validation.errors);
      }
      return validation.isValid;
    });

  return (
    <AuditProgramContext.Provider
      value={{
        // State
        program: state.program,
        loading: state.loading,
        error: state.error,
        success: state.success,

        // Actions
        fetchProgram,
        updateAudit,
        handleSaveAuditDates,
        handleCommit,
        clearMessages,

        // Computed
        canCommit,
        validateAudit,
        hasAuditData,
      }}
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