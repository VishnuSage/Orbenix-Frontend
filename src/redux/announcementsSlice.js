import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import allApi from "../services/allApi"; // Importing the API functions

// Async thunk to fetch announcements from the API
export const fetchAnnouncements = createAsyncThunk(
  "announcements/fetchAnnouncements",
  async () => {
    const response = await allApi.fetchAnnouncements();
    return response; // Assuming the API returns an array of announcements
  }
);

// Async thunk to add an announcement
export const addAnnouncementAsync = createAsyncThunk(
  "announcements/addAnnouncement",
  async (announcement) => {
    const response = await allApi.addAnnouncement(announcement);
    return response; // Return the added announcement
  }
);

// Async thunk to remove an announcement
export const removeAnnouncementAsync = createAsyncThunk(
  "announcements/removeAnnouncement",
  async (id) => {
    await allApi.removeAnnouncement(id);
    return id; // Return the id of the removed announcement
  }
);

// Async thunk to update an announcement
export const updateAnnouncementAsync = createAsyncThunk(
  "announcements/updateAnnouncement",
  async (announcement) => {
    const response = await allApi.updateAnnouncement(announcement);
    return response; // Return the updated announcement
  }
);

const announcementsSlice = createSlice({
  name: "announcements",
  initialState: {
    announcements: [],
    contactEmail: "",
    status: "idle", // For tracking API request status
    error: null, // For tracking errors
  },
  reducers: {
    setContactEmail: (state, action) => {
      state.contactEmail = action.payload; // Update the contact email
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.announcements = action.payload; // Store the fetched announcements
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message; // Store the error message
      })
      .addCase(addAnnouncementAsync.fulfilled, (state, action) => {
        state.announcements.push(action.payload); // Add the new announcement
      })
      .addCase(removeAnnouncementAsync.fulfilled, (state, action) => {
        state.announcements = state.announcements.filter(
          (announcement) => announcement.id !== action.payload
        ); // Remove the announcement by id
      })
      .addCase(updateAnnouncementAsync.fulfilled, (state, action) => {
        const index = state.announcements.findIndex(
          (announcement) => announcement.id === action.payload.id
        );
        if (index !== -1) {
          state.announcements[index] = action.payload; // Update the announcement
        }
      });
  },
});

// Exporting the actions
export const { setContactEmail } = announcementsSlice.actions;

// Selector to get announcements
export const selectAnnouncements = (state) => state.announcements.announcements;

// Selector to get contact email
export const selectContactEmail = (state) => state.announcements.contactEmail;

// Selector to get announcements status
export const selectAnnouncementsStatus = (state) => state.announcements.status;

// Selector to get announcements error
export const selectAnnouncementsError = (state) => state.announcements.error;

export default announcementsSlice.reducer;
