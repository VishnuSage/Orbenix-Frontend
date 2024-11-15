import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import moment from "moment";
import allApi from "../services/allApi"; // Import the allApi module
import { logAttendance } from "./attendanceLeaveSlice"; // Import logAttendance from attendanceLeaveSlice

const initialState = {
  isClockedIn: false,
  startTime: null,
  elapsedTime: 0,
  events: [],
  snackbarOpen: false,
  snackbarMessage: "",
  isLoading: false, // Added loading state
  error: null, // Added error state
};

// Async thunk to fetch events from the API
export const fetchEvents = createAsyncThunk(
  "timeTracking/fetchEvents",
  async () => {
    const response = await allApi.fetchEventsApi();
    if (Array.isArray(response)) {
      return response;
    } else {
      console.error("Fetched events is not an array:", response);
      throw new Error("Fetched events is not an array"); // Throw an error if not an array
    }
  }
);

// Thunk to handle clocking in
export const clockInThunk = createAsyncThunk(
  "timeTracking/clockIn",
  async ({ empId, dispatch, getState }, { rejectWithValue }) => {
    const state = getState();
    const today = moment().format("YYYY-MM-DD");
    const hasClockedInToday = state.timeTracking.events.some((event) =>
      moment(event.start).isSame(today, "day")
    );

    if (!hasClockedInToday) {
      try {
        // Dispatch logAttendance from attendanceLeaveSlice
        await dispatch(
          logAttendance({
            empId,
            status: "present",
            date: today,
          })
        );
      } catch (error) {
        console.error("Failed to log attendance:", error);
        return rejectWithValue("Failed to log attendance.");
      }
    }

    return today; // Return today's date for further use
  }
);

// Thunk to handle clocking out
export const clockOutThunk = createAsyncThunk(
  "timeTracking/clockOut",
  async ({ empId, dispatch }, { getState }) => {
    const state = getState();
    const endTime = Date.now();
    const elapsedSeconds = Math.floor(
      (endTime - state.timeTracking.startTime) / 1000
    );

    // Log attendance as absent
    await dispatch(logAttendance({ empId, status: "absent" }));

    return elapsedSeconds; // Return elapsed seconds for further use
  }
);

const timeTrackingSlice = createSlice({
  name: "timeTracking",
  initialState,
  reducers: {
    clockOut: (state) => {
      state.isClockedIn = false;
      state.elapsedTime += Date.now() - state.startTime; // Update elapsed time
      state.startTime = null; // Reset start time
    },
    resetTimer: (state) => {
      state.elapsedTime = 0; // Reset elapsed time
    },
    setSnackbarOpen: (state, action) => {
      state.snackbarOpen = action.payload;
    },
    setSnackbarMessage: (state, action) => {
      state.snackbarMessage = action.payload;
    },
    clearSnackbar: (state) => {
      state.snackbarOpen = false; // Close the snackbar
      state.snackbarMessage = ""; // Clear the message
    },
    updateElapsedTime: (state) => {
      if (state.isClockedIn) {
        state.elapsedTime += 1; // Increment elapsed time by 1 second
      }
    },
    addEvent: (state, action) => {
      // Add new event to the events array
      state.events.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true; // Set loading state to true
        state.error = null; // Clear any previous errors
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false; // Set loading state to false
        state.events = action.payload; // Update events with fetched data
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false; // Set loading state to false
        state.snackbarOpen = true;
        state.snackbarMessage = "Failed to fetch events.";
        state.error = action.error.message; // Capture error message
      })
      .addCase(clockInThunk.fulfilled, (state) => {
        state.isClockedIn = true;
        state.startTime = Date.now(); // Set start time when clocking in
      })
      .addCase(clockInThunk.rejected, (state) => {
        state.snackbarOpen = true;
        state.snackbarMessage = "Failed to clock in.";
      })
      .addCase(clockOutThunk.fulfilled, (state, action) => {
        state.isClockedIn = false;
        state.elapsedTime += action.payload; // Update elapsed time with the returned value
        state.startTime = null; // Reset start time
      })
      .addCase(clockOutThunk.rejected, (state) => {
        state.snackbarOpen = true;
        state.snackbarMessage = "Failed to clock out.";
      });
  },
});

// Export actions
export const {
  clockOut,
  resetTimer,
  setSnackbarOpen,
  setSnackbarMessage,
  clearSnackbar,
  updateElapsedTime,
  addEvent,
} = timeTrackingSlice.actions;

// Selectors
export const selectDailyHours = (state, employees) => {
  const dailyHours = {};
  employees.forEach((employee) => {
    dailyHours[employee.empId] = {
      totalSeconds: state.timeTracking.events
        .filter((event) => event.empId === employee.empId)
        .reduce((total, event) => total + event.duration, 0),
      isActive: state.timeTracking.isClockedIn && state.timeTracking.startTime,
    };
  });
  return dailyHours;
};

export const selectFilteredEmployees = (state, employees, searchQuery) => {
  if (!searchQuery) return employees;
  return employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.empId.toString().includes(searchQuery)
  );
};

// Export the reducer
export default timeTrackingSlice.reducer;
