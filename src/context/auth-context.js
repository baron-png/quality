"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.log('No access token found.');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        console.log('Access token found:', accessToken);
        const headers = { Authorization: `Bearer ${accessToken}` };
        const response =        await axios.get(`http://localhost:5000/api/me`, { headers });
        console.log('Response from /me:', response.data);

        const primaryRole =
          response.data.roles?.[0]?.name ||
          response.data.userRoles?.[0]?.role?.name;

        setUser({
          ...response.data,
          primaryRole,
          department: response.data.department,
        });

        setToken(accessToken);
      } catch (error) {
        if (error.response?.status === 401) {
          console.warn('Access token expired or invalid. Logging out...');
          setUser(null);
          setToken(null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.push('/auth/login');
        } else {
          console.error('Error fetching user:', error);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response =       await axios.post(`http://localhost:5000/api/login`, { email, password });

      console.log('Login Response:', response.data);

      const primaryRole = response.data.user.roles?.[0]?.name;

      setUser({
        ...response.data.user,
        primaryRole,
        department: response.data.user.department,
      });

      setToken(response.data.accessToken);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      switch (primaryRole) {
        case 'SUPER_ADMIN':
          router.push('/');
          break;
        case 'STAFF':
          router.push('/lecturer/dashboard');
          break;
        case 'ADMIN':
          router.push('/admin');
          break;
        case 'TRAINER':
          router.push('/lecturer/dashboard');
          break;
        case 'TRAINEE':
          router.push('/student/dashboard');
          break;
        case 'AUDITOR':
          router.push('/auditor-staff/dashboard');
          break;
        case 'MR':
          router.push('/auditor/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      if (error.response?.data?.message === 'Email not verified. A new OTP has been sent to your email.') {
        throw new Error('Email not verified. A new OTP has been sent to your email.');
      }
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await axios.post(`http://localhost:5000/api/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(null);
      setToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/auth/sign-in');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);