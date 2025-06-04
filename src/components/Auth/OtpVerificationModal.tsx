"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

interface OtpVerificationModalProps {
  email: string;
  onVerified: () => void;
  onClose: () => void;
  verifyOtpApi: (email: string, otp: string) => Promise<void>;
  resendOtpApi: (email: string) => Promise<void>;
}

export default function OtpVerificationModal({
  email,
  onVerified,
  onClose,
  verifyOtpApi,
  resendOtpApi,
}: OtpVerificationModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30); // 30-second cooldown for resend
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => setResendCooldown((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("OTP must be 6 characters");
      return;
    }
    setVerifyLoading(true);
    setError(null);
    try {
      await verifyOtpApi(email, otp);
      toast.success("Email verified successfully!");
      setTimeout(onVerified, 1000); // Delay to show success toast
    } catch (err) {
      let message = "Invalid or expired OTP";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as any).response;
        message = response?.data?.error?.message || message;
      }
      setError(message);
      toast.error(message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError(null);
    try {
      await resendOtpApi(email);
      setResendCooldown(30);
      toast.success("OTP resent successfully!");
    } catch (err) {
      let message = "Failed to resend OTP";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as any).response;
        message = response?.data?.error?.message || message;
      }
      setError(message);
      toast.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-modal-title"
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 id="otp-modal-title" className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
          Verify Your Email
        </h2>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          Enter the OTP sent to <span className="font-semibold">{email}</span>
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.toUpperCase().slice(0, 6))}
            maxLength={6}
            required
            ref={inputRef}
            aria-label="OTP input"
          />
          {error && (
            <motion.div
              className="text-red-500 text-sm bg-red-50 dark:bg-red-900/50 p-2 rounded-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              role="alert"
            >
              {error}
            </motion.div>
          )}
          <button
            type="submit"
            className="w-full bg-primary text-white rounded-lg py-2 font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={verifyLoading}
            aria-disabled={verifyLoading}
          >
            {verifyLoading ? (
              <span className="flex items-center gap-2">
                Verifying <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
              </span>
            ) : (
              "Verify"
            )}
          </button>
        </form>
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Resend in: {resendCooldown}s
          </span>
          <button
            className="text-primary text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0}
            aria-disabled={resendLoading || resendCooldown > 0}
          >
            {resendLoading ? (
              <span className="flex items-center gap-2">
                Resending <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent" />
              </span>
            ) : (
              "Resend OTP"
            )}
          </button>
        </div>
        <button
          className="mt-4 text-gray-500 dark:text-gray-400 text-sm hover:underline"
          onClick={onClose}
          aria-label="Close OTP modal"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}