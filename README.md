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