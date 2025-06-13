"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import OtpVerificationModal from "@/components/Auth/OtpVerificationModal";
import { verifyOtpApi, resendOtpApi } from "@/api/authOtp";
import { Box } from "lucide-react";
import { CircularProgress } from "@mui/material";

const AuthContext = createContext();

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor: attach access token from cookie
api.interceptors.request.use((config) => {
  const accessToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('accessToken='))
    ?.split('=')[1];

  if (accessToken) {
    document.cookie = `accessToken=${accessToken}; path=/; SameSite=Strict`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle token refresh and logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await api.post('/refresh-token', {}, { withCredentials: true });
        const { accessToken } = response.data;
        document.cookie = `accessToken=${accessToken}; path=/; SameSite=Strict`;
        return api(originalRequest);
      } catch (refreshError) {
        // Manual logout: clear cookies and redirect
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        if (typeof window !== "undefined") {
          window.location.href = "/auth/sign-in";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

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
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const router = useRouter();

  const checkUserLoggedIn = async () => {
    try {
      const response = await api.get("/me", { withCredentials: true });
      if (response.data) {
        const primaryRole = response.data.roles?.[0]?.name || "default";
        setUser({ ...response.data, primaryRole });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      if (error.response?.status === 401) {
        logout();
      } else {
        toast.error(error.response?.data?.error?.message || "Failed to verify session");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/login", { email, password }, { withCredentials: true });

      if (response.data.requiresVerification) {
        setOtpEmail(email);
        setShowOtpModal(true);
        toast.info("Please verify your email with the OTP sent.");
        return;
      }

      const { accessToken, user: userData } = response.data;
      document.cookie = `accessToken=${accessToken}; path=/; SameSite=Strict`;

      await checkUserLoggedIn();

      if (userData?.roles?.[0]?.name) {
        router.push(getRedirectRoute(userData.roles[0].name));
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.error?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/logout", {}, { withCredentials: true });
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUser(null);
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUser(null);
      router.push("/auth/sign-in");
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
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      checkUserLoggedIn
    }}>
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
