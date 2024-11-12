import { createSlice } from '@reduxjs/toolkit';

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState: {
    announcements: [
      {
        id: '1',
        text: 'New company policy update.',
        category: 'Policy Updates',
        date: new Date('2023-12-17T03:24:00'),
        link: '/announcements/1',
      },
      {
        id: '2',
        text: 'Holiday schedule for the upcoming year.',
        category: 'Important Dates',
        date: new Date('2023-12-10T12:00:00'),
        link: '/announcements/2',
      },
      // ... more announcements
    ],
    contactEmail: '', // New state to store the email address
  },
  reducers: {
    addAnnouncement: (state, action) => {
      state.announcements.push(action.payload);
    },
    removeAnnouncement: (state, action) => {
      state.announcements = state.announcements.filter(
        (announcement) => announcement.id !== action.payload
      );
    },
    updateAnnouncement: (state, action) => {
      const index = state.announcements.findIndex(
        (announcement) => announcement.id === action.payload.id
      );
      if (index !== -1) {
        state.announcements[index] = action.payload; // Update the announcement
      }
    },
    setContactEmail: (state, action) => {
      state.contactEmail = action.payload; // Update the contact email
    },
  },
});

// Exporting the actions
export const {
  addAnnouncement,
  removeAnnouncement,
  updateAnnouncement,
  setContactEmail, // Export the new action
} = announcementsSlice.actions;

// Selector to get announcements
export const selectAnnouncements = (state) => state.announcements.announcements;

// Selector to get contact email
export const selectContactEmail = (state) => state.announcements.contactEmail;

export default announcementsSlice.reducer;