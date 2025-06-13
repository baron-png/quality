import { AuditProgramState, AuditProgramAction } from '@/types/audit';

export const initialState: AuditProgramState = {
  program: null,
  loading: false,
  error: null,
  success: null,
};

export function auditProgramReducer(
  state: AuditProgramState,
  action: AuditProgramAction
): AuditProgramState {
  switch (action.type) {
    case 'SET_PROGRAM':
      return {
        ...state,
        program: action.payload,
        error: null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        // Clear error when starting to load
        ...(action.payload ? { error: null } : {}),
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        success: null,
      };

    case 'SET_SUCCESS':
      return {
        ...state,
        success: action.payload,
        error: null,
      };

    case 'UPDATE_AUDIT':
      if (!state.program) return state;
      
      const { index, data } = action.payload;
      const updatedAudits = [...state.program.audits];
      updatedAudits[index] = { ...updatedAudits[index], ...data };
      
      return {
        ...state,
        program: {
          ...state.program,
          audits: updatedAudits,
        },
      };

    case 'CLEAR_MESSAGES':
      return {
        ...state,
        error: null,
        success: null,
      };

    default:
      return state;
  }
} 