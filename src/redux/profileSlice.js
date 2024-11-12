// src/profileSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  employeeId: "12345",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "9876543210",
  address: "East Lane, Something",
  jobTitle: "Software Engineer",
  department: "Technology",
  manager: "Jane Smith",
  startDate: "2020-08-17",
  emergencyContactName: "Alice Doe",
  emergencyContactRelationship: "Spouse",
  emergencyContactPhone: "1234567890",
  profileImage: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile: (state, action) => {
      return { ...state, ...action.payload };
    },
    setProfileImage: (state, action) => {
      state.profileImage = action.payload;
    },
  },
});

export const { updateProfile, setProfileImage } = profileSlice.actions;
export default profileSlice.reducer;