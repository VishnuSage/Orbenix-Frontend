// src/profileSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import allApi from "../services/allApi"; // Import the API functions

// Initial state for the profile slice
const initialState = {
  empId: null,
  name: null,
  email: null,
  phone: null,
  address: null,
  jobTitle: null,
  department: null,
  manager: null,
  startDate: null,
  emergencyContactName: null,
  emergencyContactRelationship: null,
  emergencyContactPhone: null,
  profileImage: null,
  loading: false,
  error: null,
  success: false,
};

// Async thunk to fetch employee profile by ID
export const fetchEmployeeProfile = createAsyncThunk(
  "profile/fetchEmployeeProfile",
  async (empId, { rejectWithValue }) => {
    try {
      const response = await allApi.fetchEmployeeById(empId); // Use fetchEmployeeById to get profile data
      return response.data; // Return the fetched data (ensure your API response structure is handled correctly)
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);

// Async thunk to update employee profile
export const updateEmployeeProfile = createAsyncThunk(
  "profile/updateEmployeeProfile",
  async (profileData, { getState, rejectWithValue }) => {
    const previousProfile = getState().profile; // Get the current state
    try {
      const response = await allApi.updateEmployeeProfile(profileData);
      return response.data; // Return the updated data
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update profile");
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileImage: (state, action) => {
      state.profileImage = action.payload;
    },
    clearProfile: (state) => {
      // Optional: Clear profile data
      return initialState; // Reset state to initial
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeProfile.fulfilled, (state, action) => {
        state.loading = false;
        return { ...state, ...action.payload }; // Update state with fetched profile data
      })
      .addCase(fetchEmployeeProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateEmployeeProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateEmployeeProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update state with new profile data
        return { ...state, ...action.payload };
      })
      .addCase(updateEmployeeProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

// Export actions and reducer
export const { setProfileImage, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
