
"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import { useAuth } from "@/context/auth-context";

export default function SigninWithPassword() {
  const [data, setData] = useState({
    email: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "",
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "",
    remember: false,
  });
  const [otp, setOtp] = useState("");
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [timer, setTimer] = useState(5 * 60); // 5 minutes in seconds
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  // Timer for OTP expiration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtpForm && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpForm, timer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      if (err.message.includes("Email not verified")) {
        setShowOtpForm(true);
        setTimer(5 * 60); // Reset timer
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, otp }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setShowOtpForm(false);
      // Retry login
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setTimer(5 * 60); // Reset timer
      setError('New OTP sent to your email');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <>
      {!showOtpForm ? (
        <form onSubmit={handleSubmit}>
          <InputGroup
            type="email"
            label="Email"
            className="mb-4 [&_input]:py-[15px]"
            placeholder="Enter your email"
            name="email"
            handleChange={handleChange}
            value={data.email}
            icon={<EmailIcon />}
          />
          <InputGroup
            type="password"
            label="Password"
            className="mb-5 [&_input]:py-[15px]"
            placeholder="Enter your password"
            name="password"
            handleChange={handleChange}
            value={data.password}
            icon={<PasswordIcon />}
          />
          <div className="mb-6 flex items-center justify-between gap-2 py-2 font-medium">
            <Checkbox
              label="Remember me"
              name="remember"
              withIcon="check"
              minimal
              radius="md"
              onChange={(e) => setData({ ...data, remember: e.target.checked })}
            />
            <Link
              href="/auth/forgot-password"
              className="hover:text-primary dark:text-white dark:hover:text-primary"
            >
              Forgot Password?
            </Link>
          </div>
          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
          <div className="mb-4.5">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
              disabled={loading}
            >
              Sign In
              {loading && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit}>
          <InputGroup
            type="text"
            label="Verification Code"
            className="mb-4 [&_input]:py-[15px]"
            placeholder="Enter 6-digit OTP"
            name="otp"
            handleChange={(e) => setOtp(e.target.value)}
            value={otp}
          />
          <div className="mb-4 text-sm">
            Time remaining: {formatTime(timer)}
            {timer === 0 && <p className="text-red-500">OTP expired</p>}
          </div>
          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
          <div className="mb-4 flex gap-2">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
              disabled={loading || timer === 0}
            >
              Verify OTP
              {loading && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
              )}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-500 p-4 font-medium text-white transition hover:bg-opacity-90"
              disabled={loading}
            >
              Resend OTP
            </button>
          </div>
        </form>
      )}
    </>
  );
}