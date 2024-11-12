// notificationsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: [],
  reducers: {
    addNotification: (state, action) => {
      state.push(action.payload);
    },
    clearNotifications: (state) => {
      return [];
    },
  },
});

export const { addNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;