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

// Create axios instance with proper configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Enable sending cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to include access token in cookies
api.interceptors.request.use((config) => {
  // Get access token from cookie
  const accessToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('accessToken='))
    ?.split('=')[1];

  if (accessToken) {
    // Set the access token in the cookie for the request
    document.cookie = `accessToken=${accessToken}; path=/; SameSite=Strict`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const response = await api.post('/refresh-token', {}, { withCredentials: true });
        const { accessToken } = response.data;

        // Set the new access token in a cookie
        document.cookie = `accessToken=${accessToken}; path=/; SameSite=Strict`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout
        const authContext = useContext(AuthContext);
        if (authContext?.logout) {
          authContext.logout();
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
      const response = await api.get("/me", {
        withCredentials: true
      });
      
      if (response.data) {
        const primaryRole = response.data.roles?.[0]?.name || "default";
        setUser({ ...response.data, primaryRole });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      if (error.response?.status === 401) {
        // Only logout if it's a true authentication error
        logout();
      } else {
        // For other errors, just show the error but don't logout
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
      const response = await api.post("/login", 
        { email, password },
        { withCredentials: true }
      );

      if (response.data.requiresVerification) {
        setOtpEmail(email);
        setShowOtpModal(true);
        toast.info("Please verify your email with the OTP sent.");
        return;
      }

      // Store the access token in a cookie
      const { accessToken, user: userData } = response.data;
      document.cookie = `accessToken=${accessToken}; path=/; SameSite=Strict`;

      // After successful login, verify the session
      await checkUserLoggedIn();
      
      // Redirect based on role
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
      // Clear both access and refresh tokens
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUser(null);
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, clear the user state and cookies
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
