import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  sendSignInLinkToEmail,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import allApi from "../services/allApi"; // Import your API functions

// Token management functions
export const setToken = (token) => {
  localStorage.setItem("jwtToken", token); // Store the token in localStorage
};

const removeJwtToken = () => {
  localStorage.removeItem("jwtToken"); // Remove the token from localStorage
};

const getJwtToken = () => {
  return localStorage.getItem("jwtToken"); // Retrieve the token from localStorage
};

// Register User action
export const registerUser = createAsyncThunk(
  "auth/registerUser ",
  async ({ emailOrPhone, password }, { rejectWithValue }) => {
    try {
      const response = await allApi.registerUser({ emailOrPhone, password });
      return response; // Return the response if successful
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed."
      );
    }
  }
);

// Send Verification Code action
export const sendVerificationCodeAsync = createAsyncThunk(
  "auth/sendVerificationCode",
  async ({ confirmationResult }, { rejectWithValue }) => {
    try {
      return { confirmationResult }; // Return confirmation result
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to send verification code."
      );
    }
  }
);

export const verifyOtpAsync = createAsyncThunk(
  "auth/verifyOtp",
  async ({ otp, confirmationResult }, { rejectWithValue }) => {
    try {
      const result = await confirmationResult.confirm(otp);
      return { user: result.user }; // Return user info on successful verification
    } catch (error) {
      return rejectWithValue("Invalid OTP. Please try again.");
    }
  }
);

// Login Employee action
export const loginEmployeeAsync = createAsyncThunk(
  "auth/loginEmployee",
  async ({ emailOrPhone, password }, { rejectWithValue }) => {
    try {
      const response = await allApi.login({ emailOrPhone, password });
      console.log("Login API Response:", response);
      if (!response || !response.token || !response.user) {
        return rejectWithValue("Login failed: No token found in response.");
      }
      return {
        token: response.token,
        empId: response.user.empId,
        roles: response.user.roles || [],
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Network error occurred during login."
      );
    }
  }
);

// Send Password Reset action
export const sendPasswordResetAsync = createAsyncThunk(
  "auth/sendPasswordReset",
  async ({ emailOrPhone, newPassword }, { rejectWithValue }) => {
    try {
      const response = await allApi.resetPassword({
        emailOrPhone,
        newPassword,
      });
      return response; // Return the entire response
    } catch (error) {
      return rejectWithValue(error.message || "Password reset failed");
    }
  }
);

