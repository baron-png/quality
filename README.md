"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import OtpVerificationModal from "@/components/Auth/OtpVerificationModal";
import { verifyOtpApi, resendOtpApi } from "@/api/authOtp";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Enable cookies for server-side refresh
});

const AuthContext = createContext();

const roleRoutes = {
  SUPER_ADMIN: "/",
  STAFF: "/lecturer/dashboard",
  ADMIN: "/admin",
  SYSTEM_ADMIN: "/admin",
  TRAINER: "/lecturer/dashboard",
  TRAINEE: "/student/dashboard",
  AUDITOR: "/auditor-staff/dashboard",
  MR: "/mr/dashboard",
  default: "/dashboard",
};

const getRedirectRoute = (role) => roleRoutes[role] || roleRoutes.default;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const router = useRouter();

  // Intercept axios requests to handle token refresh
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          await refreshToken();
          api.defaults.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, [token]);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;
        const response = await api.get("/me");
        const primaryRole = response.data.roles?.[0]?.name || "default";
        setUser({ ...response.data, primaryRole });
        setToken(accessToken);
      } catch (error) {
        toast.error(error.response?.data?.error?.message || "Failed to fetch user data");
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  const refreshToken = async () => {
    try {
      // Simulate server-side refresh with cookie; replace with API call
      const response = await api.post("/refresh", {}, { withCredentials: true });
      const newAccessToken = response.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);
      setToken(newAccessToken);
      api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
      const userResponse = await api.get("/me");
      const primaryRole = userResponse.data.roles?.[0]?.name || "default";
      setUser({ ...userResponse.data, primaryRole });
    } catch (error) {
      toast.error("Session expired. Please log in again.");
      logout();
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/login", { email, password });
      if (response.data.requiresVerification) {
        setOtpEmail(email);
        setShowOtpModal(true);
        toast.info("Please verify your email with the OTP sent.");
        return;
      }
      const { accessToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      setToken(accessToken);
      api.defaults.headers.Authorization = `Bearer ${accessToken}`;
      const meRes = await api.get("/me");
      const primaryRole = meRes.data.roles?.[0]?.name || "default";
      setUser({ ...meRes.data, primaryRole });
      router.push(getRedirectRoute(primaryRole));
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/logout", {}, { withCredentials: true });
      setUser(null);
      setToken(null);
      localStorage.removeItem("accessToken");
      router.push("/auth/sign-in");
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = () => {
    setShowOtpModal(false);
    setOtpEmail("");
    toast.success("Email verified! Please log in.");
  };

  const handleOtpClose = () => {
    setShowOtpModal(false);
    setOtpEmail("");
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout }}>
      {children}
      {showOtpModal && (
        <OtpVerificationModal
          email={otpEmail}
          onVerified={handleOtpVerified}
          onClose={handleOtpClose}
          verifyOtpApi={verifyOtpApi}
          resendOtpApi={resendOtpApi}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);










export async function fetchAuditPrograms(token: string, role: string) {
  try {
    const response = await fetch(`http://localhost:5004/api/audit-programs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      let errorMsg = "Failed to fetch audit programs";
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch {
        // ignore JSON parse error
      }
      throw new Error(errorMsg);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    // Optionally log error here
    return []; // Return empty array to avoid breaking the UI
  }
}
export async function createAuditForProgram(
  programId: string,
  audit: {
    scope: string[];
    specificAuditObjectives: string[]; // <-- PLURAL
    methods: string[];
    criteria: string[];
    auditNumber: string;
  },
  token: string
) {
  const response = await fetch(`http://localhost:5004/api/audits/${programId}/audits`,  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(audit),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create audit");
  }
  return response.json();
}

export async function getAuditProgramById(id: string, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch audit program");
  }
  return response.json();
}

export async function saveAuditDates(auditId: string, dates: { auditDates?: { startDate: string; endDate: string }; followUpDates?: { startDate: string; endDate: string }; managementReviewDates?: { startDate: string; endDate: string } }, token: string) {
  const response = await fetch(`http://localhost:5004/api/audits/${auditId}/dates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dates),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save audit dates");
  }
  return response.json();
}

export async function saveTeamAppointments(auditId: string, appointments: { teamLeader?: { appointmentDate: string }; teamMembers?: { appointmentDate: string } }, token: string) {
  const response = await fetch(`http://localhost:5004/api/audits/${auditId}/team-appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(appointments),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save team appointments");
  }
  return response.json();
}

export async function submitAuditProgram(programId: string, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${programId}/submit`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit audit program");
  }
  return response.json();
}
export async function updateAuditProgram(id: string, updatedProgram: any, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: updatedProgram.name,
      auditProgramObjective: updatedProgram.auditProgramObjective,
      startDate: updatedProgram.startDate,
      endDate: updatedProgram.endDate,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update audit program");
  }
  return response.json();
}

export async function submitForApprovalAuditProgram(id: string, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}/submit`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit audit program");
  }
  return response.json();
}

export async function approveAuditProgram(id: string, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}/approve`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to approve audit program");
  }
  return response.json();
}

export async function rejectAuditProgram(id: string, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}/reject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to reject audit program");
  }
  return response.json();
}

export async function archiveAuditProgram(id: string, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}/archive`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to archive audit program");
  }
  return response.json();
}

export async function createAuditProgram(newProgram: any, token: string) {
  const programRes = await fetch("http://localhost:5004/api/audit-programs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: newProgram.name,
      auditProgramObjective: newProgram.auditProgramObjective,
      status: "Draft",
      startDate: newProgram.startDate,
      endDate: newProgram.endDate,
      tenantId: newProgram.tenantId,
      tenantName: newProgram.tenantName,
      createdBy: newProgram.createdBy,
    }),
  });
  if (!programRes.ok) throw new Error("Failed to create audit program");
  return await programRes.json();
}

export async function createAuditProgramWithAudits(newProgram: any, token: string) {
  const programRes = await fetch("http://localhost:5004/api/audit-programs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: newProgram.name,
      auditProgramObjective: newProgram.auditProgramObjective,
      status: "Draft",
      startDate: newProgram.startDate,
      endDate: newProgram.endDate,
    }),
  });
  if (!programRes.ok) throw new Error("Failed to create audit program");
  const createdProgram = await programRes.json();

  for (const audit of newProgram.audits) {
    const auditData = {
      scope: audit.scope,
      specificAuditObjective: audit.specificAuditObjectives,
      methods: audit.methods,
      criteria: audit.criteria,
    };
    const auditRes = await fetch(
      `http://localhost:5004/api/audit-programs/${createdProgram.id}/audits`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(auditData),
      }
    );
    if (!auditRes.ok) throw new Error("Failed to create audit");
  }
  return true;
}

export async function getAuditByProgramAndNumber(programId: string, auditNumber: string, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${programId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch audit");
  }
  const program = await response.json();
  const audit = program.audits.find((a: any) => a.auditNumber === auditNumber);
  return audit || null;
}

export async function updateAudit(auditId: string, data: any, token: string) {
  const response = await fetch(`http://localhost:5004/api/audits/${auditId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update audit");
  }
  return response.json();
}