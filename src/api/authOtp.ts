import axios from "axios";

const API_URL = "http://localhost:5000/api";

export async function verifyOtpApi(email: string, otp: string) {
  const res = await axios.post(`${API_URL}/verifyOTP`, { email, otp });
  if (res.data?.message !== "Account verified successfully") {
    throw new Error(res.data?.message || "OTP verification failed");
  }
}

export async function resendOtpApi(email: string) {
  const res = await axios.post(`${API_URL}/resendOTP`, { email });
  if (res.data?.message !== "OTP resent successfully") {
    throw new Error(res.data?.message || "Failed to resend OTP");
  }
}