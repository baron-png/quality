"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";

export default function SigninWithPassword() {
  const [data, setData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const validateForm = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (data.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      if (data.remember) {
        // Tokens are stored in localStorage by AuthContext
      } else {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        if (accessToken) sessionStorage.setItem("accessToken", accessToken);
        if (refreshToken) sessionStorage.setItem("refreshToken", refreshToken);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    } catch (err) {
      const message =
        err.response?.data?.error?.message || err.message || "An error occurred";
      console.log("Signin error:", { message, email: data.email }); // Debug log
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="form"
      aria-labelledby="signin-form"
    >
      <h2 id="signin-form" className="text-2xl font-bold text-center text-gray-800 dark:text-white">
        Sign In
      </h2>
           <InputGroup
        type="email"
        label="Email"
        className="mb-4"
        placeholder="Enter your email"
        name="email"
        onChange={handleChange} // <-- FIXED
        value={data.email}
        icon={<EmailIcon className="h-5 w-5 text-gray-400" />}
        required
        aria-required="true"
      />
      <InputGroup
        type="password"
        label="Password"
        className="mb-5"
        placeholder="Enter your password"
        name="password"
        onChange={handleChange} // <-- FIXED
        value={data.password}
        icon={<PasswordIcon className="h-5 w-5 text-gray-400" />}
        required
        aria-required="true"
      />
      <div className="flex items-center justify-between gap-4 py-2">
        <Checkbox
          label="Remember me"
          name="remember"
          withIcon="check"
          minimal
          radius="md"
          onChange={(e) => setData({ ...data, remember: e.target.checked })}
          aria-label="Remember me"
        />
        <Link
          href="/auth/forgot-password"
          className="text-sm text-primary hover:underline dark:text-white dark:hover:text-primary"
        >
          Forgot Password?
        </Link>
      </div>
      {error && (
        <motion.div
          className="text-red-500 text-sm bg-red-50 p-3 rounded-md"
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
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
        aria-disabled={loading}
      >
        Sign In
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
        )}
      </button>
    </motion.form>
  );
}