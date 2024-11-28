import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import allApi from "../services/allApi"; // Import the API functions

// Initial state for the profile slice
const initialState = {
  empId: null,
  name: null,
  email: null,
  phone: null,
  address: null,
  position: null,
  department: null,
  manager: null,
  startDate: null,
  emergencyContactName: null,
  emergencyContactRelationship: null,
  emergencyContactPhone: null,
  profileImage: null,
  profileData: {},
  roles: [],
  loading: false,
  error: null,
  success: false,
};

// Async thunk to fetch employee profile by ID
export const fetchEmployeeProfile = createAsyncThunk(
  "profile/fetchEmployeeProfile",
  async (empId, { rejectWithValue }) => {
    try {
      const response = await allApi.fetchEmployeeProfile(empId); // Use the new API function
      return response; // Return the fetched data
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);

// Async thunk to upload employee profile image
export const uploadEmployeeImage = createAsyncThunk(
  "profile/uploadEmployeeImage",
  async ({ empId, formData }, { rejectWithValue }) => {
    try {
      const response = await allApi.uploadProfileImage(empId, formData); // Call the upload API with FormData
      return response.url; // Assuming the response contains the uploaded image URL
    } catch (error) {
      return rejectWithValue(error.message || "Failed to upload image");
    }
  }
);

// Async thunk to update employee profile
export const updateEmployeeProfile = createAsyncThunk(
  "profile/updateEmployeeProfile",
  async ({ profileData, empId }, { rejectWithValue }) => {
    try {
      const response = await allApi.updateEmployeeProfile(empId, profileData); // Update profile without image
      return response; // Return the updated profile data
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update profile");
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state = initialState; // Clear the profile data
    },
    setProfileImage: (state, action) => {
      state.profileImage = action.payload; // Set the profile image
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeProfile.pending, (state) => {
        state.loading = true; // Set loading state
        state.error = null; // Clear any previous errors
      })
      .addCase(fetchEmployeeProfile.fulfilled, (state, action) => {
        state.loading = false; // Set loading to false
        state.success = true; // Indicate success
        // Instead of returning a new object, directly modify the state
        Object.assign(state, action.payload); // Merge action.payload into state
      })
      .addCase(fetchEmployeeProfile.rejected, (state, action) => {
        state.loading = false; // Set loading to false
        state.error = action.payload; // Store the error message
      })
      .addCase(uploadEmployeeImage.pending, (state) => {
        state.loading = true; // Set loading state
        state.error = null; // Clear any previous errors
      })
      .addCase(uploadEmployeeImage.fulfilled, (state, action) => {
        state.loading = false; // Set loading to false
        state.profileImage = action.payload; // Update the profile image URL
      })
      .addCase(uploadEmployeeImage.rejected, (state, action) => {
        state.loading = false; // Set loading to false
        state.error = action.payload; // Store the error message
      })
      .addCase(updateEmployeeProfile.pending, (state) => {
        state.loading = true; // Set loading state
        state.error = null; // Clear any previous errors
      })
      .addCase(updateEmployeeProfile.fulfilled, (state, action) => {
        state.loading = false; // Set loading to false
        state.success = true; // Indicate success
        Object.assign(state, action.payload); // Merge action.payload into state
      })
      .addCase(updateEmployeeProfile.rejected, (state, action) => {
        state.loading = false; // Set loading to false
        state.error = action.payload; // Store the error message
      });
  },
});

// Export actions and reducer
export const { actions, reducer } = profileSlice;

export const { clearProfile, setProfileImage } = actions;
export default reducer;