// Update User Password action
export const updateUserPassword = createAsyncThunk(
  "auth/updateUser Password",
  async ({ empId, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await allApi.updatePassword({
        empId,
        currentPassword,
        newPassword,
      });
      return response; // Adjust based on your API response
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
    authData: [],
    authLoading: false,
    authError: null,
    employee: null,
    empId: null,
    roles: [],
    token: getJwtToken(),
    error: null,
    user: null,
    userLoading: false,
    userError: null,
    loading: false,
    passwordResetMessage: null,
    loadingPasswordReset: false,
    isRegistering: false,
    passwordResetError: null,
    passwordResetSuccess: false,
    registrationError: null,
    registrationSuccess: false,
    loadingUpdatePassword: false,
    updatePasswordError: null,
    updatePasswordSuccess: false,
    loadingUpdateProfile: false,
    updateProfileError: null,
    updateProfileSuccess: false,
    isLoggedIn: false,
    selectedRole: null,
    verificationSuccess: false, // New state for verification success
    verificationMessage: null,
    confirmationResult: null,
    forgotPassword: false,
  },
  reducers: {
    logoutEmployee(state) {
      state.employee = null;
      state.empId = null;
      state.roles = [];
      state.error = null;
      state.passwordResetError = null;
      state.passwordResetSuccess = false;
      state.registrationError = null;
      state.registrationSuccess = false;
      state.updatePasswordError = null;
      state.updatePasswordSuccess = false;
      state.updateProfileError = null;
      state.updateProfileSuccess = false;
      state.isLoggedIn = false;
      state.selectedRole = null;
      removeJwtToken();
    },
    setForgotPassword(state, action) {
      state.isForgotPassword = action.payload; // Set isForgotPassword state
    },
    clearPasswordResetState(state) {
      state.passwordResetError = null;
      state.passwordResetSuccess = false;
      state.forgotPassword = false;
      state.authData = [];
    },
    clearRegistrationState(state) {
      state.registrationError = null;
      state.registrationSuccess = false;
      state.isRegistering = false; // Reset the registering state
      state.authData = []; // Clear any previous auth data
    },
    clearUpdatePasswordState(state) {
      state.updatePasswordError = null;
      state.updatePasswordSuccess = false;
    },
    clearUpdateProfileState(state) {
      state.updateProfileError = null;
      state.updateProfileSuccess = false;
    },
    setError(state, action) {
      state.error = action.payload; // Set error message
    },
    toggleForgotPassword(state) {
      state.forgotPassword = !state.forgotPassword;
    },
    toggleRegistering(state) {
      state.isRegistering = !state.isRegistering; // Toggle registration state
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoggedIn(state, action) {
      state.isLoggedIn = action.payload; // Set logged in state
    },
    setToken(state, action) {
      state.token = action.payload; // Store the JWT token
      setToken(action.payload); // Store token in localStorage
    },
    setSelectedRole(state, action) {
      state.selectedRole = action.payload;
    },

    setRoles(state, action) {
      console.log("Setting roles in Redux:", action.payload); // Log the roles being set
      state.roles = action.payload; // Set the roles in the state
    },
    setEmpId(state, action) {
      state.empId = action.payload; // Set empId in the state
    },
    setAuthData(state, action) {
      state.authData = action.payload;
    },
    setConfirmationResult(state, action) {
      state.confirmationResult = action.payload; // Store confirmation result
    },
    clearVerificationState(state) {
      state.verificationSuccess = false;
      state.verificationMessage = null;
      state.confirmationResult = null; // Reset confirmation result
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.registrationError = null;
        state.registrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationSuccess = true;
        state.authData = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.registrationError = action.payload;
      })
      .addCase(sendVerificationCodeAsync.pending, (state) => {
        state.loading = true; // Set loading state
        state.error = null; // Clear previous errors
      })
      .addCase(sendVerificationCodeAsync.fulfilled, (state, action) => {
        state.loading = false; // Reset loading state
        state.confirmationResult = action.payload.confirmationResult; // Store confirmation result
      })
      .addCase(sendVerificationCodeAsync.rejected, (state, action) => {
        state.loading = false; // Reset loading state
        state.error = action.payload; // Set error message
      })
      .addCase(verifyOtpAsync.pending, (state) => {
        state.loading = true; // Set loading state
        state.error = null; // Clear previous errors
      })
      .addCase(verifyOtpAsync.fulfilled, (state, action) => {
        state.loading = false; // Reset loading state
        state.verificationSuccess = true; // Indicate successful verification
      })
      .addCase(verifyOtpAsync.rejected, (state, action) => {
        state.loading = false; // Reset loading state
        state.error = action.payload; // Set error message
      })
      .addCase(loginEmployeeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginEmployeeAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.empId = action.payload.empId; // Set empId from the payload
          console.log("empId set in state:", state.empId);
          state.roles = action.payload.roles; // Set roles from the payload
          state.isLoggedIn = true; // Set logged in state to true
          state.token = action.payload.token; // Store JWT token
          state.selectedRole = null; // Reset selected role
        }
      })
      .addCase(loginEmployeeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Login error:", action.payload);
      })
      .addCase(sendPasswordResetAsync.pending, (state) => {
        state.loadingPasswordReset = true;
        state.passwordResetError = null;
        state.passwordResetSuccess = false;
      })
      .addCase(sendPasswordResetAsync.fulfilled, (state, action) => {
        state.loadingPasswordReset = false;
        state.passwordResetSuccess = true;
        state.authData = action.payload;
      })
      .addCase(sendPasswordResetAsync.rejected, (state, action) => {
        state.loadingPasswordReset = false;
        state.passwordResetError = action.payload;
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
  clearPasswordResetState,
  clearRegistrationState,
  clearUpdatePasswordState,
  clearUpdateProfileState,
  setError,
  clearError,
  toggleRegistering,
  setLoggedIn,
  setSelectedRole,
  clearVerificationState,
  toggleForgotPassword,
  setForgotPassword,
  setRoles,
  setEmpId,
} = authSlice.actions;

export const selectAuthState = (state) => state.auth;

export default authSlice.reducer;
