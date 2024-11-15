import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import allApi from "../services/allApi"; // Adjust the path to your allApi file
import { nanoid } from "nanoid";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      const { text, type = "info" } = action.payload;
      const notification = {
        id: nanoid(),
        text,
        type,
        read: false,
        timestamp: new Date().toISOString(),
      };
      state.notifications.push(notification);
    },
    clearNotifications: (state) => {
      state.notifications.length = 0; // Clear the notifications array
    },
    removeNotification: (state, action) => {
      console.log("Removing notification ID:", action.payload);
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      ); // This is safe
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        (notification) => notification.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },
    clearReadNotifications: (state) => {
      state.notifications = state.notifications.filter(
        (notification) => !notification.read
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        console.log("Fetched notifications:", action.payload);
        if (Array.isArray(action.payload)) {
          // Instead of directly assigning, use the spread operator to create a new array
          state.notifications = [...action.payload]; // Safe way to assign
        } else {
          console.error(
            "Expected an array of notifications but received:",
            action.payload
          );
          state.notifications = []; // Optionally reset to an empty array or handle the error
        }
        state.error = null; // Reset error on successful fetch
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        console.log("Created notification:", action.payload);
        if (action.payload) {
          state.notifications.push(action.payload); // This is safe
        } else {
          console.error(
            "Expected a notification object but received:",
            action.payload
          );
        }
        state.error = null; // Reset error on successful creation
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        console.log("Deleted notification ID:", action.payload);
        state.notifications = state.notifications.filter(
          (notification) => notification.id !== action.payload
        ); // This is safe
        state.error = null; // Reset error on successful deletion
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

// Create async thunks for API requests
export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async () => {
    return await allApi.fetchNotifications(); // Use the API function
  }
);

export const createNotification = createAsyncThunk(
  "notifications/create",
  async (notification) => {
    return await allApi.createNotification(notification); // Use the API function
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id) => {
    await allApi.deleteNotification(id); // Use the API function
    return id;
  }
);

// Export actions
export const {
  addNotification,
  clearNotifications,
  removeNotification,
  markAsRead,
  clearReadNotifications,
} = notificationsSlice.actions;

// Selectors
export const selectAllNotifications = (state) =>
  state.notifications.notifications;
export const selectUnreadNotifications = (state) =>
  state.notifications.notifications.filter(
    (notification) => !notification.read
  );
export const selectNotificationsError = (state) => state.notifications.error;

export default notificationsSlice.reducer;
