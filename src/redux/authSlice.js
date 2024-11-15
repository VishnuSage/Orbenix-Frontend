import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import allApi from "../services/allApi"; // Import your API functions

// Utility functions to manage JWT
const setJwtToken = (token) => {
  localStorage.setItem("jwtToken", token);
};

const getJwtToken = () => {
  return localStorage.getItem("jwtToken");
};

const removeJwtToken = () => {
  localStorage.removeItem("jwtToken");
};

// Login action with Firebase and role fetching from API
export const loginEmployeeAsync = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { emailOrPhone, password } = credentials;

      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailOrPhone,
        password
      );
      const user = userCredential.user;

      const employeeResponse = await allApi.fetchEmployeeByEmailOrPhone(
        emailOrPhone
      );
      if (!employeeResponse.data || !employeeResponse.data.empId) {
        throw new Error("Employee not found");
      }
      const empId = employeeResponse.data.empId;

      const rolesResponse = await allApi.fetchUserRoles(empId);
      if (!rolesResponse.data || !Array.isArray(rolesResponse.data.roles)) {
        throw new Error("Roles not found");
      }
      const roles = rolesResponse.data.roles;

      // Assuming the JWT is returned in the employee response
      if (employeeResponse.data.jwtToken) {
        setJwtToken(employeeResponse.data.jwtToken); // Store JWT token
      }

      return { employee: user, empId, roles };
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Register User action
export const registerUser = createAsyncThunk(
  "auth/registerUser ",
  async ({ emailOrPhone, password }, { rejectWithValue }) => {
    try {
      const response = await allApi.registerUser({ emailOrPhone, password });
      if (response.data && response.data.jwtToken) {
        setJwtToken(response.data.jwtToken); // Store JWT token
      }
      return response.data; // Adjust based on your API response
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Send Password Reset Email action
export const sendPasswordResetAsync = createAsyncThunk(
  "auth/sendPasswordReset",
  async (email, { rejectWithValue }) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true; // Indicate success
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Send OTP action
export const sendOtpAsync = createAsyncThunk(
  "auth/sendOtp",
  async (email, { rejectWithValue }) => {
    try {
      const actionCodeSettings = {
        url: "https://yourapp.com/finishSignUp?cartId=123 4", // Adjust according to your app
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      return { email }; // Return email to indicate that OTP has been sent
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Verify OTP action
export const verifyOtpAsync = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      if (isSignInWithEmailLink(auth, otp)) {
        const userCredential = await signInWithEmailLink(auth, email, otp);
        const user = userCredential.user;

        const employeeResponse = await allApi.fetchEmployeeByEmailOrPhone(
          email
        );
        const empId = employeeResponse.data.empId;

        const rolesResponse = await allApi.fetchUserRoles(empId);
        const roles = rolesResponse.data.roles;

        // Assuming the JWT is returned in the employee response
        if (employeeResponse.data.jwtToken) {
          setJwtToken(employeeResponse.data.jwtToken); // Store JWT token
        }

        return { employee: user, empId, roles };
      }
      throw new Error("Invalid OTP");
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Update User Password action
export const updateUserPassword = createAsyncThunk(
  "auth/updateUserPassword",
  async ({ empId, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await allApi.updatePassword({
        empId,
        currentPassword,
        newPassword,
      });
      return response.data; // Adjust based on your API response
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

// Update Employee Profile action
export const updateEmployeeProfile = createAsyncThunk(
  "auth/updateEmployeeProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await allApi.updateEmployeeProfile(profileData);
      return response.data; // Adjust based on your API response
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    employee: null,
    empId: null,
    roles: [],
    otpSent: false,
    otpVerified: false,
    error: null,
    loading: false,
    loadingOtpVerification: false,
    loadingPasswordReset: false,
    otpError: null,
    otpTimer: 0,
    isRegistering: false,
    passwordResetError: null,
    passwordResetSuccess: false,
    registrationError: null,
    registrationSuccess: false,
    loadingUpdatePassword: false,
    updatePasswordError: null,
    updatePasswordSuccess: false,
    loadingUpdateProfile: false, // Added for update profile loading state
    updateProfileError: null, // Added for update profile error
    updateProfileSuccess: false, // Added for update profile success
  },
  reducers: {
    logoutEmployee(state) {
      state.employee = null;
      state.empId = null;
      state.roles = [];
      state.otpSent = false;
      state.otpVerified = false;
      state.error = null;
      state.passwordResetError = null;
      state.passwordResetSuccess = false;
      state.registrationError = null;
      state.registrationSuccess = false;
      state.updatePasswordError = null;
      state.updatePasswordSuccess = false;
      state.updateProfileError = null; // Reset update profile error
      state.updateProfileSuccess = false; // Reset update profile success
      removeJwtToken(); // Clear JWT token on logout
    },
    clearOtpState(state) {
      state.otpSent = false;
      state.otpVerified = false;
      state.error = null;
    },
    clearPasswordResetState(state) {
      state.passwordResetError = null;
      state.passwordResetSuccess = false;
    },
    clearRegistrationState(state) {
      state.registrationError = null;
      state.registrationSuccess = false;
    },
    clearUpdatePasswordState(state) {
      state.updatePasswordError = null;
      state.updatePasswordSuccess = false;
    },
    clearUpdateProfileState(state) {
      state.updateProfileError = null; // Clear update profile error
      state.updateProfileSuccess = false; // Clear update profile success
    },
    setOtpTimer(state, action) {
      state.otpTimer = action.payload;
    },
    setError(state, action) {
      state.error = action.payload; // Set error message
    },
    toggleRegistering(state) {
      state.isRegistering = !state.isRegistering; // Toggle registration state
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginEmployeeAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginEmployeeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.employee = action.payload.employee;
        state.empId = action.payload.empId;
        state.roles = action.payload.roles;
        state.error = null;
      })
      .addCase(loginEmployeeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendPasswordResetAsync.pending, (state) => {
        state.loadingPasswordReset = true;
        state.passwordResetError = null;
        state.passwordResetSuccess = false;
      })
      .addCase(sendPasswordResetAsync.fulfilled, (state) => {
        state.loadingPasswordReset = false;
        state.passwordResetSuccess = true;
      })
      .addCase(sendPasswordResetAsync.rejected, (state, action) => {
        state.loadingPasswordReset = false;
        state.passwordResetError = action.payload;
      })
      .addCase(sendOtpAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendOtpAsync.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
        state.error = null;
      })
      .addCase(sendOtpAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtpAsync.pending, (state) => {
        state.loadingOtpVerification = true;
      })
      .addCase(verifyOtpAsync.fulfilled, (state, action) => {
        state.loadingOtpVerification = false;
        state.otpVerified = true;
        state.employee = action.payload.employee;
        state.empId = action.payload.empId;
        state.roles = action.payload.roles;
        state.error = null;
      })
      .addCase(verifyOtpAsync.rejected, (state, action) => {
        state.loadingOtpVerification = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.registrationError = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationSuccess = true;
        if (action.payload) {
          state.employee = action.payload.employee;
          state.empId = action.payload.empId;
          state.roles = action.payload.roles;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registrationError = action.payload;
      })
      .addCase(updateUserPassword.pending, (state) => {
        state.loadingUpdatePassword = true;
        state.updatePasswordError = null;
        state.updatePasswordSuccess = false;
      })
      .addCase(updateUserPassword.fulfilled, (state) => {
        state.loadingUpdatePassword = false;
        state.updatePasswordSuccess = true;
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.loadingUpdatePassword = false;
        state.updatePasswordError = action.payload;
      })
      .addCase(updateEmployeeProfile.pending, (state) => {
        state.loadingUpdateProfile = true; // Set loading state for updating profile
        state.updateProfileError = null; // Clear previous errors
        state.updateProfileSuccess = false; // Reset success state
      })
      .addCase(updateEmployeeProfile.fulfilled, (state, action) => {
        state.loadingUpdateProfile = false; // Reset loading state
        state.updateProfileSuccess = true; // Indicate success
        state.employee = { ...state.employee, ...action.payload }; // Update employee data
      })
      .addCase(updateEmployeeProfile.rejected, (state, action) => {
        state.loadingUpdateProfile = false; // Reset loading state
        state.updateProfileError = action.payload; // Set error message
      });
  },
});

export const {
  logoutEmployee,
  clearOtpState,
  clearPasswordResetState,
  clearRegistrationState,
  clearUpdatePasswordState,
  clearUpdateProfileState,
  setOtpTimer,
  setError,
  toggleRegistering,
} = authSlice.actions;

export const selectAuthState = (state) => state.auth;

export default authSlice.reducer;
