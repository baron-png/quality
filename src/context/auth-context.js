"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import OtpVerificationModal from "@/components/Auth/OtpVerificationModal";
import { verifyOtpApi, resendOtpApi } from "@/api/authOtp";
import { CircularProgress } from "@mui/material";

const AuthContext = createContext();

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await api.post("/refresh-token", {}, { withCredentials: true });
        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        // Prevent redirect if already on /sign-in
        if (window.location.pathname !== "/sign-in") {
          window.location.href = "/sign-in";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const roleRoutes = {
  SUPER_ADMIN: "/admin",
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
        const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        setUser({ ...response.data, primaryRole, accessToken });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      toast.error(error.response?.data?.error?.message || "Failed to verify session");
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Skip auth check on auth-related pages
    const authPages = ["/sign-in", "/login", "/signup"];
    if (!authPages.includes(window.location.pathname)) {
      checkUserLoggedIn();
    } else {
      setLoading(false);
    }
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
      const primaryRole = userData.roles?.[0]?.name || "default";
      localStorage.setItem("accessToken", accessToken);
      setUser({ ...userData, accessToken, primaryRole });
      router.push(getRedirectRoute(primaryRole));
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
      setUser(null);
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      setUser(null);
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      router.push("/sign-in");
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
    <AuthContext.Provider value={{ user, loading, login, logout, checkUserLoggedIn, setUser, token: user?.accessToken }}>
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};