// authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    employee: null,
    role: null, // Add role to initial state
    otpSent: false, // Track if OTP has been sent
    otpVerified: false, // Track if OTP has been verified
    otp: "", // Store the generated OTP
    error: null, // Store error messages
    loading: false, // Indicate if a request is in progress
    otpResent: false, // Track if OTP has been resent
  },
  reducers: {
    loginEmployee(state, action) {
      state.employee = action.payload.employee; // Store employee data
      state.role = action.payload.role; // Store user role
      state.otpSent = false; // Reset OTP state on login
      state.otpVerified = false; // Reset OTP state on login
      state.error = null; // Clear any previous errors
    },
    logoutEmployee(state) {
      state.employee = null;
      state.role = null; // Reset role on logout
      state.otpSent = false; // Reset OTP state on logout
      state.otpVerified = false; // Reset OTP state on logout
      state.error = null; // Clear any previous errors
    },
    sendOtp(state, action) {
      state.otpSent = true; // Mark OTP as sent
      state.otp = action.payload; // Store the generated OTP
      state.error = null; // Clear any previous errors
    },
    verifyOtp(state, action) {
      state.error = null; // Clear any previous errors
      if (action.payload === state.otp) {
        state.otpVerified = true; // Mark OTP as verified
      } else {
        state.error = "Invalid OTP"; // Set error if OTP is incorrect
      }
    },
    setError(state, action) {
      state.error = action.payload; // Set error message
    },
    setLoading(state, action) {
      state.loading = action.payload; // Set loading state
    },
    resendOtp(state) {
      state.otpResent = true; // Mark OTP as resent
      state.otpSent = false; // Reset OTP sent status
      state.otpVerified = false; // Reset OTP verified status
      state.otp = ""; // Clear the OTP
      state.error = null; // Clear any previous errors
    },
    clearOtpState(state) {
      state.otpSent = false; // Reset OTP sent status
      state.otpVerified = false; // Reset OTP verified status
      state.otp = ""; // Clear the OTP
      state.otpResent = false; // Reset OTP resent status
    },
  },
});

export const {
  loginEmployee,
  logoutEmployee,
  sendOtp,
  verifyOtp,
  setError,
  setLoading,
  resendOtp,
  clearOtpState,
} = authSlice.actions;

export const selectAuthState = (state) => state.auth;

export default authSlice.reducer;