"use client";
import OtpVerificationModal from "@/components/Auth/OtpVerificationModal";
import { verifyOtpApi, resendOtpApi } from "@/api/authOtp";
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
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

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
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
        if (error.response?.status === 401) {
          await refreshToken();
        } else {
          toast.error(error.response?.data?.error?.message || "Failed to fetch user data");
          setUser(null);
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("refreshToken");
          router.push("/auth/sign-in");
        }
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  useEffect(() => {
    console.log("showOtpModal changed:", showOtpModal); // Debug log for modal state
  }, [showOtpModal]);

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token available");
      const response = await api.post("/refresh", { refreshToken });
      const newAccessToken = response.data.accessToken;
      if (localStorage.getItem("accessToken")) {
        localStorage.setItem("accessToken", newAccessToken);
      } else {
        sessionStorage.setItem("accessToken", newAccessToken);
      }
      setToken(newAccessToken);
      api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
      const userResponse = await api.get("/me");
      const primaryRole = userResponse.data.roles?.[0]?.name || "default";
      setUser({ ...userResponse.data, primaryRole });
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Session expired. Please log in again.");
      logout();
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/login", { email, password });
      // Check for OTP verification requirement
      if (response.data.requiresVerification) {
        setOtpEmail(email);
        setShowOtpModal(true);
        toast.info("Please verify your email with the OTP sent.");
        return; // Stop further processing
      }
      // Normal login flow
      const primaryRole = response.data.user.roles?.[0]?.name || "default";
      setUser({ ...response.data.user, primaryRole });
      setToken(response.data.accessToken);
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      router.push(getRedirectRoute(primaryRole));
    } catch (error) {
      const message =
        error.response?.data?.error?.message ||
        (typeof error.message === "string" ? error.message : "Login failed");
      if (message.includes("Email not verified")) {
        setOtpEmail(email);
        setShowOtpModal(true);
        toast.info("Please verify your email with the OTP sent.");
      } else {
        toast.error(message);
      }
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    setLoading(true);
    try {
      const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");
      await api.post("/logout", { refreshToken });
      setUser(null);
      setToken(null);
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("refreshToken");
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

  console.log("Rendering AuthProvider, showOtpModal:", showOtpModal); // Debug log

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout }}>
      {children}
      {showOtpModal && (
        <>
          {console.log("Rendering OtpVerificationModal for email:", otpEmail)} {/* Debug log */}
          <OtpVerificationModal
            email={otpEmail}
            onVerified={handleOtpVerified}
            onClose={handleOtpClose}
            verifyOtpApi={verifyOtpApi}
            resendOtpApi={resendOtpApi}
          />
        </>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);